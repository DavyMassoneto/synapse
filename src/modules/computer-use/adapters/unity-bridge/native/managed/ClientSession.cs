using System;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
    internal sealed class ClientSession
    {
        internal const int MaxRequestBytes = 8192;

        private enum ReadOutcome
        {
            Line,
            Closed,
            TooLarge
        }

        private readonly TcpClient client;
        private readonly int readTimeoutMs;
        private readonly Action<ClientSession> release;
        private Thread thread;
        private int closed;

        internal ClientSession(TcpClient client, int readTimeoutMs, Action<ClientSession> release)
        {
            this.client = client;
            this.readTimeoutMs = readTimeoutMs;
            this.release = release;
        }

        internal void Start()
        {
            thread = new Thread(Run);
            thread.IsBackground = true;
            thread.Name = "synapse-bridge-client";
            thread.Start();
        }

        internal void Close()
        {
            if (Interlocked.Exchange(ref closed, 1) != 0) return;
            try
            {
                client.Close();
            }
            catch
            {
            }
        }

        internal bool Join(int timeoutMs)
        {
            if (thread == null) return true;
            return thread.Join(timeoutMs);
        }

        private void Run()
        {
            try
            {
                using (client)
                {
                    client.NoDelay = true;
                    client.ReceiveTimeout = readTimeoutMs;
                    client.SendTimeout = readTimeoutMs;
                    NetworkStream stream = client.GetStream();
                    StreamWriter writer = new StreamWriter(stream, new UTF8Encoding(false));
                    writer.AutoFlush = false;
                    while (true)
                    {
                        string line;
                        ReadOutcome outcome = ReadLine(stream, out line);
                        if (outcome == ReadOutcome.Closed) return;
                        if (outcome == ReadOutcome.TooLarge)
                        {
                            WriteResponse(writer, BridgeHost.ErrorJson("request-too-large", null));
                            return;
                        }
                        string response;
                        try
                        {
                            response = BridgeHost.HandleLine(line);
                        }
                        catch (Exception exception)
                        {
                            BridgeLog.WriteException("SERVE_FAIL", exception);
                            response = BridgeHost.ErrorJson("request-failed", exception.GetType().Name + ": " + exception.Message);
                        }
                        WriteResponse(writer, response);
                    }
                }
            }
            catch (IOException exception)
            {
                if (Thread.VolatileRead(ref closed) == 0) BridgeLog.Write("CLIENT_READ_END " + exception.Message);
            }
            catch (Exception exception)
            {
                if (Thread.VolatileRead(ref closed) == 0) BridgeLog.WriteException("SERVE_LOOP_FAIL", exception);
            }
            finally
            {
                if (release != null) release(this);
            }
        }

        private static void WriteResponse(StreamWriter writer, string response)
        {
            writer.Write(response);
            writer.Write('\n');
            writer.Flush();
        }

        private static ReadOutcome ReadLine(NetworkStream stream, out string line)
        {
            byte[] bytes = new byte[MaxRequestBytes + 1];
            int length = 0;
            while (true)
            {
                int value = stream.ReadByte();
                if (value < 0)
                {
                    line = null;
                    return ReadOutcome.Closed;
                }
                if (value == '\n')
                {
                    int textLength = length;
                    if (textLength > 0 && bytes[textLength - 1] == '\r') textLength--;
                    if (textLength > MaxRequestBytes)
                    {
                        line = null;
                        return ReadOutcome.TooLarge;
                    }
                    line = Encoding.UTF8.GetString(bytes, 0, textLength);
                    return ReadOutcome.Line;
                }
                if (length >= MaxRequestBytes + 1)
                {
                    line = null;
                    return ReadOutcome.TooLarge;
                }
                bytes[length] = (byte)value;
                length++;
            }
        }
    }
}
