function Assert-ShellSpec([PSCustomObject]$spec) {
    $actual = @($spec.PSObject.Properties.Name | Sort-Object) -join $ShellFieldsSeparator
    if ($actual -ne $ShellFieldsRequired -and $actual -ne $ShellFieldsWithInput) {
        throw $ShellInvalidFields
    }
    if (-not ($spec.executable -is [string]) -or -not ($spec.cwd -is [string]) -or -not ($spec.arguments -is [Array]) -or -not ($spec.environment -is [Array])) {
        throw $ShellInvalidTypes
    }
    if ($actual -eq $ShellFieldsWithInput -and -not ($spec.input -is [string])) {
        throw $ShellInvalidInput
    }
    foreach ($entry in $spec.environment) {
        if (-not ($entry -is [PSCustomObject])) {
            throw $ShellEnvironmentInvalidTypes
        }
        if ((@($entry.PSObject.Properties.Name | Sort-Object) -join $ShellFieldsSeparator) -ne $ShellEnvironmentFields) {
            throw $ShellEnvironmentInvalidFields
        }
        if (-not ($entry.name -is [string]) -or -not ($entry.value -is [string])) {
            throw $ShellEnvironmentInvalidTypes
        }
    }
    foreach ($argument in $spec.arguments) {
        if (-not ($argument -is [string])) {
            throw $ShellInvalidArgument
        }
    }
}
