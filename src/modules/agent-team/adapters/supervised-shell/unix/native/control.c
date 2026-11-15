#include <errno.h>
#include <unistd.h>
#include "constants.h"
#include "launcher.h"

void launcher_stop(struct launcher *state, uint64_t deadline) {
    if (!state->stopping || deadline < state->deadline) {
        state->deadline = deadline;
    }
    state->stopping = 1;
    if (state->gate_write >= 0) {
        close(state->gate_write);
        state->gate_write = -1;
    }
}
int launcher_read_control(struct launcher *state) {
    unsigned char bytes[CONTROL_FRAME_BYTES];
    ssize_t count = read(CONTROL_FD, bytes, sizeof(bytes));
    if (count < 0) {
        return errno == EINTR || errno == EAGAIN;
    }
    if (count == 0) {
        state->control_closed = 1;
        if (state->control_length > 0) {
            state->preparation_error = EPROTO;
        }
        launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
        return 1;
    }
    for (ssize_t i = 0; i < count; i++) {
        if (state->control_length == 0 && bytes[i] == RELEASE_BYTE) {
            if (!state->stopping && state->outside && state->joined && !state->gate_committed && !state->release_requested) {
                state->release_requested = 1;
            } else {
                state->preparation_error = EPROTO;
                launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            }
        } else {
            if (state->control_length == 0 && bytes[i] != STOP_BYTE) {
                state->preparation_error = EPROTO;
                launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
                return 0;
            }
            if (state->control_length == 0) {
                launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            }
            state->control[state->control_length++] = bytes[i];
            if (state->control_length == CONTROL_FRAME_BYTES) {
                uint64_t deadline = 0;
                for (size_t n = 1; n < CONTROL_FRAME_BYTES; n++) {
                    deadline = (deadline << BYTE_BITS) | state->control[n];
                }
                uint64_t maximum = launcher_now() + STOP_BUDGET_NS;
                if (deadline == 0 || deadline > maximum) {
                    state->preparation_error = EPROTO;
                    deadline = maximum;
                }
                launcher_stop(state, deadline);
                state->control_length = 0;
            }
        }
    }
    return 1;
}
