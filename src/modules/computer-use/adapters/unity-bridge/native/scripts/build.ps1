# Build reproduzivel dos artefatos nativos do unity-bridge.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1
# Requisitos: .NET SDK 8+, Visual Studio Build Tools com VC++ x64, instalacao do Motorsport Manager.
# Saida: bin/builds/<stamp>/ (imutavel) e bin/current/ (nomes estaveis para configuracao).
[CmdletBinding()]
param(
    [string]$ManagedDir = '',
    [string]$CscPath = '',
    [string]$VcVarsPath = '',
    [switch]$SkipNative,
    [switch]$SkipLauncher
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$baseBin = Join-Path $root 'bin'
$obj = Join-Path $root 'obj'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$assemblyStamp = $stamp.Replace('-', '')
$bin = Join-Path $baseBin (Join-Path 'builds' $stamp)

function Resolve-ManagedDir([string]$explicit) {
    if ($explicit.Length -gt 0) {
        if (-not (Test-Path (Join-Path $explicit 'UnityEngine.UI.dll'))) {
            throw "ManagedDir sem UnityEngine.UI.dll: $explicit"
        }
        return $explicit
    }
    $candidates = @(
        (Join-Path ${env:ProgramFiles(x86)} 'Steam\steamapps\common\Motorsport Manager\MM_Data\Managed'),
        (Join-Path $env:ProgramFiles 'Steam\steamapps\common\Motorsport Manager\MM_Data\Managed'),
        'C:\Program Files (x86)\Steam\steamapps\common\Motorsport Manager\MM_Data\Managed'
    )
    foreach ($candidate in $candidates) {
        if (Test-Path (Join-Path $candidate 'UnityEngine.UI.dll')) {
            return $candidate
        }
    }
    throw 'Motorsport Manager nao encontrado; passe -ManagedDir <MM_Data\Managed>.'
}

function Resolve-CscPath([string]$explicit) {
    if ($explicit.Length -gt 0) {
        if (-not (Test-Path $explicit)) { throw "csc nao encontrado: $explicit" }
        return $explicit
    }
    $sdkLines = & dotnet --list-sdks
    if ($LASTEXITCODE -ne 0) { throw 'dotnet --list-sdks falhou; instale o .NET SDK 8+.' }
    $sdks = @()
    foreach ($line in $sdkLines) {
        if ($line -match '^(\d+\.\d+\.\d+)\s+\[(.+)\]$') {
            $sdks += [pscustomobject]@{ Version = [version]$Matches[1]; Root = (Join-Path $Matches[2] $Matches[1]) }
        }
    }
    if ($sdks.Count -eq 0) { throw 'nenhum SDK .NET encontrado.' }
    $latest = $sdks | Sort-Object Version | Select-Object -Last 1
    $csc = Join-Path $latest.Root 'Roslyn\bincore\csc.dll'
    if (-not (Test-Path $csc)) { throw "csc nao encontrado no SDK $($latest.Version): $csc" }
    return $csc
}

function Resolve-VcVarsPath([string]$explicit) {
    if ($explicit.Length -gt 0) {
        if (-not (Test-Path $explicit)) { throw "vcvars64.bat nao encontrado: $explicit" }
        return $explicit
    }
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    if (Test-Path $vswhere) {
        $installation = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
        if ($installation) {
            $candidate = Join-Path $installation 'VC\Auxiliary\Build\vcvars64.bat'
            if (Test-Path $candidate) { return $candidate }
        }
    }
    $fallback = 'C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvars64.bat'
    if (-not (Test-Path $fallback)) { throw 'vcvars64.bat nao encontrado; instale VC++ Build Tools ou passe -VcVarsPath.' }
    return $fallback
}

$managedDir = Resolve-ManagedDir $ManagedDir
$csc = Resolve-CscPath $CscPath

New-Item -ItemType Directory -Force -Path $bin | Out-Null
New-Item -ItemType Directory -Force -Path $obj | Out-Null

$references = @(
    "$managedDir\mscorlib.dll",
    "$managedDir\System.dll",
    "$managedDir\System.Core.dll",
    "$managedDir\UnityEngine.dll",
    "$managedDir\UnityEngine.UI.dll"
)

function Build-Managed([string]$output, [string[]]$sources) {
    $arguments = @($csc, '-target:library', '-nologo', '-nostdlib+', '-langversion:4', '-optimize+', '-debug-', "-out:$output")
    foreach ($reference in $references) { $arguments += "-r:$reference" }
    $arguments += $sources
    & dotnet @arguments
    if ($LASTEXITCODE -ne 0) { throw "csc falhou para $output (exit $LASTEXITCODE)" }
    Write-Host "built $output"
}

Build-Managed (Join-Path $bin ('Probe_' + $assemblyStamp + '.dll')) @((Join-Path $root 'managed\Probe.cs'))

$bridgeSources = Get-ChildItem -Path (Join-Path $root 'managed') -Filter '*.cs' | Where-Object { $_.Name -ne 'Probe.cs' } | ForEach-Object { $_.FullName }
Build-Managed (Join-Path $bin ('UnityBridge_' + $assemblyStamp + '.dll')) $bridgeSources

Set-Content -LiteralPath (Join-Path $baseBin 'latest.txt') -Value $bin -Encoding ASCII

if (-not $SkipNative) {
    $vcvars = Resolve-VcVarsPath $VcVarsPath
    $nativeObj = Join-Path $obj 'native'
    New-Item -ItemType Directory -Force -Path $nativeObj | Out-Null
    $clBat = Join-Path $nativeObj '_build_native.bat'
    $clLines = @(
        '@echo off',
        ('call "' + $vcvars + '" >nul'),
        ('cd /d "' + $bin + '"'),
        ('cl /nologo /LD /O2 /EHsc /D_USRDLL /Fe:"' + $bin + '\bridge_injector.dll" /Fo:"' + $nativeObj + '\bridge_injector.obj" /Fd:"' + $nativeObj + '\bridge_injector.pdb" "' + $root + '\native\bridge_injector.cpp"'),
        'exit /b %ERRORLEVEL%'
    )
    Set-Content -LiteralPath $clBat -Value $clLines -Encoding ASCII
    & cmd /c $clBat
    if ($LASTEXITCODE -ne 0) { throw "cl falhou (exit $LASTEXITCODE)" }
    Write-Host "built $bin\bridge_injector.dll"
}

if (-not $SkipLauncher) {
    $launcherProject = Join-Path $root 'launcher\SynapseBridgeLauncher.csproj'
    & dotnet build $launcherProject -c Release --nologo -v:m
    if ($LASTEXITCODE -ne 0) { throw "dotnet build launcher falhou (exit $LASTEXITCODE)" }
}

$current = Join-Path $baseBin 'current'
if (Test-Path $current) { Remove-Item -Recurse -Force $current }
New-Item -ItemType Directory -Force -Path $current | Out-Null
Copy-Item -LiteralPath (Join-Path $bin ('UnityBridge_' + $assemblyStamp + '.dll')) -Destination (Join-Path $current 'UnityBridge.dll')
Copy-Item -LiteralPath (Join-Path $bin ('Probe_' + $assemblyStamp + '.dll')) -Destination (Join-Path $current 'Probe.dll')
if (-not $SkipNative) {
    Copy-Item -LiteralPath (Join-Path $bin 'bridge_injector.dll') -Destination (Join-Path $current 'bridge_injector.dll')
}

Write-Host "build complete: $bin"
Write-Host "stable: $current"
