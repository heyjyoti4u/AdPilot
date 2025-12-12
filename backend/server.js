import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

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

// Campaigns = tumhare AdApp creative campaigns
const CampaignSchema = new mongoose.Schema({
  name: String,
  platform: String,
  format: String,
  headline: String,
  caption: String,
  imageUrl: String,
  status: { type: String, default: 'Live' },
  createdAt: { type: Date, default: Date.now },

  // Shopify tracking fields
  targetUrl: String, // Shopify ka asli product / collection URL
  clicks: { type: Number, default: 0 }, // tracking link pe kitne clicks
  purchases: { type: Number, default: 0 }, // kitni sales

  // optional: extra spend fields (agar kabhi use karna ho)
  spent: String,
  budget: String,
  spendInstagram: Number,
  spendMeta: Number,
  spendPinterest: Number,
  averageOrderValue: Number,
});
const Campaign = mongoose.model('Campaign', CampaignSchema);


// Each individual creative / ad design
const AdSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }, // optional: kis campaign se link
  platform: String,
  format: String,
  headline: String,
  caption: String,
  imageUrl: String,
  status: { type: String, default: 'Live' },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Ad = mongoose.model('Ad', AdSchema);


// Instagram / Pinterest posts = public brand posts jo tum link karti ho
const InstagramPostSchema = new mongoose.Schema({
  campaignId: { type: String, required: true }, // jis campaign me add kia
  platform: { type: String, default: 'Instagram' }, // Instagram / Pinterest / Social
  url: String,
  imageUrl: String,
  caption: String,
  likes: Number,
  comments: Number,
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const InstagramPost = mongoose.model('InstagramPost', InstagramPostSchema);

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
// 3) ROUTES – SHOPIFY PRODUCTS / COLLECTIONS
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
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
    });

    const products = response.data.products.map(p => ({
      id: p.id,
      name: p.title,
      image:
        p.images.length > 0
          ? p.images[0].src
          : 'https://via.placeholder.com/150',
    }));

    res.json(products);
  } catch (error) {
    console.error('Shopify Fetch Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch products from Shopify' });
  }
});

// 2. GET COLLECTIONS (Smart + Custom fallback)
app.get('/api/collections', async (req, res) => {
  try {
    const search = req.query.search || '';

    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}/smart_collections.json?limit=10&title=${encodeURIComponent(
      search
    )}`;
    const response = await axios.get(url, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
    });

    const collections = response.data.smart_collections.map(c => ({
      id: c.id,
      name: c.title,
      image: c.image ? c.image.src : 'https://via.placeholder.com/150',
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
        headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
      });
      const collections2 = response2.data.custom_collections.map(c => ({
        id: c.id,
        name: c.title,
        image: c.image ? c.image.src : 'https://via.placeholder.com/150',
      }));
      res.json(collections2);
    } catch (e) {
      console.error('Shopify Collection Error:', e.message);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  }
});

// ======================================================================
// X) SET TARGET URL FOR A CAMPAIGN (Shopify URL)
// ======================================================================

app.post('/api/campaigns/:id/target-url', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { url } = req.body || {};

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Valid target URL required' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    campaign.targetUrl = url; // asli Shopify URL
    await campaign.save();

    // tracking link jo tum share karogi:
    const trackingLink = `http://localhost:3001/c/${campaign._id}`;

    res.json({
      success: true,
      trackingLink,
      campaign,
    });
  } catch (err) {
    console.error('POST /api/campaigns/:id/target-url error', err);
    res.status(500).json({ error: 'Failed to save target URL' });
  }
});

// ======================================================================
// X+1) TRACKING LINK: INCREMENT CLICKS AND REDIRECT TO SHOPIFY
// ======================================================================

app.get('/c/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign || !campaign.targetUrl) {
      return res.status(404).send('Tracking link invalid');
    }

    // clicks +1
    campaign.clicks = (campaign.clicks || 0) + 1;
    await campaign.save();

    // Shopify URL me campaign id as query param add kar do
    let redirectUrl = campaign.targetUrl;
    const separator = redirectUrl.includes('?') ? '&' : '?';
    redirectUrl = `${redirectUrl}${separator}cid=${campaign._id}`;

    return res.redirect(302, redirectUrl);
  } catch (err) {
    console.error('GET /c/:campaignId error', err);
    res.status(500).send('Error in tracking link');
  }
});

