# Carevo – Hospital Management System App

Carevo is a cross-platform hospital management mobile application built with **React Native**, **Expo**, and **Firebase Firestore**.  
It provides a unified and efficient experience for patients, doctors, nurses, receptionists, and administrators to manage medical records, appointments, schedules, and hospital workflow.

---
## App Screenshots

<img src="https://github.com/user-attachments/assets/61f1cb49-cb03-4579-9147-97c3e5f5acfa" width="160"/>
<img src="https://github.com/user-attachments/assets/a2854b65-9ba8-407d-a35d-f2dd7a5a6838" width="180"/>
<img src="https://github.com/user-attachments/assets/f90835cd-92f6-4053-bd83-4ac8d67268eb" width="150"/>

<img src="https://github.com/user-attachments/assets/fe01dc58-0428-4a9a-b16a-17754b0ef31d" width="150"/>
<img src="https://github.com/user-attachments/assets/ed9b00c2-1159-485e-9578-d1288644ce27" width="150"/>



## Features

### Patient Features
- Create an account and sign in.
- Browse available clinics and doctors.
- Book appointments.
- Cancel appointments.
- View personal medical records.
- See upcoming and previous appointments.

---

### Doctor Features
- Add and manage available time slots.
- View upcoming patient appointments.
- Access patient medical records.
- View nurse shifts related to their department.

---

### Nurse Features
- See assigned shifts.
- View patient medical records when needed for care.

---

### Receptionist Features
- Register walk-in patients without an appointment.
- Register new patients who do not have accounts.
- Manage basic patient information.

---

### Admin Features
- Manage accounts and roles for:
  - Doctors  
  - Nurses  
  - Receptionists  
- Oversee system-wide access permissions.

---

## Tech Stack

### Frontend
- React Native  
- Expo Go  

### Backend
- Firebase Firestore (NoSQL database)  
- Firebase Authentication
---

## App Architecture
- Modular screens for each user type  
- Role-based access control using Firebase Authentication  
- Realtime updates using Firestore listeners  
- Firestore Security Rules for secure data access  

---

## How to Run the App

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/Carevo.git
    cd Carevo
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the app:

    ```bash
    npx expo start
    ```
4. Run the app on:
   - Expo Go mobile app
   - Android emulator
   - iOS simulator (macOS)

### Scan this QR code to download the app

<img src="https://github.com/user-attachments/assets/bbf9c8ef-1462-452e-be4a-976128b840d4" alt="QR-Code for App" width="150"/>
