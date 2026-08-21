# Reglas dietéticas

Las recetas no son libres: implementan dos documentos médicos que están en
`../ingredientes/` (fuera de git, material de trabajo).

| Documento | Aporta |
|---|---|
| `documento_combinado.html` | Recomendaciones dietéticas generales: lípidos, lácteos, frecuencias de carne, bebidas |
| `futas y vegetales.html` | Tablas FODMAP bajo / medio / alto (fuente: Monash University) |

Regla general: **se prioriza la columna BAJO en FODMAP**, la columna MEDIO se usa
con control de cantidad y la columna ALTO se evita.

## Ingredientes vetados y por qué

| Fuera | Motivo |
|---|---|
| Ajo, cebolla | Alto en FODMAP. Alternativas: **tallo verde de cebolleta**, aceite infusionado con ajo |
| Champiñones, coliflor | Alto en FODMAP |
| Manzana, pera, sandía, ciruela, dátil, fruta desecada | Alto en FODMAP |
| Lácteos enteros, mantequilla, yogur entero, quesos grasos | Recomendación de lípidos |
| Aceite de coco y de palma, frituras, precocinados | Recomendación de lípidos |
| **Galletas integrales** | Retiradas por decisión del usuario (commit `c1e7eab`), no por la dieta |
| **Marisco bivalvo** (mejillones, almejas, chirlas, ostras) | Retirado por decisión del usuario (`c1e7eab`) aunque el documento lo permite a diario |

**Queso:** permitido solo desnatado / light, y deliberadamente escaso. En
`c1e7eab` pasó de 24 recetas a 8: se conserva únicamente donde el queso *es* el
plato. En el resto se sustituyó por hierbas, limón, mostaza, nueces o aceite de
oliva. No lo reintroduzcas como comodín. Con la tanda de calabacín subió a 10,
en los dos únicos casos donde el gratinado define el plato (`ce16` gratinado y
`co21` lasaña).

**Lactosa:** todos los lácteos de las recetas son *sin lactosa* y desnatados.

## Frecuencias (límites duros)

| Alimento | Límite |
|---|---|
| Pescado blanco y azul | A diario, recomendado con frecuencia (sardina, trucha, atún, caballa) |
| Pollo o pavo | Máx. **2 días/semana** |
| Carne roja sin piel o conejo | Máx. **2–3 días/semana** |
| Carne (cualquiera) | **Una sola vez al día**, máx. 200 g, a la plancha o brasa con poco aceite |
| Huevos enteros | Máx. **2–3/semana** (en el menú actual: 1). La **clara** no tiene límite |
| Lácteos desnatados sin lactosa | A diario |
| Verduras y frutas bajas en FODMAP | En abundancia, a diario, sin restricción |
| Café o té | Máx. 3/día |
| Vino | Máx. 2/día, desaconsejado con sobrepeso, embarazo o hipertrigliceridemia |
| Agua mineral | Bebida base |

## Despensa válida

**Cereales y feculentos:** pan integral, arroz integral, pasta (de espelta o sin
gluten si hay sensibilidad), patata, boniato.

**Proteínas:** pescado blanco y azul, atún en lata, salmón ahumado, clara de
huevo, pollo, pavo, conejo, carnes rojas sin piel.

**Verduras bajas en FODMAP:** tomate, lechuga, espinacas, calabacín, pimiento
rojo, zanahoria, judías verdes, pepino, brócoli, berenjena, boniato, kale,
berza, rúcula, aceitunas, patata, nabo, tallo verde de cebolleta.

**Frutas bajas en FODMAP:** fresas, arándanos, frambuesas, kiwi verde, naranja,
mandarina, piña, papaya, melón, plátano poco maduro, uva, zumo de limón.

**Frutos secos y semillas:** nueces, pipas de girasol sin sal.

**Condimentos:** aceite de oliva con moderación, pimienta, mostaza, hierbas
frescas, jengibre, zumo de limón, sal con moderación. Mermelada sin fructosa y
flan sin huevo como dulces puntuales.

## Calorías

Estimaciones **por ración**, orientativas, calculadas sumando ingredientes en
cantidades estándar: 2 rebanadas de pan integral, 70 g de arroz en crudo, 200 g
de carne o pescado, 10 ml de aceite de oliva. No son valores analíticos; sirven
para componer el día, no para control clínico.

El menú semanal apunta a **~2000 kcal/día** (rango real mantenido: 1970–2025),
repartidas en cinco franjas.

## Aviso que la app muestra y hay que mantener

> La dieta debe modificarse en caso de diabetes, obesidad, hiperuricemia o
> hipertensión. Los alimentos de alta densidad calórica (frutos secos, dulces,
> repostería) deben limitarse en pacientes con sobrepeso o hipertrigliceridemia.
> Consulta con tu médico o nutricionista antes de hacer cambios significativos.

Aparece en la home y en la vista de Frecuencias. No lo quites.
