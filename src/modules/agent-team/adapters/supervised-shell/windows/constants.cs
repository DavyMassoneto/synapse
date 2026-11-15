using System;
using System.IO;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private const int BasicAccountingInformation = 1;
    private const int OutputPumpIdleMilliseconds = 1;
    private const int BrokenPipeError = 109;
    private const uint CreateSuspended = 0x00000004;
    private const uint CreateNoWindow = 0x08000000;
    private const uint StartUseStdHandles = 0x00000100;
    private const uint HandleInherit = 1;
    private const uint KillOnJobClose = 0x00002000;
    private const int ExtendedLimitInformation = 9;
    private const uint Infinite = 0xffffffff;
    private const uint CreateUnicodeEnvironment = 0x00000400;
    private const uint ExtendedStartupInfoPresent = 0x00080000;
    private const int HandleListAttribute = 0x00020002;
    private const int InheritedHandleCount = 3;
    private const int OutputBufferBytes = 65536;
    private const int PipeBufferBytes = 1;
    private const uint PollMilliseconds = 20;
    private const uint InterruptedExit = 137;
    private const uint AssignmentFailedExit = 91;
    private const uint CleanupExit = 94;
    private const int CloseJobInstruction = 3;
    private const int ReleaseInstruction = 1;
    private const byte CreatedStatus = 1;
    private const byte ExitStatus = 2;
    private const byte EmptyStatus = 3;
}
