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
    internal static class UiDiagnostics
    {
        internal static string SelfTest()
        {
            GameObject previous = UiGeometry.SelectedGameObject();
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
                string replaceResult = UiEditing.Text("synapse-harness", false, true, 0, 0, false);
                response.Bool("text_replace_ok", field.text == "synapse-harness");
                string appendResult = UiEditing.Text("-ok", false, false, 0, 0, false);
                response.Bool("text_append_ok", field.text == "synapse-harness-ok");

                EventSystem.current.SetSelectedGameObject(fieldObject);
                string returnResult = UiEditing.Key("Return");
                EventSystem.current.SetSelectedGameObject(fieldObject);
                string escapeResult = UiEditing.Key("Escape");
                EventSystem.current.SetSelectedGameObject(fieldObject);
                string tabResult = UiEditing.Key("Tab");
                EventSystem.current.SetSelectedGameObject(fieldObject);
                string downResult = UiEditing.Key("Down");

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

        internal static string State()
        {
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Num("protocol", 2);
            response.Raw("screen", UiJson.ScreenJson().ToString());
            response.Raw("geometry", BridgeHost.GeometrySnapshot());
            response.Bool("event_system", EventSystem.current != null);
            response.Bool("run_in_background", Application.runInBackground);
            response.Dbl("time_scale", Time.timeScale);
            response.Dbl("realtime_since_startup", Time.realtimeSinceStartup);
            response.Str("unity_version", Application.unityVersion);
            response.Str("product", Application.productName);
            response.Str("scene", CurrentScene());
            GameObject selected = UiGeometry.SelectedGameObject();
            if (selected != null)
            {
                response.Str("selected", UiPaths.BuildPath(selected.transform));
                response.Str("selected_id", UiPaths.MakeId(UiPaths.BuildPath(selected.transform), selected.GetInstanceID()));
            }
            response.Raw("cursor_watch", Desktop.CursorWatchJson());
            return response.ToString();
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
