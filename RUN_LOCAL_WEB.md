# Run Local Web Portal

This document is the operator-focused startup guide for the local FastAPI portal.

## Recommended Entrypoints

Recommended entrypoints on Windows:

```powershell
.\start_local.ps1
```

or:

```cmd
start_local.cmd
```

## What The Launcher Handles For You

- No manual `.env` setup is required for local startup.
- The launcher auto-creates `.venv` when needed.
- The launcher reinstalls both root and web-portal requirements.
- The launcher checks that `local_web_portal.app.main:app` imports successfully before starting Uvicorn.
- Embedding downloads are disabled by default during local startup.

## Python Support

Supported Python versions:

- `3.10+`

If you already have an old `.venv` created by Python `<3.10`, the launcher will recreate it automatically.

## Common Startup Commands

Optional flags:

```powershell
.\start_local.ps1 -BindHost 0.0.0.0 -Port 8010
.\start_local.ps1 -Reload
```

Manual startup is not recommended, because users often run the wrong global Python or a mismatched `uvicorn`.

## Preflight Checklist

Before reporting a startup bug, verify:

- Python is `3.10+`
- the project directory is writable
- the machine can install Python packages
- port `8010` is free, or a different port is provided
- you started the app with `.\start_local.ps1` or `start_local.cmd`
- you did not reuse a broken global `uvicorn` command from another environment

## Troubleshooting

### 1. `python -m uvicorn ...` fails but the repository launcher works

Use:

```powershell
.\start_local.ps1
```

Do not use a random global `uvicorn` from another Python installation.

### 2. `.env` is missing

That is not a blocker for local startup. The launcher and the web portal can run without manually creating `local_web_portal/.env`.

### 3. Existing `.venv` was created by the wrong Python version

Delete `.venv` and run the launcher again, or just rerun the launcher and let it recreate unsupported environments automatically.

### 4. `ModuleNotFoundError` or import failure at startup

Run the launcher again. It reinstalls:

- `requirements.txt`
- `local_web_portal/requirements.txt`

and checks that `local_web_portal.app.main:app` can be imported before starting the server.

### 4a. PowerShell says `param` or a parameter assignment is invalid

Use the latest repository version. Older launcher revisions had PowerShell parameter-layout issues that have already been fixed in `main`.

### 5. Port `8010` is already in use

Start the portal with another port:

```powershell
.\start_local.ps1 -Port 8011
```

### 6. PowerShell execution policy blocks `.ps1`

Use:

```cmd
start_local.cmd
```

This wrapper starts the PowerShell launcher with `ExecutionPolicy Bypass`.

### 7. The app starts but generation hangs for a long time

Check:

- `runs/<run_id>/worker.log`
- `runs/<run_id>/progress.log`

Long waits are often caused by provider-side API latency rather than local startup failure.
