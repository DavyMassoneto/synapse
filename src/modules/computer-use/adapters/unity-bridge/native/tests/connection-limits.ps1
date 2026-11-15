[CmdletBinding()]
param(
    [string]$Handshake = (Join-Path $PSScriptRoot '..\run\handshake.json'),
    [int]$MaxConnections = 16,
    [switch]$SkipIdle,
    [switch]$Shutdown
)

$ErrorActionPreference = 'Stop'
$handshakeState = Get-Content -LiteralPath $Handshake -Raw | ConvertFrom-Json
$port = [int]$handshakeState.port
$token = [string]$handshakeState.token

function Open-BridgeSocket {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect('127.0.0.1', $port)
    $stream = $client.GetStream()
    $stream.ReadTimeout = 1500
    $stream.WriteTimeout = 1500
    return [pscustomobject]@{ Client = $client; Stream = $stream }
}

function Send-Line([System.IO.Stream]$stream, [string]$line) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($line + "`n")
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
}

function Read-Line([System.IO.Stream]$stream) {
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $false, 1024, $true)
    try {
        return $reader.ReadLine()
    } catch {
        return $null
    }
}

function Close-BridgeSocket($socket) {
    try { $socket.Stream.Close() } catch {}
    try { $socket.Client.Close() } catch {}
}

$results = [ordered]@{}
$sockets = @()
try {
    for ($index = 0; $index -lt ($MaxConnections + 1); $index++) {
        $sockets += Open-BridgeSocket
        Send-Line $sockets[$index].Stream '{"op":"hello"}'
    }
    $accepted = 0
    $rejected = 0
    foreach ($socket in $sockets) {
        $response = Read-Line $socket.Stream
        if ($null -ne $response -and $response -match '"status":"ok"') { $accepted++ } else { $rejected++ }
    }
    $results.connections = [ordered]@{ opened = $sockets.Count; accepted = $accepted; rejected = $rejected; max = $MaxConnections }
    if ($accepted -ne $MaxConnections -or $rejected -ne 1) {
        throw "admissao de conexoes inesperada: accepted=$accepted rejected=$rejected"
    }
} finally {
    foreach ($socket in $sockets) { Close-BridgeSocket $socket }
}

function Assert-RequestRejected([string]$payload) {
    $socket = Open-BridgeSocket
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $socket.Stream.Write($bytes, 0, $bytes.Length)
        $socket.Stream.Flush()
        $response = Read-Line $socket.Stream
        if ($null -ne $response -and $response -notmatch 'request-too-large') {
            throw "resposta inesperada para request grande: $response"
        }
        return $null -eq $response -or $response -match 'request-too-large'
    } finally {
        Close-BridgeSocket $socket
    }
}

$results.oversizedWithDelimiter = Assert-RequestRejected ('{"op":"hello","pad":"' + ('a' * 9000) + '"}')
$results.oversizedWithoutDelimiter = Assert-RequestRejected ('a' * 9000)
$results.oversizedMultibyte = Assert-RequestRejected ('{"op":"hello","pad":"' + ('é' * 5000) + '"}')

$prefix = '{"op":"hello","pad":"'
$suffix = '"}'
$paddingAtCap = 8192 - [System.Text.Encoding]::UTF8.GetByteCount($prefix + $suffix)

$results.crlfAtCap = $false
$crlf = Open-BridgeSocket
try {
    $line = $prefix + ('a' * $paddingAtCap) + $suffix
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($line + "`r`n")
    $crlf.Stream.Write($bytes, 0, $bytes.Length)
    $crlf.Stream.Flush()
    $response = Read-Line $crlf.Stream
    $results.crlfAtCap = ($null -ne $response -and $response -match '"status":"ok"')
    if (-not $results.crlfAtCap) { throw 'linha CRLF no teto exato foi recusada' }
} finally {
    Close-BridgeSocket $crlf
}

$results.crlfOverCap = Assert-RequestRejected ($prefix + ('a' * ($paddingAtCap + 1)) + $suffix)

if (-not $SkipIdle) {
    $idle = Open-BridgeSocket
    try {
        Start-Sleep -Milliseconds 5500
        $response = Read-Line $idle.Stream
        $results.idle = [ordered]@{ closed = ($null -eq $response) }
        if ($null -ne $response) { throw "conexao ociosa nao foi encerrada: $response" }
    } finally {
        Close-BridgeSocket $idle
    }
}

if ($Shutdown) {
    $idle = Open-BridgeSocket
    $control = Open-BridgeSocket
    try {
        Send-Line $control.Stream ('{"op":"stop","token":"' + $token + '"}')
        $stopResponse = Read-Line $control.Stream
        Start-Sleep -Milliseconds 500
        $idleResponse = Read-Line $idle.Stream
        $results.shutdown = [ordered]@{
            stop_status = if ($null -eq $stopResponse) { $null } else { ($stopResponse | ConvertFrom-Json).status }
            idle_closed = ($null -eq $idleResponse)
        }
        if ($results.shutdown.idle_closed -ne $true) { throw 'cliente ocioso sobreviveu ao shutdown' }
    } finally {
        Close-BridgeSocket $idle
        Close-BridgeSocket $control
    }
}

$results | ConvertTo-Json -Depth 5 -Compress
