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
    internal static class UiJson
    {
        internal static JsonObject EntryJson(UiEntry entry)
        {
            JsonObject item = new JsonObject();
            item.Str("id", entry.Id);
            item.Str("kind", "selectable");
            item.Str("path", entry.Path);
            item.Str("type", entry.TypeName);
            item.Str("label", entry.Label);
            item.Bool("interactable", entry.Interactable);
            item.Bool("is_on", entry.IsOn);
            item.Bool("selected", entry.Selected);
            item.Num("screen_x", (long)entry.ScreenMin.x).Num("screen_y", (long)entry.ScreenMin.y);
            item.Num("screen_w", (long)(entry.ScreenMax.x - entry.ScreenMin.x)).Num("screen_h", (long)(entry.ScreenMax.y - entry.ScreenMin.y));
            Vector2 clientMin = UiGeometry.ScreenToClient(entry.ScreenMin);
            Vector2 clientMax = UiGeometry.ScreenToClient(entry.ScreenMax);
            item.Num("client_x", (long)Math.Min(clientMin.x, clientMax.x)).Num("client_y", (long)Math.Min(clientMin.y, clientMax.y));
            item.Num("client_w", (long)Math.Abs(clientMax.x - clientMin.x)).Num("client_h", (long)Math.Abs(clientMax.y - clientMin.y));
            double clientX = (entry.ScreenMin.x + entry.ScreenMax.x) / 2.0 / Screen.width * Desktop.ClientWidth;
            double clientY = (Screen.height - (entry.ScreenMin.y + entry.ScreenMax.y) / 2.0) / Screen.height * Desktop.ClientHeight;
            item.Dbl("cx", clientX).Dbl("cy", clientY);
            item.Num("depth", entry.Depth);
            return item;
        }

        internal static JsonObject TextEntryJson(UiTextEntry entry)
        {
            JsonObject item = new JsonObject();
            item.Str("id", entry.Id);
            item.Str("kind", "text");
            item.Str("path", entry.Path);
            item.Str("text", entry.Text);
            item.Str("type", entry.TypeName);
            item.Str("selectable_id", entry.SelectableId);
            item.Num("screen_x", (long)entry.ScreenMin.x).Num("screen_y", (long)entry.ScreenMin.y);
            item.Num("screen_w", (long)(entry.ScreenMax.x - entry.ScreenMin.x)).Num("screen_h", (long)(entry.ScreenMax.y - entry.ScreenMin.y));
            Vector2 clientMin = UiGeometry.ScreenToClient(entry.ScreenMin);
            Vector2 clientMax = UiGeometry.ScreenToClient(entry.ScreenMax);
            item.Num("client_x", (long)Math.Min(clientMin.x, clientMax.x)).Num("client_y", (long)Math.Min(clientMin.y, clientMax.y));
            item.Num("client_w", (long)Math.Abs(clientMax.x - clientMin.x)).Num("client_h", (long)Math.Abs(clientMax.y - clientMin.y));
            item.Num("depth", entry.Depth);
            return item;
        }

        internal static JsonObject PointJson(double clientX, double clientY, Vector2 screen)
        {
            JsonObject point = new JsonObject();
            point.Dbl("client_x", clientX).Dbl("client_y", clientY);
            point.Dbl("screen_x", screen.x).Dbl("screen_y", screen.y);
            return point;
        }

        internal static JsonObject ScreenJson()
        {
            JsonObject screen = new JsonObject();
            screen.Num("width", Screen.width).Num("height", Screen.height);
            return screen;
        }

        internal static string SelectedJson(GameObject target)
        {
            JsonObject json = new JsonObject();
            string path = UiPaths.BuildPath(target.transform);
            json.Str("id", UiPaths.MakeId(path, target.GetInstanceID()));
            json.Str("path", path);
            json.Str("type", target.GetType().Name);
            return json.ToString();
        }
    }
}
