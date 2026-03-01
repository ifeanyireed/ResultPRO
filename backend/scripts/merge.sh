#!/bin/bash
cd /Users/user/Desktop/ResultPRO

# Set git to not use pager
export GIT_PAGER=cat

# Merge remote main, preferring local changes
git merge -Xours origin/main --no-edit

# If merge was successful, push
if [ $? -eq 0 ]; then
  echo "✅ Merge successful"
  git push origin main
  echo "✅ Push successful"
else
  echo "❌ Merge failed"
  exit 1
fi
