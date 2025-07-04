
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    if (!business_type || !promo_text || !theme) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Generate catchy promo line using OpenAI
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a creative marketing copywriter. Create catchy, engaging promotional text for social media posters. Use modern slang, emojis, and make it exciting. Keep it short and punchy.'
          },
          {
            role: 'user',
            content: `Create a catchy promotional line for a ${business_type} with this offer: ${promo_text}. Make it exciting and use relevant emojis.`
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    })

    const textData = await textResponse.json()
    const generatedText = textData.choices[0].message.content

    // Generate image using OpenAI DALL-E
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Create a professional promotional poster background for a ${business_type}. Modern, vibrant, eye-catching design with ${theme.name} color scheme. No text overlay, just beautiful background suitable for promotional content.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    })

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data[0].url

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
      JSON.stringify({ error: 'Failed to generate poster', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
