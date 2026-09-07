import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function geminiDevFunctionsPlugin(): Plugin {
  return {
    name: 'gemini-dev-functions-emulator',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (
          url.includes('/generateProductDescription')
        ) {
          // Set CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method === 'POST') {
            try {
              // Read body
              let bodyStr = '';
              for await (const chunk of req) {
                bodyStr += chunk;
              }

              let parsedBody: any = {};
              try {
                parsedBody = JSON.parse(bodyStr || '{}');
              } catch {
                parsedBody = {};
              }

              // Firebase onCall requests wrap payload in { data: ... }
              const payload = parsedBody.data || parsedBody;
              const {
                productName,
                category,
                subcategory,
                tags,
                price,
                mrp,
                colour,
                material,
                occasion,
                style,
              } = payload;

              if (!productName || typeof productName !== 'string' || !productName.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: {
                      message: 'Product Name is required to generate AI description.',
                      status: 'INVALID_ARGUMENT',
                    },
                  })
                );
                return;
              }

              // Resolve Gemini API key server-side from functions/.env
              let apiKey = process.env.GEMINI_API_KEY || '';
              if (!apiKey) {
                const envPath = path.resolve(__dirname, 'functions/.env');
                if (fs.existsSync(envPath)) {
                  const envRaw = fs.readFileSync(envPath, 'utf8');
                  const match = envRaw.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)$/m);
                  if (match) {
                    apiKey = match[1].trim();
                  }
                }
              }

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: {
                      message: 'GEMINI_API_KEY is not configured in functions/.env on the server.',
                      status: 'FAILED_PRECONDITION',
                    },
                  })
                );
                return;
              }

              // Construct Prompt
              const systemPrompt = `You are a professional ecommerce copywriter for Sovik Jewels, a premium artificial jewellery and fashion accessories brand.

Create a premium product description for this product:

Product Name: ${productName.trim()}
${category ? `Category: ${category}` : ''}
${subcategory ? `Subcategory: ${subcategory}` : ''}
${price ? `Price: ₹${price}` : ''}
${mrp ? `MRP: ₹${mrp}` : ''}
${tags ? `Tags: ${tags}` : ''}
${colour ? `Colour: ${colour}` : ''}
${material ? `Material: ${material}` : ''}
${occasion ? `Occasion: ${occasion}` : ''}
${style ? `Style: ${style}` : ''}

Write an elegant, persuasive ecommerce description.

Requirements:
* 60–100 words.
* Premium and sophisticated tone suitable for an Indian artificial jewellery boutique.
* Natural human-like copywriting highlighting aesthetic appeal, occasions, and handcrafted feel.
* Highlight style, elegance, occasions, and versatility.
* NEVER invent specifications, materials, gemstones, certifications, guarantees, or facts that were not provided above.
* Avoid excessive emojis (max 1 or none).
* Do not use markdown (no bold asterisks, no bullet points, no headers).
* Return ONLY the final product description paragraph.`;

              const CANDIDATE_MODELS = [
                'gemini-flash-lite-latest',
                'gemini-3.1-flash-lite-preview',
                'gemini-3-flash-preview',
                'gemini-flash-latest',
              ];

              let generatedText = '';
              let lastErrorMsg = '';

              for (const model of CANDIDATE_MODELS) {
                try {
                  const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: {
                          temperature: 0.7,
                          maxOutputTokens: 1000,
                        },
                      }),
                    }
                  );

                  if (!geminiRes.ok) {
                    const errText = await geminiRes.text();
                    lastErrorMsg = `Status ${geminiRes.status}: ${errText.slice(0, 100)}`;
                    continue;
                  }

                  const result = await geminiRes.json();
                  const candidateText =
                    result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

                  if (candidateText && candidateText.length > 30) {
                    generatedText = candidateText;
                    break;
                  }
                } catch (err: any) {
                  lastErrorMsg = err?.message || 'Network error';
                }
              }

              if (!generatedText) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: {
                      message: `Unable to generate description right now. ${lastErrorMsg || 'Please try again.'}`,
                      status: 'INTERNAL',
                    },
                  })
                );
                return;
              }

              // Return onCall format response: { data: { description: ... } }
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ data: { description: generatedText } }));
              return;
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: {
                    message: err?.message || 'Internal error',
                    status: 'INTERNAL',
                  },
                })
              );
              return;
            }
          }
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), geminiDevFunctionsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
