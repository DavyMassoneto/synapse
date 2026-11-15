using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace SynapseUnityBridge
{
    internal static class Desktop
    {
        [StructLayout(LayoutKind.Sequential)]
        internal struct Rect
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        [StructLayout(LayoutKind.Sequential)]
        internal struct Point
        {
            public int X;
            public int Y;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct Message
        {
            public IntPtr Hwnd;
            public uint MessageId;
            public IntPtr WParam;
            public IntPtr LParam;
            public uint Time;
            public int PointX;
            public int PointY;
            public uint Private;
        }

        [UnmanagedFunctionPointer(CallingConvention.Winapi)]
        private delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);

        [UnmanagedFunctionPointer(CallingConvention.Winapi)]
        private delegate void WinEventProc(IntPtr hook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint threadId, uint eventTime);

        [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
        [DllImport("user32.dll")] private static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint processId);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetClassName(IntPtr hwnd, StringBuilder name, int maxCount);
        [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hwnd);
        [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
        [DllImport("user32.dll")] private static extern bool GetClientRect(IntPtr hwnd, out Rect rect);
        [DllImport("user32.dll")] private static extern bool ClientToScreen(IntPtr hwnd, ref Point point);
        [DllImport("user32.dll")] private static extern IntPtr GetForegroundWindow();
        [DllImport("user32.dll")] private static extern bool GetCursorPos(out Point point);
        [DllImport("user32.dll")] private static extern IntPtr SetWinEventHook(uint eventMin, uint eventMax, IntPtr module, WinEventProc callback, uint processId, uint threadId, uint flags);
        [DllImport("user32.dll")] private static extern bool UnhookWinEvent(IntPtr hook);
        [DllImport("user32.dll")] private static extern int GetMessage(out Message message, IntPtr hwnd, uint filterMin, uint filterMax);
        [DllImport("user32.dll")] private static extern bool TranslateMessage(ref Message message);
        [DllImport("user32.dll")] private static extern IntPtr DispatchMessage(ref Message message);
        [DllImport("user32.dll")] private static extern bool PostThreadMessage(uint threadId, uint message, IntPtr wParam, IntPtr lParam);
        [DllImport("kernel32.dll")] private static extern uint GetCurrentThreadId();

        private const uint EventSystemForeground = 0x0003;
        private const uint WineventOutOfContext = 0x0000;
        private const uint WmQuit = 0x0012;

        internal static IntPtr GameWindow { get; private set; }
        internal static int GamePid { get; private set; }
        internal static string WindowClass = "";

        internal static int WindowLeft;
        internal static int WindowTop;
        internal static int WindowWidth;
        internal static int WindowHeight;
        internal static int ClientLeft;
        internal static int ClientTop;
        internal static int ClientWidth;
        internal static int ClientHeight;

        private static WinEventProc hookCallback;
        private static IntPtr hookHandle;
        private static uint hookThreadId;
        private static Thread hookThread;
        private static readonly object watchGate = new object();
        private static readonly List<string> foregroundEvents = new List<string>();

        private static long foregroundEventCount;
        private static long gameForegroundEventCount;
        private static long lastForegroundHwnd;

        private static int cursorX;
        private static int cursorY;
        private static int cursorMinX;
        private static int cursorMaxX;
        private static int cursorMinY;
        private static int cursorMaxY;
        private static long cursorSamples;
        private static long cursorJumps;

        internal static void Initialize(int pid)
        {
            GamePid = pid;
            FindGameWindow();
            RefreshGeometry();
            SampleCursor(initialize: true);
        }

        internal static void FindGameWindow()
        {
            try
            {
                EnumWindowsProc callback = delegate(IntPtr hwnd, IntPtr lParam)
                {
                    uint windowPid;
                    GetWindowThreadProcessId(hwnd, out windowPid);
                    if ((int)windowPid != GamePid) return true;
                    if (!IsWindowVisible(hwnd)) return true;
                    StringBuilder name = new StringBuilder(256);
                    GetClassName(hwnd, name, name.Capacity);
                    string className = name.ToString();
                    if (GameWindow == IntPtr.Zero || (className == "UnityWndClass" && WindowClass != "UnityWndClass"))
                    {
                        GameWindow = hwnd;
                        WindowClass = className;
                    }
                    return true;
                };
                EnumWindows(callback, IntPtr.Zero);
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("DESKTOP_FIND_FAIL", exception);
            }
        }

        internal static void RefreshGeometry()
        {
            try
            {
                if (GameWindow != IntPtr.Zero)
                {
                    Rect window;
                    if (GetWindowRect(GameWindow, out window))
                    {
                        WindowLeft = window.Left;
                        WindowTop = window.Top;
                        WindowWidth = window.Right - window.Left;
                        WindowHeight = window.Bottom - window.Top;
                    }
                    Rect client;
                    if (GetClientRect(GameWindow, out client))
                    {
                        Point origin = new Point();
                        origin.X = 0;
                        origin.Y = 0;
                        if (ClientToScreen(GameWindow, ref origin))
                        {
                            ClientLeft = origin.X;
                            ClientTop = origin.Y;
                        }
                        ClientWidth = client.Right - client.Left;
                        ClientHeight = client.Bottom - client.Top;
                    }
                }
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("DESKTOP_GEOMETRY_FAIL", exception);
            }
        }

        internal static int CursorX { get { return cursorX; } }
        internal static int CursorY { get { return cursorY; } }

        internal static void SampleCursorValue()
        {
            SampleCursor(false);
        }

        internal static void SampleCursor(bool initialize)
        {
            Point point;
            if (!GetCursorPos(out point)) return;
            cursorX = point.X;
            cursorY = point.Y;
            if (initialize || cursorSamples == 0)
            {
                cursorMinX = point.X;
                cursorMaxX = point.X;
                cursorMinY = point.Y;
                cursorMaxY = point.Y;
            }
            else
            {
                if (point.X < cursorMinX) cursorMinX = point.X;
                if (point.X > cursorMaxX) cursorMaxX = point.X;
                if (point.Y < cursorMinY) cursorMinY = point.Y;
                if (point.Y > cursorMaxY) cursorMaxY = point.Y;
            }
            cursorSamples++;
        }

        internal static void StartForegroundWatch()
        {
            if (hookThread != null) return;
            hookThread = new Thread(HookLoop);
            hookThread.IsBackground = true;
            hookThread.Name = "synapse-foreground-watch";
            hookThread.Start();
        }

        private static void HookLoop()
        {
            try
            {
                hookThreadId = GetCurrentThreadId();
                hookCallback = OnForegroundEvent;
                hookHandle = SetWinEventHook(EventSystemForeground, EventSystemForeground, IntPtr.Zero, hookCallback, 0, 0, WineventOutOfContext);
                BridgeLog.Write("FOREGROUND_HOOK hook=" + hookHandle.ToInt64());
                Message message;
                while (GetMessage(out message, IntPtr.Zero, 0, 0) > 0)
                {
                    TranslateMessage(ref message);
                    DispatchMessage(ref message);
                }
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("HOOK_FAIL", exception);
            }
            BridgeLog.Write("FOREGROUND_HOOK_STOP");
        }

        private static void OnForegroundEvent(IntPtr hook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint threadId, uint eventTime)
        {
            Interlocked.Increment(ref foregroundEventCount);
            lastForegroundHwnd = hwnd.ToInt64();
            if (hwnd == GameWindow) Interlocked.Increment(ref gameForegroundEventCount);
            lock (watchGate)
            {
                if (foregroundEvents.Count >= 16) foregroundEvents.RemoveAt(0);
                foregroundEvents.Add(DateTime.UtcNow.ToString("HH:mm:ss.fff") + ":" + hwnd.ToInt64());
            }
        }

        internal static void StopForegroundWatch()
        {
            try
            {
                if (hookHandle != IntPtr.Zero)
                {
                    UnhookWinEvent(hookHandle);
                    hookHandle = IntPtr.Zero;
                }
                if (hookThreadId != 0) PostThreadMessage(hookThreadId, WmQuit, IntPtr.Zero, IntPtr.Zero);
                if (hookThread != null && hookThread.IsAlive) hookThread.Join(500);
            }
            catch (Exception exception)
            {
                BridgeLog.WriteException("HOOK_STOP_FAIL", exception);
            }
        }

        internal static long ForegroundWindowValue()
        {
            return GetForegroundWindow().ToInt64();
        }

        internal static bool GameIsForeground()
        {
            return GameWindow != IntPtr.Zero && GetForegroundWindow() == GameWindow;
        }

        internal static string SnapshotJson()
        {
            JsonObject snapshot = new JsonObject();
            snapshot.Num("foreground", GetForegroundWindow().ToInt64());
            snapshot.Num("game_window", GameWindow.ToInt64());
            snapshot.Bool("game_is_foreground", GetForegroundWindow() == GameWindow);
            Point cursor;
            GetCursorPos(out cursor);
            JsonObject cursorJson = new JsonObject();
            cursorJson.Num("x", cursor.X).Num("y", cursor.Y);
            snapshot.Raw("cursor", cursorJson.ToString());
            JsonObject watch = new JsonObject();
            watch.Num("foreground_events", Interlocked.Read(ref foregroundEventCount));
            watch.Num("game_foreground_events", Interlocked.Read(ref gameForegroundEventCount));
            lock (watchGate)
            {
                StringBuilder ring = new StringBuilder("[");
                for (int index = 0; index < foregroundEvents.Count; index++)
                {
                    if (index > 0) ring.Append(',');
                    ring.Append(JsonObject.Quote(foregroundEvents[index]));
                }
                ring.Append(']');
                watch.Raw("recent", ring.ToString());
            }
            snapshot.Raw("watch", watch.ToString());
            return snapshot.ToString();
        }

        internal static string CursorWatchJson()
        {
            JsonObject cursor = new JsonObject();
            cursor.Num("samples", Interlocked.Read(ref cursorSamples));
            cursor.Num("x", cursorX).Num("y", cursorY);
            cursor.Num("min_x", cursorMinX).Num("max_x", cursorMaxX);
            cursor.Num("min_y", cursorMinY).Num("max_y", cursorMaxY);
            cursor.Num("range_x", cursorMaxX - cursorMinX);
            cursor.Num("range_y", cursorMaxY - cursorMinY);
            return cursor.ToString();
        }

        internal static void RecordCursorJump(int previousX, int previousY, int currentX, int currentY)
        {
            int distanceX = currentX - previousX;
            int distanceY = currentY - previousY;
            if (distanceX * distanceX + distanceY * distanceY > 250000) Interlocked.Increment(ref cursorJumps);
        }

        internal static string GeometryJson()
        {
            JsonObject geometry = new JsonObject();
            JsonObject window = new JsonObject();
            window.Num("x", WindowLeft).Num("y", WindowTop).Num("w", WindowWidth).Num("h", WindowHeight);
            JsonObject client = new JsonObject();
            client.Num("x", ClientLeft).Num("y", ClientTop).Num("w", ClientWidth).Num("h", ClientHeight);
            geometry.Raw("window", window.ToString());
            geometry.Raw("client", client.ToString());
            geometry.Num("caption_offset", ClientTop - WindowTop);
            geometry.Str("window_class", WindowClass);
            geometry.Num("hwnd", GameWindow.ToInt64());
            return geometry.ToString();
        }
    }
}
