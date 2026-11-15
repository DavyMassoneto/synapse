using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

public sealed partial class SupervisedShellLauncher
{
    private static ProcessInformation LaunchAssigned(string executable, string[] arguments, string cwd, NativeResources resources)
    {
        ProcessInformation child = new ProcessInformation();
        bool assigned = false;
        try
        {
            ConfigureJob(resources.Job);
            using (LaunchAttributes attributes = new LaunchAttributes(resources))
            {
                StartupInfoEx startup = attributes.Startup;
                Check(CreateProcess(executable, new StringBuilder(CommandLine(executable, arguments)), IntPtr.Zero, IntPtr.Zero, true, CreateSuspended | CreateNoWindow | CreateUnicodeEnvironment | ExtendedStartupInfoPresent, resources.Environment, cwd, ref startup, out child));
            }
            resources.CloseChildPipeHandles();
            AssignChild(resources.Job, child.Process);
            assigned = true;
            return child;
        }
        finally
        {
            if (!assigned && child.Process != IntPtr.Zero)
            {
                CleanupUnassigned(child);
            }
        }
    }

    private static void ConfigureJob(IntPtr job)
    {
        ExtendedLimits limits = new ExtendedLimits();
        limits.Basic.Flags = KillOnJobClose;
        Check(SetInformationJobObject(job, ExtendedLimitInformation, ref limits, (uint)Marshal.SizeOf(typeof(ExtendedLimits))));
    }

    private static void AssignChild(IntPtr job, IntPtr process)
    {
        if (!AssignProcessToJobObject(job, process))
        {
            int error = Marshal.GetLastWin32Error();
            Check(TerminateProcess(process, AssignmentFailedExit));
            WaitChecked(process, Infinite);
            throw new Win32Exception(error);
        }
    }
}
