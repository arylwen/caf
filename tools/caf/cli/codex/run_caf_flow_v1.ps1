param(
  [Parameter(Mandatory=$true)]
  [string]$InstanceName,

  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]$CodexArgs
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here "..\..\..\..")
Set-Location $repo

& node "tools/caf/cli/codex/run_caf_flow_v1.mjs" $InstanceName @CodexArgs
exit $LASTEXITCODE
