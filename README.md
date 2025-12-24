# Cyber Table Sync - Restaurant Management System

An advanced, full-featured restaurant management application built with **React**, **TypeScript**, and **Firebase**.

## 🚀 Overview

Cyber Table Sync is a comprehensive solution designed for modern fine dining restaurants. It streamlines operations from the font-of-house to the kitchen, offering real-time synchronization of orders, table status, and inventory.

## ✨ Key Features

### 🖥️ Dashboard & Analytics
- **Real-time Overview**: Live tracking of active orders, revenue, and table occupancy.
- **Dynamic Stats**: Instant calculation of daily revenue and wait times.
- **Recent Orders**: Live feed of the latest orders placed.

### 🍽️ Menu Manager
- **CRUD Operations**: Add, edit, and delete dishes dynamically.
- **Availability Toggle**: Instantly mark items as "Out of Stock" or "Available" (synced with POS).
- **Categorization**: Organize items by courses (Starters, Mains, Desserts, etc.).

### 🛒 Inventory Management
- **Stock Tracking**: Monitor ingredient levels in real-time.
- **Low Stock Alerts**: Automatic visual warnings when items dip below thresholds.
- **Restock Action**: One-click restocking functionality.

### 🧾 POS (Point of Sale)
- **Table Selection**: Visual map for selecting tables.
- **Order Creation**: Interface for waiters to punch in orders with variants and notes.
- **Voice Ordering**: Integrated Web Speech API for voice-to-text order entry.

### 👨‍🍳 Kitchen Display System (KDS)
- **Live Order Board**: Orders appear instantly in the kitchen.
- **Status Workflow**: Drag-and-drop or click-to-move orders from `Pending` -> `Preparing` -> `Ready` -> `Served`.
- **Performance Optimized**: Efficient data fetching to prevent lag even during busy hours.

## 🛠️ Technology Stack

- **Frontend**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **Backend & Database**: Firebase (Firestore, Auth)
- **State Management**: Zustand, React Query
- **UI Components**: Shadcn/UI, Lucide React Icons

## ⚙️ Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd cyber-table-sync
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Firebase Configuration**:
    - Create a project in the [Firebase Console](https://console.firebase.google.com/).
    - Enable **Firestore Database** and **Authentication** (Email/Password).
    - Copy your web app config and update `src/integrations/firebase/client.ts`.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🏗️ Architecture Key Decisions

- **Client-Side Limits**: To support the Firebase Free Tier, logic often found in Cloud Functions (like payment mocking) was moved to the client side.
- **Performance**: The `useOrders` hook implements an optimized fetching strategy, loading metadata (tables/staff) once and performing synchronous lookups to avoid N+1 query performance issues.
- **Data Integrity**: strict sanitization is applied before writing to Firestore to prevent `undefined` field errors.

## 👥 Roles & Permissions

- **Admin**: Full access to all modules.
- **Manager**: Access to everything except critical system settings.
- **Waiter**: Access to POS, Table Map, and Orders.
- **Kitchen**: Access to KDS (Kitchen Display System) only.
