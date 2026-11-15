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

        /// <summary>Perfil -v2 permite carregar um build novo ao lado da bridge v1 sem colidir handshake/porta.</summary>
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

    internal sealed class BridgeConfig
    {
        internal int Port = 47823;
        internal bool Enabled = true;
        internal int RequestTimeoutMs = 3000;
        internal int MaxQueue = 64;
        internal int MaxTreeItems = 400;
        internal int MaxTexts = 300;

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
                }
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("CONFIG_FAIL", exception);
            }
            return config;
        }

        private static int ParseInt(string text, int fallback)
        {
            int parsed;
            if (int.TryParse(text, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)) return parsed;
            return fallback;
        }
    }

    /// <summary>Minimal writer for flat JSON objects. Numbers use invariant culture.</summary>
    internal sealed class JsonObject
    {
        private readonly StringBuilder builder = new StringBuilder(256);
        private bool first = true;

        internal JsonObject()
        {
            builder.Append('{');
        }

        private void Separate()
        {
            if (!first) builder.Append(',');
            first = false;
        }

        internal JsonObject Str(string key, string value)
        {
            Separate();
            AppendQuoted(key);
            builder.Append(':');
            if (value == null) builder.Append("null");
            else AppendQuoted(value);
            return this;
        }

        internal JsonObject Num(string key, long value)
        {
            Separate();
            AppendQuoted(key);
            builder.Append(':').Append(value.ToString(CultureInfo.InvariantCulture));
            return this;
        }

        internal JsonObject Dbl(string key, double value)
        {
            Separate();
            AppendQuoted(key);
            builder.Append(':');
            if (double.IsNaN(value) || double.IsInfinity(value)) builder.Append("null");
            else builder.Append(Math.Round(value, 2).ToString(CultureInfo.InvariantCulture));
            return this;
        }

        internal JsonObject Bool(string key, bool value)
        {
            Separate();
            AppendQuoted(key);
            builder.Append(':').Append(value ? "true" : "false");
            return this;
        }

        internal JsonObject Raw(string key, string json)
        {
            Separate();
            AppendQuoted(key);
            builder.Append(':').Append(json == null ? "null" : json);
            return this;
        }

        public override string ToString()
        {
            return builder.ToString() + "}";
        }

        internal static string Quote(string value)
        {
            StringBuilder target = new StringBuilder();
            AppendQuoted(target, value);
            return target.ToString();
        }

        internal static void AppendQuoted(StringBuilder target, string value)
        {
            if (value == null)
            {
                target.Append("null");
                return;
            }
            target.Append('"');
            for (int index = 0; index < value.Length; index++)
            {
                char character = value[index];
                switch (character)
                {
                    case '"': target.Append("\\\""); break;
                    case '\\': target.Append("\\\\"); break;
                    case '\n': target.Append("\\n"); break;
                    case '\r': target.Append("\\r"); break;
                    case '\t': target.Append("\\t"); break;
                    default:
                        if (character < ' ' || character > '~')
                        {
                            target.Append("\\u").Append(((int)character).ToString("x4", CultureInfo.InvariantCulture));
                        }
                        else target.Append(character);
                        break;
                }
            }
            target.Append('"');
        }

        private void AppendQuoted(string value)
        {
            AppendQuoted(builder, value);
        }
    }

    /// <summary>
    /// Parser for a single flat JSON object (string/number/bool/null values).
    /// Nested objects/arrays are not part of the wire protocol on purpose.
    /// </summary>
    internal static class FlatJson
    {
        internal static Dictionary<string, string> Parse(string text)
        {
            if (text == null) throw new FormatException("empty request");
            Dictionary<string, string> result = new Dictionary<string, string>();
            int index = 0;
            SkipWhitespace(text, ref index);
            Expect(text, ref index, '{');
            while (true)
            {
                SkipWhitespace(text, ref index);
                if (index >= text.Length) throw new FormatException("unterminated object");
                if (text[index] == '}')
                {
                    index++;
                    break;
                }
                string key = ReadString(text, ref index);
                SkipWhitespace(text, ref index);
                Expect(text, ref index, ':');
                SkipWhitespace(text, ref index);
                string value = ReadValue(text, ref index);
                result[key] = value;
                SkipWhitespace(text, ref index);
                if (index < text.Length && text[index] == ',')
                {
                    index++;
                    continue;
                }
                Expect(text, ref index, '}');
                break;
            }
            SkipWhitespace(text, ref index);
            if (index != text.Length) throw new FormatException("trailing content");
            return result;
        }

        internal static string GetString(Dictionary<string, string> source, string key)
        {
            string value;
            if (source.TryGetValue(key, out value)) return value;
            return null;
        }

        internal static int GetInt(Dictionary<string, string> source, string key, int fallback)
        {
            string value = GetString(source, key);
            int parsed;
            if (value != null && int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)) return parsed;
            return fallback;
        }

        internal static double GetDouble(Dictionary<string, string> source, string key, double fallback)
        {
            string value = GetString(source, key);
            double parsed;
            if (value != null && double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out parsed)) return parsed;
            return fallback;
        }

        internal static bool GetBool(Dictionary<string, string> source, string key, bool fallback)
        {
            string value = GetString(source, key);
            if (value == null) return fallback;
            value = value.ToLowerInvariant();
            if (value == "true" || value == "1") return true;
            if (value == "false" || value == "0") return false;
            return fallback;
        }

        private static void SkipWhitespace(string text, ref int index)
        {
            while (index < text.Length && (text[index] == ' ' || text[index] == '\t' || text[index] == '\r' || text[index] == '\n')) index++;
        }

        private static void Expect(string text, ref int index, char expected)
        {
            if (index >= text.Length || text[index] != expected)
                throw new FormatException("expected '" + expected + "' at " + index);
            index++;
        }

        private static string ReadString(string text, ref int index)
        {
            Expect(text, ref index, '"');
            StringBuilder builder = new StringBuilder();
            while (index < text.Length)
            {
                char character = text[index++];
                if (character == '"') return builder.ToString();
                if (character != '\\')
                {
                    builder.Append(character);
                    continue;
                }
                if (index >= text.Length) break;
                char escape = text[index++];
                switch (escape)
                {
                    case '"': builder.Append('"'); break;
                    case '\\': builder.Append('\\'); break;
                    case '/': builder.Append('/'); break;
                    case 'b': builder.Append('\b'); break;
                    case 'f': builder.Append('\f'); break;
                    case 'n': builder.Append('\n'); break;
                    case 'r': builder.Append('\r'); break;
                    case 't': builder.Append('\t'); break;
                    case 'u':
                        if (index + 4 <= text.Length)
                        {
                            int code;
                            if (int.TryParse(text.Substring(index, 4), NumberStyles.HexNumber, CultureInfo.InvariantCulture, out code))
                            {
                                builder.Append((char)code);
                                index += 4;
                            }
                        }
                        break;
                    default: builder.Append(escape); break;
                }
            }
            throw new FormatException("unterminated string");
        }

        private static string ReadValue(string text, ref int index)
        {
            if (index < text.Length && text[index] == '"') return ReadString(text, ref index);
            int start = index;
            while (index < text.Length && text[index] != ',' && text[index] != '}' && text[index] != ' ' && text[index] != '\t' && text[index] != '\r' && text[index] != '\n') index++;
            string token = text.Substring(start, index - start);
            if (token.Length == 0) throw new FormatException("empty value at " + start);
            return token;
        }
    }
}
