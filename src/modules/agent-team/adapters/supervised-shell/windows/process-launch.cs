using System;
using System.ComponentModel;
using System.Runtime.InteropServices;

public sealed partial class SupervisedShellLauncher
{
    private static ProcessInformation LaunchAssigned(string executable, string[] arguments, string cwd, IntPtr environmentBlock, IntPtr job, bool failAssignment, ref IntPtr stdinRead, ref IntPtr stdoutWrite, ref IntPtr stderrWrite, ref IntPtr attributesList, ref IntPtr handles)
    {
        ProcessInformation child = new ProcessInformation();
        bool assigned = false;
        try {
            ExtendedLimits limits = new ExtendedLimits();
            limits.Basic.Flags = KillOnJobClose;
            Check(SetInformationJobObject(job, ExtendedLimitInformation, ref limits, (uint)Marshal.SizeOf(typeof(ExtendedLimits))));
            IntPtr attributeBytes = IntPtr.Zero;
            InitializeProcThreadAttributeList(IntPtr.Zero, 1, 0, ref attributeBytes);
            attributesList = Marshal.AllocHGlobal(attributeBytes);
            Check(InitializeProcThreadAttributeList(attributesList, 1, 0, ref attributeBytes));
            handles = Marshal.AllocHGlobal(IntPtr.Size * InheritedHandleCount);
            Marshal.WriteIntPtr(handles, 0, stdinRead);
            Marshal.WriteIntPtr(handles, IntPtr.Size, stdoutWrite);
            Marshal.WriteIntPtr(handles, IntPtr.Size * 2, stderrWrite);
            Check(UpdateProcThreadAttribute(attributesList, 0, new IntPtr(HandleListAttribute), handles, new IntPtr(IntPtr.Size * InheritedHandleCount), IntPtr.Zero, IntPtr.Zero));
            StartupInfoEx startup = new StartupInfoEx();
            startup.Startup.Size = Marshal.SizeOf(typeof(StartupInfoEx));
            startup.Startup.Flags = StartUseStdHandles;
            startup.Startup.Input = stdinRead;
            startup.Startup.Output = stdoutWrite;
            startup.Startup.Error = stderrWrite;
            startup.AttributeList = attributesList;
            Check(CreateProcess(executable, new System.Text.StringBuilder(CommandLine(executable, arguments)), IntPtr.Zero, IntPtr.Zero, true, CreateSuspended | CreateNoWindow | CreateUnicodeEnvironment | ExtendedStartupInfoPresent, environmentBlock, cwd, ref startup, out child));
            DeleteProcThreadAttributeList(attributesList);
            Marshal.FreeHGlobal(attributesList); attributesList = IntPtr.Zero;
            Marshal.FreeHGlobal(handles); handles = IntPtr.Zero;
            Check(CloseHandle(stdinRead)); stdinRead = IntPtr.Zero;
            Check(CloseHandle(stdoutWrite)); stdoutWrite = IntPtr.Zero;
            Check(CloseHandle(stderrWrite)); stderrWrite = IntPtr.Zero;
            if (!AssignProcessToJobObject(failAssignment ? IntPtr.Zero : job, child.Process))
            {
                Check(TerminateProcess(child.Process, AssignmentFailedExit));
                WaitChecked(child.Process, Infinite);
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        assigned = true;
        return child;
        } finally { if (!assigned && child.Process != IntPtr.Zero) { CleanupUnassigned(child); } }
    }

}
