# PROMPTS PARA OPUS - Mejoras del Catálogo ELEEME

---

## PROMPT 1: Agregar Stock y Colores a Productos
**Prioridad: CRÍTICA**

```
Tu tarea: Extender el modelo de datos de productos para incluir stock e información de colores.

CONTEXTO:
- El catálogo es una app React con productos en src/data/products.js
- Actualmente cada producto tiene: id, nombre, categoría, precio, modelos, descripción, etc.
- Franco necesita poder gestionar qué colores hay de cada producto por modelo
- También necesita controlar el stock por color/modelo

CAMBIOS ESPECÍFICOS:

1. Actualiza la estructura de cada producto agregando esto:
   ```js
   {
     // ... campos actuales ...
     colores: [
       { nombre: 'Naranja', codigo: '#FF9500', activo: true },
       { nombre: 'Negro', codigo: '#000000', activo: true },
       { nombre: 'Blanco', codigo: '#FFFFFF', activo: true },
     ],
     stock: {
       // Por cada modelo: { [nombreModelo]: { [nombreColor]: cantidad } }
       'iPhone 16 Pro Max': {
         'Naranja': 3,
         'Negro': 0,      // Sin stock pero disponible
         'Blanco': 5,
       },
       'iPhone 15 Pro Max': {
         'Naranja': 2,
         'Negro': 8,
         'Blanco': 0,     // Sin stock
       },
       // Otros modelos...
     },
     notificar_cuando_stock: [], // Array de emails que quieren ser notificados cuando vuelva
   }
   ```

2. Actualiza los 11 productos del catálogo con:
   - Colores realistas para cada tipo (ej: fundas silicona: muchos colores, protectores metálicos: 3-4 colores)
   - Stock inicial realista (algunos en stock, algunos agotados)
   - Array vacío para notificaciones

3. No modifiques la lógica de la app, solo los datos. Los componentes seguirán funcionando igual.

CRITERIOS DE ÉXITO:
✓ Todos los 11 productos tienen array 'colores' con 2-5 colores cada uno
✓ Todos tienen estructura de 'stock' con cantidades para modelos/colores
✓ El archivo compila sin errores
✓ La app sigue viéndose igual (solo es cambio de datos)
```

---

## PROMPT 2: Mostrar Stock en ProductCard y ProductModal
**Prioridad: CRÍTICA**

```
Tu tarea: Mostrar disponibilidad de stock e información de colores en el catálogo.

CONTEXTO:
- ProductCard: componente que muestra productos en la grilla
- ProductModal: modal que muestra detalles cuando abrís un producto
- El usuario Franco filtró productos por modelo (ej: "iPhone 16 Pro Max")
- Cuando abre un producto, necesita ver:
  * Qué colores hay disponibles
  * Cuántos en stock de cada color
  * Si algún color está agotado, debe verse claro
  * Si NO hay stock de un color, debe mostrar "Agotado"

CAMBIOS A HACER:

1. En ProductCard (src/components/ProductCard.jsx):
   - Debajo del nombre/precio agrega un badge que diga:
     * "En stock" (verde) si hay al menos 1 unidad en el modelo filtrado
     * "Agotado" (rojo) si stock es 0 en todos los colores del modelo filtrado
   - El badge desaparece si no hay filtro de modelo (categoría "Todos")

2. En ProductModal (src/components/ProductModal.jsx):
   - Después de "compatible_con", crea una sección "COLORES Y DISPONIBILIDAD":
     * Muestra los colores del producto como botones/pills
     * Cada color muestra nombre, código visual pequeño, y stock del modelo actual
     * Si modelo NO está filtrado, muestra "Selecciona un modelo arriba para ver stock"
     * Si color está agotado: "Agotado" en gris
     * Si hay stock: muestra el número (ej: "3 disponibles")
     * Si no hay color en ese modelo, no lo muestra

EJEMPLO VISUAL:
  Colores y Disponibilidad
  ┌─────────────────────────┐
  │ 🟠 Naranja (3 disponibles) │
  │ 🟤 Marrón (Agotado)      │
  │ ⚫ Negro (5 disponibles)  │
  └─────────────────────────┘

CRITERIOS DE ÉXITO:
✓ ProductCard muestra badge "En stock" o "Agotado" cuando hay modelo seleccionado
✓ ProductModal muestra sección de colores con disponibilidad por cada uno
✓ Si no hay modelo seleccionado, la sección dice "Selecciona un modelo para ver stock"
✓ Los colores agotados se ven diferente (gris, tachado, o con badge "Agotado")
✓ El modal sigue siendo fácil de leer, no se ve abarrotado
```

