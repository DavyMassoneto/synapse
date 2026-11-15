using System;
using System.IO;

public sealed partial class SupervisedShellLauncher
{
    private sealed class StatusProtocol
    {
        private readonly Stream status = Console.OpenStandardOutput();
        private readonly object gate = new object();

        public void SendCreated()
        {
            lock (gate)
            {
                status.WriteByte(CreatedStatus);
                status.Flush();
            }
        }

        public void SendEmpty()
        {
            lock (gate)
            {
                status.WriteByte(EmptyStatus);
                status.Flush();
            }
        }

        public void SendExit(int code, uint count)
        {
            byte[] frame = new byte[]
            {
                ExitStatus,
                (byte)(code >> HighByteShift),
                (byte)(code >> MiddleByteShift),
                (byte)(code >> LowByteShift),
                (byte)code,
                (byte)(count >> HighByteShift),
                (byte)(count >> MiddleByteShift),
                (byte)(count >> LowByteShift),
                (byte)count
            };
            lock (gate)
            {
                status.Write(frame, 0, frame.Length);
                status.Flush();
            }
        }
    }
}
