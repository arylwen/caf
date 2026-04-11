param(
  [Parameter(Mandatory=$true)]
  [string]$InstanceName,

  [Parameter(ValueFromRemainingArguments=$true)]
  [string[]]$ClaudeLocalArgs
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path (Join-Path $here "..\..\..\..")
Set-Location $repo

& node "tools/caf/cli/claude-local/run_caf_flow_v1.mjs" $InstanceName @ClaudeLocalArgs
exit $LASTEXITCODE
