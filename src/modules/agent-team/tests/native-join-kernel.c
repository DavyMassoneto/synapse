#include <errno.h>
#include <fcntl.h>
#include <signal.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include "child.c"

int main(void) {
    int joined[2];
    int gate[2];
    if (pipe(joined) != 0 || pipe(gate) != 0) {
        return 2;
    }
    int report = fcntl(joined[1], F_DUPFD, 20);
    int execute = fcntl(gate[0], F_DUPFD, 20);
    if (report < 0 || execute < 0) {
        return 3;
    }
    pid_t child = fork();
    if (child < 0) {
        return 4;
    }
    if (child == 0) {
        close(joined[0]);
        close(gate[1]);
        if (setsid() < 0) {
            _exit(8);
        }
        struct reservation_state state;
        memset(&state, 0, sizeof(state));
        state.session_group = getpgrp();
        run_child(&state, report, execute);
    }
    close(joined[1]);
    close(report);
    close(gate[0]);
    close(execute);
    close(gate[1]);
    unsigned char bytes[sizeof(int) + 1];
    ssize_t received = read(joined[0], bytes, sizeof(bytes));
    int status;
    if (waitpid(child, &status, 0) != child) {
        return 5;
    }
    if (received != sizeof(bytes) || bytes[0] != 0) {
        return 6;
    }
    int error;
    memcpy(&error, bytes + 1, sizeof(error));
    if (error != EPERM || !WIFEXITED(status) || WEXITSTATUS(status) != EXEC_FAILURE_CODE) {
        return 7;
    }
    return 0;
}
