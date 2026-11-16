using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public sealed partial class SupervisedShellLauncher
{
    private static void CleanupUnassigned(ProcessInformation child)
    {
        List<Exception> failures = new List<Exception>();
        try
        {
            Check(TerminateProcess(child.Process, AssignmentFailedExit));
        }
        catch (Exception error)
        {
            failures.Add(error);
        }
        CloseCollected(child.Thread, failures);
        CloseCollected(child.Process, failures);
        if (failures.Count > 0)
        {
            throw new AggregateException(failures);
        }
    }

    private static void CleanupNativeResources(NativeResources resources, ProcessInformation child)
    {
        List<Exception> failures = new List<Exception>();
        if (resources.Job != IntPtr.Zero)
        {
            try
            {
                Check(TerminateJobObject(resources.Job, CleanupExit));
            }
            catch (Exception error)
            {
                failures.Add(error);
            }
            CloseCollected(resources.Job, failures);
        }
        CloseCollected(child.Thread, failures);
        CloseCollected(child.Process, failures);
        CloseCollected(resources.InputRead, failures);
        CloseCollected(resources.InputWrite, failures);
        CloseCollected(resources.OutputRead, failures);
        CloseCollected(resources.OutputWrite, failures);
        CloseCollected(resources.ErrorRead, failures);
        CloseCollected(resources.ErrorWrite, failures);
        FreeCollected(resources.Environment, failures);
        if (failures.Count > 0)
        {
            throw new AggregateException(failures);
        }
    }

    private static void CloseCollected(IntPtr handle, List<Exception> failures)
    {
        if (handle != IntPtr.Zero)
        {
            try
            {
                Check(CloseHandle(handle));
            }
            catch (Exception error)
            {
                failures.Add(error);
            }
        }
    }

    private static void FreeCollected(IntPtr memory, List<Exception> failures)
    {
        if (memory != IntPtr.Zero)
        {
            try
            {
                Marshal.FreeHGlobal(memory);
            }
            catch (Exception error)
            {
                failures.Add(error);
            }
        }
    }
}
