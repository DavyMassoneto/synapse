using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private sealed class OutputTransport
    {
        private readonly Stream destination = Console.OpenStandardError();
        private readonly OutputPump stdout;
        private readonly OutputPump stderr;
        private long bytes;
        public Task[] Pumps;

        public OutputTransport(NativeResources resources)
        {
            FileStream outputReader = OpenReader(ref resources.OutputRead);
            FileStream errorReader = null;
            bool prepared = false;
            try
            {
                errorReader = OpenReader(ref resources.ErrorRead);
                stdout = new OutputPump(outputReader, this);
                stderr = new OutputPump(errorReader, this);
                prepared = true;
            }
            finally
            {
                if (!prepared)
                {
                    try
                    {
                        outputReader.Dispose();
                    }
                    finally
                    {
                        if (errorReader is FileStream)
                        {
                            errorReader.Dispose();
                        }
                    }
                }
            }
        }

        private static FileStream OpenReader(ref IntPtr handle)
        {
            SafeFileHandle ownedHandle = new SafeFileHandle(handle, true);
            handle = IntPtr.Zero;
            bool transferred = false;
            try
            {
                FileStream stream = new FileStream(ownedHandle, FileAccess.Read, PipeBufferBytes, false);
                transferred = true;
                return stream;
            }
            finally
            {
                if (!transferred)
                {
                    ownedHandle.Dispose();
                }
            }
        }

        public uint ByteCount
        {
            get
            {
                return checked((uint)Interlocked.Read(ref bytes));
            }
        }

        public void Start()
        {
            Action pumpOutput = stdout.Run;
            Action pumpError = stderr.Run;
            Pumps = new Task[] { Task.Run(pumpOutput), Task.Run(pumpError) };
        }

        public void Write(byte[] buffer, int count)
        {
            lock (destination)
            {
                destination.Write(buffer, 0, count);
                destination.Flush();
                Interlocked.Add(ref bytes, count);
            }
        }

        public void Fence()
        {
            stdout.Fence();
            stderr.Fence();
        }

    }
}
