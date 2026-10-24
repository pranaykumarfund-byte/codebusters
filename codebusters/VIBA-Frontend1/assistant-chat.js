/** Local scripted replies for VIBA Assistant. */
export function generateAssistantReply(message, vitals, language = 'en') {
  const prompt = String(message || '').trim().toLowerCase();
  const te = language === 'te';
  if (!prompt) return te ? 'రీడింగ్‌లు, నివేదికలు, భాగస్వామ్యం లేదా అపాయింట్‌మెంట్‌ల గురించి అడగండి.' : 'Ask me about readings, reports, sharing, or appointments.';
  const aboutReports = /\breports?\b|\blabs?\b|laboratory|\bcbc\b|\bblood tests?\b|\btest results?\b|\bscan\b|imaging|\b(?:medical|health) records?\b|\bmy records?\b|నివేదిక|రిపోర్ట్|ల్యాబ్|పరీక్ష ఫలితం|రక్త పరీక్ష|రికార్డులు/.test(prompt);
  const asksForAdvice = /\bsuggest(?:ion|ions|ed)?\b|\badvice\b|\brecommend(?:ation|ations|ed)?\b|\bshould i\b|\bwhat should i\b|\bwhat can i do\b|\bwhat do i do\b|\bhow should i\b|\bhow can i\b|\bany tips\b|\btips for\b|treatment|\btreat\b|\bcure\b|medicine|medication|remedy|home remedy|సలహా|సూచన|సూచించండి|సిఫార్సు|ఏం చేయాలి|ఏమి చేయాలి|ఇప్పుడు.*చేయాలి|నాకు.*ఏం చేయాలి|చికిత్స|మందు|ఔషధం/.test(prompt);
  const symptomConcern = /headache|migraine|fever|cough|cold|sore throat|chest pain|stomach pain|abdominal pain|back pain|joint pain|pain|nausea|vomit|dizz(?:y|iness)|shortness of breath|breathing problem|rash|bleeding|swelling|weakness|హెడ్.?ఏక్|తలనొప్పి|జ్వరం|దగ్గు|జలుబు|గొంతు నొప్పి|ఛాతి నొప్పి|కడుపు నొప్పి|వెన్నునొప్పి|నొప్పి|వాంతి|వికారం|తల తిరగడం|శ్వాస ఇబ్బంది|దద్దుర్లు|రక్తస్రావం|వాపు|బలహీనత/.test(prompt);
  const doctorReply = te ? 'క్షమించండి, నేను రోగ నిర్ధారణ చేయడానికి లేదా వైద్య సలహాలు ఇవ్వడానికి అధికారం కలిగి లేను. దయచేసి వైద్యుడిని కలవండి.' : 'Sorry, I’m not authorized to diagnose or provide medical suggestions. Please visit a doctor.';
  if ((asksForAdvice || symptomConcern) && !aboutReports) return doctorReply;
  if (aboutReports) {
    return te ? 'నివేదిక మరియు దాని మూలాన్ని చూడటానికి “నా ఆరోగ్య రికార్డులు” తెరవండి. నివేదిక అర్థం చేసుకోవడం లేదా చికిత్స సలహాల కోసం వైద్యుడిని సంప్రదించండి.' : 'Open My Health Records to review the report and its source. For interpretation or treatment recommendations, please visit your doctor.';
  }
  if (/\b(hi|hello|hey|namaste)\b|నమస్కారం/.test(prompt)) {
    return te ? 'నమస్కారం! నేను VIBA Assistant. ఈ ఆరోగ్య ప్రదేశంలో మీరు ఏమి చూడాలనుకుంటున్నారు?' : 'Hi! I’m VIBA Assistant. What would you like to explore in this health space?';
  }
  if (/pressure|\bbp\b|heart rate|pulse|రక్తపోటు|బీపీ|హృదయ స్పందన|గుండె స్పందన/.test(prompt) && vitals) {
    return te ? `ఈ తెరపై నమూనా రీడింగ్ ${vitals.systolic}/${vitals.diastolic} mmHg; హృదయ స్పందన ${vitals.heartRate} bpm. ఇవి కల్పిత విలువలు; ఈ చాట్ రీడింగ్‌లను విశ్లేషించదు.` : `This screen’s sample reading is ${vitals.systolic}/${vitals.diastolic} mmHg with a heart rate of ${vitals.heartRate} bpm. These values are fictional and this chat does not interpret readings.`;
  }
  if (/glucose|sugar|గ్లూకోజ్|చక్కెర/.test(prompt) && vitals) {
    return te ? `సారాంశంలో చూపిన కల్పిత గ్లూకోజ్ విలువ ${vitals.glucose} mg/dL. ఇది నమూనా విలువ మాత్రమే; నిజమైన నివేదిక ఫలితం కాదు.` : `The overview’s fictional glucose number is ${vitals.glucose} mg/dL. It is a sample value, not a real report result.`;
  }
  if (/blood count|cbc|hemoglobin|haemoglobin|wbc|రక్త గణన|హీమోగ్లోబిన్|హిమోగ్లోబిన్/.test(prompt) && vitals) {
    return te ? `రక్త గణన కార్డ్‌లో హీమోగ్లోబిన్ ${vitals.hemoglobin} g/dL, WBC ${vitals.whiteBloodCells} ×10⁹/Lగా చూపబడింది. ఇవి యాదృచ్ఛిక ప్రదర్శన విలువలు; ల్యాబ్ నివేదిక కాదు.` : `The blood count card shows hemoglobin ${vitals.hemoglobin} g/dL and WBC ${vitals.whiteBloodCells} ×10⁹/L. Those are random display values, not a lab report.`;
  }
  if (/blood group|blood type|రక్త వర్గం|రక్తగ్రూప్/.test(prompt) && vitals) {
    return te ? `ప్రొఫైల్‌లో ${vitals.bloodGroup} కల్పిత నమూనాగా చూపబడుతోంది. ఇది ధృవీకరించిన వ్యక్తిగత సమాచారం కాదు.` : `Your profile is currently showing ${vitals.bloodGroup} as a fictional sample. It is not verified personal information.`;
  }
  if (/share|consent|caregiver|access|పంచుకో|భాగస్వామ్యం|సమ్మతి|సంరక్షక|యాక్సెస్/.test(prompt)) {
    return te ? 'కల్పిత గ్రహీత, పరిధిని ఎంచుకోవడానికి “భాగస్వామ్యం & సమ్మతి” తెరవండి. యాక్సెస్‌ను ఎప్పుడైనా రద్దు చేయవచ్చు; మార్పు ఆడిట్‌లో నమోదవుతుంది.' : 'Open Share & Consent to choose a fictional recipient and scope. You can revoke access at any time; the audit view records the change.';
  }
  if (/appointment|doctor|visit|అపాయింట్|వైద్యుడు|వైద్యురాలు|డాక్టర్|సందర్శన/.test(prompt)) {
    return te ? 'సందర్శనకు సిద్ధతలో, సందర్శన కోసం ఎంచుకున్న రికార్డులను సమీకరించవచ్చు. ఇక్కడి పేర్లు, రికార్డులు కల్పితమైనవి.' : 'Visit Preparation can help you collect selected records for a visit. The names and records in this space are fictional.';
  }
  return te ? 'ఈ ఆరోగ్య స్థలంలో మీకు దారి చూపగలను. రీడింగ్‌లు, నివేదికలు, భాగస్వామ్యం లేదా అపాయింట్‌మెంట్‌ల గురించి అడగండి. నా సమాధానాలు తప్పుగా ఉండవచ్చు.' : 'I can help you navigate this health space. Try asking about vitals, reports, sharing, or appointments. My replies may be inaccurate.';
}
