using UnityEngine;
using UnityEngine.UI;

namespace SynapseUnityBridge
{
    internal sealed class UiEntry
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

    internal sealed class UiTextEntry
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
}
