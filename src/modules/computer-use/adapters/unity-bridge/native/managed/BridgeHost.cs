using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;
using UnityEngine.EventSystems;

namespace SynapseUnityBridge
{
    internal static class MainThreadInfo
    {
        internal static volatile bool Captured;
        internal static volatile string UnityVersion = "";
        internal static volatile string Scene = "";
        internal static int ScreenWidth;
        internal static int ScreenHeight;
        internal static bool HasEventSystem;
        internal static bool RunInBackground;
        internal static bool GameObjectCreated;
        internal static string CreateError = "";
    }

    internal static class BridgeHost
    {
        private sealed class PendingRequest
        {
            internal string Line;
            internal string Op;
            internal string Response;
            internal bool Cancelled;
            internal bool Executed;
            internal readonly ManualResetEvent Done = new ManualResetEvent(false);
        }

        private const int ProtocolVersion = 2;

        private static readonly object QueueGate = new object();
        private static readonly Queue<PendingRequest> Queue = new Queue<PendingRequest>();
        private static TcpListener listener;
        private static Thread acceptThread;
        private static ClientRegistry clients;
        private static GameObject hostObject;
        private static bool dontDestroyApplied;
        private static bool firstTickHandled;
        private static bool runInBackgroundBeforeKnown;
        private static bool runInBackgroundBefore;
        private static long sequence;
        private static long mainThreadTicks;
        private static long startedUtcTicks;
        private static int previousCursorX;
        private static int previousCursorY;

        internal static string Instance = "";
        internal static string Token = "";
        internal static BridgeConfig Config = new BridgeConfig();
        internal static volatile bool Running;
        internal static volatile bool MainThreadStopRequested;

        internal static long Sequence { get { return Interlocked.Read(ref sequence); } }
        internal static long MainThreadTicks { get { return Interlocked.Read(ref mainThreadTicks); } }
        internal static bool IsRunning { get { return Running; } }

        internal static bool Initialize()
        {
            if (Running) return true;
            MainThreadStopRequested = false;
            Config = BridgeConfig.Load();
            Instance = Guid.NewGuid().ToString("N");
            Token = Guid.NewGuid().ToString("N");
            startedUtcTicks = DateTime.UtcNow.Ticks;
            try
            {
                Desktop.Initialize(System.Diagnostics.Process.GetCurrentProcess().Id);
                Desktop.RefreshGeometry();
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("DESKTOP_INIT_FAIL", exception);
            }
            BridgeLog.Write("HOST_INIT instance=" + Instance + " port=" + Config.Port + " pid=" + System.Diagnostics.Process.GetCurrentProcess().Id);
            return true;
        }

        internal static bool StartListener()
        {
            try
            {
                listener = new TcpListener(IPAddress.Loopback, Config.Port);
                listener.Start();
                clients = new ClientRegistry(Config.MaxConnections);
                Running = true;
                acceptThread = new Thread(AcceptLoop);
                acceptThread.IsBackground = true;
                acceptThread.Name = "synapse-bridge-accept";
                acceptThread.Start();
                BridgeLog.Write("LISTENING 127.0.0.1:" + Config.Port);
                return true;
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("LISTEN_FAIL port=" + Config.Port, exception);
                return false;
            }
        }

        internal static bool CreateGameObject()
        {
            try
            {
                runInBackgroundBeforeKnown = true;
                runInBackgroundBefore = Application.runInBackground;
                if (!runInBackgroundBefore)
                {
                    Application.runInBackground = true;
                    BridgeLog.Write("RUN_IN_BACKGROUND set true (was false)");
                }
                hostObject = new GameObject("SynapseUnityBridge");
                hostObject.AddComponent<BridgeBehaviour>();
                MainThreadInfo.GameObjectCreated = true;
                BridgeLog.Write("GAMEOBJECT_CREATED name=" + hostObject.name);
                return true;
            }
            catch (Exception exception)
            {
                MainThreadInfo.CreateError = exception.GetType().Name + ": " + exception.Message;
                BridgeLog.WriteException("GAMEOBJECT_FAIL", exception);
                return false;
            }
        }

        internal static void StartForegroundWatch()
        {
            try
            {
                Desktop.StartForegroundWatch();
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("WATCH_FAIL", exception);
            }
        }

