#!/bin/bash
npm link
opencode plugin "`pwd`" -g
node scripts/install.cjs
