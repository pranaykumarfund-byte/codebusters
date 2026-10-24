const anatomyPoints = [
  { id: 'HV-LAB-1042', x: 47, y: 27, region: 'left chest' },
  { id: 'HV-LAB-1098', x: 54, y: 27, region: 'right chest' },
  { id: 'HV-RX-2071', x: 46, y: 45, region: 'left abdomen' },
  { id: 'HV-CNS-3304', x: 54, y: 45, region: 'right abdomen' },
  { id: 'HV-IMG-4185', x: 50, y: 33, region: 'chest' },
  { id: 'HV-DS-5120', x: 50, y: 5, region: 'head' },
  { id: 'HV-VAX-6833', x: 39, y: 32, region: 'left upper arm' },
  { id: 'HV-LAB-7703', x: 61, y: 32, region: 'right upper arm' },
  { id: 'HV-RX-8840', x: 45, y: 84, region: 'left lower leg' },
];

function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function renderAnatomyHotspots(records = []) {
  const byId = new Map(records.map((record) => [record.id, record]));
  return anatomyPoints.flatMap(({ id, x, y, region }, index) => {
    const record = byId.get(id);
    if (!record) return [];
    const title = escapeHtml(record.title || id);
    return [`<button class="anatomy-hotspot" type="button" data-record="${id}" style="--spot-x:${x}%;--spot-y:${y}%" aria-label="Open ${title}, ${region}" title="${title} · ${region}"><span aria-hidden="true">${index + 1}</span></button>`];
  }).join('');
}

export function mountBodyImage({ image, map, fallback }) {
  if (!image || !map || !fallback) return () => {};

  const showImage = () => {
    map.hidden = false;
    fallback.style.display = 'none';
  };
  const showFallback = () => {
    map.hidden = true;
    fallback.style.display = 'flex';
  };

  image.addEventListener('load', showImage);
  image.addEventListener('error', showFallback);
  if (image.complete) image.naturalWidth ? showImage() : showFallback();

  return () => {
    image.removeEventListener('load', showImage);
    image.removeEventListener('error', showFallback);
  };
}
