import { CalculationInputs, CalculationOutputs } from '../types/calculator';
import { ZONE_PRESETS } from '../data/shnkNorms';

/**
 * Calculates optimal grid rows and cols for N lights in a room of length a and width b
 */
export function calculateOptimalGrid(
  count: number,
  length: number,
  width: number,
  customCols = 0,
  customRows = 0
): { cols: number; rows: number } {
  if (customCols > 0 && customRows > 0) {
    return { cols: customCols, rows: customRows };
  }

  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) {
    return length >= width ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
  }
  if (count === 3) {
    return length >= width ? { cols: 3, rows: 1 } : { cols: 1, rows: 3 };
  }

  const roomRatio = Math.max(0.1, length / width);

  let bestCols = 1;
  let bestRows = count;
  let bestScore = Infinity;

  // Search candidate grids where rows * cols >= count and close to count
  for (let r = 1; r <= count; r++) {
    for (let c = 1; c <= count; c++) {
      const capacity = r * c;
      if (capacity >= count && capacity <= count + Math.ceil(count * 0.4)) {
        const gridRatio = c / r;
        const ratioDiff = Math.abs(gridRatio - roomRatio);
        const excessPenalty = (capacity - count) * 0.5;
        const score = ratioDiff + excessPenalty;

        if (score < bestScore) {
          bestScore = score;
          bestCols = c;
          bestRows = r;
        }
      }
    }
  }

  return { cols: bestCols, rows: bestRows };
}

