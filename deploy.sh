#!/bin/bash
# Van Fleet Calendar - Quick Deployment Script

echo "🚐 Van Fleet Calendar - Production Deployment"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📋 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (default: Deploy van fleet calendar): " commit_msg
commit_msg=${commit_msg:-"Deploy van fleet calendar"}
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Setting up GitHub repository..."
    read -p "Enter your GitHub username: " github_username
    read -p "Enter repository name (default: van-fleet-calendar): " repo_name
    repo_name=${repo_name:-"van-fleet-calendar"}
    
    echo "📡 Adding remote origin..."
    git remote add origin "https://github.com/$github_username/$repo_name.git"
    
    echo "🌟 Create repository at: https://github.com/new"
    echo "Repository name: $repo_name"
    echo "Make it public for GitHub Pages to work"
    read -p "Press Enter when repository is created..."
fi

# Set main branch
git branch -M main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "🌐 Your calendar will be available at:"
github_url=$(git remote get-url origin)
username=$(echo $github_url | sed 's/.*github.com[:/]\([^/]*\)\/.*/\1/')
repo=$(echo $github_url | sed 's/.*\/\([^.]*\).*/\1/')
echo "   https://$username.github.io/$repo/calendar-production.html"
echo ""
echo "⚙️  Next steps:"
echo "   1. Go to GitHub repository settings"
echo "   2. Enable GitHub Pages (Pages → Deploy from branch → main)"
echo "   3. Wait 5-10 minutes for deployment"
echo "   4. Test your live application"
echo ""
echo "📱 Features enabled:"
echo "   ✅ Real Google Calendar integration"
echo "   ✅ Mobile-responsive design"
echo "   ✅ Progressive Web App (PWA)"
echo "   ✅ Offline support"
echo "   ✅ Professional error handling"
echo ""
echo "🎉 Your van fleet calendar is ready for production!"
