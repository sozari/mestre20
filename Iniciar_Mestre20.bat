@echo off
chcp 65001 >nul
cd /d "%~dp0app"
echo =========================================================
echo   MESTRE20 - Escudo do Mestre (Tormenta20 ^& Herois de Arton)
echo =========================================================
if not exist "node_modules" (
    echo Instalando pacotes na primeira execucao neste PC...
    call npm.cmd install --no-audit --no-fund
)
echo Iniciando servidor local e abrindo navegador...
call npm.cmd run dev
pause
