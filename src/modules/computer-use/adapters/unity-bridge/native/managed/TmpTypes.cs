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
    internal static class TmpTypes
    {
        private static Type textType;
        private static Type inputType;
        private static bool typesSearched;

        internal static Type ResolveTextType()
        {
            ResolveTypes();
            return textType;
        }

        internal static Type ResolveInputType()
        {
            ResolveTypes();
            return inputType;
        }

        private static void ResolveTypes()
        {
            if (typesSearched) return;
            typesSearched = true;
            try
            {
                Assembly[] assemblies = AppDomain.CurrentDomain.GetAssemblies();
                for (int index = 0; index < assemblies.Length; index++)
                {
                    try
                    {
                        Type text = assemblies[index].GetType("TMPro.TextMeshProUGUI", false);
                        if (text != null && textType == null) textType = text;
                        Type input = assemblies[index].GetType("TMPro.TMP_InputField", false);
                        if (input != null && inputType == null) inputType = input;
                    }
                    catch
                    {
                    }
                }
            }
            catch
            {
            }
        }
    }
}
