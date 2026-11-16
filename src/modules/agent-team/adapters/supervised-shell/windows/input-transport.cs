using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;

public sealed partial class SupervisedShellLauncher
{
    private sealed class InputTransport
    {
        private readonly IntPtr handle;
        private readonly string input;

        public InputTransport(IntPtr inputHandle, string text)
        {
            handle = inputHandle;
            input = text;
        }

        public void Run()
        {
            using (FileStream stream = new FileStream(new SafeFileHandle(handle, true), FileAccess.Write))
            {
                byte[] bytes = Encoding.UTF8.GetBytes(input);
                stream.Write(bytes, 0, bytes.Length);
            }
        }

        public static void Observe(Task input)
        {
            try
            {
                input.GetAwaiter().GetResult();
            }
            catch (IOException)
            {
            }
        }
    }
}
