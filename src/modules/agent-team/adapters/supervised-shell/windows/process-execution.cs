using System;
using System.IO;
using System.Threading.Tasks;

public sealed partial class SupervisedShellLauncher
{
    private sealed class AssignedExecution
    {
        private readonly ProcessInformation child;
        private readonly NativeResources resources;
        private readonly OutputTransport output;
        private readonly StatusProtocol status = new StatusProtocol();
        private readonly Stream control = Console.OpenStandardInput();

        public AssignedExecution(ProcessInformation process, NativeResources nativeResources)
        {
            child = process;
            resources = nativeResources;
            output = new OutputTransport(resources);
        }

        public int Run(string input)
        {
            output.Start();
            status.SendCreated();
            if (control.ReadByte() == ReleaseInstruction)
            {
                return RunReleased(input);
            }
            return RejectRelease();
        }

        private int RejectRelease()
        {
            Check(TerminateJobObject(resources.Job, InterruptedExit));
            WaitChecked(child.Process, Infinite);
            Task.WaitAll(output.Pumps);
            EnsureJobEmpty(resources.Job);
            status.SendExit((int)InterruptedExit, output.ByteCount);
            status.SendEmpty();
            return (int)InterruptedExit;
        }

        private int RunReleased(string input)
        {
            ResumeChecked(child.Thread);
            Func<int> readControl = control.ReadByte;
            Task<int> stop = Task.Run<int>(readControl);
            Task inputTask = StartInput(input);
            int code = WaitForeground(stop);
            output.Fence();
            status.SendExit(code, output.ByteCount);
            CompleteJob(stop, inputTask);
            status.SendEmpty();
            return code;
        }

        private Task StartInput(string input)
        {
            Task task = Task.FromResult(0);
            if (resources.InputWrite != IntPtr.Zero)
            {
                InputTransport transport = resources.TakeInput(input);
                Action writeInput = transport.Run;
                task = Task.Run(writeInput);
            }
            return task;
        }

        private int WaitForeground(Task<int> stop)
        {
            bool stopped = false;
            while (!stopped && WaitChecked(child.Process, PollMilliseconds) != 0)
            {
                if (stop.IsCompleted)
                {
                    ApplyStop(stop.Result);
                    stopped = true;
                }
            }
            WaitChecked(child.Process, Infinite);
            uint code;
            Check(GetExitCodeProcess(child.Process, out code));
            return (int)code;
        }

        private void ApplyStop(int instruction)
        {
            if (instruction == CloseJobInstruction)
            {
                Check(CloseHandle(resources.Job));
                resources.Job = IntPtr.Zero;
            }
            else
            {
                Check(TerminateJobObject(resources.Job, InterruptedExit));
            }
        }

        private void CompleteJob(Task<int> stop, Task input)
        {
            if (!stop.IsCompleted)
            {
                stop.Wait();
            }
            if (resources.Job != IntPtr.Zero)
            {
                Check(TerminateJobObject(resources.Job, InterruptedExit));
            }
            Task.WaitAll(output.Pumps);
            InputTransport.Observe(input);
            if (resources.Job != IntPtr.Zero)
            {
                EnsureJobEmpty(resources.Job);
            }
        }
    }
}
