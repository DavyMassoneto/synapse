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
    internal static class UiTextReflection
    {
        internal static string ReadTextValue(Component component)
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
    }
}
