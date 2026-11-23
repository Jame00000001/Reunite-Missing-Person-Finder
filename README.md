Reunite – Missing Person Finder 🔍

University Software Engineering Project

A full-stack web application designed to help families and guardians report, search, track, and locate missing children and elderly people, with emergency helpline integration and administrator verification.

⸻

⚡ Quick Start in 1 Minute

You do not need XAMPP or MySQL for the app. The application stores accounts and reports in Firebase, so configure the Firebase project before starting it.

Run the project with these steps:

# 1. Install the project dependencies
npm install
# 2. Create and configure the environment file
# Windows PowerShell
Copy-Item .env.example .env
# Git Bash / macOS / Linux
cp .env.example .env
# Edit .env with the Firebase Web App values described below.
# 3. Start the application
npm run dev

Then open your browser and go to:

http://localhost:3000

⸻

📋 Table of Contents

1. Quick Start
2. Login Credentials
3. Firebase Setup
4. Step-by-Step VS Code Guide
5. Optional MySQL / XAMPP Setup
6. Troubleshooting

⸻

🔑 1. Login Credentials

The app uses Firebase Authentication. Create an account with **Register** before signing in, then verify your email from the link Firebase sends. You can also choose **Continue with Google**. The legacy MySQL demo accounts (`admin@reunite.org`, `user@example.com`, and `sarah@example.com`) are not automatically created in Firebase Authentication and cannot be used unless an administrator provisions them in the Firebase project.

The verified bootstrap administrator email is configured in `src/lib/firebase.ts` and `firestore.rules`. Update both if you use a different administrator account.

⸻

🔥 2. Firebase Setup

### 1. Create a Firebase project and web app

