$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'launcher.cs'
Add-Type -Path $source
$encoded = [Console]::In.ReadLine()
if ($null -eq $encoded -or $encoded.Length -gt 32768) {
    throw 'Invalid launcher specification length.'
}
$spec = $encoded | ConvertFrom-Json
$properties = @($spec.PSObject.Properties.Name | Sort-Object)
$expected = @('commandLine', 'cwd', 'environment', 'executable', 'failAssignment')
if (($properties -join ',') -ne ($expected -join ',')) {
    throw 'Invalid launcher specification fields.'
}
if (-not ($spec.executable -is [string]) -or -not ($spec.commandLine -is [string]) -or -not ($spec.cwd -is [string]) -or -not ($spec.failAssignment -is [bool]) -or -not ($spec.environment -is [string])) {
    throw 'Invalid launcher specification types.'
}
if (-not [System.IO.Path]::IsPathRooted($spec.executable) -or -not [System.IO.Directory]::Exists($spec.cwd)) {
    throw 'Invalid launcher executable or directory.'
}
$exitCode = [SupervisedShellProof]::Run($spec.executable, $spec.commandLine, $spec.cwd, $spec.environment, $spec.failAssignment)
exit $exitCode
