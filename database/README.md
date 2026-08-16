# Reunite Database (MySQL)

This folder contains the complete SQL database definition and seed data for the **Reunite – Missing Person Finder** system.

## Database Details
- **Database Name**: `reunite_db`
- **Tables**:
  - `users`: User registration, authentication, roles (`user`, `admin`).
  - `reports`: Missing and Found person submissions with foreign key relationship to `users(id)`.

## Setup Instructions for MySQL

1. Open your terminal or MySQL Workbench:
```bash
mysql -u root -p
```

2. Run the SQL script to create the database and seed data:
```bash
mysql -u root -p < database/schema.sql
```

Or execute directly inside the MySQL CLI:
```sql
SOURCE database/schema.sql;
```

3. Default Demo Accounts:
- **Admin**: `admin@reunite.org` | Password: `admin123`
- **Regular User**: `user@example.com` | Password: `user123`
- **Second User**: `sarah@example.com` | Password: `user123`
