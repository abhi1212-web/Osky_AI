import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { audio, action = 'transcribe' } = await req.json();

    if (!audio) {
      throw new Error('Audio data is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Processing voice request:', action);

    if (action === 'transcribe') {
      // Convert audio to text using Whisper
      const formData = new FormData();
      
      // Convert base64 audio to blob
      const audioData = atob(audio.split(',')[1]);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      const audioBlob = new Blob([audioArray], { type: 'audio/webm' });
      
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!whisperResponse.ok) {
        const errorData = await whisperResponse.text();
        console.error('Whisper API error:', errorData);
        throw new Error(`Speech recognition failed: ${whisperResponse.status}`);
      }

      const whisperData = await whisperResponse.json();
      const transcription = whisperData.text;

      console.log('Transcribed text:', transcription);

      // Now get AI response
      const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are OSKY AI, a helpful voice assistant. Provide concise, natural responses suitable for speech. Keep responses under 100 words when possible.' 
            },
            { role: 'user', content: transcription }
          ],
          max_tokens: 300,
          temperature: 0.7
        }),
      });

      if (!chatResponse.ok) {
        const errorData = await chatResponse.text();
        console.error('Chat API error:', errorData);
        throw new Error(`Chat response failed: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      const aiResponse = chatData.choices[0].message.content;

      // Convert AI response to speech
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: aiResponse,
          response_format: 'mp3'
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.text();
        console.error('TTS API error:', errorData);
        throw new Error(`Text-to-speech failed: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(JSON.stringify({
        transcription: transcription,
        response: aiResponse,
        audio: `data:audio/mp3;base64,${audioBase64}`,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'speak') {
      // Convert text to speech only
      const { text } = await req.json();
      
      if (!text) {
        throw new Error('Text is required for speech synthesis');
      }

      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: text,
          response_format: 'mp3'
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.text();
        console.error('TTS API error:', errorData);
        throw new Error(`Text-to-speech failed: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(JSON.stringify({
        audio: `data:audio/mp3;base64,${audioBase64}`,
        text: text,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Error in voice-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});