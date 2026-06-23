# Guardar el catálogo online (para que todos vean lo mismo)

Hasta ahora todo lo que cargabas se guardaba **solo en tu celular**. Por eso al
compartir el link, los demás veían la versión vieja y los cambios se podían
perder. Con estos pasos el catálogo pasa a guardarse **en una base de datos en
internet (Neon)**: no se borra y cualquiera que abra el link ve lo último.

Se configura **una sola vez**, en unos minutos. Las tablas de la base se crean
solas, no tenés que tocar SQL.

---

## Paso 1 — Conectar la base de datos Neon a Vercel

Tenés dos formas. La **A** es la más simple si todavía no la conectaste.

**Opción A — Integración automática (recomendada):**
1. Entrá a tu proyecto en https://vercel.com (`eleeme-catalogo`).
2. Pestaña **Storage** → **Create Database** → elegí **Neon (Postgres)** →
   seguí los pasos y **conectalo a este proyecto**.
3. Eso agrega solo la variable `DATABASE_URL`. No tenés que copiar nada.

**Opción B — Pegar tu conexión a mano (si ya tenés la base creada en Neon):**
1. En el proyecto, andá a **Settings** → **Environment Variables**.
2. Agregá:
   - **Key:** `DATABASE_URL`
   - **Value:** la cadena de conexión de Neon (la que empieza con
     `postgresql://...`). La sacás del panel de Neon → **Connect**.
   - Marcá todos los entornos (Production, Preview, Development) → **Save**.

> ⚠️ Esa cadena es como la llave maestra de la base. No la pegues en chats ni la
> compartas. Si alguna vez se filtró, entrá a Neon → **Roles** → **Reset
> password** y actualizá el valor de `DATABASE_URL` en Vercel.

## Paso 2 — Crear tu clave de publicación (ADMIN_TOKEN)

Es la "contraseña" para **publicar** cambios. Solo vos la tenés.

1. **Settings** → **Environment Variables** → agregá:
   - **Key:** `ADMIN_TOKEN`
   - **Value:** una clave larga inventada por vos (ej:
     `eleeme-2026-mi-clave-secreta-larga`).
   - Todos los entornos → **Save**.

## Paso 3 — Volver a publicar el sitio (Redeploy)

1. Pestaña **Deployments** → en el último deploy: menú **⋯** → **Redeploy** →
   **Redeploy**.
2. Esperá 1–2 minutos a que termine.

## Paso 4 — Conectar el catálogo y publicar

1. Abrí tu catálogo y entrá al **panel de admin** (como siempre).
2. Arriba vas a ver la barra **"Solo en este celular"**. Tocá **Conectar**.
3. Pegá **la misma clave** que pusiste en `ADMIN_TOKEN` (Paso 2) y tocá
   **Guardar clave**. Debería pasar a **"Nube conectada ✓"**.
4. Tocá **☁ Publicar online**. Sube las fotos que ya tenías (te muestra el
   progreso) y guarda todo en la base.

¡Listo! Desde ahora:

- Lo que cargás **no se borra** aunque limpies el navegador o cambies de celular.
- Cualquiera que abra el link ve la **última versión** (Rami incluido 😄).
- Las **fotos** nuevas se guardan online automáticamente.
- Cada vez que hagas cambios importantes, volvé a tocar **☁ Publicar online**.

---

## Subir videos (paso extra, una sola vez)

Las **fotos** se guardan en la base Neon (pasos de arriba). Los **videos** son
pesados, así que se suben directo del celular a un almacenamiento aparte
(**Vercel Blob**). Para habilitarlos:

1. En tu proyecto de Vercel → pestaña **Storage** → **Create Database** →
   elegí **Blob** → ponele un nombre (ej: `eleeme-videos`) → **Create**.
2. Cuando pregunte, **conectalo a este proyecto** (`eleeme-catalogo`, todos los
   entornos). Esto agrega solo la variable `BLOB_READ_WRITE_TOKEN`.
3. Hacé **Redeploy** (pestaña Deployments → ⋯ → Redeploy).

Listo: desde el admin podés subir videos de hasta **200 MB** mostrando los
productos, y los ven todos. (Igual podés seguir usando **"O pegá un link"** de
Instagram/YouTube si preferís.)

> Si todavía no creaste el Blob store, al intentar subir un video el catálogo lo
> guarda solo en tu celular (no falla, pero no lo ven los demás). Apenas creás el
> store y redeployás, ya funciona para todos.

## Preguntas frecuentes

**¿Tengo que hacer esto en cada celular?**
No. Los pasos 1–3 son una sola vez en Vercel. En cada celular desde donde quieras
**editar**, solo ponés la clave una vez (Paso 4). Los **clientes** no necesitan
nada.

**¿Esto borra lo que ya tenía?**
No. La primera publicación sube lo que ya tenías cargado en ese celular. Por eso
conviene publicar desde el celular donde está tu catálogo completo.

**¿Cuánto sale?**
El plan gratis de Neon alcanza de sobra para un catálogo de accesorios.