        internal static void Pump()
        {
            long ticks = Interlocked.Increment(ref mainThreadTicks);
            try
            {
                if (!firstTickHandled)
                {
                    firstTickHandled = true;
                    CaptureMainThreadInfo();
                    if (hostObject != null && !dontDestroyApplied)
                    {
                        UnityEngine.Object.DontDestroyOnLoad(hostObject);
                        dontDestroyApplied = true;
                    }
                    WriteHandshake(MainThreadInfo.GameObjectCreated ? "listening" : "no-gameobject");
                }
                else if (ticks % 300 == 0)
                {
                    MainThreadInfo.RunInBackground = Application.runInBackground;
                    WriteHandshake(Running ? "listening" : "stopped");
                }

                if (ticks % 30 == 0)
                {
                    string scene = Commands.CurrentScene();
                    if (MainThreadInfo.Scene.Length > 0 && scene != MainThreadInfo.Scene)
                    {
                        MainThreadInfo.Scene = scene;
                        Commands.BumpGeneration("scene-change");
                    }
                }

                Harness.Tick();

                Desktop.SampleCursorValue();
                int cursorX = Desktop.CursorX;
                int cursorY = Desktop.CursorY;
                if (ticks > 1) Desktop.RecordCursorJump(previousCursorX, previousCursorY, cursorX, cursorY);
                previousCursorX = cursorX;
                previousCursorY = cursorY;

                int processed = 0;
                while (processed < 16)
                {
                    PendingRequest request;
                    lock (QueueGate)
                    {
                        if (Queue.Count == 0) break;
                        request = Queue.Dequeue();
                    }
                    bool cancelled;
                    lock (request) cancelled = request.Cancelled;
                    if (cancelled)
                    {
                        BridgeLog.Write("OP_SKIPPED_CANCELLED op=" + request.Op);
                        continue;
                    }

                    Desktop.SampleCursorValue();
                    int cursorBeforeX = Desktop.CursorX;
                    int cursorBeforeY = Desktop.CursorY;
                    long foregroundBefore = Desktop.ForegroundWindowValue();

                    string payload;
                    try
                    {
                        payload = ExecuteRequest(request.Op, request.Line);
                    }
                    catch (Exception exception)
                    {
                        BridgeLog.WriteException("OP_FAIL op=" + request.Op, exception);
                        payload = Commands.Refused("operation-exception", exception.GetType().Name + ": " + exception.Message);
                    }

                    Desktop.SampleCursorValue();
                    int cursorAfterX = Desktop.CursorX;
                    int cursorAfterY = Desktop.CursorY;
                    long foregroundAfter = Desktop.ForegroundWindowValue();
                    string decorated = Decorate(payload, request.Op, cursorBeforeX, cursorBeforeY, cursorAfterX, cursorAfterY, foregroundBefore, foregroundAfter);
                    lock (request)
                    {
                        request.Response = decorated;
                        request.Executed = true;
                    }
                    request.Done.Set();
                    processed++;

                    if (request.Op == "stop")
                    {
                        Shutdown("stop-op");
                        return;
                    }
                }

                if (MainThreadStopRequested && Running) Shutdown("static-request");
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("PUMP_FAIL", exception);
            }
        }

        private static void CaptureMainThreadInfo()
        {
            MainThreadInfo.UnityVersion = Application.unityVersion;
            MainThreadInfo.ScreenWidth = Screen.width;
            MainThreadInfo.ScreenHeight = Screen.height;
            MainThreadInfo.HasEventSystem = EventSystem.current != null;
            MainThreadInfo.RunInBackground = Application.runInBackground;
            MainThreadInfo.Scene = Commands.CurrentScene();
            MainThreadInfo.Captured = true;
            BridgeLog.Write("MAIN_THREAD_CAPTURED unity=" + MainThreadInfo.UnityVersion
                + " screen=" + MainThreadInfo.ScreenWidth + "x" + MainThreadInfo.ScreenHeight
                + " event_system=" + MainThreadInfo.HasEventSystem
                + " run_in_background=" + MainThreadInfo.RunInBackground
                + " scene=" + MainThreadInfo.Scene);
        }

