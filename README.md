# Carevo – Hospital Management System App

Carevo is a cross-platform hospital management mobile application built with **React Native**, **Expo**, and **Firebase Firestore**.  
It provides a unified and efficient experience for patients, doctors, nurses, receptionists, and administrators to manage medical records, appointments, schedules, and hospital workflow.

---

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
