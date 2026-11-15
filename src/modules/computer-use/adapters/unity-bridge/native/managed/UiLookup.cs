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
    internal static class UiLookup
    {
        internal static UiEntry FindById(List<UiEntry> entries, string id)
        {
            for (int index = 0; index < entries.Count; index++)
            {
                if (string.Equals(entries[index].Id, id, StringComparison.OrdinalIgnoreCase)) return entries[index];
            }
            return null;
        }

        internal static UiEntry FindByLabel(List<UiEntry> entries, string label)
        {
            string wanted = Normalize(label);
            UiEntry exact = null;
            UiEntry partial = null;
            for (int index = 0; index < entries.Count; index++)
            {
                UiEntry entry = entries[index];
                if (entry.Label == null) continue;
                string candidate = Normalize(entry.Label);
                if (candidate == wanted && exact == null) exact = entry;
                if (partial == null && candidate.IndexOf(wanted, StringComparison.Ordinal) >= 0) partial = entry;
            }
            if (exact != null) return exact;
            return partial;
        }

        internal static UiEntry FindByPoint(List<UiEntry> entries, Vector2 screen)
        {
            UiEntry best = null;
            for (int index = 0; index < entries.Count; index++)
            {
                UiEntry entry = entries[index];
                if (!entry.Interactable) continue;
                if (screen.x < entry.ScreenMin.x || screen.x > entry.ScreenMax.x) continue;
                if (screen.y < entry.ScreenMin.y || screen.y > entry.ScreenMax.y) continue;
                if (best == null || entry.Area < best.Area) best = entry;
            }
            return best;
        }

        internal static string Normalize(string text)
        {
            if (text == null) return "";
            return text.Trim().ToLowerInvariant();
        }
    }
}
