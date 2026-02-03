# Patient Queue Management System (TSX + Docker)

## 📝 Project Overview
This is a professional demo project simulating a patient queue management system for surgical procedures. It demonstrates dynamic queue management, automatic position updates, and a complete clinical workflow.

---

## ⚙️ Workflow / How it Works

### 1. Patient Entry & Access Codes
* **Registration:** Managed via the Admin Panel with EMBG and Phone validation.
* **Access Code:** System generates a unique 6-character code for patient tracking.
* **Automatic Positioning:** Real-time rank calculation. The "Top 10" list auto-fills as patients are processed.

### 2. Queue Logic & Type Safety
* **TSX Integration:** The system is fully migrated to **TypeScript**, ensuring strict data structures for patients and API responses.
* **Cascading Updates:** Actions like **Confirm**, **Urgent**, or **Cancel** trigger automatic position re-calculation for the entire queue.
* **Reversal:** Operations can be undone, restoring patients to their exact previous spots.

### 3. Waiting Room & Admission
* **Scheduling:** Confirmed patients move to the Waiting Room for date scheduling.
* **Finalizing:** The "Admitted" action marks the completion of the patient's queue journey.

### 4. Security
* **PIN Access:** Secure 6-digit PIN login for staff.
* **Session Management:** Automatic logout after 10 minutes of inactivity.

---

## 🛠 Tech Stack
* **Frontend:** React.js (Vite), **TypeScript (TSX)**, Axios, Bootstrap 5.
* **Backend:** Django 6.0, Django REST Framework.
* **Database:** SQLite.
* **DevOps:** Docker, Docker Compose.

---

## 🌐 Access Points

* **Patient Portal:** `http://localhost:5173/`
* **Doctor Login:** `http://localhost:5173/login` (PIN: `123451`)
* **Admin Panel:** `http://localhost:5173/admin`

---

## 🚀 How to Test (Docker Only)

The project is fully containerized. Docker handles migrations, dependencies, and database seeding automatically.

1. **Clone the repository.**
2. **In the root folder, run:**
   ```bash
   docker-compose up --build

### Option 2: **Backend:**
1. `cd backend`
2. `python -m venv venv` (and activate it)
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. `python seed.py`
6. `python manage.py runserver`

**Frontend:**
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 🔑 Test Credentials (from Seed Script)

### 👨‍⚕️ Doctor Accounts
| Username | PIN (Password) | Role |

| **doc1** | `123451`       | Superuser / Admin |
| **doc2** | `123452`       | Staff |
| **doc3** | `123453`       | Staff |

### 📁 Test Patient Data (18 Patients Generated)
**Initial Status Breakdown:**
* **Patients 1-18:** `None` (Standard Queue)
* **EMBG format:** `0000000000001` to `0000000000018`
* **Access Codes:** Generated automatically. You can retrieve them from the `/admin` panel after logging in with a doctor PIN.

---

### 🛤 Roadmap & Future Enhancements
* **Automated Notifications:** SMS alerts when a patient is next in line.
* **Advanced Recovery:** Secure automated delivery of forgotten PINs and Access Codes via SMS/Email.
* **Validation:** Enhanced frontend regex for strict phone and EMBG formats.
* **UI/UX:** Real-time visual indicators and animations for queue transitions.

---

### 📌 Notes for Reviewers
* **Logic over Layout:** The priority of this demo is the complex synchronization between backend positioning and frontend state management.
* **Plug-and-Play:** The system is designed to be fully functional immediately after running the seed script or Docker command.