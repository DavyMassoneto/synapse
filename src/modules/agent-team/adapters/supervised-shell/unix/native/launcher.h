#ifndef SYNAPSE_LAUNCHER_H
#define SYNAPSE_LAUNCHER_H
#include "types.h"
uint64_t launcher_now(void);
int launcher_nonblocking(int fd);
int launcher_cloexec(int fd);
int launcher_write(struct launcher *state, int fd, const void *content, size_t length, uint64_t deadline);
int launcher_error(struct launcher *state, int error, uint64_t deadline);
int launcher_exit_frame(struct launcher *state, int status, uint64_t deadline);
int launcher_preparation_frame(struct launcher *state, int error, uint64_t deadline);
int launcher_create_child(struct launcher *state);
int launcher_read_join(struct launcher *state);
int launcher_read_control(struct launcher *state);
void launcher_stop(struct launcher *state, uint64_t deadline);
int launcher_reap(struct launcher *state);
int launcher_run(struct launcher *state);
#endif
