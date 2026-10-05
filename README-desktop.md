# Mosque Prayer Display Desktop App

This project is wrapped with Electrobun for Windows 11 x64. The app bundles the
existing prayer pages and schedule, opens fullscreen, and registers the installed
stable app to launch at the current user's Windows sign-in. Development builds do
not change Windows startup settings.

## Build prerequisites

- Hutch, installed with the official PowerShell command from the
  [Electrobun quick start](https://framework.blackboard.sh/electrobun/guides/quick-start/)
- Visual Studio Build Tools with the C++ workload and Windows SDK
- CMake

The Visual Studio and CMake installers may require administrator approval.

## Run and build

From this folder, run:

```powershell
$env:Path = "$HOME\.hutch\bin;$env:Path"
hutch run install
hutch run dev
hutch run build
```

The stable Windows installer bundle is written under `artifacts/`. Run the
installed app once to register it for future Windows sign-ins. Remove the
`MosquePrayerDisplay` value from
`HKCU\Software\Microsoft\Windows\CurrentVersion\Run` to disable autostart.