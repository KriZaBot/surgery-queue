# Patient Queue Management System (Demo Project)

## 📝 Project Overview
This is a demo project simulating a patient queue management system for surgical procedures. It demonstrates dynamic queue management, automatic position updates, and the full workflow: **Call List → Waiting Room → Admission → Trash.**

> **Note:** This is not a production system. It uses local SQLite and a Python venv for easy testing. No external database setup is required.

---

## ⚙️ Workflow / How it Works

### 1. Patient Entry & Access Codes
* **Registration:** Patients are registered with Name, EMBG, Phone, Diagnosis, and Operation.
* **Access Code:** Upon entry, the system generates a unique 6-character access code for the patient.
* **Automatic Positioning:** Each patient automatically receives a position in the Call List.
* **Top 10 Focus:** The system displays the top 10 patients for daily handling. As patients move, the next in line automatically fills the active top 10.

### 2. Call List Management
Staff manages the queue with single-click actions:
* **Confirm:** Moves patient to the Waiting Room.
* **Urgent:** Immediately prioritizes the patient at the top of the queue.
* **Cancel:** Moves patient to Trash.
* **Action Reversal:** All moves can be undone, restoring the patient to their exact previous spot and auto-adjusting the rest of the queue via cascading updates.

### 3. Waiting Room & Daily Admission
* **Scheduling:** Confirmed patients appear in the Waiting Room, where staff schedules their arrival dates.
* **Daily Plan:** Staff can easily identify which patients are scheduled for today.
* **Finalizing:** Clicking **Примен (Admitted)** marks the patient as officially entered into the hospital, finalizing their journey.

### 4. Patient & Public Perspective
* **Tracking:** Patients use their EMBG + Access Code to see their real-time position.
* **Code Recovery:** A dedicated feature allows patients to recover a forgotten access code by verifying their EMBG and Phone Number.

### 5. Doctor Login & Security
* **PIN Access:** Doctors and nurses access the admin panel via a secure 6-digit PIN.
* **Auto-Logout:** For security, the system automatically logs out the user after 10 minutes (600,000ms) of inactivity, as defined in the frontend logic.

---

## 🛠 Tech Stack
* **Frontend:** React.js (Vite), React Router, Axios, Bootstrap 5.
* **Backend:** Django 6.0, Django REST Framework.
* **Database:** SQLite.
* **DevOps:** Docker, Docker Compose.

---

## 🌐 Access Points & Navigation

* **Patient Portal (Public):** `http://localhost:5173/` (No login required)
* **Doctor Login:** `http://localhost:5173/login` (Enter PIN to access Admin)
* **Admin Panel (Protected):** `http://localhost:5173/admin` (Requires active session/token)

---

## 🚀 How to Test

### Option 1: Docker (Recommended)
1. Clone the repository.
2. In the root folder, run:
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
* **Patients 1-2:** `confirmed` (Visible in Waiting Room)
* **Patients 3-4:** `priority` (At the top of the Call List)
* **Patients 5-6:** `canceled` (In Trash/Archive)
* **Patients 7-18:** `None` (Standard Queue)
* **EMBG format:** `0000000000001` to `0000000000018`
* **Access Codes:** Generated automatically. You can retrieve them from the `/admin` panel after logging in with a doctor PIN.

---

## 🛤 Roadmap & Future Enhancements
* **Automated Notifications:** SMS alerts when a patient is next in line.
* **Advanced Recovery:** Secure automated delivery of forgotten PINs and Access Codes via SMS/Email.
* **Validation:** Enhanced frontend regex for strict phone and EMBG formats.
* **UI/UX:** Real-time visual indicators and animations for queue transitions.

---

## 📌 Notes for Reviewers
* **Logic over Layout:** The priority of this demo is the complex synchronization between backend positioning and frontend state management.
* **Plug-and-Play:** The system is designed to be fully functional immediately after running the seed script or Docker command.
