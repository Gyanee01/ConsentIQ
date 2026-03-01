import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = 3007;
const BRAIN_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000/analyze';

app.use(cors());
app.use(express.json());

// Task: Proxy requests to the Python AI Brain
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  console.log(`\n[PROXY] Requesting Analysis for: ${url}`);
  
  try {
    // We send the URL to the Python service. 
    // It will do the Stealth Scraping and the NLP analysis.
    const brainResponse = await axios.post(BRAIN_URL, { url }, {
      timeout: 120000, // 2 minute timeout for slow policies + AI processing
    });
    
    const result = brainResponse.data;
    console.log(`[PROXY] Brain responded with score: ${result.overallScore}`);

    res.json({
      success: true,
      url,
      overallScore: result.overallScore,
      categories: result.categories,
      textPreview: result.text_content
    });
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
       console.error(`[ERROR] AI Brain is NOT listening at ${BRAIN_URL}`);
       return res.status(503).json({ 
         error: "AI Brain is OFFLINE. Please run 'python python-nlp/main.py' in a separate terminal." 
       });
    }
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || "Brain malfunction";
    
    console.error(`[ERROR] Brain returned ${status}: ${message}`);
    res.status(status).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==============================================`);
    console.log(`ConsentIQ Dashboard: http://localhost:${PORT}`);
    console.log(`AI Brain Connection: ${BRAIN_URL}`);
    console.log(`==============================================\n`);
  });
}

startServer();
