const heartRatePattern = /(?:heart\s*rate|pulse)\s*[:=\-]?\s*(\d{2,3})\s*(?:bpm|beats?\s*\/\s*min)/i;
const glucosePattern = /(?:glucose|blood\s*sugar)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(mg\s*\/\s*dL|mmol\s*\/\s*L)/i;
const bloodGroupPattern = /(?:blood\s*group|blood\s*type)\s*[:=\-]?\s*(AB|A|B|O)\s*(positive|negative|\+|\-)?\b/i;

function newestFirst(records) {
  return [...records].sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''));
}

function latestValue(records, pattern, format) {
  for (const report of newestFirst(records)) {
    const match = report.values?.match(pattern);
    if (match) return { value: format(match), source: report };
  }
  return null;
}

export function summarizeHealthReports(records = []) {
  const verified = records.filter(record => record.category === 'Laboratory reports' && record.verification === 'Source verified');
  const heartRate = latestValue(verified, heartRatePattern, match => `${match[1]} bpm`);
  const glucose = latestValue(verified, glucosePattern, match => `${match[1]} ${match[2]}`);
  const bloodGroup = latestValue(verified, bloodGroupPattern, match => `${match[1]} ${match[2] || ''}`.trim());
  const cbc = newestFirst(verified.filter(record => /complete blood count|\bCBC\b/i.test(record.title)))[0];
  const cbcValue = cbc?.values?.match(/(?:hemoglobin|haemoglobin|WBC|RBC|platelets?)\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
  const lipidReport = newestFirst(verified.filter(record => /lipid panel/i.test(record.title)))[0] || null;

  const metric = (reading, absent, source = reading?.source) => ({
    value: reading?.value || absent,
    source: source ? `${source.title} · ${source.reportDate || 'report date unavailable'}` : 'No value recorded in this demo',
  });

  return {
    heartRate: metric(heartRate, 'Not in available reports'),
    bloodCount: cbc ? metric(cbcValue ? { value: cbcValue[1], source: cbc } : null, 'Values not supplied', cbc) : metric(null, 'No CBC report'),
    glucose: metric(glucose, 'Not in available reports'),
    bloodGroup: metric(bloodGroup, 'Not in available reports'),
    latestLipidReport: lipidReport,
  };
}
