import React from 'react';

export default function Header() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-4 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎟️</span>
        <div>
          <h1 className="font-bold text-lg">CouponHub</h1>
          <p className="text-xs text-blue-100">Privacy-First Coupon Finder</p>
        </div>
      </div>
    </div>
  );
}