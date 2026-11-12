$ErrorActionPreference = 'Stop'

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$tempPrefix = $tempRoot.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar
$probeRoot = [System.IO.Path]::GetFullPath((Join-Path $tempPrefix ("sba301-p01-fix01-package-" + [guid]::NewGuid().ToString('N'))))
$comparison = [System.StringComparison]::OrdinalIgnoreCase

if (-not $probeRoot.StartsWith($tempPrefix, $comparison)) {
    throw 'Temporary probe directory is outside the system temporary directory.'
}
if (-not $env:JAVA_HOME) {
    throw 'Set JAVA_HOME to a JDK 21 installation for this packaging check.'
}

try {
    New-Item -ItemType Directory -Path $probeRoot | Out-Null
    $probeSource = Join-Path $probeRoot 'src\main\java'
    $probeResources = Join-Path $probeRoot 'src\main\resources'
    New-Item -ItemType Directory -Path $probeSource -Force | Out-Null
    New-Item -ItemType Directory -Path $probeResources -Force | Out-Null

    Copy-Item -LiteralPath (Join-Path $repoRoot 'pom.xml') -Destination $probeRoot
    Get-ChildItem -LiteralPath (Join-Path $repoRoot 'src\main\java') -Force |
        Copy-Item -Destination $probeSource -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $repoRoot 'src\main\resources\application.properties') `
        -Destination $probeResources

    $fakeMarker = 'SENTINEL_FAKE_LOCAL_CONFIG_P01_FIX_01'
    $fakePrivateKeyMarker = 'SENTINEL_FAKE_PRIVATE_SIGNING_KEY_P03'
    $fakeBootstrapSecretMarker = 'SENTINEL_FAKE_BOOTSTRAP_SECRET_P03'
    $fakePrivateDocumentMarker = 'SENTINEL_FAKE_PRIVATE_DOCUMENT_P05'
    $fakePrivateStorageRoot = Join-Path $probeRoot 'private-document-storage'
    New-Item -ItemType Directory -Path $fakePrivateStorageRoot -Force | Out-Null
    [System.IO.File]::WriteAllText((Join-Path $fakePrivateStorageRoot 'synthetic-marker.txt'), $fakePrivateDocumentMarker)
    $localConfig = Join-Path $probeResources 'application-local.properties'
    [System.IO.File]::WriteAllText($localConfig,
        "review.fake.local=$fakeMarker`napp.security.bootstrap-admin.password=$fakeBootstrapSecretMarker`n" +
        "app.document.storage.root=$fakePrivateStorageRoot`n")
    $fakeKeyDirectory = Join-Path $probeResources 'config\keys'
    New-Item -ItemType Directory -Path $fakeKeyDirectory -Force | Out-Null
    $fakePrivateKey = Join-Path $fakeKeyDirectory 'private_signing_key.pem'
    [System.IO.File]::WriteAllText($fakePrivateKey, "-----BEGIN PRIVATE KEY-----`n$fakePrivateKeyMarker`n")

    $wrapper = Join-Path $repoRoot 'mvnw.cmd'
    $probePom = Join-Path $probeRoot 'pom.xml'
    Push-Location $repoRoot
    try {
        & $wrapper -B -f $probePom '-Dmaven.test.skip=true' package
        if ($LASTEXITCODE -ne 0) {
            throw "Isolated Maven package probe failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }

    $jarPath = Join-Path $probeRoot 'target\carrental-be-0.0.1-SNAPSHOT.jar'
    if (-not (Test-Path -LiteralPath $jarPath -PathType Leaf)) {
        throw 'Expected executable JAR was not produced by the isolated packaging probe.'
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($jarPath)
    try {
        $localConfigEntry = $archive.Entries | Where-Object {
            $_.FullName -match '(^|/)application-local\.properties$'
        } | Select-Object -First 1
        if ($null -ne $localConfigEntry) {
            throw "Local configuration was packaged as $($localConfigEntry.FullName)."
        }

        $testHelperEntry = $archive.Entries | Where-Object {
            $_.FullName -in @(
                'BOOT-INF/classes/com/carrental/storage/StorageRootBootJarProbe.class',
                'BOOT-INF/classes/com/carrental/storage/StorageRootBootJarIT.class'
            )
        } | Select-Object -First 1
        if ($null -ne $testHelperEntry) {
            throw "A test-only Boot root probe was packaged as $($testHelperEntry.FullName)."
        }

        $markerFound = $false
        $privateKeyEntryFound = $false
        foreach ($entry in $archive.Entries) {
            if (-not $entry.FullName.StartsWith('BOOT-INF/classes/', $comparison)) {
                continue
            }
            if ($entry.FullName -match '(?i)(^|/)private[^/]*\.(pem|key|p12|pfx|jks|keystore)$') {
                $privateKeyEntryFound = $true
            }
            $reader = [System.IO.StreamReader]::new($entry.Open())
            try {
                $entryText = $reader.ReadToEnd()
                if (($entryText.Contains($fakeMarker)) -or
                    ($entryText.Contains($fakePrivateKeyMarker)) -or
                    ($entryText.Contains($fakeBootstrapSecretMarker)) -or
                    ($entryText.Contains($fakePrivateDocumentMarker)) -or
                    ($entryText.Contains($fakePrivateStorageRoot))) {
                    $markerFound = $true
                    break
                }
            }
            finally {
                $reader.Dispose()
            }
        }
        if ($markerFound) {
            throw 'A fake local configuration, private key, or bootstrap secret marker was found in the executable JAR.'
        }
        if ($privateKeyEntryFound) {
            throw 'A private-key-shaped resource was found in the executable JAR.'
        }
    }
    finally {
        $archive.Dispose()
    }

    Write-Output 'PROBE_BUILD=PASS'
    Write-Output 'LOCAL_CONFIG_ENTRY_PACKAGED=False'
    Write-Output 'FAKE_LOCAL_CONFIG_MARKER_PACKAGED=False'
    Write-Output 'FAKE_PRIVATE_KEY_MARKER_PACKAGED=False'
    Write-Output 'FAKE_BOOTSTRAP_SECRET_MARKER_PACKAGED=False'
    Write-Output 'FAKE_PRIVATE_DOCUMENT_MARKER_PACKAGED=False'
    Write-Output 'PRIVATE_STORAGE_ROOT_PATH_PACKAGED=False'
    Write-Output 'PRIVATE_KEY_ENTRY_PACKAGED=False'
    Write-Output 'TEST_BOOT_ROOT_HELPER_PACKAGED=False'
    Write-Output "PROBE_ARTIFACT=$jarPath"
}
finally {
    if (Test-Path -LiteralPath $probeRoot) {
        $resolvedProbeRoot = [System.IO.Path]::GetFullPath($probeRoot)
        if (-not $resolvedProbeRoot.StartsWith($tempPrefix, $comparison)) {
            throw 'Refusing to remove a directory outside the system temporary directory.'
        }
        [System.IO.Directory]::Delete($resolvedProbeRoot, $true)
    }
}
