---
name: CeceStock Obsidian Precision
colors:
  surface: '#090A0F'
  surface-dim: '#090A0F'
  surface-bright: '#13161F'
  surface-container-lowest: '#090A0F'
  surface-container-low: '#13161F'
  surface-container: '#13161F'
  surface-container-high: '#1A1E2B'
  surface-container-highest: '#2A3042'
  on-surface: '#FFFFFF'
  on-surface-variant: '#94A3B8'
  outline: '#2A3042'
  outline-variant: '#1A1E2B'
  primary: '#3B82F6'
  on-primary: '#FFFFFF'
  primary-container: '#1D4ED8'
  on-primary-container: '#DBEAFE'
  secondary: '#10B981'
  on-secondary: '#FFFFFF'
  secondary-container: '#065F46'
  on-secondary-container: '#D1FAE5'
  error: '#EF4444'
  on-error: '#FFFFFF'
  background: '#090A0F'
  on-background: '#FFFFFF'
  bg-obsidian: '#090A0F'
  bg-card: '#13161F'
  bg-input: '#1A1E2B'
  border-subtle: '#2A3042'
  text-primary: '#FFFFFF'
  text-secondary: '#94A3B8'
  accent-sapphire: '#3B82F6'
  accent-focus: '#60A5FA'
  accent-success: '#10B981'
typography:
  display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  numeric-input:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
  numeric-badge:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.25rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

# CeceStock — Sistema de Diseño Obsidian Precision

> **Producto:** CeceStock (Prototipo 1)  
> **Propósito:** Aplicación Web Progresiva (PWA) móvil hiper-optimizada para la toma de inventario físico en retail de moda.  
> **Filosofía:** Cero fricción, ergonomía táctil a una mano, contraste alto para pisos iluminados y digitación continua sin errores.

---

## 1. Fundamentos Visuales y Cromática Estricta

El sistema de diseño adopta una atmósfera de **Obsidiana Táctica** (`#090A0F`), reduciendo drásticamente el consumo de batería en pantallas OLED y eliminando el resplandor visual en jornadas largas de conteo.

### Paleta Funcional (Tokens Directos)
- **Fondo General (`bg-obsidian`):** `#090A0F` (Negro obsidiana profundo).
- **Superficie de Tarjeta (`bg-card`):** `#13161F` (Gris naval oscuro para delimitar cada producto autónomo).
- **Superficie de Input (`bg-input`):** `#1A1E2B` (Contenedor interactivo de dígito).
- **Bordes y Delimitadores (`border-subtle`):** `#2A3042` (Línea de 1px precisa).
- **Texto Primario (`text-primary`):** `#FFFFFF` (Máxima legibilidad).
- **Texto Secundario (`text-secondary`):** `#94A3B8` (Slate 400 para etiquetas y metadatos).
- **Acento Primario (`accent-sapphire`):** `#3B82F6` (Azul zafiro para píldora activa y acción principal).
- **Estado Focus (`accent-focus`):** `#60A5FA` (Ring y borde brillante en casilla activa).
- **Estado Éxito (`accent-success`):** `#10B981` (Sincronización confirmada).

---

## 2. Tipografía y Reglas Numéricas

- **Familia Tipográfica Principal:** Inter o System-UI sans-serif.
- **Regla Innegociable de Cifras (`tabular-nums`):** 
  Todos los valores numéricos (tanto dentro de las casillas de entrada como en los badges de sumatoria en tiempo real) deben utilizar obligatoriamente la propiedad `font-variant-numeric: tabular-nums` (clase Tailwind `tabular-nums`). Esto garantiza que los dígitos tengan ancho uniforme fijo, eliminando temblores horizontales al tipear.

---

## 3. Arquitectura de Interfaz y Ergonomía Móvil

### Contenedor Raíz (Canvas Móvil)
- Dimensiones estrictas: `h-[100dvh]` con bloqueo de rebote `overscroll-behavior-y: none`.
- Márgenes de seguridad: `pt-[env(safe-area-inset-top)]` y `pb-[env(safe-area-inset-bottom)]`.
- Protección táctil: `select-none` en toda la app (excepto dentro de inputs numéricos) y `[-webkit-tap-highlight-color: transparent]`.

