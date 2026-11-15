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
    internal static class UiPaths
    {
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

        internal static int HierarchyDepth(Transform transform)
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

        internal static string MakeId(string path, int instanceId)
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

        internal static string ReadText(GameObject target, out string sourcePath)
        {
            sourcePath = null;
            Component[] components = target.GetComponents<Component>();
            for (int index = 0; index < components.Length; index++)
            {
                Component component = components[index];
                if (component == null) continue;
                string typeName = component.GetType().Name;
                if (typeName != "Text" && typeName != "TextMeshProUGUI") continue;
                string text = UiTextReflection.ReadTextValue(component);
                if (text != null && text.Trim().Length > 0)
                {
                    sourcePath = BuildPath(component.transform);
                    return text.Trim();
                }
            }
            return null;
        }
    }
}
