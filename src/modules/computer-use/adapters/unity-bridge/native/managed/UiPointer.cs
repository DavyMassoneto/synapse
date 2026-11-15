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
    internal static class UiPointer
    {
        internal static string Hit(double clientX, double clientY)
        {
            Vector2 screen = UiGeometry.ClientToScreen(clientX, clientY);
            List<RaycastResult> results = UiGeometry.Raycast(screen);
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Raw("point", UiJson.PointJson(clientX, clientY, screen).ToString());
            response.Num("hits", results.Count);
            StringBuilder list = new StringBuilder("[");
            for (int index = 0; index < results.Count && index < 8; index++)
            {
                RaycastResult result = results[index];
                if (index > 0) list.Append(',');
                JsonObject hit = new JsonObject();
                hit.Str("path", UiPaths.BuildPath(result.gameObject.transform));
                hit.Str("type", result.gameObject.GetType().Name);
                hit.Bool("has_click_handler", ExecuteEvents.GetEventHandler<IPointerClickHandler>(result.gameObject) != null);
                hit.Bool("has_scroll_handler", ExecuteEvents.GetEventHandler<IScrollHandler>(result.gameObject) != null);
                hit.Bool("has_scroll_rect", UiScroll.FindScrollRect(result.gameObject.transform) != null || UiScroll.FindScrollRectAtPoint(screen) != null);
                hit.Bool("has_scrollbar", UiScroll.FindScrollbar(result.gameObject.transform) != null || UiScroll.FindScrollbarAtPoint(screen) != null);
                hit.Bool("has_drag_handler", ExecuteEvents.GetEventHandler<IDragHandler>(result.gameObject) != null);
                hit.Dbl("depth", result.depth);
                list.Append(hit.ToString());
            }
            list.Append(']');
            response.Raw("hit_list", list.ToString());
            response.Bool("event_system", EventSystem.current != null);
            return response.ToString();
        }

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
                if (generation != Commands.Generation)
                {
                    JsonObject stale = new JsonObject();
                    stale.Str("status", "refused");
                    stale.Str("reason", "stale-id");
                    stale.Num("current_generation", Commands.Generation);
                    stale.Num("request_generation", generation);
                    return stale.ToString();
                }
                List<UiEntry> entries = UiTree.CollectSelectables(false);
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
            }
            else if (labelMatch != null && labelMatch.Length > 0)
            {
                List<UiEntry> entries = UiTree.CollectSelectables(false);
                UiEntry match = UiLookup.FindByLabel(entries, labelMatch);
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

            Vector2 screen = UiGeometry.ClientToScreen(clientX, clientY);
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
                refused.Raw("point", UiJson.PointJson(clientX, clientY, screen).ToString());
                refused.Num("raycast_hits", raycastHits);
                return refused.ToString();
            }

            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("route", route);
            response.Str("effect", "unverifiable");
            response.Raw("point", UiJson.PointJson(clientX, clientY, screen).ToString());
            response.Num("raycast_hits", raycastHits);
            JsonObject target = new JsonObject();
            target.Str("id", UiPaths.MakeId(UiPaths.BuildPath(handler.transform), handler.GetInstanceID()));
            target.Str("path", UiPaths.BuildPath(handler.transform));
            target.Str("type", handler.GetType().Name);
            target.Str("label", UiPaths.FindLabel(handler));
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
            Commands.BumpGeneration("click");
            return response.ToString();
        }

        internal static bool ClickCore(Vector2 screen, bool sendHover, out GameObject handler, out string route, out int raycastHits,
            out bool hasToggle, out bool toggleBefore)
        {
            handler = null;
            route = null;
            hasToggle = false;
            toggleBefore = false;
            List<RaycastResult> results = UiGeometry.Raycast(screen);
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
                UiEntry geometric = UiLookup.FindByPoint(UiTree.CollectSelectables(false), screen);
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
            UiGeometry.SetPointerPress(pointer, handler);

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

        internal static string Drag(double fromX, double fromY, double toX, double toY, int steps)
        {
            Vector2 fromScreen = UiGeometry.ClientToScreen(fromX, fromY);
            Vector2 toScreen = UiGeometry.ClientToScreen(toX, toY);
            List<RaycastResult> results = UiGeometry.Raycast(fromScreen);
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
                UiEntry geometric = UiLookup.FindByPoint(UiTree.CollectSelectables(false), fromScreen);
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
                refused.Raw("point", UiJson.PointJson(fromX, fromY, fromScreen).ToString());
                refused.Num("raycast_hits", results.Count);
                return refused.ToString();
            }
            if (steps < 1) steps = 1;
            if (steps > 32) steps = 32;

            ScrollRect scroll = UiScroll.FindScrollRect(dragHandler.transform);
            string before = UiScroll.NormalizedJson(scroll);

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
            UiGeometry.SetPointerPress(pointer, pressTarget);

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

            string after = UiScroll.NormalizedJson(scroll);

            JsonObject response = new JsonObject();
            response.Str("status", "dispatched");
            response.Str("route", route);
            response.Str("effect", "unverifiable");
            response.Raw("from", UiJson.PointJson(fromX, fromY, fromScreen).ToString());
            response.Raw("to", UiJson.PointJson(toX, toY, toScreen).ToString());
            response.Num("steps", steps);
            JsonObject target = new JsonObject();
            target.Str("id", UiPaths.MakeId(UiPaths.BuildPath(dragHandler.transform), dragHandler.GetInstanceID()));
            target.Str("path", UiPaths.BuildPath(dragHandler.transform));
            target.Str("type", dragHandler.GetType().Name);
            response.Raw("target", target.ToString());
            response.Str("press_path", UiPaths.BuildPath(pressTarget.transform));
            if (scroll != null)
            {
                JsonObject scrollJson = new JsonObject();
                scrollJson.Str("path", UiPaths.BuildPath(scroll.transform));
                scrollJson.Raw("normalized_before", before);
                scrollJson.Raw("normalized_after", after);
                response.Raw("scroll_rect", scrollJson.ToString());
            }
            response.Str("hint", "drag nao prova efeito visual.");
            Commands.BumpGeneration("drag");
            return response.ToString();
        }
    }
}
