import axios from 'axios';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const brainUrl = process.env.NLP_SERVICE_URL;
  if (!brainUrl) {
    return res.status(500).json({
      error: 'Missing NLP_SERVICE_URL environment variable on Vercel.',
    });
  }

  try {
    const brainResponse = await axios.post(
      brainUrl,
      { url },
      { timeout: 120000 }
    );

    const result = brainResponse.data;
    return res.status(200).json({
      success: true,
      url,
      overallScore: result.overallScore,
      categories: result.categories,
      textPreview: result.text_content,
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.detail ||
      error.response?.data?.error ||
      error.message ||
      'Brain malfunction';

    return res.status(status).json({ error: message });
  }
}
