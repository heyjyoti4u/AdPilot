import React, { useState, useEffect } from 'react';
import CampaignDetail from './CampaignDetail.jsx';
import SummaryPage from './Summary.jsx';

const BACKEND_URL = 'http://localhost:3001';

// ---- DEMO BRAND CAMPAIGNS (Puma + Nike) ----
const INITIAL_DEMO_CAMPAIGNS = [
  {
    id: 'puma-velocity',
    source: 'demo',
    brand: 'Puma India',
    handle: '@pumaindia',
    platform: 'Instagram',
    format: 'Feed Post',
    name: 'Puma India – Velocity 4 Live Ads',
    status: 'Live',
    startDate: '2025-11-15',
    endDate: '2025-12-05',
    primaryImage:
      'https://static.vecteezy.com/system/resources/previews/010/994/278/original/puma-logo-white-symbol-with-name-clothes-design-icon-abstract-football-illustration-with-black-background-free-vector.jpg',
    caption:
      'Built for any runner, any time, any distance. The way running should feel. PUMA Velocity 4 out now, only at PUMA.com, App & Stores. #GoWild',
    ads: [
      {
        id: 'puma-1',
        imageUrl:
          'https://via.placeholder.com/800x800.png?text=Puma+Velocity+Shoe',
        headline: 'Built for any runner, any time, any distance.',
        caption:
          'Velocity 4 cushioning + grip. Made for daily miles. Available now on PUMA.com & stores. #GoWild',
        likes: 462,
        comments: 32,
        clicks: 57,
      },
      {
        id: 'puma-2',
        imageUrl:
          'https://via.placeholder.com/800x800.png?text=Puma+Velocity+Lifestyle',
        headline: 'One shoe for tempo days and easy days.',
        caption:
          'Lightweight, responsive and ready to move. Tap to shop the new Velocity 4 colourways.',
        likes: 692,
        comments: 41,
        clicks: 73,
      },
    ],
  },
  {
    id: 'nike-india',
    source: 'demo',
    brand: 'Nike',
    handle: '@nike',
    platform: 'Instagram',
    format: 'Feed Post',
    name: 'Nike – India Champions Story',
    status: 'Live',
    startDate: '2025-11-01',
    endDate: '2025-12-10',
    primaryImage: 'https://www.freepnglogos.com/uploads/nike-logo-4.jpg',
    caption:
      'When the world chose not to believe, India chose the trophy. Born to win. 🔥',
    ads: [
      {
        id: 'nike-1',
        imageUrl:
          'https://via.placeholder.com/800x800.png?text=Nike+Born+To+Win',
        headline: 'Born to win.',
        caption:
          'India champions on home soil. New limited-edition jerseys dropping soon.',
        likes: 567814,
        comments: 1950,
        clicks: 4200,
      },
      {
        id: 'nike-2',
        imageUrl:
          'https://via.placeholder.com/800x800.png?text=Nike+Aero+Fit',
        headline: 'Don’t lose your cool.',
        caption:
          'Introducing Nike Aero-FIT – designed for extraordinary airflow when the match heats up. Launching 2026.',
        likes: 97615,
        comments: 860,
        clicks: 2380,
      },
    ],
  },
];

const CampaignsDashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // viewMode: overview = main page, demo-detail = Puma/Nike detail page
  const [viewMode, setViewMode] = useState('overview');
  const [demoCampaigns, setDemoCampaigns] = useState(INITIAL_DEMO_CAMPAIGNS);
  const [activeDemoId, setActiveDemoId] = useState(null);

  // Summary view ke liye
  const [summaryForCampaign, setSummaryForCampaign] = useState(null);

  // New brand campaign form
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    brand: '',
    platform: 'Instagram',
    primaryImage: '',
    startDate: '',
    endDate: '',
  });

  // metrics abhi UI me use nahi, future ke liye hain
  const [, setMetrics] = useState({
    totalSpend: 0,
    totalClicks: 0,
    totalConversions: 0,
    activeCount: 0,
  });

  // --- FETCH REAL DATA FROM DB ---
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/campaigns`);
        const data = await res.json();

        setCampaigns(data);

        if (data.length > 0) {
          setSelectedCampaign(data[0]);

          const stats = data.reduce(
            (acc, curr) => {
              const spent = parseFloat(
                String(curr.spent || '0').replace(/[^0-9.-]+/g, ''),
              );
              return {
                spend: acc.spend + (isNaN(spent) ? 0 : spent),
                clicks: acc.clicks + (curr.clicks || 0),
                conversions: acc.conversions + (curr.conversions || 0),
                active: acc.active + (curr.status === 'Active' ? 1 : 0),
              };
            },
            { spend: 0, clicks: 0, conversions: 0, active: 0 },
          );

          setMetrics({
            totalSpend: stats.spend,
            totalClicks: stats.clicks,
            totalConversions: stats.conversions,
            activeCount: stats.active,
          });
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // LocalStorage se brand campaigns load
useEffect(() => {
  try {
    const saved = localStorage.getItem('adapp_brand_campaigns');
    if (saved) {
      const parsed = JSON.parse(saved);

      // Puma/Nike ke sath merge karo, duplicate id avoid
      setDemoCampaigns(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const merged = [...prev];
        parsed.forEach(c => {
          if (!existingIds.has(c.id)) merged.push(c);
        });
        return merged;
      });
    }
  } catch (e) {
    console.error('Error reading brand campaigns from localStorage', e);
  }
}, []);

// jab bhi brand campaigns change hon, localStorage me save kar do
useEffect(() => {
  try {
    // sirf custom ones bhi save kar sakti ho, but simple: sab save kar do
    localStorage.setItem(
      'adapp_brand_campaigns',
      JSON.stringify(demoCampaigns)
    );
  } catch (e) {
    console.error('Error saving brand campaigns', e);
  }
}, [demoCampaigns]);


  // --- SLOW REAL-TIME INCREMENT FOR DEMO BRAND ADS ---
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoCampaigns(prev =>
        prev.map(c => ({
          ...c,
          ads: c.ads.map(ad => ({
            ...ad,
            likes: ad.likes + Math.floor(Math.random() * 3),
            comments: ad.comments + (Math.random() < 0.25 ? 1 : 0),
            clicks: ad.clicks + Math.floor(Math.random() * 2),
          })),
        })),
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ---- DEMO CAMPAIGN HELPERS ----
  const openDemoDetail = id => {
    setActiveDemoId(id);
    setViewMode('demo-detail');
  };

  const handleUpdateDemoMeta = updates => {
    if (!activeDemoId) return;
    setDemoCampaigns(prev =>
      prev.map(c => (c.id === activeDemoId ? { ...c, ...updates } : c)),
    );
  };

  const handleBrandFormChange = e => {
    const { name, value } = e.target;
    setNewBrandForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateBrandCampaign = e => {
    e.preventDefault();

    if (!newBrandForm.name.trim()) return;

    const id = `brand-${Date.now()}`;

    const newCampaign = {
      id,
      source: 'custom',
      brand: newBrandForm.brand || newBrandForm.name,
      handle: `@${(newBrandForm.brand || newBrandForm.name || 'brand')
        .toLowerCase()
        .replace(/\s+/g, '')}`,
      platform: newBrandForm.platform || 'Instagram',
      format: 'Feed Post',
      name: newBrandForm.name,
      status: 'Draft',
      startDate: newBrandForm.startDate || '',
      endDate: newBrandForm.endDate || '',
      primaryImage:
        newBrandForm.primaryImage ||
        'https://via.placeholder.com/512x512.png?text=Campaign+Cover',
      caption:
        'Demo campaign created inside AdApp. Update copy and creatives from the detail view.',
      ads: [],
    };

    setDemoCampaigns(prev => [...prev, newCampaign]);
    setIsCreateBrandOpen(false);
    setNewBrandForm({
      name: '',
      brand: '',
      platform: 'Instagram',
      primaryImage: '',
      startDate: '',
      endDate: '',
    });
  };

  // ---- LOADING ----
  if (loading && viewMode === 'overview' && !summaryForCampaign) {
    return (
      <div className="flex items-center justify-center h-[70vh] w-full text-gray-500">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (summaryForCampaign) {
    const c = summaryForCampaign;
    return (
      <SummaryPage
        campaign={c}                 // full object
        onBack={() => setSummaryForCampaign(null)}
      />
    );
  }
  

  // ---- DEMO DETAIL PAGE (Puma/Nike etc.) ----
  if (viewMode === 'demo-detail' && activeDemoId) {
    const activeDemo = demoCampaigns.find(c => c.id === activeDemoId);
    if (!activeDemo) return null;

    return (
      <CampaignDetail
        campaign={activeDemo}
        ads={activeDemo.ads}
        onBack={() => setViewMode('overview')}
        onUpdateMeta={handleUpdateDemoMeta}
        onShowSummary={() => setSummaryForCampaign(activeDemo)}
      />
    );
  }

  // ---- Brand-level stats for top row ----
  const totalBrandCampaigns = demoCampaigns.length;
  const totalBrandAds = demoCampaigns.reduce(
    (sum, c) => sum + c.ads.length,
    0,
  );
  const totalBrandClicks = demoCampaigns.reduce(
    (sum, c) => sum + c.ads.reduce((s, ad) => s + (ad.clicks || 0), 0),
    0,
  );

  // ---- OVERVIEW PAGE ----
  return (
    <div className="p-4 sm:p-6 md:p-8 animate-slide-in-up w-full max-w-7xl mx-auto font-inter">
      <div className="bg-white/95 border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Campaigns & Performance
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              Track live Instagram brand campaigns and your own AdApp campaigns
              in one place.
            </p>
          </div>
        </div>

        {/* TOP STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide mb-1">
              Live Brand Campaigns
            </p>
            <p className="text-2xl font-extrabold text-indigo-900">
              {totalBrandCampaigns}
            </p>
            <p className="text-[11px] text-indigo-500 mt-1">
              Puma India + Nike Instagram ads connected for demo.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Total Creatives
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {totalBrandAds}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Number of individual ad posts inside these campaigns.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide mb-1">
              Estimated Clicks (demo)
            </p>
            <p className="text-2xl font-extrabold text-emerald-700">
              {totalBrandClicks.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">
              Auto-updating based on live-like growth of each ad.
            </p>
          </div>
        </div>

        {/* ---- LIVE BRAND CAMPAIGNS ---- */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Live Instagram Brand Campaigns
              </h2>
              <span className="text-[11px] text-slate-500">
                Click a card to view all ads inside that campaign.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateBrandOpen(prev => !prev)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold bg-purple-600 text-white shadow-sm hover:bg-purple-700 active:scale-[0.99] transition-all"
            >
              <span className="text-base leading-none">＋</span>
              New brand campaign
            </button>
          </div>

          {/* Inline form for new brand campaign */}
          {isCreateBrandOpen && (
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Add a demo brand campaign
                </h3>
                <span className="text-[11px] text-slate-400">
                  Local-only; data is not saved in backend.
                </span>
              </div>

              <form
                onSubmit={handleCreateBrandCampaign}
                className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Campaign name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newBrandForm.name}
                    onChange={handleBrandFormChange}
                    required
                    placeholder="Eg. Puma – Monsoon Sale"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Brand name
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={newBrandForm.brand}
                    onChange={handleBrandFormChange}
                    placeholder="Eg. Puma India"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Platform
                  </label>
                  <select
                    name="platform"
                    value={newBrandForm.platform}
                    onChange={handleBrandFormChange}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Meta">Meta (Facebook)</option>
                    <option value="Pinterest">Pinterest</option>
                    <option value="Google">Google Ads</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Cover image URL
                  </label>
                  <input
                    type="text"
                    name="primaryImage"
                    value={newBrandForm.primaryImage}
                    onChange={handleBrandFormChange}
                    placeholder="Paste logo / cover image URL"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Start date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newBrandForm.startDate}
                    onChange={handleBrandFormChange}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    End date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newBrandForm.endDate}
                    onChange={handleBrandFormChange}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateBrandOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                  >
                    Create campaign
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoCampaigns.map(c => {
              const totalLikes = c.ads.reduce(
                (sum, ad) => sum + (ad.likes || 0),
                0,
              );
              const totalComments = c.ads.reduce(
                (sum, ad) => sum + (ad.comments || 0),
                0,
              );
              return (
                <button
                  key={c.id}
                  onClick={() => openDemoDetail(c.id)}
                  className="group text-left bg-slate-900 text-white rounded-2xl border border-slate-800/80 shadow-md hover:shadow-xl hover:-translate-y-[2px] transition-all overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4 md:p-5">
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-700">
                      {c.primaryImage && (
                        <img
                          src={c.primaryImage}
                          alt={c.name}
                          className="w-full h-full object-contain bg-black"
                        />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] uppercase tracking-wide text-slate-300">
                          {c.platform} · {c.brand}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
                          ● {c.status || 'Live'} on {c.platform}
                        </span>
                      </div>
                      <h3 className="text-sm md:text-base font-semibold mb-1 line-clamp-2">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                        {c.caption}
                      </p>

                      {(c.startDate || c.endDate) && (
                        <p className="text-[10px] text-slate-400 mb-2">
                          {c.startDate || 'Start ?'} – {c.endDate || 'End ?'}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] mt-auto pt-2 border-t border-slate-800/80">
                        <div className="flex gap-4">
                          <span className="flex flex-col">
                            <span className="text-slate-400">Likes</span>
                            <span className="font-semibold">
                              {totalLikes.toLocaleString()}
                            </span>
                          </span>
                          <span className="flex flex-col">
                            <span className="text-slate-400">Comments</span>
                            <span className="font-semibold">
                              {totalComments.toLocaleString()}
                            </span>
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] text-indigo-200 group-hover:text-white">
                          View campaign
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* --- YOUR SAVED ADAPP CAMPAIGNS (DB) --- */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Your AdApp Campaigns
            </h2>
            <span className="text-[11px] text-slate-500">
              {campaigns.length} saved campaign
              {campaigns.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: list */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl h-full flex flex-col shadow-sm">
                <div className="px-4 pt-3 pb-2 border-b border-gray-200 sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm rounded-t-2xl">
                  <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                    Recent Campaigns ({campaigns.length})
                  </h3>
                </div>

                <div className="px-4 pb-4 pt-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {campaigns.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                      <p>No campaigns found.</p>
                    </div>
                  ) : (
                    campaigns.map(camp => (
                      <div
                        key={camp._id}
                        onClick={() => setSelectedCampaign(camp)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedCampaign?._id === camp._id
                            ? 'bg-white border-blue-500 ring-1 ring-blue-500 shadow-md'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">
                            {camp.headline || camp.name}
                          </h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ml-2 whitespace-nowrap bg-green-50 text-green-700 border-green-200">
                            {camp.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-4">
                          <span className="flex items-center gap-1 font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {camp.platform}
                          </span>
                          <span className="self-end">Spent: {camp.spent}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: details (DB campaign) */}
            <div className="lg:col-span-2 flex flex-col h-full">
              {selectedCampaign ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 flex-1 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                    <div className="flex gap-6 w-full">
                      <div className="w-32 h-32 bg-gray-900 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 relative">
                        {selectedCampaign.imageUrl ? (
                          <img
                            src={selectedCampaign.imageUrl}
                            className="w-full h-full object-contain bg-black"
                            alt="Creative"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs bg-gray-100">
                            No Img
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900 leading-tight line-clamp-2">
                            {selectedCampaign.headline ||
                              selectedCampaign.name}
                          </h2>
                          <span className="px-3 py-1 text-[11px] rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                            {selectedCampaign.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                          {selectedCampaign.caption || 'No caption available.'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100 font-semibold">
                            {selectedCampaign.format}
                          </span>
                          {selectedCampaign.startDate &&
                            selectedCampaign.endDate && (
                              <span className="bg-gray-50 text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200">
                                {selectedCampaign.startDate} –{' '}
                                {selectedCampaign.endDate}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                    Performance Overview
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Total Clicks
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedCampaign.clicks}
                      </p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Budget
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedCampaign.budget}
                      </p>
                    </div>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Amount Spent
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedCampaign.spent}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 h-full flex flex-col items-center justify-center text-gray-400">
                  <svg
                    className="w-16 h-16 mb-4 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-500">
                    Select a campaign to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CampaignsDashboard;
