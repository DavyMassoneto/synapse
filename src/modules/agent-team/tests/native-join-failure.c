#include <errno.h>
#include <string.h>
#include <unistd.h>
#include "launcher.h"
#include "constants.h"
int main(void) {
    int channel[2];
    if (pipe(channel) != 0) { return 2; }
    struct launcher state;
    memset(&state, 0, sizeof(state));
    state.join_read = channel[0];
    state.gate_write = -1;
    unsigned char frame[sizeof(int) + 1];
    int error = EPERM;
    frame[0] = 0;
    memcpy(frame + 1, &error, sizeof(error));
    if (write(channel[1], frame, sizeof(frame)) != sizeof(frame)) { return 3; }
    close(channel[1]);
    if (!launcher_read_join(&state) || !state.stopping || state.preparation_error != EPERM || state.joined || state.gate_committed) { return 4; }
    if (!launcher_read_join(&state) || state.join_read >= 0) { return 5; }
    return 0;
}
