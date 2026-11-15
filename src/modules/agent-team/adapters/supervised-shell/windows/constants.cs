public sealed partial class SupervisedShellLauncher
{
    private const string KernelLibrary = "kernel32.dll";
    private const string JobMembersActive = "Job members remain active.";
    private const char ArgumentQuote = '"';
    private const char ArgumentEscape = '\\';
    private const char ArgumentSeparator = ' ';
    private static readonly char[] ArgumentWhitespace = new char[] { ArgumentSeparator, '\t', '\n', '\v', ArgumentQuote };
    private const int HighByteShift = 24;
    private const int MiddleByteShift = 16;
    private const int LowByteShift = 8;
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
