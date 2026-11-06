/* Meta Pixel：申込みCTA（公式LINE）クリックで Lead を1回だけ送信する（2026-11-06）
   - 対象：href が LINE（liff.line.me / line.me / lin.ee）のリンク。このLPでは申込みボタン4か所のみ該当。
   - 通常の閲覧・スクロール・LINE以外のリンクでは送信しない。
   - 受付終了でhrefが外れたボタンは対象外。
   - クリック1回につき1回。ダブルタップ等の連続送信は同じボタンで1秒間抑止。
   - CTAは target="_blank"（新しいタブ）なので、送信中にこのページが閉じることはない。 */
(() => {
  'use strict';
  const PIXEL_ID = '2170507383557687';
  const LINE_HOSTS = ['liff.line.me', 'line.me', 'lin.ee'];
  const lastSent = new WeakMap();
  const isLineLink = a => {
    const href = a.getAttribute('href');
    if (!href) return false;
    try { return LINE_HOSTS.includes(new URL(href, location.href).hostname); } catch { return false; }
  };
  document.addEventListener('click', event => {
    const a = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!a || !isLineLink(a)) return;
    const now = Date.now();
    if (now - (lastSent.get(a) || 0) < 1000) return;
    lastSent.set(a, now);
    if (typeof window.fbq === 'function') window.fbq('trackSingle', PIXEL_ID, 'Lead');
  }, true);
})();
