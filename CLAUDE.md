# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Runs the app in development mode on localhost:3000
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production to the build folder

## Application Architecture

This is a React-based Russian language learning application with the following structure:

### Core Components
- **App.tsx** - Main component with topic selection (Math Practice, Shopping Practice)
- **MathPractice** - Interactive math problems with Russian number pronunciation
- **ShoppingPractice** - Simulated shopping conversations with Russian vocabulary

### Key Features
- **Number Conversion**: `numberToRussian()` function converts numbers 1-10,000 to Russian with stress marks
- **Speech Synthesis**: Uses Web Speech API for Russian pronunciation
- **Interactive Dialogues**: Step-by-step conversation practice
- **Customizable Math Practice**: Configurable operators (+, -, *, /) and number ranges

### Technology Stack
- React 19 with TypeScript
- Tailwind CSS v3 for styling
- Lucide React for icons
- Web Speech API for audio

### Data Structures
- `russianNumbers` object maps numbers to Russian words with stress marks (́)
- `operators` object maps math symbols to Russian terms  
- `products` array contains shopping items with Russian/English names

### Russian Language Implementation
- All Russian numbers include proper stress marks directly in strings
- Stress marks use Unicode combining acute accent (́) on individual characters
- Number conversion handles compound numbers, hundreds, and thousands correctly

## Code Conventions
- TypeScript interfaces for type safety
- Functional components with hooks
- Tailwind utility classes for styling
- Consistent naming: Russian text uses `nameRu`, English uses `nameEn`