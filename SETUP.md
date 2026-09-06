# Sovik Jewels — Setup & Gemini API Secret Configuration Guide

This document explains how to configure the **Google Gemini AI Product Description Generation**.

---

## 🔐 1. Gemini API Key Server-Side Configuration

To prevent exposing the secret API key in the client-side JavaScript bundle, the product
description generator uses a **Firebase Cloud Function** that reads `GEMINI_API_KEY`
from the **server-side** `functions/.env` file.

The `.env` file inside `functions/` is git-ignored (`functions/.env` is in `.gitignore`)
and its contents are **never bundled or served to the browser**. The frontend only calls
the serverless Cloud Function endpoint — the API key never leaves the server.

### Step A: Create the server-side env file

Copy `functions/.env.example` → `functions/.env` and make sure your real Gemini API key is there:

```bash
# functions/.env  (this file is git-ignored)
GEMINI_API_KEY=your_real_gemini_api_key_here
```

### Step B: Deploy Firebase Cloud Functions

Deploy the `generateProductDescription` callable Cloud Function:

```bash
firebase deploy --only functions
```

That's it. **No Firebase Blaze plan, no Secret Manager, no VITE_* env vars required.**

> **Note**: Do NOT add `VITE_GEMINI_API_KEY` to the root `.env` / Vite frontend env.
> Doing so would bundle the key into the browser JavaScript and is a security risk.

---

## 🚀 2. Automatic SKU Generation

1. **Format**: `SJ-<PREFIX>-<NUMBER>` (e.g. `Royal Kundan Necklace Set` → `SJ-KUN-0001`).
2. **Prefix**: `SJ` + 3-letter code derived from category or product name.
3. **Uniqueness**: automatically increments the numeric suffix so no two live products share an SKU.
4. **Editable**: admins can manually overwrite the generated SKU; manual edits are never overwritten by auto-generation.
5. **Edit safety**: editing an existing product preserves its SKU unless the admin intentionally changes it.

---

## 🌐 3. Automatic URL Slug Generation

1. Product Name → slug: lowercase, spaces→hyphens, special characters removed, duplicate hyphens collapsed.
2. Example: `Royal Kundan Necklace Set` → `royal-kundan-necklace-set`.
3. **Uniqueness**: if a slug already exists, a numerical suffix is appended (`royal-kundan-necklace-set-2`).
4. **Editable**: admins can manually edit the slug; the field sanitizes input to a URL-safe format.
5. **Edit preservation**: editing an existing product preserves its slug unless the admin intentionally changes it.

---

## ✨ 4. Gemini AI Product Description Generator

- Debounced auto-trigger (~900 ms) after typing the Product Name (only for new products, when description is empty).
- Manual **✨ Generate Description** / **✨ Regenerate Description** button.
- Never overwrites a description the admin has manually typed or edited.
- Loading, error, and retry states handled gracefully.
- Server-side prompt is crafted to avoid inventing certifications, materials, or claims not present in the form.