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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    // For now, return a mock response since we haven't implemented file storage
    // In a real implementation, you would upload to Supabase Storage
    const fileInfo = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

    console.log('File upload info:', fileInfo);

    return new Response(JSON.stringify({ 
      success: true,
      file: fileInfo,
      message: 'File upload endpoint - ready for implementation'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-file function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});