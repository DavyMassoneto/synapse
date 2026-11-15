using System;
using System.IO;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private static int ExecuteAssigned(ProcessInformation child, ref IntPtr job, ref IntPtr stdoutRead, ref IntPtr stderrRead, ref IntPtr stdinWrite, string input)
    {
            SafeFileHandle outputHandle = new SafeFileHandle(stdoutRead, true); stdoutRead = IntPtr.Zero;
            SafeFileHandle errorHandle = new SafeFileHandle(stderrRead, true); stderrRead = IntPtr.Zero;
            FileStream outputReader = new FileStream(outputHandle, FileAccess.Read, PipeBufferBytes, false);
            FileStream errorReader = new FileStream(errorHandle, FileAccess.Read, PipeBufferBytes, false);
            OutputPump stdoutPump = new OutputPump(outputReader);
            Task output = Task.Run(stdoutPump.Run);
            OutputPump stderrPump = new OutputPump(errorReader);
            Task error = Task.Run(stderrPump.Run);
            SendCreated();
            Stream control = Console.OpenStandardInput();
            if (control.ReadByte() != ReleaseInstruction)
            {
                Check(TerminateJobObject(job, InterruptedExit));
                WaitChecked(child.Process, Infinite);
                Task.WaitAll(output, error);
                EnsureJobEmpty(job);
                SendExit((int)InterruptedExit);
                SendEmpty();
                return (int)InterruptedExit;
            }
            ResumeChecked(child.Thread);
            Task<int> stop = Task.Run(() => control.ReadByte());
            Task inputTask = Task.CompletedTask;
            if (stdinWrite != IntPtr.Zero)
            {
                IntPtr inputHandle = stdinWrite;
                stdinWrite = IntPtr.Zero;
                inputTask = Task.Run(() => WriteInput(inputHandle, input));
            }
            while (WaitChecked(child.Process, PollMilliseconds) != 0)
            {
                if (stop.IsCompleted)
                {
                    if (stop.Result == CloseJobInstruction) { Check(CloseHandle(job)); job = IntPtr.Zero; }
                    else { Check(TerminateJobObject(job, InterruptedExit)); }
                    break;
                }
            }
            WaitChecked(child.Process, Infinite);
            uint code;
            Check(GetExitCodeProcess(child.Process, out code));


            DrainAcceptedOutput(stdoutPump, stderrPump);
            SendExit((int)code);
            if (!stop.IsCompleted) { stop.Wait(); }
            if (job != IntPtr.Zero) { Check(TerminateJobObject(job, InterruptedExit)); }
            Task.WaitAll(output, error);
            ObserveInput(inputTask);
            if (job != IntPtr.Zero) { EnsureJobEmpty(job); }
            SendEmpty();
            return (int)code;
    }
}
