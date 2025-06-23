@echo off
echo 🚐 Van Fleet Calendar - Production Deployment
echo ==============================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
)

REM Add all files
echo 📋 Adding files to git...
git add .

REM Commit changes
set /p commit_msg="Enter commit message (default: Deploy van fleet calendar): "
if "%commit_msg%"=="" set commit_msg=Deploy van fleet calendar
echo 💾 Committing changes...
git commit -m "%commit_msg%"

REM Check if remote exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 Setting up GitHub repository...
    set /p github_username="Enter your GitHub username: "
    set /p repo_name="Enter repository name (default: van-fleet-calendar): "
    if "%repo_name%"=="" set repo_name=van-fleet-calendar
    
    echo 📡 Adding remote origin...
    git remote add origin "https://github.com/%github_username%/%repo_name%.git"
    
    echo 🌟 Create repository at: https://github.com/new
    echo Repository name: %repo_name%
    echo Make it public for GitHub Pages to work
    pause
)

REM Set main branch
echo 🔧 Setting main branch...
git branch -M main

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Deployment Complete!
echo =======================
echo.
echo 🌐 Your calendar will be available at:
echo    https://YOUR_USERNAME.github.io/REPO_NAME/calendar-production.html
echo.
echo ⚙️  Next steps:
echo    1. Go to GitHub repository settings
echo    2. Enable GitHub Pages (Pages → Deploy from branch → main)
echo    3. Wait 5-10 minutes for deployment
echo    4. Test your live application
echo.
echo 📱 Features enabled:
echo    ✅ Real Google Calendar integration
echo    ✅ Mobile-responsive design
echo    ✅ Progressive Web App (PWA)
echo    ✅ Offline support
echo    ✅ Professional error handling
echo.
echo 🎉 Your van fleet calendar is ready for production!
echo.
pause
