
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
        model: 'gpt-3.5-turbo',
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
        JSON.stringify({ error: `Failed to generate text: ${textResponse.status} - ${errorText}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const textData = await textResponse.json()
    const generatedText = textData.choices?.[0]?.message?.content || 'Amazing offer awaits! 🔥'

    console.log('Generated text:', generatedText)

    // For free accounts, we'll create a simple gradient background instead of using DALL-E
    // This creates a data URL for a simple gradient that matches the theme colors
    const createGradientImage = (theme: any) => {
      const canvas = `
        <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${theme.colors.primary};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${theme.colors.secondary};stop-opacity:0.8" />
            </linearGradient>
          </defs>
          <rect width="1024" height="1024" fill="url(#grad)" />
          <circle cx="200" cy="200" r="100" fill="${theme.colors.accent}" opacity="0.3"/>
          <circle cx="800" cy="800" r="150" fill="${theme.colors.accent}" opacity="0.2"/>
          <rect x="100" y="500" width="824" height="4" fill="${theme.colors.accent}" opacity="0.5"/>
        </svg>
      `
      return `data:image/svg+xml;base64,${btoa(canvas)}`
    }

    const imageUrl = createGradientImage(theme)

    console.log('Successfully generated poster content with gradient background')

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
