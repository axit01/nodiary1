# Final CampusOps Database Schema (Unified)

This schema supports the **Admin Panel** (React), **Faculty Mobile App**, and all features including Chat, Notifications, and Security.

## 1. Collection: `faculties` (Users)
*The root collection for all faculty members (Users).*

*   **Document ID**: `{faculty_uid}` (String - Firebase Auth UID)
*   **Fields**:
    *   `name`: `string`
    *   `email`: `string`
    *   `phone`: `string`
    *   `department`: `string` (e.g., "CS", "MECH")
    *   `designation`: `string` (e.g., "Professor")
    *   `status`: `string` (Values: `"free"`, `"busy"`, `"away"`)

    *   `role`: `string` (Default: `"faculty"`)
    *   `joinedAt`: `timestamp`
    *   `isTwoFactorEnabled`: `boolean`
    *   `lastPasswordChange`: `timestamp`

### 1.1 Sub-collection: `faculties/{uid}/tasks`
*   **Document ID**: `{task_id}` (Auto-generated)
*   **Fields**:
    *   `title`: `string`
    *   `description`: `string`
    *   `date`: `timestamp`
    *   `startTime`: `string` (Format: "HH:mm")
    *   `endTime`: `string` (Format: "HH:mm")
    *   `status`: `string` (Values: `"pending"`, `"inProgress"`, `"completed"`, `"overdue"`)
    *   `priority`: `string` (Values: `"low"`, `"medium"`, `"high"`)
    *   `isByAdmin`: `boolean`
    *   `assignedBy`: `string` (Admin UID)
    *   `createdAt`: `timestamp`

### 1.2 Sub-collection: `faculties/{uid}/timetable`
*   **Document ID**: `{slot_id}` (Auto-generated)
*   **Fields**:
    *   `subject`: `string`
    *   `room`: `string`
    *   `day`: `string` (e.g., "Monday")
    *   `startTime`: `string` (Format: "HH:mm")
    *   `endTime`: `string` (Format: "HH:mm")
    *   `classSection`: `string` (e.g., "CSE-A")

### 1.3 Sub-collection: `faculties/{uid}/notifications`
*   **Document ID**: `{notification_id}` (Auto-generated)
*   **Fields**:
    *   `title`: `string`
    *   `message`: `string`
    *   `type`: `string` (Values: `"task"`, `"meeting"`, `"security"`, `"chat"`)
    *   `isRead`: `boolean`
    *   `createdAt`: `timestamp`

### 1.4 Sub-collection: `faculties/{uid}/chats` (Personal Chats Metadata)
*Stores summary data for 1-on-1 chats in the user's list.*
*   **Document ID**: `{other_user_uid}` (String)
*   **Fields**:
    *   `participantName`: `string`

    *   `lastMessage`: `string`
    *   `lastMessageTime`: `timestamp`
    *   `unreadCount`: `number`

---

## 2. Collection: `admins`
*Stores admin profiles and permissions.*

*   **Document ID**: `{admin_uid}` (String)
*   **Fields**:
    *   `name`: `string`
    *   `email`: `string`
    *   `role`: `string` (Values: `"Super Admin"`, `"Admin"`, `"Editor"`, `"Viewer"`)
    *   `permissions`: `map<string, boolean>`
        *   `canDelete`: `boolean`
        *   `canInvite`: `boolean`
        *   `canEditSettings`: `boolean`

    *   `isTwoFactorEnabled`: `boolean`

---

## 3. Collection: `courses`
*Manage subjects/courses offered.*

*   **Document ID**: `{course_code}` (String, e.g., "CS101")
*   **Fields**:
    *   `name`: `string` (e.g., "Intro to Computer Science")
    *   `department`: `string`
    *   `credits`: `number`

---

## 4. Collection: `meetings` (Global)
*   **Document ID**: `{meeting_id}` (Auto-generated)
*   **Fields**:
    *   `title`: `string`
    *   `description`: `string`
    *   `date`: `timestamp`
    *   `startTime`: `string`
    *   `endTime`: `string`
    *   `location`: `string`
    *   `participants`: `array<string>` (List of Faculty UIDs)
    *   `status`: `string` (Values: `"scheduled"`, `"cancelled"`, `"completed"`)
    *   `organizerId`: `string` (Admin/Faculty UID)

---

## 5. Collection: `messages` (Chat System)
*Stores actual chat history.*

### 5.1 Document: `global_chat` (Group Chat)
*   **Sub-collection**: `messages`
    *   **Document ID**: `{message_id}` (Auto-generated)
    *   **Fields**:
        *   `senderId`: `string`
        *   `senderName`: `string`
        *   `text`: `string`
        *   `timestamp`: `timestamp`
        *   `type`: `string` (Values: `"text"`, `"image"`, `"file"`)
        *   `fileUrl`: `string` (Optional)

### 5.2 Document: `private_chats/{chat_id}` (1-on-1)
*   **Document ID**: `{chat_id}` (String: `uid1_uid2` sorted alphabetically)
*   **Sub-collection**: `messages`
    *   **Document ID**: `{message_id}` (Auto-generated)
    *   **Fields**:
        *   `senderId`: `string`
        *   `text`: `string`
        *   `timestamp`: `timestamp`
        *   `readBy`: `array<string>` (List of UIDs who read it)
        *   `type`: `string`

---

## 6. Collection: `departments`
*   **Document ID**: `{dept_id}` (String, e.g., "CS")
*   **Fields**:
    *   `name`: `string`
    *   `hodName`: `string`
    *   `hodId`: `string` (Faculty UID)
    *   `totalFaculty`: `number`
    *   `announcements`: `array<string>`

---

## 7. Collection: `settings` (Config)
*   **Document ID**: `config`
    *   **Fields**:
        *   `collegeName`: `string`
        *   `academicYear`: `string`
        *   `workingDays`: `array<string>` (e.g., `["Mon", "Tue"]`)

### 7.1 Sub-collection: `settings/config/active_sessions`
*   **Document ID**: `{session_id}` (Auto-generated)
*   **Fields**:
    *   `userId`: `string`
    *   `device`: `string` (e.g., "Windows PC - Chrome")
    *   `location`: `string`
    *   `ipAddress`: `string`
    *   `lastActive`: `timestamp`
