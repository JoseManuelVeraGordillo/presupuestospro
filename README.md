<div align="center">

# 💰 PresupuestosPro

**Aplicación de gestión de presupuestos y facturación para autónomos**

[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![OpenSpec](https://img.shields.io/badge/OpenSpec-API--First-blue)](https://github.com)

</div>

---

## ¿Qué es PresupuestosPro?

PresupuestosPro es una aplicación web para la **gestión de presupuestos, facturación y finanzas** diseñada para autónomos y pequeñas empresas. Permite crear presupuestos, gestionar facturas, dar seguimiento a cobros y tener visión general de la actividad económica.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | Node.js |
| **Frontend** | Vite (React) |
| **Testing** | Vitest |
| **API** | Contratos OpenSpec (API-first) |
| **Calidad** | ESLint + Prettier |

---

## Estructura del proyecto

```
presupuestospro/
├── backend/            # Servidor y lógica de negocio
├── frontend/           # Interfaz de usuario
├── tests/              # Suite de tests
├── openspec/           # Contratos de API (API-first)
├── specs/              # Especificaciones de funcionalidad
└── CLAUDE.md           # Configuración para asistente de IA
```

---

## Instalación y desarrollo

```bash
# Clonar
git clone https://github.com/JoseManuelVeraGordillo/presupuestospro.git
cd presupuestospro

# Backend
cd backend
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

---

## Metodología

Este proyecto utiliza **Spec-Driven Development (SDD)** con contratos de API definidos antes de la implementación, siguiendo el principio API-first.

---

## Autor

[José Manuel Vera Gordillo](https://github.com/JoseManuelVeraGordillo)
