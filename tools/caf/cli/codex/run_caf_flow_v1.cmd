@echo off
setlocal

if "%~1"=="" (
  echo Usage: tools\caf\cli\codex\run_caf_flow_v1.cmd ^<instance_name^> [codex args...]
  exit /b 2
)

set "HERE=%~dp0"
pushd "%HERE%\..\..\..\.." >nul
set "REPO_ROOT=%CD%"
set "INSTANCE_NAME=%~1"
shift

node tools\caf\cli\codex\run_caf_flow_v1.mjs "%INSTANCE_NAME%" %*
set "EXITCODE=%ERRORLEVEL%"
popd >nul
exit /b %EXITCODE%
