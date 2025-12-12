import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3001';

export default function CampaignDetail({
  campaign,
  ads = [],
  onBack,
  onUpdateMeta,
  onShowSummary,
}) {
  if (!campaign) return null;

  const campaignId = campaign._id || campaign.id;

  // ==========================
  // 1. IMAGE STATE (New Feature: Edit Cover)
  // ==========================
  const initialImage =
    campaign.primaryImage ||
    campaign.imageUrl ||
    campaign.image ||
    campaign.cover ||
    '';
    
  const [coverImage, setCoverImage] = useState(initialImage);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // ==========================
  // 2. BASIC CAMPAIGN STATE
  // ==========================
  const [name, setName] = useState(campaign.name || campaign.headline || '');
  const [startDate, setStartDate] = useState(campaign.startDate || '');
  const [endDate, setEndDate] = useState(campaign.endDate || '');
  const [selectedAd, setSelectedAd] = useState(null);

  // ==========================
  // 3. SOCIAL POSTS STATE
  // ==========================
  const [igPosts, setIgPosts] = useState([]);
  const [igUrlInput, setIgUrlInput] = useState('');
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [igError, setIgError] = useState('');

  // ==========================
  // 4. TRACKING STATE (New Feature: Platform Tabs)
  // ==========================
  const [activeTrackingPlatform, setActiveTrackingPlatform] = useState('instagram'); 
  const [shopifyUrl, setShopifyUrl] = useState(campaign.targetUrl || '');
  const [trackingLink, setTrackingLink] = useState(
    campaign.trackingSlug && campaign._id
      ? `${BACKEND_URL}/c/${campaign.trackingSlug}`
      : campaign._id
      ? `${BACKEND_URL}/c/${campaign._id}`
      : ''
  );
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  // ==========================
  // 5. UI/FILTER STATE
  // ==========================
  const [showInlineSummary, setShowInlineSummary] = useState(false);
  const [activeAdChannel, setActiveAdChannel] = useState('instagram');
  const [adFilter, setAdFilter] = useState('all'); 

  // ==========================
  // USE EFFECT: INIT DATA
  // ==========================
  useEffect(() => {
    setName(campaign.name || campaign.headline || '');
    setStartDate(campaign.startDate || '');
    setEndDate(campaign.endDate || '');
    
    setCoverImage(
      campaign.primaryImage ||
      campaign.imageUrl ||
      campaign.image ||
      campaign.cover ||
      ''
    );
    
    setSelectedAd(null);
    setIgError('');
    setIgUrlInput('');
    setShowInlineSummary(false);
    setActiveAdChannel('instagram');
    setActiveTrackingPlatform('instagram');
    setAdFilter('all');

    setShopifyUrl(campaign.targetUrl || '');
    setTrackingLink(
      campaign.trackingSlug && campaign._id
        ? `${BACKEND_URL}/c/${campaign.trackingSlug}`
        : campaign._id
        ? `${BACKEND_URL}/c/${campaign._id}`
        : ''
    );

    if (campaignId) {
      fetchInstagramPosts(campaignId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  // ==========================
  // HELPER FUNCTIONS
  // ==========================

  // Slugify for CSV filename (Restored)
  const slugify = (str) =>
    (str || 'campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const getTrackingLinkForPlatform = (platform) => {
    if (!trackingLink) return '';
    return `${trackingLink}?src=${platform}`;
  };
  const currentDisplayedTrackingLink = getTrackingLinkForPlatform(activeTrackingPlatform);

  const handleSaveCoverImage = () => {
    if (tempImageUrl.trim()) {
      setCoverImage(tempImageUrl.trim());
      if(onUpdateMeta) {
        onUpdateMeta({ ...campaign, imageUrl: tempImageUrl.trim() });
      }
    }
    setIsEditingImage(false);
  };

  const pushUpdate = (newName, newStart, newEnd) => {
    if (!onUpdateMeta) return;
    onUpdateMeta({ name: newName, startDate: newStart, endDate: newEnd });
  };
  const handleNameBlur = () => pushUpdate(name, startDate, endDate);
  const handleDatesBlur = () => pushUpdate(name, startDate, endDate);

  // ==========================
  // API ACTIONS
  // ==========================

  const fetchInstagramPosts = async (campId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/campaigns/${campId}/instagram-posts`
      );
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setIgPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setIgPosts([]);
    }
  };

  const handleAddInstagramPost = async () => {
    if (!igUrlInput.trim() || !campaignId) return;

    setIsAddingPost(true);
    setIgError('');

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/campaigns/${campaignId}/instagram-posts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: igUrlInput.trim() }),
        }
      );

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to add post');
      }

      const json = await res.json();

      if (Array.isArray(json)) {
        setIgPosts(json);
      } else if (json.post) {
        setIgPosts((prev) => [json.post, ...prev]);
      }

      setIgUrlInput('');
    } catch (err) {
      console.error(err);
      setIgError(err.message || 'Server error while adding post.');
    } finally {
      setIsAddingPost(false);
    }
  };

  const handleDeleteInstagramPost = async (postId) => {
    if (!campaignId || !postId) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/campaigns/${campaignId}/instagram-posts/${postId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete post');
      setIgPosts((prev) => prev.filter((p) => p._id !== postId));
      if (selectedAd && selectedAd._id === postId) {
        setSelectedAd(null);
      }
    } catch (err) {
      console.error(err);
      alert('Could not delete post.');
    }
  };

  const saveShopifyUrl = async () => {
    if (!campaignId || !shopifyUrl.trim()) return;
    setIsSavingTarget(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/campaigns/${campaignId}/target-url`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: shopifyUrl.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save URL');

      const serverTracking = data.trackingLink || data.trackingUrl || data.url || '';
      if (serverTracking) setTrackingLink(serverTracking);
      else setTrackingLink(`${BACKEND_URL}/c/${campaignId}`);

      if (onUpdateMeta && data.campaign) {
        onUpdateMeta({ ...campaign, ...data.campaign });
      }
      alert('Tracking link saved!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSavingTarget(false);
    }
  };

  // ==========================
  // DATA MERGING & CALCULATIONS
  // ==========================
  
  // 1. Map Instagram Posts (with Correct Platform Check)
  const igAsAds = igPosts.map((p) => ({
    _id: p._id,
    isInstagramPost: true,
    platform: p.platform || 'Instagram', 
    headline: p.caption ? (p.caption.length > 30 ? p.caption.substring(0,30)+'...' : p.caption) : `${p.platform || 'Social'} Post`,
    caption: p.caption || '',
    imageUrl: p.imageUrl,
    likes: p.likes || 0,
    comments: p.comments || 0,
    clicks: p.clicks || 0,
    url: p.url,
  }));

  // 2. Map Regular Ads
  const regularAds = ads.map(ad => ({
    ...ad,
    platform: ad.platform || campaign.platform || 'Meta' 
  }));

  const allAdsUnfiltered = [...regularAds, ...igAsAds];

  // 3. Filter Logic (New Feature)
  const allAdsToShow = allAdsUnfiltered.filter(ad => {
    if (adFilter === 'all') return true;
    const p = (ad.platform || '').toLowerCase();
    if (adFilter === 'instagram') return p.includes('instagram');
    if (adFilter === 'meta') return p.includes('facebook') || p.includes('meta');
    if (adFilter === 'pinterest') return p.includes('pinterest');
    return true;
  });

  // 4. Totals Calculation
  const totalLikes = allAdsToShow.reduce((sum, ad) => sum + (ad.likes || 0), 0);
  const totalComments = allAdsToShow.reduce((sum, ad) => sum + (ad.comments || 0), 0);
  const totalClicks = allAdsToShow.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const totalAdsCount = allAdsToShow.length;

  const totalTrackedClicks = campaign.clicks || 0;
  const totalPurchases = campaign.purchases || 0;
  const hasTrackingClicks = (campaign.clicks || 0) > 0;
  const hasAdClicks = totalClicks > 0;
  const hasAnyRealClicks = hasTrackingClicks || hasAdClicks;
  
  const baseClicks = hasAnyRealClicks ? (campaign.clicks || totalClicks) : 0;

  // 5. Channel Breakdown Logic
  const instagramClicks = Math.round(baseClicks * 0.52);
  const metaClicks = Math.round(baseClicks * 0.3);
  const pinterestClicks = Math.max(baseClicks - (instagramClicks + metaClicks), 0);

  const avgOrderValue = campaign.averageOrderValue || 1800; 

  const instagramSales = Math.round(instagramClicks * 0.028); 
  const metaSales = Math.round(metaClicks * 0.023);
  const pinterestSales = Math.round(pinterestClicks * 0.019);

  const instagramRevenue = instagramSales * avgOrderValue;
  const metaRevenue = metaSales * avgOrderValue;
  const pinterestRevenue = pinterestSales * avgOrderValue;

  const channelPerformance = {
    instagram: {
      key: 'instagram',
      label: 'Instagram',
      clicks: instagramClicks,
      sales: instagramSales,
      revenue: instagramRevenue,
      cpc: campaign.spendInstagram && instagramClicks ? campaign.spendInstagram / instagramClicks : 6.5,
    },
    meta: {
      key: 'meta',
      label: 'Meta (Facebook)',
      clicks: metaClicks,
      sales: metaSales,
      revenue: metaRevenue,
      cpc: campaign.spendMeta && metaClicks ? campaign.spendMeta / metaClicks : 7.2,
    },
    pinterest: {
      key: 'pinterest',
      label: 'Pinterest',
      clicks: pinterestClicks,
      sales: pinterestSales,
      revenue: pinterestRevenue,
      cpc: campaign.spendPinterest && pinterestClicks ? campaign.spendPinterest / pinterestClicks : 5.8,
    },
  };

  const approxTotalSales = totalPurchases || instagramSales + metaSales + pinterestSales || 120;
  const monthlySummary = [
    { label: 'Jul', value: Math.round(approxTotalSales * 0.12) },
    { label: 'Aug', value: Math.round(approxTotalSales * 0.16) },
    { label: 'Sep', value: Math.round(approxTotalSales * 0.18) },
    { label: 'Oct', value: Math.round(approxTotalSales * 0.21) },
    { label: 'Nov', value: Math.round(approxTotalSales * 0.19) },
    { label: 'Dec', value: Math.round(approxTotalSales * 0.14) },
  ];
  const maxMonthly = Math.max(...monthlySummary.map((m) => m.value || 1));

  // ==========================
  // CSV DOWNLOAD (RESTORED)
  // ==========================
  const handleDownloadReport = () => {
    const campaignName = name || campaign.name || 'Campaign';
    const fileName = `${slugify(campaignName)}-summary.csv`;

    let csv = '';
    csv += `"Campaign Name","Brand","Platform","Status","Start Date","End Date","Total Likes","Total Comments","Total Estimated Clicks"\n`;
    csv += `"${campaignName.replace(/"/g, '""')}","${(campaign.brand || '').replace(/"/g, '""')}","${(campaign.platform || '').replace(/"/g, '""')}","${campaign.status || 'Live'}","${startDate}","${endDate}","${totalLikes}","${totalComments}","${totalClicks}"\n\n`;

    csv += `"Ad #","Ad Headline","Platform","Likes","Comments","Estimated Clicks"\n`;
    allAdsToShow.forEach((ad, index) => {
      const headline = (ad.headline || 'Untitled ad').replace(/"/g, '""');
      const platform = (ad.platform || 'Unknown').replace(/"/g, '""');
      csv += `"${index + 1}","${headline}","${platform}","${ad.likes || 0}","${ad.comments || 0}","${ad.clicks || 0}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShowSummary = () => {
    if (onShowSummary) {
      onShowSummary({ ...campaign, totalLikes, totalComments, totalClicks });
      return;
    }
    setShowInlineSummary(true);
    if (typeof window !== 'undefined') {
      window.location.hash = '#summary';
    }
  };

  // Selected Ad Logic
  const getSelectedAdChannelPerf = () => {
    if (!selectedAd) return null;
    const baseAdClicks = selectedAd.clicks || 0 || 500;
    const likeCount = selectedAd.likes || 0 || 1000;
    
    const map = {
      instagram: {
        label: 'Instagram',
        clicks: Math.round(baseAdClicks || likeCount * 0.18),
        ctr: likeCount > 0 ? (((baseAdClicks || likeCount * 0.18) / likeCount) * 100).toFixed(1) : '2.4',
        sales: Math.round((baseAdClicks || likeCount * 0.18) * 0.03),
        revenue: Math.round(((baseAdClicks || likeCount * 0.18) * 0.03 || 10) * avgOrderValue),
      },
      meta: {
        label: 'Meta (Facebook)',
        clicks: Math.round((baseAdClicks || likeCount * 0.18) * 0.7),
        ctr: likeCount > 0 ? ((((baseAdClicks || likeCount * 0.18) * 0.7) / likeCount) * 100).toFixed(1) : '2.1',
        sales: Math.round(((baseAdClicks || likeCount * 0.18) * 0.7) * 0.025),
        revenue: Math.round((((baseAdClicks || likeCount * 0.18) * 0.7) * 0.025 || 8) * avgOrderValue),
      },
      pinterest: {
        label: 'Pinterest',
        clicks: Math.round((baseAdClicks || likeCount * 0.18) * 0.45),
        ctr: likeCount > 0 ? ((((baseAdClicks || likeCount * 0.18) * 0.45) / likeCount) * 100).toFixed(1) : '1.8',
        sales: Math.round(((baseAdClicks || likeCount * 0.18) * 0.45) * 0.022),
        revenue: Math.round((((baseAdClicks || likeCount * 0.18) * 0.45) * 0.022 || 6) * avgOrderValue),
      },
    };
    return map[activeAdChannel];
  };

  const selectedAdChannelPerf = getSelectedAdChannelPerf();
  const selectedAdCtr = selectedAd && selectedAd.likes ? ((selectedAd.clicks || 0) / selectedAd.likes) * 100 : 0;

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto animate-slide-in-up">
      <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
        {/* Breadcrumb + Actions (RESTORED CSV BUTTON) */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button onClick={onBack} className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px]">← Campaigns</button>
            <span>/</span>
            <span className="font-semibold text-slate-700 line-clamp-1">{name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadReport} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm active:scale-[0.97] transition-transform">Download CSV</button>
            <button onClick={handleShowSummary} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-slate-900 text-white hover:bg-black shadow-sm active:scale-[0.97] transition-transform">Show summary →</button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="group relative w-32 h-32 bg-slate-900 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
            {coverImage ? (
              <img src={coverImage} alt="Campaign" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 bg-slate-50">No Image</div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <button onClick={() => setIsEditingImage(true)} className="text-[10px] text-white underline">Change Photo</button>
            </div>
          </div>

          <div className="flex-1">
            {isEditingImage && (
              <div className="mb-2 flex items-center gap-2 animate-fade-in">
                <input type="text" placeholder="Paste image URL" className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded" value={tempImageUrl} onChange={(e) => setTempImageUrl(e.target.value)} />
                <button onClick={handleSaveCoverImage} className="px-2 py-1 bg-indigo-600 text-white text-xs rounded">Save</button>
                <button onClick={() => setIsEditingImage(false)} className="px-2 py-1 text-slate-500 text-xs">Cancel</button>
              </div>
            )}
            <input className="w-full text-2xl md:text-3xl font-bold text-slate-900 mb-1 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none pb-1" value={name} onChange={(e) => setName(e.target.value)} onBlur={handleNameBlur} placeholder="Campaign name" />
            <p className="text-xs text-slate-500 mb-3">{campaign.platform} · {campaign.brand || campaign.format}</p>
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">{campaign.caption || 'No caption available.'}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Start:</span>
                <input type="date" className="px-2 py-1 rounded-lg border border-slate-200 text-xs" value={startDate} onChange={(e) => setStartDate(e.target.value)} onBlur={handleDatesBlur} />
              </div>
              <div className="flex items-center gap-2">
                 <span className="font-semibold text-slate-700">End:</span>
                 <input type="date" className="px-2 py-1 rounded-lg border border-slate-200 text-xs" value={endDate} onChange={(e) => setEndDate(e.target.value)} onBlur={handleDatesBlur} />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold">● {campaign.status || 'Live'}</span>
            </div>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Total Ads</p>
            <p className="text-2xl font-bold text-slate-900">{totalAdsCount}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Total Likes</p>
            <p className="text-2xl font-bold text-indigo-600">{totalLikes.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Total Comments</p>
            <p className="text-2xl font-bold text-slate-900">{totalComments.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Estimated Clicks</p>
            <p className="text-2xl font-bold text-emerald-600">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        {/* Shopify Tracking Section (Updated with Tabs) */}
        {campaign._id && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Shopify Tracking & Attribution</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input type="text" value={shopifyUrl} onChange={(e) => setShopifyUrl(e.target.value)} placeholder="Paste Shopify product URL" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <button onClick={saveShopifyUrl} disabled={isSavingTarget || !shopifyUrl.trim()} className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">{isSavingTarget ? 'Saving…' : 'Save Link'}</button>
            </div>
            {trackingLink && (
              <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex gap-2 mb-3 border-b border-slate-200 pb-1">
                  {['instagram', 'meta', 'pinterest'].map(key => (
                    <button key={key} onClick={() => setActiveTrackingPlatform(key)} className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${activeTrackingPlatform === key ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>{key === 'instagram' ? 'Instagram' : key === 'meta' ? 'Meta / FB' : 'Pinterest'}</button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <input type="text" value={currentDisplayedTrackingLink} readOnly className="w-full px-3 py-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-mono" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-slate-100 px-1 rounded">?src={activeTrackingPlatform}</div>
                  </div>
                  <button type="button" onClick={() => { if(currentDisplayedTrackingLink) { navigator.clipboard.writeText(currentDisplayedTrackingLink); alert(`Copied ${activeTrackingPlatform} tracking link!`); } }} className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm active:scale-95 ${activeTrackingPlatform === 'instagram' ? 'bg-gradient-to-tr from-orange-400 to-pink-600' : activeTrackingPlatform === 'meta' ? 'bg-blue-600' : 'bg-red-600'}`}>Copy Link</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Channel Performance Cards */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
           <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Performance by channel</p>
              <p className="text-[11px] text-slate-500">Estimate of how much traffic & revenue each channel is contributing.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(channelPerformance).map((ch) => (
              <div key={ch.key} className="rounded-xl bg-white border border-slate-200 p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-800">{ch.label}</p>
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] border border-slate-200">Est.</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{ch.sales.toLocaleString()} orders · ₹{ch.revenue.toLocaleString()}</p>
                <div className="flex items-center justify-between mb-1"><span className="text-slate-500">Clicks</span><span className="font-semibold text-slate-900">{ch.clicks.toLocaleString()}</span></div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (ch.clicks / (baseClicks || 1)) * 100).toFixed(0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Inline Summary */}
        {showInlineSummary && (
          <div id="summary" className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-4">
              <div><h3 className="text-sm font-semibold text-slate-900">Campaign summary</h3><p className="text-[11px] text-slate-600">Monthly sales trend & overall revenue.</p></div>
              <button onClick={() => setShowInlineSummary(false)} className="text-[11px] text-slate-500">✕ Close</button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100"><p className="text-[11px] text-slate-500 mb-1">Approx. total sales</p><p className="text-2xl font-bold text-indigo-700">{approxTotalSales.toLocaleString()}</p></div>
                <div className="p-3 rounded-xl bg-white/80 border border-indigo-100"><p className="text-[11px] text-slate-500 mb-1">Est. campaign revenue</p><p className="text-2xl font-bold text-emerald-700">₹{(approxTotalSales * avgOrderValue).toLocaleString()}</p></div>
             </div>
             <div className="mt-2 flex items-end gap-3 h-24">
                {monthlySummary.map((m) => (<div key={m.label} className="flex-1 flex flex-col items-center justify-end gap-1"><div className="w-full bg-indigo-200 rounded-t-sm" style={{height: `${Math.max(10, (m.value/maxMonthly)*100)}%`}}></div><span className="text-[9px] text-slate-500">{m.label}</span></div>))}
             </div>
          </div>
        )}

        {/* Link Post Panel */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
           <div className="flex items-center justify-between mb-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Link a live post</p>
              <p className="text-[11px] text-slate-500">Paste a public Instagram/Pinterest URL to fetch live stats.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={igUrlInput} onChange={(e) => setIgUrlInput(e.target.value)} placeholder="https://www.instagram.com/p/..." className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs" />
              <button onClick={handleAddInstagramPost} disabled={isAddingPost || !igUrlInput.trim()} className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">{isAddingPost ? 'Adding…' : 'Add Post'}</button>
            </div>
             {igPosts.length > 0 && <p className="text-[11px] text-slate-500 mt-1">{igPosts.length} live post(s) linked.</p>}
          </div>
        </div>

        {/* ADS SECTION (Updated with Filter Tabs) */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Ads & Creatives</h2>
            <span className="text-[11px] text-slate-500">{allAdsToShow.length} creative{allAdsToShow.length !== 1 ? 's' : ''} showing</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             {['all', 'instagram', 'meta', 'pinterest'].map(filter => (
               <button key={filter} onClick={() => setAdFilter(filter)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${adFilter === filter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</button>
             ))}
          </div>
        </div>

        {allAdsToShow.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-500">No {adFilter !== 'all' ? adFilter : ''} ads found. Link a post or add creatives.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allAdsToShow.map((ad) => {
                const id = ad._id || ad.id;
                const isActive = selectedAd && (selectedAd._id || selectedAd.id) === id;
                const isIgLive = ad.isInstagramPost;
                
                // Dynamic Badge Color
                let pLower = (ad.platform || '').toLowerCase();
                let badgeColor = 'bg-slate-800';
                if(pLower.includes('instagram')) badgeColor = 'bg-pink-600';
                if(pLower.includes('meta') || pLower.includes('facebook')) badgeColor = 'bg-blue-600';
                if(pLower.includes('pinterest')) badgeColor = 'bg-red-600';

                return (
                  <article key={id} onClick={() => setSelectedAd(ad)} className={`bg-white border rounded-2xl shadow-sm p-4 flex flex-col hover:shadow-md hover:-translate-y-[1px] transition-all cursor-pointer ${isActive ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'}`}>
                    <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                      {ad.imageUrl && <img src={ad.imageUrl} alt="Ad creative" className="w-full h-40 object-cover" />}
                      <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full text-white ${badgeColor}`}>{ad.platform} {isIgLive && '· Live'}</span>
                      {isIgLive && ad.url && (
                        <a href={ad.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-slate-900 border border-slate-200 hover:bg-white">View ↗</a>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">{ad.headline || 'Untitled'}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-3 mb-3">{ad.caption}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <span className="flex items-center gap-1">{isIgLive ? '❤️' : '👍'} {(ad.likes || 0).toLocaleString()}</span>
                      <span>💬 {(ad.comments || 0).toLocaleString()}</span>
                      <span>↗ {(ad.clicks || 0).toLocaleString()}</span>
                    </div>
                    {isIgLive && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteInstagramPost(ad._id); }} className="mt-2 text-[10px] text-rose-500 hover:text-rose-600 self-end">Unlink</button>
                    )}
                  </article>
                );
              })}
            </div>
            
            {/* Selected Ad Detail */}
            {selectedAd && (
              <div className="mt-2 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80 animate-fade-in">
                 <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="w-40 h-40 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                         {selectedAd.imageUrl ? <img src={selectedAd.imageUrl} className="w-full h-full object-cover"/> : <div className="p-4 text-xs">No img</div>}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold mb-2">Selected Ad Details</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center"><p className="text-[10px] text-slate-500">Likes</p><p className="font-bold text-indigo-600">{selectedAd.likes}</p></div>
                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-center"><p className="text-[10px] text-slate-500">Comments</p><p className="font-bold text-slate-800">{selectedAd.comments}</p></div>
                             <div className="p-3 bg-white rounded-lg border border-slate-200 text-center"><p className="text-[10px] text-slate-500">Est Clicks</p><p className="font-bold text-emerald-600">{selectedAd.clicks}</p></div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] text-slate-500">Simulated Breakdown:</span>
                            {['instagram','meta','pinterest'].map(c => (<button key={c} onClick={() => setActiveAdChannel(c)} className={`px-2 py-0.5 text-[10px] rounded border ${activeAdChannel===c ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200'}`}>{c}</button>))}
                        </div>
                        {selectedAdChannelPerf && (
                             <div className="text-[11px] text-slate-600">On {selectedAdChannelPerf.label}: <span className="font-semibold">{selectedAdChannelPerf.clicks} clicks</span> generating approx <span className="font-semibold text-emerald-600">₹{selectedAdChannelPerf.revenue}</span></div>
                        )}
                    </div>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}