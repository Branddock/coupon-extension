import React, { useState } from 'react';
import SourceBadge from './SourceBadge';
import type { Coupon } from '../../types';

interface Props {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="font-mono text-lg font-bold text-slate-900 break-all">
            {coupon.code}
          </div>
          <p className="text-sm text-slate-600 mt-1">{coupon.discount}</p>
        </div>
        <button
          onClick={handleCopy}
          className="ml-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <SourceBadge source={coupon.source} />
        {coupon.expiry && (
          <span className="text-xs text-slate-500">
            ⏰ {new Date(coupon.expiry).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}