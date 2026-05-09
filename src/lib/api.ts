const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Robust Fetch Wrapper
async function safeFetch(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.details ? `${errorData.message} (${errorData.details})` : (errorData.message || `Server Error (${response.status})`);
      throw new Error(msg);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Call Failed (${url}):`, error.message);
    throw error;
  }
}

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
      nutrition: data.product.nutriments || {},
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
    return await safeFetch(`${API_BASE_URL}/chat/insight`, {
      method: 'POST',
      body: JSON.stringify({ product, profile })
    });
  } catch (error: any) {
    return {
      isSafe: true,
      warning: "AI Analysis is currently catching its breath.",
      recommendation: "We couldn't get a deep AI analysis right now, but please check the ingredients list below manually.",
      score: 50,
      realityCheck: { sugarTeaspoons: 0, exerciseToBurn: { activity: "walking", minutes: 0 } },
      smartSwap: { productName: "N/A", reason: "AI Service temporarily unavailable" },
      ingredientInsights: [],
      voiceSummary: "AI analysis is temporarily unavailable. Please check ingredients manually."
    };
  }
}

export async function generateDietPlan(profile: any) {
  try {
    return await safeFetch(`${API_BASE_URL}/chat/diet-plan`, {
      method: 'POST',
      body: JSON.stringify({ profile })
    });
  } catch (error: any) {
    return {
      dailyCalories: 2000,
      proteinTarget: 50,
      meals: [
        { type: 'Breakfast', name: 'Healthy Oats', time: '8:00 AM', calories: 350 },
        { type: 'Lunch', name: 'Fresh Salad', time: '1:00 PM', calories: 500 }
      ],
      tips: ['AI is busy. Here is a standard healthy plan for today!']
    };
  }
}

export async function chatWithAI(message: string, profile: any, currentProduct: any = null) {
  try {
    const data = await safeFetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({ query: message, profile, product: currentProduct })
    });
    return data.reply;
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      return `Connection Error: I can't reach the server. It might be sleeping—please wait 30 seconds and try again.`;
    }
    return `AI Error: ${error.message}`;
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

export async function getLocationHealthAlerts(city: string) {
  try {
    return await safeFetch(`${API_BASE_URL}/chat/location-health`, {
      method: 'POST',
      body: JSON.stringify({ city })
    });
  } catch (error) {
    return {
      heatwaveRisk: 'low',
      waterGoalLitres: 2.5,
      diseaseAlerts: [],
      summary: 'Stay hydrated and eat balanced meals.'
    };
  }
}
