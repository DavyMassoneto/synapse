#ifndef SYNAPSE_PHASE_CONSTANTS_H
#define SYNAPSE_PHASE_CONSTANTS_H
#define PHASE_ZOMBIE_READY_FORMAT "CHILD_READY:%d\n"
#define PHASE_ZOMBIE_WAIT_SECONDS 7
#define PHASE_IDENTITY_FORMAT "%d %d\n"
#define PHASE_PATH_FORMAT "%s/%s"
#define PHASE_DIRECTORY_VARIABLE "SYNAPSE_FAULT_DIRECTORY"
#define PHASE_MODE_VARIABLE "SYNAPSE_FAULT_MODE"
#define PHASE_INTERPOSE_SECTION "__DATA,__interpose"
#define PHASE_CLOCK_ACK "clock-ack"
#define PHASE_CLOCK_FAILED "clock-failed"
#define PHASE_CLOCK_RUNNING "clock-running"
#define PHASE_CLOCK_STOP "clock-stop"
#define PHASE_ESRCH "esrch"
#define PHASE_JOIN_BLOCKED "join-blocked"
#define PHASE_JOIN_FAILURE "join-failure"
#define PHASE_SIGNAL "signal"
#define PHASE_STATUS_PRESSURE "status-pressure"
#define PHASE_PATH_CAPACITY 4096
#define PHASE_IDENTITY_CAPACITY 128
#define PHASE_PARENT_POLL_US 1000
#define PHASE_MARKER_PERMISSIONS 0600
#define PHASE_CONTROL_FD 3
#define PHASE_STATUS_FD 4
#define PHASE_STOP_BYTE 2
#define PHASE_ORPHAN_EXIT 94
#define PHASE_OLD_ORDER "old-order"
#define PHASE_ORPHAN_CAPTURED "orphan-captured"
#define PHASE_RELEASE_FILE "release-orphan"
#define PHASE_SESSION_LOSS "join-session-loss"
#define PHASE_TERMINAL "terminal"
#define PHASE_MOVE_ERROR "move-error"
#define PHASE_OUTCOME_FORMAT "%d %d\n"
#define PHASE_MOVE_WAIT_MS 5000
#define PHASE_MOVE_TIMEOUT "move-observation-timeout"
#define PHASE_MILLISECOND_US 1000
#endif
