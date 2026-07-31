# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Panel >> admin can view analytics date presets
- Location: src\__tests__\e2e\admin.spec.ts:133:3

# Error details

```
Error: browserType.launch: Failed to launch the browser process.
Browser logs:

<launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-J4Tqfa -juggler-pipe -silent
<launched> pid=9072
[pid=9072][err] *** You are running in headless mode.
[pid=9072] <process did exit: exitCode=1, signal=null>
[pid=9072] starting temporary directories cleanup
Call log:
  - <launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-J4Tqfa -juggler-pipe -silent
  - <launched> pid=9072
  - [pid=9072][err] *** You are running in headless mode.
  - [pid=9072] <process did exit: exitCode=1, signal=null>
  - [pid=9072] starting temporary directories cleanup
  - [pid=9072] <gracefully close start>
  - [pid=9072] <kill>
  - [pid=9072] <skipped force kill spawnedProcess.killed=false processClosed=true>
  - [pid=9072] finished temporary directories cleanup
  - [pid=9072] <gracefully close end>

```