---

## PROMPT 3: Arreglar Navegación Atrás en ProductModal
**Prioridad: CRÍTICA**

```
Tu tarea: Permite cerrar el modal de producto presionando ESC y agregando botón atrás visible.

CONTEXTO:
- Franco reportó que no puede volver atrás cuando está viendo un producto
- ProductModal debe cerrarse con ESC (como es estándar)
- Debe haber un botón "← Atrás" o similar visible y funcional

CAMBIOS ESPECÍFICOS:

1. En ProductModal (src/components/ProductModal.jsx):
   - En el event listener del teclado, captura la tecla ESC:
     ```js
     useEffect(() => {
       const handleEsc = (e) => {
         if (e.key === 'Escape') onClose()
       }
       document.addEventListener('keydown', handleEsc)
       return () => document.removeEventListener('keydown', handleEsc)
     }, [onClose])
     ```
   
   - En el header del modal, agrega un botón "Atrás" a la izquierda:
     * Icono: ← (flecha izquierda)
     * Texto: "Atrás" o solo icono si es muy pequeño
     * Estilo: sobrio, no muy llamativo
     * Al hacer clic: onClose()

2. El click fuera del modal (en el fondo gris oscuro) ya debería cerrarlo.
   Verificá que el Backdrop esté configurado para cerrar al clickear.

VISUAL ESPERADO:
  ┌─────────────────────────────────────────┐
  │ ← Atrás                        [X] Cerrar │  (header)
  │─────────────────────────────────────────│
  │                                         │
  │  Contenido del producto...              │
  │                                         │
  └─────────────────────────────────────────┘

CRITERIOS DE ÉXITO:
✓ Presionar ESC cierra el modal
✓ Hay botón "← Atrás" en la esquina superior izquierda del modal
✓ Clickear el botón "Atrás" cierra el modal
✓ Clickear en el fondo gris oscuro también cierra
✓ El modal se ve profesional, no queda abarrotado
```

---

## PROMPT 4: Agregar Admin Panel para Editar Stock y Colores
**Prioridad: IMPORTANTE**

```
Tu tarea: Extender el AdminPanel para que Franco pueda editar stock y colores de cada producto.

CONTEXTO:
- Ya existe src/components/AdminPanel.jsx
- Franco necesita poder:
  * Cambiar cantidades de stock por color/modelo
  * Activar/desactivar colores
  * Cambiar nombres de colores o códigos hex
  * Sin tocar código, solo interfaz

ESTRUCTURA ESPERADA del Admin:

Para cada producto, expandible sección "Gestión de Stock":
┌────────────────────────────────────────────┐
│ Funda Metal Color Blanco                   │
│ ┌─ COLORES ────────────────────────────┐   │
│ │ □ Naranja    (#FF9500) [Eliminar]    │   │
│ │ □ Negro      (#000000) [Eliminar]    │   │
│ │ □ Blanco     (#FFFFFF) [Eliminar]    │   │
│ │                                      │   │
│ │ [+ Agregar nuevo color]              │   │
│ └──────────────────────────────────────┘   │
│ ┌─ STOCK por MODELO ────────────────────┐  │
│ │ iPhone 16 Pro Max:                   │  │
│ │  Naranja   [3]  Negro   [0]  Blanco [5] │  │
│ │                                      │  │
│ │ iPhone 15 Pro Max:                   │  │
│ │  Naranja   [2]  Negro   [8]  Blanco [0] │  │
│ │  ... (otros modelos)                 │  │
│ └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘

CAMBIOS ESPECÍFICOS:

1. En AdminPanel, para cada producto agrega:
   - Sección collapsible "COLORES"
     * Listado de colores con nombre, código hex, checkbox activo
     * Botón [X] para eliminar color
     * Input para agregar nuevo color (nombre + color picker o hex input)
   
   - Sección collapsible "STOCK POR MODELO"
     * Tabla/grid: filas = modelos, columnas = colores
     * Cada celda es un número editable
     * Al cambiar número, se guarda automáticamente en localStorage (via saveProducts)

2. Valida:
   - Stock no puede ser negativo
   - Nombre de color no puede estar vacío
   - Código hex debe ser válido (#XXX o #XXXXXX)

3. Usa inputs tipo "number" para stock, "text" para nombres, "color" para hex

CRITERIOS DE ÉXITO:
✓ Admin muestra sección de colores editable para cada producto
✓ Admin muestra tabla de stock editable (modelo x color)
✓ Cambios se guardan en localStorage automáticamente
✓ La interfaz es intuitiva para Franco (usuario no-técnico)
✓ Validaciones evitan datos inválidos
✓ No hay errores en la consola
```

