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
    internal static class UiScroll
    {
        internal static string Scroll(double clientX, double clientY, double dx, double dy,
            string labelMatch, string id, int generation, bool hasGeneration)
        {
            List<UiEntry> entries = null;
            string resolvedBy = null;
            if (id != null && id.Length > 0)
            {
                if (!hasGeneration) return BridgeResponses.Refused("missing-generation", "scroll por id exige o campo generation do tree");
                if (generation != Commands.Generation)
                {
                    JsonObject stale = new JsonObject();
                    stale.Str("status", "refused");
                    stale.Str("reason", "stale-id");
                    stale.Num("current_generation", Commands.Generation);
                    stale.Num("request_generation", generation);
                    return stale.ToString();
                }
                entries = UiTree.CollectSelectables(false);
                UiEntry match = UiLookup.FindById(entries, id);
                if (match == null)
                {
                    JsonObject unknown = new JsonObject();
                    unknown.Str("status", "refused");
                    unknown.Str("reason", "unknown-id");
                    unknown.Str("id", id);
                    return unknown.ToString();
                }
                if (!match.Interactable)
                {
                    JsonObject blocked = new JsonObject();
                    blocked.Str("status", "refused");
                    blocked.Str("reason", "not-interactable");
                    blocked.Str("id", id);
                    blocked.Str("path", match.Path);
                    return blocked.ToString();
                }
                clientX = (match.ScreenMin.x + match.ScreenMax.x) / 2.0 / Screen.width * Desktop.ClientWidth;
                clientY = (Screen.height - (match.ScreenMin.y + match.ScreenMax.y) / 2.0) / Screen.height * Desktop.ClientHeight;
                resolvedBy = "id";
            }
            else if (labelMatch != null && labelMatch.Length > 0)
            {
                entries = UiTree.CollectSelectables(false);
                UiEntry match = UiLookup.FindByLabel(entries, labelMatch);
                if (match == null) return BridgeResponses.Refused("label-not-found", labelMatch);
                clientX = (match.ScreenMin.x + match.ScreenMax.x) / 2.0 / Screen.width * Desktop.ClientWidth;
                clientY = (Screen.height - (match.ScreenMin.y + match.ScreenMax.y) / 2.0) / Screen.height * Desktop.ClientHeight;
                resolvedBy = "label";
            }

            Vector2 screen = UiGeometry.ClientToScreen(clientX, clientY);
            List<RaycastResult> results = UiGeometry.Raycast(screen);
            GameObject handler = null;
            ScrollRect scroll = null;
            Scrollbar bar = null;
            for (int index = 0; index < results.Count; index++)
            {
                GameObject hitObject = results[index].gameObject;
                if (handler == null)
                {
                    handler = ExecuteEvents.GetEventHandler<IScrollHandler>(hitObject);
                }
                if (scroll == null) scroll = FindScrollRect(hitObject.transform);
                if (bar == null) bar = FindScrollbar(hitObject.transform);
            }
            if (handler != null)
            {
                ScrollRect handlerScroll = FindScrollRect(handler.transform);
                if (handlerScroll != null) scroll = handlerScroll;
                if (scroll == null) scroll = FindScrollRectAtPoint(screen);
                if (scroll == null && bar == null) bar = FindScrollbarAtPoint(screen);
            }
            else
            {
                if (scroll == null) scroll = FindScrollRectAtPoint(screen);
                if (scroll == null) bar = FindScrollbarAtPoint(screen);
            }
            if (handler == null && scroll == null && bar == null)
            {
                JsonObject refused = new JsonObject();
                refused.Str("status", "refused");
                refused.Str("reason", results.Count == 0 ? "no-raycast-hit" : "no-scroll-handler");
                refused.Raw("point", UiJson.PointJson(clientX, clientY, screen).ToString());
                refused.Num("raycast_hits", results.Count);
                return refused.ToString();
            }

            Vector2 beforeValue = scroll != null ? NormalizedValue(scroll) : Vector2.zero;
            float barBefore = bar != null ? bar.value : 0f;
            string route = handler != null ? "raycast" : (scroll != null ? "geometry" : "scrollbar");
            bool manual = false;
            bool barUsed = false;
            if (handler != null)
            {
                PointerEventData pointer = new PointerEventData(EventSystem.current);
                pointer.position = screen;
                pointer.delta = Vector2.zero;
                pointer.button = PointerEventData.InputButton.Left;
                pointer.pointerId = -1;
                pointer.scrollDelta = new Vector2((float)dx, (float)dy);
                ExecuteEvents.Execute(handler, pointer, ExecuteEvents.scrollHandler);
                if (scroll != null)
                {
                    manual = !NormalizedChanged(beforeValue, NormalizedValue(scroll));
                }
                else if (bar != null)
                {
                    manual = Math.Abs(bar.value - barBefore) < 0.0001f;
                }
            }
            if (manual || handler == null)
            {
                if (scroll != null)
                {
                    manual = true;
                    AdjustScrollRect(scroll, dx, dy);
                }
                else if (bar != null)
                {
                    manual = true;
                    barUsed = true;
                    AdjustScrollbar(bar, dx, dy);
                }
            }

            Vector2 afterValue = scroll != null ? NormalizedValue(scroll) : Vector2.zero;
            float barAfter = bar != null ? bar.value : 0f;
            bool changed = scroll != null
                ? NormalizedChanged(beforeValue, afterValue)
                : (bar != null && Math.Abs(barAfter - barBefore) >= 0.0001f);

            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("route", route);
            if (resolvedBy != null) response.Str("resolved_by", resolvedBy);
            response.Str("effect", "unverifiable");
            response.Bool("manual_applied", manual);
            response.Bool("normalized_changed", changed);
            if (manual) response.Str("fallback", scroll != null ? "manual-normalized" : "scrollbar");
            response.Raw("point", UiJson.PointJson(clientX, clientY, screen).ToString());
            JsonObject delta = new JsonObject();
            delta.Dbl("x", dx).Dbl("y", dy);
            response.Raw("scroll_delta", delta.ToString());
            Transform targetTransform = handler != null ? handler.transform : (scroll != null ? scroll.transform : bar.transform);
            GameObject targetObject = targetTransform.gameObject;
            JsonObject target = new JsonObject();
            target.Str("id", UiPaths.MakeId(UiPaths.BuildPath(targetTransform), targetObject.GetInstanceID()));
            target.Str("path", UiPaths.BuildPath(targetTransform));
            target.Str("type", targetObject.GetType().Name);
            response.Raw("target", target.ToString());
            if (handler != null) response.Str("handler_path", UiPaths.BuildPath(handler.transform));
            if (scroll != null)
            {
                JsonObject scrollJson = new JsonObject();
                scrollJson.Str("path", UiPaths.BuildPath(scroll.transform));
                scrollJson.Raw("normalized_before", NormalizedJsonValue(beforeValue).ToString());
                scrollJson.Raw("normalized_after", NormalizedJsonValue(afterValue).ToString());
                response.Raw("scroll_rect", scrollJson.ToString());
            }
            if (bar != null && barUsed)
            {
                JsonObject barJson = new JsonObject();
                barJson.Str("path", UiPaths.BuildPath(bar.transform));
                barJson.Dbl("value_before", barBefore).Dbl("value_after", barAfter);
                barJson.Dbl("size", bar.size);
                response.Raw("scrollbar", barJson.ToString());
            }
            response.Str("hint", "scroll nao prova efeito visual; verifique tree/OCR.");
            Commands.BumpGeneration("scroll");
            return response.ToString();
        }

        internal static ScrollRect FindScrollRect(Transform start)
        {
            Transform current = start;
            int guard = 0;
            while (current != null && guard < 12)
            {
                ScrollRect scroll = current.GetComponent<ScrollRect>();
                if (scroll != null) return scroll;
                current = current.parent;
                guard++;
            }
            return null;
        }

        internal static ScrollRect FindScrollRectAtPoint(Vector2 screen)
        {
            ScrollRect best = null;
            float bestArea = float.MaxValue;
            UnityEngine.Object[] found = UnityEngine.Object.FindObjectsOfType(typeof(ScrollRect));
            for (int index = 0; index < found.Length; index++)
            {
                ScrollRect scroll = found[index] as ScrollRect;
                if (scroll == null || !scroll.gameObject.activeInHierarchy) continue;
                if (!scroll.IsActive()) continue;
                RectTransform rect = scroll.transform as RectTransform;
                if (rect == null) continue;
                Vector2 minimum;
                Vector2 maximum;
                if (!UiGeometry.TryGetScreenRect(rect, out minimum, out maximum)) continue;
                if (screen.x < minimum.x || screen.x > maximum.x || screen.y < minimum.y || screen.y > maximum.y) continue;
                float area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
                if (area < bestArea)
                {
                    bestArea = area;
                    best = scroll;
                }
            }
            return best;
        }

        internal static Scrollbar FindScrollbar(Transform start)
        {
            Transform current = start;
            int guard = 0;
            while (current != null && guard < 12)
            {
                Scrollbar bar = current.GetComponent<Scrollbar>();
                if (bar != null) return bar;
                current = current.parent;
                guard++;
            }
            return null;
        }

        internal static Scrollbar FindScrollbarAtPoint(Vector2 screen)
        {
            Scrollbar best = null;
            float bestArea = float.MaxValue;
            UnityEngine.Object[] found = UnityEngine.Object.FindObjectsOfType(typeof(Scrollbar));
            for (int index = 0; index < found.Length; index++)
            {
                Scrollbar bar = found[index] as Scrollbar;
                if (bar == null || !bar.gameObject.activeInHierarchy || !bar.IsActive()) continue;
                RectTransform rect = bar.transform as RectTransform;
                if (rect == null) continue;
                Vector2 minimum;
                Vector2 maximum;
                if (!UiGeometry.TryGetScreenRect(rect, out minimum, out maximum)) continue;
                if (screen.x < minimum.x || screen.x > maximum.x || screen.y < minimum.y || screen.y > maximum.y) continue;
                float area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
                if (area < bestArea)
                {
                    bestArea = area;
                    best = bar;
                }
            }
            return best;
        }

        internal static Vector2 NormalizedValue(ScrollRect scroll)
        {
            if (scroll == null) return Vector2.zero;
            try { return scroll.normalizedPosition; }
            catch { return new Vector2(scroll.horizontalNormalizedPosition, scroll.verticalNormalizedPosition); }
        }

        private static bool NormalizedChanged(Vector2 before, Vector2 after)
        {
            return Math.Abs(before.x - after.x) >= 0.0001f || Math.Abs(before.y - after.y) >= 0.0001f;
        }

        private static JsonObject NormalizedJsonValue(Vector2 value)
        {
            JsonObject normalized = new JsonObject();
            normalized.Dbl("x", value.x).Dbl("y", value.y);
            return normalized;
        }

        private static void AdjustScrollRect(ScrollRect scroll, double dx, double dy)
        {
            if (scroll == null) return;
            const float step = 0.08f;
            if (scroll.horizontal && Math.Abs(dx) >= 0.0001) scroll.horizontalNormalizedPosition = Mathf.Clamp01(scroll.horizontalNormalizedPosition + (float)dx * step);
            if (scroll.vertical && Math.Abs(dy) >= 0.0001) scroll.verticalNormalizedPosition = Mathf.Clamp01(scroll.verticalNormalizedPosition + (float)dy * step);
            Canvas.ForceUpdateCanvases();
        }

        private static void AdjustScrollbar(Scrollbar bar, double dx, double dy)
        {
            if (bar == null) return;
            const float step = 0.08f;
            float delta = Math.Abs(dx) >= Math.Abs(dy) ? (float)dx : -(float)dy;
            bar.value = Mathf.Clamp01(bar.value + delta * step);
            Canvas.ForceUpdateCanvases();
        }

        internal static string NormalizedJson(ScrollRect scroll)
        {
            JsonObject normalized = new JsonObject();
            if (scroll == null)
            {
                normalized.Dbl("x", 0).Dbl("y", 0);
                return normalized.ToString();
            }
            Vector2 value = NormalizedValue(scroll);
            normalized.Dbl("x", value.x).Dbl("y", value.y);
            return normalized.ToString();
        }
    }
}
