#ifndef SYNAPSE_PHASE_CONSTANTS_H
#define SYNAPSE_PHASE_CONSTANTS_H
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
#define PHASE_ORPHAN_EXIT 94
#endif
