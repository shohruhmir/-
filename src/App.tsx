/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ZoneSelector } from './components/ZoneSelector';
import { RoomDimensionsInput } from './components/RoomDimensionsInput';
import { LuminaireSelector } from './components/LuminaireSelector';
import { ResultsSummaryCard } from './components/ResultsSummaryCard';
import { EnergyCostCard } from './components/EnergyCostCard';
import { RoomVisualizer } from './components/RoomVisualizer';
import { ShnkReferenceModal } from './components/ShnkReferenceModal';
import { SpecificationExportModal } from './components/SpecificationExportModal';
import { CalculationInputs } from './types/calculator';
import { computeLightingCalculation } from './utils/lightingMath';
import { ZONE_PRESETS } from './data/shnkNorms';
import { generateDefaultElectricalItems } from './utils/electricalGenerator';
import { ElectricalOutletsModule } from './components/ElectricalOutletsModule';
import { BookOpen, ShieldCheck, HelpCircle, Sparkles, Plug } from 'lucide-react';

const initialZone = ZONE_PRESETS[0];

const INITIAL_INPUTS: CalculationInputs = {
  // Zone
  zoneId: initialZone.id,
  customLux: 100,
  selectedCategoryTab: 'all',

  // Geometry
  lengthM: 6.0,
  widthM: 4.0,
  heightM: 3.2,
  workPlaneHeightM: 0.0, // Floor level (standard for lobbies)
  suspensionHeightM: 0.0,

  // Architectural Openings: Doors & Windows
  doors: [
    {
      id: 'door_main',
      wall: 'bottom',
      positionPct: 50,
      widthM: 0.9,
      swingInward: true,
      swingSide: 'right',
      labelRu: 'Входная дверь',
      labelUz: 'Kirish eshigi',
    },
  ],
  windows: [
    {
      id: 'win_1',
      wall: 'top',
      positionPct: 50,
      widthM: 1.5,
      labelRu: 'Окно',
      labelUz: 'Deraza',
    },
  ],

  // Luminaire (LED Only)
  ledPresetId: 'standard_1200',
  singleFluxLm: 1200, // Default per prompt: 1200 lm
  singlePowerWatts: 12,
  safetyFactorKz: 1.5, // Default per prompt: 1.5 for LED in Uzbekistan
  utilizationCoeffEta: 0.5, // Default per prompt: 0.5 (range 0.4 - 0.7)
  reflectanceProfile: 'medium',
  rhoCeiling: 50,
  rhoWalls: 30,
  rhoFloor: 10,

  // Energy & Costs
  hoursPerDay: 16,
  daysPerYear: 365,
  hasMotionSensor: false,
  motionSensorSavingsPct: 35,
  tariffUZS: 1000,
  selectedTariffId: 'commercial',

  // Custom grid (0 = auto)
  customGridCols: 0,
  customGridRows: 0,

  // Electrical: Sockets & Switches
  enableElectricalModule: true,
  electricalItems: generateDefaultElectricalItems(initialZone, 6.0, 4.0, 30, 90),
  socketsSingleCount: 2,
  socketsDoubleCount: 2,
  socketsIP44Count: 0,
  socketsACCount: 0,
  switchesSingleCount: 1,
  switchesDoubleCount: 0,
  switchesPassThroughCount: 0,
  socketStandardHeightCm: 30,
  switchStandardHeightCm: 90,
};

