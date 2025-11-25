import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

// --- SETUP ENV ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// --- DEBUG LOGS ---
console.log('------------------------------------------------');
console.log('🔍 CHECKING API KEYS STATUS:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ MISSING');
console.log(
  'SHOPIFY_TOKEN:',
  process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? '✅ Loaded' : '❌ MISSING'
);
console.log(
  'SHOPIFY_STORE:',
  process.env.SHOPIFY_STORE_DOMAIN ? '✅ Loaded' : '❌ MISSING'
);
console.log(
  'IG_ACCESS_TOKEN:',
  process.env.IG_ACCESS_TOKEN ? '✅ Loaded' : '❌ MISSING'
);
console.log(
  'IMGBB_API_KEY:',
  process.env.IMGBB_API_KEY ? '✅ Loaded' : '❌ MISSING'
);
console.log('------------------------------------------------');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ======================================================================
// 1) DATABASE
// ======================================================================
const MONGO_URI = process.env.MONGO_URI;

const CampaignSchema = new mongoose.Schema({
  name: String,
  platform: String,
  format: String,
  headline: String,
  caption: String,
  imageUrl: String,
  status: { type: String, default: 'Live' },
  createdAt: { type: Date, default: Date.now }
});

const Campaign = mongoose.model('Campaign', CampaignSchema);

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB Connected');
    })
    .catch(err => console.error('❌ MongoDB Error:', err));
} else {
  console.warn('⚠️ MONGO_URI missing, MongoDB not connected');
}

// ======================================================================
// 2) SHOPIFY CONFIG
// ======================================================================
const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

// ======================================================================
// 3) ROUTES – SHOPIFY
// ======================================================================

// 1. GET REAL PRODUCTS FROM SHOPIFY
app.get('/api/products', async (req, res) => {
  try {
    if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
      return res
        .status(500)
        .json({ error: 'Shopify credentials missing in .env' });
    }

    const search = req.query.search || '';
    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}/products.json?limit=10&title=${encodeURIComponent(
      search
    )}`;

    const response = await axios.get(url, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
    });

    const products = response.data.products.map(p => ({
      id: p.id,
      name: p.title,
      image:
        p.images.length > 0
          ? p.images[0].src
          : 'https://via.placeholder.com/150'
    }));

    res.json(products);
  } catch (error) {
    console.error('Shopify Fetch Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch products from Shopify' });
  }
});

// 2. GET COLLECTIONS (Smart + Custom)
app.get('/api/collections', async (req, res) => {
  try {
    const search = req.query.search || '';

    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}/smart_collections.json?limit=10&title=${encodeURIComponent(
      search
    )}`;
    const response = await axios.get(url, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
    });

    const collections = response.data.smart_collections.map(c => ({
      id: c.id,
      name: c.title,
      image: c.image ? c.image.src : 'https://via.placeholder.com/150'
    }));

    res.json(collections);
  } catch (error) {
    // fallback to custom collections
    try {
      const search = req.query.search || '';
      const url2 = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}/custom_collections.json?limit=10&title=${encodeURIComponent(
        search
      )}`;
      const response2 = await axios.get(url2, {
        headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
      });
      const collections2 = response2.data.custom_collections.map(c => ({
        id: c.id,
        name: c.title,
        image: c.image ? c.image.src : 'https://via.placeholder.com/150'
      }));
      res.json(collections2);
    } catch (e) {
      console.error('Shopify Collection Error:', e.message);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  }
});

// ======================================================================
// 4) AI SUGGESTIONS (Mocked for Speed)
// ======================================================================
app.post('/api/suggest-poster-text', (req, res) =>
  res.json({
    candidates: [{ content: { parts: [{ text: 'Limited Time Offer!' }] } }]
  })
);

app.post('/api/suggest-caption', (req, res) =>
  res.json({
    candidates: [
      {
        content: {
          parts: [{ text: "Don't miss out on this exclusive deal. Shop now!" }]
        }
      }
    ]
  })
);

app.post('/api/add-hashtags', (req, res) =>
  res.json({
    candidates: [
      {
        content: {
          parts: [{ text: '#Shopify #Deals #Trending' }]
        }
      }
    ]
  })
);

// ======================================================================
// 5) REAL PUBLISH API (ImgBB -> Instagram)
// ======================================================================
async function uploadToImgBB(base64Image) {
  const IMGBB_KEY = process.env.IMGBB_API_KEY;
  if (!IMGBB_KEY) throw new Error('ImgBB API Key Missing');

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const formData = new FormData();
  formData.append('image', cleanBase64);

  const res = await axios.post(
    `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
    formData,
    {
      headers: formData.getHeaders()
    }
  );
  return res.data.data.url;
}