        private static string ExecuteRequest(string op, string line)
        {
            Dictionary<string, string> fields = FlatJson.Parse(line);
            if (op == "state") return Commands.State();
            if (op == "tree")
            {
                int max = FlatJson.GetInt(fields, "max", Config.MaxTreeItems);
                if (max <= 0 || max > Config.MaxTreeItems) max = Config.MaxTreeItems;
                int maxTexts = FlatJson.GetInt(fields, "max_texts", Config.MaxTexts);
                if (maxTexts < 0) maxTexts = 0;
                if (maxTexts > 500) maxTexts = 500;
                return Commands.Tree(
                    max,
                    FlatJson.GetBool(fields, "include_offscreen", false),
                    FlatJson.GetBool(fields, "include_texts", true),
                    maxTexts);
            }
            if (op == "hit") return Commands.Hit(FlatJson.GetDouble(fields, "x", 0), FlatJson.GetDouble(fields, "y", 0));
            if (op == "click")
            {
                return Commands.Click(
                    FlatJson.GetDouble(fields, "x", 0),
                    FlatJson.GetDouble(fields, "y", 0),
                    FlatJson.GetString(fields, "label"),
                    FlatJson.GetBool(fields, "hover", true),
                    FlatJson.GetString(fields, "id"),
                    FlatJson.GetInt(fields, "generation", 0),
                    fields.ContainsKey("generation"));
            }
            if (op == "scroll")
            {
                string direction = FlatJson.GetString(fields, "direction");
                bool hasDelta = fields.ContainsKey("dx") || fields.ContainsKey("dy");
                if (direction != null && hasDelta)
                    return Commands.Refused("invalid-args", "envie dx/dy ou direction+amount, nao ambos");
                double dx = FlatJson.GetDouble(fields, "dx", 0);
                double dy = FlatJson.GetDouble(fields, "dy", 0);
                if (direction != null)
                {
                    double amount = FlatJson.GetDouble(fields, "amount", 1);
                    if (amount <= 0 || amount > 10)
                        return Commands.Refused("invalid-args", "amount deve estar entre 0.1 e 10");
                    string normalized = direction.Trim().ToLowerInvariant();
                    if (normalized == "up") dy = amount;
                    else if (normalized == "down") dy = -amount;
                    else if (normalized == "left") dx = -amount;
                    else if (normalized == "right") dx = amount;
                    else return Commands.Refused("invalid-args", "direction deve ser up/down/left/right");
                }
                else if (!hasDelta)
                {
                    return Commands.Refused("invalid-args", "scroll exige dx/dy ou direction+amount");
                }
                if (Math.Abs(dx) > 10 || Math.Abs(dy) > 10)
                    return Commands.Refused("invalid-args", "|dx|/|dy| acima de 10");
                return Commands.Scroll(
                    FlatJson.GetDouble(fields, "x", 0),
                    FlatJson.GetDouble(fields, "y", 0),
                    dx, dy,
                    FlatJson.GetString(fields, "label"),
                    FlatJson.GetString(fields, "id"),
                    FlatJson.GetInt(fields, "generation", 0),
                    fields.ContainsKey("generation"));
            }
            if (op == "drag")
            {
                if (!fields.ContainsKey("from_x") || !fields.ContainsKey("from_y") ||
                    !fields.ContainsKey("to_x") || !fields.ContainsKey("to_y"))
                    return Commands.Refused("invalid-args", "drag exige from_x/from_y/to_x/to_y");
                int steps = FlatJson.GetInt(fields, "steps", 8);
                if (steps < 1 || steps > 32)
                    return Commands.Refused("invalid-args", "steps deve estar entre 1 e 32");
                return Commands.Drag(
                    FlatJson.GetDouble(fields, "from_x", 0),
                    FlatJson.GetDouble(fields, "from_y", 0),
                    FlatJson.GetDouble(fields, "to_x", 0),
                    FlatJson.GetDouble(fields, "to_y", 0),
                    steps);
            }
            if (op == "text")
            {
                string text = FlatJson.GetString(fields, "text");
                if (text == null) return Commands.Refused("invalid-args", "campo text ausente");
                return Commands.Text(
                    text,
                    FlatJson.GetBool(fields, "submit", false),
                    FlatJson.GetBool(fields, "replace", true),
                    FlatJson.GetDouble(fields, "x", 0),
                    FlatJson.GetDouble(fields, "y", 0),
                    fields.ContainsKey("x") && fields.ContainsKey("y"));
            }
            if (op == "key")
            {
                string key = FlatJson.GetString(fields, "key");
                if (key == null) return Commands.Refused("invalid-args", "campo key ausente");
                return Commands.Key(key);
            }
            if (op == "selftest") return Commands.SelfTest();
            if (op == "harness") return Harness.Show(FlatJson.GetBool(fields, "block", false));
            if (op == "harness-clear") return Harness.Clear();
            if (op == "stop")
            {
                JsonObject response = new JsonObject();
                response.Str("status", "stopping");
                response.Str("reason", "client-request");
                return response.ToString();
            }
            return Commands.Refused("unknown-op", op);
        }

