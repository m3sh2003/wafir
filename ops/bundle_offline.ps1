$sourceFile = "C:\Users\Mody\.gemini\antigravity\brain\bf7b9ade-f94d-4bb4-a111-c8996e40cf69\wafir_portable.html"
$destFile = "C:\Users\Mody\.gemini\antigravity\brain\bf7b9ade-f94d-4bb4-a111-c8996e40cf69\wafir_portable_offline.html"

Write-Host "Reading source file..."
$html = Get-Content -Path $sourceFile -Raw -Encoding UTF8

# Define libs to embed
$libs = @(
    @{ marker = '<script src="https://cdn.tailwindcss.com"></script>'; url = "https://cdn.tailwindcss.com" },
    @{ marker = '<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>'; url = "https://unpkg.com/react@18/umd/react.production.min.js" },
    @{ marker = '<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>'; url = "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" },
    @{ marker = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>'; url = "https://unpkg.com/@babel/standalone/babel.min.js" }
)

foreach ($lib in $libs) {
    Write-Host "Downloading $($lib.url)..."
    try {
        $content = Invoke-RestMethod -Uri $lib.url
        $embedTag = "<script>`n" + $content + "`n</script>"
        $html = $html.Replace($lib.marker, $embedTag)
    } catch {
        Write-Error "Failed to download $($lib.url)"
    }
}

Write-Host "Saving to $destFile..."
$html | Set-Content -Path $destFile -Encoding UTF8
Write-Host "Done! File size: $( (Get-Item $destFile).Length / 1KB ) KB"
