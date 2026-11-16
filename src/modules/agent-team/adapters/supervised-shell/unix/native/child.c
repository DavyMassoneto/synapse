#include <errno.h>
#include <fcntl.h>
#include <signal.h>
#include <string.h>
#include <unistd.h>
#include "constants.h"
#include "launcher.h"

static void child_failure(int descriptor, int error) {
    unsigned char frame[sizeof(int) + 1];
    frame[0] = 0;
    memcpy(frame + 1, &error, sizeof(error));
    size_t offset = 0;
    while (offset < sizeof(frame)) {
        ssize_t count = write(descriptor, frame + offset, sizeof(frame) - offset);
        if (count > 0) {
            offset += count;
        } else if (count < 0 && errno == EINTR) {
            continue;
        } else {
            break;
        }
    }
    _exit(EXEC_FAILURE_CODE);
}
static void prepare_child_execution(struct reservation_state *state, int joined) {
    if (chdir(state->directory) != 0 || dup2(INPUT_FD, STDIN_FILENO) < 0 || dup2(OUTPUT_FD, STDOUT_FILENO) < 0 || dup2(OUTPUT_FD, STDERR_FILENO) < 0) {
        child_failure(joined, errno);
    }
    close(INPUT_FD);
    close(OUTPUT_FD);
    for (int descriptor = STDIN_FILENO; descriptor <= STDERR_FILENO; descriptor++) {
        int flags = fcntl(descriptor, F_GETFL);
        if (flags < 0 || fcntl(descriptor, F_SETFL, flags & ~O_NONBLOCK) != 0) {
            child_failure(joined, errno);
        }
    }
    signal(SIGPIPE, SIG_DFL);
    signal(SIGCHLD, SIG_DFL);
    sigset_t mask;
    sigemptyset(&mask);
    if (sigprocmask(SIG_SETMASK, &mask, NULL) != 0) {
        child_failure(joined, errno);
    }
}
static void run_child(struct reservation_state *state, int joined, int gate) {
    close(CONTROL_FD);
    close(STATUS_FD);
    close(UNUSED_FD);
    if (setpgid(0, getppid()) != 0 || getpgrp() != getppid() || getsid(0) != state->session_group) {
        child_failure(joined, errno);
    }
    unsigned char ready = JOINED_BYTE;
    if (write(joined, &ready, 1) != 1) {
        _exit(PROTOCOL_FAILURE_CODE);
    }
    unsigned char instruction = 0;
    ssize_t count;
    do {
        count = read(gate, &instruction, 1);
    } while (count < 0 && errno == EINTR);
    close(gate);
    if (count != 1 || instruction != GATE_EXEC_BYTE) {
        _exit(INTERRUPTED_CODE);
    }
    prepare_child_execution(state, joined);
    execvp(state->arguments[0], state->arguments);
    child_failure(joined, errno);
}
int launcher_create_child(struct reservation_state *state) {
    int joined[2];
    int gate[2];
    if (pipe(joined) != 0) {
        return 0;
    }
    if (pipe(gate) != 0) {
        close(joined[0]);
        close(joined[1]);
        return 0;
    }
    if (!launcher_cloexec(joined[0]) || !launcher_cloexec(joined[1]) || !launcher_cloexec(gate[0]) || !launcher_cloexec(gate[1])) {
        close(joined[0]);
        close(joined[1]);
        close(gate[0]);
        close(gate[1]);
        return 0;
    }
    state->child = fork();
    if (state->child == 0) {
        close(joined[0]);
        close(gate[1]);
        run_child(state, joined[1], gate[0]);
    }
    close(joined[1]);
    close(gate[0]);
    close(INPUT_FD);
    close(OUTPUT_FD);
    state->join_read = joined[0];
    state->gate_write = gate[1];
    if (state->child < 0) {
        close(state->join_read);
        close(state->gate_write);
        state->join_read = -1;
        state->gate_write = -1;
        return 0;
    }
    return launcher_nonblocking(state->join_read) && launcher_nonblocking(state->gate_write);
}
static int decode_join_bytes(struct reservation_state *state, const unsigned char *frame, ssize_t count) {
    for (ssize_t i = 0; i < count; i++) {
        if (!state->joined && state->join_length == 0 && frame[i] == JOINED_BYTE) {
            state->joined = 1;
        } else {
            if (state->join_length >= sizeof(state->join)) {
                return 0;
            }
            state->join[state->join_length++] = frame[i];
        }
    }
    if (state->join_length == sizeof(state->join)) {
        if (state->join[0] != 0) {
            return 0;
        }
        memcpy(&state->preparation_error, state->join + 1, sizeof(int));
        if (state->preparation_error <= 0) {
            return 0;
        }
    }
    return 1;
}

int launcher_read_join(struct reservation_state *state) {
    unsigned char frame[sizeof(int) + 1];
    ssize_t count = read(state->join_read, frame, sizeof(frame));
    if (count < 0) {
        return errno == EAGAIN || errno == EINTR;
    }
    if (count == 0) {
        close(state->join_read);
        state->join_read = -1;
        if (state->join_length == sizeof(state->join)) {
            memcpy(&state->preparation_error, state->join + 1, sizeof(int));
        }
        return ((state->joined || state->stopping) && state->join_length == 0) || state->join_length == sizeof(state->join);
    }
    if (!decode_join_bytes(state, frame, count)) {
        return 0;
    }
    if (state->preparation_error > 0) {
        launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
    }
    return 1;
}
