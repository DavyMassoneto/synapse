using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.IO;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private static void CleanupUnassigned(ProcessInformation child)
    {
        List<Exception> failures = new List<Exception>();
        try { Check(TerminateProcess(child.Process, AssignmentFailedExit)); }
        catch (Exception error) { failures.Add(error); }
        CloseCollected(child.Thread, failures);
        CloseCollected(child.Process, failures);
        if (failures.Count > 0) { throw new AggregateException(failures); }
    }
    private static void WriteInput(IntPtr handle, string input)
    {
        using (FileStream stream = new FileStream(new SafeFileHandle(handle, true), FileAccess.Write))
        {
            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(input);
            stream.Write(bytes, 0, bytes.Length);
        }
    }
    private static void ObserveInput(Task input)
    {
        try { input.GetAwaiter().GetResult(); }
        catch (IOException) { }
    }
    private static void CleanupNativeResources(IntPtr job, ProcessInformation child, IntPtr stdinRead, IntPtr stdinWrite, IntPtr stdoutRead, IntPtr stdoutWrite, IntPtr stderrRead, IntPtr stderrWrite, IntPtr attributes, IntPtr handles, IntPtr environment)
    {
        List<Exception> failures = new List<Exception>();
        if (job != IntPtr.Zero)
        {
            try { Check(TerminateJobObject(job, CleanupExit)); }
            catch (Exception error) { failures.Add(error); }
            CloseCollected(job, failures);
        }
        CloseCollected(child.Thread, failures);
        CloseCollected(child.Process, failures);
        CloseCollected(stdinRead, failures);
        CloseCollected(stdinWrite, failures);
        CloseCollected(stdoutRead, failures);
        CloseCollected(stdoutWrite, failures);
        CloseCollected(stderrRead, failures);
        CloseCollected(stderrWrite, failures);
        try { if (attributes != IntPtr.Zero) { DeleteProcThreadAttributeList(attributes); Marshal.FreeHGlobal(attributes); } }
        catch (Exception error) { failures.Add(error); }
        try { if (handles != IntPtr.Zero) { Marshal.FreeHGlobal(handles); } }
        catch (Exception error) { failures.Add(error); }
        try { Marshal.FreeHGlobal(environment); }
        catch (Exception error) { failures.Add(error); }
        if (failures.Count > 0) { throw new AggregateException(failures); }
    }
    private static void CloseCollected(IntPtr handle, List<Exception> failures)
    {
        if (handle != IntPtr.Zero)
        {
            try { Check(CloseHandle(handle)); }
            catch (Exception error) { failures.Add(error); }
        }
    }
}
