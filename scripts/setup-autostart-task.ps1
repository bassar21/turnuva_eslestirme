# Next.js prod sunucusunu oturum acilisinda otomatik baslatan Gorev
# Zamanlayici kaydi olusturur. YONETICI OLARAK CALISTIRIN.
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup-autostart-task.ps1
#
# NOT: Once elle baslattiginiz "npm run dev" / "npm run start" pencereleri
# varsa kapatin - ayni 3000 portunu kullanamazlar.

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

$action = New-ScheduledTaskAction -Execute (Join-Path $repoRoot "scripts\run-prod.cmd")
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName "TurnuvaEslestirmeApp" -Action $action -Trigger $trigger -Settings $settings -Description "Turnuva eslestirme Next.js prod sunucusu (npm run start)" -Force | Out-Null

Write-Host "Kayit edildi: 'TurnuvaEslestirmeApp' gorevi bundan sonraki oturum acilislarinda otomatik baslayacak."
Write-Host "Simdi hemen baslatmak icin: Start-ScheduledTask -TaskName TurnuvaEslestirmeApp"
