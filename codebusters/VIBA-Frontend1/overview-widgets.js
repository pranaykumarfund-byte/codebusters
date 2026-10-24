import { summarizeHealthReports } from './health-summary.js';
import { generateAssistantReply } from './assistant-chat.js';

function chatMessageMarkup(message, escapeHtml) {
  const isUser = message.role === 'user';
  return `<div class="ai-chat-message ${isUser ? 'user' : 'assistant'}"><span class="ai-chat-avatar" aria-hidden="true">${isUser ? 'SR' : '✦'}</span><p>${escapeHtml(message.text)}</p></div>`;
}

export function renderAiChat(state, t, escapeHtml) {
  const messages = state.aiChatMessages.map(message => chatMessageMarkup(message, escapeHtml)).join('');
  return `<section class="card ai-chat-card" aria-labelledby="aiChatTitle">
    <div class="card-header ai-chat-header"><div><h2 id="aiChatTitle">✦ ${t('demoAssistant', 'VIBA Assistant')}</h2></div><span class="badge badge-teal">Offline</span></div>
    <p class="ai-chat-disclaimer">${t('assistantDisclaimer', 'This assistant may be inaccurate. Please consult a doctor for health concerns.')}</p>
    <div class="ai-chat-messages" id="aiChatMessages" role="log" aria-live="polite" aria-relevant="additions">${messages}</div>
    <div class="ai-chat-prompts"><button type="button" class="ai-chat-prompt" data-chat-prompt="Tell me about my vitals">${t('askVitals', 'Ask about vitals')}</button><button type="button" class="ai-chat-prompt" data-chat-prompt="Where can I find reports?">${t('askRecords', 'Ask about reports')}</button></div>
    <form id="aiChatForm" class="ai-chat-form"><label class="sr-only" for="aiChatInput">${t('chatPlaceholder', 'Ask a question…')}</label><button type="button" class="ai-chat-mic" data-chat-voice aria-label="${t('voiceInput', 'Speak a message')}" title="${t('voiceInput', 'Speak a message')}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4m-4 0h8"/></svg></button><input id="aiChatInput" name="message" maxlength="400" autocomplete="off" placeholder="${t('chatPlaceholder', 'Ask a question…')}" required><button type="submit" class="btn btn-primary">${t('sendMessage', 'Send')}</button><span class="sr-only" id="aiChatVoiceStatus" aria-live="polite"></span></form>
  </section>`;
}

const wellnessTips = [
    ['💧', 'waterTitle', 'Water break', 'waterText', 'Keep water nearby and sip when thirsty.'],
    ['🍎', 'fruitTitle', 'Add fruit', 'fruitText', 'Enjoy a fruit with a snack or meal, if it suits you.'],
    ['↗', 'movementTitle', 'Gentle movement', 'movementText', 'Stretch or take a short walk when comfortable.'],
    ['☾', 'restTitle', 'Rest moment', 'restText', 'Pause for a breath and make room for rest.'],
  ];

export const wellnessAutoplayDelay = 6000;

export function canAutoAdvanceWellness({ view, paused, reducedMotion, hidden, hovered, focused }) {
  return view === 'overview' && !paused && !reducedMotion && !hidden && !hovered && !focused;
}

export function renderWellnessTip(t, index = 0) {
  const current = ((index % wellnessTips.length) + wellnessTips.length) % wellnessTips.length;
  const [icon, titleKey, title, textKey, text] = wellnessTips[current];
  return `<article class="wellness-tip" aria-roledescription="slide" aria-label="${current + 1} of ${wellnessTips.length}"><span class="wellness-tip-icon" aria-hidden="true">${icon}</span><div><strong>${t(titleKey, title)}</strong><p>${t(textKey, text)}</p></div></article>`;
}

