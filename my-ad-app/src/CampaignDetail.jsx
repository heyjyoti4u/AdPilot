import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3001';

export default function CampaignDetail({
  campaign,
  ads = [],
  onBack,
  onUpdateMeta,
}) {
  if (!campaign) return null;

  // Single source of truth for ID
  const campaignId = campaign._id || campaign.id;

  const [name, setName] = useState(campaign.name || campaign.headline || '');
  const [startDate, setStartDate] = useState(campaign.startDate || '');
  const [endDate, setEndDate] = useState(campaign.endDate || '');

  const [selectedAd, setSelectedAd] = useState(null);

  // Instagram posts in this campaign (saved)
  const [igPosts, setIgPosts] = useState([]);
  const [igUrlInput, setIgUrlInput] = useState('');
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [igError, setIgError] = useState('');

  // 🔹 Shopify tracking states
  const [shopifyUrl, setShopifyUrl] = useState(campaign.targetUrl || '');
  const [trackingLink, setTrackingLink] = useState(
    campaign.trackingSlug && campaign._id
      ? `${BACKEND_URL}/c/${campaign.trackingSlug}`
      : campaign._id
      ? `${BACKEND_URL}/c/${campaign._id}`
      : ''
  );
  const [isSavingTarget, setIsSavingTarget] = useState(false);

  useEffect(() => {
    setName(campaign.name || campaign.headline || '');
    setStartDate(campaign.startDate || '');
    setEndDate(campaign.endDate || '');
    setSelectedAd(null);
    setIgError('');
    setIgUrlInput('');

    // reset tracking UI when campaign changes
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
  //  INSTAGRAM POSTS HELPERS
  // ==========================
  const fetchInstagramPosts = async (campId) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/campaigns/${campId}/instagram-posts`
      );
      if (!res.ok) throw new Error('Failed to load Instagram posts');
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
        throw new Error(errorJson.error || 'Failed to add Instagram post');
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
      if (!res.ok) throw new Error('Failed to delete Instagram post');
      setIgPosts((prev) => prev.filter((p) => p._id !== postId));
      if (selectedAd && selectedAd._id === postId) {
        setSelectedAd(null);
      }
    } catch (err) {
      console.error(err);
      alert('Could not delete this post. Check backend.');
    }
  };

  // ==========================
  //  SHOPIFY TRACKING HELPERS
  // ==========================
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to save URL');
      }

      const serverTracking =
        data.trackingLink || data.trackingUrl || data.url || '';
      if (serverTracking) {
        setTrackingLink(serverTracking);
      } else {
        setTrackingLink(`${BACKEND_URL}/c/${campaignId}`);
      }

      // optional: bubble updated meta back to parent
      if (onUpdateMeta && data.campaign) {
        onUpdateMeta({
          ...campaign,
          ...data.campaign,
        });
      }

      alert('Tracking link saved!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error saving Shopify URL');
    } finally {
      setIsSavingTarget(false);
    }
  };

  // ==========================
  //  META UPDATE HELPERS
  // ==========================
  const pushUpdate = (newName, newStart, newEnd) => {
    if (!onUpdateMeta) return;
    onUpdateMeta({
      name: newName,
      startDate: newStart,
      endDate: newEnd,
    });
  };

  const handleNameBlur = () => pushUpdate(name, startDate, endDate);
  const handleDatesBlur = () => pushUpdate(name, startDate, endDate);

  // ==========================
  //  DATA MERGE & TOTALS
  // ==========================
  const igAsAds = igPosts.map((p) => ({
    _id: p._id,
    isInstagramPost: true,
    platform: 'Instagram',
    headline: p.headline || 'Instagram post',
    caption: p.caption || '',
    imageUrl: p.imageUrl,
    likes: p.likes || 0,
    comments: p.comments || 0,
    clicks: p.clicks || 0,
    url: p.url,
  }));

  const allAdsToShow = [...ads, ...igAsAds];

  const totalLikes = allAdsToShow.reduce(
    (sum, ad) => sum + (ad.likes || 0),
    0
  );
  const totalComments = allAdsToShow.reduce(
    (sum, ad) => sum + (ad.comments || 0),
    0
  );
  const totalClicks = allAdsToShow.reduce(
    (sum, ad) => sum + (ad.clicks || 0),
    0
  );

  const slugify = (str) =>
    (str || 'campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleDownloadReport = () => {
    const campaignName = name || campaign.name || 'Campaign';
    const fileName = `${slugify(campaignName)}-summary.csv`;

    let csv = '';
    csv += `"Campaign Name","Brand","Platform","Status","Start Date","End Date","Total Likes","Total Comments","Total Estimated Clicks"\n`;
    csv += `"${campaignName.replace(/"/g, '""')}","${(
      campaign.brand || ''
    ).replace(/"/g, '""')}","${(
      campaign.platform || ''
    ).replace(/"/g, '""')}","${
      campaign.status || 'Live'
    }","${startDate}","${endDate}","${totalLikes}","${totalComments}","${totalClicks}"\n\n`;

    csv += `"Ad #","Ad Headline","Likes","Comments","Estimated Clicks"\n`;
    allAdsToShow.forEach((ad, index) => {
      const headline = (ad.headline || 'Untitled ad').replace(/"/g, '""');
      csv += `"${index + 1}","${headline}","${ad.likes || 0}","${
        ad.comments || 0
      }","${ad.clicks || 0}"\n`;
    });

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedAdCtr =
    selectedAd && selectedAd.likes
      ? ((selectedAd.clicks || 0) / selectedAd.likes) * 100
      : 0;

  const totalTrackedClicks = campaign.clicks || 0;
  const totalPurchases = campaign.purchases || 0;

  // ==========================
  //  RENDER
  // ==========================
  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto animate-slide-in-up">
      <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
        {/* Breadcrumb + download */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={onBack}
              className="px-2 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px]"
            >
              ← Campaigns
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-700 line-clamp-1">
              {name}
            </span>
          </div>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[0.97] transition-transform"
          >
            ⬇ Download summary report
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-32 h-32 bg-slate-900 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
            {campaign.primaryImage || campaign.imageUrl ? (
              <img
                src={campaign.primaryImage || campaign.imageUrl}
                alt="Campaign main creative"
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 bg-slate-50">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              className="w-full text-2xl md:text-3xl font-bold text-slate-900 mb-1 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none pb-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Campaign name"
            />

            <p className="text-xs text-slate-500 mb-3">
              {campaign.platform} · {campaign.brand || campaign.format}
            </p>

            <p className="text-sm text-slate-600 line-clamp-3 mb-4">
              {campaign.caption || 'No caption available.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Start:</span>
                <input
                  type="date"
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={handleDatesBlur}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">End:</span>
                <input
                  type="date"
                  className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onBlur={handleDatesBlur}
                />
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold">
                ● {campaign.status || 'Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
              Total Likes
            </p>
            <p className="text-2xl font-bold text-indigo-600">
              {totalLikes.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
              Total Comments
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {totalComments.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">
              Estimated Clicks
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {totalClicks.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 🔹 Shopify Tracking (only for real DB campaigns) */}
        {campaign._id && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Shopify Tracking (Clicks & Purchases)
            </h3>

            {/* Shopify URL input */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={shopifyUrl}
                onChange={(e) => setShopifyUrl(e.target.value)}
                placeholder="Paste Shopify product URL (https://yourstore.myshopify.com/...)"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={saveShopifyUrl}
                disabled={isSavingTarget || !shopifyUrl.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSavingTarget ? 'Saving…' : 'Save link'}
              </button>
            </div>

            {/* Tracking link display */}
            {trackingLink && (
              <div className="mt-2">
                <p className="text-[11px] font-medium text-slate-700 mb-1">
                  Tracking link to put in Instagram bio / button:
                </p>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="text"
                    value={trackingLink}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(trackingLink)}
                    className="px-3 py-2 rounded-lg text-[11px] font-semibold bg-slate-900 text-white hover:bg-black"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Click / purchase stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 mb-1">Tracked Clicks</p>
                <p className="text-xl font-semibold text-indigo-600">
                  {totalTrackedClicks.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 mb-1">
                  Shopify Purchases
                </p>
                <p className="text-xl font-semibold text-emerald-600">
                  {totalPurchases.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 mb-1">
                  Linked product URL
                </p>
                <p className="text-[11px] text-slate-600 line-clamp-2 break-all">
                  {campaign.targetUrl || shopifyUrl || 'Not linked yet'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LINK INSTAGRAM POST PANEL */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Link a live Instagram post
              </p>
              <p className="text-[11px] text-slate-500">
                Public Instagram post ka URL yahan paste karo. Hum uska image,
                caption, likes &amp; comments ko neeche ads list mein add kar
                denge.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={igUrlInput}
                onChange={(e) => setIgUrlInput(e.target.value)}
                placeholder="https://www.instagram.com/p/XXXXXXXXX/"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={handleAddInstagramPost}
                disabled={isAddingPost || !igUrlInput.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAddingPost ? 'Adding…' : 'Add post'}
              </button>
            </div>

            {igError && (
              <p className="text-[11px] text-red-500 mt-1">{igError}</p>
            )}

            {igPosts.length > 0 && (
              <p className="text-[11px] text-slate-500 mt-1">
                {igPosts.length} Instagram post
                {igPosts.length > 1 ? 's' : ''} linked to this campaign.
              </p>
            )}
          </div>
        </div>

        {/* Ads inside this campaign */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Ads in this campaign
          </h2>
          <span className="text-[11px] text-slate-500">
            {allAdsToShow.length} creative
            {allAdsToShow.length !== 1 ? 's' : ''}
          </span>
        </div>

        {allAdsToShow.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-500">
            No ads linked yet. In future you can assign multiple creatives to
            one campaign here.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allAdsToShow.map((ad) => {
                const id = ad._id || ad.id;
                const isActive =
                  selectedAd && (selectedAd._id || selectedAd.id) === id;

                const isIgLive = ad.isInstagramPost;

                return (
                  <article
                    key={id}
                    onClick={() => setSelectedAd(ad)}
                    className={`bg-white border rounded-2xl shadow-sm p-4 flex flex-col hover:shadow-md hover:-translate-y-[1px] transition-all cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                      {ad.imageUrl && (
                        <img
                          src={ad.imageUrl}
                          alt="Ad creative"
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-white">
                        {isIgLive ? 'Instagram · Live' : campaign.platform}
                      </span>
                      {isIgLive && ad.url && (
                        <a
                          href={ad.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-white/80 text-slate-900 border border-slate-200"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                      {ad.headline || 'Untitled ad'}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-3 mb-3">
                      {ad.caption}
                    </p>

                    <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <span>👍 {(ad.likes || 0).toLocaleString()}</span>
                      <span>💬 {(ad.comments || 0).toLocaleString()}</span>
                      <span>↗ {(ad.clicks || 0).toLocaleString()}</span>
                    </div>

                    {isIgLive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInstagramPost(ad._id);
                        }}
                        className="mt-2 text-[10px] text-rose-500 hover:text-rose-600 self-end"
                      >
                        Delete post
                      </button>
                    )}
                  </article>
                );
              })}
            </div>

            {selectedAd && (
              <div className="mt-2 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/80">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="w-40 h-40 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                    {selectedAd.imageUrl ? (
                      <img
                        src={selectedAd.imageUrl}
                        alt="Selected ad"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Selected ad performance
                        {selectedAd.isInstagramPost && ' · Instagram post'}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Click any ad card to change selection
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {selectedAd.headline || 'Untitled ad'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                        <p className="text-[11px] text-slate-500 mb-1">
                          Likes
                        </p>
                        <p className="text-lg font-semibold text-indigo-600">
                          {(selectedAd.likes || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                        <p className="text-[11px] text-slate-500 mb-1">
                          Comments
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {(selectedAd.comments || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                        <p className="text-[11px] text-slate-500 mb-1">
                          Est. Clicks
                        </p>
                        <p className="text-lg font-semibold text-emerald-600">
                          {(selectedAd.clicks || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                        <p className="text-[11px] text-slate-500 mb-1">
                          Est. CTR
                        </p>
                        <p className="text-lg font-semibold text-purple-600">
                          {selectedAdCtr.toFixed(1)}%
                        </p>
                      </div>
                    </div>
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
