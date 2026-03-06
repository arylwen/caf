#!/usr/bin/env bash
set -euo pipefail

INSTANCE_NAME="${1:-}"
if [[ -z "${INSTANCE_NAME}" ]]; then
  echo "Usage: bash tools/caf/cli/run_caf_flow_v1.sh <instance_name>" >&2
  exit 2
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI not found on PATH. Install Codex CLI and retry." >&2
  exit 2
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "${REPO_ROOT}"

# Respect active skillpack (portable vs default) for which SKILL files to point Codex at.
SKILLS_DIR="skills"
if [[ -f "tools/caf-state/active_skillpack.json" ]] && grep -q '"active_pack"[[:space:]]*:[[:space:]]*"portable"' "tools/caf-state/active_skillpack.json"; then
  SKILLS_DIR="skills_portable"
fi

PACKETS_DIR="reference_architectures/${INSTANCE_NAME}/feedback_packets"

check_packets() {
  if [[ -d "${PACKETS_DIR}" ]]; then
    local first
    first=$(ls "${PACKETS_DIR}"/BP-*.md 2>/dev/null | sort | head -n 1 || true)
    if [[ -n "${first}" ]]; then
      echo "STOP: feedback packet produced: ${first}" >&2
      exit 1
    fi
  fi
}

run_skill() {
  local skill_path="$1"
  local input_hint="$2"

  local prompt
  prompt=$(cat <<EOF
Follow the CAF skill instructions at: ${skill_path}

Inputs:
${input_hint}

Rules:
- Treat the SKILL file as authoritative.
- Execute only what the SKILL requires.
- Do not refactor or modify CAF framework files.
- If you produce a feedback packet, stop and print its path.
EOF
)

  codex -C "${REPO_ROOT}" exec --ephemeral --ask-for-approval never --sandbox workspace-write "${prompt}" 1>/dev/null
}

# Step 1: init
run_skill "${SKILLS_DIR}/caf-saas/SKILL.md" "instance_name=${INSTANCE_NAME}"
check_packets

# Step 2: arch
run_skill "${SKILLS_DIR}/caf-arch/SKILL.md" "instance_name=${INSTANCE_NAME}"
check_packets

# Step 3: next apply=true
run_skill "${SKILLS_DIR}/caf-next/SKILL.md" "instance_name=${INSTANCE_NAME}\napply=true"
check_packets

# Step 4: arch again
run_skill "${SKILLS_DIR}/caf-arch/SKILL.md" "instance_name=${INSTANCE_NAME}"
check_packets

# Step 5: build
run_skill "${SKILLS_DIR}/caf-build-candidate/SKILL.md" "instance_name=${INSTANCE_NAME}"
check_packets

echo "DONE: caf flow completed without feedback packets for instance: ${INSTANCE_NAME}" >&2
