using System;
using System.Runtime.InteropServices;

public sealed partial class SupervisedShellLauncher
{
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool QueryInformationJobObject(IntPtr job, int information, out BasicAccounting accounting, uint size, IntPtr returned);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool CreatePipe(out IntPtr read, out IntPtr write, ref SecurityAttributes attributes, uint size);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool SetHandleInformation(IntPtr handle, uint mask, uint flags);
    [DllImport(KernelLibrary, CharSet = CharSet.Unicode, SetLastError = true)] private static extern IntPtr CreateJobObject(IntPtr attributes, string name);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool SetInformationJobObject(IntPtr job, int information, ref ExtendedLimits limits, uint size);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
    [DllImport(KernelLibrary, CharSet = CharSet.Unicode, SetLastError = true)] private static extern bool CreateProcess(string application, System.Text.StringBuilder command, IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags, IntPtr environment, string cwd, ref StartupInfoEx startup, out ProcessInformation process);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern uint ResumeThread(IntPtr thread);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool TerminateJobObject(IntPtr job, uint code);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool TerminateProcess(IntPtr process, uint code);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool CloseHandle(IntPtr handle);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool GetExitCodeProcess(IntPtr process, out uint code);

    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool InitializeProcThreadAttributeList(IntPtr list, int count, uint flags, ref IntPtr size);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool UpdateProcThreadAttribute(IntPtr list, uint flags, IntPtr attribute, IntPtr value, IntPtr size, IntPtr previous, IntPtr returned);
    [DllImport(KernelLibrary)] private static extern void DeleteProcThreadAttributeList(IntPtr list);
    [DllImport(KernelLibrary, SetLastError = true)] private static extern bool PeekNamedPipe(IntPtr pipe, IntPtr buffer, uint size, IntPtr read, out uint available, IntPtr remaining);
}
