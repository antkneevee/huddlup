export default function isIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadDesktop = ua.includes('Mac') && navigator.maxTouchPoints > 1;
  return iOS || iPadDesktop;
}
