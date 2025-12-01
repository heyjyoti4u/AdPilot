import React from 'react';

export default function Billing() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Billing & Subscriptions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Free Plan Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Free Plan</h2>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            $0 <span className="text-base font-normal text-gray-500">/ month</span>
          </p>
          <ul className="space-y-2 text-gray-600 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              5 Ad Generations / month
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Basic Ad Formats
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              1 Connected Account
            </li>
          </ul>
          <button 
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold cursor-not-allowed"
            disabled
          >
            Currently Active
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-500 relative">
          <div className="absolute top-0 right-4 -mt-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Most Popular
          </div>
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Pro Plan</h2>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            $29 <span className="text-base font-normal text-gray-500">/ month</span>
          </p>
          <ul className="space-y-2 text-gray-600 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Unlimited Ad Generations
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              All Ad Formats & Platforms
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Unlimited Connected Accounts
            </li>
          </ul>
          <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>

        {/* Enterprise Plan Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Enterprise</h2>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            Custom
          </p>
          <ul className="space-y-2 text-gray-600 mb-6">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Everything in Pro
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Dedicated Support
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Custom API Access
            </li>
          </ul>
          <button className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors">
            Contact Sales
          </button>
        </div>

      </div>
    </div>
  );
}