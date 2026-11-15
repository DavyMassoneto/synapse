$ShellLauncherSources = @(
    (Join-Path $PSScriptRoot 'constants.cs')
    (Join-Path $PSScriptRoot 'types.cs')
    (Join-Path $PSScriptRoot 'native.cs')
    (Join-Path $PSScriptRoot 'native-resources.cs')
    (Join-Path $PSScriptRoot 'launch-attributes.cs')
    (Join-Path $PSScriptRoot 'streaming.cs')
    (Join-Path $PSScriptRoot 'output-transport.cs')
    (Join-Path $PSScriptRoot 'input-transport.cs')
    (Join-Path $PSScriptRoot 'status-protocol.cs')
    (Join-Path $PSScriptRoot 'command-line.cs')
    (Join-Path $PSScriptRoot 'launcher.cs')
    (Join-Path $PSScriptRoot 'cleanup.cs')
    (Join-Path $PSScriptRoot 'process-launch.cs')
    (Join-Path $PSScriptRoot 'process-execution.cs')
)
$ShellErrorActionStop = 'Stop'
$ShellReadFrameScript = Join-Path $PSScriptRoot 'read-frame.ps1'
$ShellValidateSpecScript = Join-Path $PSScriptRoot 'validate-spec.ps1'
$ShellEnvironmentScript = Join-Path $PSScriptRoot 'environment.ps1'
$ShellExecutionScript = Join-Path $PSScriptRoot 'execution.ps1'
$ShellFieldsSeparator = ','
$ShellEnvironmentSeparator = '='
$ShellEnvironmentTerminator = [char]0
$ShellInputField = 'input'
$ShellFrameHeaderBytes = 4
$ShellFrameMaxBytes = 1048576
$ShellFrameIncompleteHeader = 'Incomplete shell frame header.'
$ShellFrameTooLarge = 'Shell frame exceeds byte limit.'
$ShellFrameIncompleteBody = 'Incomplete shell frame body.'
$ShellFieldsRequired = 'arguments,cwd,environment,executable'
$ShellFieldsWithInput = 'arguments,cwd,environment,executable,input'
$ShellInvalidFields = 'Invalid shell specification fields.'
$ShellInvalidTypes = 'Invalid shell specification types.'
$ShellInvalidArgument = 'Invalid shell argument.'
$ShellEnvironmentFields = 'name,value'
$ShellEnvironmentInvalidFields = 'Invalid environment fields.'
$ShellEnvironmentInvalidTypes = 'Invalid environment types.'
$ShellInvalidInput = 'Invalid shell stdin.'
