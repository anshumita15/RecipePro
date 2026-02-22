# 🍳 RecipePro – AI-Powered Kitchen Assistant

> Your hands-free cooking companion powered by Gemini AI and ElevenLabs voice technology.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Made with Vanilla JS](https://img.shields.io/badge/Made%20with-Vanilla%20JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✨ Features

- **🔐 User Authentication** – Sign up / Sign in with localStorage-based accounts
- **🔍 Smart Ingredient Search** – Google-style autocomplete with 70+ ingredients
- **🤖 Gemini AI Recipes** – Generates 7 unique recipes from your ingredients, with macros, calories & serving info
- **🖼️ AI-Generated Images** – Each recipe gets a beautiful AI-generated food photo via Imagen 3
- **🔊 Voice Narration** – ElevenLabs TTS reads each cooking step aloud in a natural voice
- **🎙️ Hands-Free Voice Commands** – Control cooking with just your voice:
  - **"next"** → advance to next step
  - **"previous"** → go back a step
  - **"play"** → read current step aloud
  - **"repeat"** → repeat current step
  - **"done"** → finish the recipe
- **📊 Macro Tracking** – Protein, carbs, fat, fiber shown per recipe
- **🥗 Dietary Filters** – None, High Protein, Vegan, Keto, Low Carb, Paleo

---

## 🚀 Getting Started

### Prerequisites

- A modern browser (Chrome, Edge, or Firefox recommended for voice features)
- [Gemini API Key](https://aistudio.google.com) (free tier available)
- [ElevenLabs API Key](https://elevenlabs.io) (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/recipepro.git
   cd recipepro
   ```

2. **Open in browser**
   ```bash
   # Option A: Just open index.html in your browser
   open index.html

   # Option B: Use a local server (recommended)
   npx serve .
   # or
   python3 -m http.server 8080
   ```

3. **Configure API Keys**
   - The app ships with default keys for demo purposes
   - To use your own keys: click "Configure here" on the main screen
   - Enter your Gemini and ElevenLabs API keys
   - Keys are saved locally in your browser

4. **Create an account and start cooking!**

---

## 📁 Project Structure

```
recipepro/
├── index.html          # Login / Sign-up page
├── app.html            # Main ingredient search + recipe generation
├── cook.html           # Cooking mode with voice controls
├── css/
│   └── style.css       # All styles (single file, no build needed)
└── js/
    ├── auth.js         # Authentication logic
    ├── ingredients.js  # Autocomplete database + tag management
    ├── gemini.js       # Gemini API (text + image generation)
    ├── elevenlabs.js   # ElevenLabs TTS + Web Speech API STT
    ├── app.js          # Main app logic (recipe generation & display)
    └── cook.js         # Cooking mode (step navigation + voice)
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5 / CSS3 / Vanilla JS** | Core frontend, zero dependencies |
| **Google Gemini 1.5 Flash** | Recipe generation from ingredients |
| **Google Imagen 3** | AI food photography generation |
| **ElevenLabs API** | Neural text-to-speech narration |
| **Web Speech API** | Browser-native speech recognition |
| **Google Fonts** | Playfair Display + DM Sans typography |
| **localStorage / sessionStorage** | Auth persistence, recipe caching |

---

## 🎙️ Voice Commands Reference

| Say | Action |
|---|---|
| "next" | Move to the next cooking step |
| "previous" | Go back to the previous step |
| "play" | Read the current step aloud |
| "repeat" | Repeat the current step |
| "done" | Finish and complete the recipe |

> **Note:** Voice commands work best in Chrome or Edge. Enable microphone permission when prompted.

---

## 📸 Screenshots

### Login Page
Clean, glassmorphism auth with animated background blobs.

### Ingredient Search
Google-style autocomplete dropdown for 70+ common ingredients.

### Recipe Results
AI-generated recipe cards with images, macros, calories, and serving info.

### Cooking Mode
Step-by-step instructions with voice narration and hands-free controls.

---

## 🔑 API Keys

This project uses:
- **Gemini API** – for recipe generation and image generation
- **ElevenLabs API** – for natural-sounding text-to-speech

Both offer free tiers. You can configure your own keys in-app by clicking "Configure here" on the main screen.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🏆 Built For

This project was built for **[Your Hackathon Name]** on DevPost.

[View DevPost Submission →](https://devpost.com/YOUR_SUBMISSION_LINK)

---

## 👨‍🍳 Made with ❤️ for hands-free cooking
