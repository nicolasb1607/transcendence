#!/bin/sh

# Load PNPM
source /root/.shrc

# Install & build game
cd /usr/src/app/frontend/game && 
	rm -rf pnpm-lock.yaml &&
	env > .env &&
	pnpm install --force &&
	pnpm update && 
	pnpm run build &&
	pnpm run build:spatial

# Install & build frontend
cd /usr/src/app/frontend/sources &&
	rm -rf pnpm-lock.yaml .env &&
	env > .env &&
	pnpm install --force && 
	pnpm update &&
	pnpm run build

# Install & build backend
cd /usr/src/app &&
	rm -rf ./frontend pnpm-lock.yaml dist/frontend &&
	pnpm install --force &&
	pnpm update &&
	pnpm i multer &&
	pnpm run ssl &&
	pnpm run build:docker

node dist/src/main.js