import React from 'react';
import CouponCard from './CouponCard';
import type { Coupon } from '../../types';

interface Props {
  coupons: Coupon[];
  loading: boolean;
  domain: string;
  onRefresh: () => void;
}

export default function CouponList({ coupons, loading, domain, onRefresh }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <span className="text-3xl">⏳</span>
        </div>
        <p className="ml-3 text-slate-600 font-medium">Searching for coupons...</p>
      </div>
    );
  }

  if (!coupons.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-4xl mb-2">🔍</p>
        <p className="text-slate-600 font-medium">No coupons found for {domain}</p>
        <p className="text-xs text-slate-500 mt-1">Check back soon or help the community!</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-slate-800">Found {coupons.length} coupon(s)</h2>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          🔄
        </button>
      </div>
      {coupons.map((coupon) => (
        <CouponCard key={coupon.code} coupon={coupon} />
      ))}
    </div>
  );
}