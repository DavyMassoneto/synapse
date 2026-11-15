using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private static readonly Stream Status = Console.OpenStandardOutput();
    private static readonly Stream Output = Console.OpenStandardError();
    private static readonly object StatusLock = new object();
    private static long OutputBytes;

    private static void EnsureJobEmpty(IntPtr job)
    {
        BasicAccounting accounting;
        Check(QueryInformationJobObject(job, BasicAccountingInformation, out accounting, (uint)Marshal.SizeOf(typeof(BasicAccounting)), IntPtr.Zero));
        if (accounting.ActiveProcesses != 0) { throw new InvalidOperationException("Job members remain active."); }
    }

    private static void SendEmpty()
    {
        lock (StatusLock) { Status.WriteByte(EmptyStatus); Status.Flush(); }
    }

    private static void Check(bool success) { if (!success) { throw new Win32Exception(Marshal.GetLastWin32Error()); } }

    private static void ResumeChecked(IntPtr thread)
    {
        if (ResumeThread(thread) == uint.MaxValue) { throw new Win32Exception(Marshal.GetLastWin32Error()); }
    }

    private static uint WaitChecked(IntPtr process, uint milliseconds)
    {
        uint result = WaitForSingleObject(process, milliseconds);
        if (result == uint.MaxValue) { throw new Win32Exception(Marshal.GetLastWin32Error()); }
        return result;
    }

    public static int Run(string executable, string[] arguments, string cwd, string environment, string input, bool failAssignment)
    {
        IntPtr stdoutRead = IntPtr.Zero;
        IntPtr stdoutWrite = IntPtr.Zero;
        IntPtr stderrRead = IntPtr.Zero;
        IntPtr stderrWrite = IntPtr.Zero;
        IntPtr job = IntPtr.Zero;
        IntPtr stdinRead = IntPtr.Zero;
        IntPtr stdinWrite = IntPtr.Zero;
        IntPtr attributesList = IntPtr.Zero;
        IntPtr handles = IntPtr.Zero;
        IntPtr environmentBlock = Marshal.StringToHGlobalUni(environment);
        ProcessInformation child = new ProcessInformation();
        try
        {
            SecurityAttributes attributes = new SecurityAttributes { Length = Marshal.SizeOf(typeof(SecurityAttributes)), Inherit = 1 };
            Check(CreatePipe(out stdinRead, out stdinWrite, ref attributes, 0));
            if (input == null) { Check(CloseHandle(stdinWrite)); stdinWrite = IntPtr.Zero; }
            Check(CreatePipe(out stdoutRead, out stdoutWrite, ref attributes, 0));
            Check(CreatePipe(out stderrRead, out stderrWrite, ref attributes, 0));
            Check(SetHandleInformation(stdoutRead, HandleInherit, 0));
            Check(SetHandleInformation(stderrRead, HandleInherit, 0));
            job = CreateJobObject(IntPtr.Zero, null);
            if (job == IntPtr.Zero) { throw new Win32Exception(Marshal.GetLastWin32Error()); }
            child = LaunchAssigned(executable, arguments, cwd, environmentBlock, job, failAssignment, ref stdinRead, ref stdoutWrite, ref stderrWrite, ref attributesList, ref handles);
            return ExecuteAssigned(child, ref job, ref stdoutRead, ref stderrRead, ref stdinWrite, input);
        }
        finally
        {
            CleanupNativeResources(job, child, stdinRead, stdinWrite, stdoutRead, stdoutWrite, stderrRead, stderrWrite, attributesList, handles, environmentBlock);
        }
    }
}
