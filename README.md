# LUXE — Luxury Hair Salon & 4-Chair Management System 💈

A full-stack, state-of-the-art **Hair Salon Appointment & Chair Management System** built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, and persistent **SQLite database (`salon.db`)**.

---

## 🌟 Key Highlights & Capabilities

- 🔒 **Role-Based Authentication & Gated Approvals**:
  - Secure JWT bearer tokens and password hashing via `bcryptjs`.
  - Customer registrations default to **Pending Approval**. Pending, rejected, or suspended customers are strictly restricted from booking appointments until approved by the administrator.
  - No one can view pending or rejected customer profiles except the salon administrator inside the Admin Panel.
- 💈 **Real-Time 4-Chair Allocation Engine**:
  - Exactly 4 physical salon stations:
    - **Chair 1**: Master Styling Bay
    - **Chair 2**: Precision Cut Station
    - **Chair 3**: Color & Spa Suite
    - **Chair 4**: VIP Lounge Station
  - 5 Dynamic Statuses: `Available` (Emerald), `Booked` (Sky), `Occupied / In Service` (Purple), `Blocked` (Rose), `No-Show` (Red).
  - Sanitation & maintenance lockouts with custom reason logging.
- ⚡ **Collision-Free 4-Step Booking Wizard**:
  - Computes time overlap and duration-aware window math across all 4 chairs (`start_time + duration`), completely preventing double-bookings.
  - Step 1: Select signature service with duration and Indian Rupee (₹) price.
  - Step 2: Choose appointment date.
  - Step 3: Pick available chair and time slot.
  - Step 4: Add special notes, review summary receipt, and confirm.
- ⚠️ **Interactive No-Show Handling**:
  - When marking an appointment as a No-Show, administrators choose between:
    - 🟢 **Release Chair (Available)** — Immediately frees the station for walk-ins.
    - 🔴 **Keep Chair Blocked (Blocked)** — Retains the station as blocked.
- 🇮🇳 **Indian Rupees (₹ INR) Pricing & Catalog Management**:
  - Full CRUD control over services, durations, prices, and categories in the Admin Panel.
  - Pre-seeded signature catalog in realistic INR pricing (₹299 – ₹3,999).
- 🏢 **Dynamic Salon Info & Footer Control Center**:
  - Admins can customize salon operating hours (Mon-Fri, Sat, Sun), physical address, reception phone, email, and story description directly from `/admin/settings`.
  - Dynamically syncs with the public Footer and Contact pages in real time.
- 📱 **PWA (Progressive Web App) & Mobile Ready**:
  - Includes `manifest.json`, mobile meta tags, and standalone app display for 1-click installation on Android, iOS, Windows, and Mac.

---

## 🔑 Default Login Credentials

### Administrator
- **Email**: `admin@salon.com`
- **Password**: `Admin@123`
- **Permissions**: Full Admin Command Center, Customer Approvals, 4 Chairs Control, Booking Management, Services Catalog, Salon Info & Settings.

### Approved VIP Customers (Ready to Book)
- **Rahul Sharma**: `rahul@example.com` / `Customer@123`
- **Priya Patel**: `priya@example.com` / `Customer@123`

### Pending Customer (Waiting for Admin Approval)
- **Ananya Roy**: `ananya@example.com` / `Customer@123`

### Rejected Customer
- **Dev Mehta**: `dev@example.com` / `Customer@123`

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 1. Install Dependencies
```bash
# In project root:
cd server
npm install

cd ../client
npm install
```

### 2. Start Backend Server (Port 5000)
```bash
cd server
npm run dev
```
API running at: `http://localhost:5000/api`

### 3. Start Frontend Client (Port 5173)
```bash
cd client
npm run dev
```
Open in browser: `http://localhost:5173/`

---

## 🛠️ Project Structure

```
hair_saloon/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── public/                 # Static assets, PWA manifest.json
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ChairVisualCard, StatusBadge, NoShowModal...
│   │   ├── context/            # AuthContext, SettingsContext
│   │   ├── pages/
│   │   │   ├── public/         # Home, Services, About, Contact, Login, Register
│   │   │   ├── customer/       # CustomerDashboard, BookAppointment, MyBookings, Profile
│   │   │   └── admin/          # AdminDashboard, CustomerManagement, BookingManagement, ChairManagement, ServiceManagement, SalonSettings, Notifications
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript definitions
│   ├── package.json
│   ├── postcss.config.js       # Tailwind CSS & Autoprefixer configuration
│   └── tailwind.config.js      # Luxury dark obsidian & champagne gold theme tokens
├── server/                     # Node.js + Express Backend
│   ├── data/                   # salon.db (Persistent SQLite Database)
│   ├── src/
│   │   ├── middleware/         # Auth, requireAdmin, requireApprovedCustomer
│   │   ├── routes/             # auth, customers, services, chairs, bookings, dashboard, notifications, settings
│   │   ├── db.js               # SQLite WASM schema & auto-seeding
│   │   └── index.js            # Express server entrypoint
│   └── package.json
├── .gitignore
└── README.md
```

---

## 📦 Pushing to GitHub

To push this repository to your GitHub account:

```bash
# 1. Initialize and commit
git init
git add .
git commit -m "feat: complete luxury hair salon and 4-chair management system"

# 2. Link your GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 3. Push to GitHub
git push -u origin main
```
