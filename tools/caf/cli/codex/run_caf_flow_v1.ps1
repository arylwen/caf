param(
  [Parameter(Mandatory=$true)]
  [string]$InstanceName
)

$ErrorActionPreference = 'Stop'

function Assert-Codex {
  $codex = Get-Command codex -ErrorAction SilentlyContinue
  if (-not $codex) {
    Write-Error "codex CLI not found on PATH. Install Codex CLI and retry."
  }
}

function Get-RepoRoot {
  $here = Split-Path -Parent $MyInvocation.MyCommand.Path
  return (Resolve-Path (Join-Path $here "..\..\.."))
}

function Get-SkillsDir([string]$RepoRoot) {
  $active = Join-Path $RepoRoot "tools\caf-state\active_skillpack.json"
  if (Test-Path $active) {
    $txt = Get-Content $active -Raw
    if ($txt -match '"active_pack"\s*:\s*"portable"') {
      return "skills_portable"
    }
  }
  return "skills"
}

function Check-Packets([string]$PacketsDir) {
  if (Test-Path $PacketsDir) {
    $files = Get-ChildItem $PacketsDir -Filter "BP-*.md" | Sort-Object Name
    if ($files.Count -gt 0) {
      Write-Error ("STOP: feedback packet produced: {0}" -f $files[0].FullName)
    }
  }
}

function Run-Skill([string]$RepoRoot, [string]$SkillPath, [string]$InputHint) {
  $prompt = @"
Follow the CAF skill instructions at: $SkillPath

Inputs:
$InputHint

Rules:
- Treat the SKILL file as authoritative.
- Execute only what the SKILL requires.
- Do not refactor or modify CAF framework files.
- If you produce a feedback packet, stop and print its path.
"@

  & codex -C $RepoRoot exec --ephemeral --ask-for-approval never --sandbox workspace-write $prompt | Out-Null
}

Assert-Codex
$repo = Get-RepoRoot
Set-Location $repo
$skillsDir = Get-SkillsDir -RepoRoot $repo
$packetsDir = Join-Path $repo ("reference_architectures\{0}\feedback_packets" -f $InstanceName)

Run-Skill -RepoRoot $repo -SkillPath (Join-Path $repo "$skillsDir\caf-saas\SKILL.md") -InputHint ("instance_name={0}" -f $InstanceName)
Check-Packets $packetsDir

Run-Skill -RepoRoot $repo -SkillPath (Join-Path $repo "$skillsDir\caf-arch\SKILL.md") -InputHint ("instance_name={0}" -f $InstanceName)
Check-Packets $packetsDir

Run-Skill -RepoRoot $repo -SkillPath (Join-Path $repo "$skillsDir\caf-next\SKILL.md") -InputHint ("instance_name={0}`napply" -f $InstanceName)
Check-Packets $packetsDir

Run-Skill -RepoRoot $repo -SkillPath (Join-Path $repo "$skillsDir\caf-arch\SKILL.md") -InputHint ("instance_name={0}" -f $InstanceName)
Check-Packets $packetsDir

Run-Skill -RepoRoot $repo -SkillPath (Join-Path $repo "$skillsDir\caf-build-candidate\SKILL.md") -InputHint ("instance_name={0}" -f $InstanceName)
Check-Packets $packetsDir

Write-Host ("DONE: caf flow completed without feedback packets for instance: {0}" -f $InstanceName)
