# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Panel >> admin login redirects to admin page
- Location: src\__tests__\e2e\admin.spec.ts:5:3

# Error details

```
Error: browserType.launch: Failed to launch the browser process.
Browser logs:

<launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-0FoSG6 -juggler-pipe -silent
<launched> pid=31492
[pid=31492][err] *** You are running in headless mode.
[pid=31492] <process did exit: exitCode=1, signal=null>
[pid=31492] starting temporary directories cleanup
Call log:
  - <launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-0FoSG6 -juggler-pipe -silent
  - <launched> pid=31492
  - [pid=31492][err] *** You are running in headless mode.
  - [pid=31492] <process did exit: exitCode=1, signal=null>
  - [pid=31492] starting temporary directories cleanup
  - [pid=31492] <gracefully close start>
  - [pid=31492] <kill>
  - [pid=31492] <skipped force kill spawnedProcess.killed=false processClosed=true>
  - [pid=31492] finished temporary directories cleanup
  - [pid=31492] <gracefully close end>

```