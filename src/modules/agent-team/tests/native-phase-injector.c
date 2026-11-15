#include <errno.h>
#include <fcntl.h>
#ifdef __APPLE__
#include <mach/mach_time.h>
#else
#include <time.h>
#endif
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <unistd.h>

#include "native-phase-constants.h"
#include "native-phase-types.h"

#ifdef __APPLE__
#define INTERPOSE(replacement, original) \
    __attribute__((used)) static struct phase_interposition \
    interpose_##original __attribute__((section(PHASE_INTERPOSE_SECTION))) = { replacement, original };

#else
#define injected_setpgid __wrap_setpgid
#define injected_read __wrap_read
#define injected_write __wrap_write
#define injected_kill __wrap_kill
int __real_setpgid(pid_t pid, pid_t group);
ssize_t __real_read(int fd, void *bytes, size_t length);
ssize_t __real_write(int fd, const void *bytes, size_t length);
int __real_kill(pid_t pid, int signal);
int __real_clock_gettime(clockid_t clock, struct timespec *value);
#define setpgid __real_setpgid
#define read __real_read
#define write __real_write
#define kill __real_kill
#define PHASE_LINKAGE
#endif
#ifdef __APPLE__
#define PHASE_LINKAGE static
#endif

static int clock_failed;
static int stop_received;

static int phase_marker(const char *phase) {
    const char *directory = getenv(PHASE_DIRECTORY_VARIABLE);
    if (!directory) {
        return 0;
    }
    char path[PHASE_PATH_CAPACITY];
    snprintf(path, sizeof(path), PHASE_PATH_FORMAT, directory, phase);
    int file = open(path, O_CREAT | O_WRONLY | O_APPEND, PHASE_MARKER_PERMISSIONS);
    if (file >= 0) {
        char identity[PHASE_IDENTITY_CAPACITY];
        int size = snprintf(identity, sizeof(identity), PHASE_IDENTITY_FORMAT, getpid(), getppid());
        write(file, identity, size);
        close(file);
        return 1;
    }
    return 0;
}

PHASE_LINKAGE int injected_setpgid(pid_t pid, pid_t group) {
    const char *mode = getenv(PHASE_MODE_VARIABLE);
    if (mode && pid == 0 && group == getppid() && getpgrp() != getpid()) {
        if (strcmp(mode, PHASE_JOIN_FAILURE) == 0) {
            phase_marker(PHASE_JOIN_FAILURE);
            errno = EPERM;
            return -1;
        }
        if (strcmp(mode, PHASE_OLD_ORDER) == 0) {
            pid_t original = getppid();
            phase_marker(PHASE_JOIN_BLOCKED);
            while (getppid() == original) {
                usleep(PHASE_PARENT_POLL_US);
            }
            pid_t captured = getppid();
            phase_marker(PHASE_ORPHAN_CAPTURED);
            char path[PHASE_PATH_CAPACITY];
            snprintf(path, sizeof(path), PHASE_PATH_FORMAT, getenv(PHASE_DIRECTORY_VARIABLE), PHASE_RELEASE_FILE);
            while (getppid() == captured && access(path, F_OK) != 0) {
                usleep(PHASE_PARENT_POLL_US);
            }
            _exit(PHASE_ORPHAN_EXIT);
        }
        if (strcmp(mode, PHASE_JOIN_BLOCKED) == 0) {
            pid_t reservation = getppid();
            phase_marker(PHASE_JOIN_BLOCKED);
            while (getppid() == reservation) {
                usleep(PHASE_PARENT_POLL_US);
            }
            _exit(PHASE_ORPHAN_EXIT);
        }
    }
    int result = setpgid(pid, group);
    if (mode && result == 0 && group == getppid() && getpgrp() == group && getpid() != group && strcmp(mode, PHASE_CLOCK_RUNNING) == 0) {
        clock_failed = 1;
    }
    return result;
}

PHASE_LINKAGE ssize_t injected_read(int fd, void *bytes, size_t length) {
    ssize_t result = read(fd, bytes, length);
    const char *mode = getenv(PHASE_MODE_VARIABLE);
    const unsigned char *content = bytes;
    if (mode && fd == PHASE_CONTROL_FD && result > 0 && content[0] == PHASE_STOP_BYTE) {
        stop_received = 1;
        if (strcmp(mode, PHASE_CLOCK_STOP) == 0) {
            clock_failed = 1;
        }
    }
    return result;
}

PHASE_LINKAGE ssize_t injected_write(int fd, const void *bytes, size_t length) {
    const char *mode = getenv(PHASE_MODE_VARIABLE);
    if (mode && fd == PHASE_STATUS_FD && strcmp(mode, PHASE_STATUS_PRESSURE) == 0 && !stop_received) {
        phase_marker(PHASE_STATUS_PRESSURE);
        errno = EAGAIN;
        return -1;
    }
    return write(fd, bytes, length);
}

PHASE_LINKAGE int injected_kill(pid_t pid, int signal) {
    int result = kill(pid, signal);
    int error = errno;
    const char *mode = getenv(PHASE_MODE_VARIABLE);
    if (mode && pid == -getpid() && signal == SIGKILL) {
        phase_marker(PHASE_SIGNAL);
        if (result < 0 && error == ESRCH) {
            phase_marker(PHASE_ESRCH);
            if (strcmp(mode, PHASE_CLOCK_ACK) == 0) {
                clock_failed = 1;
            }
        }
    }
    errno = error;
    return result;
}

#ifdef __APPLE__
static kern_return_t injected_timebase(mach_timebase_info_t info) {
    if (clock_failed) {
        phase_marker(PHASE_CLOCK_FAILED);
        return KERN_FAILURE;
    }
    return mach_timebase_info(info);
}

INTERPOSE(injected_setpgid, setpgid)
INTERPOSE(injected_read, read)
INTERPOSE(injected_write, write)
INTERPOSE(injected_kill, kill)
INTERPOSE(injected_timebase, mach_timebase_info)

#else
int __wrap_clock_gettime(clockid_t clock, struct timespec *value) {
    if (clock_failed) {
        phase_marker(PHASE_CLOCK_FAILED);
        errno = EIO;
        return -1;
    }
    return __real_clock_gettime(clock, value);
}
#endif
