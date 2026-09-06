/**
 * Sovik Jewels Utility & Formatter Functions
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateInput: any): string => {
  if (!dateInput) return '';
  let date: Date;

  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (dateInput?.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date();
  }

  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateInput: any): string => {
  if (!dateInput) return '';
  let date: Date;

  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else if (dateInput?.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date();
  }

  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

/**
 * Normalizes phone numbers for WhatsApp API usage
 * 1. Remove spaces, hyphens, plus signs
 * 2. If 10 digits, add '91' country code prefix
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d]/g, ''); // strip everything except digits

  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

/**
 * Generates valid wa.me link with URL-encoded message
 */
export const createWhatsAppLink = (phoneNumber: string, message: string): string => {
  const normalizedNumber = normalizePhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedNumber}?text=${encodedMessage}`;
};

/**
 * Generates prefilled WhatsApp inquiry message for Buy Now button
 */
export const generateWhatsAppInquiryMessage = (
  productName: string,
  sku: string,
  price: number,
  quantity: number,
  productUrl: string,
  customTemplate?: string
): string => {
  const currentDate = formatDate(new Date());

  if (customTemplate) {
    return customTemplate
      .replace(/{productName}/g, productName)
      .replace(/{sku}/g, sku)
      .replace(/{price}/g, formatCurrency(price))
      .replace(/{quantity}/g, String(quantity))
      .replace(/{date}/g, currentDate)
      .replace(/{productUrl}/g, productUrl);
  }

  return `Hello, I am interested in ordering this product.

Product: ${productName}
Product Code: ${sku}
Price: ${formatCurrency(price)}
Quantity: ${quantity}
Date: ${currentDate}

Product Link: ${productUrl}

Please share the next steps for placing the order.`;
};

/**
 * Generates WhatsApp Order Status Update message
 */
export const generateWhatsAppOrderUpdateMessage = (
  customerName: string,
  orderId: string,
  status: string,
  trackingUrl: string,
  customTemplate?: string
): string => {
  if (customTemplate) {
    return customTemplate
      .replace(/{customerName}/g, customerName)
      .replace(/{orderId}/g, orderId)
      .replace(/{status}/g, status)
      .replace(/{trackingUrl}/g, trackingUrl);
  }

  return `Hello ${customerName},

Your order #${orderId} has been updated.

Current Status: ${status}

Track your order here:
${trackingUrl}

Thank you for shopping with Sovik Jewels.`;
};

/**
 * Unique Order ID generator in SJ-YYYYMMDD-XXXX format
 */
export const generateOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `SJ-${year}${month}${day}-${randomSuffix}`;
};

/**
 * Generate secure tracking token
 */
export const generateTrackingToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Generates a unique SKU in format SJ-<PREFIX>-<NUM>
 * Example: "Royal Kundan Necklace Set" -> "SJ-KUN-0001"
 */
export const generateUniqueSKU = (
  productName: string,
  categoryName?: string,
  existingProducts: { sku: string; id?: string }[] = []
): string => {
  if (!productName.trim()) return '';

  // Determine 3-letter uppercase prefix from category or product name
  let rawPrefix = (categoryName || productName).trim().replace(/[^a-zA-Z]/g, '');
  if (rawPrefix.length < 3) {
    rawPrefix = (productName.trim() + 'JEW').replace(/[^a-zA-Z]/g, '');
  }
  const prefix = rawPrefix.substring(0, 3).toUpperCase();

  const pattern = new RegExp(`^SJ-${prefix}-(\\d+)$`, 'i');
  let maxNum = 0;

  existingProducts.forEach((p) => {
    if (!p.sku) return;
    const match = p.sku.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(4, '0');
  return `SJ-${prefix}-${nextNum}`;
};

/**
 * Generates a unique URL-friendly slug
 * Example: "Royal Kundan Necklace Set" -> "royal-kundan-necklace-set" (or -2 if duplicate)
 */
export const generateUniqueSlug = (
  productName: string,
  existingProducts: { slug: string; id?: string }[] = [],
  currentProductId?: string
): string => {
  const baseSlug = slugify(productName);
  if (!baseSlug) return '';

  let candidate = baseSlug;
  let counter = 1;

  const otherSlugs = new Set(
    existingProducts
      .filter((p) => !currentProductId || p.id !== currentProductId)
      .map((p) => p.slug)
  );

  while (otherSlugs.has(candidate)) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
};