export function computeLightingCalculation(inputs: CalculationInputs): CalculationOutputs {
  const currentZone = ZONE_PRESETS.find((z) => z.id === inputs.zoneId);
  const targetIlluminanceLux = inputs.zoneId === 'custom' 
    ? inputs.customLux 
    : (currentZone?.illuminanceLux ?? 150);

  // 1. Geometry
  const lengthM = Math.max(0.5, inputs.lengthM);
  const widthM = Math.max(0.5, inputs.widthM);
  const heightM = Math.max(1.5, inputs.heightM);
  const areaM2 = Math.round(lengthM * widthM * 100) / 100;

  // Mounting height above workplane
  const calcMountingHeightM = Math.max(
    0.5,
    heightM - (inputs.suspensionHeightM || 0) - (inputs.workPlaneHeightM || 0)
  );

  // Room Index: i = (a * b) / (h * (a + b))
  const roomIndex = Math.round(
    (lengthM * widthM) / (calcMountingHeightM * (lengthM + widthM)) * 100
  ) / 100;

  // 2. Luminous flux calculation per SHNK 2.01.05-24
  // Phi_total = (E * S * K_z) / eta
  const Kz = Math.max(1.0, inputs.safetyFactorKz);
  const eta = Math.max(0.2, Math.min(0.9, inputs.utilizationCoeffEta));
  const singleFluxLm = Math.max(100, inputs.singleFluxLm);
  const singlePowerWatts = Math.max(1, inputs.singlePowerWatts);

  const requiredTotalFluxLm = Math.round((targetIlluminanceLux * areaM2 * Kz) / eta);

  // N = Phi_total / Phi_1 (rounded up to nearest integer)
  const calculatedLuminairesRaw = requiredTotalFluxLm / singleFluxLm;
  const recommendedLuminairesCount = Math.max(1, Math.ceil(calculatedLuminairesRaw));

  // Actual lighting achieved
  const actualTotalFluxLm = recommendedLuminairesCount * singleFluxLm;
  // E_fact = (N * Phi_1 * eta) / (S * Kz)
  const actualIlluminanceLux = Math.round(
    (recommendedLuminairesCount * singleFluxLm * eta) / (areaM2 * Kz)
  );

  const illuminanceMarginPct = Math.round(
    ((actualIlluminanceLux - targetIlluminanceLux) / targetIlluminanceLux) * 100
  );
  const isNormCompliant = actualIlluminanceLux >= targetIlluminanceLux;

  // 3. Power and Energy calculations
  const totalPowerWatts = recommendedLuminairesCount * singlePowerWatts;
  const totalPowerKW = totalPowerWatts / 1000;
  const specificPowerWattsPerM2 = Math.round((totalPowerWatts / areaM2) * 10) / 10;

  // Motion sensor discount
  const sensorDiscount = inputs.hasMotionSensor 
    ? (inputs.motionSensorSavingsPct || 35) / 100 
    : 0;
  const effectiveDailyHours = inputs.hoursPerDay * (1 - sensorDiscount);

  const annualEnergyKWh = Math.round(
    totalPowerKW * effectiveDailyHours * inputs.daysPerYear
  );

  const tariffUZS = Math.max(0, inputs.tariffUZS);
  const annualCostUZS = Math.round(annualEnergyKWh * tariffUZS);
  const monthlyCostUZS = Math.round(annualCostUZS / 12);

  // CO2 equivalent factor for Uzbekistan power grid: ~0.52 kg CO2 / kWh
  const annualCO2Kg = Math.round(annualEnergyKWh * 0.52);

  // Baseline comparison (Old fluorescent T8 2x36W or compact 26W fixtures with ballast loss: ~2.6x wattage)
  const baselineFluorescentWatts = Math.round(totalPowerWatts * 2.6);
  const baselineAnnualKWh = Math.round(
    (baselineFluorescentWatts / 1000) * effectiveDailyHours * inputs.daysPerYear
  );
  const annualEnergySavedKWh = Math.max(0, baselineAnnualKWh - annualEnergyKWh);
  const annualMoneySavedUZS = Math.max(0, annualEnergySavedKWh * tariffUZS);

  // 4. Grid layout calculation
  const grid = calculateOptimalGrid(
    recommendedLuminairesCount,
    lengthM,
    widthM,
    inputs.customGridCols,
    inputs.customGridRows
  );

  const gridCols = grid.cols;
  const gridRows = grid.rows;
  const totalGridLights = gridCols * gridRows;

  const spacingXM = Math.round((lengthM / gridCols) * 100) / 100;
  const spacingYM = Math.round((widthM / gridRows) * 100) / 100;
  const wallSpacingXM = Math.round((spacingXM / 2) * 100) / 100;
  const wallSpacingYM = Math.round((spacingYM / 2) * 100) / 100;

  // Uniformity check: Spacing / MountingHeight <= 1.4 for wide distribution
  const maxSpacing = Math.max(spacingXM, spacingYM);
  const spacingToHeightRatio = Math.round((maxSpacing / calcMountingHeightM) * 100) / 100;
  const isUniformityGood = spacingToHeightRatio <= 1.5;

  // 5. Electrical: Sockets and Switches Summary
  const perimeterM = Math.round(2 * (lengthM + widthM) * 10) / 10;
  const items = inputs.electricalItems || [];

  const socketsInItems = items.filter((i) => i.category === 'socket').length;
  const switchesInItems = items.filter((i) => i.category === 'switch').length;

  const totalSocketsCount = socketsInItems > 0 
    ? socketsInItems 
    : (inputs.socketsSingleCount + inputs.socketsDoubleCount + inputs.socketsIP44Count + inputs.socketsACCount);

  const totalSwitchesCount = switchesInItems > 0 
    ? switchesInItems 
    : (inputs.switchesSingleCount + inputs.switchesDoubleCount + inputs.switchesPassThroughCount);

  const totalElectricalPoints = totalSocketsCount + totalSwitchesCount + recommendedLuminairesCount;

  // Standard norm recommendation: baseline + socketsPerM2
  const recommendedSocketsByNorm = currentZone 
    ? Math.max(currentZone.defaultSocketsBase, Math.round(currentZone.defaultSocketsBase + areaM2 * currentZone.socketsPerM2))
    : Math.max(4, Math.round(areaM2 * 0.25));

  // Cable Length Estimates:
  // Lighting cable VVGng-LS 3x1.5 mm2: room perimeter * 0.8 + (N_lights * H * 0.7) + 12m reserve to panel
  const estLightingCableM = Math.round(
    perimeterM * 0.85 + (recommendedLuminairesCount * heightM * 0.6) + (totalSwitchesCount * 2.5) + 10
  );

  // Sockets cable VVGng-LS 3x2.5 mm2: perimeter * 1.2 + (N_sockets * 2.2m drop) + 15m run to panel
  const estSocketsCableM = Math.round(
    perimeterM * 1.1 + (totalSocketsCount * 2.2) + 15
  );

  return {
    areaM2,
    perimeterM,
    roomIndex,
    calcMountingHeightM,
    targetIlluminanceLux,
    requiredTotalFluxLm,
    calculatedLuminairesRaw,
    recommendedLuminairesCount,
    actualTotalFluxLm,
    actualIlluminanceLux,
    illuminanceMarginPct,
    isNormCompliant,
    totalPowerWatts,
    totalPowerKW,
    specificPowerWattsPerM2,
    effectiveDailyHours,
    annualEnergyKWh,
    annualCostUZS,
    monthlyCostUZS,
    annualCO2Kg,
    baselineFluorescentWatts,
    baselineAnnualKWh,
    annualEnergySavedKWh,
    annualMoneySavedUZS,
    gridCols,
    gridRows,
    totalGridLights,
    spacingXM,
    spacingYM,
    wallSpacingXM,
    wallSpacingYM,
    spacingToHeightRatio,
    isUniformityGood,
    totalSocketsCount,
    totalSwitchesCount,
    recommendedSocketsByNorm,
    estLightingCableM,
    estSocketsCableM,
    recommendedBreakerLightingA: 10,
    recommendedBreakerSocketsA: 16,
    totalElectricalPoints,
  };
}

/**
 * Format currency with Uzbekistan locale separation (e.g. 1 450 000 сум)
 */
export function formatUZS(amount: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(amount));
}

/**
 * Format numbers with comma or space
 */
export function formatNum(num: number, decimals = 0): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
