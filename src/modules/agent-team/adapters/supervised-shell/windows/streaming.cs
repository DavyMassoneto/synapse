using System;
using System.ComponentModel;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

public sealed partial class SupervisedShellLauncher
{
    private sealed class OutputPump
    {
        private readonly FileStream input;
        private readonly OutputTransport output;
        private readonly object gate = new object();
        private readonly byte[] buffer = new byte[OutputBufferBytes];
        private bool finished;

        public OutputPump(FileStream stream, OutputTransport transport)
        {
            input = stream;
            output = transport;
        }

        public void Run()
        {
            try
            {
                bool active = true;
                while (active)
                {
                    lock (gate)
                    {
                        PumpAvailable();
                        active = !finished;
                    }
                    if (active)
                    {
                        Thread.Sleep(OutputPumpIdleMilliseconds);
                    }
                }
            }
            finally
            {
                input.Dispose();
            }
        }

        public void Fence()
        {
            lock (gate)
            {
                PumpAvailable();
            }
        }

        private void PumpAvailable()
        {
            uint available = 0;
            if (!finished)
            {
                available = AvailableBytes();
            }
            while (!finished && available > 0)
            {
                int count = input.Read(buffer, 0, (int)Math.Min((uint)buffer.Length, available));
                if (count > 0)
                {
                    output.Write(buffer, count);
                    available = AvailableBytes();
                }
                else
                {
                    finished = true;
                }
            }
        }

        private uint AvailableBytes()
        {
            uint available;
            if (!PeekNamedPipe(input.SafeFileHandle.DangerousGetHandle(), IntPtr.Zero, 0, IntPtr.Zero, out available, IntPtr.Zero))
            {
                int error = Marshal.GetLastWin32Error();
                if (error == BrokenPipeError)
                {
                    finished = true;
                    available = 0;
                }
                else
                {
                    throw new Win32Exception(error);
                }
            }
            return available;
        }
    }
}
