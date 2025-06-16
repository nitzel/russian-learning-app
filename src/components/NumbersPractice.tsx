import React, { useState, useEffect } from 'react';
import { Volume2, Eye, EyeOff, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { russianNumbers, operators, Operator, operatorSymbols, equals, willBe, numberToRussian, generateSliderValues, speak, Operators } from '../vocabulary';

// Types
interface MathProblem {
  num1: number;
  num2: number;
  operator: Operator;
  result: number;
}

interface MathSettings {
  operators: Array<Operator>;
  minValue: number;
  maxValue: number;
}

const sliderValues = generateSliderValues();

// Math Practice Component
const NumbersPractice: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [settings, setSettings] = useState<MathSettings>({
    operators: [Operator.PLUS],
    minValue: 1,
    maxValue: 20
  });
  const [showSettings, setShowSettings] = useState(true);

  const randomInRange = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateProblem = () => {
    if (settings.operators.length === 0) return;

    const operator = settings.operators[Math.floor(Math.random() * settings.operators.length)];
    let num1: number = 1, num2: number = 1, result: number = 1;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      attempts++;

      // Randomly choose which value to constrain within the full range
      const constrainTarget = Math.floor(Math.random() * 3); // 0 = num1, 1 = num2, 2 = result

      switch (operator) {
        case Operator.PLUS:
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = randomInRange(settings.minValue, settings.maxValue);
            num2 = randomInRange(1, settings.maxValue);
            result = num1 + num2;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = randomInRange(settings.minValue, settings.maxValue);
            num1 = randomInRange(1, settings.maxValue);
            result = num1 + num2;
          } else {
            // Constrain result to range
            result = randomInRange(settings.minValue, settings.maxValue);
            num1 = randomInRange(1, Math.min(result, settings.maxValue));
            num2 = result - num1;
          }
          break;

        case Operator.MINUS:
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = randomInRange(settings.minValue, settings.maxValue);
            num2 = randomInRange(0, Math.min(num1, settings.maxValue));
            result = num1 - num2;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = randomInRange(settings.minValue, settings.maxValue);
            num1 = num2 + randomInRange(0, settings.maxValue - num2);
            result = num1 - num2;
          } else {
            // Constrain result to range
            result = randomInRange(settings.minValue, settings.maxValue);
            num2 = randomInRange(0, settings.maxValue);
            num1 = result + num2;
          }
          break;

        case Operator.TIMES:
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = randomInRange(settings.minValue, settings.maxValue);
            num2 = randomInRange(1, Math.min(Math.floor(settings.maxValue / num1), settings.maxValue));
            result = num1 * num2;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = randomInRange(settings.minValue, settings.maxValue);
            num1 = randomInRange(1, Math.min(Math.floor(settings.maxValue / num2), settings.maxValue));
            result = num1 * num2;
          } else {
            // Constrain result to range
            result = randomInRange(settings.minValue, settings.maxValue);
            num1 = randomInRange(1, Math.min(result, settings.maxValue));
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

        case Operator.DIVISON:
          if (constrainTarget === 0) {
            // Constrain num1 to range
            num1 = randomInRange(settings.minValue, settings.maxValue);
            num2 = randomInRange(1, Math.min(num1, settings.maxValue));
            result = Math.floor(num1 / num2);
            num2 = num1 * result;
          } else if (constrainTarget === 1) {
            // Constrain num2 to range
            num2 = randomInRange(settings.minValue, settings.maxValue);
            result = randomInRange(1, settings.maxValue);
            num1 = result * num2;
          } else {
            // Constrain result to range
            result = randomInRange(settings.minValue, settings.maxValue);
            num2 = randomInRange(1, settings.maxValue);
            num1 = result * num2;
          }
          result = num1/num2; // might be 0/0, then result=NaN, need to retry
          break;
      }
    } while (
      (
        [num1, num2, result].some(Number.isNaN) ||
        [num1, num2, result].some(x => x < 0) ||
        // if maxValue==0, then allow maxValue 1 for some variation
        [num1, num2, result].some(x => x > (settings.maxValue || 1))
      ) && attempts < maxAttempts
    );

    if (attempts >= maxAttempts) {
      // Fallback to simple addition if we can't generate a valid problem
      setProblem({
        num1: settings.minValue,
        num2: settings.minValue,
        operator: Operator.PLUS,
        result: settings.minValue + settings.minValue
      });
      setShowAnswer(false);
      return;
    }

    setProblem({ num1: num1!, num2: num2!, operator, result: result! });
    setShowAnswer(false);
  };

  const toggleOperator = (op: Operator) => {
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
      const text = `${numberToRussian(problem.num1)} ${operators[problem.operator]} ${numberToRussian(problem.num2)} ${equals} ${numberToRussian(problem.result, true)}`;
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
              {Operators.map(op => (
                <button
                  key={op}
                  onClick={() => toggleOperator(op)}
                  className={`px-4 py-3 rounded-lg font-semibold text-lg transition-all ${
                    settings.operators.includes(op)
                      ? 'bg-blue-500 text-white border-2 border-blue-600 shadow-md'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{operatorSymbols[op]}</div>
                  <div className="text-xs">{operators[op]}</div>
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
                {problem.num1} {operatorSymbols[problem.operator]} {problem.num2} = ?
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
                      {numberToRussian(problem.num1)} {operators[problem.operator]} {numberToRussian(problem.num2)} {equals} {numberToRussian(problem.result, true)}
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
                {Array.from({length: 21}, (_, i) => i % 2 == 0 ? Math.floor(i/2) : Math.floor(i/2) + 11).map(num => (
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
                {[20, 60, 30, 70, 40, 80, 50, 90].map(num => (
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
                {[100, 600, 200, 700, 300, 800, 400, 900, 500].map(num => (
                  <div key={num} className="flex justify-between">
                    <span className="font-mono">{num}</span>
                    <span className="font-medium">{numberToRussian(num)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-blue-600 mb-3">Thousands</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                {[1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000].map(num => (
                  <div key={num} className="flex justify-between">
                    <span className="font-mono">{num.toLocaleString()}</span>
                    <span className="font-medium">{numberToRussian(num)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-blue-600 mb-3">Math Operations</h4>
              <div className="grid grid-cols-1 gap-y-2 text-sm">
                {Object.entries(operators).map(([symbol, text]) => (
                  <div key={symbol} className="flex justify-between">
                    <span className="font-mono">{operatorSymbols[symbol as Operator]}</span>
                    <span className="font-medium">{text}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="font-mono">=</span>
                  <span className="font-medium">{equals} / {willBe}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-600 border-t pt-4">
              <p className="mb-2">
                <strong>Stress marks ´ :</strong> Show which syllable to emphasize when speaking.
              </p>
              <p className="mb-2">
                <strong>{numberToRussian(0, false)} / {numberToRussian(0, true)}:</strong>
                &nbsp;
                нулю (dative sg. from archaic нуль) is still used in mathematics and certain phrases, one of them being равно нулю.
                <a href="https://vk.com/@femmie-rss-1038222214-1955760577" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Равно нолю или нулю?
                </a>
              </p>
              <p className="mb-2">
                <strong>Compound numbers:</strong> Formed by combining basic numbers (e.g., 25 = {numberToRussian(25)}).
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

export default NumbersPractice;