@echo off
echo 🚀 Iniciando sistema na porta 3002...

echo 📦 Backend (porta 3002)...
cd backend
start "Backend" cmd /k "npm run dev"

echo 📦 Frontend (porta 3000)...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo ✅ Sistema iniciado!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:3002
pause