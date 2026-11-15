$ErrorActionPreference = 'Stop'
$production = Join-Path $PSScriptRoot '../../../src/modules/agent-team/adapters/supervised-shell/windows'
. (Join-Path $production 'constants.ps1')
Add-Type -Path $ShellLauncherSources
$type = [SupervisedShellLauncher]
$flags = [System.Reflection.BindingFlags]::NonPublic -bor [System.Reflection.BindingFlags]::Static
foreach ($name in @('WaitChecked', 'ResumeChecked')) {
    $method = $type.GetMethod($name, $flags)
    try {
        if ($name -eq 'WaitChecked') { $method.Invoke($null, @([IntPtr]::Zero, [uint32]0)) }
        else { $method.Invoke($null, @([IntPtr]::Zero)) }
        throw 'Unchecked native failure.'
    } catch {
        $failure = $_.Exception
        while ($failure.InnerException -and -not ($failure -is [System.ComponentModel.Win32Exception])) { $failure = $failure.InnerException }
        if (-not ($failure -is [System.ComponentModel.Win32Exception]) -or $failure.NativeErrorCode -ne 6) { throw }
        [Console]::Out.WriteLine($name + ':CHECKED')
    }
}

$assign = $type.GetMethod('AssignProcessToJobObject', $flags)
$result = $assign.Invoke($null, @([IntPtr]::Zero, [IntPtr]::Zero))
if ($result) { throw 'Invalid assignment unexpectedly succeeded.' }
[Console]::Out.WriteLine('AssignProcessToJobObject:REFUSED')
