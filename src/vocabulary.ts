// Types for Russian vocabulary
export interface Product {
  id: string;
  nameEn: string;
  nameRu: string;
  price: number;
  emoji: string;
  available: boolean;
}

// Russian numbers with stress marks
export const russianNumbers: { [key: number]: string } = {
  0: 'ноль', 1: 'оди́н', 2: 'два', 3: 'три', 4: 'четы́ре', 5: 'пять',
  6: 'шесть', 7: 'семь', 8: 'во́семь', 9: 'де́вять', 10: 'де́сять',
  11: 'оди́ннадцать', 12: 'двена́дцать', 13: 'трина́дцать', 14: 'четы́рнадцать', 15: 'пятна́дцать',
  16: 'шестна́дцать', 17: 'семна́дцать', 18: 'восемна́дцать', 19: 'девятна́дцать', 20: 'два́дцать',
  30: 'три́дцать', 40: 'со́рок', 50: 'пятьдеся́т', 60: 'шестьдеся́т', 70: 'се́мьдесят', 80: 'во́семьдесят', 90: 'девяно́сто'
};

// Math operators in Russian
export const operators = {
  '+': 'плю́с',
  '-': 'ми́нус',
  '*': 'умно́жить на',
  '/': 'раздели́ть на'
};

// Math equals in Russian
export const equals = 'равно́';

// Sample products for shopping practice
export const products: Product[] = [
  { id: '1', nameEn: 'apples', nameRu: 'я́блоки', price: 35, emoji: '🍎', available: true },
  { id: '2', nameEn: 'bananas', nameRu: 'бана́ны', price: 45, emoji: '🍌', available: true },
  { id: '3', nameEn: 'pears', nameRu: 'гру́ши', price: 40, emoji: '🍐', available: true },
  { id: '4', nameEn: 'oranges', nameRu: 'апельси́ны', price: 55, emoji: '🍊', available: false },
  { id: '5', nameEn: 'tomatoes', nameRu: 'помидо́ры', price: 30, emoji: '🍅', available: true },
  { id: '6', nameEn: 'bread', nameRu: 'хлеб', price: 25, emoji: '🍞', available: true }
];

// Generate slider scale values for number practice
export const generateSliderValues = (): number[] => {
  const values: number[] = [];

  // 1-10
  for (let i = 1; i <= 10; i++) {
    values.push(i);
  }

  // 20, 30, 40, ... 100
  for (let i = 20; i <= 100; i += 10) {
    values.push(i);
  }

  // 200, 300, 400, ... 1000
  for (let i = 200; i <= 1000; i += 100) {
    values.push(i);
  }

  // 2000, 3000, 4000, ... 10000
  for (let i = 2000; i <= 10000; i += 1000) {
    values.push(i);
  }

  return values;
};

// Convert number to Russian with stress marks
export const numberToRussian = (num: number): string => {
  if (num <= 20) return russianNumbers[num] || num.toString();
  if (num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const ones = num % 10;
    return ones === 0 ? russianNumbers[tens] : `${russianNumbers[tens]} ${russianNumbers[ones]}`;
  }
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    const hundredWord = hundreds === 1 ? 'сто' :
                      hundreds === 2 ? 'две́сти' :
                      hundreds === 3 ? 'три́ста' :
                      hundreds === 4 ? 'четы́реста' :
                      hundreds === 5 ? 'пятьсо́т' :
                      hundreds === 6 ? 'шестьсо́т' :
                      hundreds === 7 ? 'семьсо́т' :
                      hundreds === 8 ? 'восемьсо́т' :
                      hundreds === 9 ? 'девятьсо́т' : '';
    return remainder === 0 ? hundredWord : `${hundredWord} ${numberToRussian(remainder)}`;
  }
  if (num < 10000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    const thousandWord = thousands === 1 ? 'ты́сяча' :
                        thousands === 2 ? 'две ты́сячи' :
                        thousands === 3 ? 'три ты́сячи' :
                        thousands === 4 ? 'четы́ре ты́сячи' :
                        thousands === 5 ? 'пять ты́сяч' :
                        thousands === 6 ? 'шесть ты́сяч' :
                        thousands === 7 ? 'семь ты́сяч' :
                        thousands === 8 ? 'во́семь ты́сяч' :
                        thousands === 9 ? 'де́вять ты́сяч' : '';
    return remainder === 0 ? thousandWord : `${thousandWord} ${numberToRussian(remainder)}`;
  }
  if (num === 10000) return 'де́сять ты́сяч';
  return num.toString();
};

// Speech synthesis function
export const speak = (text: string, lang: string = 'ru') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }
};