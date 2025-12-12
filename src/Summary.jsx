import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  ArrowLeft, 
  TrendingUp, 
  PieChart as PieIcon, 
  Share2, 
  Facebook, 
  Instagram, 
  Pin // Using Pin icon for Pinterest
} from 'lucide-react';

export default function SummaryPage({ campaign, onBack }) {
  const reportRef = useRef(null);
  const name = campaign?.name || campaign?.headline || 'Campaign';

  // --- 1. Data Logic ---
  
  // Check if ads actually exist
  const hasAds = Array.isArray(campaign?.ads) && campaign.ads.length > 0;

  // Basic numbers (Force to 0 if no ads exist)
  const trackedClicks = hasAds ? (campaign?.clicks || 0) : 0;
  const orders = hasAds ? (campaign?.purchases || 0) : 0;
  
  const adClicks = hasAds
    ? campaign.ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
    : 0;

  const avgOrderValue = campaign?.averageOrderValue || 1850;

  // Determine base metrics
  let baseClicks = 0;
  if (trackedClicks > 0) baseClicks = trackedClicks;
  else if (adClicks > 0) baseClicks = adClicks;

  // Calculate Revenue
  let baseRevenue = 0;
  if (orders > 0) {
    baseRevenue = orders * avgOrderValue;
  } else if (baseClicks > 0) {
    // Estimate revenue based on clicks if no direct orders tracked
    baseRevenue = Math.round(baseClicks * 0.035 * avgOrderValue);
  }

  const totalClicks = baseClicks;
  const approxConvRate = baseClicks > 0 ? ((orders || baseClicks * 0.035) / baseClicks) * 100 : 0;
  
  // Is the dashboard effectively empty?
  const noData = !hasAds || (baseRevenue === 0 && totalClicks === 0);

  // --- 2. Platform Specific Logic (Splitting the Totals) ---
  
  // Note: In a real app, you would sum these from your ad objects directly.
  // For now, we split the 'totalClicks' and 'baseRevenue' to populate the cards.
  let metaClicks = 0, instaClicks = 0, pinClicks = 0;
  let metaRev = 0, instaRev = 0, pinRev = 0;

  if (totalClicks > 0) {
    metaClicks = Math.round(totalClicks * 0.45);
    instaClicks = Math.round(totalClicks * 0.35);
    pinClicks = totalClicks - metaClicks - instaClicks; // Remainder
  }

  if (baseRevenue > 0) {
    metaRev = Math.round(baseRevenue * 0.45);
    instaRev = Math.round(baseRevenue * 0.35);
    pinRev = baseRevenue - metaRev - instaRev;
  }

  const platformData = [
    { name: 'Meta', value: metaRev, color: '#1877F2' },
    { name: 'Instagram', value: instaRev, color: '#E4405F' },
    { name: 'Pinterest', value: pinRev, color: '#BD081C' },
  ];

  // --- 3. Mock Chart Data ---
  const monthlyData = [
    { name: 'Jan', sales: noData ? 0 : Math.round(baseRevenue * 0.12) },
    { name: 'Feb', sales: noData ? 0 : Math.round(baseRevenue * 0.17) },
    { name: 'Mar', sales: noData ? 0 : Math.round(baseRevenue * 0.16) },
    { name: 'Apr', sales: noData ? 0 : Math.round(baseRevenue * 0.21) },
    { name: 'May', sales: noData ? 0 : Math.round(baseRevenue * 0.2) },
    { name: 'Jun', sales: noData ? 0 : Math.round(baseRevenue * 0.14) },
  ];

  // --- 4. Download Handlers ---
  const handleDownloadImage = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${name.replace(/\s+/g, '_')}_Report.png`;
      link.click();
    }
  };

  const handleDownloadCSV = () => {
    let csv = `"Metric","Value"\n`;
    csv += `"Total Clicks","${totalClicks}"\n`;
    csv += `"Meta Clicks","${metaClicks}"\n`;
    csv += `"Instagram Clicks","${instaClicks}"\n`;
    csv += `"Pinterest Clicks","${pinClicks}"\n`;
    csv += `"Total Revenue","${baseRevenue}"\n\n`;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}-data.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-inter">
      {/* Top Controls */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8">
        <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to details
        </button>
        <div className="flex gap-2">
           <button disabled={noData} onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50">
            <Download className="w-3 h-3" /> CSV Data
          </button>
          <button disabled={noData} onClick={handleDownloadImage} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            <Share2 className="w-3 h-3" /> Download Report
          </button>
        </div>
      </div>

      {/* Capture Area */}
      <div ref={reportRef} className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Campaign Performance</h1>
          <p className="text-slate-500 mt-2">Aggregated insights for <span className="font-semibold text-indigo-600">{name}</span></p>
        </div>

        {/* --- GLOBAL KPI SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard title="Total Revenue" value={`₹${baseRevenue.toLocaleString()}`} subtitle="Est. based on clicks" color="text-emerald-600" bg="bg-emerald-50" />
          <KpiCard title="Total Clicks" value={totalClicks.toLocaleString()} subtitle="Across all platforms" color="text-slate-900" bg="bg-slate-50" />
          <KpiCard title="Est. ROI" value={noData ? '0.0×' : '3.2×'} subtitle="Return on Ad Spend" color="text-purple-600" bg="bg-purple-50" />
          <KpiCard title="Conversion Rate" value={noData ? '0.0%' : `${approxConvRate.toFixed(1)}%`} subtitle="Click to Purchase" color="text-blue-600" bg="bg-blue-50" />
        </div>

        {/* --- NEW PLATFORM KPI SECTION --- */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Platform Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Meta Card */}
            <PlatformCard 
              icon={<Facebook className="w-5 h-5 text-white" />}
              name="Meta (Facebook)"
              clicks={metaClicks}
              revenue={metaRev}
              color="bg-[#1877F2]"
              textColor="text-[#1877F2]"
              bgHex="#eff6ff"
            />

            {/* Instagram Card */}
            <PlatformCard 
              icon={<Instagram className="w-5 h-5 text-white" />}
              name="Instagram"
              clicks={instaClicks}
              revenue={instaRev}
              color="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" // Insta Gradient
              textColor="text-[#E4405F]"
              bgHex="#fff1f2"
            />

            {/* Pinterest Card */}
            <PlatformCard 
              icon={<Pin className="w-5 h-5 text-white" />}
              name="Pinterest"
              clicks={pinClicks}
              revenue={pinRev}
              color="bg-[#BD081C]"
              textColor="text-[#BD081C]"
              bgHex="#fef2f2"
            />
          </div>
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Sales Trend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500"/> Annual Sales Trend
                </h3>
              </div>
            </div>
            <div className="h-64 w-full">
              {noData ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Platform Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-6">
               <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <PieIcon className="w-5 h-5 text-indigo-500"/> Revenue Share
                </h3>
              </div>
            </div>
            <div className="h-64 w-full relative">
              {noData ? (
                <EmptyState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Center Text for Donut */}
              {!noData && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
                  <p className="text-xs text-slate-400 font-medium">Top Source</p>
                  <p className="text-sm font-bold text-slate-700">Meta</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="mt-12 text-center border-t border-slate-100 pt-6">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Generated by AdGenius • Confidential Report</p>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

const KpiCard = ({ title, value, subtitle, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
    <div className={`w-fit px-2 py-1 rounded-md text-[10px] font-bold uppercase ${color} ${bg} mb-2`}>
      {title}
    </div>
    <p className={`text-3xl font-extrabold ${color} mt-1`}>{value}</p>
    <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
  </div>
);

// New Component for Platform Specific Data
const PlatformCard = ({ icon, name, clicks, revenue, color, textColor, bgHex }) => (
  <div className="flex flex-col justify-between p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group" style={{ backgroundColor: bgHex }}>
    <div className="flex items-center gap-3 mb-4 z-10">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${color}`}>
        {icon}
      </div>
      <span className="font-bold text-slate-700">{name}</span>
    </div>
    
    <div className="z-10">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs text-slate-500 uppercase font-semibold">Clicks</span>
        <span className={`text-xl font-extrabold ${textColor}`}>{clicks.toLocaleString()}</span>
      </div>
      <div className="w-full bg-slate-200/50 h-1.5 rounded-full mb-3">
         <div className={`h-1.5 rounded-full ${color}`} style={{ width: clicks > 0 ? '70%' : '0%' }}></div>
      </div>
      
      <div className="flex justify-between items-end">
        <span className="text-xs text-slate-500 uppercase font-semibold">Revenue</span>
        <span className={`text-sm font-bold ${textColor}`}>₹{revenue.toLocaleString()}</span>
      </div>
    </div>
    
    {/* Decorative background circle */}
    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500 ${color}`}></div>
  </div>
);

const EmptyState = () => (
  <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
    <p className="text-sm font-medium">No Data Available</p>
    <p className="text-xs">Zero ad activity detected</p>
  </div>
);