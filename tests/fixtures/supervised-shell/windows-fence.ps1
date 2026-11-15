$ErrorActionPreference = 'Stop'
$production = Join-Path $PSScriptRoot '../../../src/modules/agent-team/adapters/supervised-shell/windows'
. (Join-Path $production 'constants.ps1')
Add-Type -Path $ShellLauncherSources
$flags = [System.Reflection.BindingFlags]::NonPublic -bor [System.Reflection.BindingFlags]::Static
$type = [SupervisedShellLauncher]
$cleanup = $type.GetMethod('CleanupNativeResources', $flags)
$processInfo = $type.GetNestedType('ProcessInformation', [System.Reflection.BindingFlags]::NonPublic)
$empty = [Activator]::CreateInstance($processInfo)
$resourcesType = $type.GetNestedType('NativeResources', [System.Reflection.BindingFlags]::NonPublic)
$resources = [Activator]::CreateInstance($resourcesType, @(''))
foreach ($name in @('Job', 'InputRead', 'InputWrite', 'OutputRead', 'OutputWrite', 'ErrorRead', 'ErrorWrite')) {
    $resourcesType.GetField($name).SetValue($resources, [IntPtr]1)
}
try {
    $cleanup.Invoke($null, @($resources, $empty))
    throw 'Cleanup failures were not aggregated.'
} catch {
    $aggregate = $_.Exception
    while ($aggregate.InnerException -and -not ($aggregate -is [AggregateException])) {
        $aggregate = $aggregate.InnerException
    }
    if (-not ($aggregate -is [AggregateException]) -or $aggregate.InnerExceptions.Count -lt 5) {
        throw
    }
    foreach ($failure in $aggregate.InnerExceptions) {
        if (-not ($failure -is [System.ComponentModel.Win32Exception]) -or $failure.NativeErrorCode -ne 6) {
            throw
        }
    }
    [Console]::Out.WriteLine('CLEANUP_ALL_ATTEMPTED')
}
