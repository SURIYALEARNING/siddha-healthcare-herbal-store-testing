# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Panel >> admin header shows sign out button
- Location: src\__tests__\e2e\admin.spec.ts:79:3

# Error details

```
Error: browserType.launch: Failed to launch the browser process.
Browser logs:

<launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-6754js -juggler-pipe -silent
<launched> pid=22928
[pid=22928][err] *** You are running in headless mode.
[pid=22928] <process did exit: exitCode=1, signal=null>
[pid=22928] starting temporary directories cleanup
Call log:
  - <launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-6754js -juggler-pipe -silent
  - <launched> pid=22928
  - [pid=22928][err] *** You are running in headless mode.
  - [pid=22928] <process did exit: exitCode=1, signal=null>
  - [pid=22928] starting temporary directories cleanup
  - [pid=22928] <gracefully close start>
  - [pid=22928] <kill>
  - [pid=22928] <skipped force kill spawnedProcess.killed=false processClosed=true>
  - [pid=22928] finished temporary directories cleanup
  - [pid=22928] <gracefully close end>

```