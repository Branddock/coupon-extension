import { fetchOpenSourceCoupons, scrapePublicDirectory } from './dataSourcing';
import { sendCrowdsourcedCode } from '../api/crowdsource';
import type { Coupon, StorageData } from '../types';

const STORAGE_KEY = 'coupon_data';
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

async function tier1FetchOpenSource(): Promise<Coupon[]> {
  try {
    const coupons = await fetchOpenSourceCoupons();
    console.log('[Tier 1] Fetched from open-source DB:', coupons.length);
    return coupons;
  } catch (error) {
    console.error('[Tier 1] Failed to fetch open-source coupons:', error);
    return [];
  }
}

async function tier2ScrapeDirectory(domain: string): Promise<Coupon[]> {
  try {
    const coupons = await scrapePublicDirectory(domain);
    console.log('[Tier 2] Scraped coupons for', domain, ':', coupons.length);
    return coupons;
  } catch (error) {
    console.error('[Tier 2] Failed to scrape directory:', error);
    return [];
  }
}

async function tier3CrowdsourceCode(
  domain: string,
  code: string,
  success: boolean
): Promise<void> {
  try {
    await sendCrowdsourcedCode({ domain, code, success });
    console.log('[Tier 3] Crowdsourced code sent:', code);
  } catch (error) {
    console.error('[Tier 3] Failed to send crowdsourced code:', error);
  }
}

async function hydrateCouponCache(): Promise<void> {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    const lastRefresh = stored.lastRefresh || 0;
    const now = Date.now();

    if (now - lastRefresh < REFRESH_INTERVAL) {
      console.log('[Cache] Using cached coupon data');
      return;
    }

    console.log('[Cache] Refreshing coupon database...');
    const tier1Coupons = await tier1FetchOpenSource();

    const storageData: StorageData = {
      coupons: tier1Coupons,
      lastRefresh: now,
      crowdsourcingEnabled: stored.crowdsourcingEnabled ?? true,
    };

    await chrome.storage.local.set({
      [STORAGE_KEY]: storageData,
      lastRefresh: now,
    });

    console.log('[Cache] Coupon cache updated');
  } catch (error) {
    console.error('[Background] Hydration failed:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_COUPONS_FOR_DOMAIN') {
    handleGetCouponsForDomain(request.domain).then(sendResponse).catch(console.error);
    return true;
  }

  if (request.type === 'SUBMIT_COUPON_FEEDBACK') {
    handleCouponFeedback(
      request.domain,
      request.code,
      request.success
    ).then(sendResponse).catch(console.error);
    return true;
  }

  if (request.type === 'GET_SETTINGS') {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const data = result[STORAGE_KEY] as StorageData | undefined;
      sendResponse({
        crowdsourcingEnabled: data?.crowdsourcingEnabled ?? true,
      });
    });
    return true;
  }
});

async function handleGetCouponsForDomain(domain: string): Promise<Coupon[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const data = stored[STORAGE_KEY] as StorageData | undefined;

  if (!data?.coupons?.length) {
    return tier2ScrapeDirectory(domain);
  }

  return data.coupons.filter((c) => c.domain === domain || domain.includes(c.domain));
}

async function handleCouponFeedback(
  domain: string,
  code: string,
  success: boolean
): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const data = stored[STORAGE_KEY] as StorageData | undefined;

  if (data?.crowdsourcingEnabled) {
    await tier3CrowdsourceCode(domain, code, success);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extension installed/updated');
  hydrateCouponCache();
});

chrome.alarms.create('refresh_coupons', { periodInMinutes: 12 * 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh_coupons') {
    hydrateCouponCache();
  }
});

hydrateCouponCache();