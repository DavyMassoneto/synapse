#include <errno.h>
#include <string.h>
#include <unistd.h>
#include "launcher.h"
#include "constants.h"

static int install_control(const unsigned char *bytes, size_t length) {
    int channel[2];
    if (pipe(channel) != 0) {
        return 0;
    }
    ssize_t written = write(channel[1], bytes, length);
    if (written < 0) {
        return 0;
    }
    size_t accepted = written;
    if (accepted != length) {
        return 0;
    }
    close(channel[1]);
    if (dup2(channel[0], CONTROL_FD) < 0) {
        return 0;
    }
    if (channel[0] != CONTROL_FD) {
        close(channel[0]);
    }
    return 1;
}
int main(void) {
    struct reservation_state state;
    memset(&state, 0, sizeof(state));
    state.gate_write = -1;
    uint64_t now = launcher_now();
    launcher_stop(&state, now + STOP_BUDGET_NS);
    uint64_t original = state.deadline;
    launcher_stop(&state, now + STOP_BUDGET_NS + 1);
    if (state.deadline != original) {
        return 2;
    }
    uint64_t shorter = now + STOP_BUDGET_NS / 2;
    unsigned char frame[CONTROL_FRAME_BYTES] = {STOP_BYTE};
    for (size_t n = 1; n < CONTROL_FRAME_BYTES; n++) {
        frame[n] = shorter >> ((CONTROL_FRAME_BYTES - n - 1) * BYTE_BITS);
    }
    if (!install_control(frame, sizeof(frame)) || !launcher_read_control(&state) || state.deadline != shorter) {
        return 3;
    }
    close(CONTROL_FD);
    return 0;
}
