import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Create documents bucket if it doesn't exist
    try {
      await supabase.storage.createBucket('documents', { public: false });
    } catch (error) {
      console.log('Documents bucket might already exist or creation failed:', error.message);
    }

    // Convert file to ArrayBuffer for upload
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${crypto.randomUUID()}-${file.name}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL (for public files) or signed URL (for private files)
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const fileInfo = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      storagePath: uploadData.path,
      url: urlData.publicUrl,
      uploadedAt: new Date().toISOString()
    };

    console.log('File uploaded successfully:', fileInfo);

    return new Response(JSON.stringify({ 
      success: true,
      file: fileInfo,
      message: 'File uploaded successfully'
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