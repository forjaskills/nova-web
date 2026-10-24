# nova-web

**Frontend** de **Nova Retail** (proyecto de ejemplo del canal Forja Skills), con Next.js (App Router) y TypeScript.
Creado con la skill `arquetipo` (tipo `web`). Solo habla con **nova-gateway**: nunca llama directo a un servicio.

## Cómo está ordenado

| Carpeta | Qué va |
|---|---|
| `app/` | rutas: `login/` (abierta) y `(privado)/` (exige sesión: sin cookie, al login) |
| `features/` | una carpeta por funcionalidad: `sesion/` (login, cierre, token) · `pedidos/` (lo que viene de nova-pedidos) |
| `lib/api/cliente.ts` | el **cliente HTTP único**: dirección del gateway, token y errores `ProblemDetails` |
| `tests/unit/` · `tests/e2e/` | Vitest · Playwright (un navegador de verdad, de punta a punta) |

## Sesión

El login va a nova-seguridad **a través del gateway**. El token queda en una cookie `httpOnly` y `SameSite=Strict`
que pone el servidor de Next: ningún script del navegador puede leerlo. Las llamadas a la API salen del servidor de
Next con ese token; el gateway lo valida y el servicio lo vuelve a validar.

Usuarios demo (solo DEV y QA): `cliente.demo`, `operador.demo`, `admin.demo` · clave `NovaDemo#1`.

## Correr en local

```
npm ci
npm run dev                         # DEV en http://localhost:3001
npm run build && npm run start:qa   # QA en  http://localhost:3002
npm run build && npm start          # PROD en http://localhost:3000
npm test                            # unitarias
npm run e2e                         # de punta a punta (con todo encendido)
```

| Ambiente | Puerto | Gateway (`NOVA_GATEWAY_URL`) |
|---|---|---|
| DEV | 3001 | `http://localhost:5201` (`.env.development`) |
| QA | 3002 | `http://localhost:5202` (`.env.qa`) |
| PROD | 3000 | `http://localhost:5200` (`.env.production`) |

Los `.env` solo tienen la dirección del gateway: no hay secretos en este repo.

## Requisitos

Node 22 LTS · nova-gateway, nova-seguridad y nova-pedidos corriendo en el mismo ambiente.
