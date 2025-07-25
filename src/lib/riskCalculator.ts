import { Patient, RiskAssessment } from "@/types/patient";

export function calculateRiskAssessment(patient: Patient): RiskAssessment {
  const bpRisk = calculateBPRisk(patient.blood_pressure);
  const tempRisk = calculateTempRisk(patient.temperature);
  const ageRisk = calculateAgeRisk(patient.age);
  const invalid = bpRisk === -1 || tempRisk === -1 || ageRisk === -1;
  const totalRisk =
    Math.min(bpRisk, 0) + Math.min(tempRisk, 0) + Math.min(ageRisk, 0);
  const hasFever = tempRisk >= 1;
  return {
    patient_id: patient.patient_id,
    bpRisk,
    tempRisk,
    ageRisk,
    totalRisk,
    hasDataQualityIssues: invalid,
    hasFever,
  };
}

function calculateBPRisk(bp: string | null | undefined): number {
  if (!bp || typeof bp !== "string") {
    return -1;
  }

  const [systolic, diastolic] = bp.split("/").map(Number);

  if (isNaN(systolic) || isNaN(diastolic)) {
    return -1;
  }

  /* stage 2: systolic >= 140 OR diastolic >= 90 */
  if (systolic >= 140 || diastolic >= 90) {
    return 3;
  }
  /* stage 1: systolic 130-139 OR diastolic 80-89 */
  if (
    (systolic >= 130 && systolic <= 139) ||
    (diastolic >= 80 && diastolic <= 89)
  ) {
    return 2;
  }
  /* elevated: systolic 120-129 AND diastolic < 80 */
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 1;
  }
  /* normal: systolic < 120 AND diastolic < 80 */
  return 0;
}

function calculateTempRisk(temp: number | string | null | undefined): number {
  if (temp === null || temp === undefined || temp === "") {
    return -1;
  }
  const temperature = parseFloat(String(temp));
  if (isNaN(temperature)) {
    return -1;
  }
  /* high fever: temperature >= 101.0 */
  if (temperature >= 101.0) {
    return 2;
  }
  /* low fever: temperature 99.6-100.9 */
  if (temperature >= 99.6 && temperature <= 100.9) {
    return 1;
  }
  /* normal: temperature <= 99.5 */
  return 0;
}

function calculateAgeRisk(age: number | string | null | undefined): number {
  if (age === null || age === undefined || age === "") {
    return -1;
  }
  const ageNumber = parseFloat(String(age));
  if (isNaN(ageNumber)) {
    return -1;
  }

  /* elderly: age > 65 */
  if (ageNumber > 65) {
    return 2;
  }
  /* middle-aged: age 40-65 */
  if (ageNumber >= 40 && ageNumber <= 65) {
    return 1;
  }
  /* young: age < 40 */
  return 0;
}
