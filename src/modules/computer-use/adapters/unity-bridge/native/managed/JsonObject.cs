using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
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
}
