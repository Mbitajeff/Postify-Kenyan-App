
interface PromoContent {
  text: string;
  imageUrl: string;
}

export const generatePromoContent = async (
  businessType: string,
  promoOffer: string,
  apiKey: string
): Promise<PromoContent> => {
  console.log('Starting AI content generation...');
  
  try {
    // Generate promotional text using GPT
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
            content: 'You are a creative marketing copywriter. Create catchy, engaging promotional text that is concise and impactful for social media posters. Keep it under 25 words and make it exciting.'
          },
          {
            role: 'user',
            content: `Create a catchy promotional line for a ${businessType} business offering: ${promoOffer}`
          }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    });

    if (!textResponse.ok) {
      throw new Error(`Text generation failed: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const generatedText = textData.choices[0]?.message?.content?.trim() || 'Amazing offer awaits you!';
    
    console.log('Generated text:', generatedText);

    // Generate background image using DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a beautiful, modern background for a ${businessType} promotional poster. The image should be vibrant, professional, and suitable as a background (not too busy). Style: modern, clean, appealing, commercial photography aesthetic. No text or words in the image.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!imageResponse.ok) {
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.data[0]?.url;

    if (!imageUrl) {
      throw new Error('No image URL received from DALL-E');
    }

    console.log('Generated image URL:', imageUrl);

    return {
      text: generatedText,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
};
