export function mountBodyVideo({ video, canvas, fallback, toggle, reducedMotion = false }) {
  if (!video || !canvas || !fallback || !toggle) return () => {};

  let disposed = false;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  canvas.hidden = true;
  canvas.style.display = 'none';
  fallback.style.display = 'none';
  video.hidden = false;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const syncToggle = () => {
    const playing = !video.paused && !video.ended;
    toggle.textContent = playing ? 'Pause body video' : 'Play body video';
    toggle.setAttribute('aria-label', playing ? 'Pause body video' : 'Play body video');
    toggle.setAttribute('aria-pressed', String(playing));
  };
  const showFallback = () => {
    video.hidden = true;
    video.style.display = 'none';
    fallback.style.display = 'flex';
    toggle.hidden = true;
  };
  const onError = () => showFallback();
  const onPlay = () => syncToggle();
  const onPause = () => syncToggle();
  const onToggle = async () => {
    if (video.paused) {
      try { await video.play(); } catch { syncToggle(); }
    } else {
      video.pause();
    }
  };

  video.addEventListener('error', onError);
  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  toggle.addEventListener('click', onToggle);
  toggle.hidden = false;

  if (!reducedMotion && !prefersReducedMotion) {
    video.play().catch(() => syncToggle());
  }
  syncToggle();

  return () => {
    if (disposed) return;
    disposed = true;
    video.pause();
    video.removeEventListener('error', onError);
    video.removeEventListener('play', onPlay);
    video.removeEventListener('pause', onPause);
    toggle.removeEventListener('click', onToggle);
  };
}
