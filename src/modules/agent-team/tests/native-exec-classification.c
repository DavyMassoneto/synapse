#include <errno.h>
#include <string.h>
#include <unistd.h>
#include "reservation.c"

int main(void) {
    int channel[2];
    if (dup2(STDOUT_FILENO, STATUS_FD) < 0 || pipe(channel) != 0) {
        return 2;
    }
    struct launcher state;
    memset(&state, 0, sizeof(state));
    state.child = getpid();
    state.reaped = 1;
    state.child_status = EXEC_FAILURE_CODE << 8;
    state.gate_committed = 1;
    state.joined = 1;
    state.outside = 1;
    state.stopping = 1;
    state.deadline = launcher_now() + STOP_BUDGET_NS;
    state.join_read = channel[0];
    int error = ENOENT;
    unsigned char frame[sizeof(int) + 1];
    frame[0] = 0;
    memcpy(frame + 1, &error, sizeof(error));
    if (write(channel[1], frame, sizeof(frame)) != sizeof(frame)) {
        return 3;
    }
    close(channel[1]);
    if (!commit_empty(&state)) {
        return 4;
    }
    return 0;
}
