
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { business_type, promo_text, theme } = await req.json()

    console.log('Received request:', { business_type, promo_text, theme })

    if (!business_type || !promo_text || !theme) {
      console.error('Missing required fields:', { business_type, promo_text, theme })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: business_type, promo_text, and theme are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to Supabase secrets.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Generating promo text with OpenAI...')

    // Generate catchy promo line using OpenAI
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative marketing copywriter. Create catchy, engaging promotional text for social media posters. Use modern slang, emojis, and make it exciting. Keep it short and punchy under 15 words.'
          },
          {
            role: 'user',
            content: `Create a catchy promotional line for a ${business_type} with this offer: ${promo_text}. Make it exciting and use relevant emojis. Keep it under 15 words.`
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    })

    if (!textResponse.ok) {
      const errorText = await textResponse.text()
      console.error('OpenAI text generation failed:', textResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `Failed to generate text: ${textResponse.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const textData = await textResponse.json()
    const generatedText = textData.choices?.[0]?.message?.content || 'Amazing offer awaits! 🔥'

    console.log('Generated text:', generatedText)
    console.log('Generating image with DALL-E...')

    // Generate image using OpenAI DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a professional promotional poster background for a ${business_type}. Modern, vibrant, eye-catching design with ${theme.name} color scheme (${theme.colors.primary}, ${theme.colors.secondary}). No text overlay, just beautiful background suitable for promotional content. High quality, commercial style.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    })

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('OpenAI image generation failed:', imageResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `Failed to generate image: ${imageResponse.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data?.[0]?.url

    if (!imageUrl) {
      console.error('No image URL in response:', imageData)
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Successfully generated poster content')

    return new Response(
      JSON.stringify({
        promo_line: generatedText,
        image_url: imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating poster:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate poster', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
