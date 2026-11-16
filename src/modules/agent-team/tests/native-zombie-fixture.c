#define _POSIX_C_SOURCE 200809L
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdio.h>
#include <time.h>
#include "native-phase-constants.h"
int main(void) {
    pid_t child = fork();
    if (child < 0) {
        return 2;
    }
    if (child == 0) {
        _exit(0);
    }
    if (setpgid(0, getsid(0)) != 0) {
        return 3;
    }
    printf(PHASE_ZOMBIE_READY_FORMAT, (int)child);
    fflush(stdout);
    struct timespec pause = {PHASE_ZOMBIE_WAIT_SECONDS, 0};
    nanosleep(&pause, NULL);
    int status;
    if (waitpid(child, &status, 0) != child) {
        return 4;
    }
    return 0;
}
