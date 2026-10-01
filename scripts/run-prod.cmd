@echo off
cd /d "C:\Users\ozkur\Documents\GitHub\turnuva_eslestirme"
npm run start >> "%~dp0run-prod.log" 2>&1
