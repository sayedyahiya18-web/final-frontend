const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

export async function generateHealthInsight(product: any, profile: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product, profile })
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating insight:', error);
    // Fallback data
    return {
      isSafe: true,
      warning: null,
      recommendation: "Checking backend...",
      score: 0,
      realityCheck: { sugarTeaspoons: 0, exerciseToBurn: { activity: "walking", minutes: 0 } },
      smartSwap: { productName: "Checking...", reason: "Connecting to server" },
      ingredientInsights: [],
      voiceSummary: "Connecting to server."
    };
  }
}

export async function generateDietPlan(profile: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/diet-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating diet plan:', error);
    return {
      dailyCalories: 0,
      proteinTarget: 0,
      meals: [],
      tips: ['Failed to connect to server.']
    };
  }
}

export async function chatWithAI(message: string, profile: any, currentProduct: any = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message, profile, product: currentProduct })
    });
    const data = await response.json();
    return data.reply;
  } catch (error: any) {
    console.error("Chat AI Error:", error);
    return `I'm having trouble connecting to the server.`;
  }
}

export async function fetchHealthNews(category: string = 'All') {
  // Keeping news simple for now as it's a direct public API call often handled frontend
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

