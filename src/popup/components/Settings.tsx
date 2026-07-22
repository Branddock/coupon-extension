import React from 'react';

interface Props {
  crowdsourcingEnabled: boolean;
  onToggleCrowdsourcing: (enabled: boolean) => void;
}

export default function Settings({ crowdsourcingEnabled, onToggleCrowdsourcing }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900 font-medium">🔒 Privacy-First Design</p>
        <p className="text-xs text-blue-800 mt-2">
          Your browsing data is never stored. We only collect anonymized coupon feedback when you opt-in.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Anonymous Community Sharing</h3>
            <p className="text-xs text-slate-600 mt-1">
              Help improve CouponHub by sharing working coupons. No personal data is collected.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={crowdsourcingEnabled}
              onChange={(e) => onToggleCrowdsourcing(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          ✓ Shared data: Domain name, coupon code, success status <br />
          ✗ Never shared: Cookies, account info, browsing history
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-2">Local Storage</h3>
        <p className="text-xs text-slate-600">
          Coupons are cached locally on your device for instant access. You can clear this anytime by uninstalling the extension.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 mb-2">About</h3>
        <p className="text-xs text-slate-600 space-y-1">
          <div>Version: 1.0.0</div>
          <div>Manifest: V3</div>
          <div>
            <a
              href="https://github.com/Branddock/coupon-extension"
              className="text-blue-600 hover:underline"
            >
              View on GitHub →
            </a>
          </div>
        </p>
      </div>
    </div>
  );
}