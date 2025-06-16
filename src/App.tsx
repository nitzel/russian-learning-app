import React, { useState } from 'react';
import { ShoppingCart, Calculator } from 'lucide-react';
import NumbersPractice from './components/NumbersPractice';
import ShoppingPractice from './components/ShoppingPractice';

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
    return <NumbersPractice onBack={() => setCurrentTopic(null)} />;
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