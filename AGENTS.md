# AGENTS.md — Directrices de Desarrollo para CeceStock

Este documento define las reglas de arquitectura, diseño, interacción y estándares de código para cualquier agente de Inteligencia Artificial o desarrollador que trabaje en el repositorio **CeceStock**.

---

## 1. Misión del Proyecto y Contexto Operativo
**CeceStock** es una Progressive Web App (PWA) móvil diseñada para el conteo de inventario físico en el piso de venta de tiendas de retail de moda (*Cece Boutique*).
- **Entorno de uso:** Teléfonos inteligentes en mano en pasillos de tienda, con operarios en constante movimiento.
- **Prioridad #1:** Velocidad de tipeo continuo con teclado numérico, feedback táctil instantáneo y cero pérdida de datos.
- **Enfoque de diseño:** Minimalismo arquitectónico, fondo oscuro de alto contraste (*Obsidian Dark* `#090A0F`), cero decoración innecesaria y layout cerrado sin scrolls verticales descontrolados.

---

## 2. Stack Tecnológico Estricto
- **Frontend Core:** React 19 + TypeScript (modo estricto obligatorio, cero `any`).
- **Build Tool:** Vite con ESM nativo.
- **Styling:** TailwindCSS 3.4 con extensión personalizada de tokens en `tailwind.config.js`.
- **Iconografía:** `lucide-react` (stroke-width: 1.75, terminaciones redondeadas, tamaño 20–24px).
- **Backend / Persistencia Remota:** Supabase PostgreSQL (`@supabase/supabase-js`).
- **Persistencia Local Inmediata:** `localStorage` síncrono.
- **Hosting / CI:** Cloudflare Pages + GitHub.

---

## 3. Principios de Interacción Móvil Innegociables

Cualquier cambio de UI debe adherirse a estas restricciones:

### 3.1. Dimensiones y Contención Táctil
- El contenedor raíz debe medir exactamente `h-[100dvh]`.
- Respetar siempre las áreas seguras del dispositivo móvil:
  - `pt-[env(safe-area-inset-top,0px)]`
  - `pb-[env(safe-area-inset-bottom,0px)]`
- Desactivar rebotes del navegador con `overscroll-behavior-y: none` en `body` y contenedor.
- Evitar selección accidental de texto con `select-none` en toda la aplicación, **excepto** dentro de los inputs donde el usuario debe poder editar.
- Eliminar el parpadeo gris de toque en navegadores basados en WebKit: `[-webkit-tap-highlight-color: transparent]`.

### 3.2. Comportamiento de Inputs y Teclado Numérico
- Configuración estricta de cada input de color:
  ```tsx
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    className="w-11 sm:w-12 h-9 text-center font-bold text-sm sm:text-base tabular-nums ..."
    onFocus={(e) => e.target.select()}
  />
  ```
- **Auto-Select:** Al recibir foco, debe seleccionarse todo el valor existente para que el usuario pueda escribir un número nuevo directamente sin borrar primero con backspace.
- **Auto-Advance (Enter):** Al presionar "Enter" en el teclado virtual móvil, el foco debe transferirse inmediatamente a la casilla del siguiente color usando una matriz o lista de `React.useRef`.
- **Alineación monoespaciada:** Usar siempre la clase `tabular-nums` de Tailwind en inputs y en los badges de sumatoria para evitar que la interfaz se mueva cuando cambian los dígitos.
- **Contraste de Tonos Oscuros:** Colores con baja luminosidad (Preto `#18181B`, Vinho `#831843`, Marrom `#78350F`) deben incluir un micro-anillo perimetral (`ring-1 ring-slate-500/80 border border-slate-600/90`) para evitar fundirse con la superficie de la tarjeta `#13161F`.
- **Contención en Pantalla Única:** La tarjeta completa con sus 13 colores debe visualizarse en una sola vista sin forzar scroll vertical interno (`p-2.5`, `gap-y-1.5`, `py-1.5 px-2` por celda).