export default function App() {
  const [lang, setLang] = useState<'ru' | 'uz'>('ru');
  const [inputs, setInputs] = useState<CalculationInputs>(INITIAL_INPUTS);
  const [isNormsOpen, setIsNormsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const outputs = useMemo(() => {
    return computeLightingCalculation(inputs);
  }, [inputs]);

  const handleInputChange = (updates: Partial<CalculationInputs>) => {
    setInputs((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setInputs(INITIAL_INPUTS);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Sticky Header */}
      <Header
        lang={lang}
        setLang={setLang}
        onOpenNorms={() => setIsNormsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro notice banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
              UZ
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-900 block sm:inline mr-1.5">
                {lang === 'ru'
                  ? 'Соответствие ШНК 2.01.05-24 Республики Узбекистан:'
                  : "O'zbekiston Respublikasi ShNQ 2.01.05-24 talablariga moslik:"}
              </span>
              <span className="text-slate-600">
                {lang === 'ru'
                  ? 'Все расчеты строго учитывают нормативный коэффициент запаса Кз = 1.5 для светодиодов и сертифицированные нормы освещенности входных групп.'
                  : "Barcha hisob-kitoblar LED yoritgichlar uchun Kz = 1.5 zaxira koeffitsiyenti va tasdiqlangan me'yorlarni hisobga oladi."}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNormsOpen(true)}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold whitespace-nowrap self-start sm:self-auto flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Читать выдержки норм' : "Me'yordan iqtiboslar"}</span>
          </button>
        </div>

        {/* 1. Zone Selector */}
        <ZoneSelector
          lang={lang}
          inputs={inputs}
          onChange={handleInputChange}
          onOpenNorms={() => setIsNormsOpen(true)}
        />

        {/* 2. Room Dimensions Input */}
        <RoomDimensionsInput
          lang={lang}
          inputs={inputs}
          outputs={outputs}
          onChange={handleInputChange}
        />

        {/* 3. Luminaire Selector (Strictly LED) */}
        <LuminaireSelector
          lang={lang}
          inputs={inputs}
          onChange={handleInputChange}
          onOpenNorms={() => setIsNormsOpen(true)}
        />

        {/* Primary Results Display */}
        <ResultsSummaryCard
          lang={lang}
          inputs={inputs}
          outputs={outputs}
        />

        {/* 4. Annual Energy & Operating Cost Assessment */}
        <EnergyCostCard
          lang={lang}
          inputs={inputs}
          outputs={outputs}
          onChange={handleInputChange}
        />

        {/* 5. Electrical Outlets and Switches Layout Module */}
        <ElectricalOutletsModule
          lang={lang}
          inputs={inputs}
          outputs={outputs}
          onChange={handleInputChange}
        />

        {/* 6. 2D Layout Plan Visualizer (Lights + Sockets + Switches) */}
        <RoomVisualizer
          lang={lang}
          inputs={inputs}
          outputs={outputs}
          onChange={handleInputChange}
        />

        {/* Legal & Normative Reference Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-xs text-slate-600 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'ru' ? 'Нормативная справка и методика расчета' : "Me'yoriy ma'lumot va hisoblash metodikasi"}</span>
          </div>
          <p className="leading-relaxed">
            {lang === 'ru' ? (
              <>
                Настоящий калькулятор разработан на основе <strong>ШНК 2.01.05-24 «Естественное и искусственное освещение»</strong> Министерства строительства и жилищно-коммунального хозяйства Республики Узбекистан. Расчет выполняется классическим <strong>методом коэффициента использования светового потока</strong>:
              </>
            ) : (
              <>
                Ushbu kalkulyator O'zbekiston Respublikasi Qurilish va uy-joy kommunal xo'jaligi vazirligining <strong>ShNQ 2.01.05-24 "Tabiiy va sun'iy yoritish"</strong> me'yorlari asosida ishlab chiqilgan.
              </>
            )}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">
                {lang === 'ru' ? 'Вестибюль жилого дома' : 'Turar-joy binosi vestibyuli'}
              </span>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru' ? 'Норма: 75 лк на уровне пола (Г-0.0 м). Обеспечивает безопасное передвижение жильцов и ориентацию в пространстве.' : "Me'yor: pol sathida 75 lk (G-0.0 m). Aholining xavfsiz harakatlanishini ta'minlaydi."}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">
                {lang === 'ru' ? 'Вестибюли общественных зданий и отелей' : 'Jamoat binolari va mehmonxona zallari'}
              </span>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru' ? 'Норма: 150 лк на полу. Равномерное светораспределение и адаптация посетителей при входе с улицы.' : "Me'yor: pol sathida 150 lk. Ko'zning ko'chadan kirganda yorug'likka moslashuvini ta'minlaydi."}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">
                {lang === 'ru' ? 'Наружная площадка и ступени входа' : 'Kirish maydonchasi va tashqi zinapoyalar'}
              </span>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru' ? 'Норма: 10 лк на покрытии. Предотвращает травматизм на ступенях и пандусах в темное время суток.' : "Me'yor: qoplama sathida 10 lk. Tungi vaqtda zinapoyalarda yiqilishning oldini oladi."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {lang === 'ru' ? 'Калькулятор освещенности ШНК 2.01.05-24' : 'ShNQ 2.01.05-24 Yoritilganlik kalkulyatori'}
            </span>
            <span>•</span>
            <span>{lang === 'ru' ? 'Республика Узбекистан' : "O'zbekiston Respublikasi"}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              type="button"
              onClick={() => setIsNormsOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              {lang === 'ru' ? 'Справка ШНК' : "ShNQ me'yori"}
            </button>
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              {lang === 'ru' ? 'Печать спецификации' : 'Spetsifikatsiyani chop etish'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ShnkReferenceModal
        lang={lang}
        isOpen={isNormsOpen}
        onClose={() => setIsNormsOpen(false)}
      />

      <SpecificationExportModal
        lang={lang}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        inputs={inputs}
        outputs={outputs}
      />
    </div>
  );
}
