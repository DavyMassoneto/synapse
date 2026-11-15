using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
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