### 3.3. Gestos y Háptica
- **Swipe Horizontal:** Umbral mínimo de 50px de arrastre táctil para cambiar de producto.
- **Vibración Táctil:**
  - `navigator.vibrate(10)` al cambiar de tarjeta de producto mediante swipe o dot.
  - `navigator.vibrate(25)` al sincronizar el inventario exitosamente con Supabase.
- **Compresión interactiva:** Aplicar `active:scale-[0.97]` con `transition-transform` a todos los botones e inputs interactivos.

---

## 4. Persistencia y Manejo de Estado

1. **Ciclo Offline-First:**
   - Cada pulsación de tecla (`onChange`) actualiza el estado de React y persiste inmediatamente en `localStorage`.
   - Si la aplicación se cierra, se recarga o el teléfono se apaga, al volver a abrir se restaura el conteo en curso.
2. **Sincronización con Supabase:**
   - Solo se envía la carga útil a Supabase al presionar "Guardar / Sincronizar Inventario".
   - Al recibir una respuesta exitosa HTTP 200 de Supabase, se limpia el borrador en `localStorage` y se emite la confirmación háptica (`navigator.vibrate(25)`).

---

## 5. Mapeo Oficial de Datos (Cece Boutique)

### 7 Productos Iniciales:
1. `REF-001` — **Conjunto Soie**
2. `REF-002` — **Conjunto Venus**
3. `REF-003` — **Macaquino Gola**
4. `REF-004` — **Macaquino Channel**
5. `REF-005` — **Macaquino Paris**
6. `REF-006` — **Macaquino Yan**
7. `REF-007` — **Conjunto Moly**

### 13 Colores Estándar:
| Nombre | Abreviatura | HEX |
| :--- | :---: | :---: |
| Preto | `PT` | `#18181B` |
| Off White | `OW` | `#FAF5EF` |
| Rosa | `RS` | `#F472B6` |
| Rose | `RO` | `#FECDD3` |
| Verde Menta | `VM` | `#6EE7B7` |
| Verde Oliva | `VO` | `#4D7C0F` |
| Vermelho | `VE` | `#DC2626` |
| Lilás | `LL` | `#C084FC` |
| Amarelo | `AM` | `#FACC15` |
| Azul | `AZ` | `#3B82F6` |
| Vinho | `VN` | `#831843` |
| Marrom | `MR` | `#78350F` |
| Areia | `AR` | `#E7D8B0` |

---

## 6. Convenciones de Código y Arquitectura

```
CeceStock/
├── src/
│   ├── components/
│   │   ├── ProductCard.tsx        # Tarjeta autónoma de producto (Header + Grid)
│   │   ├── ColorInput.tsx         # Celda de matriz (círculo HEX + abreviatura + input)
│   │   ├── CarouselIndicator.tsx  # Barra de paginación (dots con píldora expandida)
│   │   └── SyncButton.tsx         # Botón de guardado y sincronización Supabase
│   ├── hooks/
│   │   └── useInventory.ts        # Lógica de conteo, persistencia y sync Supabase
│   ├── lib/
│   │   ├── supabase.ts            # Cliente Supabase tipado
│   │   └── constants.ts           # Catálogo inicial de productos y colores
│   ├── types/
│   │   └── inventory.ts           # Definiciones TypeScript de entidades
│   ├── App.tsx                    # Orquestador del carrusel táctil y safe areas
│   ├── index.css                  # Reglas globales Tailwind y reset táctil
│   └── main.tsx                   # Punto de entrada Vite React
├── supabase/
│   └── schema.sql                 # Esquema DDL para PostgreSQL
├── DESIGN.md                      # Sistema de diseño para Stitch MCP
├── AGENTS.md                      # Este archivo de directrices
└── README.md                      # Documentación del proyecto
```

- Cada componente debe residir en su propio archivo dentro de `src/components/`.
- Tipar todas las props con interfaces explícitas.
- Evitar dependencias pesadas no autorizadas (como librerías de sonido complejas, canvas confetti, etc.).
