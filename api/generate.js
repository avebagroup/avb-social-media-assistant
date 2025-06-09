export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand, platform, topic, angle, context } = req.body;

    const tone = brand === 'aveba'
      ? "Smart, Filipino-coded, witty, confident but not stiff."
      : "Calm, supportive, builder-first, practical tone for service providers.";

    const prompt = `
You're creating social media content for the brand: ${brand.toUpperCase()}

Tone: ${tone}
Platform: ${platform}
Topic: ${topic}
Content Angle: ${angle}
Context: ${context || 'None'}

Write content that sounds natural, human, and on-brand. Use short lines. Avoid fluff. Start strong. End stronger.
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

    res.status(200).json({ content });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
