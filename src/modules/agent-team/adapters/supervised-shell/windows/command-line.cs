using System.Text;

public sealed partial class SupervisedShellLauncher
{
    private static string Quote(string argument)
    {
        if (argument.Length > 0 && argument.IndexOfAny(ArgumentWhitespace) < 0)
        {
            return argument;
        }
        StringBuilder value = new StringBuilder();
        value.Append(ArgumentQuote);
        int backslashes = 0;
        foreach (char character in argument)
        {
            if (character == ArgumentEscape)
            {
                backslashes++;
            }
            else if (character == ArgumentQuote)
            {
                value.Append(ArgumentEscape, backslashes * 2 + 1);
                value.Append(ArgumentQuote);
                backslashes = 0;
            }
            else
            {
                value.Append(ArgumentEscape, backslashes);
                value.Append(character);
                backslashes = 0;
            }
        }
        value.Append(ArgumentEscape, backslashes * 2);
        value.Append(ArgumentQuote);
        return value.ToString();
    }

    private static string CommandLine(string executable, string[] arguments)
    {
        StringBuilder command = new StringBuilder(Quote(executable));
        foreach (string argument in arguments)
        {
            command.Append(ArgumentSeparator);
            command.Append(Quote(argument));
        }
        return command.ToString();
    }
}
