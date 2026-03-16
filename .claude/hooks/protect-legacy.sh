#!/bin/bash
# Protect legacy CSS files from being modified

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" 2>/dev/null)

if [[ "$FILE_PATH" == *"custom-style"* ]]; then
  echo "❌ Blocked: '$FILE_PATH' is a legacy file — Do NOT modify custom-style/" >&2
  exit 2
fi

exit 0
