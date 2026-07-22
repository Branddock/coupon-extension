import { detectCheckoutInputs, injectCode } from './checkout';
import { normalizeDomain } from '../background/dataSourcing';
import type { Coupon } from '../types';

let currentDomain: string;
let injectedCoupons: Map<string, Coupon> = new Map();
let mutationObserver: MutationObserver | null = null;

function init(): void {
  currentDomain = normalizeDomain(window.location.hostname);
  console.log('[Content] Initialized for domain:', currentDomain);

  chrome.runtime.sendMessage(
    { type: 'GET_COUPONS_FOR_DOMAIN', domain: currentDomain },
    (coupons: Coupon[]) => {
      if (!coupons || coupons.length === 0) {
        console.log('[Content] No coupons found for', currentDomain);
        return;
      }

      console.log('[Content] Received coupons:', coupons);
      coupons.forEach((c) => injectedCoupons.set(c.code, c));

      const inputs = detectCheckoutInputs();
      inputs.forEach((input) => {
        const coupon = coupons[0];
        if (coupon) {
          injectCode(input, coupon.code);
          startObservingForFeedback(input, coupon);
        }
      });
    }
  );

  observeCheckoutChanges();
}

function observeCheckoutChanges(): void {
  if (mutationObserver) mutationObserver.disconnect();

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const newInputs = detectCheckoutInputs();
        newInputs.forEach((input) => {
          if (!input.dataset.couponInjected) {
            const coupon = Array.from(injectedCoupons.values())[0];
            if (coupon) {
              injectCode(input, coupon.code);
              startObservingForFeedback(input, coupon);
            }
          }
        });
      }
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

function startObservingForFeedback(input: HTMLInputElement, coupon: Coupon): void {
  let priceBeforeCode: number | null = null;

  input.addEventListener('change', () => {
    const enteredCode = input.value.trim().toUpperCase();
    if (enteredCode && enteredCode !== coupon.code) {
      console.log('[Content] User entered custom code:', enteredCode);
      priceBeforeCode = extractPriceFromPage();
    }
  });

  const checkoutContainer = input.closest('.checkout') ||
    input.closest('[class*="cart"]') ||
    document.body;

  if (checkoutContainer) {
    const priceObserver = new MutationObserver(() => {
      const currentPrice = extractPriceFromPage();
      const errorMsg = detectErrorMessage();

      if (errorMsg) {
        console.log('[Content] Error detected:', errorMsg);
        chrome.runtime.sendMessage({
          type: 'SUBMIT_COUPON_FEEDBACK',
          domain: currentDomain,
          code: input.value,
          success: false,
        });
      }

      if (priceBeforeCode && currentPrice && currentPrice < priceBeforeCode) {
        console.log('[Content] Price dropped! Code is valid:', input.value);

        chrome.runtime.sendMessage({
          type: 'SUBMIT_COUPON_FEEDBACK',
          domain: currentDomain,
          code: input.value,
          success: true,
        });

        priceBeforeCode = null;
      }
    });

    priceObserver.observe(checkoutContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
}

function extractPriceFromPage(): number | null {
  const priceRegex = /\$\s?([\d,]+\.?\d{0,2})/g;
  const text = document.body.innerText;
  const match = priceRegex.exec(text);
  return match ? parseFloat(match[1].replace(',', '')) : null;
}

function detectErrorMessage(): string | null {
  const errorSelectors = [
    '.error',
    '.error-message',
    '[class*="error"]',
    '[data-error]',
    '.invalid',
  ];

  for (const selector of errorSelectors) {
    const element = document.querySelector(selector);
    if (
      element &&
      (element.textContent?.toLowerCase().includes('invalid') ||
        element.textContent?.toLowerCase().includes('expired') ||
        element.textContent?.toLowerCase().includes('not valid'))
    ) {
      return element.textContent;
    }
  }

  return null;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}