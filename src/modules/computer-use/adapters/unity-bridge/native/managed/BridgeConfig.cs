using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
    internal sealed class BridgeConfig
    {
        internal int Port = 47823;
        internal bool Enabled = true;
        internal int RequestTimeoutMs = 3000;
        internal int MaxQueue = 64;
        internal int MaxTreeItems = 400;
        internal int MaxTexts = 300;
        internal int MaxConnections = 16;
        internal int ReadTimeoutMs = 5000;

        internal static BridgeConfig Load()
        {
            BridgeConfig config = new BridgeConfig();
            try
            {
                if (!File.Exists(BridgePaths.ConfigPath)) return config;
                string[] lines = File.ReadAllLines(BridgePaths.ConfigPath);
                foreach (string raw in lines)
                {
                    string line = raw.Trim();
                    if (line.Length == 0 || line[0] == '#' || line[0] == ';') continue;
                    int split = line.IndexOf('=');
                    if (split <= 0) continue;
                    string key = line.Substring(0, split).Trim().ToLowerInvariant();
                    string value = line.Substring(split + 1).Trim();
                    if (key == "port") config.Port = ParseInt(value, config.Port);
                    else if (key == "enabled") config.Enabled = value == "1" || value.ToLowerInvariant() == "true";
                    else if (key == "request_timeout_ms") config.RequestTimeoutMs = ParseInt(value, config.RequestTimeoutMs);
                    else if (key == "max_queue") config.MaxQueue = ParseInt(value, config.MaxQueue);
                    else if (key == "max_tree_items") config.MaxTreeItems = ParseInt(value, config.MaxTreeItems);
                    else if (key == "max_texts") config.MaxTexts = ParseInt(value, config.MaxTexts);
                    else if (key == "max_connections") config.MaxConnections = ParseInt(value, config.MaxConnections);
                    else if (key == "read_timeout_ms") config.ReadTimeoutMs = ParseInt(value, config.ReadTimeoutMs);
                }
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("CONFIG_FAIL", exception);
            }
            config.MaxConnections = Clamp(config.MaxConnections, 1, 64);
            config.ReadTimeoutMs = Clamp(config.ReadTimeoutMs, 100, 60000);
            return config;
        }

        private static int Clamp(int value, int minimum, int maximum)
        {
            if (value < minimum) return minimum;
            if (value > maximum) return maximum;
            return value;
        }

        private static int ParseInt(string text, int fallback)
        {
            int parsed;
            if (int.TryParse(text, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)) return parsed;
            return fallback;
        }
    }
}
