# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Panel >> admin sidebar navigation tabs exist
- Location: src\__tests__\e2e\admin.spec.ts:52:3

# Error details

```
Error: browserType.launch: Failed to launch the browser process.
Browser logs:

<launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-hYsIZ9 -juggler-pipe -silent
<launched> pid=29276
[pid=29276][err] *** You are running in headless mode.
[pid=29276] <process did exit: exitCode=1, signal=null>
[pid=29276] starting temporary directories cleanup
Call log:
  - <launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-hYsIZ9 -juggler-pipe -silent
  - <launched> pid=29276
  - [pid=29276][err] *** You are running in headless mode.
  - [pid=29276] <process did exit: exitCode=1, signal=null>
  - [pid=29276] starting temporary directories cleanup
  - [pid=29276] <gracefully close start>
  - [pid=29276] <kill>
  - [pid=29276] <skipped force kill spawnedProcess.killed=false processClosed=true>
  - [pid=29276] finished temporary directories cleanup
  - [pid=29276] <gracefully close end>

```