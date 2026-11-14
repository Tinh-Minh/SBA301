param([string]$DataDirectory = (Join-Path $env:LOCALAPPDATA 'SBA301_RentCar'))
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$dataRoot = [IO.Path]::GetFullPath($DataDirectory)
$repoPrefix = $repoRoot.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar
if ($dataRoot.Equals($repoRoot, [StringComparison]::OrdinalIgnoreCase) -or
    $dataRoot.StartsWith($repoPrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Choose a data directory outside the repository and application tree.'
}
$envPath = Join-Path $repoRoot '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
    Copy-Item -LiteralPath (Join-Path $repoRoot '.env.example') -Destination $envPath
}
$privateRoot = Join-Path $dataRoot 'private-documents'
New-Item -ItemType Directory -Path $privateRoot -Force | Out-Null

# Generate a local HS256 secret only when .env has no usable value. Never print it.
$contents = [IO.File]::ReadAllText($envPath)
$secretPattern = '(?m)^JWT_SECRET=(.*)$'
$secretMatch = [regex]::Match($contents, $secretPattern)
if (-not $secretMatch.Success -or
    [string]::IsNullOrWhiteSpace($secretMatch.Groups[1].Value) -or
    $secretMatch.Groups[1].Value.Trim() -eq 'REPLACE_WITH_A_NEW_RANDOM_SECRET_AT_LEAST_32_BYTES') {
    $secretBytes = New-Object 'byte[]' 48
    $random = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $random.GetBytes($secretBytes)
        $jwtSecret = [Convert]::ToBase64String($secretBytes)
    } finally {
        $random.Dispose()
        [Array]::Clear($secretBytes, 0, $secretBytes.Length)
    }
    $secretLine = 'JWT_SECRET=' + $jwtSecret
    if ($secretMatch.Success) {
        $contents = [regex]::Replace($contents, $secretPattern,
            [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $secretLine }, 1)
    } else {
        if ($contents.Length -gt 0 -and -not $contents.EndsWith("`n")) { $contents += "`n" }
        $contents += $secretLine + "`n"
    }
}

# Fill only absent/blank generated values. Never parse, evaluate or print credentials.
$generated = @{
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
Write-Output 'Local .env with JWT_SECRET and private storage are ready. Existing secrets and nonblank configuration were preserved.'
Write-Output 'Fill DB_URL, DB_USERNAME and DB_PASSWORD in .env using Supabase Connect. No database was contacted.'
Write-Output 'Run with profile supabase from the repository root; see docs/SUPABASE_SETUP.md.'
