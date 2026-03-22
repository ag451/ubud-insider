#!/bin/bash
# Deploy to Railway using their CLI

echo "Installing Railway CLI..."
npm install -g @railway/cli

echo "Please login to Railway (this will open a browser)..."
railway login

echo "Linking project..."
cd /root/.openclaw/workspace/ubud-insider
railway link

echo "Deploying..."
railway up

echo "Done! Check https://railway.app/dashboard"