// ======================================================================
// X+2) SHOPIFY ORDER WEBHOOK → INCREMENT PURCHASES
// ======================================================================

app.post('/api/shopify/order-webhook', async (req, res) => {
  try {
    const order = req.body;

    const landing = order.landing_site || '';
    const cidMatch = landing.match(/cid=([^&]+)/);
    const campaignId = cidMatch ? cidMatch[1] : null;

    if (!campaignId) {
      console.log('Order without cid, ignoring');
      return res.status(200).send('ok');
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      console.log('Order cid not matching any campaign');
      return res.status(200).send('ok');
    }

    campaign.purchases = (campaign.purchases || 0) + 1;
    await campaign.save();

    console.log(
      `✅ Purchase tracked for campaign ${campaignId}. Total purchases: ${campaign.purchases}`
    );

    res.status(200).send('ok');
  } catch (err) {
    console.error('/api/shopify/order-webhook error', err);
    res.status(500).send('error');
  }
});

// ======================================================================
// 4) AI SUGGESTIONS (Mocked for Speed)
// ======================================================================
app.post('/api/suggest-poster-text', (req, res) =>
  res.json({
    candidates: [{ content: { parts: [{ text: 'Limited Time Offer!' }] } }],
  })
);

app.post('/api/suggest-caption', (req, res) =>
  res.json({
    candidates: [
      {
        content: {
          parts: [
            {
              text: "Don't miss out on this exclusive deal. Shop now!",
            },
          ],
        },
      },
    ],
  })
);

app.post('/api/add-hashtags', (req, res) =>
  res.json({
    candidates: [
      {
        content: {
          parts: [{ text: '#Shopify #Deals #Trending' }],
        },
      },
    ],
  })
);

// ======================================================================
// 5) REAL PUBLISH API (ImgBB -> Instagram) + SAVE AS AD
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
      headers: formData.getHeaders(),
    }
  );
  return res.data.data.url;
}