app.post('/api/publish', async (req, res) => {
  const { platform, format, headline, caption, imageUrl } = req.body;
  console.log(`🚀 Publishing to ${platform}...`);

  try {
    let successMessage = 'Saved Successfully';

    if (platform.toLowerCase().includes('insta')) {
      const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
      const IG_ID = process.env.IG_USER_ID;

      if (!IG_TOKEN || !IG_ID) throw new Error('Instagram Keys Missing in .env');

      console.log('1️⃣ Uploading Image...');
      const publicUrl = await uploadToImgBB(imageUrl);

      console.log('2️⃣ Creating Container...');
      const mediaUrl = `https://graph.facebook.com/v18.0/${IG_ID}/media`;
      const isStory = format.toLowerCase().includes('story');

      const containerRes = await axios.post(
        mediaUrl,
        {
          image_url: publicUrl,
          caption: caption,
          access_token: IG_TOKEN,
          media_type: isStory ? 'STORIES' : 'IMAGE'
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('3️⃣ Publishing...');
      await axios.post(
        `https://graph.facebook.com/v18.0/${IG_ID}/media_publish`,
        {
          creation_id: containerRes.data.id,
          access_token: IG_TOKEN
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      successMessage = '🎉 Posted to Instagram!';
    }

    const newCampaign = new Campaign({
      name: `${platform} Ad - ${new Date().toLocaleTimeString()}`,
      platform,
      format,
      headline,
      caption,
      imageUrl,
      status: 'Live'
    });
    await newCampaign.save();

    res.json({ success: true, message: successMessage });
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================================================================
// 6) LIVE INSTAGRAM POST – SIMPLE DEMO (HOME CARD)
// ======================================================================
//
// GET /api/live-post  -> Home dashboard me Puma style card ke liye
// ye sirf ek fake state hai jo dheere-dheere likes/comments badhata hai
//
let livePostState = {
  imageUrl:
    'https://images.pexels.com/photos/3760259/pexels-photo-3760259.jpeg?auto=compress&cs=tinysrgb&w=800',
  caption:
    'Run in style. PUMA Velocity Nitro 4 out now, only at PUMA.com, App & stores. #GoWild',
  baseLikes: 460,
  baseComments: 20,
  currentLikes: 460,
  currentComments: 20,
  lastUpdated: Date.now()
};

app.get('/api/live-post', (req, res) => {
  const now = Date.now();
  const diffMs = now - livePostState.lastUpdated;

  // har 10s ke baad thoda-thoda badhao
  if (diffMs > 10000) {
    const likeInc =
      Math.random() < 0.6 ? Math.floor(Math.random() * 3) : 0; // 0–2
    const commentInc = Math.random() < 0.25 ? 1 : 0;

    livePostState.currentLikes += likeInc;
    livePostState.currentComments += commentInc;
    livePostState.lastUpdated = now;
  }

  res.json(livePostState);
});

// ======================================================================
// 6A) LIVE INSTAGRAM TRACKING – CAMPAIGN DETAIL (LINK PASTE)
// ======================================================================
//
// POST /api/live-post { url }
//
//  - front-end se URL aata hai
//  - hum ek simple in-memory cache me store karte hain
//  - pehli baar try karte hain real page se og:image / caption / likes nikalne ka
//    (agar fail hua toh placeholder use karte hain)
//  - baad me har call pe numbers thoda-thoda bump hote rehte hain
//

const trackedPosts = {}; // key: url -> state

async function fetchInstagramPostData(postUrl) {
  const res = await axios.get(postUrl, {
    headers: {
      // normal browser jaisa user-agent, scraping thoda stable rahe
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const html = res.data;

  const likesMatch = html.match(
    /"edge_media_preview_like":\{"count":(\d+)}/
  );
  const commentsMatch = html.match(
    /"edge_media_to_parent_comment":\{"count":(\d+)}/
  );

  const ogImageMatch = html.match(
    /property="og:image" content="([^"]+)"/
  );
  const ogTitleMatch = html.match(
    /property="og:title" content="([^"]+)"/
  );
  const ogDescMatch = html.match(
    /property="og:description" content="([^"]+)"/
  );

  return {
    imageUrl: ogImageMatch ? ogImageMatch[1] : null,
    caption: ogTitleMatch
      ? ogTitleMatch[1]
      : ogDescMatch
      ? ogDescMatch[1]
      : '',
    likes: likesMatch ? parseInt(likesMatch[1], 10) : 0,
    comments: commentsMatch ? parseInt(commentsMatch[1], 10) : 0
  };
}

function bumpCounts(post) {
  const now = Date.now();
  const diffMs = now - post.lastUpdated;

  if (diffMs < 8000) return post; // 8s se kam hua toh same raha

  const likeInc =
    Math.random() < 0.6 ? Math.floor(Math.random() * 3) : 0;
  const commentInc = Math.random() < 0.25 ? 1 : 0;

  post.currentLikes += likeInc;
  post.currentComments += commentInc;
  post.lastUpdated = now;
  return post;
}

app.post('/api/live-post', async (req, res) => {
  const postUrl = (req.body?.url || '').trim();

  if (!postUrl || !postUrl.startsWith('http')) {
    return res.status(400).json({ error: 'Valid Instagram URL required' });
  }

  try {
    let state = trackedPosts[postUrl];

    // pehli baar: scrape / fallback
    if (!state) {
      console.log('🌐 First time tracking this URL:', postUrl);
      let meta;
      try {
        meta = await fetchInstagramPostData(postUrl);
      } catch (e) {
        console.warn(
          '⚠️ Scrape failed, using placeholder data:',
          e.message
        );
        meta = {
          imageUrl:
            'https://images.pexels.com/photos/3760259/pexels-photo-3760259.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Instagram post (demo)',
          likes: 460,
          comments: 20
        };
      }

      state = {
        url: postUrl,
        imageUrl: meta.imageUrl,
        caption: meta.caption,
        baseLikes: meta.likes,
        baseComments: meta.comments,
        currentLikes: meta.likes,
        currentComments: meta.comments,
        lastUpdated: Date.now()
      };
      trackedPosts[postUrl] = state;
    } else {
      // repeat calls → thoda growth
      bumpCounts(state);
    }

    res.json(state);
  } catch (err) {
    console.error('live-post POST error', err);
    res.status(500).json({
      error: 'Failed to track Instagram post',
      details: err.message
    });
  }
});

// ======================================================================
// 7) DATA FETCHING (campaign list / ads)
// ======================================================================
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

app.get('/api/ads', async (req, res) => {
  try {
    const ads = await Campaign.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// ======================================================================
// 8) CHANNELS (simple mock)
// ======================================================================
app.get('/api/channels', (req, res) =>
  res.json([{ platformId: 'meta', isConnected: true }])
);

app.post('/api/channels/connect', (req, res) =>
  res.json({ success: true })
);

// ======================================================================
// 9) START SERVER
// ======================================================================
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