---

## PROMPT 5: Sistema de Notificación de Restock
**Prioridad: IMPORTANTE**

```
Tu tarea: Agregar opción para notificar al cliente cuando un producto agotado vuelve a stock.

CONTEXTO:
- Franco quiere poder decirle a clientes: "Te notificaré cuando vuelva a haber stock"
- Necesita:
  * Email del cliente en el modal
  * Guardar email en array notificar_cuando_stock del producto
  * Admin puede ver quién pidió notificación
  * Cuando Franco edita stock y lo sube de 0 a >0, debería verlo notificado

CAMBIOS ESPECÍFICOS:

1. En ProductModal, cuando color está AGOTADO, muestra:
   ┌──────────────────────────────────┐
   │ Agotado                          │
   │                                  │
   │ ¿Querés que te avise cuando      │
   │ vuelva? [email@example.com] [OK] │
   └──────────────────────────────────┘

   - Input de email (opcional, pero si deja vacío no hace nada)
   - Botón "OK" o "Notificarme"
   - Si ya existe ese email en la lista, muestra "Ya estás notificado ✓"
   - Al hacer OK, se suma el email al array del producto en localStorage

2. En AdminPanel, en la sección de STOCK:
   - Cuando editas stock de 0 a >0, muestra popup:
     "✓ Producto restock! Hay 2 personas esperando notificación"
   - Muestra lista de emails que pidieron notificación
   - Botón "Copiar todos" para que Franco les mande WhatsApp/email

3. En el panel, debajo de cada producto, muestra:
   "🔔 2 personas esperan restock"  (si hay)

CRITERIOS DE ÉXITO:
✓ Cuando stock es 0, el modal muestra opción de email para notificación
✓ Email se guarda en localStorage en array del producto
✓ Admin ve quién pidió notificación y puede copiar emails
✓ No se duplican emails (si ya existe, lo rechaza)
✓ UI es clara y no confunde al usuario
```

---

## PROMPT 6: Crear CMS Básico para Editar Fotos y Títulos
**Prioridad: IMPORTANTE**

```
Tu tarea: Permitir que Franco cambie fotos, títulos y descripciones sin código.

CONTEXTO:
- Franco quiere poder cambiar fotos y descripciones de productos
- Actualmente todo está en products.js
- Necesita una interfaz simple en AdminPanel para editar esto

CAMBIOS ESPECÍFICOS:

En AdminPanel, agrega sección collapsible "EDITAR CONTENIDO" para cada producto:

┌─────────────────────────────────────┐
│ EDITAR CONTENIDO                    │
├─────────────────────────────────────┤
│ Nombre:                             │
│ [Funda Metal Color Blanco          ]│
│                                     │
│ Categoría: [Fundas ▼]               │
│                                     │
│ URL Imagen:                         │
│ [https://images.unsplash...        ]│
│ [Preview pequeño de la imagen]      │
│                                     │
│ Descripción:                        │
│ [Textarea con descripción actual   ]│
│                                     │
│ Por qué lo necesitas:               │
│ [Textarea con el copy actual       ]│
│                                     │
│ Precio: [$16999]  Desc: [$21999]   │
│                                     │
│ Compatible con:                     │
│ [iPhone 13 Pro a 15 Pro Max        ]│
│                                     │
│ Tag (ej: "Más vendido"):            │
│ [Más vendido]                       │
│                                     │
│ ¿Destacado? [✓ Checkbox]            │
│                                     │
│           [Guardar cambios]         │
└─────────────────────────────────────┘

CAMBIOS ESPECÍFICOS:

1. Para cada producto en AdminPanel, agrega inputs editable para:
   - nombre (text)
   - categoria (select, opciones = CATEGORIES)
   - imagen_url (text) con preview pequeño al lado
   - descripcion (textarea)
   - por_que_lo_necesitas (textarea)
   - precio (number)
   - precio_original (number)
   - compatible_con (text)
   - tag (text)
   - destacado (checkbox)

2. Botón "Guardar cambios" llama a saveProducts(updatedProducts)

3. Validaciones simples:
   - nombre no vacío
   - precio > 0
   - URL imagen válida (comienza con http)

CRITERIOS DE ÉXITO:
✓ Franco puede editar todos los campos de un producto desde Admin
✓ Los cambios se guardan en localStorage
✓ Preview de imagen se actualiza en tiempo real
✓ UI es limpia y fácil de entender
✓ No hay errores al guardar
```

