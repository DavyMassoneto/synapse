using System;
using System.IO;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private static string Quote(string argument)
    {
        if (argument.Length > 0 && argument.IndexOfAny(new char[] { ' ', '\t', '\n', '\v', '"' }) < 0) { return argument; }
        System.Text.StringBuilder value = new System.Text.StringBuilder("\"");
        int backslashes = 0;
        foreach (char character in argument)
        {
            if (character == '\\') { backslashes++; }
            else if (character == '"') { value.Append('\\', backslashes * 2 + 1); value.Append('"'); backslashes = 0; }
            else { value.Append('\\', backslashes); value.Append(character); backslashes = 0; }
        }
        value.Append('\\', backslashes * 2);
        value.Append('"');
        return value.ToString();
    }

    private static string CommandLine(string executable, string[] arguments)
    {
        System.Text.StringBuilder command = new System.Text.StringBuilder(Quote(executable));
        foreach (string argument in arguments) { command.Append(' '); command.Append(Quote(argument)); }
        return command.ToString();
    }

}
