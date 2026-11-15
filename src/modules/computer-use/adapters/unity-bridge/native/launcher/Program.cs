using System.Diagnostics;
using System.Globalization;
using System.Reflection.Metadata;
using System.Reflection.PortableExecutable;
using System.Runtime.InteropServices;
using System.Text;

namespace SynapseBridgeLauncher;

/// <summary>
/// Injects the managed Synapse unity bridge into a running Unity/Mono process without restarting it.
/// Loads a small native DLL (LoadLibraryA) and calls its exported SynapseInvoke, which uses the
/// Mono embedding API inside the target process. No global input APIs are used anywhere.
/// </summary>
internal static class Program
{
    private const uint ProcessAll = 0x001F0FFF;
    private const uint MemCommit = 0x1000;
    private const uint MemRelease = 0x8000;
    private const uint MemReserve = 0x2000;
    private const uint PageReadWrite = 0x04;
    private const uint Infinite = 0xFFFFFFFF;
    private const uint ListModulesAll = 0x03;

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(uint access, bool inherit, int processId);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr handle);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr VirtualAllocEx(IntPtr process, IntPtr address, UIntPtr size, uint allocationType, uint protect);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool VirtualFreeEx(IntPtr process, IntPtr address, UIntPtr size, uint freeType);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool WriteProcessMemory(IntPtr process, IntPtr address, byte[] buffer, UIntPtr size, out UIntPtr written);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool ReadProcessMemory(IntPtr process, IntPtr address, byte[] buffer, UIntPtr size, out UIntPtr read);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr CreateRemoteThread(IntPtr process, IntPtr attributes, UIntPtr stackSize, IntPtr startAddress, IntPtr parameter, uint flags, out uint threadId);

    [DllImport("kernel32.dll")]
    private static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);

    [DllImport("kernel32.dll")]
    private static extern bool GetExitCodeThread(IntPtr thread, out uint exitCode);

    [DllImport("kernel32.dll", CharSet = CharSet.Ansi, SetLastError = true)]
    private static extern IntPtr GetModuleHandleA(string name);

    [DllImport("kernel32.dll", CharSet = CharSet.Ansi, SetLastError = true)]
    private static extern IntPtr GetProcAddress(IntPtr module, string name);

    [DllImport("psapi.dll", SetLastError = true)]
    private static extern bool EnumProcessModulesEx(IntPtr process, [Out] IntPtr[] modules, int size, out int needed, uint filter);

    [DllImport("psapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern uint GetModuleFileNameEx(IntPtr process, IntPtr module, StringBuilder filename, int size);

    [DllImport("psapi.dll", SetLastError = true)]
    private static extern bool GetModuleInformation(IntPtr process, IntPtr module, out ModuleInformation info, int size);

    [StructLayout(LayoutKind.Sequential)]
    private struct ModuleInformation
    {
        public IntPtr BaseAddress;
        public uint SizeOfImage;
        public IntPtr EntryPoint;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct InvokeRequest
    {
        public IntPtr AssemblyPath;
        public IntPtr Namespace;
        public IntPtr ClassName;
        public IntPtr MethodName;
        public IntPtr LogPath;
        public int ResultCode;
        [MarshalAs(UnmanagedType.ByValArray, SizeConst = 1024)]
        public byte[] Message;
    }

    private static int Main(string[] args)
    {
        try
        {
            if (args.Length == 0) return Usage();
            string command = args[0].ToLowerInvariant();
            Dictionary<string, string> options = ParseOptions(args, 1);
            if (command == "info") return Info(options);
            if (command == "inject") return Inject(options);
            return Usage();
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine("error: " + exception);
            return 1;
        }
    }

    private static int Usage()
    {
        Console.WriteLine("synapse-bridge-launcher info --pid <pid>");
        Console.WriteLine("synapse-bridge-launcher inject --pid <pid> --assembly <managed.dll> --native <bridge_injector.dll>");
        Console.WriteLine("         [--ns SynapseUnityBridge] [--type Bootstrap] [--method Load] [--log <bridge.log>] [--keep-native] [--no-stamp]");
        Console.WriteLine("         default: gera copia do assembly com nome interno unico (Mono deduplica por identidade)");
        return 2;
    }

    private static Dictionary<string, string> ParseOptions(string[] args, int start)
    {
        Dictionary<string, string> options = new(StringComparer.OrdinalIgnoreCase);
        for (int index = start; index < args.Length; index++)
        {
            string argument = args[index];
            if (!argument.StartsWith("--", StringComparison.Ordinal)) continue;
            string key = argument[2..];
            if (index + 1 < args.Length && !args[index + 1].StartsWith("--", StringComparison.Ordinal))
            {
                options[key] = args[index + 1];
                index++;
            }
            else options[key] = "true";
        }
        return options;
    }

    private static string ResolveBridgeRoot(Dictionary<string, string> options)
    {
        if (options.TryGetValue("root", out string? explicitRoot)) return Path.GetFullPath(explicitRoot);
        string? directory = Path.GetDirectoryName(typeof(Program).Assembly.Location);
        for (int depth = 0; depth < 6 && directory != null; depth++)
        {
            if (Directory.Exists(Path.Combine(directory, "managed"))) return directory;
            directory = Path.GetDirectoryName(directory);
        }
        throw new InvalidOperationException("bridge root nao encontrado (esperado managed/ acima do launcher); use --root <dir>.");
    }

    private static void WriteRootMarker(string root)
    {
        string directory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Synapse");
        Directory.CreateDirectory(directory);
        File.WriteAllText(Path.Combine(directory, "unity-bridge-root.txt"), root);
    }

    private static int Info(Dictionary<string, string> options)
    {
        int pid = RequirePid(options);
        Process process = Process.GetProcessById(pid);
        using ProcessHandle handle = ProcessHandle.Open(pid);
        IntPtr mono = handle.FindModule("mono.dll");
        Console.WriteLine(Json(new Dictionary<string, string>
        {
            ["pid"] = pid.ToString(CultureInfo.InvariantCulture),
            ["process"] = process.ProcessName,
            ["started"] = SafeStartTime(process),
            ["mono_module"] = mono == IntPtr.Zero ? "" : "0x" + mono.ToInt64().ToString("x"),
            ["main_window"] = "0x" + process.MainWindowHandle.ToInt64().ToString("x"),
            ["module_count"] = handle.ModuleCount().ToString(CultureInfo.InvariantCulture),
        }));
        return mono == IntPtr.Zero ? 3 : 0;
    }

    private static int Inject(Dictionary<string, string> options)
    {
        int pid = RequirePid(options);
        string assembly = Require(options, "assembly");
        string native = Require(options, "native");
        string nameSpace = options.TryGetValue("ns", out string? ns) ? ns : "SynapseUnityBridge";
        string typeName = options.TryGetValue("type", out string? type) ? type : "Bootstrap";
        string methodName = options.TryGetValue("method", out string? method) ? method : "Load";
        string logPath = options.TryGetValue("log", out string? log) ? log : "";
        if (!File.Exists(assembly)) throw new FileNotFoundException("assembly not found", assembly);
        if (!File.Exists(native)) throw new FileNotFoundException("native injector not found", native);
        assembly = Path.GetFullPath(assembly);
        native = Path.GetFullPath(native);
        if (logPath.Length > 0) logPath = Path.GetFullPath(logPath);

        string assemblyName = "";
        string stampedName = "";
        string bridgeRoot = ResolveBridgeRoot(options);
        WriteRootMarker(bridgeRoot);

        if (!options.ContainsKey("no-stamp"))
        {
            assembly = StampAssembly(assembly, out assemblyName, out stampedName);
            Console.WriteLine("assembly stamped original=" + assemblyName + " unique=" + stampedName + " path=" + assembly);
        }

        Process process = Process.GetProcessById(pid);
        using ProcessHandle handle = ProcessHandle.Open(pid);
        IntPtr mono = handle.FindModule("mono.dll");
        if (mono == IntPtr.Zero) throw new InvalidOperationException("mono.dll is not loaded in pid " + pid + " (not a Mono/Unity process?)");

        Console.WriteLine("target pid=" + pid + " process=" + process.ProcessName + " mono=0x" + mono.ToInt64().ToString("x"));

        // 1. LoadLibraryA(nativeDll) in the target process.
        IntPtr nativePathRemote = handle.WriteAnsi(native);
        IntPtr loader = handle.FindModuleThread("kernel32.dll", "LoadLibraryA");
        ThreadResult loadResult = handle.RunThread(loader, nativePathRemote, 15000);
        if (!loadResult.Completed) throw new TimeoutException("LoadLibraryA did not complete: " + loadResult.Detail);
        string nativeFileName = Path.GetFileName(native);
        IntPtr nativeModule = handle.WaitForModule(nativeFileName, 3000);
        if (nativeModule == IntPtr.Zero) throw new InvalidOperationException("native DLL did not appear in module list (LoadLibrary " + loadResult.Detail + ")");
        Console.WriteLine("native module loaded at 0x" + nativeModule.ToInt64().ToString("x"));

        try
        {
            // 2. Bridge strings + request struct inside the target process.
            IntPtr assemblyRemote = handle.WriteAnsi(assembly);
            IntPtr namespaceRemote = handle.WriteAnsi(nameSpace);
            IntPtr typeRemote = handle.WriteAnsi(typeName);
            IntPtr methodRemote = handle.WriteAnsi(methodName);
            IntPtr logRemote = handle.WriteAnsi(logPath);
            InvokeRequest request = new InvokeRequest
            {
                AssemblyPath = assemblyRemote,
                Namespace = namespaceRemote,
                ClassName = typeRemote,
                MethodName = methodRemote,
                LogPath = logRemote,
                ResultCode = 0,
                Message = new byte[1024],
            };
            int requestSize = Marshal.SizeOf<InvokeRequest>();
            IntPtr requestRemote = VirtualAllocEx(handle.Handle, IntPtr.Zero, (UIntPtr)requestSize, MemCommit | MemReserve, PageReadWrite);
            if (requestRemote == IntPtr.Zero) throw new InvalidOperationException("VirtualAllocEx(request) failed: " + Marshal.GetLastWin32Error());
            byte[] requestBytes = StructToBytes(request);
            handle.Write(requestRemote, requestBytes);

            // 3. SynapseInvoke exported by the native DLL.
            uint invokeRva = PeExports.FindExportRva(native, "SynapseInvoke");
            IntPtr invokeAddress = new IntPtr(nativeModule.ToInt64() + invokeRva);
            ThreadResult invokeResult = handle.RunThread(invokeAddress, requestRemote, 20000);
            byte[] responseBytes = handle.Read(requestRemote, requestSize);
            InvokeRequest response = BytesToStruct(responseBytes);
            string message = ReadMessage(response.Message);

            Console.WriteLine(Json(new Dictionary<string, string>
            {
                ["status"] = response.ResultCode == 0 ? "ok" : "failed",
                ["result_code"] = response.ResultCode.ToString(CultureInfo.InvariantCulture),
                ["message"] = message,
                ["thread_completed"] = invokeResult.Completed ? "true" : "false",
                ["thread_detail"] = invokeResult.Detail,
                ["native_module"] = "0x" + nativeModule.ToInt64().ToString("x"),
                ["invoke_rva"] = "0x" + invokeRva.ToString("x"),
                ["assembly_name"] = assemblyName,
                ["assembly_stamped"] = stampedName,
                ["root"] = bridgeRoot,
            }));

            if (response.ResultCode != 0) return 20 + response.ResultCode;
            return invokeResult.Completed ? 0 : 30;
        }
        finally
        {
            if (!options.ContainsKey("keep-native"))
            {
                IntPtr freeLibrary = handle.FindModuleThread("kernel32.dll", "FreeLibrary");
                handle.RunThread(freeLibrary, nativeModule, 5000);
            }
        }
    }

    /// <summary>
    /// Mono deduplica assemblies pela identidade (nome+versao). Para permitir reinjecao apos stop no mesmo
    /// processo, copiamos o assembly e trocamos o nome interno por um sufixo unico mantendo o MESMO comprimento
    /// (patch in-place de bytes UTF-8 na metadata). O nome de arquivo e irrelevante para o Mono.
    /// </summary>
    private static string StampAssembly(string assembly, out string originalName, out string stampedName)
    {
        originalName = ReadAssemblyName(assembly);
        if (originalName.Length < 8) throw new InvalidOperationException("assembly name too short to stamp: " + originalName);
        byte[] original = File.ReadAllBytes(assembly);
        byte[] originalBytes = Encoding.UTF8.GetBytes(originalName);
        int occurrences = CountOccurrences(original, originalBytes);
        if (occurrences == 0) throw new InvalidDataException("assembly name not found in metadata: " + originalName);

        string suffix;
        do
        {
            suffix = Guid.NewGuid().ToString("N").Substring(0, 6);
        } while (suffix == originalName.Substring(originalName.Length - 6, 6));
        stampedName = originalName.Substring(0, originalName.Length - 6) + suffix;
        byte[] patched = (byte[])original.Clone();
        byte[] stampedBytes = Encoding.UTF8.GetBytes(stampedName);
        for (int offset = 0; offset <= patched.Length - originalBytes.Length; offset++)
        {
            bool match = true;
            for (int index = 0; index < originalBytes.Length; index++)
            {
                if (patched[offset + index] != originalBytes[index]) { match = false; break; }
            }
            if (!match) continue;
            Array.Copy(stampedBytes, 0, patched, offset, stampedBytes.Length);
        }

        string directory = Path.GetDirectoryName(Path.GetFullPath(assembly)) ?? ".";
        string output = Path.Combine(directory, Path.GetFileNameWithoutExtension(assembly) + "." + stampedName + ".dll");
        File.WriteAllBytes(output, patched);
        return output;
    }

    private static string ReadAssemblyName(string path)
    {
        using FileStream stream = File.OpenRead(path);
        using PEReader pe = new(stream);
        if (!pe.HasMetadata) throw new InvalidDataException("not a managed assembly: " + path);
        MetadataReader reader = pe.GetMetadataReader();
        AssemblyDefinition definition = reader.GetAssemblyDefinition();
        return reader.GetString(definition.Name);
    }

    private static int CountOccurrences(byte[] haystack, byte[] needle)
    {
        int count = 0;
        for (int offset = 0; offset <= haystack.Length - needle.Length; offset++)
        {
            bool match = true;
            for (int index = 0; index < needle.Length; index++)
            {
                if (haystack[offset + index] != needle[index]) { match = false; break; }
            }
            if (match) count++;
        }
        return count;
    }

    private static int RequirePid(Dictionary<string, string> options)
    {
        string text = Require(options, "pid");
        return int.Parse(text, CultureInfo.InvariantCulture);
    }

    private static string Require(Dictionary<string, string> options, string key)
    {
        if (!options.TryGetValue(key, out string? value) || string.IsNullOrEmpty(value))
            throw new ArgumentException("missing --" + key);
        return value;
    }

    private static string SafeStartTime(Process process)
    {
        try { return process.StartTime.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture); }
        catch { return ""; }
    }

    private static string Json(Dictionary<string, string> values)
    {
        StringBuilder builder = new("{");
        bool first = true;
        foreach (KeyValuePair<string, string> pair in values)
        {
            if (!first) builder.Append(',');
            first = false;
            builder.Append('"').Append(pair.Key).Append("\":\"").Append(Escape(pair.Value)).Append('"');
        }
        builder.Append('}');
        return builder.ToString();
    }

    private static string Escape(string value)
    {
        return value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "\\r").Replace("\n", "\\n");
    }

    private static byte[] StructToBytes(InvokeRequest request)
    {
        int size = Marshal.SizeOf<InvokeRequest>();
        byte[] bytes = new byte[size];
        IntPtr buffer = Marshal.AllocHGlobal(size);
        try
        {
            Marshal.StructureToPtr(request, buffer, false);
            Marshal.Copy(buffer, bytes, 0, size);
        }
        finally
        {
            Marshal.FreeHGlobal(buffer);
        }
        return bytes;
    }

    private static InvokeRequest BytesToStruct(byte[] bytes)
    {
        IntPtr buffer = Marshal.AllocHGlobal(bytes.Length);
        try
        {
            Marshal.Copy(bytes, 0, buffer, bytes.Length);
            return Marshal.PtrToStructure<InvokeRequest>(buffer);
        }
        finally
        {
            Marshal.FreeHGlobal(buffer);
        }
    }

    private static string ReadMessage(byte[] bytes)
    {
        int end = Array.IndexOf(bytes, (byte)0);
        if (end < 0) end = bytes.Length;
        return Encoding.UTF8.GetString(bytes, 0, end);
    }

    private readonly struct ThreadResult
    {
        public ThreadResult(bool completed, string detail)
        {
            Completed = completed;
            Detail = detail;
        }

        public bool Completed { get; }
        public string Detail { get; }
    }

    private sealed class ProcessHandle : IDisposable
    {
        public IntPtr Handle { get; }
        private readonly int pid;

        private ProcessHandle(IntPtr handle, int pid)
        {
            Handle = handle;
            this.pid = pid;
        }

        public static ProcessHandle Open(int pid)
        {
            IntPtr handle = OpenProcess(ProcessAll, false, pid);
            if (handle == IntPtr.Zero) throw new InvalidOperationException("OpenProcess failed: " + Marshal.GetLastWin32Error());
            return new ProcessHandle(handle, pid);
        }

        public void Dispose()
        {
            if (Handle != IntPtr.Zero) CloseHandle(Handle);
        }

        public IntPtr FindModule(string name)
        {
            foreach (ModuleEntry entry in Modules())
            {
                if (string.Equals(Path.GetFileName(entry.Path), name, StringComparison.OrdinalIgnoreCase)) return entry.BaseAddress;
            }
            return IntPtr.Zero;
        }

        public int ModuleCount()
        {
            int count = 0;
            foreach (ModuleEntry _ in Modules()) count++;
            return count;
        }

        public IntPtr WaitForModule(string fileName, int timeoutMs)
        {
            Stopwatch watch = Stopwatch.StartNew();
            while (watch.ElapsedMilliseconds < timeoutMs)
            {
                foreach (ModuleEntry entry in Modules())
                {
                    if (string.Equals(Path.GetFileName(entry.Path), fileName, StringComparison.OrdinalIgnoreCase)) return entry.BaseAddress;
                }
                Thread.Sleep(50);
            }
            return IntPtr.Zero;
        }

        public IntPtr FindModuleThread(string moduleName, string exportName)
        {
            IntPtr localModule = GetModuleHandleA(moduleName);
            if (localModule == IntPtr.Zero) throw new InvalidOperationException("local " + moduleName + " not found");
            IntPtr localExport = GetProcAddress(localModule, exportName);
            if (localExport == IntPtr.Zero) throw new InvalidOperationException("local export not found: " + exportName);
            IntPtr remoteModule = FindModule(moduleName);
            if (remoteModule == IntPtr.Zero) throw new InvalidOperationException("remote module not found: " + moduleName);
            long offset = localExport.ToInt64() - localModule.ToInt64();
            return new IntPtr(remoteModule.ToInt64() + offset);
        }

        private IEnumerable<ModuleEntry> Modules()
        {
            IntPtr[] modules = new IntPtr[1024];
            if (!EnumProcessModulesEx(Handle, modules, modules.Length * IntPtr.Size, out int needed, ListModulesAll)) yield break;
            int count = Math.Min(needed / IntPtr.Size, modules.Length);
            for (int index = 0; index < count; index++)
            {
                StringBuilder nameBuilder = new(1024);
                GetModuleFileNameEx(Handle, modules[index], nameBuilder, nameBuilder.Capacity);
                GetModuleInformation(Handle, modules[index], out ModuleInformation info, Marshal.SizeOf<ModuleInformation>());
                yield return new ModuleEntry(info.BaseAddress, nameBuilder.ToString());
            }
        }

        public IntPtr WriteAnsi(string text)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(text + "\0");
            IntPtr remote = VirtualAllocEx(Handle, IntPtr.Zero, (UIntPtr)bytes.Length, MemCommit | MemReserve, PageReadWrite);
            if (remote == IntPtr.Zero) throw new InvalidOperationException("VirtualAllocEx failed: " + Marshal.GetLastWin32Error());
            Write(remote, bytes);
            return remote;
        }

        public void Write(IntPtr remote, byte[] bytes)
        {
            if (!WriteProcessMemory(Handle, remote, bytes, (UIntPtr)bytes.Length, out _))
                throw new InvalidOperationException("WriteProcessMemory failed: " + Marshal.GetLastWin32Error());
        }

        public byte[] Read(IntPtr remote, int size)
        {
            byte[] buffer = new byte[size];
            if (!ReadProcessMemory(Handle, remote, buffer, (UIntPtr)size, out _))
                throw new InvalidOperationException("ReadProcessMemory failed: " + Marshal.GetLastWin32Error());
            return buffer;
        }

        public ThreadResult RunThread(IntPtr address, IntPtr parameter, int timeoutMs)
        {
            IntPtr thread = CreateRemoteThread(Handle, IntPtr.Zero, UIntPtr.Zero, address, parameter, 0, out uint threadId);
            if (thread == IntPtr.Zero) throw new InvalidOperationException("CreateRemoteThread failed: " + Marshal.GetLastWin32Error());
            try
            {
                uint wait = WaitForSingleObject(thread, (uint)timeoutMs);
                if (wait != 0) return new ThreadResult(false, "wait=" + wait + " tid=" + threadId);
                GetExitCodeThread(thread, out uint exitCode);
                return new ThreadResult(true, "exit=0x" + exitCode.ToString("x"));
            }
            finally
            {
                CloseHandle(thread);
            }
        }

        private readonly struct ModuleEntry
        {
            public ModuleEntry(IntPtr baseAddress, string path)
            {
                BaseAddress = baseAddress;
                Path = path;
            }

            public IntPtr BaseAddress { get; }
            public string Path { get; }
        }
    }
}

