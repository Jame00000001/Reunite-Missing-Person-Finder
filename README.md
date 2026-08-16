Reunite – Missing Person Finder 🔍

University Software Engineering Project

A full-stack web application designed to help families and guardians report, search, track, and locate missing children and elderly people, with emergency helpline integration and administrator verification.

⸻

⚡ Quick Start in 1 Minute

You do not need to install XAMPP or MySQL to run the application immediately.
The project includes a built-in database system that can automatically save and load application data.

Run the project with just 3 commands:

# 1. Install the project dependencies
npm install
# 2. Create the environment file
# Windows PowerShell
Copy-Item .env.example .env
# Git Bash / macOS / Linux
cp .env.example .env
# 3. Start the application
npm run dev

Then open your browser and go to:

http://localhost:3000

⸻

📋 Table of Contents

1. Quick Start
2. Login Credentials
3. Step-by-Step VS Code Guide
4. Optional MySQL / XAMPP Setup
5. Troubleshooting

⸻

🔑 1. Login Credentials

You can use the following demo accounts to log in.

You can also use the “⚡ Demo Admin” or “⚡ Demo Guardian” buttons on the login screen for one-click demo access.

Role	Email	Password	Permissions
System Admin	admin@reunite.org	admin123	Approve/reject pending cases, change case status, and view all users
Guardian / User	user@example.com	user123	Submit missing/found reports, edit reports, and mark a case as reunited
Volunteer User	sarah@example.com	user123	Submit and track reports

Note: These are demo credentials intended for testing and project demonstration.

⸻

💻 2. Step-by-Step VS Code Guide

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

⸻

Step 4: Start the Application

Run:

npm run dev

The development server will start.

Open your browser and visit:

http://localhost:3000

⸻

🗄️ 3. Optional MySQL / XAMPP Setup

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

🛠️ 4. Troubleshooting

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

Then create the environment file:

cp .env.example .env

or, on Windows PowerShell:

Copy-Item .env.example .env

Finally:

npm run dev

Open:

http://localhost:3000

and log in using one of the demo accounts.

⸻

🎯 Project Goal

The main goal of Reunite – Missing Person Finder is to provide a simple and organized web-based platform that can help families, guardians, volunteers, and administrators manage missing-person cases and support the process of safely reuniting missing people with their families.