# Turnuva Eslestirme - Windows IIS reverse proxy kurulumu
# YONETICI OLARAK CALISTIRIN (PowerShell'i sag tiklayip "Yonetici olarak calistir").
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup-iis.ps1
#
# Ne yapar: IIS + URL Rewrite + ARR kurar, ARR proxy modunu acar, Default Web
# Site'a bu reponun scripts\iis-web.config dosyasini kopyalar (tum istekleri
# localhost:3000'e, yani "npm run start" ile calisan Next.js sunucusuna
# yonlendiren bir ters proxy kurali).

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "1/5 IIS bilesenleri etkinlestiriliyor..."
$features = @(
  "IIS-WebServerRole",
  "IIS-WebServer",
  "IIS-CommonHttpFeatures",
  "IIS-HttpErrors",
  "IIS-HttpLogging",
  "IIS-RequestFiltering",
  "IIS-StaticContent",
  "IIS-DefaultDocument",
  "IIS-WebServerManagementTools",
  "IIS-ManagementConsole"
)
Enable-WindowsOptionalFeature -Online -FeatureName $features -NoRestart -All | Out-Null

Write-Host "2/5 URL Rewrite Module indiriliyor ve kuruluyor..."
$rewriteMsi = Join-Path $env:TEMP "rewrite_amd64_en-US.msi"
Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi" -OutFile $rewriteMsi
Start-Process msiexec.exe -ArgumentList "/i `"$rewriteMsi`" /qn /norestart" -Wait

Write-Host "3/5 Application Request Routing (ARR) indiriliyor ve kuruluyor..."
$arrMsi = Join-Path $env:TEMP "requestRouter_amd64.msi"
Invoke-WebRequest -Uri "https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi" -OutFile $arrMsi
Start-Process msiexec.exe -ArgumentList "/i `"$arrMsi`" /qn /norestart" -Wait

$appcmd = "$env:windir\System32\inetsrv\appcmd.exe"

Write-Host "4/5 ARR proxy modu ve X-Forwarded-Host degiskeni etkinlestiriliyor..."
& $appcmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost
& $appcmd set config -section:system.webServer/rewrite/allowedServerVariables "/+[name='HTTP_X_FORWARDED_HOST']" /commit:apphost

Write-Host "5/5 web.config Default Web Site'a kopyalaniyor..."
Copy-Item (Join-Path $repoRoot "scripts\iis-web.config") "C:\inetpub\wwwroot\web.config" -Force

Write-Host ""
Write-Host "Tamamlandi. IIS'i yeniden baslatin: iisreset"
Write-Host "Test: tarayicida http://localhost adresini acin - Next.js sitesini gostermeli"
Write-Host "(Next.js sunucusunun 'npm run start' ile localhost:3000'de calisiyor olmasi gerekir)"
