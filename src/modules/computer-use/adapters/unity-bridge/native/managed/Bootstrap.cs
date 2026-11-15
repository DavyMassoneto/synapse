using System;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;

namespace SynapseUnityBridge
{
    public static class Bootstrap
    {
        public static void Load()
        {
            BridgeLog.Write("LOAD_ENTER pid=" + System.Diagnostics.Process.GetCurrentProcess().Id);
            try
            {
                BridgePaths.DetectProfile();
                BridgeHost.Initialize();
                if (!BridgeHost.Config.Enabled)
                {
                    WriteLoadAttempt("disabled", "bridge.ini enabled=0; nada foi iniciado", null);
                    BridgeLog.Write("LOAD_DISABLED");
                    return;
                }
                WriteLoadAttempt("starting", null, null);
                if (!BridgeHost.StartListener())
                {
                    WriteLoadAttempt("listen-failed", "TcpListener nao pode abrir a porta", null);
                    return;
                }
                BridgeHost.StartForegroundWatch();
                BridgeHost.WriteHandshake("starting");
                if (!BridgeHost.CreateGameObject())
                {
                    WriteLoadAttempt("gameobject-failed", MainThreadInfo.CreateError, null);
                    BridgeHost.Shutdown("gameobject-failed");
                    return;
                }
                WriteLoadAttempt("injected", null, null);
                BridgeLog.Write("LOAD_OK port=" + BridgeHost.Config.Port);
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("LOAD_FAIL", exception);
                WriteLoadAttempt("load-failed", exception.GetType().Name + ": " + exception.Message, exception);
            }
        }

        public static void Stop()
        {
            BridgeLog.Write("STOP_REQUESTED");
            BridgeHost.RequestMainThreadStop();
        }

        private static void WriteLoadAttempt(string state, string detail, Exception exception)
        {
            try
            {
                string runDirectory = BridgePaths.RunDir;
                Directory.CreateDirectory(runDirectory);
                StringBuilder builder = new StringBuilder();
                builder.Append('{');
                builder.Append("\"state\":").Append(JsonObject.Quote(state));
                builder.Append(",\"pid\":").Append(System.Diagnostics.Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture));
                builder.Append(",\"utc\":").Append(JsonObject.Quote(DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture)));
                builder.Append(",\"instance\":").Append(JsonObject.Quote(BridgeHost.Instance));
                builder.Append(",\"port\":").Append(BridgeHost.Config.Port.ToString(CultureInfo.InvariantCulture));
                builder.Append(",\"enabled\":").Append(BridgeHost.Config.Enabled ? "true" : "false");
                if (detail != null) builder.Append(",\"detail\":").Append(JsonObject.Quote(detail));
                builder.Append(",\"geometry\":").Append(Desktop.GeometryJson());
                if (exception != null) builder.Append(",\"exception\":").Append(JsonObject.Quote(exception.ToString()));
                builder.Append('}');
                File.WriteAllText(BridgePaths.LoadAttemptPath, builder.ToString(), new UTF8Encoding(false));
            }
            catch (Exception writeException)
            {
                BridgeLog.WriteException("LOAD_ATTEMPT_WRITE_FAIL", writeException);
            }
        }
    }

    internal sealed class BridgeBehaviour : MonoBehaviour
    {
        private void Update()
        {
            BridgeHost.Pump();
        }
    }
}
