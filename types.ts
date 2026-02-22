export interface Recipe {
  id?: number;
  title: string;
  ingredients: string[];
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  image_url?: string;
}

export interface User {
  id: number;
  username: string;
}

export type DietaryGoal = "none" | "high-protein" | "vegan" | "keto" | "low-carb" | "paleo";
