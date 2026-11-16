#include <errno.h>
#include <poll.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/wait.h>
#include "constants.h"
#include "launcher.h"

int launcher_nonblocking(int fd) {
    int flags = fcntl(fd, F_GETFL);
    return flags >= 0 && fcntl(fd, F_SETFL, flags | O_NONBLOCK) == 0;
}
int launcher_cloexec(int fd) {
    return fcntl(fd, F_SETFD, FD_CLOEXEC) == 0;
}
int launcher_write(struct reservation_state *state, int fd, const void *content, size_t length, uint64_t deadline) {
    const unsigned char *bytes = content;
    size_t offset = 0;
    while (offset < length) {
        if (state->stopping && state->deadline < deadline) {
            deadline = state->deadline;
        }
        if (launcher_now() >= deadline) {
            return 0;
        }
        ssize_t count = write(fd, bytes + offset, length - offset);
        if (count > 0) {
            offset += count;
        } else if (count < 0 && errno == EINTR) {
            continue;
        } else if (count < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) {
            int control = state->control_closed ? -1 : CONTROL_FD;
            struct pollfd waiting[2] = {{fd, POLLOUT, 0}, {control, POLLIN, 0}};
            if (poll(waiting, 2, RECHECK_MS) < 0 && errno != EINTR) {
                return 0;
            }
            if (waiting[1].revents && !launcher_read_control(state)) {
                launcher_stop(state, launcher_now() + STOP_BUDGET_NS);
            }
            if (!launcher_reap(state)) {
                return 0;
            }
            if (fd == state->gate_write && state->stopping) {
                return 0;
            }
        } else {
            return 0;
        }
    }
    return 1;
}
int launcher_error(struct reservation_state *state, int error, uint64_t deadline) {
    const char *text = strerror(error);
    size_t length = strlen(text);
    if (length > MAX_ERROR_BYTES) {
        length = MAX_ERROR_BYTES;
    }
    unsigned char header[ERROR_HEADER_BYTES] = {ERROR_BYTE, (length >> BYTE_BITS), length};
    return launcher_write(state, STATUS_FD, header, sizeof(header), deadline) && launcher_write(state, STATUS_FD, text, length, deadline);
}
int launcher_exit_frame(struct reservation_state *state, int status, uint64_t deadline) {
    unsigned int code;
    if (WIFEXITED(status)) {
        code = WEXITSTATUS(status);
    } else if (WIFSIGNALED(status)) {
        code = SIGNAL_EXIT_OFFSET + WTERMSIG(status);
    } else {
        return 0;
    }
    unsigned char frame[EXIT_FRAME_BYTES] = {EXIT_BYTE, (code >> WORD_HIGH_SHIFT), (code >> WORD_MIDDLE_SHIFT), (code >> BYTE_BITS), code, 0, 0, 0, 0};
    return launcher_write(state, STATUS_FD, frame, sizeof(frame), deadline);
}
int launcher_preparation_frame(struct reservation_state *state, int error, uint64_t deadline) {
    const char *text = "";
    if (error) {
        text = strerror(error);
    }
    size_t length = strlen(text);
    if (length > MAX_ERROR_BYTES) {
        length = MAX_ERROR_BYTES;
    }
    unsigned char header[PREPARATION_HEADER_BYTES] = {PREPARATION_EMPTY_BYTE, error ? PREPARATION_FAILED : PREPARATION_CANCELLED, (length >> BYTE_BITS), length};
    return launcher_write(state, STATUS_FD, header, sizeof(header), deadline) && launcher_write(state, STATUS_FD, text, length, deadline);
}
