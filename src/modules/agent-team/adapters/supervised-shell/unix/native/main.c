#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <inttypes.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "constants.h"
#include "launcher.h"

int main(int count, char **arguments) {
    if (count == 2 && strcmp(arguments[1], IDENTITY_ARGUMENT) == 0) {
        printf(IDENTITY_FORMAT, IDENTITY_TEXT, IDENTITY_PLATFORM, IDENTITY_ARCHITECTURE, launcher_now());
        return 0;
    }
    if (count < 3) {
        return PROTOCOL_FAILURE_CODE;
    }
    signal(SIGPIPE, SIG_IGN);
    signal(SIGCHLD, SIG_DFL);
    struct reservation_state state;
    memset(&state, 0, sizeof(state));
    state.session_group = getpgrp();
    state.join_read = -1;
    state.gate_write = -1;
    state.directory = arguments[1];
    state.arguments = arguments + 2;
    if (getsid(0) != state.session_group || getpid() == state.session_group || !launcher_nonblocking(CONTROL_FD) || !launcher_nonblocking(STATUS_FD)) {
        return PROTOCOL_FAILURE_CODE;
    }
    if (setpgid(0, 0) != 0 || getpgrp() != getpid()) {
        return PROTOCOL_FAILURE_CODE;
    }
    if (!launcher_create_child(&state)) {
        state.preparation_error = errno;
        launcher_stop(&state, launcher_now() + STOP_BUDGET_NS);
    }
    if (!launcher_run(&state)) {
        launcher_error(&state, state.preparation_error ? state.preparation_error : ETIMEDOUT, launcher_now() + ERROR_WRITE_BUDGET_NS);
        return PROTOCOL_FAILURE_CODE;
    }
    return 0;
}
