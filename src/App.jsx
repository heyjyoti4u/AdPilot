 import React, { useState, useMemo, useEffect } from 'react';
import Billing from './Billing.jsx';
import CampaignsDashboard from './Campaigns.jsx';


// ===== BACKEND URL =====
const BACKEND_URL = 'http://localhost:3001';

// ==========================================
// 1. ICONS
// ==========================================
const baseIconClass = 'w-5 h-5';

const IconHome = () => (
  <svg className={baseIconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const IconCampaigns = () => (
  <svg className={baseIconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <path d="M13 2v7h7" />
    <path d="M9 17l3-3 3 3" />
    <path d="M9 11l3 3 3-3" />
  </svg>
);

const IconAds = () => (
  <svg className={baseIconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
    <path d="M7 15l5-5 5 5" />
    <path d="M7 9l5 5 5-5" />
  </svg>
);

const IconChannels = () => (
  <svg className={baseIconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.72-1.72" />
  </svg>
);

const IconBilling = () => (
  <svg className={baseIconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x={2} y={4} width={20} height={16} rx={2} />
    <path d="M2 10h20" />
    <path d="M6 14h.01" />
    <path d="M10 14h.01" />
  </svg>
);

const IconMeta = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-indigo-600">
    <path d="M22.003 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.842 3.44 8.872 8 9.8v-7.025H7.003v-2.775h2.997V9.75c0-2.96 1.77-4.6 4.498-4.6 1.28 0 2.38.095 2.698.138v2.362h-1.396c-1.436 0-1.714.68-1.714 1.682v2.218h2.63l-.342 2.775h-2.288V21.8c4.56-0.928 8-4.958 8-9.8Z" />
  </svg>
);

const IconInstagram = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-pink-500">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.053 1.805.248 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.167.422.362 1.056.413 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.053 1.17-.248 1.805-.413 2.227-.217.562-.477.96-.896 1.382-.42-.419-.819.679-1.381.896-.422.167-1.056.362-2.227.413C8.416 2.175 8.796 2.163 12 2.163Zm0 1.44c-3.115 0-3.478.013-4.697.068-1.07.049-1.583.232-1.92.372-.417.167-.718.358-.99.63-.27.27-.463.572-.63.99-.14.337-.322.85-.372 1.92C3.62 8.417 3.608 8.78 3.608 12s.013 3.583.068 4.697c.049 1.07.232 1.583.372 1.92.167.417.358.718.63.99.27.27.572.463.99.63.337.14.85.322 1.92.372C15.583 3.62 15.22 3.608 12 3.608Z" />
    <path d="M12 7.297c-2.598 0-4.703 2.105-4.703 4.703s2.105 4.703 4.703 4.703 4.703-2.105 4.703-4.703-2.105-4.703-4.703-4.703Zm0 7.966c-1.798 0-3.263-1.465-3.263-3.263s1.465-3.263 3.263-3.263 3.263 1.465 3.263 3.263-1.465 3.263-3.263 3.263Z" />
    <circle cx="16.965" cy="7.035" r="1.14" />
  </svg>
);

const IconPinterest = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-red-500">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.265.64 1.265 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.284.082.099.09.181.069.282-.06.27-.19.814-.222.936-.033.12-.1.145-.24.06-.96-.49-1.56-1.9-1.56-3.075 0-2.548 1.849-5.274 5.76-5.274 3.01 0 5.105 2.12 5.105 4.975 0 3.065-1.927 5.42-4.715 5.42-1.518 0-2.92-1.11-3.41-2.41-.496-1.307.477-2.397.477-2.397s.315-1.319.42-1.73c.126-.48.777-3.2.777-3.2.145-.645.05-.75-.181-.75-1.12 0-1.649 1.155-1.649 2.61 0 1.015.346 1.826.346 1.826s-1.107 4.66-1.298 5.449c-.55 2.37-1.94 4.315-1.94 5.566 0 1.03.784 1.865 1.804 1.865 1.166 0 2.136-.904 2.136-2.182 0-1.62-.91-2.99-1.378-4.035-.164-.378-.328-.756-.328-.756l-.656 2.508c-.292 1.107-.06 2.453.793 3.132C10.02 21.807 10.99 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z" />
  </svg>
);

const IconGoogle = () => (
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-slate-700">
    <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.18,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.18,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.18,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
  </svg>
);

// --- Platform Options ---
const platformOptions = [
  {
    id: 'meta',
    name: 'Meta',
    icon: <IconMeta />,
    formats: [
      { id: 'feed', name: 'Feed Ad', aspect: '1.91:1', ratio: 1.91 / 1, style: 'Clean and formal' },
      { id: 'story', name: 'Story Ad', aspect: '9:16', ratio: 9 / 16, style: 'Vertical and engaging' }
    ]
  },
  {
    id: 'insta',
    name: 'Instagram',
    icon: <IconInstagram />,
    formats: [
      { id: 'post', name: 'Post (Square)', aspect: '1:1', ratio: 1 / 1, style: 'Vibrant and poppy' },
      { id: 'story', name: 'Story', aspect: '9:16', ratio: 9 / 16, style: 'Visually striking' },
      { id: 'reel', name: 'Reel Cover', aspect: '9:16', ratio: 9 / 16, style: 'Dynamic and eye-catching' }
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: <IconPinterest />,
    formats: [
      { id: 'pin', name: 'Standard Pin', aspect: '2:3', ratio: 2 / 3, style: 'Aesthetic and informative' },
      { id: 'tall-pin', name: 'Tall Pin', aspect: '1:2.1', ratio: 1 / 2.1, style: 'Visually striking' }
    ]
  },
  {
    id: 'google',
    name: 'Google Ads',
    icon: <IconGoogle />,
    formats: [
      { id: 'display', name: 'Display Ad', aspect: '1.91:1', ratio: 1.91 / 1, style: 'Dynamic and versatile' },
      { id: 'square', name: 'Square Ad', aspect: '1:1', ratio: 1 / 1, style: 'Compact and clear' }
    ]
  }
];
// --- Simple Ad Templates (headline + caption presets) ---
const AD_TEMPLATES = [
  {
    id: 'sale',
    name: 'Sale banner',
    headline: 'Flat 40% OFF this week',
    caption:
      'Limited time offer on our best-sellers. Shop now before it ends. #Sale',
  },
  {
    id: 'new-arrival',
    name: 'New arrival',
    headline: 'New arrivals: Velocity 4 running shoes',
    caption:
      'Fresh drops designed for daily runs. Lightweight, responsive and ready to move. #NewDrop',
  },
  {
    id: 'festive',
    name: 'Festive offer',
    headline: 'Festive offers on your favourite styles',
    caption:
      'Celebrate the season with special prices on top picks. Free shipping above ₹999.',
  },
];

// --- Small hook suggestions for headlines ---
const HOOK_SUGGESTIONS = [
  'Limited time offer – ends Sunday!',
  'Free shipping above ₹999.',
  'Only 50 pairs left – don’t miss out.',
];

// --- Tone options for simple local rewrites ---
const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'fun', label: 'Fun' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'hinglish', label: 'Hinglish' },
];

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
 // inside App function
const [currentView, setCurrentView] = useState('home');
const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 text-slate-900 font-inter">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-4rem)]">
            {currentView === 'home' && <HomeDashboard setCurrentView={setCurrentView} />}
            {currentView === 'campaigns' && <CampaignsDashboard />}
            {currentView === 'ads' && <AdsDashboard />}
            {currentView === 'channels' && <ChannelsDashboard />}
            {currentView === 'creator' && <AdCreatorWizard onBackToDashboard={() => setCurrentView('campaigns')} />}
            {currentView === 'billing' && <Billing />}
            {currentView === 'blend' && <PlaceholderView viewName="blend" />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sidebar Component ---
function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'home', name: 'Home', icon: <IconHome /> },
    { id: 'campaigns', name: 'Campaigns', icon: <IconCampaigns /> },
    { id: 'ads', name: 'Ads', icon: <IconAds /> }
  ];
  const settingsItems = [
    { id: 'channels', name: 'Channels', icon: <IconChannels /> },
    { id: 'billing', name: 'Billing', icon: <IconBilling /> }
  ];

  const NavLink = ({ item }) => (
    <button
      onClick={() => setCurrentView(item.id)}
      className={`flex items-center w-full px-4 py-2.5 rounded-lg group transition-all text-sm font-medium
        ${currentView === item.id
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
    >
      <span className="mr-3">{item.icon}</span>
      <span>{item.name}</span>
    </button>
  );

  return (
    <aside className="w-60 bg-white/95 border-r border-slate-200 p-4 flex flex-col shadow-sm h-screen sticky top-0">
      <div className="mb-6 h-10 flex items-center px-2">
        <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.0644 14.7317C15.865 14.9416 15.5484 14.9515 15.3385 14.7521L12.0001 11.6361L8.66173 14.7521C8.45178 14.9515 8.13516 14.9416 7.93574 14.7317C7.73632 14.5218 7.72638 14.2051 7.9159 13.9852L11.5161 9.98516C11.7247 9.75338 12.0833 9.74567 12.2996 9.96745L16.0841 13.9852C16.2736 14.2051 16.2637 14.5218 16.0644 14.7317Z"
            fill="currentColor"
          />
        </svg>
        <span className="text-xl font-extrabold text-slate-900 ml-2 tracking-tight">AdApp</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => <NavLink key={item.id} item={item} />)}
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-6 pb-2 px-2">
          Settings
        </h2>
        {settingsItems.map(item => <NavLink key={item.id} item={item} />)}
      </nav>
      <div className="mt-6 text-[11px] text-slate-400 px-2">
        © {new Date().getFullYear()} AdApp
      </div>
    </aside>
  );
}

// --- Home Dashboard Component ---
function HomeDashboard({ setCurrentView }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-slide-in-up">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/90 border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Welcome back 👋</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Create, manage and track your ad creatives across all your channels.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('creator')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98] transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Ad
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {/* Hero card */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-indigo-50 via-sky-50 to-white border border-indigo-100 shadow-sm">
            <div className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-md">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Launch an ad in minutes
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Use the AI wizard to generate ad copies and creative layouts tailored to your products and channels.
                </p>
                <button
                  onClick={() => setCurrentView('creator')}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-transform"
                >
                  Start Ad Wizard
                  <span>→</span>
                </button>
              </div>
              <div className="mt-2 md:mt-0">
                <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 w-64 text-left shadow-sm">
                  <p className="text-xs text-slate-500 mb-1">Quick stats (demo)</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-3xl font-bold text-slate-900">+124%</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">CTR</span>
                  </div>
                  <p className="text-xs text-emerald-600 mb-3">Better compared to last month</p>
                  <div className="flex justify-between text-[11px] text-slate-500 border-t border-dashed border-slate-200 pt-3">
                    <span>Avg. CPC</span>
                    <span className="font-semibold text-slate-800">₹12.40</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Active campaigns</span>
                    <span className="font-semibold text-slate-800">4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: quick links */}
          <div className="space-y-4">
            <div className="bg-white/95 p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">View Campaigns</h3>
              <p className="text-xs text-slate-500 mb-3">
                Review your past and active ad campaigns, see performance and creatives.
              </p>
              <button
                onClick={() => setCurrentView('campaigns')}
                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Go to Campaigns
                <span className="ml-1">→</span>
              </button>
            </div>
            <div className="bg-white/95 p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Manage Channels</h3>
              <p className="text-xs text-slate-500 mb-3">
                Connect or disconnect Instagram, Meta, Google Ads and more.
              </p>
              <button
                onClick={() => setCurrentView('channels')}
                className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Go to Channels
                <span className="ml-1">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Extra section */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Getting started checklist</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>✓ Connect at least one channel (Meta, Instagram, Google Ads)</li>
              <li>✓ Generate your first creative using the Ad Wizard</li>
              <li>✓ Save creatives into campaigns to track performance over time</li>
              <li>✓ Review performance in the Campaigns dashboard</li>
            </ul>
          </div>

          <div className="space-y-4">
            {/* Live Puma card */}
            <LivePumaCard />

            {/* Tips card */}
            <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Tips</h3>
              <p className="text-xs text-slate-600 mb-2">
                Try testing at least 3 creatives per campaign. Keep messaging consistent,
                and vary layouts and imagery.
              </p>
              <p className="text-xs text-slate-600">
                Use square images for Instagram posts and 9:16 for Stories and Reels to avoid
                auto-cropping and keep your brand visible.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

// ===== Channels Dashboard Component =====
function ChannelsDashboard() {
  const [connections, setConnections] = useState({ meta: false, google: false, pinterest: false });
  const [modal, setModal] = useState({ isOpen: false, platform: null, id: null });
  const [configId, setConfigId] = useState('');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/channels`)
      .then(res => res.json())
      .then(data => {
        const newConns = { ...connections };
        data.forEach(channel => {
          if (channel.isConnected) newConns[channel.platformId] = true;
        });
        setConnections(newConns);
      })
      .catch(err => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const channelData = {
    meta: { name: 'Meta (Instagram / Facebook)', logo: 'https://placehold.co/150x40/4F46E5/ffffff?text=Meta&font=roboto' },
    google: { name: 'Google Ads', logo: 'https://placehold.co/150x40/EA4335/ffffff?text=Google+Ads&font=roboto' },
    pinterest: { name: 'Pinterest', logo: 'https://placehold.co/150x40/E60023/ffffff?text=Pinterest&font=roboto' }
  };

  const handleConnectClick = platformId => {
    setConfigId('');
    setModal({ isOpen: true, platform: channelData[platformId].name, id: platformId });
  };

  const handleCloseModal = () => setModal({ isOpen: false, platform: null, id: null });

  const handleSaveConnection = async () => {
    if (modal.id) {
      try {
        await fetch(`${BACKEND_URL}/api/channels/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platformId: modal.id,
            isConnected: true,
            accountName: configId || 'Demo Account'
          })
        });
        setConnections(prev => ({ ...prev, [modal.id]: true }));
      } catch (e) {
        console.error(e);
      }
      handleCloseModal();
    }
  };

  const ChannelCard = ({ id, name, logo, connected }) => (
    <div className="bg-white/95 p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:-translate-y-[1px] transition-all">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <img src={logo} alt={name} className="h-9 rounded-md border border-slate-100 bg-white" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">{name}</h3>
        <p className="text-xs text-slate-500 mb-4">
          {id === 'meta' && 'Connect Instagram & Facebook Ads Manager.'}
          {id === 'google' && 'Sync your Google Ads account for display ads.'}
          {id === 'pinterest' && 'Connect Pinterest for visual discovery ads.'}
        </p>
      </div>
      <button
        onClick={() => (connected ? null : handleConnectClick(id))}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all
          ${connected
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[0.99]'
          }`}
      >
        {connected ? '✓ Connected' : 'Connect'}
      </button>
    </div>
  );

  const connectedChannels = Object.keys(connections).filter(id => connections[id]);
  const availableChannels = Object.keys(channelData).filter(id => !connections[id]);

  return (
    <>
      <div className="w-full h-full rounded-2xl overflow-hidden">
        {/* header strip */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white py-8 px-6 shadow-sm border-b border-indigo-400">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-semibold mb-1">Connect your marketing channels</h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              Link Instagram, Facebook, Google Ads and more to enable one-click publishing from AdApp.
            </p>
          </div>
        </div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10 bg-slate-50/70">
          <section className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Connected channels</h2>
              {connectedChannels.length > 0 && (
                <span className="text-xs text-slate-500">
                  {connectedChannels.length} connected
                </span>
              )}
            </div>
            {connectedChannels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {connectedChannels.map(id => (
                  <ChannelCard
                    key={id}
                    id={id}
                    name={channelData[id].name}
                    logo={channelData[id].logo}
                    connected
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                No channels connected yet. Connect Meta to start publishing to Instagram.
              </p>
            )}
          </section>

          <section className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Available channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {availableChannels.map(id => (
                <ChannelCard
                  key={id}
                  id={id}
                  name={channelData[id].name}
                  logo={channelData[id].logo}
                  connected={false}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Connect to {modal.platform}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              This is a demo connection. We only store your business handle, never your password.
            </p>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Account handle / ID
            </label>
            <input
              type="text"
              value={configId}
              onChange={e => setConfigId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              placeholder="e.g., @my_business"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConnection}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[0.98] transition-transform"
              >
                Save connection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- ADS DASHBOARD (Fetch from MongoDB) ---
function AdsDashboard() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ads`)
      .then(res => res.json())
      .then(data => setAds(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-slide-in-up">
      <div className="max-w-6xl mx-auto bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Past Ad Designs</h1>
            <p className="text-xs text-slate-500 mt-1">
              All creatives generated via AdApp are saved here.
            </p>
          </div>
        </header>

        {ads.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
            No past ads found. Generate your first creative using the Ad Wizard.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl bg-slate-50/70 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ads.map(ad => (
                <article
                  key={ad._id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md hover:-translate-y-[1px] transition-all"
                >
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                    <img
                      src={ad.imageUrl}
                      className="w-full h-40 object-cover"
                      alt="Ad creative"
                    />
                    <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                      {ad.platform}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {ad.platform} · {ad.format}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {ad.headline}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-slate-500">{ad.status || 'Live'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderView({ viewName }) {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold capitalize text-slate-900">{viewName}</h1>
    </div>
  );
}

// --- Live Puma Card (Home) ---
function LivePumaCard() {
  const [livePost, setLivePost] = useState(null);

  useEffect(() => {
  async function fetchLive() {
    const res = await fetch(
      `http://localhost:3001/api/live-instagram?url=https://www.instagram.com/p/POST_ID/`
    );
    const json = await res.json();
    if (json.success) {
      setLivePost({
        baseLikes: json.likes,
        baseComments: json.comments,
        imageUrl: "https://link-to-puma-ad-image"
      });
    }
  }

  fetchLive();
  const timer = setInterval(fetchLive, 5000);
  return () => clearInterval(timer);
}, []);


  if (!livePost) {
    return (
      <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center justify-center text-[11px] text-slate-400">
        Loading Puma India live post…
      </div>
    );
  }

  const likes = livePost.currentLikes || livePost.baseLikes || 0;
  const comments = livePost.currentComments || livePost.baseComments || 0;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-4 text-white flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            Instagram · Live
          </p>
          <h3 className="text-sm font-bold">
            Puma India – Running Ads
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-full border border-emerald-400/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      <div className="flex gap-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
          <img
            src={livePost.imageUrl}
            alt="Puma Insta"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Metrics */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex gap-4 text-xs">
            <div>
              <p className="text-[10px] uppercase text-slate-400">Likes</p>
              <p className="text-base font-semibold">
                {likes.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">Comments</p>
              <p className="text-base font-semibold">
                {comments.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-1">
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 transition-all duration-700"
                style={{
                  width: `${Math.min(100, (likes / (livePost.baseLikes + 8000)) * 100)}%`
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
              Tracking live engagement for a recent Puma India Instagram creative.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Live Preview Component ---
const LiveAdPreview = ({
  adType,
  posterText,
  postCaption,
  referenceImage,
  selectedFormats,
  showCodeTab,
  autoImageUrl
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedFormats.length > 0) setPreviewIndex(selectedFormats.length - 1);
    else setPreviewIndex(0);
  }, [selectedFormats.length]);

  const activeSelection = selectedFormats.length > 0 ? selectedFormats[previewIndex % selectedFormats.length] : null;
  const activeFormat = activeSelection
    ? (() => {
        const p = platformOptions.find(pl => pl.id === activeSelection.platformId);
        const f = p.formats.find(fmt => fmt.id === activeSelection.formatId);
        return { ...f, platformId: p.id, platformName: p.name };
      })()
    : { name: 'Default (Square)', ratio: 1 / 1, platformName: 'Preview', platformId: 'default' };

  const hasUploadedImage = !!referenceImage;
  const effectiveImgSrc = hasUploadedImage
    ? `data:${referenceImage.mimeType};base64,${referenceImage.base64}`
    : autoImageUrl || null;

  const bgImageStyle =
    effectiveImgSrc
      ? {
          backgroundImage: `url(${effectiveImgSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px) brightness(0.6)',
          transform: 'scale(1.1)'
        }
      : {};

  const handleNext = () => {
    if (selectedFormats.length > 1) setPreviewIndex(prev => (prev + 1) % selectedFormats.length);
  };
  const handlePrev = () => {
    if (selectedFormats.length > 1) setPreviewIndex(prev => (prev - 1 + selectedFormats.length) % selectedFormats.length);
  };

  const imageSource = hasUploadedImage
    ? `data:${referenceImage.mimeType};base64,${referenceImage.base64.substring(0, 50)}...[FULL_BASE64_CODE]...`
    : (autoImageUrl || 'https://via.placeholder.com/400x400');

  const generatedHtml = `<div style="
    max-width: 400px; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
    border: 1px solid #dbdbdb; 
    border-radius: 12px; 
    overflow: hidden; 
    background: #fff; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    
    <div style="padding: 12px; display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); border-radius: 50%;"></div>
        <div>
            <p style="margin: 0; font-weight: 600; font-size: 14px; color: #262626;">YourBrand</p>
            <p style="margin: 0; font-size: 11px; color: #8e8e8e;">Sponsored</p>
        </div>
    </div>

    <div style="width: 100%; aspect-ratio: ${activeFormat.ratio}; overflow: hidden; background: #fafafa;">
        <img src="${imageSource}" alt="Ad Creative" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
    </div>

    <div style="padding: 14px 16px 16px 16px;">
        ${posterText ? `<h3 style="margin: 0 0 8px 0; font-size: 16px; color: #262626; line-height: 1.4;">${posterText}</h3>` : ''}
        <p style="margin: 0 0 14px 0; font-size: 14px; color: #262626; line-height: 1.5; border-top: 1px solid #eee; padding-top: 10px;">
            <span style="font-weight: 600;">YourBrand</span> ${postCaption || 'Caption goes here...'}
        </p>
        
        <a href="#" style="
            display: inline-block; 
            min-width: 140px;
            padding: 10px 18px; 
            background-color: #4F46E5; 
            color: #fff; 
            text-align: center; 
            text-decoration: none; 
            border-radius: 999px; 
            font-weight: 600; 
            font-size: 14px;
            margin: 0 auto;
            transition: background-color 0.2s;">
            Shop Now
        </a>
    </div>
</div>`;

  const handleCopy = () => {
    let codeToCopy = generatedHtml;
    if (hasUploadedImage) {
      codeToCopy = generatedHtml.replace(
        `data:${referenceImage.mimeType};base64,${referenceImage.base64.substring(0, 50)}...[FULL_BASE64_CODE]...`,
        `data:${referenceImage.mimeType};base64,${referenceImage.base64}`
      );
    }
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden sticky top-6">
      {/* TOP TABS */}
      <div className="flex items-center bg-slate-50 border-b border-slate-200 px-2 pt-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-t-lg transition-all
            ${activeTab === 'preview'
              ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
        >
          <span className="text-base">👁️</span> Preview
        </button>
        {showCodeTab && (
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-t-lg transition-all
              ${activeTab === 'code'
                ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
          >
            <span className="text-base">💻</span> Code
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="p-5 min-h-[520px] bg-slate-50/60">
        {/* PREVIEW TAB */}
        {activeTab === 'preview' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Live Mockup
              </h3>
              <span className="px-3 py-1 bg-white text-slate-700 text-[11px] font-semibold rounded-full border border-slate-200 shadow-sm">
                {activeFormat.platformName} • {activeFormat.name}
              </span>
            </div>

            {/* phone frame */}
            <div className="mx-auto max-w-[280px] bg-slate-900 rounded-[20px] p-[3px] shadow-2xl border border-slate-800 relative">
              <div className="bg-black rounded-[16px] overflow-hidden relative min-h-[520px] flex flex-col">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-50 ring-1 ring-slate-700/60" />
                <div className="h-8 w-full flex justify-between items-center px-4 pt-1 z-40 absolute top-0 text-[10px] font-medium text-white/90 mix-blend-difference">
                  <span>10:00</span>
                  <div className="flex gap-1 text-[9px]">
                    <span>5G</span>
                    <span>🔋</span>
                  </div>
                </div>

                <div className="mt-10 px-3 pb-2 flex items-center gap-2 z-30">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full border border-white/25" />
                  <div className="text-white drop-shadow">
                    <p className="text-xs font-semibold">YourBrand</p>
                    <p className="text-[9px] opacity-80">Sponsored</p>
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center w-full bg-slate-900 overflow-hidden">
                  {effectiveImgSrc && (
                    <div
                      className="absolute inset-0 w-full h-full z-0 opacity-60"
                      style={bgImageStyle}
                    />
                  )}
                  <div
                    className="relative z-10 w-full shadow-2xl flex items-center justify-center bg-slate-800"
                    style={{ aspectRatio: activeFormat.ratio }}
                  >
                    {effectiveImgSrc ? (
                      <img
                        src={effectiveImgSrc}
                        className="w-full h-full object-cover"
                        alt="Ad preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <span className="text-2xl">🖼️</span>
                        <span className="text-[11px] mt-1">
                          {adType === 'manual' ? 'Upload image' : 'Select a product image'}
                        </span>
                      </div>
                    )}

                    {posterText && (
                      <div className="absolute bottom-0 w-full px-4 pb-4 pt-6 bg-gradient-to-t from-black/90 via-black/65 to-transparent">
                        <h2 className="text-white font-semibold text-sm text-center leading-snug drop-shadow-lg mb-2">
                          {posterText}
                        </h2>
                        <div className="flex justify-center">
                          <button className="bg-indigo-500 text-white px-5 py-1.5 rounded-full text-[10px] font-semibold uppercase shadow-lg hover:bg-indigo-400 transition">
                            Shop Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-black/92 p-3 text-white z-30 border-t border-white/10">
                  <p className="text-[11px] line-clamp-2">
                    <span className="font-semibold mr-2">YourBrand</span>
                    {postCaption}
                  </p>
                </div>
              </div>
            </div>

            {selectedFormats.length > 0 && (
              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  onClick={handlePrev}
                  disabled={selectedFormats.length <= 1}
                  className="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-40 text-xs"
                >
                  ⬅
                </button>
                <div className="flex gap-1">
                  {selectedFormats.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors
                        ${idx === previewIndex ? 'bg-indigo-600' : 'bg-slate-300'}
                      `}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={selectedFormats.length <= 1}
                  className="p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-40 text-xs"
                >
                  ➡
                </button>
              </div>
            )}
          </div>
        )}

        {/* CODE TAB */}
        {activeTab === 'code' && showCodeTab && (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-semibold text-slate-700">
                HTML embed code
              </h3>
              <button
                onClick={handleCopy}
                className={`text-[11px] px-3 py-1.5 rounded border flex items-center gap-1 transition-all
                  ${copied
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {copied ? '✓ Copied' : '📋 Copy HTML'}
              </button>
            </div>
            <div className="bg-[#1e1e1e] rounded-lg border border-slate-800 shadow-inner flex-1 overflow-hidden flex flex-col min-h-[320px] max-h-[420px]">
              <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-slate-800">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] text-slate-300 font-mono">
                  ad_component.html
                </span>
              </div>
              <div className="p-3 overflow-auto custom-scrollbar flex-1">
                <pre className="font-mono text-[11px] leading-relaxed text-[#9cdcfe] whitespace-pre-wrap break-all">
                  {generatedHtml}
                </pre>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              Copy and paste this HTML into your website to embed the ad design.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. AD CREATOR WIZARD (Main Logic)
// ==========================================

function AdCreatorWizard({ onBackToDashboard }) {
  // --- STATES ---
  const [tone, setTone] = useState('professional');
  const [step, setStep] = useState(1);
  const [adType, setAdType] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [posterText, setPosterText] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [isSuggestingDesc, setIsSuggestingDesc] = useState(false);
  const [isSuggestingCaption, setIsSuggestingCaption] = useState(false);
  const [isAddingHashtags, setIsAddingHashtags] = useState(false);
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [error, setError] = useState(null);
  const [generatedAds, setGeneratedAds] = useState([]);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageName, setReferenceImageName] = useState('');
  const [realProducts, setRealProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [realCollections, setRealCollections] = useState([]);
  const [isCollectionsLoading, setIsCollectionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItemImageUrl, setSelectedItemImageUrl] = useState(null);

  // --- EFFECTS ---
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(h);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchData() {
      if (adType === 'product' && step === 2) {
        setIsProductsLoading(true);
        try {
          const res = await fetch(`${BACKEND_URL}/api/products?search=${debouncedSearchTerm}`);
          setRealProducts(await res.json());
        } catch (e) {
          console.error(e);
        } finally {
          setIsProductsLoading(false);
        }
      } else if (adType === 'collection' && step === 2) {
        setIsCollectionsLoading(true);
        try {
          const res = await fetch(`${BACKEND_URL}/api/collections?search=${debouncedSearchTerm}`);
          setRealCollections(await res.json());
        } catch (e) {
          console.error(e);
        } finally {
          setIsCollectionsLoading(false);
        }
      }
    }
    fetchData();
  }, [step, adType, debouncedSearchTerm]);

  const availableItems = useMemo(
    () => (adType === 'product' ? realProducts : adType === 'collection' ? realCollections : []),
    [adType, realProducts, realCollections]
  );

  // --- HANDLERS ---
  const handleTypeSelect = type => {
    setAdType(type);
    setSelectedItems([]);
    setSelectedItemImageUrl(null);
    setReferenceImage(null);
    setReferenceImageName('');
    setStep(type === 'manual' ? 3 : 2);
  };

  const toggleItemSelect = id => {
    setSelectedItems(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id);
      } else {
        next = [...prev, id];
      }

      // Product / collection flow: first selected item ki image auto use karo
      if (adType !== 'manual') {
        const firstId = next[0];
        const firstItem = availableItems.find(it => it.id === firstId);
        setSelectedItemImageUrl(firstItem?.image || null);
      }

      return next;
    });
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const base64 = await toBase64(file);
      setReferenceImage({ base64, mimeType: file.type });
      setReferenceImageName(file.name);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImageName('');
  };

  // AI Handlers
  const handleSuggestPosterText = async () => {
    setIsSuggestingDesc(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/suggest-poster-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemNames: 'product' })
      });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text)
        setPosterText(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingDesc(false);
    }
  };

  const handleSuggestCaption = async () => {
    setIsSuggestingCaption(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/suggest-caption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemNames: 'product' })
      });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text)
        setPostCaption(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggestingCaption(false);
    }
  };

  const handleAddHashtags = async () => {
    setIsAddingHashtags(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/add-hashtags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemNames: 'product' })
      });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text)
        setPostCaption(prev => prev + ' ' + data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingHashtags(false);
    }
  };
    // --- Apply ready-made template (headline + caption) ---
  const handleApplyTemplate = tpl => {
    if (!tpl) return;
    setPosterText(tpl.headline);
    setPostCaption(tpl.caption);
  };

  // --- Very simple local tone rewriter (demo only) ---
  const applyToneLocally = toneId => {
    if (!postCaption) return;

    let updated = postCaption.trim();

    switch (toneId) {
      case 'fun':
        // Thoda informal + emoji
        updated = updated + ' 😄';
        break;
      case 'luxury':
        updated =
          'Premium pick for serious buyers. ' +
          updated.replace(/sale/gi, 'collection');
        break;
      case 'hinglish':
        updated =
          'Yeh naya drop bohot mast hai! ' + updated;
        break;
      case 'professional':
      default:
        // emojis hata do for professional
        updated = updated.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
        break;
    }

    setPostCaption(updated);
  };


  const toggleFormatSelect = (platformId, formatId) => {
    setSelectedFormats(prev => {
      const exists = prev.some(sel => sel.platformId === platformId && sel.formatId === formatId);
      if (exists) {
        return prev.filter(sel => !(sel.platformId === platformId && sel.formatId === formatId));
      }
      return [...prev, { platformId, formatId }];
    });
  };

  const buildAdsFromSelection = () => {
    const finalImageUrl = referenceImage
      ? `data:${referenceImage.mimeType};base64,${referenceImage.base64}`
      : selectedItemImageUrl || null;

    return selectedFormats.map(format => {
      const p = platformOptions.find(pl => pl.id === format.platformId);
      const f = p.formats.find(fmt => fmt.id === format.formatId);
      return {
        id: `${format.platformId}-${format.formatId}`,
        platform: p.name,
        format: f.name,
        ratio: f.ratio,
        imageUrl: finalImageUrl,
        headline: posterText,
        caption: postCaption,
        isManual: adType === 'manual',
        redirectUrl: p.id === 'insta' ? 'https://instagram.com' : 'https://facebook.com'
      };
    });
  };

  const handleManualContinue = () => {
    if (selectedFormats.length === 0) {
      setError('Select at least one platform / format.');
      return;
    }
    setError(null);
    const ads = buildAdsFromSelection();
    setGeneratedAds(ads);
    setStep(5);
  };

  const handleGenerateAd = async () => {
    setIsGeneratingAd(true);
    setTimeout(() => {
      handleManualContinue();
      setIsGeneratingAd(false);
    }, 1500);
  };

  const resetCreator = () => {
    setStep(1);
    setAdType(null);
    setGeneratedAds([]);
    setSelectedFormats([]);
    setSelectedItems([]);
    setSelectedItemImageUrl(null);
    setReferenceImage(null);
    setReferenceImageName('');
    setPosterText('');
    setPostCaption('');
    onBackToDashboard();
  };

  // --- PUBLISH TO BACKEND FUNCTION ---
  const handleSaveAndPost = async ad => {
    setIsSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: ad.platform,
          format: ad.format,
          headline: ad.headline,
          caption: ad.caption,
          imageUrl: ad.imageUrl
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`🎉 ${data.message}`);
        onBackToDashboard();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Server Error: Is Backend Running?');
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER STEPS ---
  const renderStep1 = () => (
    <div className="text-center py-10">
      <h2 className="text-2xl font-semibold mb-3 text-slate-900">Create a new ad</h2>
      <p className="text-sm text-slate-500 mb-7">
        Choose what you want to promote. You can always switch later.
      </p>
      <div className="flex flex-wrap justify-center gap-5">
        <button
          onClick={() => handleTypeSelect('product')}
          className="border border-slate-200 bg-white p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 w-48 flex flex-col items-center gap-2 text-sm transition-all"
        >
          <span className="text-3xl">🛍️</span>
          <span className="font-semibold text-slate-900">Shopify Product</span>
          <span className="text-[11px] text-slate-500">Pull details from product catalog.</span>
        </button>
        <button
          onClick={() => handleTypeSelect('collection')}
          className="border border-slate-200 bg-white p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 w-48 flex flex-col items-center gap-2 text-sm transition-all"
        >
          <span className="text-3xl">📦</span>
          <span className="font-semibold text-slate-900">Shopify Collection</span>
          <span className="text-[11px] text-slate-500">Promote curated collections.</span>
        </button>
        <button
          onClick={() => handleTypeSelect('manual')}
          className="border border-slate-200 bg-white p-5 rounded-2xl hover:shadow-md hover:border-indigo-200 w-48 flex flex-col items-center gap-2 text-sm transition-all"
        >
          <span className="text-3xl">✍️</span>
          <span className="font-semibold text-slate-900">Custom Ad</span>
          <span className="text-[11px] text-slate-500">Write everything manually.</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2 text-slate-900">Select {adType === 'product' ? 'product' : 'collection'}</h2>
      <p className="text-xs text-slate-500 mb-4">
        Search your Shopify catalog and select one or more items to feature.
      </p>
      <div className="flex items-center gap-2 mb-4">
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {(isProductsLoading || isCollectionsLoading) && (
          <span className="text-[11px] text-slate-400">Loading…</span>
        )}
      </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
        {availableItems.map(item => (
          <div
            key={item.id}
            onClick={() => toggleItemSelect(item.id)}
            className={`border rounded-xl cursor-pointer bg-white transition-all text-xs
              ${selectedItems.includes(item.id)
                ? 'border-indigo-500 ring-1 ring-indigo-200'
                : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
              }`}
          >
            <img
              src={item.image}
              className="w-full h-24 object-cover rounded-t-xl"
              alt={item.name}
            />
            <div className="p-2">
              <p className="line-clamp-2 text-slate-800">{item.name}</p>
            </div>
          </div>
        ))}
        {availableItems.length === 0 && (
          <p className="text-[11px] text-slate-500 col-span-full">
            No items found. Try a different search.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={selectedItems.length === 0}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-transform disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2 text-slate-900">
        {adType === 'manual' ? 'Write your ad copy' : 'Describe your promotion'}
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Add a short headline and caption. You can ask AI to suggest ideas.
      </p>

      <div className="space-y-4">
                {/* Templates picker */}
        <div>
          <p className="text-[11px] text-slate-500 mb-1">
            Or start from a ready template:
          </p>
          <div className="flex flex-wrap gap-2">
            {AD_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-[11px] hover:bg-slate-100"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Headline
          </label>
          <div className="relative">
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm pr-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={posterText}
              onChange={e => setPosterText(e.target.value)}
              placeholder="E.g. Run further, faster in Puma India"
            />
            <button
              onClick={handleSuggestPosterText}
              type="button"
              className="absolute right-2 top-1.5 text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-lg hover:bg-emerald-100 disabled:opacity-60"
              disabled={isSuggestingDesc}
            >
              {isSuggestingDesc ? '…' : 'Suggest'}
            </button>
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Caption
          </label>
          <div className="relative">
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-24 pr-28 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={postCaption}
              onChange={e => setPostCaption(e.target.value)}
              placeholder="Tell people what makes this product/collection special…"
            />
            <div className="absolute right-2 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={handleSuggestCaption}
                className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg hover:bg-indigo-100 disabled:opacity-60"
                disabled={isSuggestingCaption}
              >
                {isSuggestingCaption ? '…' : 'Suggest'}
              </button>
              <button
                type="button"
                onClick={handleAddHashtags}
                className="text-[11px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-60"
                disabled={isAddingHashtags}
              >
                {isAddingHashtags ? '…' : '#'}
              </button>
            </div>
          </div>
                    {/* Tone selector row */}
          <div className="flex flex-wrap items-center justify-between mt-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Tone:</span>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="text-[11px] border border-slate-300 rounded-lg px-2 py-1 bg-white"
              >
                {TONE_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => applyToneLocally(tone)}
                className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
              >
                Apply tone
              </button>
            </div>
          </div>

          {/* Hook suggestions for headline */}
          <div className="mt-3">
            <p className="text-[11px] text-slate-500 mb-1">Quick hooks</p>
            <div className="flex flex-wrap gap-1.5">
              {HOOK_SUGGESTIONS.map(hook => (
                <button
                  key={hook}
                  type="button"
                  onClick={() => setPosterText(hook)}
                  className="px-2 py-1 rounded-full text-[11px] border border-slate-200 bg-slate-50 hover:bg-slate-100"
                >
                  {hook}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Image upload */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {adType === 'manual' ? 'Upload image (recommended)' : 'Reference image (optional)'}
          </label>
          <div className="flex gap-2 items-center mt-1">
            <label className="border border-dashed border-slate-300 px-3 py-2 rounded-lg cursor-pointer bg-slate-50 text-xs hover:bg-slate-100">
              Choose file
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
            {referenceImage && (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                <span className="truncate max-w-[140px]">
                  {referenceImageName || 'Image selected'}
                </span>
                <button
                  type="button"
                  onClick={removeReferenceImage}
                  className="text-red-500 text-xs"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          {adType === 'manual' && !referenceImage && (
            <p className="text-[11px] text-amber-500 mt-1">
              Image is recommended for manual ads to look good in preview.
            </p>
          )}
          {adType !== 'manual' && !referenceImage && selectedItemImageUrl && (
            <p className="text-[11px] text-slate-500 mt-1">
              Using your first selected product/collection image as preview. Uploading a file will override it.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep(adType === 'manual' ? 1 : 2)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!posterText || !postCaption}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-indigo-700 active:scale-[0.98] transition-transform"
        >
          Next: Choose platform
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2 text-slate-900">Select platforms & formats</h2>
      <p className="text-xs text-slate-500 mb-4">
        Pick all the placements where you want to generate creatives.
      </p>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {platformOptions.map(p => (
          <div key={p.id} className="border border-slate-200 rounded-xl bg-white p-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <span className="w-5 h-5">{p.icon}</span> {p.name}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {p.formats.map(f => {
                const isSel = selectedFormats.some(sel => sel.platformId === p.id && sel.formatId === f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFormatSelect(p.id, f.id)}
                    className={`border rounded-lg px-3 py-2 text-[11px] text-left transition-all
                      ${isSel
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-100'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                  >
                    <span className="font-medium text-slate-900 block">{f.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      Aspect {f.aspect}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {f.style}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep(3)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={adType === 'manual' ? handleManualContinue : handleGenerateAd}
          disabled={selectedFormats.length === 0 || isGeneratingAd}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-transform disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed"
        >
          {isGeneratingAd
            ? 'Generating…'
            : adType === 'manual'
              ? 'Continue'
              : 'Generate'}
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => {
    const getPlatformStyle = platform => {
      const p = platform ? platform.toLowerCase() : '';
      if (p.includes('insta')) {
        return {
          btn: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]',
          icon: <IconInstagram />,
          label: 'Post on Instagram'
        };
      }
      if (p.includes('meta') || p.includes('facebook')) {
        return {
          btn: 'bg-[#1877F2]',
          icon: <IconMeta />,
          label: 'Post on Facebook'
        };
      }
      if (p.includes('pinterest')) {
        return {
          btn: 'bg-[#E60023]',
          icon: <IconPinterest />,
          label: 'Post on Pinterest'
        };
      }
      if (p.includes('google')) {
        return {
          btn: 'bg-slate-900',
          icon: <IconGoogle />,
          label: 'Use in Google Ads'
        };
      }
      return {
        btn: 'bg-slate-900',
        icon: '⬇',
        label: 'Download'
      };
    };

    return (
      <div className="text-center pb-16 w-full">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
            Your ads are ready 🚀
          </h2>
          <p className="text-sm text-slate-500">
            Review each creative and publish individually to the selected platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full px-2 sm:px-4">
          {generatedAds.map((ad, idx) => {
            const style = getPlatformStyle(ad.platform);
            return (
              <div
                key={idx}
                className="bg-white/95 rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-lg hover:-translate-y-[1px] transition-all"
              >
                <div className="relative w-full bg-slate-900 pt-[100%] overflow-hidden border-b border-slate-200">
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      className="absolute inset-0 w-full h-full object-contain bg-slate-950"
                      alt="Ad"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs bg-slate-950">
                      No image selected
                    </div>
                  )}
                  <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-white border border-white/20">
                    {ad.platform}
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-100 border border-white/10">
                    {ad.format}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col text-left">
                  <div className="mb-3">
                    {ad.headline && (
                      <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                        {ad.headline}
                      </h3>
                    )}
                    <p className="text-[11px] text-slate-500 line-clamp-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <span className="font-semibold mr-1 text-slate-700">Caption:</span>
                      {ad.caption}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveAndPost(ad)}
                      disabled={isSaving}
                      className={`w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md transition-transform active:scale-[0.97] hover:shadow-lg
                        ${style.btn} ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isSaving ? 'Posting…' : (
                        <>
                          {style.icon}
                          <span>{style.label}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={resetCreator}
          className="mt-10 px-6 py-2 border border-slate-300 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Start over
        </button>
      </div>
    );
  };

  return (
    <div className={`animate-slide-in-up p-4 sm:p-6 md:p-8 mx-auto ${step === 5 ? 'w-full max-w-[1200px]' : 'max-w-6xl'}`}>
      {step < 5 && (
        <div className="mb-6 flex justify-between text-[11px] text-slate-400 border-b border-slate-200 pb-2 max-w-3xl mx-auto">
          <span className={step >= 1 ? 'text-indigo-600 font-semibold' : ''}>Type</span>
          <span className={step >= 2 ? 'text-indigo-600 font-semibold' : ''}>Select</span>
          <span className={step >= 3 ? 'text-indigo-600 font-semibold' : ''}>Describe</span>
          <span className={step >= 4 ? 'text-indigo-600 font-semibold' : ''}>Platform</span>
          <span className={step >= 5 ? 'text-indigo-600 font-semibold' : ''}>Finish</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-2 rounded-lg mb-4 text-xs max-w-3xl mx-auto">
          {error}
        </div>
      )}

      {step === 5 ? (
        <div className="w-full">{renderStep5()}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 min-h-[480px]">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>
          <div className="lg:col-span-1">
            <LiveAdPreview
              adType={adType}
              posterText={posterText}
              postCaption={postCaption}
              referenceImage={referenceImage}
              selectedFormats={selectedFormats}
              showCodeTab={step === 4}
              autoImageUrl={selectedItemImageUrl}
            />
          </div>
        </div>
      )}
    </div>
  );
}
