import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, DietaryGoal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RecipeOption {
  title: string;
  description: string;
}

export async function getRecipeOptions(ingredients: string[], goal: DietaryGoal): Promise<RecipeOption[]> {
  const prompt = `Given these ingredients: ${ingredients.join(", ")} and the dietary goal: ${goal}, 
  suggest 6 different recipe ideas specifically for 1 serving (1 person). For each, provide a title and a one-sentence description. 
  The recipes don't have to use all ingredients, but should prioritize them.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateFullRecipe(title: string, ingredients: string[], goal: DietaryGoal): Promise<Recipe> {
  const prompt = `Create a detailed recipe for "${title}" specifically for 1 serving (1 person) using some or all of these ingredients: ${ingredients.join(", ")}. 
  Dietary goal: ${goal}. 
  Include precise measurements for 1 person, step-by-step instructions, and nutritional macros (calories, protein, carbs, fat in grams).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          macros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fat"],
          },
        },
        required: ["title", "ingredients", "instructions", "macros"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function parseManualRecipe(text: string): Promise<Recipe> {
  const prompt = `Parse the following recipe text into a structured format. 
  If the text only contains a dish name and ingredients, generate the full step-by-step instructions and nutritional information.
  If it's a full recipe, just structure it.
  Extract or generate: title, ingredients list, and step-by-step instructions. 
  Also, estimate the nutritional macros (calories, protein, carbs, fat in grams).
  
  Recipe Text:
  ${text}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          macros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fat"],
          },
        },
        required: ["title", "ingredients", "instructions", "macros"],
      },
    },
  });

  return JSON.parse(response.text);
}
export async function generateRecipeFromNameAndIngredients(title: string, ingredients: string): Promise<Recipe> {
  const prompt = `Create a detailed recipe for "${title}" using these ingredients: ${ingredients}. 
  Provide precise measurements, step-by-step instructions, and nutritional macros (calories, protein, carbs, fat in grams).
  Format the response as a structured JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          macros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["calories", "protein", "carbs", "fat"],
          },
        },
        required: ["title", "ingredients", "instructions", "macros"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateRecipeImage(title: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: `A professional food photography shot of ${title}, beautifully plated, high resolution, natural lighting.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
}
