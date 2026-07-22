console.log('[Content] Script loaded');

function detectCheckoutInputs() {
  const inputs = [];
  const selectors = [
    'input[placeholder*="coupon" i]',
    'input[placeholder*="promo" i]',
    'input[placeholder*="code" i]',
    'input[name*="coupon" i]',
    'input[name*="promo" i]',
    'input[name*="code" i]',
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!inputs.includes(el) && el.offsetParent !== null) {
        inputs.push(el);
      }
    });
  });

  return inputs;
}

function injectCode(input, code) {
  try {
    input.value = code;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const container = input.closest('form') || input.parentElement?.parentElement;
    if (container) {
      const buttons = container.querySelectorAll('button');
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        if (text.includes('apply') || text.includes('redeem')) {
          setTimeout(() => btn.click(), 500);
          break;
        }
      }
    }

    console.log('[Inject] Code injected:', code);
  } catch (error) {
    console.error('[Inject] Error:', error);
  }
}

function init() {
  const domain = window.location.hostname.replace('www.', '').toLowerCase();
  console.log('[Content] Domain:', domain);

  chrome.runtime.sendMessage(
    { type: 'GET_COUPONS_FOR_DOMAIN', domain },
    (coupons) => {
      if (!coupons || coupons.length === 0) {
        console.log('[Content] No coupons found');
        return;
      }

      console.log('[Content] Found coupons:', coupons);
      const inputs = detectCheckoutInputs();
      inputs.forEach((input) => {
        if (coupons[0]) {
          injectCode(input, coupons[0].code);
        }
      });
    }
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}