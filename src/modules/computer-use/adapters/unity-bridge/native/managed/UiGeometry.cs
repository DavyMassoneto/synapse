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
    internal static class UiGeometry
    {
        internal static bool IntersectsScreen(Vector2 minimum, Vector2 maximum)
        {
            return maximum.x > 0 && maximum.y > 0 && minimum.x < Screen.width && minimum.y < Screen.height;
        }

        internal static bool TryGetScreenRect(RectTransform rect, out Vector2 minimum, out Vector2 maximum)
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

        internal static Canvas FindCanvas(Transform start)
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

        internal static List<RaycastResult> Raycast(Vector2 screen)
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

        internal static void SetPointerPress(PointerEventData pointer, GameObject target)
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

        internal static GameObject SelectedGameObject()
        {
            if (EventSystem.current == null) return null;
            return EventSystem.current.currentSelectedGameObject;
        }
    }
}
