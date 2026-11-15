using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
    internal static class BridgePaths
    {
        internal static string Root
        {
            get
            {
                string fromEnv = Environment.GetEnvironmentVariable("SYNAPSE_BRIDGE_DIR");
                if (fromEnv != null && fromEnv.Length > 0) return fromEnv;
                string fromAssembly = FindRootFromAssembly();
                if (fromAssembly != null) return fromAssembly;
                string fromMarker = ReadRootMarker();
                if (fromMarker != null) return fromMarker;
                return Path.Combine(Path.GetTempPath(), "synapse-unity-bridge");
            }
        }

        private static string ReadRootMarker()
        {
            try
            {
                string path = Path.Combine(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Synapse"), "unity-bridge-root.txt");
                if (!File.Exists(path)) return null;
                string root = File.ReadAllText(path).Trim();
                if (root.Length > 0 && Directory.Exists(Path.Combine(root, "managed"))) return root;
            }
            catch
            {
            }
            return null;
        }

        private static string FindRootFromAssembly()
        {
            try
            {
                string location = typeof(BridgePaths).Assembly.Location;
                if (location == null || location.Length == 0) return null;
                string directory = Path.GetDirectoryName(location);
                for (int depth = 0; depth < 6 && directory != null; depth++)
                {
                    if (Directory.Exists(Path.Combine(directory, "managed"))) return directory;
                    directory = Path.GetDirectoryName(directory);
                }
            }
            catch
            {
            }
            return null;
        }

        internal static string Suffix = "";

        internal static string RunDir { get { return Path.Combine(Root, "run"); } }
        internal static string LogDir { get { return Path.Combine(Root, "logs"); } }
        internal static string ConfigPath { get { return Path.Combine(RunDir, "bridge" + Suffix + ".ini"); } }
        internal static string HandshakePath { get { return Path.Combine(RunDir, "handshake" + Suffix + ".json"); } }
        internal static string HandshakeTempPath { get { return Path.Combine(RunDir, "handshake" + Suffix + ".tmp"); } }
        internal static string StoppedPath { get { return Path.Combine(RunDir, "stopped" + Suffix + ".json"); } }
        internal static string LoadAttemptPath { get { return Path.Combine(RunDir, "load-attempt" + Suffix + ".json"); } }
        internal static string BridgeLogPath { get { return Path.Combine(LogDir, "bridge.log"); } }

        internal static void DetectProfile()
        {
            try
            {
                if (File.Exists(Path.Combine(RunDir, "bridge-v2.ini"))) Suffix = "-v2";
            }
            catch
            {
            }
        }
    }
}
