param(
  [int]$Port = 4173,
  [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root at http://localhost:$Port/"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".svg"  = "image/svg+xml"
  ".mp4"  = "video/mp4"
  ".woff2"= "font/woff2"
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    try {
      $relPath = $request.Url.LocalPath.TrimStart('/')
      if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
      $relPath = $relPath -replace '/', '\'
      $filePath = Join-Path $Root $relPath

      if (-not (Test-Path $filePath -PathType Leaf)) {
        $response.StatusCode = 404
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
      }

      $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
      $response.AddHeader("Accept-Ranges", "bytes")

      $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
      $rangeHeader = $request.Headers["Range"]
      if ($rangeHeader -and $rangeHeader -match "bytes=(\d+)-(\d*)") {
        $start = [int]$Matches[1]
        $end = if ($Matches[2]) { [int]$Matches[2] } else { $fileBytes.Length - 1 }
        if ($end -ge $fileBytes.Length) { $end = $fileBytes.Length - 1 }
        $length = $end - $start + 1
        $response.StatusCode = 206
        $response.AddHeader("Content-Range", "bytes $start-$end/$($fileBytes.Length)")
        $response.ContentLength64 = $length
        $response.OutputStream.Write($fileBytes, $start, $length)
      } else {
        $response.StatusCode = 200
        $response.ContentLength64 = $fileBytes.Length
        $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
      }
      $response.Close()
    } catch {
      try { $response.Abort() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
