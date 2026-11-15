using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
    /// <summary>
    /// Sonda minima de injeção. Nao toca em UnityEngine: apenas prova que o assembly
    /// carregou no processo do jogo e que a thread remota executa codigo gerenciado.
    /// Usada como primeiro passo (antes de criar GameObject/listener) para reduzir risco.
    /// </summary>
    public static class Probe
    {
        public static void Run()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                sb.AppendLine("PROBE_ENTER utc=" + DateTime.UtcNow.ToString("o"));
                sb.AppendLine("pid=" + System.Diagnostics.Process.GetCurrentProcess().Id);
                sb.AppendLine("appdomain=" + AppDomain.CurrentDomain.FriendlyName);
                sb.AppendLine("clr_version=" + Environment.Version);
                sb.AppendLine("os=" + Environment.OSVersion);
                sb.AppendLine("arch=" + (IntPtr.Size == 8 ? "x64" : "x86"));
                sb.AppendLine("cwd=" + Environment.CurrentDirectory);
                sb.AppendLine("mono=" + DescribeMono());
                sb.AppendLine("managed_thread_id=" + Thread.CurrentThread.ManagedThreadId);
                sb.AppendLine("thread_apartment=" + Thread.CurrentThread.GetApartmentState());
                Assembly[] assemblies = AppDomain.CurrentDomain.GetAssemblies();
                sb.AppendLine("assembly_count=" + assemblies.Length);
                for (int i = 0; i < assemblies.Length && i < 40; i++)
                {
                    sb.AppendLine("asm[" + i + "]=" + assemblies[i].GetName().Name + " " + assemblies[i].GetName().Version);
                }
                string dir = Environment.GetEnvironmentVariable("SYNAPSE_BRIDGE_DIR");
                if (dir == null || dir.Length == 0) dir = @"C:\Users\Administrator\research\unity-bridge";
                string logDir = Path.Combine(dir, "logs");
                Directory.CreateDirectory(logDir);
                File.WriteAllText(Path.Combine(logDir, "probe.log"), sb.ToString(), new UTF8Encoding(false));
            }
            catch (Exception exception)
            {
                try
                {
                    File.WriteAllText(@"C:\Users\Administrator\research\unity-bridge\logs\probe-error.log", exception.ToString());
                }
                catch
                {
                }
            }
        }

        private static string DescribeMono()
        {
            try
            {
                Type monoRuntime = Type.GetType("Mono.Runtime");
                if (monoRuntime == null) return "not-mono";
                MethodInfo displayName = monoRuntime.GetMethod("GetDisplayName", BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public);
                if (displayName == null) return "mono-unknown";
                return Convert.ToString(displayName.Invoke(null, null));
            }
            catch (Exception exception)
            {
                return "mono-detect-failed: " + exception.GetType().Name;
            }
        }
    }
}
