# ZampiFood — recetario

App web de recetas de una sola página, en español, para una dieta médica
concreta (baja en FODMAP + recomendaciones de lípidos). Vive dentro del sitio
**Bonitu Plays** y se despliega con él.

## Lo esencial en 30 segundos

- **Todo el código está en [index.html](index.html)** (~1060 líneas, ~134 KB): HTML,
  CSS y JS en un único archivo, sin build, sin dependencias, sin red. La fuente
  de titulares (Plus Jakarta Sans) va incrustada en base64. Se abre con doble
  clic o con `python3 -m http.server`.
- **106 recetas** en 9 categorías, definidas como literales JS en el array `R`.
- Enrutado por `location.hash`, render por `innerHTML`, estado en 3 variables
  globales. No hay framework.
- Vistas: inicio, categoría, receta, Frecuencias, Guía (con las fuentes citadas
  al final) y Aviso legal y privacidad (`#/legal`, fuera del menú inferior).
- Nombre visible: **ZampiFood** (la carpeta y el repo siguen diciendo "recetario";
  es intencional, no lo renombres).
- Idioma de todo —UI, datos, comentarios de código y mensajes de commit—:
  **español**.

## Documentos de contexto

| Archivo | Para qué |
|---|---|
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Estructura de `index.html`, contrato de datos de una receta, vistas, cómo añadir o cambiar recetas |
| [docs/DIETA.md](docs/DIETA.md) | Reglas dietéticas que restringen los ingredientes, límites de frecuencia, ingredientes vetados |

## Reglas al trabajar aquí

1. **Ningún ingrediente entra sin comprobar [docs/DIETA.md](docs/DIETA.md).** Es una
   dieta médica real, no un recetario libre. Ajo, cebolla, manzana, pera,
   champiñones, galletas y marisco están fuera por motivos distintos.
2. **Un solo archivo.** No trocees `index.html` en JS/CSS separados ni introduzcas
   dependencias, bundlers o frameworks salvo petición explícita.
3. **Al tocar recetas, recalcula el menú semanal.** `PLAN` referencia recetas por
   id y muestra kcal/día; si cambias kcal o eliminas un id, el menú se descuadra.
   Objetivo: 1970–2025 kcal/día.
4. **Al eliminar un ingrediente de las recetas, límpialo también de los textos**
   de `FREQ`, `BASES` y `viewGuia()`. Ahí es donde ya se han quedado
   incoherencias otras veces.
5. Commits en español con prefijo `Recetario:`.
6. **Contraste AA.** Nunca texto blanco sobre verde o naranja de marca: usa
   `--on-brand`. Para texto pequeño de color usa `--green-ink` / `--orange-ink`,
   no `--green` / `--orange`. Tamaños de letra solo con los tokens `--fs-1…6`.

## Pendiente (fuera del código)

- Imagen Open Graph 1200×630 y URL definitiva: líneas comentadas en el `<head>`.
- Email de contacto: marcador `[EMAIL — PENDIENTE]` en `viewLegal()`.
- Favicons: la carpeta `icons/` aún no existe (sin ella el navegador pide
  `/favicon.ico` y da 404).

## Contexto del sitio padre

- Raíz del repo: `/Users/miguelgarciarodriguez/Dropbox/Claude/Bonitu` (rama `main`).
- Deploy automático: push a `main` → GitHub Actions → `aws s3 sync` al bucket
  `bonituplay` + invalidación de CloudFront `E3LRZQIIEJH24`. **Cada push a main
  publica en producción.**
- `recetario/assets/` e `recetario/ingredientes/` están en `.gitignore`: son
  material de trabajo (referencia visual de UI y los documentos médicos
  originales), no se publican.
- El resto del sitio Bonitu Plays es un juego de niveles independiente; el
  recetario no comparte código con él.
