# Neobanco

**Aplicación de banca digital** (prototipo): bóveda de ahorro, tarjetas con su propio historial, tarjetas desechables, metas, préstamos por suscripción, misiones con puntos, seguros y perfil.

> ✅ **Funciona 100 % en el navegador.** No necesita servidor, MongoDB ni Vercel: los datos se guardan en tu navegador (localStorage) y no se pierden al recargar.
>
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

- **React 19** + **Vite 8**
- **Tailwind CSS 4** + componentes **shadcn/ui** (Radix UI) + **Recharts** para gráficos
- **Servidor simulado en el navegador** (`frontend/src/lib/localApi.js`): reproduce las rutas `/api/...` del antiguo backend FastAPI + MongoDB y guarda los datos en `localStorage`

### ¿Cómo reinicio los datos?

Abre las herramientas del navegador (F12) → Application → Local Storage y borra la clave `neobanco-db-v1`. Al recargar verás el botón **Cargar datos de ejemplo**.

## Historial de versiones

Este repo es la versión principal y unificada. Las versiones anteriores quedan como historial:

| Repo | Qué tenía |
|---|---|
| neobanco-v1 | Módulos base (con backend FastAPI + MongoDB) |
| neobanco-v2 | + Seguros y Perfil |
| neobanco-v3-react18 | + despliegue en Vercel, React 18 |
| **neobanco-v3-react19** | **Versión actual: 100 % navegador, React 19 + Vite** |

## Cómo usarla

### Opción 1 — En el navegador, sin instalar nada

Si el repo es **público**, se publica sola en **https://siriusmagic.github.io/neobanco-v3-react19/** cada vez que hay un cambio en `main` (actívalo una vez en **Settings → Pages → Source: GitHub Actions**). En un repo privado, GitHub Pages requiere un plan de pago.

### Opción 2 — En tu computadora

Requisitos: **Node.js 20 o superior** y **Yarn**.

```bash
cd frontend
yarn install
yarn dev        # abre http://localhost:3000
```

Para generar la versión final: `yarn build` (queda en `frontend/build/`) y `yarn preview` para probarla.

### Opción 3 — Compartirla desde tu computadora con un túnel

Con la app corriendo (`yarn dev`), en otra terminal:

```bash
npx cloudflared tunnel --url http://localhost:3000
```

Te dará un enlace `https://….trycloudflare.com` que puedes abrir desde el celular o compartir. Se cierra al detener el comando.

## Licencia

Copyright 2026 SiriusMagic

Este proyecto se distribuye bajo la **Licencia Apache 2.0**. Consulta el archivo [`LICENSE`](./LICENSE) para ver el texto completo.

En resumen: cualquiera puede usar, copiar, modificar y distribuir este código, siempre que conserve el aviso de copyright y la licencia. El software se entrega **"tal cual", sin garantías de ningún tipo**, y los autores no se hacen responsables de daños derivados de su uso.

## Seguridad

¿Encontraste una vulnerabilidad? Lee [`SECURITY.md`](./SECURITY.md) y repórtala de forma privada.