        internal static string Decorate(string payload, string op, int cursorBeforeX, int cursorBeforeY, int cursorAfterX, int cursorAfterY, long foregroundBefore, long foregroundAfter)
        {
            if (payload == null || payload.Length == 0 || payload[0] != '{') return payload;
            JsonObject envelope = new JsonObject();
            envelope.Num("seq", Interlocked.Increment(ref sequence));
            envelope.Num("pid", System.Diagnostics.Process.GetCurrentProcess().Id);
            envelope.Str("instance", Instance);
            envelope.Str("op", op);
            envelope.Num("main_thread_ticks", MainThreadTicks);
            envelope.Raw("desktop", Desktop.SnapshotJson());
            JsonObject actionDesktop = new JsonObject();
            JsonObject before = new JsonObject();
            before.Num("x", cursorBeforeX).Num("y", cursorBeforeY);
            JsonObject after = new JsonObject();
            after.Num("x", cursorAfterX).Num("y", cursorAfterY);
            actionDesktop.Raw("cursor_before", before.ToString());
            actionDesktop.Raw("cursor_after", after.ToString());
            actionDesktop.Bool("cursor_moved", cursorBeforeX != cursorAfterX || cursorBeforeY != cursorAfterY);
            actionDesktop.Num("foreground_before", foregroundBefore);
            actionDesktop.Num("foreground_after", foregroundAfter);
            actionDesktop.Bool("foreground_changed", foregroundBefore != foregroundAfter);
            actionDesktop.Bool("game_foreground_before", foregroundBefore == Desktop.GameWindow.ToInt64());
            actionDesktop.Bool("game_foreground_after", foregroundAfter == Desktop.GameWindow.ToInt64());
            envelope.Raw("action_desktop", actionDesktop.ToString());
            envelope.Raw("cursor_watch", Desktop.CursorWatchJson());
            envelope.Num("generation", Commands.Generation);
            string prefix = envelope.ToString();
            return prefix.Substring(0, prefix.Length - 1) + "," + payload.Substring(1);
        }

        internal static string PingJson()
        {
            JsonObject response = new JsonObject();
            response.Str("status", "ok");
            response.Num("protocol", ProtocolVersion);
            response.Num("pid", System.Diagnostics.Process.GetCurrentProcess().Id);
            response.Str("instance", Instance);
            response.Num("seq", Interlocked.Increment(ref sequence));
            response.Num("main_thread_ticks", MainThreadTicks);
            response.Bool("main_thread_captured", MainThreadInfo.Captured);
            response.Bool("gameobject_created", MainThreadInfo.GameObjectCreated);
            response.Str("create_error", MainThreadInfo.CreateError);
            response.Str("state", Running ? "listening" : "stopped");
            response.Str("unity_version", MainThreadInfo.UnityVersion);
            response.Str("scene", MainThreadInfo.Scene);
            response.Bool("event_system", MainThreadInfo.HasEventSystem);
            response.Bool("run_in_background", MainThreadInfo.RunInBackground);
            JsonObject screen = new JsonObject();
            screen.Num("width", MainThreadInfo.ScreenWidth).Num("height", MainThreadInfo.ScreenHeight);
            response.Raw("screen", screen.ToString());
            int pending;
            lock (QueueGate) pending = Queue.Count;
            JsonObject queue = new JsonObject();
            queue.Num("pending", pending).Num("max", Config.MaxQueue);
            response.Raw("queue", queue.ToString());
            response.Raw("geometry", GeometrySnapshot());
            response.Raw("desktop", Desktop.SnapshotJson());
            response.Raw("cursor_watch", Desktop.CursorWatchJson());
            response.Raw("capabilities", CapabilitiesJson().ToString());
            response.Str("log", BridgePaths.BridgeLogPath);
            response.Num("uptime_ms", (long)(TimeSpan.FromTicks(DateTime.UtcNow.Ticks - startedUtcTicks).TotalMilliseconds));
            response.Num("generation", Commands.Generation);
            return response.ToString();
        }

