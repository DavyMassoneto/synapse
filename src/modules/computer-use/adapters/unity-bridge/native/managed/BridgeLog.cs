using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
    internal static class BridgeLog
    {
        private static readonly object Gate = new object();

        internal static void Write(string message)
        {
            try
            {
                lock (Gate)
                {
                    Directory.CreateDirectory(BridgePaths.LogDir);
                    string line = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture)
                        + " [" + Thread.CurrentThread.ManagedThreadId + "] " + message + Environment.NewLine;
                    File.AppendAllText(BridgePaths.BridgeLogPath, line, Encoding.UTF8);
                }
            }
            catch
            {
            }
        }

        internal static void WriteException(string context, Exception exception)
        {
            Write(context + " " + exception.GetType().FullName + ": " + exception.Message);
            Write(context + " stack: " + exception.StackTrace);
        }
    }
}
