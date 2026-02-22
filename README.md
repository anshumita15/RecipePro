# RecipePro AI

RecipePro AI is a modern, voice-controlled culinary assistant that helps you create delicious meals based on the ingredients you have on hand. Powered by Gemini AI for recipe generation and ElevenLabs for high-quality text-to-speech, it provides an interactive, hands-free cooking experience.

## Features

- **AI Recipe Generation**: Enter your available ingredients and dietary goals to get personalized recipe suggestions.
- **Voice-Controlled Instructor**: Navigate through recipe steps using voice commands like "Next", "Previous", "Play", "Repeat", and "Done".
- **Hands-Free Cooking**: High-quality text-to-speech reads instructions aloud, allowing you to focus on the cooking.
- **Custom Recipe Entry**: Enter your own recipe name and ingredients, and let the AI generate the full instructions and nutritional information.
- **Recipe Collection**: Save your favorite generated recipes to your personal collection for quick access later.
- **Nutritional Insights**: Get estimated macros (calories, protein, carbs, fat) for every recipe.
- **Visual Inspiration**: AI-generated images for every recipe to show you what you're aiming for.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express, SQLite (better-sqlite3).
- **AI Services**: 
  - **Gemini AI**: Recipe generation, parsing, and image generation.
  - **ElevenLabs**: Professional-grade text-to-speech.
- **Authentication**: JWT-based auth with secure cookies.

## Getting Started

### Prerequisites

- Node.js installed.
- API Keys for:
  - Gemini AI (Google AI Studio)
  - ElevenLabs

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Sign Up / Sign In**: Create an account to start saving recipes.
2. **Search**: Enter ingredients you have and select a dietary goal.
3. **Select**: Choose from the AI-suggested recipe options.
4. **Cook**: Follow the interactive guide. Use the microphone button to enable voice commands.
5. **Save**: Click the heart icon to save a recipe to your collection.
6. **Manual Entry**: Use the "Enter Your Own Recipe" feature to generate instructions for a specific dish you have in mind.

## Voice Commands

- **"Next"**: Move to the next step.
- **"Previous"**: Go back to the previous step.
- **"Play" / "Read"**: Read the current step aloud.
- **"Repeat"**: Hear the current step again.
- **"Done" / "Finish"**: Complete the recipe and return to search.

---
© 2026 RecipePro AI. Crafted for the modern kitchen.
