@echo off
setlocal enabledelayedexpansion

if "%~1"=="" (
  echo Usage: tools\caf\cli\run_caf_flow_v1.cmd ^<instance_name^>
  exit /b 2
)

where codex >nul 2>nul
if errorlevel 1 (
  echo ERROR: codex CLI not found on PATH. Install Codex CLI and retry.
  exit /b 2
)

set "INSTANCE_NAME=%~1"
set "REPO_ROOT=%~dp0\..\..\.."

REM Normalize repo root
pushd "%REPO_ROOT%" >nul
set "REPO_ROOT=%CD%"

set "SKILLS_DIR=skills"
if exist "tools\caf-state\active_skillpack.json" (
  findstr /i /c:"\"active_pack\"" "tools\caf-state\active_skillpack.json" | findstr /i /c:"portable" >nul
  if not errorlevel 1 set "SKILLS_DIR=skills_portable"
)

set "PACKETS_DIR=reference_architectures\%INSTANCE_NAME%\feedback_packets"

call :run_skill "%REPO_ROOT%\%SKILLS_DIR%\caf-saas\SKILL.md" "instance_name=%INSTANCE_NAME%"
call :check_packets

call :run_skill "%REPO_ROOT%\%SKILLS_DIR%\caf-arch\SKILL.md" "instance_name=%INSTANCE_NAME%"
call :check_packets

call :run_skill "%REPO_ROOT%\%SKILLS_DIR%\caf-next\SKILL.md" "instance_name=%INSTANCE_NAME%^^napply"
call :check_packets

call :run_skill "%REPO_ROOT%\%SKILLS_DIR%\caf-arch\SKILL.md" "instance_name=%INSTANCE_NAME%"
call :check_packets

call :run_skill "%REPO_ROOT%\%SKILLS_DIR%\caf-build-candidate\SKILL.md" "instance_name=%INSTANCE_NAME%"
call :check_packets

echo DONE: caf flow completed without feedback packets for instance: %INSTANCE_NAME%
exit /b 0

:run_skill
set "SKILL_PATH=%~1"
set "INPUT_HINT=%~2"

set "PROMPT=Follow the CAF skill instructions at: %SKILL_PATH%"
set "PROMPT=%PROMPT%^^n^^nInputs:^^n%INPUT_HINT%^^n^^nRules:^^n- Treat the SKILL file as authoritative.^^n- Execute only what the SKILL requires.^^n- Do not refactor or modify CAF framework files.^^n- If you produce a feedback packet, stop and print its path."

codex -C "%REPO_ROOT%" exec --ephemeral --ask-for-approval never --sandbox workspace-write "%PROMPT%" >nul
exit /b 0

:check_packets
if exist "%PACKETS_DIR%\BP-*.md" (
  for /f "delims=" %%F in ('dir /b /on "%PACKETS_DIR%\BP-*.md"') do (
    echo STOP: feedback packet produced: %PACKETS_DIR%\%%F
    exit /b 1
  )
)
exit /b 0
