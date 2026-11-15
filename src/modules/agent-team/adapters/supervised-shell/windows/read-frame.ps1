function Read-ShellExact([System.IO.Stream]$stream, [byte[]]$buffer, [string]$incompleteMessage) {
    $offset = 0
    while ($offset -lt $buffer.Length) {
        $count = $stream.Read($buffer, $offset, $buffer.Length - $offset)
        if ($count -eq 0) {
            throw $incompleteMessage
        }
        $offset += $count
    }
}

function Read-ShellFrame {
    $inputStream = [Console]::OpenStandardInput()
    $header = [byte[]]::new($ShellFrameHeaderBytes)
    Read-ShellExact $inputStream $header $ShellFrameIncompleteHeader
    if ([BitConverter]::IsLittleEndian) {
        [Array]::Reverse($header)
    }
    $length = [BitConverter]::ToUInt32($header, 0)
    if ($length -gt $ShellFrameMaxBytes) {
        throw $ShellFrameTooLarge
    }
    $body = [byte[]]::new($length)
    Read-ShellExact $inputStream $body $ShellFrameIncompleteBody
    return ,$body
}
