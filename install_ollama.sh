#!/bin/bash
npm install -g bun
bun install
bun run build
npm link
opencode plugin "`pwd`" -g
node scripts/install.cjs
