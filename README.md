# ✂️ Peluquería SaaS

Plataforma multi-salón de reserva de citas online.  
Cada peluquería tiene su propio panel admin; los clientes reservan sin registro.

---

## 🗂 Estructura
```
peluqueria-saas/
├── backend/       Node.js + Express (API REST)
├── frontend/      React + Vite (UI)
└── database/      schema.sql para MySQL Workbench
```

---

## ⚙️ Requisitos
- Node.js 18+
- MySQL 8+ (con MySQL Workbench)

---

## 🚀 Puesta en marcha

### 1. Base de datos
1. Abre **MySQL Workbench**
2. Importa `database/schema.sql` (File → Run SQL Script)
3. Esto crea la base de datos `peluqueria_saas` con datos de ejemplo

### 2. Backend
```bash
cd backend
cp .env.example .env       # edita con tu usuario/contraseña MySQL
npm install
npm run dev                # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

---

## 🌐 URLs

| Ruta | Descripción |
|------|-------------|
| `/` | Landing: lista de peluquerías |
| `/reservar/:slug` | Página pública del salón (elegir servicio) |
| `/reservar/:slug/cita` | Calendario + formulario de reserva |
| `/confirmacion` | Confirmación de cita |
| `/admin/registro` | Registrar nueva peluquería |
| `/admin/login` | Login peluquería |
| `/admin` | Dashboard admin |
| `/admin/citas` | Gestión de citas |
| `/admin/servicios` | Gestión de servicios |
| `/admin/equipo` | Gestión de empleados y horarios |
| `/admin/perfil` | Perfil del salón |

---

## 🔑 Prueba rápida
Los datos de ejemplo incluyen dos salones. Para entrar en el admin crea tu propia cuenta en `/admin/registro`.
