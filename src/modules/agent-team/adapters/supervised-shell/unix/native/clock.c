#include <stdint.h>
#include <time.h>
#include <unistd.h>
#include "constants.h"
#ifdef __APPLE__
#include <mach/mach_time.h>
#endif
#include "launcher.h"

uint64_t launcher_now(void) {
#ifdef __APPLE__
    mach_timebase_info_data_t scale;
    if (mach_timebase_info(&scale) != 0 || scale.denom == 0 || scale.numer == 0) {
        _exit(PROTOCOL_FAILURE_CODE);
    }
    __uint128_t value = mach_continuous_time();
    value *= scale.numer;
    return (value / scale.denom);
#else
    struct timespec value;
    if (clock_gettime(CLOCK_MONOTONIC, &value) != 0) {
        _exit(PROTOCOL_FAILURE_CODE);
    }
    return value.tv_sec * NANOSECONDS_PER_SECOND + value.tv_nsec;
#endif
}
