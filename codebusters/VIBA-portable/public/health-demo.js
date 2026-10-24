const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function randomInteger(random, minimum, maximum) {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

/** Generate fictional display-only values. They never enter the record store. */
export function generateDemoVitals(random = Math.random) {
  const systolic = randomInteger(random, 108, 142);
  const diastolic = randomInteger(random, 68, 92);
  const heartRate = randomInteger(random, 58, 104);
  const hemoglobin = (10.8 + random() * 5.2).toFixed(1);
  const whiteBloodCells = (4.1 + random() * 6.8).toFixed(1);
  const glucose = randomInteger(random, 72, 146);
  const bloodGroup = bloodGroups[randomInteger(random, 0, bloodGroups.length - 1)];

  return { systolic, diastolic, heartRate, hemoglobin, whiteBloodCells, glucose, bloodGroup };
}
