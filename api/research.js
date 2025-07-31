// api/research.js - Vercel API endpoint to proxy Make.com webhook calls

export default async function handler(req, res) {
  // Set CORS headers to allow your frontend to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get the query parameter
    const { query } = req.query;

    if (!query) {
      res.status(400).json({ error: 'Missing query parameter' });
      return;
    }

    console.log('Proxying research request for query:', query);

    // Call your Make.com webhook
    const makeComUrl = `https://hook.us2.make.com/ivbtwnvd8q4fr5tnu5ctk0akruxkryu7?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(makeComUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Vercel-Proxy/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Make.com webhook returned status: ${response.status}`);
    }

    // Get the response text
    const data = await response.text();
    
    console.log('Received data from Make.com (first 100 chars):', data.substring(0, 100));

    // Try to parse as JSON, fallback to text
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      // If it's not JSON, return as text
      parsedData = { research_data: { content: data } };
    }

    // Return the data
    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error proxying research request:', error);
    res.status(500).json({ 
      error: 'Failed to fetch research data',
      details: error.message 
    });
  }
}
