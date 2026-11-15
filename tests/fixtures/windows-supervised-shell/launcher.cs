using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed class SupervisedShellProof
{
    private const uint CreateSuspended = 0x00000004;
    private const uint CreateNoWindow = 0x08000000;
    private const uint StartUseStdHandles = 0x00000100;
    private const uint HandleInherit = 1;
    private const uint KillOnJobClose = 0x00002000;
    private const int ExtendedLimitInformation = 9;
    private const uint Infinite = 0xffffffff;

    [StructLayout(LayoutKind.Sequential)]
    private struct SecurityAttributes { public int Length; public IntPtr Descriptor; public int Inherit; }
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct StartupInfo
    {
        public int Size; public string Reserved; public string Desktop; public string Title;
        public uint X; public uint Y; public uint XSize; public uint YSize;
        public uint XCount; public uint YCount; public uint Fill; public uint Flags;
        public short Show; public short ReservedSize; public IntPtr ReservedPointer;
        public IntPtr Input; public IntPtr Output; public IntPtr Error;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct ProcessInformation { public IntPtr Process; public IntPtr Thread; public uint Pid; public uint Tid; }
    [StructLayout(LayoutKind.Sequential)]
    private struct BasicLimits
    {
        public long PerProcessTime; public long PerJobTime; public uint Flags;
        public UIntPtr MinimumWorkingSet; public UIntPtr MaximumWorkingSet;
        public uint ActiveProcessLimit; public UIntPtr Affinity;
        public uint PriorityClass; public uint SchedulingClass;
    }
    [StructLayout(LayoutKind.Sequential)]
    private struct IoCounters { public ulong ReadOperations; public ulong WriteOperations; public ulong OtherOperations; public ulong ReadBytes; public ulong WriteBytes; public ulong OtherBytes; }
    [StructLayout(LayoutKind.Sequential)]
    private struct ExtendedLimits
    {
        public BasicLimits Basic; public IoCounters Io;
        public UIntPtr ProcessMemory; public UIntPtr JobMemory; public UIntPtr PeakProcessMemory; public UIntPtr PeakJobMemory;
    }

    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool CreatePipe(out IntPtr read, out IntPtr write, ref SecurityAttributes attributes, uint size);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool SetHandleInformation(IntPtr handle, uint mask, uint flags);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool SetInformationJobObject(IntPtr job, int information, ref ExtendedLimits limits, uint size);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern bool CreateProcess(string application, System.Text.StringBuilder command, IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags, IntPtr environment, string cwd, ref StartupInfo startup, out ProcessInformation process);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern uint ResumeThread(IntPtr thread);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool TerminateJobObject(IntPtr job, uint code);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool TerminateProcess(IntPtr process, uint code);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool CloseHandle(IntPtr handle);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool GetExitCodeProcess(IntPtr process, out uint code);

    private static void Check(bool success) { if (!success) { throw new Win32Exception(Marshal.GetLastWin32Error()); } }

    public static int Run(string executable, string commandLine, string cwd, bool failAssignment)
    {
        IntPtr stdoutRead = IntPtr.Zero;
        IntPtr stdoutWrite = IntPtr.Zero;
        IntPtr stderrRead = IntPtr.Zero;
        IntPtr stderrWrite = IntPtr.Zero;
        IntPtr job = IntPtr.Zero;
        ProcessInformation child = new ProcessInformation();
        Task<string> output = null;
        Task<string> error = null;
        try
        {
            SecurityAttributes attributes = new SecurityAttributes { Length = Marshal.SizeOf(typeof(SecurityAttributes)), Inherit = 1 };
            Check(CreatePipe(out stdoutRead, out stdoutWrite, ref attributes, 0));
            Check(CreatePipe(out stderrRead, out stderrWrite, ref attributes, 0));
            Check(SetHandleInformation(stdoutRead, HandleInherit, 0));
            Check(SetHandleInformation(stderrRead, HandleInherit, 0));
            job = CreateJobObject(IntPtr.Zero, null);
            if (job == IntPtr.Zero) { throw new Win32Exception(Marshal.GetLastWin32Error()); }
            ExtendedLimits limits = new ExtendedLimits();
            limits.Basic.Flags = KillOnJobClose;
            Check(SetInformationJobObject(job, ExtendedLimitInformation, ref limits, (uint)Marshal.SizeOf(typeof(ExtendedLimits))));
            StartupInfo startup = new StartupInfo { Size = Marshal.SizeOf(typeof(StartupInfo)), Flags = StartUseStdHandles, Output = stdoutWrite, Error = stderrWrite, Input = IntPtr.Zero };
            Check(CreateProcess(executable, new System.Text.StringBuilder(commandLine), IntPtr.Zero, IntPtr.Zero, true, CreateSuspended | CreateNoWindow, IntPtr.Zero, cwd, ref startup, out child));
            CloseHandle(stdoutWrite); stdoutWrite = IntPtr.Zero;
            CloseHandle(stderrWrite); stderrWrite = IntPtr.Zero;
            if (failAssignment || !AssignProcessToJobObject(job, child.Process))
            {
                TerminateProcess(child.Process, 91);
                WaitForSingleObject(child.Process, Infinite);
                Console.Out.WriteLine("ASSIGNMENT_REFUSED_BEFORE_RESUME");
                return 91;
            }
            SafeFileHandle outputHandle = new SafeFileHandle(stdoutRead, true); stdoutRead = IntPtr.Zero;
            SafeFileHandle errorHandle = new SafeFileHandle(stderrRead, true); stderrRead = IntPtr.Zero;
            StreamReader outputReader = new StreamReader(new FileStream(outputHandle, FileAccess.Read, 4096, false));
            StreamReader errorReader = new StreamReader(new FileStream(errorHandle, FileAccess.Read, 4096, false));
            output = Task.Run(() => outputReader.ReadToEnd());
            error = Task.Run(() => errorReader.ReadToEnd());
            Console.Out.WriteLine("CREATED_SUSPENDED_ASSIGNED");
            Console.Out.Flush();
            if (Console.In.ReadLine() != "RELEASE")
            {
                Check(TerminateJobObject(job, 92));
                return 92;
            }
            if (ResumeThread(child.Thread) == uint.MaxValue) { throw new Win32Exception(Marshal.GetLastWin32Error()); }
            Console.Out.WriteLine("RELEASED");
            Console.Out.Flush();
            string instruction = Console.In.ReadLine();
            if (instruction == "TERMINATE") { Check(TerminateJobObject(job, 93)); }
            WaitForSingleObject(child.Process, Infinite);
            Task.WaitAll(output, error);
            Console.Out.WriteLine("OUTPUT:" + output.Result);
            Console.Out.WriteLine("ERROR:" + error.Result);
            uint code;
            Check(GetExitCodeProcess(child.Process, out code));
            Console.Out.WriteLine("EXIT:" + code);
            return (int)code;
        }
        finally
        {
            if (job != IntPtr.Zero) { TerminateJobObject(job, 94); CloseHandle(job); }
            if (child.Thread != IntPtr.Zero) { CloseHandle(child.Thread); }
            if (child.Process != IntPtr.Zero) { CloseHandle(child.Process); }
            if (stdoutRead != IntPtr.Zero) { CloseHandle(stdoutRead); }
            if (stdoutWrite != IntPtr.Zero) { CloseHandle(stdoutWrite); }
            if (stderrRead != IntPtr.Zero) { CloseHandle(stderrRead); }
            if (stderrWrite != IntPtr.Zero) { CloseHandle(stderrWrite); }
        }
    }
}
