import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand, platform, topic, angle, context } = req.body;

    if (!brand || !platform || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tone = brand === 'aveba'
      ? "Smart, Filipino-coded, witty, confident but not stiff. Bestie energy but knows her stuff."
      : "Calm, supportive, builder-first. Like the organized friend who never makes you feel behind.";

    const prompt = `
You are an expert content writer generating social media content for the brand: ${brand.toUpperCase()}.

Tone: ${tone}
Platform: ${platform}
Topic: ${topic}
Content Angle: ${angle || 'None'}
Context: ${context || 'None'}

Write content that sounds human, confident, and natural.
Use short line breaks. No fluff. No emojis. Start strong. End stronger.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No content returned.';

    // Save to Supabase
    await supabase.from('content_logs').insert([{
      brand,
      platform,
      topic,
      angle,
      context,
      output: content
    }]);

    res.status(200).json({ content });
  } catch (error) {
    console.error('AI error:', error.message || error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
