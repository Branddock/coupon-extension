export function detectCheckoutInputs(): HTMLInputElement[] {
  const inputs: HTMLInputElement[] = [];

  const selectors = [
    'input[placeholder*="coupon" i]',
    'input[placeholder*="promo" i]',
    'input[placeholder*="code" i]',
    'input[name*="coupon" i]',
    'input[name*="promo" i]',
    'input[name*="code" i]',
    'input[id*="coupon" i]',
    'input[id*="promo" i]',
    'input[id*="code" i]',
    'input[aria-label*="coupon" i]',
    'input[aria-label*="promo" i]',
  ];

  selectors.forEach((selector) => {
    const elements = document.querySelectorAll<HTMLInputElement>(selector);
    elements.forEach((el) => {
      if (!inputs.includes(el) && isVisible(el)) {
        inputs.push(el);
      }
    });
  });

  return inputs;
}

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
}

export function injectCode(input: HTMLInputElement, code: string): void {
  try {
    input.value = code;
    input.dataset.couponInjected = 'true';

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const applyButton = findApplyButton(input);
    if (applyButton) {
      setTimeout(() => applyButton.click(), 500);
    }

    console.log('[Inject] Code injected:', code);
  } catch (error) {
    console.error('[Inject] Failed to inject code:', error);
  }
}

function findApplyButton(input: HTMLInputElement): HTMLButtonElement | null {
  const searchContainer = input.closest('form') || input.parentElement?.parentElement;
  if (!searchContainer) return null;

  const buttons = searchContainer.querySelectorAll<HTMLButtonElement>('button');
  for (const button of buttons) {
    const text = button.textContent?.toLowerCase() || '';
    if (
      text.includes('apply') ||
      text.includes('redeem') ||
      text.includes('submit') ||
      text.includes('save')
    ) {
      return button;
    }
  }

  return null;
}

export function observePriceChanges(callback: (oldPrice: number, newPrice: number) => void): void {
  let lastPrice: number | null = null;

  const observer = new MutationObserver(() => {
    const currentPrice = extractPrice();
    if (currentPrice !== null && lastPrice !== null && currentPrice !== lastPrice) {
      callback(lastPrice, currentPrice);
      lastPrice = currentPrice;
    } else if (lastPrice === null && currentPrice !== null) {
      lastPrice = currentPrice;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function extractPrice(): number | null {
  const priceRegex = /\$?\s?([\d,]+(?:\.\d{2})?)/ ;
  const elements = document.querySelectorAll('[class*="price"], [data-price], .total, [class*="total"]');

  for (const el of elements) {
    const text = el.textContent;
    if (text) {
      const match = text.match(priceRegex);
      if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
      }
    }
  }

  return null;
}