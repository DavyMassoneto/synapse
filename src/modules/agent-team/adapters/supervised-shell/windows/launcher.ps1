. (Join-Path $PSScriptRoot 'constants.ps1')
$ErrorActionPreference = $ShellErrorActionStop
. $ShellReadFrameScript
. $ShellValidateSpecScript
. $ShellEnvironmentScript
. $ShellExecutionScript
$body = Read-ShellFrame
$utf8 = [System.Text.UTF8Encoding]::new($false, $true)
$spec = $utf8.GetString($body) | ConvertFrom-Json
Assert-ShellSpec $spec
$code = Invoke-ShellSpec $spec
exit $code
