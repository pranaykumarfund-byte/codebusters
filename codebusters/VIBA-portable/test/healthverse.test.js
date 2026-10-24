import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptanceTestCases } from '../server/demo-tests.js';
import { summarizeHealthReports } from '../public/health-summary.js';
import { generateDemoVitals } from '../public/health-demo.js';
import { generateAssistantReply } from '../public/assistant-chat.js';
import { appendAssistantConversation, renderAiChat, renderHealthOverview } from '../public/overview-widgets.js';

for(const [name,run] of acceptanceTestCases())test(name,run);

test('health summary never invents missing heart rate, glucose, or blood group', () => {
  const summary = summarizeHealthReports([]);
  assert.equal(summary.heartRate.value, 'Not in available reports');
  assert.equal(summary.glucose.value, 'Not in available reports');
  assert.equal(summary.bloodGroup.value, 'Not in available reports');
});

test('health summary keeps CBC values unavailable when a report has no counts', () => {
  const summary = summarizeHealthReports([{ category: 'Laboratory reports', verification: 'Source verified', title: 'Complete blood count', reportDate: '2025-08-15', values: 'Synthetic values shown for interface demonstration only.' }]);
  assert.equal(summary.bloodCount.value, 'Values not supplied');
  assert.match(summary.bloodCount.source, /2025-08-15/);
});

test('health summary extracts report-backed measurements and their provenance', () => {
  const summary = summarizeHealthReports([{ category: 'Laboratory reports', verification: 'Source verified', title: 'Vitals and chemistry', reportDate: '2026-06-02', values: 'Heart rate: 72 bpm · Glucose: 98 mg/dL · Blood group: O positive' }]);
  assert.equal(summary.heartRate.value, '72 bpm');
  assert.equal(summary.glucose.value, '98 mg/dL');
  assert.equal(summary.bloodGroup.value, 'O positive');
  assert.match(summary.glucose.source, /Vitals and chemistry · 2026-06-02/);
});

test('health summary excludes review-needed copies from report metrics', () => {
  const summary = summarizeHealthReports([{ category: 'Laboratory reports', verification: 'Needs review', title: 'Lipid panel — scanned copy', reportDate: '2026-06-02', values: 'Heart rate: 90 bpm · Glucose: 110 mg/dL · Blood group: A positive' }]);
  assert.equal(summary.heartRate.value, 'Not in available reports');
  assert.equal(summary.glucose.value, 'Not in available reports');
  assert.equal(summary.bloodGroup.value, 'Not in available reports');
});

test('demo vitals are reproducible from a controlled random source and include all requested values', () => {
  const vitals = generateDemoVitals(() => 0.5);
  assert.deepEqual(vitals, {
    systolic: 125,
    diastolic: 80,
    heartRate: 81,
    hemoglobin: '13.4',
    whiteBloodCells: '7.5',
    glucose: 109,
    bloodGroup: 'AB+',
  });
});

test('demo vitals stay within documented display-only ranges', () => {
  const low = generateDemoVitals(() => 0);
  const high = generateDemoVitals(() => 0.999999);
  assert.deepEqual([low.systolic, low.diastolic, low.heartRate, low.glucose, low.bloodGroup], [108, 68, 58, 72, 'A+']);
  assert.deepEqual([high.systolic, high.diastolic, high.heartRate, high.glucose, high.bloodGroup], [142, 92, 104, 146, 'O-']);
  assert.ok(Number(low.hemoglobin) >= 10.8 && Number(high.hemoglobin) <= 16.0);
  assert.ok(Number(low.whiteBloodCells) >= 4.1 && Number(high.whiteBloodCells) <= 10.9);
});

test('mock assistant replies about the current fictional blood pressure and heart rate', () => {
  const vitals = generateDemoVitals(() => 0.5);
  const reply = generateAssistantReply('What is my blood pressure?', vitals);
  assert.match(reply, /125\/80 mmHg/);
  assert.match(reply, /81 bpm/);
  assert.match(reply, /fictional/);
});

test('mock assistant gives helpful scripted replies for common and unknown prompts', () => {
  const vitals = generateDemoVitals(() => 0.5);
  assert.match(generateAssistantReply('Where are my reports?', vitals), /My Health Records/);
  assert.match(generateAssistantReply('How do I share?', vitals), /Share & Consent/);
  assert.match(generateAssistantReply('something else', vitals), /scripted/);
  assert.match(generateAssistantReply('hello', vitals), /Hi!/);
});

test('chat appends both user and assistant messages and keeps a bounded session history', () => {
  const state = { demoVitals: generateDemoVitals(() => 0.5), aiChatMessages: [] };
  appendAssistantConversation(state, 'Tell me about glucose');
  assert.equal(state.aiChatMessages.length, 2);
  assert.equal(state.aiChatMessages[0].role, 'user');
  assert.match(state.aiChatMessages[1].text, /109 mg\/dL/);
  state.aiChatMessages = Array.from({ length: 32 }, () => ({ role: 'assistant', text: 'old' }));
  appendAssistantConversation(state, 'hello');
  assert.equal(state.aiChatMessages.length, 32);
  assert.equal(state.aiChatMessages.at(-2).role, 'user');
});

test('overview renders labeled synthetic readings separately from available source reports', () => {
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const view = renderHealthOverview({ demoVitals: generateDemoVitals(() => 0.5), records: [] }, (_key, english) => english, escapeHtml, value => value);
  assert.match(view, /RANDOM DEMO VALUES/);
  assert.match(view, /125\/80/);
  assert.match(view, /Hb 13\.4 · WBC 7\.5/);
  assert.match(view, /Shuffle values/);
  assert.match(view, /not in your records/);
});

test('chat panel renders safe message text and offline scripted-demo boundaries', () => {
  const state = { aiChatMessages: [{ role: 'user', text: '<img src=x onerror=alert(1)>' }] };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const view = renderAiChat(state, (_key, english) => english, escapeHtml);
  assert.match(view, /Offline/);
  assert.match(view, /may be inaccurate/);
  assert.match(view, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(view, /<img src=x/);
  assert.match(view, /id="aiChatForm"/);
});

test('health summary surfaces the newest verified lipid report', () => {
  const summary = summarizeHealthReports([
    { category: 'Laboratory reports', verification: 'Source verified', title: 'Lipid panel', reportDate: '2026-04-13', values: 'Total cholesterol: 182 mg/dL' },
    { category: 'Laboratory reports', verification: 'Source verified', title: 'Lipid panel', reportDate: '2026-05-13', values: 'Total cholesterol: 176 mg/dL' },
  ]);
  assert.equal(summary.latestLipidReport.reportDate, '2026-05-13');
  assert.match(summary.latestLipidReport.values, /176 mg\/dL/);
});
