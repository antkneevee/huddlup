import isIOS from './isIOS';

describe('isIOS helper', () => {
  const originalUA = navigator.userAgent;
  const originalMTP = navigator.maxTouchPoints;

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', { value: originalUA, configurable: true });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: originalMTP, configurable: true });
  });

  test('detects iPadOS desktop-style UA', () => {
    const ipadOSUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15';
    Object.defineProperty(window.navigator, 'userAgent', { value: ipadOSUA, configurable: true });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 5, configurable: true });

    expect(isIOS()).toBe(true);
  });
});
