# CeceStock — Conteo Rápido de Inventario Físico

> **Marca:** Cece Boutique  
> **Tipo:** Progressive Web App (PWA) Mobile-First  
> **Objetivo:** Conteo de inventario físico en piso de venta a máxima velocidad, sin fricciones ni errores mecánicos.  
> **Stack:** React 19 + TypeScript + Vite + TailwindCSS + Supabase + Lucide React  

---

## 📱 Visión del Producto

**CeceStock** es la PWA móvil diseñada específicamente para el ritmo de trabajo de los asesores y operarios en las tiendas de **Cece Boutique**. 

En lugar de utilizar complejas hojas de cálculo o interfaces de escritorio adaptadas a pantallas pequeñas, CeceStock ofrece una experiencia táctil ultra-enfocada:
- **Navegación horizontal fluida:** Cada producto posee su propia tarjeta autónoma sin scrolls infinitos, navegable mediante gestos de deslizamiento táctil (Swipe) de $\ge 50\text{px}$.
- **Flujo de teclado continuo:** Cada color posee un input numérico optimizado con **auto-selección al enfocar** (sobrescritura sin borrar) y **auto-avance con la tecla Enter** hacia el siguiente color mediante referencias encadenadas de React.
- **Resiliencia offline total:** Cada pulsación se almacena en tiempo real en `localStorage`. Si la pantalla se bloquea o el navegador se cierra, los datos permanecen intactos.
- **Sincronización segura con Supabase:** Un solo botón para sincronizar el lote completo con la base de datos PostgreSQL en la nube, con confirmación háptica (`navigator.vibrate`).

---

## 🎨 Sistema de Diseño (Obsidian Dark)

Diseñado con **Stitch MCP** y documentado en [`DESIGN.md`](./DESIGN.md):
- **Fondo General:** `#090A0F` (Negro obsidiana táctico).
- **Tarjetas:** `#13161F` (Gris naval oscuro) con micro-borde `#2A3042`.
- **Inputs:** `#1A1E2B` (Contenedor contrastado para dígitos con altura `h-9` y centrado).
- **Contraste de Tonos Oscuros:** Anillo perimetral reforzado (`ring-1 ring-slate-500/80`) para colores oscuros (`PT`, `VN`, `MR`).
- **Layout Vertical Zero-Scroll:** Matriz compactada (`gap-y-1.5`, `py-1.5`) para que los 13 colores entren al 100% en la pantalla sin scroll vertical.
- **Textos:** `#FFFFFF` (Primario) y `#94A3B8` (Secundario).
- **Acento Primario:** `#3B82F6` (Azul zafiro para píldora activa y sync).
- **Estado Focus:** `#60A5FA`.
- **Estado Éxito:** `#10B981` (Verde esmeralda).
- **Tipografía y Cifras:** Inter con la clase obligatoria `tabular-nums` de Tailwind para dígitos monoespaciados fijos.

---

## 👗 Catálogo Base Configurado

### 7 Productos Iniciales:
1. `REF-001` — **Conjunto Soie**
2. `REF-002` — **Conjunto Venus**
3. `REF-003` — **Macaquino Gola**
4. `REF-004` — **Macaquino Channel**
5. `REF-005` — **Macaquino Paris**
6. `REF-006` — **Macaquino Yan**
7. `REF-007` — **Conjunto Moly**

### 13 Colores Estándar del Negocio:
`Preto` (`PT`), `Off White` (`OW`), `Rosa` (`RS`), `Rose` (`RO`), `Verde Menta` (`VM`), `Verde Oliva` (`VO`), `Vermelho` (`VE`), `Lilás` (`LL`), `Amarelo` (`AM`), `Azul` (`AZ`), `Vinho` (`VN`), `Marrom` (`MR`), `Areia` (`AR`).

---

## 🚀 Puesta en Marcha Local

### Requisitos
- Node.js \(\ge 18\)
- npm o pnpm

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 3. Iniciar entorno de desarrollo
npm run dev

# 4. Compilar para producción (Cloudflare Pages)
npm run build
```

---

## 📖 Documentación Interna
- [`DESIGN.md`](./DESIGN.md): Tokens y especificación UI/UX formal para Stitch MCP.
- [`AGENTS.md`](./AGENTS.md): Reglas de arquitectura, código estricto y convenciones para agentes de desarrollo.
