---
description: How to seed the database with the initial 'Super Admin' user.
---

# How to Add the First Admin (Super Admin)

Since the `admins` collection is protected and initially empty, you cannot log in or create users through the UI. You must manually seed the first "Super Admin" directly into your database (Firebase Firestore or MongoDB).

## Option 1: Using a Seeder Script (Recommended for Developers)

If you are running this locally with Node.js/MongoDB, you can run a script.

1.  **Create/Locate** `server/seeder.js`.
2.  **Add** the admin seeding logic:
    ```javascript
    // Example for MongoDB / Mongoose
    const adminUser = {
      name: "Super Admin",
      email: "admin@college.edu",
      password: "hashed_password_here", // Ensure you hash "admin123" with bcrypt
      role: "Super Admin",
      permissions: { canDelete: true, canInvite: true, canEditSettings: true },
      isTwoFactorEnabled: false
    };
    await Admin.create(adminUser);
    ```
3.  **Run** the seeder:
    ```bash
    node server/seeder.js
    ```

## Option 2: Manual Entry via Firebase Console (If using Firebase)

1.  Go to the **Firebase Console** -> **Firestore Database**.
2.  Click **"Start collection"**.
3.  **Collection ID**: `admins`
4.  **Document ID**: *(Auto-ID or a specific string like `super_admin_01`)*
5.  **Fields**:
    *   `email` (string): `admin@college.edu`
    *   `name` (string): `Super Admin`
    *   `role` (string): `Super Admin`
    *   `permissions` (map):
        *   `canDelete`: `true`
        *   `canInvite`: `true`
        *   `canEditSettings`: `true`
6.  Go to **Authentication** tab -> **Add User**.
    *   Email: `admin@college.edu`
    *   Password: `password123`
    *   *Copy the **User UID** created here and use it as the Document ID in step 4 for best practice.*

## Option 3: Manual Entry via MongoDB Compass (If using MongoDB)

1.  Open **MongoDB Compass** and connect to your local/cloud DB.
2.  Create collection `admins`.
3.  Insert Document:
    ```json
    {
      "name": "Super Admin",
      "email": "admin@college.edu",
      "password": "$2a$10$YourHashedPasswordString...", 
      "role": "Super Admin",
      "permissions": {
        "canDelete": true,
        "canInvite": true,
        "canEditSettings": true
      }
    }
    ```
    *(Note: You must generate a bcrypt hash for the password manually using an online generator or a simple node script).*
