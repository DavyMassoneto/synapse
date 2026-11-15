#ifndef SYNAPSE_LAUNCHER_H
#define SYNAPSE_LAUNCHER_H
#include "types.h"
uint64_t launcher_now(void);
int launcher_nonblocking(int fd);
int launcher_cloexec(int fd);
int launcher_write(struct reservation_state *state, int fd, const void *content, size_t length, uint64_t deadline);
int launcher_error(struct reservation_state *state, int error, uint64_t deadline);
int launcher_exit_frame(struct reservation_state *state, int status, uint64_t deadline);
int launcher_preparation_frame(struct reservation_state *state, int error, uint64_t deadline);
int launcher_create_child(struct reservation_state *state);
int launcher_read_join(struct reservation_state *state);
int launcher_read_control(struct reservation_state *state);
void launcher_stop(struct reservation_state *state, uint64_t deadline);
int launcher_reap(struct reservation_state *state);
int launcher_run(struct reservation_state *state);
#endif
