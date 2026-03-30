// ─────────────────────────────────────────────────────────────
// 50 FRASES PARA EL NIVEL DE TRADUCCIÓN EN INGLÉS
// Para niños de 5-8 años · Vocabulario cotidiano sencillo
// Formato: { id, en, es, options: [correcta + 3 incorrectas], category, emoji }
// ─────────────────────────────────────────────────────────────

const TRANSLATION_PHRASES = [

  // ────────────────────────
  // 🐾 ANIMALES (1–10)
  // ────────────────────────
  {
    id: 1,
    en: "The cat is sleeping",
    es: "El gato está durmiendo",
    options: [
      "El gato está durmiendo",
      "El perro está corriendo",
      "El gato está comiendo",
      "El pato está nadando"
    ],
    category: "animals",
    emoji: "🐱"
  },
  {
    id: 2,
    en: "The dog is running",
    es: "El perro está corriendo",
    options: [
      "El perro está corriendo",
      "El gato está saltando",
      "El perro está durmiendo",
      "El conejo está corriendo"
    ],
    category: "animals",
    emoji: "🐶"
  },
  {
    id: 3,
    en: "A big elephant",
    es: "Un elefante grande",
    options: [
      "Un elefante grande",
      "Un perro pequeño",
      "Una jirafa alta",
      "Un elefante pequeño"
    ],
    category: "animals",
    emoji: "🐘"
  },
  {
    id: 4,
    en: "The bird is flying",
    es: "El pájaro está volando",
    options: [
      "El pájaro está volando",
      "El pez está nadando",
      "El pájaro está cantando",
      "La mariposa está volando"
    ],
    category: "animals",
    emoji: "🦅"
  },
  {
    id: 5,
    en: "A yellow duck",
    es: "Un pato amarillo",
    options: [
      "Un pato amarillo",
      "Un pato verde",
      "Un pollo amarillo",
      "Un pato rojo"
    ],
    category: "animals",
    emoji: "🦆"
  },
  {
    id: 6,
    en: "The fish is in the water",
    es: "El pez está en el agua",
    options: [
      "El pez está en el agua",
      "El pez está en el árbol",
      "La rana está en el agua",
      "El pez está en la arena"
    ],
    category: "animals",
    emoji: "🐟"
  },
  {
    id: 7,
    en: "A small rabbit",
    es: "Un conejo pequeño",
    options: [
      "Un conejo pequeño",
      "Un conejo grande",
      "Un ratón pequeño",
      "Un gato pequeño"
    ],
    category: "animals",
    emoji: "🐰"
  },
  {
    id: 8,
    en: "The frog is jumping",
    es: "La rana está saltando",
    options: [
      "La rana está saltando",
      "La rana está nadando",
      "El conejo está saltando",
      "La rana está comiendo"
    ],
    category: "animals",
    emoji: "🐸"
  },
  {
    id: 9,
    en: "A white horse",
    es: "Un caballo blanco",
    options: [
      "Un caballo blanco",
      "Un caballo negro",
      "Una vaca blanca",
      "Un caballo marrón"
    ],
    category: "animals",
    emoji: "🐴"
  },
  {
    id: 10,
    en: "The cow gives milk",
    es: "La vaca da leche",
    options: [
      "La vaca da leche",
      "La cabra da leche",
      "La vaca da agua",
      "El toro da leche"
    ],
    category: "animals",
    emoji: "🐮"
  },

  // ────────────────────────
  // 🍎 COMIDA (11–20)
  // ────────────────────────
  {
    id: 11,
    en: "I like apples",
    es: "Me gustan las manzanas",
    options: [
      "Me gustan las manzanas",
      "Me gustan las naranjas",
      "No me gustan las manzanas",
      "Me gustan los plátanos"
    ],
    category: "food",
    emoji: "🍎"
  },
  {
    id: 12,
    en: "A glass of milk",
    es: "Un vaso de leche",
    options: [
      "Un vaso de leche",
      "Una taza de leche",
      "Un vaso de agua",
      "Una botella de leche"
    ],
    category: "food",
    emoji: "🥛"
  },
  {
    id: 13,
    en: "I am hungry",
    es: "Tengo hambre",
    options: [
      "Tengo hambre",
      "Tengo sed",
      "Estoy cansado",
      "Tengo frío"
    ],
    category: "food",
    emoji: "🍽️"
  },
  {
    id: 14,
    en: "The pizza is hot",
    es: "La pizza está caliente",
    options: [
      "La pizza está caliente",
      "La pizza está fría",
      "La sopa está caliente",
      "La pizza está rica"
    ],
    category: "food",
    emoji: "🍕"
  },
  {
    id: 15,
    en: "A red strawberry",
    es: "Una fresa roja",
    options: [
      "Una fresa roja",
      "Una cereza roja",
      "Una fresa rosa",
      "Una manzana roja"
    ],
    category: "food",
    emoji: "🍓"
  },
  {
    id: 16,
    en: "I want a cookie",
    es: "Quiero una galleta",
    options: [
      "Quiero una galleta",
      "Quiero un pastel",
      "Quiero dos galletas",
      "No quiero una galleta"
    ],
    category: "food",
    emoji: "🍪"
  },
  {
    id: 17,
    en: "The soup is delicious",
    es: "La sopa está deliciosa",
    options: [
      "La sopa está deliciosa",
      "La sopa está fría",
      "El caldo está delicioso",
      "La sopa es fea"
    ],
    category: "food",
    emoji: "🍲"
  },
  {
    id: 18,
    en: "Three oranges",
    es: "Tres naranjas",
    options: [
      "Tres naranjas",
      "Dos naranjas",
      "Tres limones",
      "Cuatro naranjas"
    ],
    category: "food",
    emoji: "🍊"
  },
  {
    id: 19,
    en: "I drink water",
    es: "Bebo agua",
    options: [
      "Bebo agua",
      "Bebo leche",
      "Como agua",
      "Bebo zumo"
    ],
    category: "food",
    emoji: "🧃"
  },
  {
    id: 20,
    en: "A yellow banana",
    es: "Un plátano amarillo",
    options: [
      "Un plátano amarillo",
      "Un plátano verde",
      "Una pera amarilla",
      "Un plátano naranja"
    ],
    category: "food",
    emoji: "🍌"
  },

  // ────────────────────────
  // 👨‍👩‍👧 FAMILIA Y PERSONAS (21–28)
  // ────────────────────────
  {
    id: 21,
    en: "My mum is happy",
    es: "Mi mamá está feliz",
    options: [
      "Mi mamá está feliz",
      "Mi mamá está triste",
      "Mi abuela está feliz",
      "Mi mamá está cansada"
    ],
    category: "family",
    emoji: "👩"
  },
  {
    id: 22,
    en: "My dad is tall",
    es: "Mi papá es alto",
    options: [
      "Mi papá es alto",
      "Mi papá es bajo",
      "Mi abuelo es alto",
      "Mi papá es gordo"
    ],
    category: "family",
    emoji: "👨"
  },
  {
    id: 23,
    en: "I have a brother",
    es: "Tengo un hermano",
    options: [
      "Tengo un hermano",
      "Tengo una hermana",
      "Tengo un primo",
      "Tengo dos hermanos"
    ],
    category: "family",
    emoji: "🧒"
  },
  {
    id: 24,
    en: "My sister is little",
    es: "Mi hermana es pequeña",
    options: [
      "Mi hermana es pequeña",
      "Mi hermana es grande",
      "Mi hermana es mayor",
      "Mi amiga es pequeña"
    ],
    category: "family",
    emoji: "👧"
  },
  {
    id: 25,
    en: "Grandma is at home",
    es: "La abuela está en casa",
    options: [
      "La abuela está en casa",
      "La abuela está en el parque",
      "El abuelo está en casa",
      "La mamá está en casa"
    ],
    category: "family",
    emoji: "👵"
  },
  {
    id: 26,
    en: "We are a family",
    es: "Somos una familia",
    options: [
      "Somos una familia",
      "Somos amigos",
      "Tenemos una familia",
      "Somos una clase"
    ],
    category: "family",
    emoji: "👨‍👩‍👧‍👦"
  },
  {
    id: 27,
    en: "My baby is cute",
    es: "Mi bebé es bonito",
    options: [
      "Mi bebé es bonito",
      "Mi bebé es feo",
      "Mi muñeca es bonita",
      "Mi bebé es grande"
    ],
    category: "family",
    emoji: "👶"
  },
  {
    id: 28,
    en: "My friend is funny",
    es: "Mi amigo es gracioso",
    options: [
      "Mi amigo es gracioso",
      "Mi amigo es serio",
      "Mi amiga es graciosa",
      "Mi amigo es aburrido"
    ],
    category: "family",
    emoji: "🤝"
  },

  // ────────────────────────
  // 🎨 COLORES Y FORMAS (29–34)
  // ────────────────────────
  {
    id: 29,
    en: "The sky is blue",
    es: "El cielo es azul",
    options: [
      "El cielo es azul",
      "El cielo es gris",
      "El mar es azul",
      "El cielo es verde"
    ],
    category: "colors",
    emoji: "🔵"
  },
  {
    id: 30,
    en: "The grass is green",
    es: "La hierba es verde",
    options: [
      "La hierba es verde",
      "El árbol es verde",
      "La hierba es amarilla",
      "La planta es verde"
    ],
    category: "colors",
    emoji: "🟢"
  },
  {
    id: 31,
    en: "A big red circle",
    es: "Un círculo rojo grande",
    options: [
      "Un círculo rojo grande",
      "Un círculo azul grande",
      "Un cuadrado rojo grande",
      "Un círculo rojo pequeño"
    ],
    category: "colors",
    emoji: "🔴"
  },
  {
    id: 32,
    en: "A purple flower",
    es: "Una flor morada",
    options: [
      "Una flor morada",
      "Una flor rosa",
      "Una flor amarilla",
      "Un árbol morado"
    ],
    category: "colors",
    emoji: "🌸"
  },
  {
    id: 33,
    en: "An orange triangle",
    es: "Un triángulo naranja",
    options: [
      "Un triángulo naranja",
      "Un círculo naranja",
      "Un triángulo amarillo",
      "Un rectángulo naranja"
    ],
    category: "colors",
    emoji: "🟠"
  },
  {
    id: 34,
    en: "The star is yellow",
    es: "La estrella es amarilla",
    options: [
      "La estrella es amarilla",
      "La luna es amarilla",
      "La estrella es dorada",
      "El sol es amarillo"
    ],
    category: "colors",
    emoji: "⭐"
  },

  // ────────────────────────
  // ☀️ TIEMPO Y NATURALEZA (35–40)
  // ────────────────────────
  {
    id: 35,
    en: "It is raining today",
    es: "Hoy está lloviendo",
    options: [
      "Hoy está lloviendo",
      "Hoy está nevando",
      "Hoy está soleado",
      "Ayer estaba lloviendo"
    ],
    category: "weather",
    emoji: "🌧️"
  },
  {
    id: 36,
    en: "The sun is shining",
    es: "El sol brilla",
    options: [
      "El sol brilla",
      "La luna brilla",
      "El sol se esconde",
      "Las estrellas brillan"
    ],
    category: "weather",
    emoji: "☀️"
  },
  {
    id: 37,
    en: "It is very cold",
    es: "Hace mucho frío",
    options: [
      "Hace mucho frío",
      "Hace mucho calor",
      "Hace un poco de frío",
      "Tengo mucho frío"
    ],
    category: "weather",
    emoji: "🥶"
  },
  {
    id: 38,
    en: "A big white cloud",
    es: "Una nube blanca grande",
    options: [
      "Una nube blanca grande",
      "Una nube gris grande",
      "Una nube blanca pequeña",
      "Un globo blanco grande"
    ],
    category: "weather",
    emoji: "⛅"
  },
  {
    id: 39,
    en: "The wind is strong",
    es: "El viento es fuerte",
    options: [
      "El viento es fuerte",
      "El viento es suave",
      "La lluvia es fuerte",
      "El viento es frío"
    ],
    category: "weather",
    emoji: "💨"
  },
  {
    id: 40,
    en: "The tree is very tall",
    es: "El árbol es muy alto",
    options: [
      "El árbol es muy alto",
      "El árbol es muy bajo",
      "La planta es muy alta",
      "El árbol es bastante alto"
    ],
    category: "weather",
    emoji: "🌳"
  },

  // ────────────────────────
  // 🏠 CASA Y OBJETOS (41–46)
  // ────────────────────────
  {
    id: 41,
    en: "Open the door",
    es: "Abre la puerta",
    options: [
      "Abre la puerta",
      "Cierra la puerta",
      "Abre la ventana",
      "Toca la puerta"
    ],
    category: "home",
    emoji: "🚪"
  },
  {
    id: 42,
    en: "My bedroom is big",
    es: "Mi habitación es grande",
    options: [
      "Mi habitación es grande",
      "Mi habitación es pequeña",
      "Mi cocina es grande",
      "Mi cuarto es enorme"
    ],
    category: "home",
    emoji: "🛏️"
  },
  {
    id: 43,
    en: "The book is on the table",
    es: "El libro está en la mesa",
    options: [
      "El libro está en la mesa",
      "El libro está en el suelo",
      "El cuaderno está en la mesa",
      "El libro está bajo la mesa"
    ],
    category: "home",
    emoji: "📖"
  },
  {
    id: 44,
    en: "Turn off the light",
    es: "Apaga la luz",
    options: [
      "Apaga la luz",
      "Enciende la luz",
      "Apaga la tele",
      "Baja la luz"
    ],
    category: "home",
    emoji: "💡"
  },
  {
    id: 45,
    en: "My toy is broken",
    es: "Mi juguete está roto",
    options: [
      "Mi juguete está roto",
      "Mi juguete es nuevo",
      "Mi bici está rota",
      "Mi juguete está perdido"
    ],
    category: "home",
    emoji: "🧸"
  },
  {
    id: 46,
    en: "I brush my teeth",
    es: "Me lavo los dientes",
    options: [
      "Me lavo los dientes",
      "Me peino el pelo",
      "Me lavo las manos",
      "Me cepillo los dientes mucho"
    ],
    category: "home",
    emoji: "🪥"
  },

  // ────────────────────────
  // 🏫 COLEGIO Y ACCIONES (47–50)
  // ────────────────────────
  {
    id: 47,
    en: "I go to school",
    es: "Voy al colegio",
    options: [
      "Voy al colegio",
      "Voy al parque",
      "Vengo del colegio",
      "Voy a la biblioteca"
    ],
    category: "school",
    emoji: "🏫"
  },
  {
    id: 48,
    en: "I can draw well",
    es: "Sé dibujar bien",
    options: [
      "Sé dibujar bien",
      "Me gusta dibujar",
      "No sé dibujar bien",
      "Sé pintar bien"
    ],
    category: "school",
    emoji: "🖍️"
  },
  {
    id: 49,
    en: "Let's play together",
    es: "Juguemos juntos",
    options: [
      "Juguemos juntos",
      "Jugamos solos",
      "Vamos a correr juntos",
      "Juguemos después"
    ],
    category: "school",
    emoji: "🤸"
  },
  {
    id: 50,
    en: "Good morning, teacher",
    es: "Buenos días, profe",
    options: [
      "Buenos días, profe",
      "Buenas tardes, profe",
      "Hola, amigo",
      "Buenas noches, profe"
    ],
    category: "school",
    emoji: "🏫"
  }
];

// ─────────────────────────────────────────────────────────────
// Selecciona N frases aleatorias con opciones barajadas
// ─────────────────────────────────────────────────────────────
function getRandomPhrases(n = 10) {
  const shuffled = Engine.shuffle([...TRANSLATION_PHRASES]);
  return shuffled.slice(0, n).map(phrase => ({
    ...phrase,
    options: Engine.shuffle([...phrase.options])
  }));
}