export function renderWellnessPrompts(t, index = 0, paused = false) {
  const current = ((index % wellnessTips.length) + wellnessTips.length) % wellnessTips.length;
  const pauseLabel = paused ? t('resumeTip', 'Resume automatic reminders') : t('pauseTip', 'Pause automatic reminders');
  const pauseIcon = paused ? '▶' : 'Ⅱ';
  return `<aside class="wellness-panel" role="region" aria-roledescription="carousel" aria-label="${t('wellnessTitle', 'Daily wellness reminders')}"><div class="wellness-panel-heading"><span class="wellness-kicker">✳ ${t('wellnessTitle', 'DAILY WELLNESS')}</span><strong>${t('wellnessSubtitle', 'Small steps, one at a time')}</strong></div><div class="wellness-tip-viewport">${renderWellnessTip(t, current)}</div><div class="wellness-controls"><button type="button" data-action="previous-wellness" aria-label="${t('previousTip', 'Previous tip')}">←</button><span class="wellness-counter" aria-live="off">${current + 1} / ${wellnessTips.length}</span><button type="button" data-action="next-wellness" aria-label="${t('nextTip', 'Next tip')}">→</button><button type="button" class="wellness-pause" data-action="toggle-wellness" aria-pressed="${paused}" aria-label="${pauseLabel}" title="${pauseLabel}">${pauseIcon}</button></div><p class="wellness-footnote">${t('wellnessNote', 'General reminders only. Follow guidance from your care team.')}</p></aside>`;
}

export function renderHealthOverview(state, t, escapeHtml, date) {
  const v = state.demoVitals;
  const reportSummary = summarizeHealthReports(state.records);
  const savedBloodGroup = state.profile?.bloodGroup || '';
  const bloodGroup = savedBloodGroup
    ? { value: savedBloodGroup, source: t('profileSetting', 'Saved in profile') }
    : reportSummary.bloodGroup;
  const metrics = [
    ['↕', t('bloodPressure', 'Blood pressure'), `${v.systolic}/${v.diastolic}`, 'mmHg', t('randomDemoValue', 'Random demo value')],
    ['♡', t('heartRate', 'Heart rate'), String(v.heartRate), 'bpm', t('randomDemoValue', 'Random demo value')],
    ['▥', t('bloodCount', 'Blood count'), `Hb ${v.hemoglobin} · WBC ${v.whiteBloodCells}`, 'g/dL · ×10⁹/L', t('randomDemoValue', 'Random demo value')],
    ['◉', t('glucose', 'Glucose'), String(v.glucose), 'mg/dL', t('randomDemoValue', 'Random demo value')],
    ['✚', t('bloodGroup', 'Blood group'), bloodGroup.value, '', bloodGroup.source],
  ];
  const latest = reportSummary.latestLipidReport;
  return `<section class="health-overview" aria-labelledby="healthOverviewTitle"><div class="health-overview-heading"><div><p class="eyebrow">${t('demoValues', 'RANDOM DEMO VALUES')}</p><h2 id="healthOverviewTitle">${t('healthOverview', 'Health overview')}</h2></div><div class="health-overview-actions"><span class="badge badge-blue">${t('demoVitals', 'Fictional demo readings')}</span><button class="btn btn-sm" type="button" data-action="shuffle-demo-vitals">⟳ ${t('shuffleValues', 'Shuffle values')}</button></div></div><div class="health-metric-grid">${metrics.map(([icon, label, value, unit, source]) => `<article class="health-metric"><span class="health-metric-icon" aria-hidden="true">${icon}</span><div><span class="health-metric-label">${label}</span><strong class="health-metric-value">${escapeHtml(value)}</strong><small class="health-metric-source">${escapeHtml([unit, source].filter(Boolean).join(' · '))}</small></div></article>`).join('')}</div>${latest ? `<article class="recent-lab-card"><div class="recent-lab-heading"><div><span class="health-metric-label">${t('latestAvailableReport', 'LATEST AVAILABLE VERIFIED LAB REPORT')}</span><h3>${escapeHtml(latest.title)}</h3></div><span class="report-date">${date(latest.reportDate)}</span></div><p class="lab-values">${escapeHtml(latest.values || '')}</p><p class="subtle-note">Source: ${escapeHtml(latest.provider)} · ${escapeHtml(latest.source)}. Values are displayed as supplied; review the date flag in record details.</p><button class="link-button" data-record="${escapeHtml(latest.id)}">Open report details →</button></article>` : ''}<p class="health-data-note">Vitals are fictional demo samples. Blood group comes from your saved profile or the latest verified report, when available. This is not medical advice.</p></section>`;
}

export function appendAssistantConversation(state, message) {
  state.aiChatMessages.push({ role: 'user', text: message });
  state.aiChatMessages.push({ role: 'assistant', text: generateAssistantReply(message, state.demoVitals, state.language) });
  if (state.aiChatMessages.length > 32) state.aiChatMessages.splice(0, state.aiChatMessages.length - 32);
}
