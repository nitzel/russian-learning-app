
import React, { useState, useEffect } from 'react';
import { Volume2, Eye, EyeOff, ShoppingCart, Calculator, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

// Types
interface Product {
  id: string;
  nameEn: string;
  nameRu: string;
  price: number;
  emoji: string;
  available: boolean;
}

interface MathProblem {
  num1: number;
  num2: number;
  operator: '+' | '-' | '*' | '/';
  result: number;
}

interface MathSettings {
  operators: Array<'+' | '-' | '*' | '/'>;
  minValue: number;
  maxValue: number;
}

// Generate slider scale values
const generateSliderValues = (): number[] => {
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

const sliderValues = generateSliderValues();
const russianNumbers: { [key: number]: string } = {
  0: 'ноль', 1: 'оди́н', 2: 'два', 3: 'три', 4: 'четы́ре', 5: 'пять',
  6: 'шесть', 7: 'семь', 8: 'во́семь', 9: 'де́вять', 10: 'де́сять',
  11: 'оди́ннадцать', 12: 'двена́дцать', 13: 'трина́дцать', 14: 'четы́рнадцать', 15: 'пятна́дцать',
  16: 'шестна́дцать', 17: 'семна́дцать', 18: 'восемна́дцать', 19: 'девятна́дцать', 20: 'два́дцать',
  30: 'три́дцать', 40: 'со́рок', 50: 'пятьдеся́т', 60: 'шестьдеся́т', 70: 'се́мьдесят', 80: 'во́семьдесят', 90: 'девяно́сто'
};

const operators = {
  '+': 'плюс',
  '-': 'минус',
  '*': 'умножить на',
  '/': 'разделить на'
};

const equals = 'равно';

// Convert number to Russian with stress marks
const numberToRussian = (num: number): string => {
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

// Sample products
const products: Product[] = [
  { id: '1', nameEn: 'apples', nameRu: 'яблоки', price: 35, emoji: '🍎', available: true },
  { id: '2', nameEn: 'bananas', nameRu: 'бананы', price: 45, emoji: '🍌', available: true },
  { id: '3', nameEn: 'pears', nameRu: 'груши', price: 40, emoji: '🍐', available: true },
  { id: '4', nameEn: 'oranges', nameRu: 'апельсины', price: 55, emoji: '🍊', available: false },
  { id: '5', nameEn: 'tomatoes', nameRu: 'помидоры', price: 30, emoji: '🍅', available: true },
  { id: '6', nameEn: 'bread', nameRu: 'хлеб', price: 25, emoji: '🍞', available: true }
];


// Audio synthesis (mock - you'd replace with actual TTS)
const speak = (text: string, lang: string = 'ru') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }
};

// Math Practice Component
const MathPractice: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [settings, setSettings] = useState<MathSettings>({
    operators: ['+'],
    minValue: 1,
    maxValue: 20
  });
  const [showSettings, setShowSettings] = useState(true);

  const generateProblem = () => {
    if (settings.operators.length === 0) return;

    const operator = settings.operators[Math.floor(Math.random() * settings.operators.length)];
    let num1, num2, result;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      attempts++;

      // Randomly choose which value to constrain within the full range
      const constrainTarget = Math.floor(Math.random() * 3); // 0 = num1, 1 = num2, 2 = result

      switch (operator) {
        case '+':
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num2 = Math.floor(Math.random() * settings.maxValue) + 1;
            result = num1 + num2;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num1 = Math.floor(Math.random() * settings.maxValue) + 1;
            result = num1 + num2;
          } else {
            // Constrain result to range
            result = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num1 = Math.floor(Math.random() * Math.min(result, settings.maxValue)) + 1;
            num2 = result - num1;
          }
          break;

        case '-':
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num2 = Math.floor(Math.random() * Math.min(num1, settings.maxValue)) + 1;
            result = num1 - num2;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num1 = num2 + Math.floor(Math.random() * (settings.maxValue - num2)) + 1;
            result = num1 - num2;
          } else {
            // Constrain result to range
            result = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num2 = Math.floor(Math.random() * settings.maxValue) + 1;
            num1 = result + num2;
          }
          break;

        case '*':
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num2 = Math.floor(Math.random() * Math.min(Math.floor(settings.maxValue / num1), settings.maxValue)) + 1;
            result = num1 * num2;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num1 = Math.floor(Math.random() * Math.min(Math.floor(settings.maxValue / num2), settings.maxValue)) + 1;
            result = num1 * num2;
          } else {
            // Constrain result to range
            result = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num1 = Math.floor(Math.random() * Math.min(result, settings.maxValue)) + 1;
            if (result % num1 === 0) {
              num2 = result / num1;
            } else {
              // Find a factor of result
              const factors = [];
              for (let i = 1; i <= Math.min(result, settings.maxValue); i++) {
                if (result % i === 0) factors.push(i);
              }
              if (factors.length > 0) {
                num1 = factors[Math.floor(Math.random() * factors.length)];
                num2 = result / num1;
              } else {
                num1 = 1;
                num2 = result;
              }
            }
          }
          break;

        case '/':
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num2 = Math.floor(Math.random() * Math.min(num1, settings.maxValue)) + 1;
            result = Math.floor(num1 / num2);
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            result = Math.floor(Math.random() * settings.maxValue) + 1;
            num1 = result * num2;
          } else {
            // Constrain result to range
            result = Math.floor(Math.random() * (settings.maxValue - settings.minValue + 1)) + settings.minValue;
            num2 = Math.floor(Math.random() * settings.maxValue) + 1;
            num1 = result * num2;
          }
          break;
      }
    } while (
      (num1 <= 0 || num2 <= 0 || result <= 0 ||
       num1 > settings.maxValue || num2 > settings.maxValue || result > settings.maxValue) &&
      attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      // Fallback to simple addition if we can't generate a valid problem
      num1 = settings.minValue;
      num2 = settings.minValue;
      result = num1 + num2;
    }

    setProblem({ num1, num2, operator, result });
    setShowAnswer(false);
  };

  const toggleOperator = (op: '+' | '-' | '*' | '/') => {
    setSettings(prev => {
      const newOperators = prev.operators.includes(op)
        ? prev.operators.filter(o => o !== op)
        : [...prev.operators, op];
      return { ...prev, operators: newOperators };
    });
  };

  const updateMinValue = (sliderIndex: number) => {
    const value = sliderValues[sliderIndex];
    setSettings(prev => ({
      ...prev,
      minValue: value,
      maxValue: Math.max(value, prev.maxValue)
    }));
  };

  const updateMaxValue = (sliderIndex: number) => {
    const value = sliderValues[sliderIndex];
    setSettings(prev => ({
      ...prev,
      maxValue: value,
      minValue: Math.min(value, prev.minValue)
    }));
  };

  const getSliderIndex = (value: number): number => {
    const index = sliderValues.indexOf(value);
    return index >= 0 ? index : 0;
  };

  const startPractice = () => {
    if (settings.operators.length > 0) {
      setShowSettings(false);
      generateProblem();
    }
  };

  useEffect(() => {
    if (!showSettings && settings.operators.length > 0) {
      generateProblem();
    }
  }, [settings, showSettings]);

  const speakProblem = () => {
    if (problem) {
      const text = `${numberToRussian(problem.num1)} ${operators[problem.operator]} ${numberToRussian(problem.num2)} ${equals} ${numberToRussian(problem.result)}`;
      speak(text);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Numbers Practice</h2>
      </div>

      {showSettings ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Practice Settings</h3>

          {/* Operator Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Select Operations:</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(operators).map(([op, label]) => (
                <button
                  key={op}
                  onClick={() => toggleOperator(op as '+' | '-' | '*' | '/')}
                  className={`px-4 py-3 rounded-lg font-semibold text-lg transition-all ${
                    settings.operators.includes(op as '+' | '-' | '*' | '/')
                      ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-md'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{op}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
            {settings.operators.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Please select at least one operation.</p>
            )}
          </div>

          {/* Value Range Sliders */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Number Range:</label>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-600">Minimum Value:</label>
                  <span className="text-sm font-semibold">{settings.minValue}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={sliderValues.length - 1}
                  value={getSliderIndex(settings.minValue)}
                  onChange={(e) => updateMinValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-600">Maximum Value:</label>
                  <span className="text-sm font-semibold">{settings.maxValue}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={sliderValues.length - 1}
                  value={getSliderIndex(settings.maxValue)}
                  onChange={(e) => updateMaxValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              One number (operand or result) will be within {settings.minValue}-{settings.maxValue}, others will be ≤ {settings.maxValue}
            </p>
          </div>

          <button
            onClick={startPractice}
            disabled={settings.operators.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold ${
              settings.operators.length > 0
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Practice
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowSettings(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              ← Change Settings
            </button>
            <div className="text-sm text-gray-600">
              Range: {settings.minValue}-{settings.maxValue} | Ops: {settings.operators.join(', ')}
            </div>
          </div>

          {problem && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl font-bold mb-6 text-blue-600">
                {problem.num1} {problem.operator} {problem.num2} = ?
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showAnswer ? <EyeOff size={20} /> : <Eye size={20} />}
                  {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
              </div>

              {showAnswer && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="text-3xl font-bold text-green-600 mb-4">
                    {problem.result}
                  </div>
                  <div className="text-lg mb-4">
                    <div className="font-semibold">In Russian:</div>
                    <div className="text-blue-600">
                      {numberToRussian(problem.num1)} {operators[problem.operator]} {numberToRussian(problem.num2)} {equals} {numberToRussian(problem.result)}
                    </div>
                  </div>
                  <button
                    onClick={speakProblem}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mx-auto"
                  >
                    <Volume2 size={20} />
                    Listen
                  </button>
                </div>
              )}

              <button
                onClick={generateProblem}
                className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 mx-auto"
              >
                <RefreshCw size={20} />
                New Problem
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setShowFAQ(!showFAQ)}
          className="w-full px-6 py-4 text-left font-semibold text-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
        >
          FAQ
          {showFAQ ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showFAQ && (
          <div className="px-6 py-4 space-y-4">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Alternative way to say "equals"</h4>
              <p className="text-gray-700">
                Instead of "равно" (equals), you can also use "будет" (will be). For example:
                "два плюс три будет пять" (two plus three will be five).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Number pronunciation tips</h4>
              <p className="text-gray-700">
                Russian numbers 1-4 change their endings based on what they're counting. In math problems,
                we use the basic forms shown here.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Multiplication and Division</h4>
              <p className="text-gray-700">
                "умно́жить на" literally means "to multiply by". You might also hear "раз"
                (times) in casual speech: "два раз три" instead of "два умно́жить на три".
                For division, "раздели́ть на" means "to divide by".
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setShowVocabulary(!showVocabulary)}
          className="w-full px-6 py-4 text-left font-semibold text-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
        >
          Vocabulary
          {showVocabulary ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showVocabulary && (
          <div className="px-6 py-4">
            <div className="mb-6">
              <h4 className="font-semibold text-blue-600 mb-3">Basic Numbers (1-20)</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                  <div key={num} className="flex justify-between">
                    <span className="font-mono">{num}</span>
                    <span className="font-medium">{russianNumbers[num]}</span>
                  </div>
                ))}
                {Array.from({length: 10}, (_, i) => i + 11).map(num => (
                  <div key={num} className="flex justify-between">
                    <span className="font-mono">{num}</span>
                    <span className="font-medium">{russianNumbers[num]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-blue-600 mb-3">Tens (20-90)</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                {[20, 30, 40, 50].map(num => (
                  <div key={num} className="flex justify-between">
                    <span className="font-mono">{num}</span>
                    <span className="font-medium">{russianNumbers[num]}</span>
                  </div>
                ))}
                {[60, 70, 80, 90].map(num => (
                  <div key={num} className="flex justify-between">
                    <span className="font-mono">{num}</span>
                    <span className="font-medium">{russianNumbers[num]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-blue-600 mb-3">Hundreds</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">100</span>
                  <span className="font-medium">сто</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">600</span>
                  <span className="font-medium">шестьсо́т</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">200</span>
                  <span className="font-medium">две́сти</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">700</span>
                  <span className="font-medium">семьсо́т</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">300</span>
                  <span className="font-medium">три́ста</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">800</span>
                  <span className="font-medium">восемьсо́т</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">400</span>
                  <span className="font-medium">четы́реста</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">900</span>
                  <span className="font-medium">девятьсо́т</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">500</span>
                  <span className="font-medium">пятьсо́т</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-blue-600 mb-3">Thousands</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">1,000</span>
                  <span className="font-medium">ты́сяча</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">2,000</span>
                  <span className="font-medium">две ты́сячи</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">3,000-4,000</span>
                  <span className="font-medium">три/четы́ре ты́сячи</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">5,000+</span>
                  <span className="font-medium">пять/шесть/семь... ты́сяч</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-blue-600 mb-3">Math Operations</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">+</span>
                  <span className="font-medium">плюс</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">-</span>
                  <span className="font-medium">ми́нус</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">×</span>
                  <span className="font-medium">умно́жить на</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">÷</span>
                  <span className="font-medium">раздели́ть на</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">=</span>
                  <span className="font-medium">равно́ / бу́дет</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 border-t pt-4">
              <p className="mb-2">
                <strong>Stress marks (́):</strong> Show which syllable to emphasize when speaking.
              </p>
              <p className="mb-2">
                <strong>Compound numbers:</strong> Formed by combining basic numbers (e.g., 25 = два́дцать пять).
              </p>
              <p>
                <strong>Resources:</strong>
                <a href="https://en.wikibooks.org/wiki/Russian/Numbers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Wikibooks Russian Numbers
                </a> •
                <a href="https://www.russianlessons.net/lessons/lesson2_main.php" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Russian Lessons
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Shopping Practice Component
const ShoppingPractice: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);

  const dialogue = [
    { speaker: 'customer', text: 'У вас есть', textEn: 'Do you have' },
    { speaker: 'seller', text: selectedProduct?.available ? 'Да, есть.' : `Извините, нет, но у нас есть ${products.find(p => p.available && p.id !== selectedProduct?.id)?.nameRu}.`, textEn: selectedProduct?.available ? 'Yes, we have them.' : 'Sorry, we\'re out, but we have' },
    { speaker: 'customer', text: `Дайте мне ${numberToRussian(quantity)} штук, пожалуйста.`, textEn: `Please give me ${quantity}.` },
    { speaker: 'seller', text: `Это всё? Это будет ${total} рублей.`, textEn: `Anything else? That\'ll be ${total} rubles.` },
    { speaker: 'customer', text: 'Вот 50 рублей.', textEn: 'Here are 50 rubles.' },
    { speaker: 'seller', text: `Ваша сдача ${50 - total} рублей. Спасибо!`, textEn: `Your change is ${50 - total} rubles. Thanks!` }
  ];

  useEffect(() => {
    if (selectedProduct) {
      setTotal(selectedProduct.price * quantity);
    }
  }, [selectedProduct, quantity]);

  const speakText = (text: string) => {
    speak(text);
  };

  const nextStep = () => {
    if (dialogueStep < dialogue.length - 1) {
      setDialogueStep(dialogueStep + 1);
    } else {
      // Reset
      setDialogueStep(0);
      setSelectedProduct(null);
    }
  };

  const currentDialogue = dialogue[dialogueStep];
  const isCustomerTurn = currentDialogue?.speaker === 'customer';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-4 p-2 hover:bg-gray-100 rounded">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Shopping Practice</h2>
      </div>

      {!selectedProduct ? (
        <div>
          <h3 className="text-xl mb-4">Choose a product to ask about:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                  !product.available ? 'opacity-60' : ''
                }`}
              >
                <div className="text-4xl mb-2 text-center">{product.emoji}</div>
                <div className="text-center font-semibold">{product.nameRu}</div>
                <div className="text-center text-sm text-gray-600">{product.nameEn}</div>
                <div className="text-center text-lg font-bold text-green-600">{product.price}₽</div>
                {!product.available && (
                  <div className="text-center text-red-500 text-sm">Out of stock</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{selectedProduct.emoji}</span>
              <div>
                <div className="font-bold text-lg">{selectedProduct.nameRu}</div>
                <div className="text-gray-600">{selectedProduct.nameEn}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Quantity:</div>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isCustomerTurn ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <span className="font-semibold">
                {isCustomerTurn ? 'Customer' : 'Seller'}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-lg font-medium mb-2">
                {dialogueStep === 0 ? `${currentDialogue.text} ${selectedProduct.nameRu}?` :
                 dialogueStep === 1 && !selectedProduct.available ? `${currentDialogue.text} ${products.find(p => p.available && p.id !== selectedProduct.id)?.nameRu}.` :
                 currentDialogue.text}
              </div>
              <div className="text-gray-600">
                {dialogueStep === 0 ? `${currentDialogue.textEn} ${selectedProduct.nameEn}?` :
                 dialogueStep === 1 && !selectedProduct.available ? `${currentDialogue.textEn} ${products.find(p => p.available && p.id !== selectedProduct.id)?.nameEn}.` :
                 currentDialogue.textEn}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => speakText(dialogueStep === 0 ? `${currentDialogue.text} ${selectedProduct.nameRu}` : currentDialogue.text)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Volume2 size={16} />
                Listen
              </button>

              <button
                onClick={nextStep}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {dialogueStep === dialogue.length - 1 ? 'Start Over' : 'Next'}
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setDialogueStep(0);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Choose Different Product
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const topics = [
    {
      id: 'math',
      title: 'Numbers & Math',
      description: 'Practice numbers with mathematical equations',
      icon: <Calculator size={48} />,
      color: 'bg-blue-500'
    },
    {
      id: 'shopping',
      title: 'Shopping',
      description: 'Learn shopping conversations and vocabulary',
      icon: <ShoppingCart size={48} />,
      color: 'bg-green-500'
    }
  ];

  if (currentTopic === 'math') {
    return <MathPractice onBack={() => setCurrentTopic(null)} />;
  }

  if (currentTopic === 'shopping') {
    return <ShoppingPractice onBack={() => setCurrentTopic(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Russian Language Practice
          </h1>
          <p className="text-lg text-gray-600">
            Choose a topic to practice your Russian skills
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {topics.map(topic => (
            <div
              key={topic.id}
              onClick={() => setCurrentTopic(topic.id)}
              className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className={`${topic.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 mx-auto`}>
                {topic.icon}
              </div>
              <h3 className="text-xl font-bold text-center mb-2">{topic.title}</h3>
              <p className="text-gray-600 text-center">{topic.description}</p>
            </div>
          ))}
        </div>

        <footer className="text-center mt-12 text-gray-500">
          <p>Practice regularly to improve your Russian language skills!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;