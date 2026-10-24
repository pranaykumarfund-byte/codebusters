$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
if (-not (Test-Path (Join-Path $appRoot 'server/index.js'))) {
  $appRoot = Split-Path -Parent $appRoot
}
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $node) {
  Write-Host 'Node.js 20 or newer is required. Install it from https://nodejs.org/ and run this file again.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

$version = (& $node.Source --version).TrimStart('v')
$major = [int]($version.Split('.')[0])
if ($major -lt 20) {
  Write-Host "VIBA requires Node.js 20 or newer. This computer has Node.js $version." -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

$port = $null
foreach ($candidate in 4173..4183) {
  $probe = $null
  try {
    $probe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidate)
    $probe.Start()
    $port = $candidate
    break
  } catch {
    # Try the next local port if another app already uses this one.
  } finally {
    if ($probe) { $probe.Stop() }
  }
}

if (-not $port) {
  Write-Host 'VIBA could not find an available local port between 4173 and 4183.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

$server = Start-Process -FilePath $node.Source -ArgumentList @('server/index.js', [string]$port) -WorkingDirectory $appRoot -PassThru
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  if ($server.HasExited) { break }
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$port/api/bootstrap" -TimeoutSec 1
    if ($response.StatusCode -eq 200) { $ready = $true; break }
  } catch {
    Start-Sleep -Milliseconds 300
  }
}

if (-not $ready) {
  Write-Host 'VIBA did not respond to its local mock API. Check that Node.js is allowed to run on this computer.' -ForegroundColor Red
  Read-Host 'Press Enter to close'
  exit 1
}

$url = "http://127.0.0.1:$port"
Write-Host "VIBA is ready at $url" -ForegroundColor Green
Write-Host 'Keep the VIBA server window open while you use the app.'
Start-Process $url
Wait-Process -Id $server.Id
