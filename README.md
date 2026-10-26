# Neobanco — Versión 3.338 (Vercel, React 19)

Variante de la versión 3 de la **aplicación de banca digital** (prototipo), preparada para **Vercel** y manteniendo **React 19**.

> ⚠️ Es un **prototipo de demostración**. No es un banco real, no mueve dinero real y no está conectado a ninguna red de pagos.

## Funciones principales

- **Inicio**: panel resumen con la Bóveda Segura, movimientos rápidos y gráficos de ingresos y gastos.
- **Tarjetas**: tarjetas de débito, crédito y virtuales. Cada tarjeta tiene su propio historial, acciones, cashback y un interruptor para **congelarla**.
- **Caja Fuerte / Bóveda**: separa el dinero guardado (Bóveda Segura) de las tarjetas de uso diario. El dinero solo se mueve de la bóveda hacia las tarjetas.
- **Metas**: crea varias metas de ahorro, cada una con barra de progreso, historial de aportes y gráfico.
- **Suscripciones y Préstamos**: cuatro niveles (Bronce, Plata, Oro, Platino). El nivel define la tasa de interés, el límite y los tipos de préstamo disponibles (microcréditos, préstamos personales).
- **Misiones**: sistema de puntos de fidelidad. Ganas puntos al pagar o comprar y los canjeas por dinero, descuentos en intereses u otros beneficios.
- **Seguros**: sección de seguros con promociones enlazadas desde el inicio.
- **Perfil**: página de perfil del usuario.
- **Diseño adaptable**: barra lateral plegable y menú tipo hamburguesa en móvil y tableta.

## Tecnología

- **Frontend**: React + Tailwind CSS + componentes shadcn/ui
- **Backend**: FastAPI (Python)
- **Base de datos**: MongoDB

## ¿Qué cambia en esta versión?

Igual que la versión 3, pero conserva **React 19** y actualiza `react-day-picker` a la v9 para que sea compatible. Incluye `vercel.json` corregido.

| Repo | Diferencia |
|---|---|
| Bank-v1.0 | Módulos base |
| Bank-v2.0 | + Seguros y Perfil |
| Bank-v3 | + despliegue en Vercel, React 18 |
| Bank-v3.338 | + despliegue en Vercel, React 19 |

## Cómo ejecutarlo

Requisitos: **Node.js 20+**, **Yarn**, **Python 3.11+** y **MongoDB** (local o en la nube).

**Backend (FastAPI):**

```bash
cd backend
pip install -r requirements.txt
# Crea backend/.env con:
#   MONGO_URL=mongodb://localhost:27017
#   DB_NAME=nombre_de_tu_base
uvicorn server:app --reload --port 8001
```

**Frontend (React):**

```bash
cd frontend
yarn install
# Crea frontend/.env con:
#   REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

Abre http://localhost:3000 en el navegador. Todas las rutas del backend usan el prefijo `/api`.

### Desplegar en Vercel

El archivo `vercel.json` sirve el frontend en `/` y el backend en `/_/backend`. Configura `MONGO_URL` y `DB_NAME` en las variables de entorno del proyecto en Vercel.

## Licencia

Copyright 2026 SiriusMagic

Este proyecto se distribuye bajo la **Licencia Apache 2.0**. Consulta el archivo [`LICENSE`](./LICENSE) para ver el texto completo.

En resumen: cualquiera puede usar, copiar, modificar y distribuir este código, siempre que conserve el aviso de copyright y la licencia. El software se entrega **"tal cual", sin garantías de ningún tipo**, y los autores no se hacen responsables de daños derivados de su uso.

## Seguridad

¿Encontraste una vulnerabilidad? Lee [`SECURITY.md`](./SECURITY.md) y repórtala de forma privada.
