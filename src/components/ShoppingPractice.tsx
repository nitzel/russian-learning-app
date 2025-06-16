import React, { useState, useEffect } from 'react';
import { Volume2, ArrowLeft } from 'lucide-react';
import { Product, products, numberToRussian, speak } from '../vocabulary';

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

export default ShoppingPractice;