import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if required environment variables are set
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        groq: groqApiKey ? 'configured' : 'not_configured',
        openai: openaiApiKey ? 'configured' : 'not_configured'
      },
      version: '1.0.0'
    };

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in health function:', error);
    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});