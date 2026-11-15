function Read-ShellFrame {
$inputStream = [Console]::OpenStandardInput()
$header = New-Object byte[] $ShellFrameHeaderBytes
$offset = 0
while ($offset -lt $ShellFrameHeaderBytes) {
    $count = $inputStream.Read($header, $offset, $ShellFrameHeaderBytes - $offset)
    if ($count -eq 0) { throw $ShellFrameIncompleteHeader }
    $offset += $count
}
if ([BitConverter]::IsLittleEndian) { [Array]::Reverse($header) }
$length = [BitConverter]::ToUInt32($header, 0)
if ($length -gt $ShellFrameMaxBytes) { throw $ShellFrameTooLarge }
$body = New-Object byte[] $length
$offset = 0
while ($offset -lt $length) {
    $count = $inputStream.Read($body, $offset, $length - $offset)
    if ($count -eq 0) { throw $ShellFrameIncompleteBody }
    $offset += $count
}
return ,$body
}
