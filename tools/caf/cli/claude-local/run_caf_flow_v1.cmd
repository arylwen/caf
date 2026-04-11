@echo off
setlocal

if "%~1"=="" (
  echo Usage: tools\caf\cli\claude-local\run_caf_flow_v1.cmd ^<instance_name^> [claude args...]
  exit /b 2
)

set "HERE=%~dp0"
pushd "%HERE%\..\..\..\.." >nul
set "INSTANCE_NAME=%~1"
shift

node tools\caf\cli\claude-local\run_caf_flow_v1.mjs "%INSTANCE_NAME%" %*
set "EXITCODE=%ERRORLEVEL%"
popd >nul
exit /b %EXITCODE%
