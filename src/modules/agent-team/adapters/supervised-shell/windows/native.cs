using System;
using System.IO;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
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
    private struct StartupInfoEx { public StartupInfo Startup; public IntPtr AttributeList; }
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

    [StructLayout(LayoutKind.Sequential)]
    private struct BasicAccounting
    {
        public long TotalUser; public long TotalKernel; public long PeriodUser; public long PeriodKernel;
        public uint PageFaults; public uint TotalProcesses; public uint ActiveProcesses; public uint TerminatedProcesses;
    }
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool QueryInformationJobObject(IntPtr job, int information, out BasicAccounting accounting, uint size, IntPtr returned);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool CreatePipe(out IntPtr read, out IntPtr write, ref SecurityAttributes attributes, uint size);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool SetHandleInformation(IntPtr handle, uint mask, uint flags);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool SetInformationJobObject(IntPtr job, int information, ref ExtendedLimits limits, uint size);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)] private static extern bool CreateProcess(string application, System.Text.StringBuilder command, IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags, IntPtr environment, string cwd, ref StartupInfoEx startup, out ProcessInformation process);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern uint ResumeThread(IntPtr thread);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool TerminateJobObject(IntPtr job, uint code);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool TerminateProcess(IntPtr process, uint code);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool CloseHandle(IntPtr handle);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool GetExitCodeProcess(IntPtr process, out uint code);

    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool InitializeProcThreadAttributeList(IntPtr list, int count, uint flags, ref IntPtr size);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool UpdateProcThreadAttribute(IntPtr list, uint flags, IntPtr attribute, IntPtr value, IntPtr size, IntPtr previous, IntPtr returned);
    [DllImport("kernel32.dll")] private static extern void DeleteProcThreadAttributeList(IntPtr list);
    [DllImport("kernel32.dll", SetLastError = true)] private static extern bool PeekNamedPipe(IntPtr pipe, IntPtr buffer, uint size, IntPtr read, out uint available, IntPtr remaining);
}
