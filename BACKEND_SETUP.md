# Guardar el catálogo online (para que todos vean lo mismo)

Hasta ahora todo lo que cargabas se guardaba **solo en tu celular**. Por eso al
compartir el link, los demás veían la versión vieja. Con estos pasos el catálogo
pasa a guardarse **en internet**: no se borra y cualquiera que abra el link ve lo
último que publicaste.

Es **gratis** para un catálogo chico (el plan free de Vercel alcanza de sobra).
Se configura **una sola vez**. Son 5 minutos.

---

## Paso 1 — Crear el almacenamiento (Vercel Blob)

1. Entrá a tu proyecto en https://vercel.com (el proyecto `eleeme-catalogo`).
2. Arriba, andá a la pestaña **Storage**.
3. Tocá **Create Database** → elegí **Blob** → **Continue**.
4. Ponele cualquier nombre (ej: `eleeme-fotos`) → **Create**.
5. Cuando te pregunte, **conectalo a este proyecto** (Connect to Project →
   elegí `eleeme-catalogo` → todos los entornos).

Con esto Vercel agrega solo una clave llamada `BLOB_READ_WRITE_TOKEN`. No tenés
que tocarla.

## Paso 2 — Crear tu clave de publicación (ADMIN_TOKEN)

Esta clave es como la contraseña para **publicar** cambios. Solo vos la tenés.

1. En el proyecto, andá a **Settings** → **Environment Variables**.
2. Agregá una nueva:
   - **Name (Key):** `ADMIN_TOKEN`
   - **Value:** una clave larga inventada por vos (ej:
     `eleeme-2026-mi-clave-secreta-larga`). Cuanto más larga, mejor.
   - Dejá marcados todos los entornos (Production, Preview, Development).
3. Guardá (**Save**).

## Paso 3 — Volver a publicar el sitio (Redeploy)

1. Andá a la pestaña **Deployments**.
2. En el último deploy, tocá el menú **⋯** → **Redeploy** → **Redeploy**.
3. Esperá a que termine (1–2 min).

> Esto hace falta para que tome el almacenamiento y la clave nueva.

## Paso 4 — Conectar el catálogo y publicar

1. Abrí tu catálogo y entrá al **panel de admin** (como siempre).
2. Arriba vas a ver una barra que dice **"Solo en este celular"**. Tocá
   **Conectar**.
3. Pegá **la misma clave** que pusiste en `ADMIN_TOKEN` (Paso 2) y tocá
   **Guardar clave**. La barra debería pasar a **"Nube conectada ✓"**.
4. Tocá **☁ Publicar online**. Va a subir las fotos y videos que ya tenías
   cargados (te muestra el progreso) y guardar todo en internet.

¡Listo! Desde ahora:

- Lo que cargás **no se borra** aunque limpies el navegador o cambies de celular.
- Cualquiera que abra el link ve la **última versión** (Rami incluido 😄).
- Las fotos y videos nuevos que subas se guardan online automáticamente.
- Cada vez que hagas un cambio importante, volvé a tocar **☁ Publicar online**
  para que quede publicado para todos.

---

## Preguntas frecuentes

**¿Tengo que hacer esto en cada celular?**
No. La configuración (Pasos 1–3) es una sola vez en Vercel. En cada celular o
navegador desde donde quieras **editar**, solo tenés que poner la clave una vez
(Paso 4). Los **clientes** no necesitan nada, ven todo automáticamente.

**¿Y si toco "Publicar online" sin conectar la clave?**
Te avisa que primero conectes la clave. No pasa nada malo.

**¿Esto borra lo que ya tenía?**
No. La primera vez que publicás, sube lo que ya tenías cargado en ese celular.
Por eso conviene publicar desde el celular donde está tu catálogo completo.

**¿Cuánto sale?**
El plan gratis de Vercel Blob incluye almacenamiento y tráfico de sobra para un
catálogo de accesorios. Si algún día crece muchísimo, Vercel avisa.
