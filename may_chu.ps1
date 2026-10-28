# May chu nho chay trang Xuong video ngay tren may nay (http://localhost:8777), khong can mang, khong can cai gi.
$root = $PSScriptRoot
$port = 8777
$types = @{ ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".mjs"="text/javascript; charset=utf-8";
  ".css"="text/css; charset=utf-8"; ".json"="application/json; charset=utf-8"; ".wasm"="application/wasm"; ".woff2"="font/woff2";
  ".png"="image/png"; ".svg"="image/svg+xml" }
$http = New-Object System.Net.HttpListener
$ok = $false
foreach ($p in 8777..8790) { try { $http = New-Object System.Net.HttpListener; $http.Prefixes.Add("http://localhost:$p/"); $http.Start(); $port = $p; $ok = $true; break } catch { } }
if (-not $ok) { Write-Host "Khong mo duoc may chu (cong 8777-8790 dang ban)."; exit 1 }
$url = "http://localhost:$port/index.html"
Write-Host "Trang: $url"
Write-Host "Dong cua so nay khi lam xong."
Start-Process $url
while ($http.IsListening) {
  try { $ctx = $http.GetContext() } catch { break }
  $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
    if ($path -eq "") { $path = "index.html" }
    $file = [IO.Path]::GetFullPath((Join-Path $root $path))
    if (-not $file.StartsWith([IO.Path]::GetFullPath($root)) -or -not (Test-Path $file -PathType Leaf)) {
      $res.StatusCode = 404; $res.Close(); continue
    }
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" })
    $res.Headers.Add("Cache-Control", "no-cache")
    $fs = [IO.File]::OpenRead($file)
    $res.ContentLength64 = $fs.Length
    $fs.CopyTo($res.OutputStream); $fs.Close()
    $res.OutputStream.Close()
  } catch { try { $res.Abort() } catch { } }
}