---

## PROMPT 7: Opción para Gestion Manual vs Automática de Stock
**Prioridad: MEDIA**

```
Tu tarea: Agregar opción para que Franco elija si stock baja automático o manual.

CONTEXTO:
- Franco preguntó: "Si cargo 3 fundas naranjas y vendo 1, ¿se baja solo o lo bajo yo?"
- Respuesta: Permite elegir en Admin
- Opción 1: MANUAL (Franco lo baja él cuando vende)
- Opción 2: AUTOMÁTICO (al "comprar", baja automático - si integra carrito después)

CAMBIOS ESPECÍFICOS:

1. Agrega a cada producto un campo:
   ```js
   stock_gestion: 'manual' // o 'automatico'
   ```

2. En AdminPanel, sección STOCK, muestra:
   ┌─────────────────────────────────┐
   │ GESTIÓN DE STOCK                │
   │ ¿Cómo quieres manejar stock?    │
   │ ( ) Manual - Edito yo             │
   │ ( ) Automático - Baja al comprar  │
   │     (Para cuando integres carrito)│
   └─────────────────────────────────┘

3. Input en el modal de ProductModal:
   - Si gestion es MANUAL: solo muestra disponibilidad, sin botón de compra
   - Si gestion es AUTOMATICO: muestra botón "Comprar" que sustrae 1 del stock
     (Pero por ahora no necesita funcionar, solo la UI)

CRITERIOS DE ÉXITO:
✓ Cada producto tiene campo stock_gestion
✓ AdminPanel permite cambiar entre Manual/Automático
✓ El setting se guarda en localStorage
✓ ProductModal respeta la configuración elegida
✓ UI es clara sobre cuál está seleccionado
```

---

## ORDEN RECOMENDADO DE EJECUCIÓN:

1. **PROMPT 1** → Extender datos (colores + stock)
2. **PROMPT 3** → Arreglar navegación ESC (rápido, crítico)
3. **PROMPT 2** → Mostrar stock en UI
4. **PROMPT 4** → Admin para editar stock
5. **PROMPT 6** → Admin para editar contenido
6. **PROMPT 5** → Sistema de notificación
7. **PROMPT 7** → Gestión manual vs automática

---

## NOTAS GENERALES:

- **Rama**: Todos los cambios en `claude/cool-ride-sg7uln`
- **Testing**: Después de cada cambio, verificar que:
  - No hay errores en consola
  - Los datos se guardan en localStorage
  - La app sigue siendo responsive
  - El catálogo sigue viéndose bien en mobile
  
- **UX Focus**: Franco es usuario no-técnico. Todo debe ser:
  - Claro y obvio
  - Sin jerga técnica
  - Con confirmaciones visuales (ej: "✓ Guardado")
  
- **Commit Messages**:
  - "Agregar estructura de colores y stock a productos"
  - "Mostrar disponibilidad en cards y modals"
  - "Arreglar navegación en modal de producto"
  - "Admin: panel de edición de stock"
  - "Admin: CMS para editar contenido"
  - "Agregar notificaciones de restock"
  - "Opción de stock automático vs manual"
