#include <errno.h>
#include <unistd.h>
#include "constants.h"
#include "launcher.h"

void launcher_stop(struct reservation_state *state, uint64_t deadline) {
    if (!state->stopping || deadline < state->deadline) {
        state->deadline = deadline;
    }
    state->stopping = 1;
    if (state->gate_write >= 0) {
        close(state->gate_write);
        state->gate_write = -1;
    }
}
static struct control_instruction decode_control_byte(struct reservation_state *state, unsigned char byte) {
    struct control_instruction instruction = {CONTROL_PARTIAL, 0};
    if (state->control_length == 0 && byte == RELEASE_BYTE) {
        instruction.kind = CONTROL_RELEASE;
    } else if (state->control_length == 0 && byte != STOP_BYTE) {
        instruction.kind = CONTROL_INVALID;
    } else {
        state->control[state->control_length++] = byte;
        if (state->control_length == CONTROL_FRAME_BYTES) {
            instruction.kind = CONTROL_STOP;
            for (size_t n = 1; n < CONTROL_FRAME_BYTES; n++) {
                instruction.deadline = (instruction.deadline << BYTE_BITS) | state->control[n];
            }
            state->control_length = 0;
        }
    }
    return instruction;
}
static int apply_control_instruction(struct reservation_state *state, struct control_instruction instruction) {
    if (instruction.kind == CONTROL_RELEASE) {
        if (!state->stopping && state->outside && state->joined && !state->gate_committed && !state->release_requested) {
            state->release_requested = 1;
        } else {
            state->preparation_error = EPROTO;
            launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
        }
    } else {
        uint64_t maximum = launcher_now() + STOP_BUDGET_NS;
        launcher_stop(state, maximum);
        if (instruction.kind == CONTROL_INVALID) {
            state->preparation_error = EPROTO;
            return 0;
        }
        if (instruction.kind == CONTROL_STOP) {
            if (instruction.deadline == 0 || instruction.deadline > maximum) {
                state->preparation_error = EPROTO;
            } else {
                launcher_stop(state, instruction.deadline);
            }
        }
    }
    return 1;
}

int launcher_read_control(struct reservation_state *state) {
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
        struct control_instruction instruction = decode_control_byte(state, bytes[i]);
        if (!apply_control_instruction(state, instruction)) {
            return 0;
        }
    }
    return 1;
}
