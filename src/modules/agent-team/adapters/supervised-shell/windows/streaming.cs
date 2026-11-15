using System;
using System.IO;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private sealed class OutputPump
    {
        private readonly FileStream input;
        private readonly object gate = new object();
        private readonly byte[] buffer = new byte[OutputBufferBytes];
        private bool finished;
        public OutputPump(FileStream stream) { input = stream; }
        public void Run()
        {
            try
            {
                while (true)
                {
                    lock (gate) { PumpAvailable(); if (finished) { return; } }
                    System.Threading.Thread.Sleep(OutputPumpIdleMilliseconds);
                }
            }
            finally { input.Dispose(); }
        }
        public void Fence() { lock (gate) { PumpAvailable(); } }
        private void PumpAvailable()
        {
            while (!finished)
            {
                uint available;
                if (!PeekNamedPipe(input.SafeFileHandle.DangerousGetHandle(), IntPtr.Zero, 0, IntPtr.Zero, out available, IntPtr.Zero))
                {
                    int error = Marshal.GetLastWin32Error();
                    if (error == BrokenPipeError) { finished = true; return; }
                    throw new Win32Exception(error);
                }
                if (available == 0) { return; }
                int count = input.Read(buffer, 0, (int)Math.Min((uint)buffer.Length, available));
                if (count == 0) { finished = true; return; }
                lock (Output)
                {
                    Output.Write(buffer, 0, count);
                    Output.Flush();
                    System.Threading.Interlocked.Add(ref OutputBytes, count);
                }
            }
        }
    }

    private static void SendCreated()
    {
        lock (StatusLock) { Status.WriteByte(CreatedStatus); Status.Flush(); }
    }

    private static void SendExit(int code)
    {
        uint count = checked((uint)System.Threading.Interlocked.Read(ref OutputBytes));
        byte[] bytes = new byte[] { ExitStatus, (byte)(code >> 24), (byte)(code >> 16), (byte)(code >> 8), (byte)code, (byte)(count >> 24), (byte)(count >> 16), (byte)(count >> 8), (byte)count };
        lock (StatusLock) { Status.Write(bytes, 0, bytes.Length); Status.Flush(); }
    }

    private static void DrainAcceptedOutput(OutputPump stdout, OutputPump stderr)
    {
        stdout.Fence();
        stderr.Fence();
    }
}
