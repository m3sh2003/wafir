$source = "f:\Wafir"
$destination = "f:\Wafir_Backup_Before_Migration.zip"
$exclude = @("node_modules", ".git", ".next", "dist", "build", ".dart_tool", ".idea", "android/app/build")

Add-Type -AssemblyName System.IO.Compression.FileSystem

$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal

echo "Creating backup at $destination..."

if (Test-Path $destination) {
    Remove-Item $destination
}

$files = Get-ChildItem $source -Recurse | Where-Object {
    $path = $_.FullName
    $relPath = $path.Substring($source.Length)
    
    $shouldExclude = $false
    foreach ($exc in $exclude) {
        if ($relPath -match "\\$exc\\?" -or $relPath -match "^\\$exc") {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

# Simple Zip using Compress-Archive might fail on long paths or open files, but easier to shell out to simple command if possible.
# PowerShell Compress-Archive is safer for paths if modern.

Compress-Archive -Path $source -DestinationPath $destination -CompressionLevel Optimal -Force

echo "Backup Complete."
