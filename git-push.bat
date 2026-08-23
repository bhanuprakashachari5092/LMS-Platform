@echo off
echo ==============================================
echo  Kaizen Q LMS - Git Push Script
echo ==============================================
cd /d "d:\LMS_STARTUP\LMS-Platform"

echo [1/3] Staging all changes...
git add -A

echo [2/3] Creating commit...
git commit -m "fix: restore custom PDF certificate layout, correct slides call, skip dummy key crash"

echo [3/3] Pushing to GitHub main...
git push origin main

echo.
echo ==============================================
echo  DONE! Check GitHub now.
echo ==============================================
pause