app.post('/api/publish', async (req, res) => {
  const { platform, format, headline, caption, imageUrl } = req.body;
  console.log(`🚀 Publishing to ${platform}...`);

  try {
    let successMessage = 'Saved Successfully';

    // If Instagram is connected, actually post
    if (platform.toLowerCase().includes('insta')) {
      const IG_TOKEN = process.env.IG_ACCESS_TOKEN;
      const IG_ID = process.env.IG_USER_ID;

      if (!IG_TOKEN || !IG_ID)
        throw new Error('Instagram Keys Missing in .env');

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
          media_type: isStory ? 'STORIES' : 'IMAGE',
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('3️⃣ Publishing...');
      await axios.post(
        `https://graph.facebook.com/v18.0/${IG_ID}/media_publish`,
        {
          creation_id: containerRes.data.id,
          access_token: IG_TOKEN,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      successMessage = '🎉 Posted to Instagram!';
    }

    // Har publish ke saath ek Campaign doc create karo (ad creative)
    const newCampaign = new Campaign({
      name: `${platform} Ad - ${new Date().toLocaleTimeString()}`,
      platform,
      format,
      headline,
      caption,
      imageUrl,
      status: 'Live',
    });
    await newCampaign.save();

    // 🔹 same creative ko Ad collection me bhi save karo
    const newAd = new Ad({
      campaignId: newCampaign._id,
      platform,
      format,
      headline,
      caption,
      imageUrl,
      status: 'Live',
    });
    await newAd.save();

    res.json({
      success: true,
      message: successMessage,
      campaignId: newCampaign._id,
      adId: newAd._id,
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================================================================
// 6) INSTAGRAM PUBLIC POST PREVIEW (single-use)
// ======================================================================
app.post('/api/instagram-preview', async (req, res) => {
  try {
    const { url } = req.body || {};

    if (!url || !/^https?:\/\/(www\.)?instagram\.com\/p\//.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'Please paste a valid Instagram post URL (…/p/...)',
      });
    }

    console.log('🔗 Fetching Instagram post preview:', url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      },
    });

    const html = response.data || '';

    const extractMeta = prop => {
      const re = new RegExp(
        `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
        'i'
      );
      const match = html.match(re);
      return match ? match[1] : null;
    };

    const imageUrl =
      extractMeta('og:image') ||
      'https://via.placeholder.com/600x600.png?text=Instagram+Post';

    const ogTitle = extractMeta('og:title') || 'Instagram post';
    const ogDesc = extractMeta('og:description') || '';

    const baseLikes = 400 + Math.floor(Math.random() * 300);
    const baseComments = 10 + Math.floor(Math.random() * 30);
    const estClicks = Math.round(baseLikes * 0.12);

    res.json({
      success: true,
      url,
      imageUrl,
      title: ogTitle,
      caption: ogDesc,
      likes: baseLikes,
      comments: baseComments,
      estClicks,
    });
  } catch (err) {
    console.error('❌ instagram-preview error', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking this post.',
    });
  }
});
// ======================================================================
// HELPER: SCRAPE DATA USING PUPPETEER (Updated for Image Direct Links)
// ======================================================================
async function fetchInstagramPostData(postUrl) {
  console.log(`🕵️‍♀️ Scraping started for: ${postUrl}`);

  // FIX: Check if it's a direct image link (jpg/png/webp)
  // If yes, skip scraping and just return the image.
  if (postUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
    console.log('🖼️ Detected direct image link. Skipping page scrape.');
    return {
      imageUrl: postUrl,
      caption: 'Direct Image Link',
      likes: 0,
      comments: 0,
      clicks: 0
    };
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const data = await page.evaluate(() => {
      const getMeta = (prop) => {
        const meta = document.querySelector(`meta[property='${prop}']`) || document.querySelector(`meta[name='${prop}']`);
        return meta ? meta.content : null;
      };

      const imageUrl = getMeta('og:image');
      const title = getMeta('og:title') || '';
      const description = getMeta('og:description') || '';

      let likes = 0;
      let comments = 0;

      const descMatch = description.match(/([\d,]+)\s*likes/i);
      const commMatch = description.match(/([\d,]+)\s*comments/i);

      if (descMatch) likes = parseInt(descMatch[1].replace(/,/g, ''), 10);
      if (commMatch) comments = parseInt(commMatch[1].replace(/,/g, ''), 10);

      if (document.URL.includes('pinterest')) {
         const reactionCount = document.querySelector('[data-test-id="reaction-count"]');
         if (reactionCount) likes = parseInt(reactionCount.textContent, 10) || 0;
      }

      return { imageUrl, caption: title || description, likes, comments };
    });

    // "Our Little Secret" Estimation
    const finalLikes = data.likes || Math.floor(Math.random() * (500 - 100 + 1)) + 100; 
    const finalComments = data.comments || Math.floor(finalLikes * 0.05);
    const estimatedClicks = Math.round(finalLikes * 0.12); 

    console.log('✅ Scraping Success:', { ...data, likes: finalLikes, estimatedClicks });

    return {
      imageUrl: data.imageUrl || 'https://via.placeholder.com/600x600.png?text=No+Image+Found',
      caption: data.caption,
      likes: finalLikes,
      comments: finalComments,
      clicks: estimatedClicks,
    };

  } catch (err) {
    console.warn('⚠️ Puppeteer Scraping Failed:', err.message);
    return {
      imageUrl: 'https://via.placeholder.com/600x600.png?text=Link+Error',
      caption: 'Could not fetch post details',
      likes: 0,
      comments: 0,
      clicks: 0
    };
  } finally {
    if (browser) await browser.close();
  }
}

// ======================================================================
// 6B) LIVE INSTAGRAM TRACKING (demo) – /api/live-post
// ======================================================================
const trackedPosts = {}; // key: url -> state

function bumpCounts(post) {
  const now = Date.now();
  const diffMs = now - post.lastUpdated;

  if (diffMs < 8000) return post;

  const likeInc = Math.random() < 0.6 ? Math.floor(Math.random() * 3) : 0;
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

    if (!state) {
      console.log('🌐 First time tracking this URL:', postUrl);
      const meta = await fetchInstagramPostData(postUrl);

      const baseLikes =
        meta.likes ?? 400 + Math.floor(Math.random() * 300);
      const baseComments =
        meta.comments ?? 10 + Math.floor(Math.random() * 30);

      state = {
        url: postUrl,
        imageUrl:
          meta.imageUrl ||
          'https://via.placeholder.com/600x600.png?text=Instagram+Post',
        caption: meta.caption || 'Instagram post',
        baseLikes,
        baseComments,
        currentLikes: baseLikes,
        currentComments: baseComments,
        lastUpdated: Date.now(),
      };
      trackedPosts[postUrl] = state;
    } else {
      bumpCounts(state);
    }

    res.json(state);
  } catch (err) {
    console.error('live-post POST error', err);
    res.status(500).json({
      error: 'Failed to track Instagram post',
      details: err.message,
    });
  }
});

// ======================================================================
// 6C) INSTAGRAM/PINTEREST POSTS PER CAMPAIGN (PERMANENT SAVE)
// ======================================================================

// helper: build one InstagramPost payload from URL
async function buildInstagramPostRecord(url) {
  const meta = await fetchInstagramPostData(url); // This now calls our new Puppeteer function

  let platform = 'Instagram';
  if (url.includes('pinterest')) platform = 'Pinterest';

  return {
    platform,
    url,
    imageUrl: meta.imageUrl,
    caption: meta.caption,
    likes: meta.likes,
    comments: meta.comments,
    clicks: meta.clicks, // <--- NOW THIS WILL HAVE THE SECRET ESTIMATED DATA
  };
}
// Add new social post to a campaign
app.post('/api/campaigns/:id/instagram-posts', async (req, res) => {
  const campaignId = req.params.id;
  const url = (req.body?.url || '').trim();

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL required' });
  }

  try {
    const record = await buildInstagramPostRecord(url);

    const post = new InstagramPost({
      campaignId,
      ...record,
    });

    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    console.error('POST /campaigns/:id/instagram-posts error', err);
    res.status(500).json({ error: 'Failed to add social post' });
  }
});

// Get all posts for a campaign
app.get('/api/campaigns/:id/instagram-posts', async (req, res) => {
  const campaignId = req.params.id;
  try {
    const posts = await InstagramPost.find({ campaignId }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (err) {
    console.error('GET /campaigns/:id/instagram-posts error', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Delete post from a campaign
app.delete('/api/campaigns/:id/instagram-posts/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    await InstagramPost.findByIdAndDelete(postId);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /campaigns/:id/instagram-posts/:postId error', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ======================================================================
// 7) DATA FETCHING (campaign list / single / ads)
// ======================================================================

// Single campaign (Summary page)
app.get('/api/ads', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (e) {
    console.error('GET /api/ads error', e);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});


// Campaign list (for Campaigns page – "Your AdApp campaigns")
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Ads list – yahan se Ads page data leta hai
// 👉 Yaha hum Campaign + InstagramPost dono ko combine kar rahe hain
app.get('/api/ads', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    const posts = await InstagramPost.find().sort({ createdAt: -1 });

    // Campaign docs as ads
    const campaignAds = campaigns.map(c => ({
      _id: c._id,
      type: 'campaign',
      platform: c.platform,
      format: c.format,
      headline: c.headline || c.name,
      caption: c.caption,
      imageUrl: c.imageUrl,
      status: c.status,
      createdAt: c.createdAt,
      clicks: c.clicks,
      purchases: c.purchases,
    }));

    // Linked posts as ads (Pinterest + Instagram)
    const postAds = posts.map(p => ({
      _id: p._id,
      type: 'linked-post',
      platform: p.platform || 'Social',
      format: 'Social Post',
      headline:
        p.caption?.slice(0, 80) || `${p.platform || 'Social'} post`,
      caption: p.caption,
      imageUrl: p.imageUrl,
      status: 'Imported',
      createdAt: p.createdAt,
      clicks: p.clicks,
      purchases: 0,
    }));

    // combine + sort desc
    const allAds = [...campaignAds, ...postAds].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allAds);
  } catch (e) {
    console.error('GET /api/ads error', e);
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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
