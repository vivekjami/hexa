#!/bin/bash

# HEXA Research Copilot - Production Deployment Script
# This script helps deploy the application to Vercel

echo "🚀 HEXA Research Copilot v6.0 - Production Deployment"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Run build to check for errors
echo "🔧 Running production build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "📝 Don't forget to:"
    echo "   1. Set up environment variables in Vercel dashboard"
    echo "   2. Configure custom domain if needed"
    echo "   3. Test all features in production"
    echo "   4. Monitor logs and performance"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
