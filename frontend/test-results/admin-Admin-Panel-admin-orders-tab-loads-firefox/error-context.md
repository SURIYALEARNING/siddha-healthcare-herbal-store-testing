# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Panel >> admin orders tab loads
- Location: src\__tests__\e2e\admin.spec.ts:160:3

# Error details

```
Error: browserContext.newPage: Target page, context or browser has been closed
Browser logs:

<launching> C:\Users\LHCC\AppData\Local\ms-playwright\firefox-1538\firefox\firefox.exe -no-remote -headless -profile C:\Users\LHCC\AppData\Local\Temp\playwright_firefoxdev_profile-9M5JAe -juggler-pipe -silent
<launched> pid=31660
[pid=31660][err] *** You are running in headless mode.
[pid=31660][err] JavaScript warning: resource://services-settings/Utils.sys.mjs, line 119: unreachable code after return statement
[pid=31660][out] 
[pid=31660][out] Juggler listening to the pipe
[pid=31660][out] Crash Annotation GraphicsCriticalError: |[0][GFX1-]: RenderCompositorSWGL failed mapping default framebuffer, no dt (t=1.16855) [GFX1-]: RenderCompositorSWGL failed mapping default framebuffer, no dt
```