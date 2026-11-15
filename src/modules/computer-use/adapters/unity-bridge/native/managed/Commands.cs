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
    internal static class Commands
    {
        internal static int Generation = 1;

        internal static void BumpGeneration(string reason)
        {
            Generation++;
            if (Generation < 0) Generation = 1;
            if (reason != null) BridgeLog.Write("GENERATION " + Generation + " reason=" + reason);
        }

        internal static string Tree(int maxItems, bool includeOffscreen, bool includeTexts, int maxTexts)
        {
            return UiTree.Tree(maxItems, includeOffscreen, includeTexts, maxTexts);
        }

        internal static string Hit(double clientX, double clientY)
        {
            return UiPointer.Hit(clientX, clientY);
        }

        internal static string Click(double clientX, double clientY, string labelMatch, bool sendHover,
            string id, int generation, bool hasGeneration)
        {
            return UiPointer.Click(clientX, clientY, labelMatch, sendHover, id, generation, hasGeneration);
        }

        internal static string Scroll(double clientX, double clientY, double dx, double dy,
            string labelMatch, string id, int generation, bool hasGeneration)
        {
            return UiScroll.Scroll(clientX, clientY, dx, dy, labelMatch, id, generation, hasGeneration);
        }

        internal static string Drag(double fromX, double fromY, double toX, double toY, int steps)
        {
            return UiPointer.Drag(fromX, fromY, toX, toY, steps);
        }

        internal static string Text(string value, bool submit, bool replace, double focusX, double focusY, bool hasFocus)
        {
            return UiEditing.Text(value, submit, replace, focusX, focusY, hasFocus);
        }

        internal static string Key(string key)
        {
            return UiEditing.Key(key);
        }

        internal static string SelfTest()
        {
            return UiDiagnostics.SelfTest();
        }

        internal static string State()
        {
            return UiDiagnostics.State();
        }

        internal static string Refused(string reason, string detail)
        {
            return BridgeResponses.Refused(reason, detail);
        }

        internal static string CurrentScene()
        {
            return UiDiagnostics.CurrentScene();
        }

        internal static string BuildPath(Transform transform)
        {
            return UiPaths.BuildPath(transform);
        }

        internal static string FindLabel(GameObject root)
        {
            return UiPaths.FindLabel(root);
        }

        internal static Vector2 ClientToScreen(double clientX, double clientY)
        {
            return UiGeometry.ClientToScreen(clientX, clientY);
        }

        internal static Vector2 ScreenToClient(Vector2 screen)
        {
            return UiGeometry.ScreenToClient(screen);
        }
    }
}
