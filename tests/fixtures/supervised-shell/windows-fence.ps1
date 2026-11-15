$ErrorActionPreference = 'Stop'
$production = Join-Path $PSScriptRoot '../../../src/modules/agent-team/adapters/supervised-shell/windows'
. (Join-Path $production 'constants.ps1')
Add-Type -Path $ShellLauncherSources
$flags = [System.Reflection.BindingFlags]::NonPublic -bor [System.Reflection.BindingFlags]::Static
$type = [SupervisedShellLauncher]
$cleanup = $type.GetMethod('CleanupNativeResources', $flags)
$processInfo = $type.GetNestedType('ProcessInformation', [System.Reflection.BindingFlags]::NonPublic)
$empty = [Activator]::CreateInstance($processInfo)
try {
    $cleanup.Invoke($null, @([IntPtr]1, $empty, [IntPtr]1, [IntPtr]1, [IntPtr]1, [IntPtr]1, [IntPtr]1, [IntPtr]1, [IntPtr]::Zero, [IntPtr]::Zero, [IntPtr]::Zero))
    throw 'Cleanup failures were not aggregated.'
} catch [System.Reflection.TargetInvocationException] {
    $aggregate = $_.Exception.InnerException
    if (-not ($aggregate -is [AggregateException]) -or $aggregate.InnerExceptions.Count -lt 5) { throw }
    [Console]::Out.WriteLine('CLEANUP_ALL_ATTEMPTED')
}
