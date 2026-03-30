param(
  [Parameter(Mandatory=$true)]
  [string]$InstanceName,

  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]$ClaudeArgs
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here "..\..\..\..")
Set-Location $repo

& node "tools/caf/cli/claude/run_caf_flow_v1.mjs" $InstanceName @ClaudeArgs
exit $LASTEXITCODE
