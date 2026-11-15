function Invoke-ShellSpec([PSCustomObject]$spec) {
    $environment = ConvertTo-ShellEnvironment $spec.environment
    $stdin = $null
    if ($spec.PSObject.Properties.Name -contains $ShellInputField) {
        $stdin = $spec.input
    }
    Add-Type -Path $ShellLauncherSources
    return [SupervisedShellLauncher]::Run($spec.executable, [string[]]$spec.arguments, $spec.cwd, $environment, $stdin)
}
