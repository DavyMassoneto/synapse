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
    /// <summary>
    /// Operacoes UGUI executadas exclusivamente na thread principal do jogo (Update).
    /// Nenhuma delas chama API de entrada global do Windows.
    /// </summary>
    internal static class Commands
    {
        internal sealed class Entry
        {
            internal Selectable Selectable;
            internal string Path;
            internal string Id;
            internal string Label;
            internal string LabelPath;
            internal string TypeName;
            internal bool Interactable;
            internal bool IsOn;
            internal bool Selected;
            internal Vector2 ScreenMin;
            internal Vector2 ScreenMax;
            internal float Area;
            internal int Depth;
        }

        internal sealed class TextEntry
        {
            internal string Path;
            internal string Id;
            internal string Text;
            internal string SelectableId;
            internal string TypeName;
            internal Vector2 ScreenMin;
            internal Vector2 ScreenMax;
            internal float Area;
            internal int Depth;
        }

        internal static int Generation = 1;

        private static Type tmpTextType;
        private static Type tmpInputType;
        private static bool tmpTypesSearched;

        internal static void BumpGeneration(string reason)
        {
            Generation++;
            if (Generation < 0) Generation = 1;
            if (reason != null) BridgeLog.Write("GENERATION " + Generation + " reason=" + reason);
        }

        // ---------------------------------------------------------------- tree

        internal static string Tree(int maxItems, bool includeOffscreen, bool includeTexts, int maxTexts)
        {
            List<Entry> entries = CollectSelectables(includeOffscreen);
            SortEntries(entries);
            GameObject selected = SelectedGameObject();

            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Num("protocol", 2);
            response.Num("count", entries.Count);
            response.Num("returned", Math.Min(entries.Count, maxItems));
            response.Raw("screen", ScreenJson().ToString());
            response.Raw("geometry", BridgeHost.GeometrySnapshot());
            response.Bool("event_system", EventSystem.current != null);
            response.Str("selected_id", selected != null ? MakeId(BuildPath(selected.transform), selected.GetInstanceID()) : null);

            StringBuilder items = new StringBuilder("[");
            int returned = 0;
            for (int index = 0; index < entries.Count && returned < maxItems; index++)
            {
                Entry entry = entries[index];
                if (returned > 0) items.Append(',');
                items.Append(EntryJson(entry).ToString());
                returned++;
            }
            items.Append(']');
            response.Raw("items", items.ToString());

            if (includeTexts)
            {
                List<TextEntry> texts = CollectTexts(entries, includeOffscreen, maxTexts);
                StringBuilder textJson = new StringBuilder("[");
                for (int index = 0; index < texts.Count; index++)
                {
                    if (index > 0) textJson.Append(',');
                    textJson.Append(TextEntryJson(texts[index]).ToString());
                }
                textJson.Append(']');
                response.Raw("texts", textJson.ToString());
                response.Num("text_count", texts.Count);
            }

            return response.ToString();
        }

        internal static List<Entry> CollectSelectables(bool includeOffscreen)
        {
            List<Entry> entries = new List<Entry>();
            GameObject selected = SelectedGameObject();
            UnityEngine.Object[] found = UnityEngine.Object.FindObjectsOfType(typeof(Selectable));
            for (int index = 0; index < found.Length; index++)
            {
                Selectable selectable = found[index] as Selectable;
                if (selectable == null) continue;
                if (!selectable.gameObject.activeInHierarchy) continue;
                RectTransform rect = selectable.transform as RectTransform;
                if (rect == null) continue;
                Vector2 minimum;
                Vector2 maximum;
                if (!TryGetScreenRect(rect, out minimum, out maximum)) continue;
                if (!includeOffscreen && !IntersectsScreen(minimum, maximum)) continue;
                Entry entry = new Entry();
                entry.Selectable = selectable;
                entry.Path = BuildPath(selectable.transform);
                entry.Id = MakeId(entry.Path, selectable.gameObject.GetInstanceID());
                entry.Label = FindLabelWithPath(selectable.gameObject, out entry.LabelPath);
                entry.TypeName = selectable.GetType().Name;
                entry.ScreenMin = minimum;
                entry.ScreenMax = maximum;
                entry.Area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
                entry.Depth = HierarchyDepth(selectable.transform);
                entry.Selected = selected == selectable.gameObject;
                try { entry.Interactable = selectable.IsInteractable(); }
                catch { entry.Interactable = false; }
                Toggle toggle = selectable as Toggle;
                entry.IsOn = toggle != null && toggle.isOn;
                entries.Add(entry);
            }
            return entries;
        }

        private static void SortEntries(List<Entry> entries)
        {
            entries.Sort(delegate(Entry left, Entry right)
            {
                if (Math.Abs(left.ScreenMax.y - right.ScreenMax.y) > 1f) return right.ScreenMax.y.CompareTo(left.ScreenMax.y);
                return left.ScreenMin.x.CompareTo(right.ScreenMin.x);
            });
        }

        private static void SortTexts(List<TextEntry> entries)
        {
            entries.Sort(delegate(TextEntry left, TextEntry right)
            {
                if (Math.Abs(left.ScreenMax.y - right.ScreenMax.y) > 1f) return right.ScreenMax.y.CompareTo(left.ScreenMax.y);
                return left.ScreenMin.x.CompareTo(right.ScreenMin.x);
            });
        }

        internal static List<TextEntry> CollectTexts(List<Entry> items, bool includeOffscreen, int maxTexts)
        {
            List<TextEntry> entries = new List<TextEntry>();
            HashSet<string> seen = new HashSet<string>();
            Dictionary<string, string> labelOwners = new Dictionary<string, string>();
            Dictionary<string, string> selectablePaths = new Dictionary<string, string>();
            for (int index = 0; index < items.Count; index++)
            {
                Entry item = items[index];
                if (item.LabelPath != null && !labelOwners.ContainsKey(item.LabelPath)) labelOwners[item.LabelPath] = item.Id;
                selectablePaths[item.Path] = item.Id;
            }

            CollectTextsOfType(typeof(Text), items, includeOffscreen, maxTexts, seen, labelOwners, selectablePaths, entries);
            Type tmp = ResolveTmpTextType();
            if (tmp != null) CollectTextsOfType(tmp, items, includeOffscreen, maxTexts, seen, labelOwners, selectablePaths, entries);
            SortTexts(entries);
            if (entries.Count > maxTexts) entries.RemoveRange(maxTexts, entries.Count - maxTexts);
            return entries;
        }

        private static void CollectTextsOfType(Type type, List<Entry> items, bool includeOffscreen, int maxTexts,
            HashSet<string> seen, Dictionary<string, string> labelOwners, Dictionary<string, string> selectablePaths, List<TextEntry> entries)
        {
            UnityEngine.Object[] found;
            try { found = UnityEngine.Object.FindObjectsOfType(type); }
            catch { return; }
            for (int index = 0; index < found.Length && entries.Count < maxTexts + 32; index++)
            {
                Component component = found[index] as Component;
                if (component == null) continue;
                if (!component.gameObject.activeInHierarchy) continue;
                Behaviour behaviour = component as Behaviour;
                if (behaviour != null && !behaviour.enabled) continue;
                string text = ReadTextValue(component);
                if (text == null || text.Trim().Length == 0) continue;
                string path = BuildPath(component.transform);
                if (seen.Contains(path)) continue;
                RectTransform rect = component.transform as RectTransform;
                if (rect == null) continue;
                Vector2 minimum;
                Vector2 maximum;
                if (!TryGetScreenRect(rect, out minimum, out maximum)) continue;
                if (!includeOffscreen && !IntersectsScreen(minimum, maximum)) continue;
                if (!IsVisible(component.gameObject)) continue;
                seen.Add(path);
                TextEntry entry = new TextEntry();
                entry.Path = path;
                entry.Id = MakeId(path, component.gameObject.GetInstanceID());
                entry.Text = text.Trim();
                entry.TypeName = component.GetType().Name;
                entry.ScreenMin = minimum;
                entry.ScreenMax = maximum;
                entry.Area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
                entry.Depth = HierarchyDepth(component.transform);
                string owner;
                if (labelOwners.TryGetValue(path, out owner)) entry.SelectableId = owner;
                else entry.SelectableId = FindAncestorSelectableId(component.transform, selectablePaths);
                entries.Add(entry);
            }
        }

        private static bool IsVisible(GameObject target)
        {
            try
            {
                CanvasRenderer renderer = target.GetComponent<CanvasRenderer>();
                if (renderer != null && renderer.GetAlpha() <= 0.01f) return false;
            }
            catch
            {
            }
            try
            {
                Component[] components = target.GetComponents<Component>();
                for (int index = 0; index < components.Length; index++)
                {
                    Component component = components[index];
                    if (component == null) continue;
                    PropertyInfo colorProperty = component.GetType().GetProperty("color");
                    if (colorProperty == null) continue;
                    object value = colorProperty.GetValue(component, null);
                    if (value is Color && ((Color)value).a <= 0.01f) return false;
                }
            }
            catch
            {
            }
            return true;
        }

        private static string FindAncestorSelectableId(Transform start, Dictionary<string, string> selectablePaths)
        {
            Transform current = start;
            int guard = 0;
            while (current != null && guard < 6)
            {
                string owner;
                if (selectablePaths.TryGetValue(BuildPath(current), out owner)) return owner;
                current = current.parent;
                guard++;
            }
            return null;
        }

        private static Type ResolveTmpTextType()
        {
            ResolveTmpTypes();
            return tmpTextType;
        }

        private static Type ResolveTmpInputType()
        {
            ResolveTmpTypes();
            return tmpInputType;
        }

        private static void ResolveTmpTypes()
        {
            if (tmpTypesSearched) return;
            tmpTypesSearched = true;
            try
            {
                Assembly[] assemblies = AppDomain.CurrentDomain.GetAssemblies();
                for (int index = 0; index < assemblies.Length; index++)
                {
                    try
                    {
                        Type text = assemblies[index].GetType("TMPro.TextMeshProUGUI", false);
                        if (text != null && tmpTextType == null) tmpTextType = text;
                        Type input = assemblies[index].GetType("TMPro.TMP_InputField", false);
                        if (input != null && tmpInputType == null) tmpInputType = input;
                    }
                    catch
                    {
                    }
                }
            }
            catch
            {
            }
        }

        private static string ReadTextValue(Component component)
        {
            try
            {
                PropertyInfo property = component.GetType().GetProperty("text");
                if (property == null) return null;
                return property.GetValue(component, null) as string;
            }
            catch
            {
                return null;
            }
        }

        // ---------------------------------------------------------------- hit

        internal static string Hit(double clientX, double clientY)
        {
            Vector2 screen = ClientToScreen(clientX, clientY);
            List<RaycastResult> results = Raycast(screen);
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Raw("point", PointJson(clientX, clientY, screen).ToString());
            response.Num("hits", results.Count);
            StringBuilder list = new StringBuilder("[");
            for (int index = 0; index < results.Count && index < 8; index++)
            {
                RaycastResult result = results[index];
                if (index > 0) list.Append(',');
                JsonObject hit = new JsonObject();
                hit.Str("path", BuildPath(result.gameObject.transform));
                hit.Str("type", result.gameObject.GetType().Name);
                hit.Bool("has_click_handler", ExecuteEvents.GetEventHandler<IPointerClickHandler>(result.gameObject) != null);
                hit.Bool("has_scroll_handler", ExecuteEvents.GetEventHandler<IScrollHandler>(result.gameObject) != null);
                hit.Bool("has_scroll_rect", FindScrollRect(result.gameObject.transform) != null || FindScrollRectAtPoint(screen) != null);
                hit.Bool("has_scrollbar", FindScrollbar(result.gameObject.transform) != null || FindScrollbarAtPoint(screen) != null);
                hit.Bool("has_drag_handler", ExecuteEvents.GetEventHandler<IDragHandler>(result.gameObject) != null);
                hit.Dbl("depth", result.depth);
                list.Append(hit.ToString());
            }
            list.Append(']');
            response.Raw("hit_list", list.ToString());
            response.Bool("event_system", EventSystem.current != null);
            return response.ToString();
        }

        // ---------------------------------------------------------------- click

        internal static string Click(double clientX, double clientY, string labelMatch, bool sendHover,
            string id, int generation, bool hasGeneration)
        {
            if (id != null && id.Length > 0)
            {
                if (!hasGeneration)
                {
                    JsonObject missing = new JsonObject();
                    missing.Str("status", "refused");
                    missing.Str("reason", "missing-generation");
                    missing.Str("detail", "click por id exige o campo generation do tree");
                    return missing.ToString();
                }
                if (generation != Generation)
                {
                    JsonObject stale = new JsonObject();
                    stale.Str("status", "refused");
                    stale.Str("reason", "stale-id");
                    stale.Num("current_generation", Generation);
                    stale.Num("request_generation", generation);
                    return stale.ToString();
                }
                List<Entry> entries = CollectSelectables(false);
                Entry match = FindById(entries, id);
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
            }
            else if (labelMatch != null && labelMatch.Length > 0)
            {
                List<Entry> entries = CollectSelectables(false);
                Entry match = FindByLabel(entries, labelMatch);
                if (match == null)
                {
                    JsonObject refused = new JsonObject();
                    refused.Str("status", "refused");
                    refused.Str("reason", "label-not-found");
                    refused.Str("label", labelMatch);
                    return refused.ToString();
                }
                clientX = (match.ScreenMin.x + match.ScreenMax.x) / 2.0 / Screen.width * Desktop.ClientWidth;
                clientY = (Screen.height - (match.ScreenMin.y + match.ScreenMax.y) / 2.0) / Screen.height * Desktop.ClientHeight;
            }

            Vector2 screen = ClientToScreen(clientX, clientY);
            int raycastHits;
            string route;
            GameObject handler;
            bool hasToggle;
            bool toggleBefore;
            bool clicked = ClickCore(screen, sendHover, out handler, out route, out raycastHits, out hasToggle, out toggleBefore);
            if (!clicked)
            {
                JsonObject refused = new JsonObject();
                refused.Str("status", "refused");
                refused.Str("reason", raycastHits == 0 ? "no-raycast-hit" : "no-click-handler");
                refused.Raw("point", PointJson(clientX, clientY, screen).ToString());
                refused.Num("raycast_hits", raycastHits);
                return refused.ToString();
            }

            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("route", route);
            response.Str("effect", "unverifiable");
            response.Raw("point", PointJson(clientX, clientY, screen).ToString());
            response.Num("raycast_hits", raycastHits);
            JsonObject target = new JsonObject();
            target.Str("id", MakeId(BuildPath(handler.transform), handler.GetInstanceID()));
            target.Str("path", BuildPath(handler.transform));
            target.Str("type", handler.GetType().Name);
            target.Str("label", FindLabel(handler));
            Toggle handlerToggle = handler.GetComponent<Toggle>();
            if (handlerToggle != null)
            {
                target.Bool("is_toggle", true);
                target.Bool("is_on_before", toggleBefore);
                target.Bool("is_on_after", handlerToggle.isOn);
            }
            else
            {
                target.Bool("is_toggle", false);
            }
            response.Raw("target", target.ToString());
            response.Str("hint", "A entrega nao prova efeito visual. Leia o estado (tree/OCR) antes de repetir o clique.");
            BumpGeneration("click");
            return response.ToString();
        }

        private static bool ClickCore(Vector2 screen, bool sendHover, out GameObject handler, out string route, out int raycastHits,
            out bool hasToggle, out bool toggleBefore)
        {
            handler = null;
            route = null;
            hasToggle = false;
            toggleBefore = false;
            List<RaycastResult> results = Raycast(screen);
            raycastHits = results.Count;
            RaycastResult chosen = default(RaycastResult);
            for (int index = 0; index < results.Count; index++)
            {
                GameObject candidate = ExecuteEvents.GetEventHandler<IPointerClickHandler>(results[index].gameObject);
                if (candidate != null)
                {
                    handler = candidate;
                    route = "raycast";
                    chosen = results[index];
                    break;
                }
            }

            if (handler == null)
            {
                Entry geometric = FindByPoint(CollectSelectables(false), screen);
                if (geometric != null)
                {
                    handler = ExecuteEvents.GetEventHandler<IPointerClickHandler>(geometric.Selectable.gameObject);
                    if (handler != null) route = "geometry";
                }
            }
            if (handler == null) return false;

            Toggle toggle = handler.GetComponent<Toggle>();
            hasToggle = toggle != null;
            toggleBefore = toggle != null && toggle.isOn;

            PointerEventData pointer = new PointerEventData(EventSystem.current);
            pointer.position = screen;
            pointer.delta = Vector2.zero;
            pointer.pressPosition = screen;
            pointer.clickCount = 1;
            pointer.clickTime = Time.unscaledTime;
            pointer.eligibleForClick = true;
            pointer.button = PointerEventData.InputButton.Left;
            pointer.pointerId = -1;
            pointer.pointerPressRaycast = chosen;
            pointer.pointerCurrentRaycast = chosen;
            pointer.rawPointerPress = handler;
            SetPointerPress(pointer, handler);

            if (EventSystem.current != null && handler.GetComponent<Selectable>() != null)
            {
                EventSystem.current.SetSelectedGameObject(handler, pointer);
            }

            if (sendHover)
            {
                pointer.pointerEnter = handler;
                ExecuteEvents.Execute(handler, pointer, ExecuteEvents.pointerEnterHandler);
            }
            ExecuteEvents.Execute(handler, pointer, ExecuteEvents.pointerDownHandler);
            ExecuteEvents.Execute(handler, pointer, ExecuteEvents.pointerUpHandler);
            GameObject clickHandler = ExecuteEvents.GetEventHandler<IPointerClickHandler>(handler);
            if (clickHandler != null)
            {
                ExecuteEvents.Execute(clickHandler, pointer, ExecuteEvents.pointerClickHandler);
            }
            pointer.eligibleForClick = false;
            pointer.pointerPress = null;
            pointer.rawPointerPress = null;
            if (sendHover)
            {
                ExecuteEvents.Execute(handler, pointer, ExecuteEvents.pointerExitHandler);
            }
            return true;
        }

        // ---------------------------------------------------------------- scroll

        internal static string Scroll(double clientX, double clientY, double dx, double dy,
            string labelMatch, string id, int generation, bool hasGeneration)
        {
            List<Entry> entries = null;
            string resolvedBy = null;
            if (id != null && id.Length > 0)
            {
                if (!hasGeneration) return Refused("missing-generation", "scroll por id exige o campo generation do tree");
                if (generation != Generation)
                {
                    JsonObject stale = new JsonObject();
                    stale.Str("status", "refused");
                    stale.Str("reason", "stale-id");
                    stale.Num("current_generation", Generation);
                    stale.Num("request_generation", generation);
                    return stale.ToString();
                }
                entries = CollectSelectables(false);
                Entry match = FindById(entries, id);
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
                entries = CollectSelectables(false);
                Entry match = FindByLabel(entries, labelMatch);
                if (match == null) return Refused("label-not-found", labelMatch);
                clientX = (match.ScreenMin.x + match.ScreenMax.x) / 2.0 / Screen.width * Desktop.ClientWidth;
                clientY = (Screen.height - (match.ScreenMin.y + match.ScreenMax.y) / 2.0) / Screen.height * Desktop.ClientHeight;
                resolvedBy = "label";
            }

            Vector2 screen = ClientToScreen(clientX, clientY);
            List<RaycastResult> results = Raycast(screen);
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
                refused.Raw("point", PointJson(clientX, clientY, screen).ToString());
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
            response.Raw("point", PointJson(clientX, clientY, screen).ToString());
            JsonObject delta = new JsonObject();
            delta.Dbl("x", dx).Dbl("y", dy);
            response.Raw("scroll_delta", delta.ToString());
            Transform targetTransform = handler != null ? handler.transform : (scroll != null ? scroll.transform : bar.transform);
            GameObject targetObject = targetTransform.gameObject;
            JsonObject target = new JsonObject();
            target.Str("id", MakeId(BuildPath(targetTransform), targetObject.GetInstanceID()));
            target.Str("path", BuildPath(targetTransform));
            target.Str("type", targetObject.GetType().Name);
            response.Raw("target", target.ToString());
            if (handler != null) response.Str("handler_path", BuildPath(handler.transform));
            if (scroll != null)
            {
                JsonObject scrollJson = new JsonObject();
                scrollJson.Str("path", BuildPath(scroll.transform));
                scrollJson.Raw("normalized_before", NormalizedJsonValue(beforeValue).ToString());
                scrollJson.Raw("normalized_after", NormalizedJsonValue(afterValue).ToString());
                response.Raw("scroll_rect", scrollJson.ToString());
            }
            if (bar != null && barUsed)
            {
                JsonObject barJson = new JsonObject();
                barJson.Str("path", BuildPath(bar.transform));
                barJson.Dbl("value_before", barBefore).Dbl("value_after", barAfter);
                barJson.Dbl("size", bar.size);
                response.Raw("scrollbar", barJson.ToString());
            }
            response.Str("hint", "scroll nao prova efeito visual; verifique tree/OCR.");
            BumpGeneration("scroll");
            return response.ToString();
        }

        private static ScrollRect FindScrollRect(Transform start)
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

        private static ScrollRect FindScrollRectAtPoint(Vector2 screen)
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
                if (!TryGetScreenRect(rect, out minimum, out maximum)) continue;
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

        private static Scrollbar FindScrollbar(Transform start)
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

        private static Scrollbar FindScrollbarAtPoint(Vector2 screen)
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
                if (!TryGetScreenRect(rect, out minimum, out maximum)) continue;
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

        private static Vector2 NormalizedValue(ScrollRect scroll)
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

        private static string NormalizedJson(ScrollRect scroll)
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

        // ---------------------------------------------------------------- drag

        internal static string Drag(double fromX, double fromY, double toX, double toY, int steps)
        {
            Vector2 fromScreen = ClientToScreen(fromX, fromY);
            Vector2 toScreen = ClientToScreen(toX, toY);
            List<RaycastResult> results = Raycast(fromScreen);
            GameObject dragHandler = null;
            string route = null;
            GameObject pressTarget = null;
            RaycastResult chosen = default(RaycastResult);
            for (int index = 0; index < results.Count; index++)
            {
                GameObject candidate = ExecuteEvents.GetEventHandler<IDragHandler>(results[index].gameObject);
                if (candidate != null)
                {
                    dragHandler = candidate;
                    pressTarget = ExecuteEvents.GetEventHandler<IPointerDownHandler>(results[index].gameObject);
                    if (pressTarget == null) pressTarget = candidate;
                    chosen = results[index];
                    route = "raycast";
                    break;
                }
            }
            if (dragHandler == null)
            {
                Entry geometric = FindByPoint(CollectSelectables(false), fromScreen);
                if (geometric != null)
                {
                    dragHandler = ExecuteEvents.GetEventHandler<IDragHandler>(geometric.Selectable.gameObject);
                    if (dragHandler != null)
                    {
                        pressTarget = ExecuteEvents.GetEventHandler<IPointerDownHandler>(geometric.Selectable.gameObject);
                        if (pressTarget == null) pressTarget = dragHandler;
                        route = "geometry";
                    }
                }
            }
            if (dragHandler == null)
            {
                JsonObject refused = new JsonObject();
                refused.Str("status", "refused");
                refused.Str("reason", "no-drag-handler");
                refused.Raw("point", PointJson(fromX, fromY, fromScreen).ToString());
                refused.Num("raycast_hits", results.Count);
                return refused.ToString();
            }
            if (steps < 1) steps = 1;
            if (steps > 32) steps = 32;

            ScrollRect scroll = FindScrollRect(dragHandler.transform);
            string before = NormalizedJson(scroll);

            PointerEventData pointer = new PointerEventData(EventSystem.current);
            pointer.position = fromScreen;
            pointer.pressPosition = fromScreen;
            pointer.delta = Vector2.zero;
            pointer.button = PointerEventData.InputButton.Left;
            pointer.pointerId = -1;
            pointer.eligibleForClick = false;
            pointer.pointerPressRaycast = chosen;
            pointer.pointerCurrentRaycast = chosen;
            pointer.pointerDrag = dragHandler;
            pointer.pointerPress = pressTarget;
            pointer.rawPointerPress = pressTarget;
            SetPointerPress(pointer, pressTarget);

            ExecuteEvents.Execute(pressTarget, pointer, ExecuteEvents.pointerDownHandler);
            ExecuteEvents.Execute(pressTarget, pointer, ExecuteEvents.initializePotentialDrag);
            pointer.dragging = true;
            ExecuteEvents.Execute(dragHandler, pointer, ExecuteEvents.beginDragHandler);

            Vector2 previous = fromScreen;
            for (int step = 1; step <= steps; step++)
            {
                float t = (float)step / (float)steps;
                Vector2 current = new Vector2(
                    Mathf.Lerp(fromScreen.x, toScreen.x, t),
                    Mathf.Lerp(fromScreen.y, toScreen.y, t));
                pointer.position = current;
                pointer.delta = current - previous;
                previous = current;
                ExecuteEvents.Execute(dragHandler, pointer, ExecuteEvents.dragHandler);
            }

            pointer.position = toScreen;
            pointer.delta = toScreen - previous;
            ExecuteEvents.Execute(pressTarget, pointer, ExecuteEvents.pointerUpHandler);
            ExecuteEvents.Execute(pressTarget, pointer, ExecuteEvents.dropHandler);
            pointer.dragging = false;
            ExecuteEvents.Execute(dragHandler, pointer, ExecuteEvents.endDragHandler);
            pointer.pointerDrag = null;
            pointer.pointerPress = null;
            pointer.rawPointerPress = null;

            string after = NormalizedJson(scroll);

            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("route", route);
            response.Str("effect", "unverifiable");
            response.Raw("from", PointJson(fromX, fromY, fromScreen).ToString());
            response.Raw("to", PointJson(toX, toY, toScreen).ToString());
            response.Num("steps", steps);
            JsonObject target = new JsonObject();
            target.Str("id", MakeId(BuildPath(dragHandler.transform), dragHandler.GetInstanceID()));
            target.Str("path", BuildPath(dragHandler.transform));
            target.Str("type", dragHandler.GetType().Name);
            response.Raw("target", target.ToString());
            response.Str("press_path", BuildPath(pressTarget.transform));
            if (scroll != null)
            {
                JsonObject scrollJson = new JsonObject();
                scrollJson.Str("path", BuildPath(scroll.transform));
                scrollJson.Raw("normalized_before", before);
                scrollJson.Raw("normalized_after", after);
                response.Raw("scroll_rect", scrollJson.ToString());
            }
            response.Str("hint", "drag nao prova efeito visual.");
            BumpGeneration("drag");
            return response.ToString();
        }

        // ---------------------------------------------------------------- text

        internal static string Text(string value, bool submit, bool replace, double focusX, double focusY, bool hasFocus)
        {
            if (value == null) value = "";
            if (value.Length > 2000) return Refused("invalid-args", "text acima de 2000 caracteres");

            Component input = null;
            string inputType = null;
            Vector2 focusScreen = Vector2.zero;
            if (hasFocus)
            {
                focusScreen = ClientToScreen(focusX, focusY);
                List<RaycastResult> results = Raycast(focusScreen);
                for (int index = 0; index < results.Count && input == null; index++)
                {
                    input = TryFindInput(results[index].gameObject, out inputType);
                }
                if (input == null)
                {
                    input = FindInputAtPoint(focusScreen);
                    if (input != null) inputType = input.GetType().Name;
                }
                if (input == null)
                {
                    JsonObject refused = new JsonObject();
                    refused.Str("status", "refused");
                    refused.Str("reason", "no-input-at-point");
                    refused.Raw("point", PointJson(focusX, focusY, focusScreen).ToString());
                    return refused.ToString();
                }
                int raycastHits;
                string route;
                GameObject handler;
                bool hasToggle;
                bool toggleBefore;
                ClickCore(focusScreen, false, out handler, out route, out raycastHits, out hasToggle, out toggleBefore);
                GameObject selected = SelectedGameObject();
                Component selectedInput = TryFindInput(selected, out inputType);
                if (selectedInput != null) input = selectedInput;
            }
            else
            {
                GameObject selected = SelectedGameObject();
                input = TryFindInput(selected, out inputType);
            }

            if (input == null) return Refused("no-focused-input", "clique em um InputField antes ou informe x/y");
            if (!IsInputEditable(input)) return Refused("input-not-editable", inputType);

            string before = ReadInputText(input);
            int limit = ReadInputLimit(input);
            string next = replace ? value : (before ?? "") + value;
            bool truncated = false;
            if (limit > 0 && next.Length > limit)
            {
                next = next.Substring(0, limit);
                truncated = true;
            }

            bool submitted = false;
            string exception = null;
            try
            {
                ActivateInput(input);
                WriteInputText(input, next);
                MoveInputCaretToEnd(input);
            }
            catch (Exception error)
            {
                exception = error.GetType().Name + ": " + error.Message;
            }
            string after = ReadInputText(input);
            if (submit && exception == null)
            {
                PointerEventData pointer = new PointerEventData(EventSystem.current);
                ExecuteEvents.Execute(input.gameObject, pointer, ExecuteEvents.submitHandler);
                submitted = true;
            }

            JsonObject response = new JsonObject();
            if (exception != null)
            {
                response.Str("status", "error");
                response.Str("reason", "input-write-failed");
                response.Str("detail", exception);
            }
            else
            {
                response.Str("status", "dispatched");
                response.Str("effect", "unverifiable");
            }
            JsonObject inputJson = new JsonObject();
            inputJson.Str("id", MakeId(BuildPath(input.transform), input.gameObject.GetInstanceID()));
            inputJson.Str("path", BuildPath(input.transform));
            inputJson.Str("type", inputType);
            response.Raw("input", inputJson.ToString());
            response.Num("text_length", next.Length);
            response.Str("value_before", Truncate(before, 160));
            response.Str("value_after", Truncate(after, 160));
            response.Bool("truncated", truncated);
            response.Bool("submitted", submitted);
            if (exception == null) BumpGeneration("text");
            return response.ToString();
        }

        private static string Truncate(string value, int max)
        {
            if (value == null) return null;
            if (value.Length <= max) return value;
            return value.Substring(0, max);
        }

        private static GameObject SelectedGameObject()
        {
            if (EventSystem.current == null) return null;
            return EventSystem.current.currentSelectedGameObject;
        }

        private static Component TryFindInput(GameObject start, out string typeName)
        {
            typeName = null;
            if (start == null) return null;
            Transform current = start.transform;
            int guard = 0;
            while (current != null && guard < 4)
            {
                Component input = InputOn(current.gameObject);
                if (input != null)
                {
                    typeName = input.GetType().Name;
                    return input;
                }
                current = current.parent;
                guard++;
            }
            return null;
        }

        private static Component InputOn(GameObject target)
        {
            InputField field = target.GetComponent<InputField>();
            if (field != null) return field;
            Type tmp = ResolveTmpInputType();
            if (tmp != null)
            {
                Component component = target.GetComponent(tmp);
                if (component != null) return component;
            }
            return null;
        }

        private static Component FindInputAtPoint(Vector2 screen)
        {
            Component best = null;
            float bestArea = float.MaxValue;
            UnityEngine.Object[] found = UnityEngine.Object.FindObjectsOfType(typeof(InputField));
            for (int index = 0; index < found.Length; index++)
            {
                Component candidate = found[index] as Component;
                Component chosen;
                float area;
                if (TryMatchInput(candidate, screen, out chosen, out area) && area < bestArea)
                {
                    bestArea = area;
                    best = chosen;
                }
            }
            Type tmp = ResolveTmpInputType();
            if (tmp != null)
            {
                UnityEngine.Object[] tmpFound = UnityEngine.Object.FindObjectsOfType(tmp);
                for (int index = 0; index < tmpFound.Length; index++)
                {
                    Component candidate = tmpFound[index] as Component;
                    Component chosen;
                    float area;
                    if (TryMatchInput(candidate, screen, out chosen, out area) && area < bestArea)
                    {
                        bestArea = area;
                        best = chosen;
                    }
                }
            }
            return best;
        }

        private static bool TryMatchInput(Component candidate, Vector2 screen, out Component chosen, out float area)
        {
            chosen = null;
            area = float.MaxValue;
            if (candidate == null || !candidate.gameObject.activeInHierarchy) return false;
            RectTransform rect = candidate.transform as RectTransform;
            if (rect == null) return false;
            Vector2 minimum;
            Vector2 maximum;
            if (!TryGetScreenRect(rect, out minimum, out maximum)) return false;
            if (screen.x < minimum.x || screen.x > maximum.x || screen.y < minimum.y || screen.y > maximum.y) return false;
            chosen = candidate;
            area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
            return true;
        }

        private static bool IsInputEditable(Component input)
        {
            Selectable selectable = input as Selectable;
            if (selectable != null)
            {
                try { if (!selectable.IsInteractable()) return false; }
                catch { }
            }
            try
            {
                PropertyInfo readOnlyProperty = input.GetType().GetProperty("readOnly");
                if (readOnlyProperty != null)
                {
                    object value = readOnlyProperty.GetValue(input, null);
                    if (value is bool && (bool)value) return false;
                }
            }
            catch
            {
            }
            return true;
        }

        private static string ReadInputText(Component input)
        {
            try
            {
                PropertyInfo property = input.GetType().GetProperty("text");
                if (property == null) return null;
                return property.GetValue(input, null) as string;
            }
            catch
            {
                return null;
            }
        }

        private static int ReadInputLimit(Component input)
        {
            try
            {
                PropertyInfo property = input.GetType().GetProperty("characterLimit");
                if (property == null) return 0;
                object value = property.GetValue(input, null);
                if (value is int) return (int)value;
            }
            catch
            {
            }
            return 0;
        }

        private static void WriteInputText(Component input, string value)
        {
            PropertyInfo property = input.GetType().GetProperty("text");
            if (property == null || !property.CanWrite) throw new InvalidOperationException("input sem setter de text");
            property.SetValue(input, value, null);
        }

        private static void ActivateInput(Component input)
        {
            MethodInfo method = input.GetType().GetMethod("ActivateInputField", Type.EmptyTypes);
            if (method != null) method.Invoke(input, null);
        }

        private static void MoveInputCaretToEnd(Component input)
        {
            MethodInfo method = input.GetType().GetMethod("MoveTextEnd", new Type[] { typeof(bool) });
            if (method != null) method.Invoke(input, new object[] { true });
        }

        // ---------------------------------------------------------------- key

        internal static string Key(string key)
        {
            GameObject selected = SelectedGameObject();
            if (selected == null) return Refused("no-selection", "nenhum objeto selecionado internamente no EventSystem");
            string canonical = CanonicalKey(key);
            if (canonical == null)
            {
                JsonObject refused = new JsonObject();
                refused.Str("status", "refused");
                refused.Str("reason", "unsupported-key");
                refused.Str("key", key);
                refused.Str("detail", "aceitos: Return, Escape, Tab, Up, Down, Left, Right");
                return refused.ToString();
            }

            string selectedBefore = SelectedJson(selected);
            string selectedBeforePath = BuildPath(selected.transform);
            string route = null;
            bool moved = false;
            if (canonical == "Return")
            {
                PointerEventData pointer = new PointerEventData(EventSystem.current);
                ExecuteEvents.Execute(selected, pointer, ExecuteEvents.submitHandler);
                route = "submit";
            }
            else if (canonical == "Escape")
            {
                PointerEventData pointer = new PointerEventData(EventSystem.current);
                ExecuteEvents.Execute(selected, pointer, ExecuteEvents.cancelHandler);
                route = "cancel";
            }
            else if (canonical == "Tab")
            {
                GameObject next = NextSelectable(selected);
                if (next != null && next != selected)
                {
                    EventSystem.current.SetSelectedGameObject(next);
                    moved = true;
                }
                route = "navigation";
            }
            else
            {
                AxisEventData axis = new AxisEventData(EventSystem.current);
                Vector2 vector = Vector2.zero;
                MoveDirection direction = MoveDirection.None;
                if (canonical == "Up") { vector = Vector2.up; direction = MoveDirection.Up; }
                else if (canonical == "Down") { vector = Vector2.down; direction = MoveDirection.Down; }
                else if (canonical == "Left") { vector = Vector2.left; direction = MoveDirection.Left; }
                else if (canonical == "Right") { vector = Vector2.right; direction = MoveDirection.Right; }
                axis.moveVector = vector;
                axis.moveDir = direction;
                ExecuteEvents.Execute(selected, axis, ExecuteEvents.moveHandler);
                selected = SelectedGameObject();
                route = "move";
                moved = selected != null && BuildPath(selected.transform) != selectedBeforePath;
            }

            GameObject selectedAfter = SelectedGameObject();
            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("key", canonical);
            response.Str("route", route);
            response.Str("effect", "unverifiable");
            response.Raw("selected_before", selectedBefore);
            response.Raw("selected_after", selectedAfter != null ? SelectedJson(selectedAfter) : "null");
            response.Bool("moved", moved);
            BumpGeneration("key");
            return response.ToString();
        }

        private static string CanonicalKey(string key)
        {
            if (key == null) return null;
            string normalized = key.Trim().ToLowerInvariant();
            if (normalized == "return" || normalized == "enter") return "Return";
            if (normalized == "escape" || normalized == "esc") return "Escape";
            if (normalized == "tab") return "Tab";
            if (normalized == "up" || normalized == "arrowup") return "Up";
            if (normalized == "down" || normalized == "arrowdown") return "Down";
            if (normalized == "left" || normalized == "arrowleft") return "Left";
            if (normalized == "right" || normalized == "arrowright") return "Right";
            return null;
        }

        private static GameObject NextSelectable(GameObject selected)
        {
            List<Entry> entries = CollectSelectables(false);
            SortEntries(entries);
            if (entries.Count == 0) return null;
            int current = -1;
            for (int index = 0; index < entries.Count; index++)
            {
                if (entries[index].Selectable.gameObject == selected)
                {
                    current = index;
                    break;
                }
            }
            for (int offset = 1; offset <= entries.Count; offset++)
            {
                int next = ((current + offset) % entries.Count + entries.Count) % entries.Count;
                Entry entry = entries[next];
                if (!entry.Interactable) continue;
                if (entry.Selectable.gameObject == selected) continue;
                return entry.Selectable.gameObject;
            }
            return selected;
        }

        private static string SelectedJson(GameObject target)
        {
            JsonObject json = new JsonObject();
            string path = BuildPath(target.transform);
            json.Str("id", MakeId(path, target.GetInstanceID()));
            json.Str("path", path);
            json.Str("type", target.GetType().Name);
            return json.ToString();
        }

        // ---------------------------------------------------------------- selftest

        internal static string SelfTest()
        {
            GameObject previous = SelectedGameObject();
            GameObject root = null;
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            try
            {
                root = new GameObject("SynapseSelfTest");
                Canvas canvas = root.AddComponent<Canvas>();
                canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                canvas.sortingOrder = -1000;
                root.AddComponent<CanvasScaler>();
                root.AddComponent<GraphicRaycaster>();

                GameObject fieldObject = new GameObject("InputField");
                fieldObject.transform.SetParent(root.transform, false);
                RectTransform fieldRect = fieldObject.AddComponent<RectTransform>();
                fieldRect.sizeDelta = new Vector2(240f, 32f);
                fieldRect.anchoredPosition = new Vector2(0f, 0f);
                Image background = fieldObject.AddComponent<Image>();
                background.color = new Color(0f, 0f, 0f, 0f);
                InputField field = fieldObject.AddComponent<InputField>();
                field.targetGraphic = background;

                GameObject textObject = new GameObject("Text");
                textObject.transform.SetParent(fieldObject.transform, false);
                RectTransform textRect = textObject.AddComponent<RectTransform>();
                textRect.anchorMin = Vector2.zero;
                textRect.anchorMax = Vector2.one;
                textRect.offsetMin = Vector2.zero;
                textRect.offsetMax = Vector2.zero;
                Text text = textObject.AddComponent<Text>();
                text.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                text.color = new Color(1f, 1f, 1f, 0f);
                text.supportRichText = false;
                field.textComponent = text;
                field.characterLimit = 64;

                EventSystem.current.SetSelectedGameObject(fieldObject);
                string replaceResult = Text("synapse-harness", false, true, 0, 0, false);
                response.Bool("text_replace_ok", field.text == "synapse-harness");
                string appendResult = Text("-ok", false, false, 0, 0, false);
                response.Bool("text_append_ok", field.text == "synapse-harness-ok");

                EventSystem.current.SetSelectedGameObject(fieldObject);
                string returnResult = Key("Return");
                EventSystem.current.SetSelectedGameObject(fieldObject);
                string escapeResult = Key("Escape");
                EventSystem.current.SetSelectedGameObject(fieldObject);
                string tabResult = Key("Tab");
                EventSystem.current.SetSelectedGameObject(fieldObject);
                string downResult = Key("Down");

                response.Raw("text_replace", replaceResult);
                response.Raw("text_append", appendResult);
                response.Raw("key_return", returnResult);
                response.Raw("key_escape", escapeResult);
                response.Raw("key_tab", tabResult);
                response.Raw("key_down", downResult);
            }
            catch (Exception error)
            {
                response.Str("status", "error");
                response.Str("detail", error.GetType().Name + ": " + error.Message);
            }
            finally
            {
                if (root != null) UnityEngine.Object.Destroy(root);
                if (EventSystem.current != null)
                {
                    if (previous != null) EventSystem.current.SetSelectedGameObject(previous);
                    else EventSystem.current.SetSelectedGameObject(null);
                }
            }
            return response.ToString();
        }

        // ---------------------------------------------------------------- state

        internal static string State()
        {
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Num("protocol", 2);
            response.Raw("screen", ScreenJson().ToString());
            response.Raw("geometry", BridgeHost.GeometrySnapshot());
            response.Bool("event_system", EventSystem.current != null);
            response.Bool("run_in_background", Application.runInBackground);
            response.Dbl("time_scale", Time.timeScale);
            response.Dbl("realtime_since_startup", Time.realtimeSinceStartup);
            response.Str("unity_version", Application.unityVersion);
            response.Str("product", Application.productName);
            response.Str("scene", CurrentScene());
            GameObject selected = SelectedGameObject();
            if (selected != null)
            {
                response.Str("selected", BuildPath(selected.transform));
                response.Str("selected_id", MakeId(BuildPath(selected.transform), selected.GetInstanceID()));
            }
            response.Raw("cursor_watch", Desktop.CursorWatchJson());
            return response.ToString();
        }

        internal static string Refused(string reason, string detail)
        {
            JsonObject response = new JsonObject();
            response.Str("status", "refused");
            response.Str("reason", reason);
            if (detail != null) response.Str("detail", detail);
            return response.ToString();
        }

        // ---------------------------------------------------------------- helpers

        private static Entry FindById(List<Entry> entries, string id)
        {
            for (int index = 0; index < entries.Count; index++)
            {
                if (string.Equals(entries[index].Id, id, StringComparison.OrdinalIgnoreCase)) return entries[index];
            }
            return null;
        }

        private static Entry FindByLabel(List<Entry> entries, string label)
        {
            string wanted = Normalize(label);
            Entry exact = null;
            Entry partial = null;
            for (int index = 0; index < entries.Count; index++)
            {
                Entry entry = entries[index];
                if (entry.Label == null) continue;
                string candidate = Normalize(entry.Label);
                if (candidate == wanted && exact == null) exact = entry;
                if (partial == null && candidate.IndexOf(wanted, StringComparison.Ordinal) >= 0) partial = entry;
            }
            if (exact != null) return exact;
            return partial;
        }

        private static Entry FindByPoint(List<Entry> entries, Vector2 screen)
        {
            Entry best = null;
            for (int index = 0; index < entries.Count; index++)
            {
                Entry entry = entries[index];
                if (!entry.Interactable) continue;
                if (screen.x < entry.ScreenMin.x || screen.x > entry.ScreenMax.x) continue;
                if (screen.y < entry.ScreenMin.y || screen.y > entry.ScreenMax.y) continue;
                if (best == null || entry.Area < best.Area) best = entry;
            }
            return best;
        }

        private static string Normalize(string text)
        {
            if (text == null) return "";
            return text.Trim().ToLowerInvariant();
        }

        private static bool IntersectsScreen(Vector2 minimum, Vector2 maximum)
        {
            return maximum.x > 0 && maximum.y > 0 && minimum.x < Screen.width && minimum.y < Screen.height;
        }

        private static bool TryGetScreenRect(RectTransform rect, out Vector2 minimum, out Vector2 maximum)
        {
            minimum = Vector2.zero;
            maximum = Vector2.zero;
            Camera camera = null;
            Canvas canvas = FindCanvas(rect);
            if (canvas != null) camera = canvas.worldCamera;
            Vector3[] corners = new Vector3[4];
            rect.GetWorldCorners(corners);
            Vector2 first = RectTransformUtility.WorldToScreenPoint(camera, corners[0]);
            Vector2 opposite = RectTransformUtility.WorldToScreenPoint(camera, corners[2]);
            minimum = new Vector2(Mathf.Min(first.x, opposite.x), Mathf.Min(first.y, opposite.y));
            maximum = new Vector2(Mathf.Max(first.x, opposite.x), Mathf.Max(first.y, opposite.y));
            return maximum.x > minimum.x && maximum.y > minimum.y;
        }

        private static Canvas FindCanvas(Transform start)
        {
            Transform current = start;
            int guard = 0;
            while (current != null && guard < 32)
            {
                Canvas canvas = current.GetComponent<Canvas>();
                if (canvas != null) return canvas;
                current = current.parent;
                guard++;
            }
            return null;
        }

        private static List<RaycastResult> Raycast(Vector2 screen)
        {
            List<RaycastResult> results = new List<RaycastResult>();
            if (EventSystem.current == null) return results;
            PointerEventData pointer = new PointerEventData(EventSystem.current);
            pointer.position = screen;
            pointer.button = PointerEventData.InputButton.Left;
            pointer.pointerId = -1;
            EventSystem.current.RaycastAll(pointer, results);
            return results;
        }

        /// <summary>pointerPress has a private setter in Unity 5.3 UGUI; set it defensively.</summary>
        private static void SetPointerPress(PointerEventData pointer, GameObject target)
        {
            try
            {
                PropertyInfo property = typeof(PointerEventData).GetProperty("pointerPress", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
                if (property != null && property.CanWrite) property.SetValue(pointer, target, null);
            }
            catch
            {
            }
        }

        internal static string BuildPath(Transform transform)
        {
            List<string> names = new List<string>();
            Transform current = transform;
            int guard = 0;
            while (current != null && guard < 24)
            {
                names.Add(current.name);
                current = current.parent;
                guard++;
            }
            StringBuilder builder = new StringBuilder();
            for (int index = names.Count - 1; index >= 0; index--)
            {
                if (builder.Length > 0) builder.Append('/');
                builder.Append(names[index]);
            }
            return builder.ToString();
        }

        private static int HierarchyDepth(Transform transform)
        {
            int depth = 0;
            Transform current = transform.parent;
            while (current != null && depth < 64)
            {
                depth++;
                current = current.parent;
            }
            return depth;
        }

        private static string MakeId(string path, int instanceId)
        {
            uint hash = 2166136261u;
            for (int index = 0; index < path.Length; index++)
            {
                hash ^= path[index];
                hash *= 16777619u;
            }
            return hash.ToString("x8", CultureInfo.InvariantCulture) + "-" + (instanceId & 0xffff).ToString("x4", CultureInfo.InvariantCulture);
        }

        internal static string FindLabel(GameObject root)
        {
            string path;
            return FindLabelWithPath(root, out path);
        }

        internal static string FindLabelWithPath(GameObject root, out string sourcePath)
        {
            sourcePath = null;
            if (root == null) return null;
            string direct = ReadText(root, out sourcePath);
            if (direct != null)
            {
                if (sourcePath == null) sourcePath = BuildPath(root.transform);
                return direct;
            }
            sourcePath = null;
            string fromChildren = FindLabelInChildren(root.transform, 0, out sourcePath);
            if (fromChildren != null) return fromChildren;
            Transform parent = root.transform.parent;
            if (parent != null)
            {
                for (int index = 0; index < parent.childCount; index++)
                {
                    Transform sibling = parent.GetChild(index);
                    if (sibling == root.transform) continue;
                    string text = ReadText(sibling.gameObject, out sourcePath);
                    if (text != null) return text;
                    string nested = FindLabelInChildren(sibling, 0, out sourcePath);
                    if (nested != null) return nested;
                }
            }
            sourcePath = null;
            return null;
        }

        private static string FindLabelInChildren(Transform parent, int depth, out string sourcePath)
        {
            sourcePath = null;
            if (depth > 3) return null;
            for (int index = 0; index < parent.childCount; index++)
            {
                Transform child = parent.GetChild(index);
                string text = ReadText(child.gameObject, out sourcePath);
                if (text != null) return text;
                string nested = FindLabelInChildren(child, depth + 1, out sourcePath);
                if (nested != null) return nested;
            }
            sourcePath = null;
            return null;
        }

        private static string ReadText(GameObject target, out string sourcePath)
        {
            sourcePath = null;
            Component[] components = target.GetComponents<Component>();
            for (int index = 0; index < components.Length; index++)
            {
                Component component = components[index];
                if (component == null) continue;
                string typeName = component.GetType().Name;
                if (typeName != "Text" && typeName != "TextMeshProUGUI") continue;
                string text = ReadTextValue(component);
                if (text != null && text.Trim().Length > 0)
                {
                    sourcePath = BuildPath(component.transform);
                    return text.Trim();
                }
            }
            return null;
        }

        private static JsonObject EntryJson(Entry entry)
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
            Vector2 clientMin = ScreenToClient(entry.ScreenMin);
            Vector2 clientMax = ScreenToClient(entry.ScreenMax);
            item.Num("client_x", (long)Math.Min(clientMin.x, clientMax.x)).Num("client_y", (long)Math.Min(clientMin.y, clientMax.y));
            item.Num("client_w", (long)Math.Abs(clientMax.x - clientMin.x)).Num("client_h", (long)Math.Abs(clientMax.y - clientMin.y));
            double clientX = (entry.ScreenMin.x + entry.ScreenMax.x) / 2.0 / Screen.width * Desktop.ClientWidth;
            double clientY = (Screen.height - (entry.ScreenMin.y + entry.ScreenMax.y) / 2.0) / Screen.height * Desktop.ClientHeight;
            item.Dbl("cx", clientX).Dbl("cy", clientY);
            item.Num("depth", entry.Depth);
            return item;
        }

        private static JsonObject TextEntryJson(TextEntry entry)
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
            Vector2 clientMin = ScreenToClient(entry.ScreenMin);
            Vector2 clientMax = ScreenToClient(entry.ScreenMax);
            item.Num("client_x", (long)Math.Min(clientMin.x, clientMax.x)).Num("client_y", (long)Math.Min(clientMin.y, clientMax.y));
            item.Num("client_w", (long)Math.Abs(clientMax.x - clientMin.x)).Num("client_h", (long)Math.Abs(clientMax.y - clientMin.y));
            item.Num("depth", entry.Depth);
            return item;
        }

        private static JsonObject PointJson(double clientX, double clientY, Vector2 screen)
        {
            JsonObject point = new JsonObject();
            point.Dbl("client_x", clientX).Dbl("client_y", clientY);
            point.Dbl("screen_x", screen.x).Dbl("screen_y", screen.y);
            return point;
        }

        private static JsonObject ScreenJson()
        {
            JsonObject screen = new JsonObject();
            screen.Num("width", Screen.width).Num("height", Screen.height);
            return screen;
        }

        internal static Vector2 ClientToScreen(double clientX, double clientY)
        {
            double width = Desktop.ClientWidth > 0 ? Desktop.ClientWidth : Screen.width;
            double height = Desktop.ClientHeight > 0 ? Desktop.ClientHeight : Screen.height;
            float x = (float)(clientX / width * Screen.width);
            float y = (float)(Screen.height - clientY / height * Screen.height);
            return new Vector2(x, y);
        }

        internal static Vector2 ScreenToClient(Vector2 screen)
        {
            double width = Desktop.ClientWidth > 0 ? Desktop.ClientWidth : Screen.width;
            double height = Desktop.ClientHeight > 0 ? Desktop.ClientHeight : Screen.height;
            float x = (float)(screen.x / Screen.width * width);
            float y = (float)((Screen.height - screen.y) / Screen.height * height);
            return new Vector2(x, y);
        }

        internal static string CurrentScene()
        {
            try
            {
                return UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
            }
            catch
            {
                return "";
            }
        }
    }
}
