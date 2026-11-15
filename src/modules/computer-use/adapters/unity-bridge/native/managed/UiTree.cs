using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace SynapseUnityBridge
{
    internal static class UiTree
    {
        internal static string Tree(int maxItems, bool includeOffscreen, bool includeTexts, int maxTexts)
        {
            List<UiEntry> entries = CollectSelectables(includeOffscreen);
            SortEntries(entries);
            List<UiTextEntry> texts = includeTexts ? CollectTexts(entries, includeOffscreen, maxTexts) : null;
            return UiTreeJson.Render(entries, texts, includeTexts, maxItems);
        }

        internal static List<UiEntry> CollectSelectables(bool includeOffscreen)
        {
            List<UiEntry> entries = new List<UiEntry>();
            GameObject selected = UiGeometry.SelectedGameObject();
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
                if (!UiGeometry.TryGetScreenRect(rect, out minimum, out maximum)) continue;
                if (!includeOffscreen && !UiGeometry.IntersectsScreen(minimum, maximum)) continue;
                UiEntry entry = new UiEntry();
                entry.Selectable = selectable;
                entry.Path = UiPaths.BuildPath(selectable.transform);
                entry.Id = UiPaths.MakeId(entry.Path, selectable.gameObject.GetInstanceID());
                entry.Label = UiPaths.FindLabelWithPath(selectable.gameObject, out entry.LabelPath);
                entry.TypeName = selectable.GetType().Name;
                entry.ScreenMin = minimum;
                entry.ScreenMax = maximum;
                entry.Area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
                entry.Depth = UiPaths.HierarchyDepth(selectable.transform);
                entry.Selected = selected == selectable.gameObject;
                try { entry.Interactable = selectable.IsInteractable(); }
                catch { entry.Interactable = false; }
                Toggle toggle = selectable as Toggle;
                entry.IsOn = toggle != null && toggle.isOn;
                entries.Add(entry);
            }
            return entries;
        }

        internal static void SortEntries(List<UiEntry> entries)
        {
            entries.Sort(delegate(UiEntry left, UiEntry right)
            {
                if (Math.Abs(left.ScreenMax.y - right.ScreenMax.y) > 1f) return right.ScreenMax.y.CompareTo(left.ScreenMax.y);
                return left.ScreenMin.x.CompareTo(right.ScreenMin.x);
            });
        }

        internal static void SortTexts(List<UiTextEntry> entries)
        {
            entries.Sort(delegate(UiTextEntry left, UiTextEntry right)
            {
                if (Math.Abs(left.ScreenMax.y - right.ScreenMax.y) > 1f) return right.ScreenMax.y.CompareTo(left.ScreenMax.y);
                return left.ScreenMin.x.CompareTo(right.ScreenMin.x);
            });
        }

        internal static List<UiTextEntry> CollectTexts(List<UiEntry> items, bool includeOffscreen, int maxTexts)
        {
            List<UiTextEntry> entries = new List<UiTextEntry>();
            HashSet<string> seen = new HashSet<string>();
            Dictionary<string, string> labelOwners = new Dictionary<string, string>();
            Dictionary<string, string> selectablePaths = new Dictionary<string, string>();
            for (int index = 0; index < items.Count; index++)
            {
                UiEntry item = items[index];
                if (item.LabelPath != null && !labelOwners.ContainsKey(item.LabelPath)) labelOwners[item.LabelPath] = item.Id;
                selectablePaths[item.Path] = item.Id;
            }

            CollectTextsOfType(typeof(Text), items, includeOffscreen, maxTexts, seen, labelOwners, selectablePaths, entries);
            Type tmp = TmpTypes.ResolveTextType();
            if (tmp != null) CollectTextsOfType(tmp, items, includeOffscreen, maxTexts, seen, labelOwners, selectablePaths, entries);
            SortTexts(entries);
            if (entries.Count > maxTexts) entries.RemoveRange(maxTexts, entries.Count - maxTexts);
            return entries;
        }

        private static void CollectTextsOfType(Type type, List<UiEntry> items, bool includeOffscreen, int maxTexts,
            HashSet<string> seen, Dictionary<string, string> labelOwners, Dictionary<string, string> selectablePaths, List<UiTextEntry> entries)
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
                string text = UiTextReflection.ReadTextValue(component);
                if (text == null || text.Trim().Length == 0) continue;
                string path = UiPaths.BuildPath(component.transform);
                if (seen.Contains(path)) continue;
                RectTransform rect = component.transform as RectTransform;
                if (rect == null) continue;
                Vector2 minimum;
                Vector2 maximum;
                if (!UiGeometry.TryGetScreenRect(rect, out minimum, out maximum)) continue;
                if (!includeOffscreen && !UiGeometry.IntersectsScreen(minimum, maximum)) continue;
                if (!IsVisible(component.gameObject)) continue;
                seen.Add(path);
                UiTextEntry entry = new UiTextEntry();
                entry.Path = path;
                entry.Id = UiPaths.MakeId(path, component.gameObject.GetInstanceID());
                entry.Text = text.Trim();
                entry.TypeName = component.GetType().Name;
                entry.ScreenMin = minimum;
                entry.ScreenMax = maximum;
                entry.Area = Math.Max(1f, (maximum.x - minimum.x) * (maximum.y - minimum.y));
                entry.Depth = UiPaths.HierarchyDepth(component.transform);
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
                if (selectablePaths.TryGetValue(UiPaths.BuildPath(current), out owner)) return owner;
                current = current.parent;
                guard++;
            }
            return null;
        }
    }
}
