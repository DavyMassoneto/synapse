using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.EventSystems;

namespace SynapseUnityBridge
{
    internal static class UiTreeJson
    {
        internal static string Render(List<UiEntry> entries, List<UiTextEntry> texts, bool includeTexts, int maxItems)
        {
            GameObject selected = UiGeometry.SelectedGameObject();
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Num("protocol", 2);
            response.Num("count", entries.Count);
            response.Num("returned", Math.Min(entries.Count, maxItems));
            response.Raw("screen", UiJson.ScreenJson().ToString());
            response.Raw("geometry", BridgeHost.GeometrySnapshot());
            response.Bool("event_system", EventSystem.current != null);
            response.Str("selected_id", selected != null ? UiPaths.MakeId(UiPaths.BuildPath(selected.transform), selected.GetInstanceID()) : null);
            response.Raw("items", ItemsJson(entries, maxItems));
            if (includeTexts)
            {
                response.Raw("texts", TextsJson(texts));
                response.Num("text_count", texts.Count);
            }
            return response.ToString();
        }

        private static string ItemsJson(List<UiEntry> entries, int maxItems)
        {
            StringBuilder items = new StringBuilder("[");
            int returned = 0;
            for (int index = 0; index < entries.Count && returned < maxItems; index++)
            {
                if (returned > 0) items.Append(',');
                items.Append(UiJson.EntryJson(entries[index]).ToString());
                returned++;
            }
            items.Append(']');
            return items.ToString();
        }

        private static string TextsJson(List<UiTextEntry> texts)
        {
            StringBuilder json = new StringBuilder("[");
            for (int index = 0; index < texts.Count; index++)
            {
                if (index > 0) json.Append(',');
                json.Append(UiJson.TextEntryJson(texts[index]).ToString());
            }
            json.Append(']');
            return json.ToString();
        }
    }
}
