#define _POSIX_C_SOURCE 200809L
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <stdio.h>
#include <time.h>
int main(void) {
    pid_t child = fork();
    if (child < 0) { return 2; }
    if (child == 0) { _exit(0); }
    if (setpgid(0, getsid(0)) != 0) { return 3; }
    printf("WINDOWS_READY:%d\n", (int)child);
    fflush(stdout);
    struct timespec pause = {7, 0};
    nanosleep(&pause, NULL);
    int status;
    if (waitpid(child, &status, 0) != child) { return 4; }
    return 0;
}
