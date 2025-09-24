import { LanguageData } from '../types';

export const DEFAULT_ENGLISH_CATEGORIES = {
  family: {
    title: 'Family',
    language: 'english' as const,
    words: [
      { word: 'mummy', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'daddy', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'baby', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'brother', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sister', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'grandma', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'grandpa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'nana', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'papa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'auntie', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'uncle', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  food: {
    title: 'Food & Drink',
    language: 'english' as const,
    words: [
      { word: 'milk', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'water', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'banana', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'apple', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bread', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'biscuit', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'juice', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'yoghurt', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cheese', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'chicken', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pasta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rice', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'egg', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cereal', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'orange', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'grapes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'strawberry', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'carrots', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'peas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'potato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'finished', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'more', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'yummy', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  actions: {
    title: 'Actions & Verbs',
    language: 'english' as const,
    words: [
      { word: 'go', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'come', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'stop', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sit', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'stand', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'walk', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'run', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'jump', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'play', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sleep', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'eat', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'drink', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'wash', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'brush', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'read', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sing', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dance', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'help', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'give', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'take', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'open', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'close', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  body: {
    title: 'Body Parts',
    language: 'english' as const,
    words: [
      { word: 'head', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hair', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'eyes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'nose', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mouth', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ears', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'teeth', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hands', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fingers', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'arms', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'legs', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'feet', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'toes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tummy', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'back', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'knee', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  toys: {
    title: 'Toys & Objects',
    language: 'english' as const,
    words: [
      { word: 'ball', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'book', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'car', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'doll', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'teddy', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'blocks', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'puzzle', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'train', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'phone', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'keys', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bag', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hat', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'shoes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'socks', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'blanket', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pillow', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cup', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'plate', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'spoon', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fork', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  colors: {
    title: 'Colors & Shapes',
    language: 'english' as const,
    words: [
      { word: 'red', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'blue', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'yellow', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'green', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'orange', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'purple', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pink', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'black', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'white', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'brown', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'circle', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'square', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'triangle', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'big', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'small', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  animals: {
    title: 'Animals',
    language: 'english' as const,
    words: [
      { word: 'dog', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cat', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bird', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fish', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cow', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pig', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sheep', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'horse', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'duck', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'chicken', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'elephant', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'lion', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bear', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'monkey', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rabbit', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mouse', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  greetings: {
    title: 'Greetings & Manners',
    language: 'english' as const,
    words: [
      { word: 'hello', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hi', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bye', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'please', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'thank you', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sorry', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'yes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'no', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'good morning', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'good night', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'love you', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'excuse me', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  other: {
    title: 'Other',
    language: 'english' as const,
    words: []
  }
};

export const DEFAULT_PORTUGUESE_CATEGORIES = {
  family: {
    title: 'Família',
    language: 'portuguese' as const,
    words: [
      { word: 'mamãe', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'papai', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bebê', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'irmão', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'irmã', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vovó', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vovô', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tia', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tio', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'primo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'prima', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  food: {
    title: 'Comida & Bebida',
    language: 'portuguese' as const,
    words: [
      { word: 'leite', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'água', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'banana', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'maçã', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pão', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'biscoito', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'suco', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'iogurte', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'queijo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'frango', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'macarrão', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'arroz', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ovo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cereal', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'laranja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'uva', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'morango', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cenoura', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ervilha', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'batata', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'acabou', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mais', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'gostoso', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  actions: {
    title: 'Ações & Verbos',
    language: 'portuguese' as const,
    words: [
      { word: 'vai', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vem', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'para', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'senta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'levanta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'anda', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'corre', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pula', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'brinca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dorme', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'comer', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'beber', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'lavar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'escovar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ler', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cantar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dançar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ajudar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pegar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'abrir', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fechar', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  body: {
    title: 'Partes do Corpo',
    language: 'portuguese' as const,
    words: [
      { word: 'cabeça', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cabelo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'olhos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'nariz', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'boca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'orelhas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dentes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mãos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dedos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'braços', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pernas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pés', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dedos do pé', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'barriga', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'costas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'joelho', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  toys: {
    title: 'Brinquedos & Objetos',
    language: 'portuguese' as const,
    words: [
      { word: 'bola', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'livro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'carro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'trem', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'avião', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bicicleta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'boneca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ursinho', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'blocos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'quebra-cabeça', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'copo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'prato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'colher', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'garfo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mamadeira', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sapatos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'meias', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'chapéu', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'casaco', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fralda', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  colors: {
    title: 'Cores & Descrições',
    language: 'portuguese' as const,
    words: [
      { word: 'vermelho', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'azul', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'amarelo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'verde', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rosa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'roxo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'laranja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'preto', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'branco', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'grande', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pequeno', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'alto', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'baixo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'quente', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'frio', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rápido', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'devagar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'feliz', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'triste', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  animals: {
    title: 'Animais',
    language: 'portuguese' as const,
    words: [
      { word: 'cachorro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'gato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vaca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'porco', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ovelha', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cavalo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'galinha', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'peixe', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'passarinho', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'coelho', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ratinho', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'elefante', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'leão', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tigre', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'macaco', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'urso', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'borboleta', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  greetings: {
    title: 'Social & Educação',
    language: 'portuguese' as const,
    words: [
      { word: 'olá', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'oi', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tchau', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'por favor', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'obrigado', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'desculpa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'com licença', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sim', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'não', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'meu', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'seu', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dividir', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vez', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'amigo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'amor', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'beijo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'abraço', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  places: {
    title: 'Lugares & Locais',
    language: 'portuguese' as const,
    words: [
      { word: 'casa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'jardim', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'parque', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'loja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'escola', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'quarto', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cozinha', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'banheiro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fora', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dentro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'em cima', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'embaixo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cama', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'banho', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'carro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'playground', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  other: {
    title: 'Outros',
    language: 'portuguese' as const,
    words: []
  }
};

export const DEFAULT_SPANISH_CATEGORIES = {
  family: {
    title: 'Familia',
    language: 'spanish' as const,
    words: [
      { word: 'mamá', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'papá', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bebé', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hermano', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hermana', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'abuela', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'abuelo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tía', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tío', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'primo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'prima', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  food: {
    title: 'Comida & Bebida',
    language: 'spanish' as const,
    words: [
      { word: 'leche', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'agua', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'banana', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'manzana', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pan', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'galleta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'jugo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'yogur', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'queso', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pollo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pasta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'arroz', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'huevo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cereal', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'naranja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'uvas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'fresa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'zanahoria', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'guisantes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'patata', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'terminado', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'más', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rico', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  actions: {
    title: 'Acciones & Verbos',
    language: 'spanish' as const,
    words: [
      { word: 'ir', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'venir', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'parar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sentar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'levantar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'caminar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'correr', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'saltar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'jugar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dormir', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'comer', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'beber', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'lavar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cepillar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'leer', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cantar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bailar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ayudar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tomar', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'abrir', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cerrar', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  body: {
    title: 'Partes del Cuerpo',
    language: 'spanish' as const,
    words: [
      { word: 'cabeza', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pelo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ojos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'nariz', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'boca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'orejas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dientes', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'manos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dedos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'brazos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'piernas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pies', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'dedos de los pies', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'barriga', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'espalda', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rodilla', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  toys: {
    title: 'Juguetes & Objetos',
    language: 'spanish' as const,
    words: [
      { word: 'pelota', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'libro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'coche', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'muñeca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'osito', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bloques', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rompecabezas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tren', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'teléfono', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'llaves', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'bolsa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sombrero', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'zapatos', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'calcetines', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'manta', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'almohada', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vaso', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'plato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cuchara', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'tenedor', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  colors: {
    title: 'Colores & Formas',
    language: 'spanish' as const,
    words: [
      { word: 'rojo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'azul', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'amarillo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'verde', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'naranja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'morado', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'rosa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'negro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'blanco', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'marrón', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'círculo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cuadrado', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'triángulo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'grande', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pequeño', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  animals: {
    title: 'Animales',
    language: 'spanish' as const,
    words: [
      { word: 'perro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'gato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pájaro', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pez', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'vaca', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cerdo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'oveja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'caballo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pato', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'pollo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'elefante', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'león', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'oso', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mono', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'conejo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ratón', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  greetings: {
    title: 'Saludos & Modales',
    language: 'spanish' as const,
    words: [
      { word: 'hola', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'hi', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'adiós', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'por favor', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'gracias', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'perdón', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'sí', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'no', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'buenos días', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'buenas noches', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'te amo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'con permiso', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  other: {
    title: 'Otros',
    language: 'spanish' as const,
    words: []
  }
};

export const getDefaultLanguageData = (): LanguageData => ({
  english: DEFAULT_ENGLISH_CATEGORIES,
  portuguese: DEFAULT_PORTUGUESE_CATEGORIES,
  spanish: DEFAULT_SPANISH_CATEGORIES
});