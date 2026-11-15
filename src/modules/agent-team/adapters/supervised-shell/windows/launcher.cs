using System;

public sealed partial class SupervisedShellLauncher
{
    public static int Run(string executable, string[] arguments, string cwd, string environment, string input)
    {
        NativeResources resources = new NativeResources(environment);
        ProcessInformation child = new ProcessInformation();
        try
        {
            resources.Open(input is string);
            child = LaunchAssigned(executable, arguments, cwd, resources);
            AssignedExecution execution = new AssignedExecution(child, resources);
            return execution.Run(input);
        }
        finally
        {
            CleanupNativeResources(resources, child);
        }
    }
}
