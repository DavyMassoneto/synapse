#ifndef SYNAPSE_LAUNCHER_TYPES_H
#define SYNAPSE_LAUNCHER_TYPES_H
#include <stdint.h>
#include <stddef.h>
#include <sys/types.h>
struct launcher {
    pid_t child;
    pid_t session_group;
    int join_read;
    int gate_write;
    int outside;
    int joined;
    int gate_committed;
    int release_requested;
    int stopping;
    int terminal;
    int status_broken;
    int control_closed;
    int reaped;
    int reported;
    int child_status;
    int preparation_error;
    uint64_t deadline;
    unsigned char control[9];
    size_t control_length;
    unsigned char join[sizeof(int) + 1];
    size_t join_length;
    char **arguments;
    const char *directory;
};
#endif
