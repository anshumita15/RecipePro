// gemini.js – Gemini API integration for recipe generation + image generation

const GEMINI_API_KEY = 'AIzaSyCcg0Elqg2Fv2Lk87wPy5sk-hQjI_-w3sw';
const GEMINI_TEXT_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_IMAGE_URL = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`;

async function generateRecipesFromGemini(ingredientsList, diet) {
  const dietText = diet && diet !== 'none' ? `The recipes should be ${diet.replace('-', ' ')}.` : '';

  const prompt = `You are a professional chef. A user has these ingredients: ${ingredientsList.join(', ')}.
Assume they also have common pantry staples (salt, pepper, olive oil, garlic, onion, sugar, vinegar, soy sauce, herbs and basic spices).
${dietText}

Generate exactly 7 unique recipes they can make. For each recipe, provide a detailed JSON response.

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "recipes": [
    {
      "id": 1,
      "name": "Recipe Name",
      "description": "A mouth-watering 2-sentence description",
      "emoji": "🍳",
      "servings": 4,
      "prep_time": 15,
      "cook_time": 25,
      "calories": 450,
      "macros": {
        "protein": 35,
        "carbs": 42,
        "fat": 18,
        "fiber": 6
      },
      "ingredients": [
        "200g chicken breast, cubed",
        "2 cloves garlic, minced",
        "1 cup rice"
      ],
      "steps": [
        "Heat olive oil in a large pan over medium-high heat.",
        "Add garlic and sauté for 1 minute until fragrant.",
        "Add chicken pieces and cook for 5-7 minutes until golden.",
        "Season with salt and pepper to taste.",
        "Serve hot over cooked rice."
      ],
      "image_prompt": "A beautifully plated [recipe name], professional food photography, warm lighting, garnished, on a white plate"
    }
  ]
}`;

  const response = await fetch(GEMINI_TEXT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8000,
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');

  // Parse JSON – strip any markdown fences
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed.recipes;
}

async function generateRecipeImage(imagePrompt, emoji) {
  try {
    const response = await fetch(GEMINI_IMAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: imagePrompt }],
        parameters: { sampleCount: 1, aspectRatio: "16:9" }
      })
    });

    if (!response.ok) throw new Error('Image generation failed');

    const data = await response.json();
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (b64) {
      return `data:image/png;base64,${b64}`;
    }
    return null;
  } catch (e) {
    // Image generation failed – return null, we'll use emoji placeholder
    console.warn('Image generation error:', e);
    return null;
  }
}
