# Arquitectura de ZampiFood

Todo vive en [../index.html](../index.html). Sin build, sin dependencias, sin
peticiones de red. Un solo archivo de ~1060 líneas (~134 KB) dividido en tres bloques:

| Líneas aprox. | Contenido |
|---|---|
| 1–295 | `<head>` (metadatos, OG) + `<style>`: fuente incrustada, tokens CSS y estilos |
| 297–302 | `<body>`: tres contenedores vacíos que el JS rellena |
| 304–1059 | `<script>`: datos, iconos, estado, plantillas y render |

### Metadatos

`description`, Open Graph (`og:type`, `og:locale`, `og:site_name`, `og:title`,
`og:description`) y `twitter:card` = `summary_large_image`. **Pendiente:**
`og:url`, `og:image` (1200×630), `og:image:alt` y `twitter:image` están
comentados en el `<head>` hasta tener imagen y URL definitivas. No hay favicon
(la carpeta `icons/` está pendiente).

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

**Paleta de marca y contraste (WCAG AA).** Verde `#5DA44C` / `#83B853` y naranja
`#FE8526` de la identidad. Como color de texto pequeño no sirven (3,05:1 y
2,44:1 sobre blanco), así que:

- `--green-ink` (`#3F7A32`) y `--orange-ink` (`#B85A12`) son los tonos para texto
  de color. En tema oscuro coinciden con el color de marca, que ya cumple.
- `--on-brand` es el color de texto e iconos sobre fondos verdes o naranjas:
  `--ink` en claro, casi negro en oscuro. **Nunca blanco sobre naranja.**
- Las categorías `comidas`, `meriendas` y `guisos` tienen `ink:true` en `CATS`:
  sus degradados son de marca y las tarjetas destacadas, el héroe y el botón del
  detalle llevan clase `.ink` (texto `--on-brand`). Ámbar, morado y turquesa
  siguen con texto blanco.

**Tipografía.** Plus Jakarta Sans 400/600/700 (OFL) incrustada como `@font-face`
WOFF2 en base64 (subset Latin básico + español + `ı`, ~26 KB), en el token
`--font-display`. Se usa en `h1`–`h3`, nombres de receta del menú y la marca; el
resto va con la fuente del sistema. Escala de tamaños en tokens: `--fs-1` 28
(título de pantalla), `--fs-2` 22 (bloque), `--fs-3` 17 (destacado: nombres en
tarjetas, cabecera), `--fs-4` 15 (texto), `--fs-5` 13 (secundario: kcal,
contadores), `--fs-6` 11,5 (etiquetas, chips). Solo los emojis grandes (52, 64 y
96 px) usan tamaños fijos.

**Cabecera.** Símbolo del logotipo como SVG en `I.brand` y nombre «Zampi» 700 +
«Food» 400; el punto naranja de la i es un `::after` sobre una `ı` sin punto,
calibrado con las métricas de la fuente (lectores de pantalla leen el texto
oculto `.sr`).

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
| `#/legal` | Aviso legal y privacidad | `viewLegal()` |

`#/legal` no está en el menú inferior: se enlaza con un `.legal-link` discreto
bajo la tarjeta «Antes de empezar» de la home y al final de la Guía, que cierra
con el bloque **Fuentes** (documento de la nutricionista, tablas FODMAP de Monash
University vía Experto Nutrición, recetas de elaboración propia). Si cambia lo
que la app guarda o envía, actualiza el texto de privacidad de `viewLegal()`.

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
pasan por `esc()`; los textos de `FREQ`, `BASES`, `viewGuia()` y `viewLegal()` **no**, porque
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

Resuelta. Tras el commit `c1e7eab` ("fuera galletas y marisco, menos queso")
quedaron referencias a galletas integrales y marisco bivalvo en `FREQ`, `BASES` y
`viewGuia()`; se eliminaron en la puesta a punto de la rama
`recetario-puesta-a-punto`. Ninguno de los dos aparece ya en `index.html`; el
motivo de su retirada sigue documentado en [DIETA.md](DIETA.md).