1. Open [Firebase Console](https://console.firebase.google.com/) and create or select a project.
2. In **Project settings → General → Your apps**, add a **Web app** and copy its configuration values.
3. In **Project settings → General**, note the Firebase project ID.

### 2. Enable sign-in providers

In **Build → Authentication → Get started → Sign-in method**, enable:

- **Email/Password** (the Email/Password option, not Email link) for registration and password sign-in. See [Firebase email/password setup](https://firebase.google.com/docs/auth/web/password-auth).
- **Google**, and select a support email, for the Google sign-in button. See [Firebase Google sign-in setup](https://firebase.google.com/docs/auth/web/google-signin).

Save the settings. Email/password accounts must verify their email before the app creates their Firestore profile. Add `localhost` and your deployed site domain under **Authentication → Settings → Authorized domains** if they are not listed. Add the hostname only, without `http://` or a port; if you open the app using `127.0.0.1`, add that hostname too. Newer Firebase projects may not include `localhost` automatically.

### 3. Configure the Firestore database

1. In **Build → Firestore Database**, create the database used by the app.
2. Copy its database ID. For the default database, use `(default)`.
3. Set the same ID in `.env` as `VITE_FIRESTORE_DATABASE_ID` and `FIRESTORE_DATABASE_ID`, and in `firebase.json` as `firestore.database`.
4. From the project root, deploy the included Firestore rules:

```bash
npx firebase-tools login
npx firebase-tools deploy --only auth,firestore:rules --project reunite-missing-person-finder
```

When prompted, choose the same Firebase project configured below. The deployment enables Email/Password and Google providers and installs rules that protect pending reports and require verified accounts.

### 4. Set local Firebase values

Copy `.env.example` to `.env`, then set these values from the Firebase web app configuration and database:

```dotenv
VITE_FIREBASE_API_KEY="your-web-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_APP_ID="your-web-app-id"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIRESTORE_DATABASE_ID="(default)"
FIREBASE_PROJECT_ID="your-project-id"
FIRESTORE_DATABASE_ID="(default)"
```

`VITE_FIREBASE_*` values are public web-app configuration. Never put Firebase Admin service-account JSON, private keys, or Supabase service-role keys in a `VITE_` variable. The app falls back to `firebase-applet-config.json` when a corresponding `VITE_` value is blank.

The Express API uses the Firebase Admin SDK for token verification and notification storage. For local development, create a service account key from **Project settings → Service accounts**, store the JSON file outside this repository, and set `GOOGLE_APPLICATION_CREDENTIALS` to its absolute path. In Google-hosted environments, use Application Default Credentials instead. Never commit the service-account JSON file.

Restart `npm run dev` after changing `.env`. The Firebase project ID and Firestore database ID must match between the web app and Express server.

⸻

💻 3. Step-by-Step VS Code Guide

Step 1: Open the Project in VS Code

1. Download the project folder.
2. Extract/unzip the project folder if necessary.
3. Open VS Code.
4. Select File → Open Folder…
5. Select the Reunite-Missing-Person-Finder project folder.
6. Open the VS Code terminal by using:

Ctrl + ~

Or select:

Terminal → New Terminal

⸻

Step 2: Install Dependencies

Run the following command in the terminal:

npm install

This installs all required packages and dependencies for the project.

⸻

Step 3: Create the .env File

For Windows PowerShell:

Copy-Item .env.example .env

For Git Bash, macOS, or Linux:

cp .env.example .env

This creates the local .env configuration file from .env.example.

Fill in the Firebase values as described in [Firebase Setup](#-2-firebase-setup). Keep the Firebase Admin service-account key out of `.env` values prefixed with `VITE_` and never commit it.

⸻

Step 4: Start the Application

Run:

npm run dev

The development server will start.

Open your browser and visit:

http://localhost:3000

⸻

🗄️ 4. Optional MySQL / XAMPP Setup

If you want to connect the project to MySQL for university demonstration, follow these steps.

Step 1: Start XAMPP

Open the XAMPP Control Panel and start:

* Apache
* MySQL

⸻

Step 2: Open phpMyAdmin

Open your browser and visit:

http://localhost/phpmyadmin

⸻

Step 3: Create the Database

1. Click New from the left sidebar.
2. Enter the database name:

reunite_db

3. Click Create.

⸻

Step 4: Import the Database Schema

1. Select the reunite_db database.
2. Click the Import tab.
3. Click Choose File.
4. Select:

database/schema.sql

from the project folder.
5. Scroll down and click Import.

⸻

Step 5: Configure the Database

Open the project’s .env file and configure the database settings:

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=reunite_db

⸻

Step 6: Start the Application

After configuring MySQL, run:

npm run dev

The application should connect to the MySQL database using the configured environment variables.

⸻

🛠️ 5. Troubleshooting

### Firebase `auth/unauthorized-domain`

Open **Firebase Console → Authentication → Settings → Authorized domains** and add the hostname shown in your browser address bar (usually `localhost`). Do not include the protocol or port. This is required for Google popup/redirect authentication.

### Firebase sign-up or sign-in returns HTTP 400

Confirm **Email/Password** is enabled under **Authentication → Sign-in method** for the same project used by the app. If `.env` has no `VITE_FIREBASE_PROJECT_ID`, the app uses the project in `firebase-applet-config.json`. The Authentication request's Network response contains the specific Firebase error code.

PowerShell Script Disabled Error

If PowerShell shows a script execution policy error, run:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then run:

npm run dev

again.

⸻

Port 3000 Is Already in Use

If port 3000 is already being used by another application:

1. Close the application using port 3000, or
2. Change the development server port in the project’s configuration.

Depending on the project configuration, this may be located in:

package.json

or:

vite.config.ts

After changing the port, start the application again:

npm run dev

⸻

📌 Project Overview

Reunite – Missing Person Finder is a university Software Engineering project focused on helping families, guardians, and volunteers report and track missing-person cases.

The system provides functionality for:

* Reporting missing persons
* Reporting found persons
* Searching for cases
* Tracking reports
* Administrator verification
* Case status management
* User management
* Reuniting a missing person with their family or guardian
* Emergency helpline integration

The application is designed to provide a centralized platform where users can submit and manage missing-person information while administrators verify and manage reported cases.

⸻

👥 User Roles

System Admin

The administrator can:

* Review pending reports
* Approve reports
* Reject reports
* Change case status
* View users
* Manage reported cases

Guardian / User

A guardian or regular user can:

* Submit missing-person reports
* Submit found-person reports
* Edit reports
* Track cases
* Mark a person as reunited

Volunteer

A volunteer can:

* Submit reports
* Track reported cases
* Help provide information about missing or found persons

⸻

🔐 Security and Configuration

Environment variables should be stored in the .env file and should not be committed to GitHub.

Make sure .env is included in .gitignore:

.env

The .env.example file can be committed to GitHub because it is intended to provide the required configuration structure without exposing private credentials.

⸻

📁 Recommended Project Structure

A typical project structure should look similar to:

Reunite-Missing-Person-Finder/
│
├── database/
│   └── schema.sql
│
├── public/
│
├── src/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── vite.config.ts

The exact structure may vary depending on the implementation.

⸻

🚀 Running the Project

For a quick demonstration:

npm install

Then configure Firebase using the [Firebase Setup](#-2-firebase-setup) steps and create `.env`:

cp .env.example .env

or, on Windows PowerShell:

Copy-Item .env.example .env

Finally:

npm run dev

Open:

http://localhost:3000

and register a Firebase account, verify its email, then sign in. You can also use **Continue with Google** if Google sign-in is enabled.

⸻

🎯 Project Goal

The main goal of Reunite – Missing Person Finder is to provide a simple and organized web-based platform that can help families, guardians, volunteers, and administrators manage missing-person cases and support the process of safely reuniting missing people with their families.
