using System;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace SynapseUnityBridge
{
    internal static class Harness
    {
        private static GameObject root;
        private static float deadline;

        internal static string Show(bool blockRaycast)
        {
            Clear();
            root = new GameObject("SynapseHarness", typeof(RectTransform));
            Canvas canvas = root.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 30000;
            root.AddComponent<GraphicRaycaster>();

            GameObject panel = new GameObject("Panel", typeof(RectTransform));
            panel.transform.SetParent(root.transform, false);
            RectTransform panelRect = panel.GetComponent<RectTransform>();
            panelRect.anchorMin = new Vector2(0.5f, 0.5f);
            panelRect.anchorMax = new Vector2(0.5f, 0.5f);
            panelRect.pivot = new Vector2(0.5f, 0.5f);
            panelRect.sizeDelta = new Vector2(520f, 360f);
            Image panelImage = panel.AddComponent<Image>();
            panelImage.color = new Color(0.05f, 0.06f, 0.08f, 1f);

            GameObject title = new GameObject("Title", typeof(RectTransform));
            title.transform.SetParent(panel.transform, false);
            RectTransform titleRect = title.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0f, 1f);
            titleRect.anchorMax = new Vector2(1f, 1f);
            titleRect.pivot = new Vector2(0.5f, 1f);
            titleRect.anchoredPosition = new Vector2(0f, -12f);
            titleRect.sizeDelta = new Vector2(0f, 30f);
            Text titleText = title.AddComponent<Text>();
            titleText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            titleText.fontSize = 18;
            titleText.alignment = TextAnchor.MiddleCenter;
            titleText.color = Color.white;
            titleText.text = "SYNAPSE HARNESS - SCROLL/DRAG";

            GameObject viewport = new GameObject("Viewport", typeof(RectTransform));
            viewport.transform.SetParent(panel.transform, false);
            RectTransform viewportRect = viewport.GetComponent<RectTransform>();
            viewportRect.anchorMin = new Vector2(0.5f, 0.5f);
            viewportRect.anchorMax = new Vector2(0.5f, 0.5f);
            viewportRect.pivot = new Vector2(0.5f, 0.5f);
            viewportRect.sizeDelta = new Vector2(460f, 260f);
            viewportRect.anchoredPosition = new Vector2(0f, -18f);
            Image viewportImage = viewport.AddComponent<Image>();
            viewportImage.color = new Color(0.12f, 0.13f, 0.16f, 1f);
            viewportImage.raycastTarget = !blockRaycast;
            Mask mask = viewport.AddComponent<Mask>();
            mask.showMaskGraphic = true;

            GameObject content = new GameObject("Content", typeof(RectTransform));
            content.transform.SetParent(viewport.transform, false);
            RectTransform contentRect = content.GetComponent<RectTransform>();
            contentRect.anchorMin = new Vector2(0f, 1f);
            contentRect.anchorMax = new Vector2(1f, 1f);
            contentRect.pivot = new Vector2(0.5f, 1f);
            contentRect.anchoredPosition = Vector2.zero;
            contentRect.sizeDelta = new Vector2(0f, 720f);

            for (int row = 1; row <= 20; row++)
            {
                GameObject rowObject = new GameObject("Row" + row.ToString("00"), typeof(RectTransform));
                rowObject.transform.SetParent(content.transform, false);
                RectTransform rowRect = rowObject.GetComponent<RectTransform>();
                rowRect.anchorMin = new Vector2(0f, 1f);
                rowRect.anchorMax = new Vector2(1f, 1f);
                rowRect.pivot = new Vector2(0.5f, 1f);
                rowRect.anchoredPosition = new Vector2(0f, -((row - 1) * 36f));
                rowRect.sizeDelta = new Vector2(0f, 36f);
                Text rowText = rowObject.AddComponent<Text>();
                rowText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
                rowText.fontSize = 20;
                rowText.alignment = TextAnchor.MiddleLeft;
                rowText.color = Color.white;
                rowText.raycastTarget = !blockRaycast;
                rowText.text = "SYNAPSE ROW " + row.ToString("00");
            }

            ScrollRect scroll = viewport.AddComponent<ScrollRect>();
            scroll.content = contentRect;
            scroll.viewport = viewportRect;
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;
            scroll.scrollSensitivity = 20f;
            scroll.verticalNormalizedPosition = 1f;

            Vector2 centerScreen = RectTransformUtility.WorldToScreenPoint(null, viewportRect.position);
            Vector2 centerClient = Commands.ScreenToClient(centerScreen);
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Dbl("center_client_x", centerClient.x);
            response.Dbl("center_client_y", centerClient.y);
            response.Str("path", "SynapseHarness/Panel/Viewport");
            response.Bool("blocked", blockRaycast);
            response.Num("generation", Commands.Generation);
            deadline = Time.realtimeSinceStartup + 30f;
            return response.ToString();
        }

        internal static string Clear()
        {
            if (root != null)
            {
                UnityEngine.Object.Destroy(root);
                root = null;
            }
            deadline = 0f;
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Str("detail", "harness removed");
            return response.ToString();
        }

        internal static void Tick()
        {
            if (root == null) return;
            if (deadline > 0f && Time.realtimeSinceStartup > deadline) Clear();
        }
    }
}
