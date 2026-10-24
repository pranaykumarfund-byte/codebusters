import { summarizeHealthReports } from './health-summary.js';
import { generateAssistantReply } from './assistant-chat.js';

function chatMessageMarkup(message, escapeHtml) {
  const isUser = message.role === 'user';
  return `<div class="ai-chat-message ${isUser ? 'user' : 'assistant'}"><span class="ai-chat-avatar" aria-hidden="true">${isUser ? 'SR' : '✦'}</span><p>${escapeHtml(message.text)}</p></div>`;
}

export function renderAiChat(state, t, escapeHtml) {
  const messages = state.aiChatMessages.map(message => chatMessageMarkup(message, escapeHtml)).join('');
  return `<section class="card ai-chat-card" aria-labelledby="aiChatTitle">
    <div class="card-header ai-chat-header"><div><h2 id="aiChatTitle">✦ ${t('demoAssistant', 'VIBA Assist · Demo')}</h2><p>Local scripted helper</p></div><span class="badge badge-teal">Offline</span></div>
    <p class="ai-chat-disclaimer">${t('assistantDisclaimer', 'Scripted demo replies. They are fictional and may be inaccurate.')}</p>
    <div class="ai-chat-messages" id="aiChatMessages" role="log" aria-live="polite" aria-relevant="additions">${messages}</div>
    <div class="ai-chat-prompts"><button type="button" class="ai-chat-prompt" data-chat-prompt="Tell me about the demo vitals">${t('askVitals', 'Ask about vitals')}</button><button type="button" class="ai-chat-prompt" data-chat-prompt="Where can I find reports?">${t('askRecords', 'Ask about reports')}</button></div>
    <form id="aiChatForm" class="ai-chat-form"><label class="sr-only" for="aiChatInput">${t('chatPlaceholder', 'Ask a question…')}</label><input id="aiChatInput" name="message" maxlength="400" autocomplete="off" placeholder="${t('chatPlaceholder', 'Ask a question…')}" required><button type="submit" class="btn btn-primary">${t('sendMessage', 'Send')}</button></form>
  </section>`;
}

export function renderHealthOverview(state, t, escapeHtml, date) {
  const v = state.demoVitals;
  const metrics = [
    ['↕', t('bloodPressure', 'Blood pressure'), `${v.systolic}/${v.diastolic}`, 'mmHg'],
    ['♡', t('heartRate', 'Heart rate'), String(v.heartRate), 'bpm'],
    ['▥', t('bloodCount', 'Blood count'), `Hb ${v.hemoglobin} · WBC ${v.whiteBloodCells}`, 'g/dL · ×10⁹/L'],
    ['◉', t('glucose', 'Glucose'), String(v.glucose), 'mg/dL'],
    ['✚', t('bloodGroup', 'Blood group'), v.bloodGroup, 'fictional sample'],
  ];
  const latest = summarizeHealthReports(state.records).latestLipidReport;
  return `<section class="health-overview" aria-labelledby="healthOverviewTitle"><div class="health-overview-heading"><div><p class="eyebrow">${t('demoValues', 'RANDOM DEMO VALUES')}</p><h2 id="healthOverviewTitle">${t('healthOverview', 'Health overview')}</h2></div><div class="health-overview-actions"><span class="badge badge-blue">${t('demoVitals', 'Fictional demo readings')}</span><button class="btn btn-sm" type="button" data-action="shuffle-demo-vitals">⟳ ${t('shuffleValues', 'Shuffle values')}</button></div></div><div class="health-metric-grid">${metrics.map(([icon, label, value, unit]) => `<article class="health-metric"><span class="health-metric-icon" aria-hidden="true">${icon}</span><div><span class="health-metric-label">${label}</span><strong class="health-metric-value">${escapeHtml(value)}</strong><small class="health-metric-source">${escapeHtml(unit)} · ${t('randomDemoValue', 'Random demo value')}</small></div></article>`).join('')}</div>${latest ? `<article class="recent-lab-card"><div class="recent-lab-heading"><div><span class="health-metric-label">${t('latestAvailableReport', 'LATEST AVAILABLE VERIFIED LAB REPORT')}</span><h3>${escapeHtml(latest.title)}</h3></div><span class="report-date">${date(latest.reportDate)}</span></div><p class="lab-values">${escapeHtml(latest.values || '')}</p><p class="subtle-note">Source: ${escapeHtml(latest.provider)} · ${escapeHtml(latest.source)}. Values are displayed as supplied; review the date flag in record details.</p><button class="link-button" data-record="${escapeHtml(latest.id)}">Open report details →</button></article>` : ''}<p class="health-data-note">Random values are fictional interface samples; they are not in your records, are not from a recent report, and are not medical advice.</p></section>`;
}

export function appendAssistantConversation(state, message) {
  state.aiChatMessages.push({ role: 'user', text: message });
  state.aiChatMessages.push({ role: 'assistant', text: generateAssistantReply(message, state.demoVitals) });
  if (state.aiChatMessages.length > 32) state.aiChatMessages.splice(0, state.aiChatMessages.length - 32);
}
