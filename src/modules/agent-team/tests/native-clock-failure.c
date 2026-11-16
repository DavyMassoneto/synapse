#include <sys/wait.h>
#include <unistd.h>
#ifdef __APPLE__
#define mach_timebase_info failing_timebase
#else
#define clock_gettime failing_clock
#endif
#include "clock.c"
#undef mach_timebase_info

#ifdef __APPLE__
kern_return_t failing_timebase(mach_timebase_info_t info) {
    info->numer = 0;
    info->denom = 0;
    return KERN_FAILURE;
}

#else
int failing_clock(clockid_t clock, struct timespec *value) {
    return -1;
}
#endif

int main(void) {
    pid_t child = fork();
    if (child < 0) {
        return 1;
    }
    if (child == 0) {
        launcher_now();
        _exit(0);
    }
    int status;
    if (waitpid(child, &status, 0) != child) {
        return 2;
    }
    if (!WIFEXITED(status) || WEXITSTATUS(status) != PROTOCOL_FAILURE_CODE) {
        return 3;
    }
    return 0;
}
