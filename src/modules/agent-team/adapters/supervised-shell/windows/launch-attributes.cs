using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public sealed partial class SupervisedShellLauncher
{
    private sealed class LaunchAttributes : IDisposable
    {
        private IntPtr list;
        private IntPtr handles;
        private bool initialized;
        public StartupInfoEx Startup;

        public LaunchAttributes(NativeResources resources)
        {
            bool prepared = false;
            try
            {
                AllocateHandleList(resources);
                PrepareStartup(resources);
                prepared = true;
            }
            finally
            {
                if (!prepared)
                {
                    Dispose();
                }
            }
        }

        private void AllocateHandleList(NativeResources resources)
        {
            IntPtr bytes = IntPtr.Zero;
            InitializeProcThreadAttributeList(IntPtr.Zero, 1, 0, ref bytes);
            list = Marshal.AllocHGlobal(bytes);
            Check(InitializeProcThreadAttributeList(list, 1, 0, ref bytes));
            initialized = true;
            handles = Marshal.AllocHGlobal(IntPtr.Size * InheritedHandleCount);
            Marshal.WriteIntPtr(handles, 0, resources.InputRead);
            Marshal.WriteIntPtr(handles, IntPtr.Size, resources.OutputWrite);
            Marshal.WriteIntPtr(handles, IntPtr.Size * 2, resources.ErrorWrite);
            Check(UpdateProcThreadAttribute(list, 0, new IntPtr(HandleListAttribute), handles, new IntPtr(IntPtr.Size * InheritedHandleCount), IntPtr.Zero, IntPtr.Zero));
        }

        private void PrepareStartup(NativeResources resources)
        {
            Startup.Startup.Size = Marshal.SizeOf(typeof(StartupInfoEx));
            Startup.Startup.Flags = StartUseStdHandles;
            Startup.Startup.Input = resources.InputRead;
            Startup.Startup.Output = resources.OutputWrite;
            Startup.Startup.Error = resources.ErrorWrite;
            Startup.AttributeList = list;
        }

        public void Dispose()
        {
            List<Exception> failures = new List<Exception>();
            try
            {
                if (initialized)
                {
                    DeleteProcThreadAttributeList(list);
                    initialized = false;
                }
            }
            catch (Exception error)
            {
                failures.Add(error);
            }
            FreeCollected(list, failures);
            list = IntPtr.Zero;
            FreeCollected(handles, failures);
            handles = IntPtr.Zero;
            if (failures.Count > 0)
            {
                throw new AggregateException(failures);
            }
        }
    }
}
