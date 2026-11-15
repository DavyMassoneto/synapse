function ConvertTo-ShellEnvironment([Array]$environment) {
    $entries = [System.Collections.Generic.SortedDictionary[string,string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($entry in $environment) {
        $entries[$entry.name] = $entry.value
    }
    $block = [System.Text.StringBuilder]::new()
    foreach ($name in @($entries.Keys | Sort-Object)) {
        [void]$block.Append($name)
        [void]$block.Append($ShellEnvironmentSeparator)
        [void]$block.Append($entries[$name])
        [void]$block.Append($ShellEnvironmentTerminator)
    }
    [void]$block.Append($ShellEnvironmentTerminator)
    return $block.ToString()
}
