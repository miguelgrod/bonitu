# Arquitectura de ZampiFood

Todo vive en [../index.html](../index.html). Sin build, sin dependencias, sin
peticiones de red. Un solo archivo de ~934 líneas dividido en tres bloques:

| Líneas aprox. | Contenido |
|---|---|
| 1–255 | `<head>` + `<style>`: tokens CSS y todos los estilos |
| 256–262 | `<body>`: tres contenedores vacíos que el JS rellena |
| 263–933 | `<script>`: datos, iconos, estado, plantillas y render |

El DOM inicial es mínimo a propósito:

```html
<div class="app">
  <header class="topbar" id="topbar"></header>
  <main id="screen" class="screen"></main>
</div>
<nav class="nav" id="nav"></nav>
```

## CSS

Sistema de tokens en `:root` / `[data-theme="light"]`, redefinidos en
`[data-theme="dark"]`. Paleta por familias (`--green`, `--orange`, `--purple`,
`--teal`, `--amber`), cada una con su variante `-soft`; superficies (`--page`,
`--app`, `--card`), tinta (`--ink`, `--ink-2`), sombras y radios.

Diseño **mobile-first**: la app se limita a `max-width:480px` y a partir de
560px se convierte en una "tarjeta de móvil" centrada con esquinas redondeadas
sobre un fondo con degradados radiales. Usa `100dvh`, `env(safe-area-inset-*)`
y `backdrop-filter` — está pensada para iPhone.

El tema se persiste en `localStorage` bajo la clave **`recetario:tema`** (ojo:
`recetario`, no `zampifood`) y arranca desde `prefers-color-scheme` si no hay
valor guardado. `toggleTheme()` también actualiza el `<meta name="theme-color">`.

## Datos

### `CATS` — 9 categorías

`desayunos`, `tentempies`, `comidas`, `meriendas`, `cenas`, `sopas`, `pures`,
`frias`, `guisos`. Cada una define `label`, `emoji`, `color`, `soft`, `grad`
(degradado para héroes y tarjetas destacadas) y `desc`.

### `R` — array de 106 recetas

Contrato de un objeto receta:

```js
{
  id:"co13",          // prefijo de categoría + número correlativo, único
  cat:"comidas",      // clave de CATS
  n:13,               // ordinal dentro de su categoría, se muestra en la UI
  kcal:330,           // estimación por ración, entero
  e:"🐟",             // emoji, se usa como "foto" del plato
  nuevo:true,         // opcional; activa el badge y el filtro "solo nuevas"
  t:"Pescado blanco al horno con cama de verduras bajas en FODMAP",
  ing:["…"],          // ingredientes, texto libre
  prep:["…"]          // pasos, texto libre, uno por elemento
}
```

Prefijos de `id` por categoría:

| Prefijo | Categoría | Nº recetas |
|---|---|---|
| `de` | desayunos | 10 |
| `te` | tentempies | 11 |
| `co` | comidas | 23 |
| `me` | meriendas | 10 |
| `ce` | cenas | 17 |
| `so` | sopas | 9 |
| `pu` | pures | 8 |
| `fr` | frias | 10 |
| `gc` | guisos | 8 |

`BY_ID` es el índice `id → receta` derivado de `R`.

### `FREQ` y `BASES`

Tarjetas informativas de texto (con HTML inline permitido, se inyectan sin
escapar) que alimentan las vistas *Frecuencias* y *Guía*. Reflejan el documento
médico, no las recetas — por eso pueden desincronizarse.

### `PLAN` — menú semanal

Siete días, cada uno con `s`: cinco ids de receta en el orden de `SLOTS`
(`Desayuno`, `Tentempié`, `Comida`, `Merienda`, `Cena`). `kcalDia(i)` suma las
kcal del día y la UI lo compara con `KCAL_OBJETIVO = 2000`; el rango real
mantenido es 1970–2025 kcal.

Restricciones que cumple el plan y que hay que preservar al regenerarlo:
pollo o pavo 2 días, conejo o carne roja 3 días, una sola ración de carne al
día, 1 huevo entero a la semana y ninguna receta más de dos veces por semana.

**Si cambias las kcal de una receta o eliminas un id, `PLAN` queda descuadrado.**

## Vistas y enrutado

`route()` parsea `location.hash`:

| Hash | Vista | Función |
|---|---|---|
| `#/` | Inicio | `viewHome()` |
| `#/cat/<clave>` | Categoría | `viewCat(key)` |
| `#/r/<id>` | Detalle de receta | `viewRecipe(id)` |
| `#/frecuencias` | Frecuencias | `viewFreq()` |
| `#/guia` | Guía | `viewGuia()` |

`render()` es el único punto de escritura del DOM: reconstruye topbar, pantalla
y nav en cada cambio de hash y vuelve a enganchar los listeners. La navegación
usa delegación global sobre `[data-go]`.

`viewHome()` contiene, en este orden: buscador + botón de filtro, contenedor de
resultados, categorías, carrusel de destacadas (lista fija de ids en la primera
línea de la función), menú de la semana y aviso médico.

## Estado

Tres variables globales, sin persistencia salvo el tema:

- `onlyNew` — filtro de recetas marcadas `nuevo`
- `query` — texto del buscador (busca en título, ingredientes y nombre de categoría)
- `planDay` — día seleccionado del menú, inicializado al día actual (0 = lunes)

Buscar o filtrar oculta `#home-sections` y muestra `#results`; `renderResults()`
repinta solo esa caja, no toda la vista.

## Seguridad del render

Todo se construye con plantillas de string e `innerHTML`. Los textos de receta
pasan por `esc()`; los textos de `FREQ`, `BASES` y `viewGuia()` **no**, porque
llevan `<em>`/`<strong>` a propósito. Al añadir contenido nuevo, respeta esa
distinción.

## Cómo hacer los cambios habituales

**Añadir una receta:** valida los ingredientes contra [DIETA.md](DIETA.md), añade
el objeto al final del bloque de su categoría en `R` con `n` correlativo y `id`
libre, estima las kcal por ración con las cantidades estándar documentadas en
`viewGuia()` (2 rebanadas de pan, 70 g de arroz en crudo, 200 g de carne o
pescado, 10 ml de aceite) y marca `nuevo:true` si toca. Los contadores de la UI
se actualizan solos.

**Eliminar un ingrediente de toda la app:** sustitúyelo receta a receta ajustando
kcal, luego **límpialo también** de `FREQ`, `BASES` y de los párrafos de
`viewGuia()`, y por último regenera `PLAN`.

**Añadir una categoría:** entrada en `CATS` + recetas con el nuevo prefijo. La
home y los chips la recogen automáticamente; el nav inferior es fijo (`NAV`).

## Deuda conocida

Tras el commit `c1e7eab` ("fuera galletas y marisco, menos queso") quedaron
referencias huérfanas en los textos informativos, que ya no se corresponden con
ninguna receta:

- `FREQ` mantiene la tarjeta 🦪 **"Marisco bivalvo — permitido todos los días"**.
- `BASES` cita **"galletas integrales"** en *Ingredientes base* y **"marisco
  bivalvo"** en *Proteínas válidas*.
- `viewGuia()`, en *Más combinaciones útiles*, sugiere **"galletas integrales con
  queso descremado"** y **"marisco bivalvo con pasta y calabacín"**.

Son textos, no datos: no rompen nada, pero contradicen la lista de recetas.
