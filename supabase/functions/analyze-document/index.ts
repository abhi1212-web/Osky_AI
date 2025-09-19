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
    const { fileId } = await req.json();

    if (!fileId) {
      throw new Error('File ID is required');
    }

    // For now, return a mock analysis response
    // In a real implementation, you would analyze the document content
    const analysis = {
      fileId: fileId,
      status: 'analyzed',
      summary: 'Document analysis endpoint - ready for implementation',
      wordCount: Math.floor(Math.random() * 1000) + 100,
      language: 'en',
      topics: ['technology', 'business', 'development'],
      analyzedAt: new Date().toISOString()
    };

    console.log('Document analysis:', analysis);

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});