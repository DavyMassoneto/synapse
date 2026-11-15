$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'constants.ps1')
. (Join-Path $PSScriptRoot 'read-frame.ps1')
. (Join-Path $PSScriptRoot 'validate-spec.ps1')
$body = Read-ShellFrame
$utf8 = New-Object System.Text.UTF8Encoding($false, $true)
$spec = $utf8.GetString($body) | ConvertFrom-Json
Assert-ShellSpec $spec
$actual = @($spec.PSObject.Properties.Name | Sort-Object) -join ','
$entries = New-Object 'System.Collections.Generic.SortedDictionary[string,string]' ([StringComparer]::OrdinalIgnoreCase)
foreach ($entry in $spec.environment) {
    $entries[$entry.name] = $entry.value
}
$environment = ''
foreach ($name in @($entries.Keys | Sort-Object)) { $environment += $name + '=' + $entries[$name] + [char]0 }
$environment += [char]0
$stdin = $null
if ($actual -eq $ShellFieldsWithInput) {
    $stdin = $spec.input
}
Add-Type -Path $ShellLauncherSources
$code = [SupervisedShellLauncher]::Run($spec.executable, [string[]]$spec.arguments, $spec.cwd, $environment, $stdin, $false)
exit $code
