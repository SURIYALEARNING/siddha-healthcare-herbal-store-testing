# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Panel >> admin staff tab is accessible
- Location: src\__tests__\e2e\admin.spec.ts:189:3

# Error details

```
Error: browserType.launch: Failed to launch the browser process.
Browser logs:

<launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-cEKXSD -juggler-pipe -silent
<launched> pid=26516
[pid=26516][err] *** You are running in headless mode.
[pid=26516] <process did exit: exitCode=1, signal=null>
[pid=26516] starting temporary directories cleanup
Call log:
  - <launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-cEKXSD -juggler-pipe -silent
  - <launched> pid=26516
  - [pid=26516][err] *** You are running in headless mode.
  - [pid=26516] <process did exit: exitCode=1, signal=null>
  - [pid=26516] starting temporary directories cleanup
  - [pid=26516] <gracefully close start>
  - [pid=26516] <kill>
  - [pid=26516] <skipped force kill spawnedProcess.killed=false processClosed=true>
  - [pid=26516] finished temporary directories cleanup
  - [pid=26516] <gracefully close end>

```