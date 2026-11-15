param([Parameter(Mandatory = $true)][int]$TargetPid)
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class SynapseDesktopState {
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X; public int Y; }
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT point);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int max);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, StringBuilder text, int max);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);
    [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr hwnd, out RECT rect);
    [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr hwnd, ref POINT point);
    public static string Title(IntPtr hwnd) { var sb = new StringBuilder(512); GetWindowText(hwnd, sb, sb.Capacity); return sb.ToString(); }
    public static string ClassName(IntPtr hwnd) { var sb = new StringBuilder(256); GetClassName(hwnd, sb, sb.Capacity); return sb.ToString(); }
}
'@

$process = Get-Process -Id $TargetPid -ErrorAction SilentlyContinue
if (-not $process) { throw "processo $TargetPid nao encontrado" }
$windowHandle = $process.MainWindowHandle
$foreground = [SynapseDesktopState]::GetForegroundWindow()
$cursor = New-Object SynapseDesktopState+POINT
[void][SynapseDesktopState]::GetCursorPos([ref]$cursor)

$window = New-Object SynapseDesktopState+RECT
$client = New-Object SynapseDesktopState+RECT
$clientOrigin = New-Object SynapseDesktopState+POINT
[void][SynapseDesktopState]::GetWindowRect($windowHandle, [ref]$window)
[void][SynapseDesktopState]::GetClientRect($windowHandle, [ref]$client)
[void][SynapseDesktopState]::ClientToScreen($windowHandle, [ref]$clientOrigin)

$result = [pscustomobject]@{
    utc = [DateTime]::UtcNow.ToString('o')
    pid = [int]$TargetPid
    process = $process.ProcessName
    responding = $process.Responding
    started = $process.StartTime.ToUniversalTime().ToString('o')
    game_window = $windowHandle.ToInt64()
    game_window_class = [SynapseDesktopState]::ClassName($windowHandle)
    game_window_title = [SynapseDesktopState]::Title($windowHandle)
    game_is_foreground = ($foreground -eq $windowHandle)
    foreground = $foreground.ToInt64()
    foreground_title = [SynapseDesktopState]::Title($foreground)
    cursor = [pscustomobject]@{ x = $cursor.X; y = $cursor.Y }
    window_rect = [pscustomobject]@{ x = $window.Left; y = $window.Top; w = ($window.Right - $window.Left); h = ($window.Bottom - $window.Top) }
    client_rect = [pscustomobject]@{ x = $clientOrigin.X; y = $clientOrigin.Y; w = ($client.Right - $client.Left); h = ($client.Bottom - $client.Top) }
    module_count = $process.Modules.Count
}
$result | ConvertTo-Json -Depth 6
