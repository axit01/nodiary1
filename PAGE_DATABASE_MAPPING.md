# Database Integration Guide per UI Page

This guide maps each frontend page in the Admin Panel to the precise Database Collections and Queries needed to power it completely.

---

## 1. Dashboard (`/`)
*Overview of system status.*

| UI Component | Data Source (Collection/Query) | Operation |
| :--- | :--- | :--- |
| **Total Faculty Card** | `faculties` | `COUNT(all documents)` |
| **Active Tasks Card** | `faculties/{uid}/tasks` (Collection Group Query*) | `COUNT(where status == "inProgress" OR status == "pending")` |
| **Meetings Today Card** | `meetings` | `COUNT(where date == TODAY)` |
| **Faculty Stats (Chart)** | `faculties` | Aggregate counts by `status` ("Free", "Busy") |
| **Weekly Activity (Chart)** | `meetings` & `tasks` | Aggregated count of completions over last 7 days |

*> **Note:** "Collection Group Query" allows querying all `tasks` sub-collections across all faculty users at once.*

---

## 2. Faculty Management (`/faculty`)
*List, Add, Edit, and Delete faculty members.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **Faculty List (Table)** | `faculties` | `GET ALL` (with Pagination & Search by `name`/`email`) |
| **Add Faculty (Modal)** | `faculties` | `create(doc)` (Auto-generate UID or use Auth UID) |
| **Edit Faculty** | `faculties/{uid}` | `update(fields)` |
| **Delete Faculty** | `faculties/{uid}` | `delete(doc)` (+ standard cleanup of sub-collections) |
| **Status Indicator** | `faculties` | Read `status` field |

---

## 3. Task Management (`/tasks`)
*Global view of all tasks assigned to faculty.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **Task Board/Grid** | `faculties/{uid}/tasks` (Group Query) | `GET ALL` tasks from all users OR specific user |
| **Create Task (Modal)** | `faculties/{assigned_uid}/tasks` | `add(doc)` (+ optional notification trigger) |
| **Edit Task** | `faculties/{uid}/tasks/{taskId}` | `update(fields)` |
| **Delete Task** | `faculties/{uid}/tasks/{taskId}` | `delete(doc)` |
| **Status Dropdown** | `faculties/{uid}/tasks/{taskId}` | update `status` ("pending" -> "completed") |
| **Assignee List** | `faculties` | `GET` `name` & `uid` (for Dropdown selection) |

---

## 4. Meetings & Events (`/meetings`)
*Schedule and manage college-wide or departmental meetings.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **Upcoming Today** | `meetings` | `GET (where date == TODAY)` |
| **All Scheduled (Table)** | `meetings` | `GET ALL (orderBy date ASC)` |
| **Schedule Meeting (Modal)** | `meetings` | `add(doc)` |
| **Cancel/Delete** | `meetings/{meetingId}` | `delete(doc)` |
| **Participant Selector** | `faculties` | `GET` `name` & `uid` (Multi-select) |

---

## 5. Class Schedule (`/schedule`)
*Weekly timetable management.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **Timetable Grid** | `faculties/{uid}/timetable` | `GET ALL` (for specific faculty) OR `GET` by Dept |
| **Department Filter** | `departments` | `GET` `name` (to list options) |
| **Edit/Add Class (Modal)** | `faculties/{uid}/timetable` | `add(doc)` or `update(doc)` |
| **Clear Slot** | `faculties/{uid}/timetable/{slotId}` | `delete(doc)` |

*> **Note:** The Schedule page typically requires a transformed view. You might query all timetables where `department == SelectedDept` and reconstruct the grid on the client side.*

---

## 6. Reports (`/reports`)
*Analytics and historical data.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **Workload Report** | `faculties` + `tasks` | Aggregation: Tasks assigned per Faculty |
| **Attendance/Status** | `faculties` | Snapshot of current `status` fields |
| **Task Completion** | `tasks` (Group Query) | Aggregation: Completed vs. Overdue tasks |
| **Recent Reports List** | *Local App State / Storage* | List of generated PDF metadata (if stored) |

---

## 7. Settings (`/settings`)
*Global application configuration.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **General Settings** | `settings/config` | `GET` & `UPDATE` (College Name, Year) |
| **Role Management** | `admins` | `GET` & `UPDATE` permissions |
| **Department List** | `departments` | `GET`, `ADD`, `DELETE` departments |

---

## 8. Login / Auth
*Authentication flow.*

| UI Component | Data Source | Operation |
| :--- | :--- | :--- |
| **Login Form** | Firebase Auth / `admins` | `signInWithEmailAndPassword()` then check `admins` collection |
