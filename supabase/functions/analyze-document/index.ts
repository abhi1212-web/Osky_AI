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
    const { fileId, filePath, fileUrl } = await req.json();

    if (!fileId && !filePath && !fileUrl) {
      throw new Error('File ID, path, or URL is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Analyzing document:', { fileId, filePath, fileUrl });

    let fileContent = '';
    let contentType = '';

    // If we have a file URL, fetch the content
    if (fileUrl) {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        
        contentType = response.headers.get('content-type') || '';
        
        // For text files, read as text
        if (contentType.includes('text') || contentType.includes('json') || contentType.includes('xml')) {
          fileContent = await response.text();
        } else {
          // For binary files, we'll analyze the metadata only
          fileContent = `Binary file analysis - Type: ${contentType}`;
        }
      } catch (error) {
        console.error('Error fetching file:', error);
        throw new Error(`Failed to fetch file content: ${error.message}`);
      }
    }

    // Use OpenAI to analyze the document
    const analysisPrompt = `Analyze this document content and provide insights:
    
Content Type: ${contentType}
Content: ${fileContent.substring(0, 4000)} ${fileContent.length > 4000 ? '...(truncated)' : ''}

Please provide:
1. A brief summary
2. Key topics or themes
3. Document type/category
4. Language detected
5. Estimated word count
6. Any notable features or patterns

Respond in JSON format with these fields: summary, topics, category, language, wordCount, features`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a document analysis expert. Always respond with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`Analysis failed: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    let analysisResult;

    try {
      analysisResult = JSON.parse(openaiData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      analysisResult = {
        summary: openaiData.choices[0].message.content,
        topics: ['general'],
        category: 'document',
        language: 'unknown',
        wordCount: fileContent.split(' ').length,
        features: ['analyzed']
      };
    }

    const analysis = {
      fileId: fileId,
      status: 'analyzed',
      summary: analysisResult.summary || 'Analysis completed',
      topics: analysisResult.topics || ['general'],
      category: analysisResult.category || 'document',
      language: analysisResult.language || 'unknown',
      wordCount: analysisResult.wordCount || fileContent.split(' ').length,
      features: analysisResult.features || [],
      contentType: contentType,
      analyzedAt: new Date().toISOString()
    };

    console.log('Document analysis completed:', analysis);

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