#ifndef SYNAPSE_LAUNCHER_TYPES_H
#define SYNAPSE_LAUNCHER_TYPES_H
#include "constants.h"
#include <stdint.h>
#include <stddef.h>
#include <sys/types.h>
enum control_instruction_kind { CONTROL_PARTIAL, CONTROL_RELEASE, CONTROL_STOP, CONTROL_INVALID };
struct control_instruction {
    enum control_instruction_kind kind;
    uint64_t deadline;
};

struct reservation_state {
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
    unsigned char control[CONTROL_FRAME_BYTES];
    size_t control_length;
    unsigned char join[sizeof(int) + 1];
    size_t join_length;
    char **arguments;
    const char *directory;
};
#endif
