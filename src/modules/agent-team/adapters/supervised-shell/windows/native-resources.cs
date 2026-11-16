using System;
using System.ComponentModel;
using System.Runtime.InteropServices;

public sealed partial class SupervisedShellLauncher
{
    private sealed class NativeResources
    {
        public IntPtr Job;
        public IntPtr InputRead;
        public IntPtr InputWrite;
        public IntPtr OutputRead;
        public IntPtr OutputWrite;
        public IntPtr ErrorRead;
        public IntPtr ErrorWrite;
        public readonly IntPtr Environment;

        public NativeResources(string environment)
        {
            Environment = Marshal.StringToHGlobalUni(environment);
        }

        public void Open(bool hasInput)
        {
            SecurityAttributes attributes = new SecurityAttributes
            {
                Length = Marshal.SizeOf(typeof(SecurityAttributes)),
                Inherit = 1
            };
            Check(CreatePipe(out InputRead, out InputWrite, ref attributes, 0));
            if (!hasInput)
            {
                Check(CloseHandle(InputWrite));
                InputWrite = IntPtr.Zero;
            }
            Check(CreatePipe(out OutputRead, out OutputWrite, ref attributes, 0));
            Check(CreatePipe(out ErrorRead, out ErrorWrite, ref attributes, 0));
            Check(SetHandleInformation(OutputRead, HandleInherit, 0));
            Check(SetHandleInformation(ErrorRead, HandleInherit, 0));
            Job = CreateJobObject(IntPtr.Zero, null);
            if (Job == IntPtr.Zero)
            {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        }

        public void CloseChildPipeHandles()
        {
            Check(CloseHandle(InputRead));
            InputRead = IntPtr.Zero;
            Check(CloseHandle(OutputWrite));
            OutputWrite = IntPtr.Zero;
            Check(CloseHandle(ErrorWrite));
            ErrorWrite = IntPtr.Zero;
        }

        public InputTransport TakeInput(string input)
        {
            InputTransport transport = new InputTransport(InputWrite, input);
            InputWrite = IntPtr.Zero;
            return transport;
        }
    }

    private static void Check(bool success)
    {
        if (!success)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }
    }

    private static void ResumeChecked(IntPtr thread)
    {
        if (ResumeThread(thread) == uint.MaxValue)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }
    }

    private static uint WaitChecked(IntPtr process, uint milliseconds)
    {
        uint result = WaitForSingleObject(process, milliseconds);
        if (result == uint.MaxValue)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }
        return result;
    }

    private static void EnsureJobEmpty(IntPtr job)
    {
        BasicAccounting accounting;
        Check(QueryInformationJobObject(job, BasicAccountingInformation, out accounting, (uint)Marshal.SizeOf(typeof(BasicAccounting)), IntPtr.Zero));
        if (accounting.ActiveProcesses != 0)
        {
            throw new InvalidOperationException(JobMembersActive);
        }
    }
}
