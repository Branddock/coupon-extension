export interface Coupon {
  code: string;
  domain: string;
  discount: string;
  expiry: number | null;
  source: 'open_source_db' | 'scraped_web' | 'crowdsourced';
  timestamp: number;
}

export interface StorageData {
  coupons: Coupon[];
  lastRefresh: number;
  crowdsourcingEnabled: boolean;
}

export interface CrowdsourcePayload {
  domain: string;
  code: string;
  success: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}