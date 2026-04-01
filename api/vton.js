export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { humanImg, garmentImg } = req.body;

  if (!humanImg || !garmentImg) {
    return res.status(400).json({ error: 'Missing images. Required: humanImg, garmentImg' });
  }

  // Extract base64 part
  const rawHuman = humanImg.replace(/^data:image\/\w+;base64,/, '');
  const rawGarment = garmentImg.replace(/^data:image\/\w+;base64,/, '');

  try {
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      return res.status(500).json({ error: 'Server misconfiguration: HF_TOKEN environment variable is not set.' });
    }

    console.log("Calling Hugging Face IDM-VTON API...");
    const response = await fetch("https://router.huggingface.co/models/yisol/IDM-VTON", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: {
          image: rawHuman,
          cloth: rawGarment
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API Error Response:", errorText, "Status:", response.status);
      return res.status(response.status).json({ error: 'HF API Request Failed', details: errorText });
    }

    const contentType = response.headers.get("content-type");
    
    // Depending on the inference endpoint, it might return a direct image blob or JSON with image
    if (contentType && contentType.includes("application/json")) {
       const json = await response.json();
       return res.status(200).json({ result: json });
    } else {
       const arrayBuffer = await response.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       const base64 = buffer.toString('base64');
       // Send it back exactly as the UI expects (a data url)
       return res.status(200).json({ result: `data:${contentType};base64,${base64}` });
    }

  } catch (error) {
    console.error("Vercel Serverless HF Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
