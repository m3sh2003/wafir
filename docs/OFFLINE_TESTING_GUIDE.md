# Offline Testing Guide

## 1. Start Backend & Web
We have a helper script to start the PostgreSQL database, Backend API, and Web Frontend.

Run in PowerShell:
```powershell
.\run_wafir_local.ps1
```

## 2. Start Mobile App
Open a new terminal window:
```powershell
cd mobile
flutter pub get
flutter run
```
*Make sure your Android device/emulator is connected.*

## 3. Verify Offline Mode
1. **Online**: Log in. Check the Dashboard. Ensure you see your "Net Worth".
2. **Go Offline**: Turn off WiFi/Data on the mobile device.
3. **Restart**: Close the app completely and open it again.
4. **Result**: The Dashboard should load instantly with the saved data.

## 4. Verify Sync
1. **Go Online**: Turn WiFi back on.
2. **Update Data**: Add a transaction or asset via the Web interface (or API).
3. **Refresh Mobile**: Tap the "Refresh" button on the Mobile Dashboard.
4. **Result**: The data updates to match the server.