/// <summary>Reads an export RVA (not RVA+base) from a PE file on disk, matching the image loaded in the target.</summary>
internal static class PeExports
{
    public static uint FindExportRva(string path, string exportName)
    {
        byte[] data = File.ReadAllBytes(path);
        if (data[0] != 'M' || data[1] != 'Z') throw new InvalidDataException("not a PE file: " + path);
        int peOffset = BitConverter.ToInt32(data, 0x3C);
        int sectionCount = BitConverter.ToUInt16(data, peOffset + 6);
        int optionalSize = BitConverter.ToUInt16(data, peOffset + 20);
        int optionalOffset = peOffset + 24;
        ushort magic = BitConverter.ToUInt16(data, optionalOffset);
        int directoriesOffset = optionalOffset + (magic == 0x20B ? 112 : 96);
        uint exportRva = BitConverter.ToUInt32(data, directoriesOffset);
        if (exportRva == 0) throw new InvalidDataException("no export directory in " + path);

        List<(uint VirtualAddress, uint Size, uint RawPointer)> sections = new();
        int sectionOffset = optionalOffset + optionalSize;
        for (int index = 0; index < sectionCount; index++)
        {
            int baseOffset = sectionOffset + index * 40;
            uint virtualSize = BitConverter.ToUInt32(data, baseOffset + 8);
            uint virtualAddress = BitConverter.ToUInt32(data, baseOffset + 12);
            uint rawSize = BitConverter.ToUInt32(data, baseOffset + 16);
            uint rawPointer = BitConverter.ToUInt32(data, baseOffset + 20);
            sections.Add((virtualAddress, Math.Max(virtualSize, rawSize), rawPointer));
        }

        int RvaToOffset(uint rva)
        {
            foreach ((uint virtualAddress, uint size, uint rawPointer) in sections)
            {
                if (rva >= virtualAddress && rva < virtualAddress + size) return (int)(rva - virtualAddress + rawPointer);
            }
            throw new InvalidDataException("RVA not mapped: 0x" + rva.ToString("x"));
        }

        int exportOffset = RvaToOffset(exportRva);
        uint nameCount = BitConverter.ToUInt32(data, exportOffset + 24);
        uint functionsRva = BitConverter.ToUInt32(data, exportOffset + 28);
        uint namesRva = BitConverter.ToUInt32(data, exportOffset + 32);
        uint ordinalsRva = BitConverter.ToUInt32(data, exportOffset + 36);
        int namesOffset = RvaToOffset(namesRva);
        int ordinalsOffset = RvaToOffset(ordinalsRva);
        int functionsOffset = RvaToOffset(functionsRva);
        for (int index = 0; index < nameCount; index++)
        {
            uint nameRva = BitConverter.ToUInt32(data, namesOffset + index * 4);
            int nameOffset = RvaToOffset(nameRva);
            int end = nameOffset;
            while (end < data.Length && data[end] != 0) end++;
            string candidate = Encoding.ASCII.GetString(data, nameOffset, end - nameOffset);
            if (candidate != exportName) continue;
            ushort ordinal = BitConverter.ToUInt16(data, ordinalsOffset + index * 2);
            return BitConverter.ToUInt32(data, functionsOffset + ordinal * 4);
        }
        throw new InvalidDataException("export not found: " + exportName);
    }
}
