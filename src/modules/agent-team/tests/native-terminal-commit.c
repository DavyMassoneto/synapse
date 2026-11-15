#include <errno.h>
#include <signal.h>
#include <string.h>
#include <unistd.h>
#include "launcher.h"
#include "constants.h"

static int signal_count;
static int empty_group(pid_t group, int value) {
    if (group >= 0 || value != SIGKILL) {
        _exit(8);
    }
    signal_count++;
    errno = ESRCH;
    return -1;
}
#define kill empty_group
#include "reservation.c"
#undef kill

int main(void) {
    struct launcher state;
    memset(&state, 0, sizeof(state));
    state.child = getpid();
    state.reaped = 1;
    state.outside = 1;
    state.stopping = 1;
    state.gate_write = -1;
    state.join_read = -1;
    state.deadline = launcher_now() + STOP_BUDGET_NS;
    close(STATUS_FD);
    if (stop_iteration(&state) != 0 || !state.terminal || signal_count != 1) {
        return 2;
    }
    if (!launcher_run(&state) || signal_count != 1) {
        return 3;
    }
    return 0;
}
