#!/usr/bin/env bash
input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null)
if printf '%s' "$cmd" | grep -qE '(^|[;&|]| )(npm|yarn|npx)( |$|[;&|])'; then
  echo "pnpm 고정 규칙: npm/yarn/npx 금지. pnpm 또는 pnpm dlx 사용." >&2
  exit 2
fi
exit 0
