param([string]$DataDirectory = (Join-Path $env:LOCALAPPDATA 'SBA301_RentCar'))
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$dataRoot = [IO.Path]::GetFullPath($DataDirectory)
$repoPrefix = $repoRoot.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar
if ($dataRoot.Equals($repoRoot, [StringComparison]::OrdinalIgnoreCase) -or
    $dataRoot.StartsWith($repoPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Choose a data directory outside the repository and application tree.'
}
$javaCommand = if ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin/java.exe' } else { 'java.exe' }
if (-not (Get-Command $javaCommand -ErrorAction SilentlyContinue)) { throw 'Install JDK 21 or set JAVA_HOME.' }
$envPath = Join-Path $repoRoot '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
    Copy-Item -LiteralPath (Join-Path $repoRoot '.env.example') -Destination $envPath
}
$keyDirectory = Join-Path $dataRoot 'keys'
$privateRoot = Join-Path $dataRoot 'private-documents'
New-Item -ItemType Directory -Path $keyDirectory,$privateRoot -Force | Out-Null
$privateKey = Join-Path $keyDirectory 'private_key.pem'
$publicKey = Join-Path $keyDirectory 'public_key.pem'
& $javaCommand (Join-Path $PSScriptRoot 'GenerateJwtKeys.java') $privateKey $publicKey
if ($LASTEXITCODE -ne 0) { throw 'Development key setup failed; existing files were not overwritten.' }

# Fill only absent/blank generated values. Never parse, evaluate or print credentials.
$contents = [IO.File]::ReadAllText($envPath)
$generated = @{
    JWT_PRIVATE_KEY_LOCATION = ([Uri]$privateKey).AbsoluteUri
    JWT_PUBLIC_KEY_LOCATION = ([Uri]$publicKey).AbsoluteUri
    APP_DOCUMENT_STORAGE_ROOT = $privateRoot.Replace('\','/')
}
foreach ($name in $generated.Keys) {
    $empty = '(?m)^' + [regex]::Escape($name) + '=\s*$'
    $line = $name + '=' + $generated[$name]
    if ([regex]::IsMatch($contents, $empty)) {
        $contents = [regex]::Replace($contents, $empty, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $line })
    } elseif (-not [regex]::IsMatch($contents, '(?m)^' + [regex]::Escape($name) + '=')) {
        $contents += "`n$line`n"
    }
}
[IO.File]::WriteAllText($envPath, $contents, [Text.UTF8Encoding]::new($false))
Write-Output 'Local .env and private storage are ready. Existing keys and nonblank configuration were preserved.'
Write-Output 'Fill DB_URL, DB_USERNAME and DB_PASSWORD in .env using Supabase Connect. No database was contacted.'
Write-Output 'Run with profile supabase from the repository root; see docs/SUPABASE_SETUP.md.'
