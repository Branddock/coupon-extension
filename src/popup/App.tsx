import React, { useState, useEffect } from 'react';
import CouponList from './components/CouponList';
import Settings from './components/Settings';
import Header from './components/Header';
import type { Coupon, StorageData } from '../types';

type Tab = 'coupons' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [crowdsourcingEnabled, setCrowdsourcingEnabled] = useState(true);

  useEffect(() => {
    loadCoupons();
    loadSettings();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url) {
        const url = new URL(tab.url);
        const currentDomain = url.hostname.replace(/^www\./, '').toLowerCase();
        setDomain(currentDomain);

        chrome.runtime.sendMessage(
          { type: 'GET_COUPONS_FOR_DOMAIN', domain: currentDomain },
          (result: Coupon[]) => {
            setCoupons(result || []);
            setLoading(false);
          }
        );
      }
    } catch (error) {
      console.error('[Popup] Failed to load coupons:', error);
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get('coupon_data');
      const data = result.coupon_data as StorageData | undefined;
      if (data) {
        setCrowdsourcingEnabled(data.crowdsourcingEnabled ?? true);
      }
    } catch (error) {
      console.error('[Popup] Failed to load settings:', error);
    }
  };

  const handleToggleCrowdsourcing = async (enabled: boolean) => {
    setCrowdsourcingEnabled(enabled);
    try {
      const result = await chrome.storage.local.get('coupon_data');
      const data = (result.coupon_data as StorageData) || {
        coupons: [],
        lastRefresh: 0,
        crowdsourcingEnabled: true,
      };
      data.crowdsourcingEnabled = enabled;
      await chrome.storage.local.set({ coupon_data: data });
    } catch (error) {
      console.error('[Popup] Failed to update settings:', error);
    }
  };

  return (
    <div className="w-96 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col">
      <Header />

      <div className="flex border-b border-slate-200 bg-white px-4">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'coupons'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          💰 Coupons
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'coupons' && (
          <CouponList
            coupons={coupons}
            loading={loading}
            domain={domain}
            onRefresh={loadCoupons}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            crowdsourcingEnabled={crowdsourcingEnabled}
            onToggleCrowdsourcing={handleToggleCrowdsourcing}
          />
        )}
      </div>
    </div>
  );
}