### Estructura de la Tarjeta de Producto (`ProductCard`)
La aplicación prescinde del scroll vertical infinito; se navega mediante deslizamiento horizontal (Swipe) entre tarjetas autónomas. La tarjeta ha sido matemáticamente ajustada para que los 14 colores quepan en una sola vista sin scroll vertical:

1. **Cabecera (Top Bar):**
   - **Izquierda:** Icono Lucide `Shirt` en contenedor compacto `w-7 h-7` + etiqueta `REF-XXX` en `text-secondary`.
   - **Derecha:** Nombre del producto (ej: *Conjunto Venus*) + Badge píldora con la suma total acumulada en tiempo real (`tabular-nums`).
2. **Cuerpo (Matriz de Colores 2 Columnas):**
   - Cuadrícula con espaciado vertical reducido a `gap-y-1.5` y horizontal a `gap-x-2`.
   - Cada celda (`py-1.5 px-2`, `rounded-xl`) contiene:
     - **Indicador izquierdo:** Círculo de color (`HEX` de la tela, `w-6 h-6 shrink-0`).
       - *Contraste para tonos oscuros:* Detección de luminosidad ITU-R BT.709 ($< 65$). Tonos oscuros como **Preto**, **Vinho**, **Marrom** y **Azul Demin** incorporan un anillo perimetral `ring-1 ring-slate-500/80 border border-slate-600/90` con micro-brillo para evitar mimetizarse con el fondo `#13161F`.
       - *Abreviatura:* Código de 2 letras en `text-xs` bold + nombre en `text-[10px]`.
     - **Campo derecho:** Input numérico directo (`inputMode="numeric"`, `pattern="[0-9]*"`), con altura calibrada `h-9`, texto centrado (`text-center`), auto-selección total al enfocar (`select()`) y auto-avance a la siguiente casilla al pulsar Enter.
3. **Pie (Navegación e Indicador de Carrusel):**
   - Indicador de puntos (Dots) compacto (`py-1`). El punto activo se expande a píldora horizontal (`w-6`, transición fluida) coloreada en Azul Zafiro (`#3B82F6`). Tocar cualquier punto salta directamente a la tarjeta correspondiente.
   - Botón fijo de acción principal: "Guardar / Sincronizar Inventario" con altura equilibrada `h-11 sm:h-12`, feedback de compresión `active:scale-[0.97]` y confirmación háptica.

---

## 4. Matriz Oficial de Colores y Códigos de Negocio

| Nombre del Color | Abreviatura | Código HEX | Indicador Visual |
| :--- | :---: | :---: | :---: |
| **Preto** | `PT` | `#18181B` | Círculo oscuro con micro-borde |
| **Off White** | `OW` | `#FAF5EF` | Círculo blanco marfil |
| **Rosa** | `RS` | `#F472B6` | Círculo rosa vibrante |
| **Rose** | `RO` | `#FECDD3` | Círculo pastel empolvado |
| **Verde Menta** | `VM` | `#6EE7B7` | Círculo menta claro |
| **Verde Oliva** | `VO` | `#4D7C0F` | Círculo verde olivo profundo |
| **Vermelho** | `VE` | `#DC2626` | Círculo carmesí |
| **Lilás** | `LL` | `#C084FC` | Círculo violeta claro |
| **Amarelo** | `AM` | `#FACC15` | Círculo amarillo solar |
| **Azul** | `AZ` | `#3B82F6` | Círculo azul zafiro |
| **Vinho** | `VN` | `#831843` | Círculo borgoña / vino |
| **Marrom** | `MR` | `#78350F` | Círculo marrón castaño |
| **Areia** | `AR` | `#E7D8B0` | Círculo beige arena |
| **Azul Demin** | `AD` | `#1E3A5F` | Círculo azul denim índigo profundo con micro-borde |

---

## 5. Micro-Interacciones y Háptica

- **Deslizamiento (Swipe):** Detección de gesto horizontal con umbral $\ge 50\text{px}$. Disparo de pulso háptico suave: `navigator.vibrate(10)`.
- **Digitación:** Al tocar una casilla, el texto existente se auto-selecciona inmediatamente para permitir sobrescritura directa con un solo toque.
- **Sincronización:** Al completar la transmisión a Supabase (HTTP 200), vibración de confirmación: `navigator.vibrate(25)`.
