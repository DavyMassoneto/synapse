param([int]$ChildPid)
$ErrorActionPreference = 'Stop'
$child = Get-Process -Id $ChildPid -ErrorAction SilentlyContinue
if ($child) {
    [Console]::Out.WriteLine('CHILD_ALIVE:' + $ChildPid)
} else {
    [Console]::Out.WriteLine('CHILD_ABSENT:' + $ChildPid)
}
