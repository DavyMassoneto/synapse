using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Text;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace SynapseUnityBridge
{
    internal static class BridgeResponses
    {
        internal static string Refused(string reason, string detail)
        {
            JsonObject response = new JsonObject();
            response.Str("status", "refused");
            response.Str("reason", reason);
            if (detail != null) response.Str("detail", detail);
            return response.ToString();
        }
    }
}
