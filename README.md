# Trimly

A modern **URL Shortener with Analytics** built using **React, shadcn/ui, and Supabase**.

Trimly allows users to create short URLs, track clicks, and view link performance through a clean dashboard.

This project was built to explore **modern React UI patterns, Supabase BaaS, and shadcn component design**.

---

## ✨ Features

- 🔗 Shorten long URLs instantly
- 📊 Link analytics with Recharts
- 👤 Authentication with Supabase
- 👥 **Guest Mode** (try without signup)
- 🌓 Light / Dark / System theme
- 🍪 Cookie consent management
- 🔔 Toast notifications
- 📱 Fully responsive UI
- 🎨 Clean SaaS-style UI with shadcn
- 🪝 Custom Hook - useFetch & Context API - UrlProvider

---

## 🧰 Tech Stack

Frontend

- React
- Vite
- TailwindCSS
- shadcn/ui
- Recharts

Backend

- Supabase (Auth + Database)

Utilities

- Lucide Icons
- Sonner Toast
- Yup Validation

---

## 📂 Project Structure

```

src/
├─ components/
│   ├─ ui/           # shadcn UI components
│   ├─ layout/       # layout components
│   └─ feature components
│
├─ pages/            # route pages
├─ db/               # Supabase API logic
├─ hooks/            # custom hooks
├─ contexts/         # global state
└─ layouts/          # app layout

```

---

## 🚀 Getting Started

### 1. Fork / Clone the Repository

```bash
git clone https://github.com/harshprajapati8347/Trimly-URL-Shortner.git
cd Trimly-URL-Shortner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create `.env` file:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can create a project at:

[https://supabase.com](https://supabase.com)

### 4. Run Development Server

```bash
npm run dev
```

App will run at:

```
http://localhost:5173
```

---

## 🧪 Guest Mode

Trimly supports **Guest Access**.

Users can:

- create short links
- test analytics

Guest data is stored locally and not persisted across devices.

---

## 🎨 UI Outlook

Best Practices of UI Design

- Consistent layout system
- Reusable page containers
- Unified spacing and typography
- Modern dashboard cards
- Mobile responsiveness
- Empty states and loading feedback
- Auth and Guest Mode

---

## 📊 Analytics

Trimly tracks:

- total clicks
- device statistics
- link performance

Charts are rendered using **Recharts**.

---

## 🔒 Privacy

Trimly collects **limited device and location information for link analytics**. Please see our [Privacy Policy](/src/pages/privacy.jsx) for details on how this minimal data is stored and utilized.

---

<!--
## 🤝 Contributing

Contributions are welcome.

Steps:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a Pull Request

---

## 📄 License

MIT License

--- -->

## 💡 Project Purpose

Trimly is a **learning-focused open source project** exploring:

- shadcn UI design patterns
- Supabase as backend
- modern React architecture
- building simple SaaS-style tools
