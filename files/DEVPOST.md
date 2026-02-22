# RecipePro – DevPost Submission

## 🍳 Inspiration

Have you ever tried reading a recipe on your phone while your hands are covered in raw chicken or dough? We built RecipePro to solve the frustrating back-and-forth between looking at your device and actually cooking. The idea is simple: **your kitchen should be hands-free**.

---

## 💡 What it does

**RecipePro** is an AI-powered cooking assistant that:

1. **Accepts your ingredients** – Type what you have in your fridge/pantry with smart autocomplete
2. **Generates personalized recipes** – Google Gemini AI creates 6–8 complete recipes tailored to your ingredients, dietary preferences, and assumes you have basic pantry staples
3. **Shows rich recipe cards** – Each recipe includes AI-generated food photography (Imagen 3), full macronutrient breakdown (protein/carbs/fat/fiber), calorie count, and serving size
4. **Guides you step-by-step with voice** – ElevenLabs neural TTS reads every cooking step in a warm, natural voice
5. **Listens to your commands** – A microphone button activates voice control; say "next", "previous", "play", "repeat", or "done" to navigate entirely hands-free

---

## 🛠️ How we built it

- **Frontend**: Pure HTML5, CSS3, and Vanilla JavaScript — no frameworks, no build steps, runs directly in any browser
- **AI Recipes**: Google Gemini 1.5 Flash API generates structured JSON with complete recipe data, macros, and image prompts
- **AI Images**: Google Imagen 3 generates beautiful food photography for each recipe
- **Voice Narration**: ElevenLabs API (Bella voice) reads cooking steps with natural prosody and pacing
- **Voice Commands**: Web Speech API (SpeechRecognition) captures and processes user commands, with ElevenLabs as the TTS layer
- **Auth**: localStorage-based account system (sign up / sign in) with session persistence
- **Design**: Custom design inspired by modern cooking apps — warm cream palette, Playfair Display typography, glassmorphism effects

---

## 🚧 Challenges we ran into

- **Structured AI output**: Getting Gemini to reliably return valid JSON for all 7 recipes required careful prompt engineering with explicit format specifications
- **Voice command accuracy**: Speech recognition varies by accent and environment; we implemented fuzzy matching across multiple transcript alternatives to catch variations of each command
- **Image generation reliability**: Imagen 3 occasionally fails or is rate-limited; we implemented graceful fallback to emoji placeholders so the app always works
- **Audio management**: Managing audio playback state across TTS calls (stopping previous audio before starting new) to prevent overlapping narration
- **Mobile responsive cooking mode**: The sticky controls bar with proper safe-area insets on mobile required careful CSS work

---

## 🏆 Accomplishments we're proud of

- Zero dependencies – the entire app is pure HTML/CSS/JS, deployable by simply opening index.html
- Voice-first UX – a cook can go through an entire recipe without ever touching their phone
- Real AI integration – using Gemini for both text AND images creates a fully cohesive experience
- The smooth, polished UI that looks like a production app

---

## 📚 What we learned

- Gemini 1.5 Flash is remarkably good at generating structured culinary data with proper prompt engineering
- ElevenLabs voice quality is significantly better than browser speech synthesis for a natural cooking experience
- Web Speech API has inconsistent browser support – Chrome/Edge work best, Safari has limitations
- Good fallback design (emoji placeholders, browser TTS fallback) is essential for a robust demo

---

## 🔮 What's next for RecipePro

- **Timer integration** – Auto-detect timing in steps and offer hands-free countdown timers ("cook for 5 minutes")
- **Nutritional scaling** – Adjust recipes and macros for desired serving count
- **Recipe saving** – Save favorite recipes to a personal cookbook
- **Pantry management** – Track what's in your fridge over time
- **Multi-language support** – ElevenLabs supports dozens of languages
- **Camera integration** – Point your camera at your fridge and let Gemini Vision detect ingredients automatically

---

## 🔗 Links

- **GitHub**: [github.com/YOUR_USERNAME/recipepro](https://github.com/YOUR_USERNAME/recipepro)
- **Live Demo**: [YOUR_GITHUB_PAGES_URL]

---

## Built With

`html` `css` `javascript` `google-gemini` `google-imagen` `elevenlabs` `web-speech-api` `ai` `voice` `cooking`
