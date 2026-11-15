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
    internal static class UiEditing
    {
        internal static string Text(string value, bool submit, bool replace, double focusX, double focusY, bool hasFocus)
        {
            if (value == null) value = "";
            if (value.Length > 2000) return BridgeResponses.Refused("invalid-args", "text acima de 2000 caracteres");

            Component input = null;
            string inputType = null;
            Vector2 focusScreen = Vector2.zero;
            if (hasFocus)
            {
                focusScreen = UiGeometry.ClientToScreen(focusX, focusY);
                List<RaycastResult> results = UiGeometry.Raycast(focusScreen);
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
                    refused.Raw("point", UiJson.PointJson(focusX, focusY, focusScreen).ToString());
                    return refused.ToString();
                }
                int raycastHits;
                string route;
                GameObject handler;
                bool hasToggle;
                bool toggleBefore;
                UiPointer.ClickCore(focusScreen, false, out handler, out route, out raycastHits, out hasToggle, out toggleBefore);
                GameObject selected = UiGeometry.SelectedGameObject();
                Component selectedInput = TryFindInput(selected, out inputType);
                if (selectedInput != null) input = selectedInput;
            }
            else
            {
                GameObject selected = UiGeometry.SelectedGameObject();
                input = TryFindInput(selected, out inputType);
            }

            if (input == null) return BridgeResponses.Refused("no-focused-input", "clique em um InputField antes ou informe x/y");
            if (!IsInputEditable(input)) return BridgeResponses.Refused("input-not-editable", inputType);

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
            inputJson.Str("id", UiPaths.MakeId(UiPaths.BuildPath(input.transform), input.gameObject.GetInstanceID()));
            inputJson.Str("path", UiPaths.BuildPath(input.transform));
            inputJson.Str("type", inputType);
            response.Raw("input", inputJson.ToString());
            response.Num("text_length", next.Length);
            response.Str("value_before", Truncate(before, 160));
            response.Str("value_after", Truncate(after, 160));
            response.Bool("truncated", truncated);
            response.Bool("submitted", submitted);
            if (exception == null) Commands.BumpGeneration("text");
            return response.ToString();
        }

        private static string Truncate(string value, int max)
        {
            if (value == null) return null;
            if (value.Length <= max) return value;
            return value.Substring(0, max);
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
            Type tmp = TmpTypes.ResolveInputType();
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
            Type tmp = TmpTypes.ResolveInputType();
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
            if (!UiGeometry.TryGetScreenRect(rect, out minimum, out maximum)) return false;
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

        internal static string Key(string key)
        {
            GameObject selected = UiGeometry.SelectedGameObject();
            if (selected == null) return BridgeResponses.Refused("no-selection", "nenhum objeto selecionado internamente no EventSystem");
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

            string selectedBefore = UiJson.SelectedJson(selected);
            string selectedBeforePath = UiPaths.BuildPath(selected.transform);
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
                selected = UiGeometry.SelectedGameObject();
                route = "move";
                moved = selected != null && UiPaths.BuildPath(selected.transform) != selectedBeforePath;
            }

            GameObject selectedAfter = UiGeometry.SelectedGameObject();
            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("key", canonical);
            response.Str("route", route);
            response.Str("effect", "unverifiable");
            response.Raw("selected_before", selectedBefore);
            response.Raw("selected_after", selectedAfter != null ? UiJson.SelectedJson(selectedAfter) : "null");
            response.Bool("moved", moved);
            Commands.BumpGeneration("key");
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
            List<UiEntry> entries = UiTree.CollectSelectables(false);
            UiTree.SortEntries(entries);
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
                UiEntry entry = entries[next];
                if (!entry.Interactable) continue;
                if (entry.Selectable.gameObject == selected) continue;
                return entry.Selectable.gameObject;
            }
            return selected;
        }
    }
}
