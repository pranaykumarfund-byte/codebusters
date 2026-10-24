/** A local scripted reply generator for the fictional VIBA demo. */
export function generateAssistantReply(message, vitals) {
  const prompt = String(message || '').trim().toLowerCase();
  if (!prompt) return 'Ask me about the demo vitals, reports, sharing, or appointments.';
  if (/\b(hi|hello|hey|namaste)\b/.test(prompt)) {
    return 'Hi! I’m VIBA Assist, the scripted demo helper. What would you like to explore in this health space?';
  }
  if (/pressure|\bbp\b|heart rate|pulse/.test(prompt) && vitals) {
    return `This screen’s random demo snapshot is ${vitals.systolic}/${vitals.diastolic} mmHg with a heart rate of ${vitals.heartRate} bpm. These values are fictional and this chat does not interpret readings.`;
  }
  if (/glucose|sugar/.test(prompt) && vitals) {
    return `The overview’s fictional glucose number is ${vitals.glucose} mg/dL. It was generated for the demo and is not a real report result.`;
  }
  if (/blood count|cbc|hemoglobin|haemoglobin|wbc/.test(prompt) && vitals) {
    return `The demo count card shows hemoglobin ${vitals.hemoglobin} g/dL and WBC ${vitals.whiteBloodCells} ×10⁹/L. Those are random display values, not a lab report.`;
  }
  if (/blood group|blood type/.test(prompt) && vitals) {
    return `The demo profile is currently showing ${vitals.bloodGroup} as a fictional sample. It is not verified personal information.`;
  }
  if (/share|consent|caregiver|access/.test(prompt)) {
    return 'Open Share & Consent to choose a fictional recipient and scope. You can revoke a demo grant at any time; the audit view records the simulated change.';
  }
  if (/appointment|doctor|visit/.test(prompt)) {
    return 'Visit Preparation can help you collect selected demo records for a visit. The names and records in this space are fictional.';
  }
  if (/record|report|lab/.test(prompt)) {
    return 'Open My Health Records to review the synthetic source entries. Report-backed values stay separate from the random demo vitals.';
  }
  return 'I can point you around this demo. Try asking about vitals, reports, sharing, or appointments. My replies are scripted and may be inaccurate.';
}