        internal static JsonObject CapabilitiesJson()
        {
            JsonObject capabilities = new JsonObject();
            capabilities.Bool("tree", true).Bool("hit", true).Bool("click", true);
            capabilities.Bool("scroll", true).Bool("drag", true).Bool("text", true).Bool("key", true);
            capabilities.Bool("ids", true).Bool("texts", true).Bool("generation", true);
            return capabilities;
        }

        internal static string GeometrySnapshot()
        {
            Desktop.RefreshGeometry();
            return Desktop.GeometryJson();
        }

        internal static void WriteHandshake(string state)
        {
            try
            {
                Directory.CreateDirectory(BridgePaths.RunDir);
                JsonObject handshake = new JsonObject();
                handshake.Num("protocol", ProtocolVersion);
                handshake.Str("state", state);
                handshake.Num("pid", System.Diagnostics.Process.GetCurrentProcess().Id);
                try
                {
                    System.Diagnostics.Process process = System.Diagnostics.Process.GetCurrentProcess();
                    handshake.Str("process_name", process.ProcessName + ".exe");
                    handshake.Str("process_start_utc", process.StartTime.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture));
                }
                catch
                {
                }
                handshake.Str("instance", Instance);
                handshake.Str("token", Token);
                handshake.Num("port", Config.Port);
                handshake.Str("endpoint", "tcp://127.0.0.1:" + Config.Port);
                handshake.Str("started_utc", new DateTime(startedUtcTicks, DateTimeKind.Utc).ToString("o", CultureInfo.InvariantCulture));
                handshake.Num("main_thread_ticks", MainThreadTicks);
                handshake.Bool("main_thread_captured", MainThreadInfo.Captured);
                handshake.Bool("gameobject_created", MainThreadInfo.GameObjectCreated);
                handshake.Str("create_error", MainThreadInfo.CreateError);
                handshake.Str("unity_version", MainThreadInfo.UnityVersion);
                handshake.Str("scene", MainThreadInfo.Scene);
                JsonObject screen = new JsonObject();
                screen.Num("width", MainThreadInfo.ScreenWidth).Num("height", MainThreadInfo.ScreenHeight);
                handshake.Raw("unity_screen", screen.ToString());
                handshake.Bool("event_system", MainThreadInfo.HasEventSystem);
                handshake.Bool("run_in_background", MainThreadInfo.RunInBackground);
                handshake.Bool("run_in_background_before_known", runInBackgroundBeforeKnown);
                handshake.Bool("run_in_background_before", runInBackgroundBefore);
                handshake.Raw("geometry", Desktop.GeometryJson());
                handshake.Raw("capabilities", CapabilitiesJson().ToString());
                handshake.Num("generation", Commands.Generation);
                handshake.Str("bridge_log", BridgePaths.BridgeLogPath);
                handshake.Raw("desktop", Desktop.SnapshotJson());
                string json = handshake.ToString();
                File.WriteAllText(BridgePaths.HandshakeTempPath, json, new UTF8Encoding(false));
                if (File.Exists(BridgePaths.HandshakePath)) File.Delete(BridgePaths.HandshakePath);
                File.Move(BridgePaths.HandshakeTempPath, BridgePaths.HandshakePath);
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("HANDSHAKE_FAIL", exception);
            }
        }

