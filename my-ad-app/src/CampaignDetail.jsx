import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3001';

export default function CampaignDetail({
  campaign,
  ads = [],
  onBack,
  onUpdateMeta,
}) {
  if (!campaign) return null;

  const [name, setName] = useState(campaign.name || campaign.headline || '');
  const [startDate, setStartDate] = useState(campaign.startDate || '');
  const [endDate, setEndDate] = useState(campaign.endDate || '');

  // 🔹 individual ad selection
  const [selectedAd, setSelectedAd] = useState(null);

  // 🔹 live instagram post states
  const [livePostUrl, setLivePostUrl] = useState(
    'https://www.instagram.com/p/DQkHv4EeQo0/'
  );
  const [livePost, setLivePost] = useState(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  useEffect(() => {
    setName(campaign.name || campaign.headline || '');
    setStartDate(campaign.startDate || '');
    setEndDate(campaign.endDate || '');
    setSelectedAd(null); // campaign change -> reset
  }, [campaign]);

  // 🔹 fetch demo live-post data from backend
  const fetchLivePost = async () => {
    try {
      setIsLiveLoading(true);
      setLiveError('');
      const res = await fetch(`${BACKEND_URL}/api/live-post`);
      if (!res.ok) throw new Error('Failed to fetch live post');
      const json = await res.json();
      setLivePost(json);
    } catch (err) {
      console.error(err);
      setLiveError('Server error while tracking this post.');
    } finally {
      setIsLiveLoading(false);
    }
  };

  // pehli baar page open hote hi ek baar laa lo
  useEffect(() => {
    fetchLivePost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // 🔹 build a pseudo ad card for live instagram post (if available)
  const liveAdCard = livePost
    ? {
        id: 'live-instagram-post',
        isLivePost: true,
        platform: 'Instagram',
        headline: 'Instagram live post',
        caption:
          livePost.caption ||
          'Live public Instagram post. Image, likes & comments are from /api/live-post.',
        imageUrl: livePost.imageUrl || '',
        likes:
          livePost.currentLikes ??
          livePost.baseLikes ??
          0,
        comments:
          livePost.currentComments ??
          livePost.baseComments ??
          0,
        // simple rough estimate
        clicks: Math.round(
          ((livePost.currentLikes ?? livePost.baseLikes ?? 0) || 0) * 0.12
        ),
      }
    : null;

  // 🔹 static ads + live ad (if present)
  const allAdsToShow = liveAdCard ? [...ads, liveAdCard] : ads;

  const totalLikes = allAdsToShow.reduce((sum, ad) => sum + (ad.likes || 0), 0);
  const totalComments = allAdsToShow.reduce(
    (sum, ad) => sum + (ad.comments || 0),
    0
  );
  const totalClicks = allAdsToShow.reduce(
    (sum, ad) => sum + (ad.clicks || 0),
    0
  );

  // 🔹 small helper to slugify filename
  const slugify = (str) =>
    (str || 'campaign')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // 🔹 build CSV summary + trigger download
  const handleDownloadReport = () => {
    const campaignName = name || campaign.name || 'Campaign';
    const fileName = `${slugify(campaignName)}-summary.csv`;

    // CSV header for campaign meta
    let csv = '';
    csv += `"Campaign Name","Brand","Platform","Status","Start Date","End Date","Total Likes","Total Comments","Total Estimated Clicks"\n`;
    csv += `"${campaignName.replace(/"/g, '""')}","${(campaign.brand || '').replace(
      /"/g,
      '""'
    )}","${(campaign.platform || '').replace(/"/g, '""')}","${
      campaign.status || 'Live'
    }","${startDate}","${endDate}","${totalLikes}","${totalComments}","${totalClicks}"\n\n`;

    // Per-ad details
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

  // 🔹 CTR etc for selected ad
  const selectedAdCtr =
    selectedAd && selectedAd.likes
      ? ((selectedAd.clicks || 0) / selectedAd.likes) * 100
      : 0;

  // --- RENDER ---
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

          {/* 🔸 Download summary report button */}
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

            {/* Dates editable */}
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

        {/* Top Metrics for this campaign */}
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

        {/* 🔹 LIVE INSTAGRAM POST PANEL */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Link a live Instagram post
              </p>
              <p className="text-[11px] text-slate-500">
                Public Instagram post ka URL paste karo. Hum uska image + likes
                + comments yahin show kar denge (demo backend).
              </p>
            </div>
            {livePostUrl && (
              <a
                href={livePostUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Open in Instagram ↗
              </a>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {/* URL + Refresh */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={livePostUrl}
                onChange={(e) => setLivePostUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/XXXXXXXXX/"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={fetchLivePost}
                disabled={isLiveLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLiveLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* small preview card */}
            <div className="mt-1 flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0 flex items-center justify-center text-[11px] text-slate-500">
                {livePost && livePost.imageUrl ? (
                  <img
                    src={livePost.imageUrl}
                    alt="Instagram post"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'No image'
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800 mb-1 line-clamp-1">
                  Instagram post
                </p>
                <p className="text-[11px] text-slate-500 mb-1 line-clamp-2">
                  {livePost?.caption ||
                    'Paste a public Instagram post URL and hit refresh to preview.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  <span className="font-medium">
                    {liveAdCard?.likes?.toLocaleString() || 0} likes
                  </span>{' '}
                  ·{' '}
                  <span className="font-medium">
                    {liveAdCard?.comments?.toLocaleString() || 0} comments
                  </span>{' '}
                  · ~
                  <span className="font-medium">
                    {liveAdCard?.clicks?.toLocaleString() || 0} est. clicks
                  </span>
                </p>
                {liveError && (
                  <p className="text-[11px] text-red-500 mt-1">
                    {liveError}
                  </p>
                )}
              </div>
            </div>
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
                  selectedAd &&
                  (selectedAd._id || selectedAd.id) === id;

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
                        {ad.isLivePost ? 'Instagram · Live' : campaign.platform}
                      </span>
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
                  </article>
                );
              })}
            </div>

            {/* 🔹 Selected ad performance panel */}
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
                        {selectedAd.isLivePost && ' · Instagram live post'}
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
