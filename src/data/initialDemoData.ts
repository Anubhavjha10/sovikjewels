import { Product, Category, Banner, Offer, Popup, InstagramPost, Review, WebsiteSettings } from '../types';

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  brandName: "Sovik Jewels",
  logo: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400",
  favicon: "/favicon.svg",
  tagline: "Timeless Craftsmanship & Modern Elegance",
  contactMobile: "+91 98765 43210",
  whatsappNumber: "+91 98765 43210",
  contactEmail: "care@sovikjewels.com",
  address: "Boutique 402, High Street Galleria, MG Road, Mumbai, Maharashtra - 400001",
  instagramUrl: "https://instagram.com/sovikjewels",
  facebookUrl: "https://facebook.com/sovikjewels",
  youtubeUrl: "https://youtube.com/sovikjewels",
  footerDescription: "Sovik Jewels brings you hand-selected, high-grade artificial and fashion jewellery crafted to reflect regal grandeur and modern sophistication for every occasion.",
  copyrightText: "© 2026 Sovik Jewels. All rights reserved.",
  productInquiryTemplate: `Hello, I am interested in ordering this product.

Product: {productName}
Product Code: {sku}
Price: {price}
Quantity: {quantity}
Date: {date}

Product Link: {productUrl}

Please share the next steps for placing the order.`,
  orderUpdateTemplate: `Hello {customerName},

Your order #{orderId} has been updated.

Current Status: {status}

Track your order here:
{trackingUrl}

Thank you for shopping with Sovik Jewels.`,
  trackingTemplate: `Track your order easily on Sovik Jewels. Enter your Order ID and secret token to view real-time delivery status.`
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-necklaces",
    name: "Necklaces",
    slug: "necklaces",
    description: "Royal Kundan, Chokers, and Pearl neckpieces crafted for statement looks.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-earrings",
    name: "Earrings",
    slug: "earrings",
    description: "Elegant Jhumkas, Chandbalis, Studs and Statement Hoops.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-rings",
    name: "Rings",
    slug: "rings",
    description: "Adjustable Solitaire, Cocktail & Traditional Statement Rings.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800",
    displayOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-bracelets",
    name: "Bracelets",
    slug: "bracelets",
    description: "Minimalist cuffs, charm bracelets & stone-encrusted bangles.",
    image: "https://images.unsplash.com/photo-1611591475140-be38b738e2d6?auto=format&fit=crop&q=80&w=800",
    displayOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-jewellery-sets",
    name: "Jewellery Sets",
    slug: "jewellery-sets",
    description: "Complete bridal and festive sets including necklace, earrings & maang tikka.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    displayOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-watches",
    name: "Watches",
    slug: "watches",
    description: "Rose Gold, Luxury Mesh & Diamond-accented Fashion Watches.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    displayOrder: 6,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-anklets",
    name: "Anklets",
    slug: "anklets",
    description: "Delicate Kundan & Ghungroo anklets for traditional allure.",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=800",
    displayOrder: 7,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "cat-bangles",
    name: "Bangles",
    slug: "bangles",
    description: "Glass, Kundan & Velvet Bangle sets for weddings.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    displayOrder: 8,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "banner-1",
    heading: "Timeless Jewellery, Effortless Elegance",
    description: "Discover our handcrafted royal collection of neckpieces and statement earrings.",
    desktopImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1600",
    mobileImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    buttonText: "Explore Collection",
    buttonLink: "/shop",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "banner-2",
    heading: "New Festive Arrivals — Shine Your Way",
    description: "Exclusive Kundan and Polki designs tailored for celebrations and special occasions.",
    desktopImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1600",
    mobileImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
    buttonText: "Shop New Arrivals",
    buttonLink: "/category/jewellery-sets",
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "banner-3",
    heading: "Rose Gold & Luxury Timepieces",
    description: "Chic fashion watches adorned with shimmering crystals and elegant mesh bands.",
    desktopImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1600",
    mobileImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    buttonText: "View Watches",
    buttonLink: "/category/watches",
    displayOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Royal Kundan Choker Necklace Set",
    slug: "royal-kundan-choker-necklace-set",
    sku: "SJ-1001",
    categoryId: "cat-necklaces",
    categoryName: "Necklaces",
    description: "Exquisite hand-strung pearl choker with Kundan stone setting and matching dangle earrings. Perfect for weddings and festive grandeur.",
    shortDescription: "Hand-strung pearl choker with Kundan stone setting & matching earrings.",
    price: 1499,
    mrp: 2999,
    discount: 50,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000"
    ],
    stock: 25,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isOffer: true,
    tags: ["Kundan", "Bridal", "Necklace", "Pearls"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Crystal Drop Emerald Earrings",
    slug: "crystal-drop-emerald-earrings",
    sku: "SJ-1002",
    categoryId: "cat-earrings",
    categoryName: "Earrings",
    description: "Stunning faceted emerald green drop stones framed by brilliant micro-pave cubic zirconia crystals.",
    shortDescription: "Faceted emerald drop stones framed by micro-pave crystals.",
    price: 799,
    mrp: 1499,
    discount: 47,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1000"
    ],
    stock: 18,
    lowStockThreshold: 4,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOffer: false,
    tags: ["Emerald", "Earrings", "Party", "Crystals"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Rose Gold Solitaire Cocktail Ring",
    slug: "rose-gold-solitaire-cocktail-ring",
    sku: "SJ-1003",
    categoryId: "cat-rings",
    categoryName: "Rings",
    description: "Adjustable rose gold plated ring featuring a high-brilliance central oval solitaire surrounded by halo pavé stones.",
    shortDescription: "Adjustable rose gold ring featuring high-brilliance oval solitaire.",
    price: 599,
    mrp: 1199,
    discount: 50,
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000"
    ],
    stock: 30,
    lowStockThreshold: 5,
    isActive: true,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    isOffer: true,
    tags: ["Rose Gold", "Solitaire", "Ring", "Adjustable"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    name: "Minimal Pearl & Gold Charm Bracelet",
    slug: "minimal-pearl-gold-charm-bracelet",
    sku: "SJ-1004",
    categoryId: "cat-bracelets",
    categoryName: "Bracelets",
    description: "Dainty 18k gold-toned chain woven with freshwater cultured pearls and gold coin charms.",
    shortDescription: "Dainty gold chain woven with freshwater pearls and coin charms.",
    price: 699,
    mrp: 1299,
    discount: 46,
    images: [
      "https://images.unsplash.com/photo-1611591475140-be38b738e2d6?auto=format&fit=crop&q=80&w=1000"
    ],
    stock: 12,
    lowStockThreshold: 3,
    isActive: true,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isOffer: false,
    tags: ["Pearl", "Bracelet", "Minimal", "Gold"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    name: "Luxury Rose Gold Fashion Watch",
    slug: "luxury-rose-gold-fashion-watch",
    sku: "SJ-1005",
    categoryId: "cat-watches",
    categoryName: "Watches",
    description: "Japanese movement stainless steel mesh watch with crystal hour markers and rose gold bezel finish.",
    shortDescription: "Rose gold mesh watch with crystal hour markers & sleek dial.",
    price: 1899,
    mrp: 3499,
    discount: 46,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000"
    ],
    stock: 8,
    lowStockThreshold: 3,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isOffer: true,
    tags: ["Watch", "Rose Gold", "Luxury", "Gift"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    name: "Grand Royal Bridal Jewellery Set",
    slug: "grand-royal-bridal-jewellery-set",
    sku: "SJ-1006",
    categoryId: "cat-jewellery-sets",
    categoryName: "Jewellery Sets",
    description: "Complete grand bridal collection: Long Rani Haar, Choker Necklace, Jhumkas, Maang Tikka & Hathphool.",
    shortDescription: "Complete bridal set featuring Rani Haar, Choker, Jhumkas & Maang Tikka.",
    price: 3499,
    mrp: 6999,
    discount: 50,
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000"
    ],
    stock: 4,
    lowStockThreshold: 2,
    isActive: true,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isOffer: false,
    tags: ["Bridal", "Jewellery Set", "Grand", "Wedding"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_OFFERS: Offer[] = [
  {
    id: "offer-1",
    title: "Festive Glamour Sale",
    description: "Get flat 50% discount on all Kundan & Polki Bridal Sets. Extra special gifts on orders above ₹2000.",
    discount: "FLAT 50% OFF",
    couponText: "SOVIK50",
    bannerImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200",
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    isActive: true,
    ctaText: "Shop Sale",
    ctaLink: "/shop",
    createdAt: new Date().toISOString()
  },
  {
    id: "offer-2",
    title: "Earrings Special combo",
    description: "Buy any 2 Statement Earrings and get 20% cashback or discount on WhatsApp checkout.",
    discount: "BUY 2 GET 20% OFF",
    couponText: "EARRINGS20",
    bannerImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    isActive: true,
    ctaText: "Explore Earrings",
    ctaLink: "/category/earrings",
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_POPUPS: Popup[] = [
  {
    id: "popup-1",
    title: "Exclusive Festivity Collection",
    description: "Subscribe or Order on WhatsApp today to claim free shipping on your first purchase!",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    buttonText: "SHOP NOW",
    buttonUrl: "/shop",
    isActive: true,
    delaySeconds: 3,
    frequency: "once_per_session",
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: "insta-1",
    postUrl: "https://instagram.com/sovikjewels",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    caption: "The Royal Kundan choker set shining bright in classic pearls. ✨ #SovikJewels #KundanStyle",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "insta-2",
    postUrl: "https://instagram.com/sovikjewels",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
    caption: "Elegance in emerald. Faceted stones designed for statement nights. 💚 #SovikEarrings",
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "insta-3",
    postUrl: "https://instagram.com/sovikjewels",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600",
    caption: "Solitaire perfection on your fingers. Adjustable rose gold cocktail ring. 💍",
    displayOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "insta-4",
    postUrl: "https://instagram.com/sovikjewels",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
    caption: "Timeless rose gold mesh watch to complete your everyday luxury wardrobe. ⌚",
    displayOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    customerName: "Ananya Sharma",
    customerImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    title: "Absolutely Stunning Craftsmanship!",
    text: "I ordered the Royal Kundan set for my cousin's wedding. The quality and weight exceeded my expectations! Ordering via WhatsApp was super convenient and quick.",
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-2",
    customerName: "Priyanka Mehta",
    customerImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    title: "Looks Like Real Gold!",
    text: "The finish of the rose gold watch and solitaire ring is flawless. Highly recommend Sovik Jewels for quick WhatsApp ordering and prompt tracking.",
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-3",
    customerName: "Riya Verma",
    customerImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    rating: 5,
    title: "Fast Delivery & Great Packaging",
    text: "Received the item within 3 days with a beautiful velvet jewellery pouch. The tracking link was accurate. Will definitely shop again!",
    isApproved: true,
    createdAt: new Date().toISOString()
  }
];