        private static void WriteStopped(string reason)
        {
            try
            {
                JsonObject stopped = new JsonObject();
                stopped.Num("protocol", ProtocolVersion);
                stopped.Str("state", "stopped");
                stopped.Str("reason", reason);
                stopped.Str("instance", Instance);
                stopped.Num("pid", System.Diagnostics.Process.GetCurrentProcess().Id);
                stopped.Str("stopped_utc", DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture));
                stopped.Num("main_thread_ticks", MainThreadTicks);
                stopped.Str("log", BridgePaths.BridgeLogPath);
                Directory.CreateDirectory(BridgePaths.RunDir);
                File.WriteAllText(BridgePaths.StoppedPath, stopped.ToString(), new UTF8Encoding(false));
            }
            catch
            {
            }
        }

        internal static void RequestMainThreadStop()
        {
            MainThreadStopRequested = true;
        }

        internal static void Shutdown(string reason)
        {
            if (!Running && !MainThreadInfo.GameObjectCreated) return;
            Running = false;
            BridgeLog.Write("SHUTDOWN reason=" + reason);
            try
            {
                if (listener != null) listener.Stop();
            }
            catch
            {
            }
            FailPendingRequests("bridge-stopped");
            if (clients != null) clients.CloseAll(1000);
            try
            {
                if (acceptThread != null) acceptThread.Join(500);
            }
            catch
            {
            }
            try
            {
                Desktop.StopForegroundWatch();
            }
            catch
            {
            }
            try
            {
                if (hostObject != null) UnityEngine.Object.Destroy(hostObject);
                hostObject = null;
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("DESTROY_FAIL", exception);
            }
            try
            {
                if (runInBackgroundBeforeKnown) Application.runInBackground = runInBackgroundBefore;
            }
            catch
            {
            }
            MainThreadInfo.GameObjectCreated = false;
            firstTickHandled = false;
            WriteStopped(reason);
            WriteHandshake("stopped");
        }

        private static void AcceptLoop()
        {
            while (Running)
            {
                TcpClient client;
                try
                {
                    client = listener.AcceptTcpClient();
                }
                catch
                {
                    return;
                }
                if (!Running)
                {
                    client.Close();
                    return;
                }
                ClientSession session = new ClientSession(client, Config.ReadTimeoutMs, clients.Remove);
                if (clients == null || !clients.TryAdd(session))
                {
                    session.Close();
                    BridgeLog.Write("CONNECTION_REJECTED max=" + Config.MaxConnections);
                    continue;
                }
                try
                {
                    session.Start();
                }
                catch (Exception exception)
                {
                    clients.Remove(session);
                    session.Close();
                    BridgeLog.WriteException("CLIENT_START_FAIL", exception);
                }
            }
        }

        private static void FailPendingRequests(string reason)
        {
            PendingRequest[] pending;
            lock (QueueGate)
            {
                pending = Queue.ToArray();
                Queue.Clear();
            }
            for (int index = 0; index < pending.Length; index++)
            {
                PendingRequest request = pending[index];
                lock (request)
                {
                    if (request.Executed) continue;
                    request.Cancelled = true;
                    request.Response = ErrorJson(reason, "bridge stopped before execution");
                }
                request.Done.Set();
            }
        }

        internal static string HandleLine(string line)
        {
            if (line == null) return ErrorJson("empty", null);
            if (line.Length > ClientSession.MaxRequestBytes) return ErrorJson("request-too-large", null);
            Dictionary<string, string> fields = FlatJson.Parse(line);
            string op = FlatJson.GetString(fields, "op");
            if (op == null) return ErrorJson("missing-op", null);

            if (op == "hello")
            {
                JsonObject hello = new JsonObject();
                hello.Str("status", "ok");
                hello.Num("protocol", ProtocolVersion);
                hello.Num("pid", System.Diagnostics.Process.GetCurrentProcess().Id);
                hello.Str("instance", Instance);
                hello.Bool("running", Running);
                return hello.ToString();
            }

            string token = FlatJson.GetString(fields, "token");
            if (token == null || token != Token) return ErrorJson("bad-token", "missing or invalid token");

            if (op == "ping") return PingJson();

            PendingRequest request = new PendingRequest();
            request.Line = line;
            request.Op = op;
            lock (QueueGate)
            {
                if (Queue.Count >= Config.MaxQueue) return ErrorJson("queue-full", "bridge busy; nothing was dispatched");
                Queue.Enqueue(request);
            }

            int timeout = Config.RequestTimeoutMs;
            if (!request.Done.WaitOne(timeout))
            {
                lock (request) request.Cancelled = true;
                JsonObject timeoutResponse = new JsonObject();
                timeoutResponse.Str("status", "outcome-unknown");
                timeoutResponse.Str("reason", "main-thread-timeout");
                timeoutResponse.Num("waited_ms", timeout);
                timeoutResponse.Bool("executed", false);
                timeoutResponse.Str("instance", Instance);
                BridgeLog.Write("OP_TIMEOUT op=" + op + " waited_ms=" + timeout);
                return timeoutResponse.ToString();
            }
            string responseText;
            lock (request) responseText = request.Response;
            return responseText != null ? responseText : ErrorJson("empty-response", null);
        }

        internal static string ErrorJson(string reason, string detail)
        {
            JsonObject response = new JsonObject();
            response.Str("status", "error");
            response.Str("reason", reason);
            if (detail != null) response.Str("detail", detail);
            response.Str("instance", Instance);
            return response.ToString();
        }
    }
}
