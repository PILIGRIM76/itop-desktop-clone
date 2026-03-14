Set-Location "F:\Kimi_Agent_Клон iTop Desktop"

Write-Host "=== Cleaning Root Directory ==="

# Удаляем все .md кроме README.md и CLEANUP.md
Get-ChildItem -File | Where-Object { 
    $_.Extension -eq '.md' -and 
    $_.Name -ne 'README.md' -and 
    $_.Name -ne 'CLEANUP.md' 
} | Remove-Item -Force

# Удаляем .png
Get-ChildItem -File -Filter '*.png' | Remove-Item -Force

# Удаляем .tar.gz
Get-ChildItem -File -Filter '*.tar.gz' | Remove-Item -Force

# Удаляем специфичные файлы
Remove-Item -Force 'ziiVzj58' -ErrorAction SilentlyContinue
Remove-Item -Force '$null' -ErrorAction SilentlyContinue
Remove-Item -Force 'cleanup.js' -ErrorAction SilentlyContinue
Remove-Item -Force 'AI_AGENTS_GUIDE.md' -ErrorAction SilentlyContinue

Write-Host "=== Cleaning desktop-app ==="

# Удаляем .md файлы
Get-ChildItem 'desktop-app' -File -Filter '*.md' | Remove-Item -Force

# Удаляем .log файлы
Get-ChildItem 'desktop-app' -File -Filter '*.log' | Remove-Item -Force

# Удаляем тестовые файлы
Get-ChildItem 'desktop-app' -File -Filter 'test-*.js' | Remove-Item -Force

# Удаляем find-widgets.js
Remove-Item 'desktop-app\find-widgets.js' -Force -ErrorAction SilentlyContinue

Write-Host "=== Cleanup Complete! ==="
Write-Host ""
Write-Host "Remaining files in root:"
Get-ChildItem "F:\Kimi_Agent_Клон iTop Desktop" -File | Select-Object Name | Format-Table
