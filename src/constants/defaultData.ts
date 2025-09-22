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
      { word: 'tio', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  food: {
    title: 'Comida e Bebida',
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
      { word: 'massa', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'arroz', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ovo', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cereal', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'laranja', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'uvas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'morango', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'cenoura', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'ervilhas', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'batata', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'acabou', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'mais', understanding: false, speaking: false, firstSpokenAge: null },
      { word: 'gostoso', understanding: false, speaking: false, firstSpokenAge: null }
    ]
  },
  // Add more Portuguese categories as needed...
  other: {
    title: 'Outros',
    language: 'portuguese' as const,
    words: []
  }
};

export const getDefaultLanguageData = (): LanguageData => ({
  english: DEFAULT_ENGLISH_CATEGORIES,
  portuguese: DEFAULT_PORTUGUESE_CATEGORIES
});