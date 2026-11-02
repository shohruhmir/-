export type RoomCategory = 'vestibule' | 'residential' | 'commercial' | 'utility' | 'lab';

export interface ZoneNorm {
  id: string;
  nameRu: string;
  nameUz: string;
  illuminanceLux: number; // E, lux
  workPlaneRu: string;
  workPlaneUz: string;
  defaultHeight: number; // meters
  descriptionRu: string;
  descriptionUz: string;
  shnkClause: string;
  iconName: string;
  category: RoomCategory;
  // Electrical norms recommendations
  defaultSocketsBase: number; // baseline sockets
  socketsPerM2: number; // additional sockets per m2
  defaultSwitchType: 'single' | 'double' | 'pass_through';
  requiresIP44: boolean;
}

export interface LedPreset {
  id: string;
  nameRu: string;
  nameUz: string;
  fluxLm: number;
  powerWatts: number;
  efficacyLmPerWatt: number;
  beamAngle: number;
  typeRu: string;
  typeUz: string;
  typicalUseRu: string;
  typicalUseUz: string;
}

export interface TariffPreset {
  id: string;
  nameRu: string;
  nameUz: string;
  rateUZS: number;
  descriptionRu: string;
  descriptionUz: string;
}

export type WallSide = 'top' | 'bottom' | 'left' | 'right';

export interface ElectricalItem {
  id: string;
  category: 'socket' | 'switch';
  type: 
    | 'socket_single' 
    | 'socket_double' 
    | 'socket_ip44' 
    | 'socket_power_ac' 
    | 'switch_single' 
    | 'switch_double' 
    | 'switch_pass_through';
  wall: WallSide;
  positionPct: number; // 0% to 100% along the wall
  heightCm: number; // height above floor in cm (e.g. 30, 90, 105)
  labelRu: string;
  labelUz: string;
}

export interface DoorItem {
  id: string;
  wall: WallSide;
  positionPct: number; // 10% to 90%
  widthM: number; // e.g. 0.9m
  swingInward: boolean; // Внутрь vs Наружу (по эвакуации)
  swingSide: 'left' | 'right'; // Петли слева (распах вправо) vs Петли справа (распах влево)
  labelRu?: string;
  labelUz?: string;
}

export interface WindowItem {
  id: string;
  wall: WallSide;
  positionPct: number; // 10% to 90%
  widthM: number; // e.g. 1.2m
  labelRu?: string;
  labelUz?: string;
}

export interface CalculationInputs {
  // Zone
  zoneId: string;
  customLux: number;
  selectedCategoryTab: RoomCategory | 'all';

  // Room geometry
  lengthM: number;
  widthM: number;
  heightM: number;
  workPlaneHeightM: number;
  suspensionHeightM: number;

  // Architectural openings: Doors & Windows
  doors: DoorItem[];
  windows: WindowItem[];

  // Luminaire (LED only)
  ledPresetId: string;
  singleFluxLm: number;
  singlePowerWatts: number;
  safetyFactorKz: number; // K_з (1.5 for LED in UZ)
  utilizationCoeffEta: number; // \eta (0.4 - 0.7, default 0.5)
  reflectanceProfile: 'light' | 'medium' | 'dark' | 'custom';
  rhoCeiling: number;
  rhoWalls: number;
  rhoFloor: number;

  // Energy & costs
  hoursPerDay: number;
  daysPerYear: number;
  hasMotionSensor: boolean;
  motionSensorSavingsPct: number;
  tariffUZS: number;
  selectedTariffId: string;

  // Grid layout custom override (0 = auto)
  customGridCols: number;
  customGridRows: number;

  // Electrical: Sockets and Switches Configuration
  enableElectricalModule: boolean;
  electricalItems: ElectricalItem[];
  socketsSingleCount: number;
  socketsDoubleCount: number;
  socketsIP44Count: number;
  socketsACCount: number;
  switchesSingleCount: number;
  switchesDoubleCount: number;
  switchesPassThroughCount: number;
  socketStandardHeightCm: number; // 30 cm default
  switchStandardHeightCm: number; // 90 cm default
}

export interface CalculationOutputs {
  areaM2: number;
  perimeterM: number;
  roomIndex: number; // i
  calcMountingHeightM: number; // h
  targetIlluminanceLux: number; // E
  requiredTotalFluxLm: number; // \Phi_общ
  calculatedLuminairesRaw: number;
  recommendedLuminairesCount: number; // N
  actualTotalFluxLm: number; // \Phi_факт
  actualIlluminanceLux: number; // E_факт
  illuminanceMarginPct: number; // \Delta E (%)
  isNormCompliant: boolean;

  // Power & Energy
  totalPowerWatts: number;
  totalPowerKW: number;
  specificPowerWattsPerM2: number; // w (Вт/м²)
  effectiveDailyHours: number;
  annualEnergyKWh: number;
  annualCostUZS: number;
  monthlyCostUZS: number;
  annualCO2Kg: number;

  // Comparison with traditional (fluorescent / incandescent)
  baselineFluorescentWatts: number;
  baselineAnnualKWh: number;
  annualEnergySavedKWh: number;
  annualMoneySavedUZS: number;

  // Layout grid
  gridCols: number;
  gridRows: number;
  totalGridLights: number;
  spacingXM: number;
  spacingYM: number;
  wallSpacingXM: number;
  wallSpacingYM: number;
  spacingToHeightRatio: number;
  isUniformityGood: boolean;

  // Electrical Summary
  totalSocketsCount: number;
  totalSwitchesCount: number;
  recommendedSocketsByNorm: number;
  estLightingCableM: number; // Cable VVGng-LS 3x1.5
  estSocketsCableM: number; // Cable VVGng-LS 3x2.5
  recommendedBreakerLightingA: number; // 10A
  recommendedBreakerSocketsA: number; // 16A
  totalElectricalPoints: number;
}
