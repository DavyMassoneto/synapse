#include <errno.h>
#include <poll.h>
#include <signal.h>
#include <unistd.h>
#include <sys/wait.h>
#include "constants.h"
#include "launcher.h"

int launcher_reap(struct launcher *state) {
    if (state->reaped) {
        return 1;
    }
    if (state->child <= 0) {
        state->reaped = 1;
        return 1;
    }
    pid_t result = waitpid(state->child, &state->child_status, WNOHANG);
    if (result == state->child) {
        state->reaped = 1;
        return 1;
    }
    return result == 0 || (result < 0 && errno == EINTR);
}
static int publish_result(struct launcher *state) {
    if (state->gate_committed && state->reaped && !state->reported && state->join_read < 0) {
        state->reported = 1;
        if (state->status_broken) {
            return 1;
        }
        if (state->preparation_error) {
            launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            return launcher_error(state, state->preparation_error, state->deadline);
        }
        uint64_t deadline = launcher_now() + STOP_BUDGET_NS;
        if (state->stopping && state->deadline < deadline) {
            deadline = state->deadline;
        }
        return launcher_exit_frame(state, state->child_status, deadline);
    }
    return 1;
}
static int commit_empty(struct launcher *state) {
    state->terminal = 1;
    while (state->control_length > 0 && !state->control_closed) {
        if (launcher_now() >= state->deadline) {
            return 0;
        }
        struct pollfd pending = {CONTROL_FD, POLLIN, 0};
        int ready = poll(&pending, 1, RECHECK_MS);
        if (ready < 0 && errno != EINTR) {
            return 0;
        }
        if (ready > 0 && pending.revents && !launcher_read_control(state)) {
            return 0;
        }
    }
    if (launcher_now() >= state->deadline) {
        return 0;
    }
    if (state->status_broken) {
        return 0;
    }
    if (!state->gate_committed) {
        return launcher_preparation_frame(state, state->preparation_error, state->deadline);
    }
    if (!state->reported) {
        while (state->join_read >= 0) {
            if (launcher_now() >= state->deadline || !launcher_read_join(state)) {
                return 0;
            }
            if (state->join_read >= 0) {
                struct pollfd pending = {state->join_read, POLLIN, 0};
                if (poll(&pending, 1, RECHECK_MS) < 0 && errno != EINTR) {
                    return 0;
                }
            }
        }
        if (!state->reaped) {
            return 0;
        }
        if (state->preparation_error) {
            if (!launcher_error(state, state->preparation_error, state->deadline)) {
                return 0;
            }
        } else if (!launcher_exit_frame(state, state->child_status, state->deadline)) {
            return 0;
        }
        state->reported = 1;
    }
    unsigned char empty = EMPTY_BYTE;
    return launcher_write(state, STATUS_FD, &empty, 1, state->deadline);
}
static int stop_iteration(struct launcher *state) {
    if (launcher_now() >= state->deadline) {
        return 0;
    }
    if (!state->outside) {
        return 1;
    }
    if (!launcher_reap(state)) {
        return 0;
    }
    if (kill(-getpid(), SIGKILL) != 0) {
        if (errno == ESRCH) {
            return commit_empty(state);
        }
        if (errno != EPERM && errno != EINTR) {
            return 0;
        }
    }
    return 1;
}
static int transfer_group(struct launcher *state) {
    if ((state->joined || state->stopping) && !state->outside) {
        if (setpgid(0, state->session_group) != 0 || getpgrp() != state->session_group) {
            return 0;
        }
        state->outside = 1;
        if (!state->stopping) {
            int control = state->control_closed ? -1 : CONTROL_FD;
            struct pollfd pending = {control, POLLIN, 0};
            if (poll(&pending, 1, 0) > 0 && pending.revents) {
                if (!launcher_read_control(state)) {
                    launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
                }
            }
            if (state->stopping) {
                return 1;
            }
            unsigned char ready = CREATED_BYTE;
            if (!launcher_write(state, STATUS_FD, &ready, 1, launcher_now() + STOP_BUDGET_NS)) {
                state->status_broken = 1;
                launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            }
        }
    }
    return 1;
}
static int commit_gate(struct launcher *state) {
    if (state->release_requested && !state->stopping && !state->gate_committed) {
        unsigned char release = GATE_EXEC_BYTE;
        if (!launcher_write(state, state->gate_write, &release, 1, launcher_now() + STOP_BUDGET_NS)) {
            state->preparation_error = EPIPE;
            launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            return 1;
        }
        state->gate_committed = 1;
        close(state->gate_write);
        state->gate_write = -1;
    }
    return 1;
}
int launcher_run(struct launcher *state) {
    while (!state->terminal) {
        int control = state->control_closed ? -1 : CONTROL_FD;
        struct pollfd descriptors[2] = {{control, POLLIN, 0}, {state->join_read, POLLIN, 0}};
        int result = poll(descriptors, 2, RECHECK_MS);
        if (result < 0 && errno != EINTR) {
            return 0;
        }
        if ((descriptors[0].revents & (POLLIN | POLLHUP | POLLERR)) && !launcher_read_control(state)) {
            launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
        }
        if (state->join_read >= 0 && descriptors[1].revents && !launcher_read_join(state)) {
            state->preparation_error = EPROTO;
            launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
        }
        if (!launcher_reap(state) || !transfer_group(state)) {
            return 0;
        }
        if (!publish_result(state)) {
            state->status_broken = 1;
            launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
        }
        struct pollfd pending_control = {control, POLLIN, 0};
        if (poll(&pending_control, 1, 0) > 0 && pending_control.revents) {
            if (!launcher_read_control(state)) {
                launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            }
        }
        if (!commit_gate(state)) {
            return 0;
        }
        if (state->stopping && !stop_iteration(state)) {
            return 0;
        }
    }
    return 1;
}
