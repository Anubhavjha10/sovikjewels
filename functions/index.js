const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

admin.initializeApp();

// ------------------------------------------------------------------
// Server-side secret/key resolution. No Blaze plan, no Secret Manager.
//
// 1. functions/.env  -> read directly at runtime on the server (also used
//    by the Firebase emulator). NEVER bundled to the browser.
// 2. process.env.GEMINI_API_KEY -> injected by the platform env.
// 3. functions.config().gemini.api_key -> set with the free command:
//       firebase functions:config:set gemini.api_key="YOUR_KEY"
//
// All of these stay strictly server-side.
// ------------------------------------------------------------------
function loadServerDotEnv() {
  try {
    const envFile = path.join(__dirname, '.env');
    if (fs.existsSync(envFile)) {
      const raw = fs.readFileSync(envFile, 'utf8');
      for (const line of raw.split('\n')) {
        const m = line.replace(/^\s+|\s+$/g, '').match(/^([\w.-]+)=(.+)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].trim();
        }
      }
    }
  } catch (err) {
    console.warn('Unable to read functions/.env (continuing):', err.message || err);
  }
}
loadServerDotEnv();

/** Returns the Gemini API key from server-only sources (never prints it). */
function resolveGeminiApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const cfg = functions.config();
    if (cfg && cfg.gemini && cfg.gemini.api_key) return cfg.gemini.api_key;
  } catch (err) {
    console.warn('functions.config() unavailable:', err.message || err);
  }
  return null;
}


/**
 * Callable Firebase Cloud Function to securely generate AI product descriptions
 * using Google Gemini API without exposing secret API keys on the frontend client.
 */
exports.generateProductDescription = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // 1. Verify User Authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required to generate AI product descriptions.'
      );
    }

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
    } = data || {};

    if (!productName || typeof productName !== 'string' || !productName.trim()) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Product Name is required to generate AI description.'
      );
    }

    // 2. Resolve the Gemini API Key server-side only (never exposed to the browser).
    const apiKey = resolveGeminiApiKey();
    if (!apiKey) {
      console.error(
        'GEMINI_API_KEY is not configured. Add it to functions/.env or run:\n' +
          '  firebase functions:config:set gemini.api_key="YOUR_KEY"\n' +
          '  firebase deploy --only functions'
      );
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Gemini API key is not configured on the server.'
      );
    }

    // 3. Construct Gemini Prompt
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

    // 4. Candidate models in order of preference with automatic fallback
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
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: systemPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
              },
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Model ${model} returned status ${response.status}:`, errText);
          lastErrorMsg = `Status ${response.status}: ${errText.slice(0, 120)}`;
          continue;
        }

        const result = await response.json();
        const candidateText =
          result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        if (candidateText && candidateText.length > 30) {
          generatedText = candidateText;
          break;
        }
      } catch (err) {
        console.warn(`Error trying Gemini model ${model}:`, err.message || err);
        lastErrorMsg = err.message || 'Network error';
      }
    }

    if (!generatedText) {
      console.error('All Gemini candidate models failed. Last error:', lastErrorMsg);
      throw new functions.https.HttpsError(
        'internal',
        `Unable to generate description right now. ${lastErrorMsg || 'Please try again.'}`
      );
    }

    return { description: generatedText };
  });
