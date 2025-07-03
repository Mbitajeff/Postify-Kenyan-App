
interface PromoContent {
  text: string;
  imageUrl: string;
}

export const generatePromoContent = async (
  business_type: string,
  promo_text: string,
  theme: string,
  apiKey: string
): Promise<PromoContent> => {
  console.log('Starting AI content generation...');
  
  try {
    // Generate promotional text using GPT with Kenyan Gen Z tone
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative marketing copywriter with a youthful, hype Kenyan tone. Think Gen Z energy. Write short, catchy promo lines that are bold and authentic. Avoid clichés. Keep responses under 15 words.'
          },
          {
            role: 'user',
            content: `Write a short, catchy promo line for a ${business_type} offering this promo: "${promo_text}". Keep it under 15 words. Use a youthful, hype Kenyan tone — think Gen Z energy. Avoid clichés. Sound bold and authentic.`
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    if (!textResponse.ok) {
      throw new Error(`Text generation failed: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const promo_line = textData.choices[0]?.message?.content?.trim() || 'Amazing offer awaits you!';
    
    console.log('Generated promo_line:', promo_line);

    // Generate background image using DALL-E with Kenya context
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `High-quality poster background for a ${business_type} in Kenya. Style: ${theme}. Clean, aesthetic, no text. Vibrant, modern, professional background suitable for promotional poster.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!imageResponse.ok) {
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const poster_image = imageData.data[0]?.url;

    if (!poster_image) {
      throw new Error('No image URL received from DALL-E');
    }

    console.log('Generated poster_image URL:', poster_image);

    return {
      text: promo_line,
      imageUrl: poster_image
    };

  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
};
