import type { Coupon } from '../types';

const GITHUB_COUPON_FEED_URLS = [
  'https://raw.githubusercontent.com/fityanos/coupon-feed/main/coupons.json',
  'https://raw.githubusercontent.com/discountdb/database/main/codes.json',
];

const PUBLIC_COUPON_DIRECTORIES = [
  'https://www.retailmeknot.com',
  'https://www.dealsplus.com',
];

export async function fetchOpenSourceCoupons(): Promise<Coupon[]> {
  const coupons: Coupon[] = [];

  for (const url of GITHUB_COUPON_FEED_URLS) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) continue;

      const data = await response.json();
      const parsedCoupons = parseGitHubCouponData(data);
      coupons.push(...parsedCoupons);
    } catch (error) {
      console.warn(`[Tier 1] Failed to fetch from ${url}:`, error);
    }
  }

  return coupons;
}

function parseGitHubCouponData(data: unknown): Coupon[] {
  const coupons: Coupon[] = [];

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item.code && item.domain) {
        coupons.push({
          code: item.code,
          domain: normalizeDomain(item.domain),
          discount: item.discount || 'Unknown',
          expiry: item.expiry || null,
          source: 'open_source_db',
          timestamp: Date.now(),
        });
      }
    });
  } else if (data && typeof data === 'object') {
    Object.entries(data).forEach(([domain, codes]) => {
      if (Array.isArray(codes)) {
        codes.forEach((code) => {
          coupons.push({
            code: String(code),
            domain: normalizeDomain(domain),
            discount: 'Unknown',
            expiry: null,
            source: 'open_source_db',
            timestamp: Date.now(),
          });
        });
      }
    });
  }

  return coupons;
}

export async function scrapePublicDirectory(domain: string): Promise<Coupon[]> {
  const coupons: Coupon[] = [];

  for (const directoryUrl of PUBLIC_COUPON_DIRECTORIES) {
    try {
      const response = await fetch(`${directoryUrl}/${domain}`, {
        method: 'GET',
      });

      if (!response.ok) continue;

      const html = await response.text();
      const scraped = extractCodesFromHTML(html, domain);
      coupons.push(...scraped);
    } catch (error) {
      console.warn(`[Tier 2] Failed to scrape from ${directoryUrl}:`, error);
    }
  }

  return coupons;
}

function extractCodesFromHTML(html: string, domain: string): Coupon[] {
  const coupons: Coupon[] = [];

  const patterns = [
    /(?:code|coupon)['"]?:\s*['"]?([A-Z0-9]{3,20})['"]?/gi,
    /([A-Z0-9]{5,15})\s*(?:off|discount|sale)/gi,
    /promo['"]?:\s*['"]?([A-Z0-9]{4,15})['"]?/gi,
  ];

  const foundCodes = new Set<string>();

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const code = match[1].toUpperCase();
      if (code.length >= 3 && !foundCodes.has(code)) {
        foundCodes.add(code);
        coupons.push({
          code,
          domain: normalizeDomain(domain),
          discount: 'Unknown',
          expiry: null,
          source: 'scraped_web',
          timestamp: Date.now(),
        });
      }
    }
  });

  return coupons;
}

export function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];
}