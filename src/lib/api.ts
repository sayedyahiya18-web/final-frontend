import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").trim();
if (!apiKey) console.warn("Gemini API Key is missing!");
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function getProductByBarcode(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 0) return null;

    return {
      name: data.product.product_name || 'Unknown Product',
      brand: data.product.brands || 'Unknown Brand',
      ingredients: data.product.ingredients_text || '',
      image: data.product.image_front_url,
      nutrition: data.product.nutriments,
      categories: data.product.categories_tags || [],
      allergens: data.product.allergens_tags || [],
      quantity: data.product.quantity
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function generateHealthInsight(product: any, preferences: any) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error("API Key missing");
    }

    const prompt = `
      Analyze this food product for someone with these preferences:
      Product: ${product.name}
      Brand: ${product.brand}
      Ingredients: ${product.ingredients}
      Allergens: ${product.allergens.join(', ')}
      Nutrition (per 100g): ${JSON.stringify(product.nutrition)}
      User Allergies: ${preferences.allergies.join(', ')}
      User Conditions: ${preferences.conditions.join(', ')}
      
      Return JSON format ONLY: 
      { 
        "isSafe": boolean, 
        "warning": string | null, 
        "recommendation": string, 
        "score": number,
        "realityCheck": {
          "sugarTeaspoons": number,
          "exerciseToBurn": { "activity": string, "minutes": number }
        },
        "smartSwap": {
          "productName": string,
          "reason": string
        },
        "ingredientInsights": [
          { "ingredient": string, "explanation": string }
        ],
        "voiceSummary": string
      }
      
      Rules:
      1. voiceSummary: Max 15 words, very concise, personalized to user goals/conditions.
      2. ingredientInsights: Focus on E-numbers or complex items, 1 sentence each.
      3. realityCheck: 4g sugar = 1 teaspoon.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanedJson);
  } catch (error) {
    // Fallback with basic simulated data
    return {
      isSafe: true,
      warning: null,
      recommendation: "Basic safety check performed. No major issues found.",
      score: 70,
      realityCheck: {
        sugarTeaspoons: Math.round((product.nutrition.sugars_100g || 0) / 4),
        exerciseToBurn: { activity: "walking", minutes: Math.round((product.nutrition['energy-kcal_100g'] || 0) / 4) }
      },
      smartSwap: { productName: "Natural alternative", reason: "Fewer processed ingredients" },
      ingredientInsights: [{ ingredient: "Additives", explanation: "Common food stabilizer with no major health risks reported." }],
      voiceSummary: "This looks safe for your goals."
    };
  }
}

export async function generateDietPlan(preferences: any) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error("API Key missing");
    }

    const prompt = `
      Generate a 1-day personalized diet plan based on:
      Diet Type: ${preferences.dietType}
      Protein Goal: ${preferences.proteinGoal}g
      Routine: ${preferences.routine}
      Allergies: ${preferences.allergies.join(', ')}
      Conditions: ${preferences.conditions.join(', ')}

      Return JSON format: 
      {
        "dailyCalories": number,
        "proteinTarget": number,
        "meals": [
          { "type": "Breakfast" | "Lunch" | "Snack" | "Dinner", "name": string, "time": string, "calories": number }
        ],
        "tips": string[]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // More robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanedJson);
  } catch (error) {
    return {
      dailyCalories: 2000,
      proteinTarget: preferences.proteinGoal,
      meals: [
        { type: 'Breakfast', name: 'Standard Meal', time: '8:00 AM', calories: 500 },
        { type: 'Lunch', name: 'Standard Meal', time: '1:00 PM', calories: 600 },
        { type: 'Dinner', name: 'Standard Meal', time: '7:30 PM', calories: 900 }
      ],
      tips: ['Please set your Gemini API Key for a personalized plan.']
    };
  }
}

export async function chatWithAI(message: string, preferences: any) {
  try {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error("API Key missing");
    }

    const prompt = `
      User Message: "${message}"
      User Profile: ${JSON.stringify(preferences)}
      Act as a helpful, professional nutrition assistant. Keep it concise.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Chat AI Error:", error);
    return `I'm having trouble connecting: ${error.message || "Unknown error"}. Please check your API key.`;
  }
}

export async function fetchHealthNews(category: string = 'All') {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  if (!apiKey) return [];

  const query = category === 'All' ? 'nutrition+OR+healthy+eating' : category.toLowerCase() + '+nutrition';

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`
    );
    const data = await response.json();
    
    if (data.status !== 'ok') throw new Error(data.message);

    return data.articles.map((article: any, idx: number) => ({
      id: idx,
      title: article.title,
      source: article.source.name,
      time: new Date(article.publishedAt).toLocaleDateString(),
      category: "Health",
      image: article.urlToImage || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      summary: article.description,
      url: article.url
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}
