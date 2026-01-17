# How to Run Wafir Locally

Follow these steps to run the application components on your machine ("outside the container").

## 0. Prerequisites
- **Node.js**: Installed (Verified).
- **Docker**: Installed (Verified).
- **Flutter**: You must add Flutter to your PATH environment variable.
  - Your path is: `G:\flutter\bin`
  - [How to add to PATH on Windows](https://www.java.com/en/download/help/path.xml) (Look for "Environment Variables").

---

## 1. Start the Database
The backend requires a PostgreSQL database. The easiest way is using Docker.

1. Open a terminal in `F:\Wafir`.
2. Run:
   ```powershell
   docker compose up -d postgres
   ```
   (This runs the database in the background).

---

## 2. Run the Backend API
1. Open a **new** terminal.
2. Navigate to backend:
   ```powershell
   cd backend
   ```
3. Install dependencies (if not done):
   ```powershell
   npm install
   ```
4. Start the server:
   ```powershell
   npm run start:dev
   ```
   *The server should start on port 3000.*

---

## 3. Run the Web App ("HTML")
1. Open a **new** terminal.
2. Navigate to web:
   ```powershell
   cd web
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Start the dev server:
   ```powershell
   npm run dev
   ```
5. Open your browser and go to: **[http://localhost:5173](http://localhost:5173)**

---

## 4. Run on Mobile (Phone)
**Note:** You must have the Flutter PATH configured (Step 0) and your Android phone connected via USB with **USB Debugging** enabled.

1. Open a **new** terminal.
2. Navigate to mobile:
   ```powershell
   cd mobile
   ```
3. Check if your phone is connected:
   ```powershell
   flutter devices
   ```
4. Run the app:
   ```powershell
   flutter run --release
   ```
   
### Alternative: Build APK
If you want to just generate the file to send to your phone:
1. Run:
   ```powershell
   flutter build apk --release
   ```
2. The file will be at: `mobile/build/app/outputs/flutter-apk/app-release.apk`
3. Send this file to your phone and install it.
