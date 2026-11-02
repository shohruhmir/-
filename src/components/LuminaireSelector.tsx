import React from 'react';
import { 
  Zap, 
  Sun, 
  ShieldAlert, 
  SlidersHorizontal, 
  Gauge, 
  Check, 
  Sparkles,
  Info 
} from 'lucide-react';
import { LED_PRESETS, REFLECTANCE_PRESETS } from '../data/shnkNorms';
import { CalculationInputs } from '../types/calculator';

interface LuminaireSelectorProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  onChange: (updates: Partial<CalculationInputs>) => void;
  onOpenNorms: () => void;
}

export const LuminaireSelector: React.FC<LuminaireSelectorProps> = ({
  lang,
  inputs,
  onChange,
  onOpenNorms,
}) => {
  const currentPreset = LED_PRESETS.find((p) => p.id === inputs.ledPresetId) || LED_PRESETS[0];

  const handleSelectPreset = (presetId: string) => {
    const p = LED_PRESETS.find((item) => item.id === presetId);
    if (p) {
      onChange({
        ledPresetId: presetId,
        singleFluxLm: p.fluxLm,
        singlePowerWatts: p.powerWatts,
      });
    }
  };

  const calculatedEfficacy = Math.round(
    inputs.singlePowerWatts > 0 ? inputs.singleFluxLm / inputs.singlePowerWatts : 100
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {lang === 'ru' ? 'Параметры светодиодных светильников (LED)' : "Svetodiodli (LED) yoritgich parametrlari"}
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                LED Only
              </span>
            </h2>
          </div>
        </div>

        {/* Efficacy indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
          <span>{calculatedEfficacy} лм/Вт</span>
          <span className="text-[10px] text-emerald-600 font-normal">
            ({calculatedEfficacy >= 100 ? 'Высокая энергоэффективность' : 'Стандарт'})
          </span>
        </div>
      </div>

      {/* Preset LED Tiles */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          {lang === 'ru' ? 'Типовые модели светодиодных светильников:' : 'Standart LED yoritgich turlari:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LED_PRESETS.map((preset) => {
            const isSelected = inputs.ledPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900">
                      {preset.fluxLm} <span className="font-normal text-[10px] text-slate-500">лм</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                      {preset.powerWatts} Вт
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-tight">
                    {lang === 'ru' ? preset.nameRu.split('(')[0] : preset.nameUz.split('(')[0]}
                  </p>
                </div>
                {isSelected && (
                  <div className="mt-1.5 flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                    <Check className="w-3 h-3" />
                    <span>{lang === 'ru' ? 'Активен' : 'Tanlangan'}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Inputs: Luminous Flux, Power, Kz, Eta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        {/* 1. Luminous Flux of single LED */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              {lang === 'ru' ? 'Световой поток светильника (Ф₁)' : "Bitta yoritgich oqimi (Ф₁)"}
            </label>
            <span className="text-xs font-mono font-bold text-slate-900">
              {inputs.singleFluxLm} лм
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="400"
              max="10000"
              step="100"
              value={inputs.singleFluxLm}
              onChange={(e) =>
                onChange({
                  singleFluxLm: Number(e.target.value),
                  ledPresetId: 'custom',
                })
              }
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              min="200"
              max="20000"
              step="50"
              value={inputs.singleFluxLm}
              onChange={(e) =>
                onChange({
                  singleFluxLm: Math.max(100, Number(e.target.value)),
                  ledPresetId: 'custom',
                })
              }
              className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center text-slate-900 bg-white"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {lang === 'ru' ? 'По умолчанию: 1200 лм' : 'Standart: 1200 lm'}
          </p>
        </div>

        {/* 2. Power in Watts */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" />
              {lang === 'ru' ? 'Мощность светильника (P₁)' : "Bitta yoritgich quvvati (P₁)"}
            </label>
            <span className="text-xs font-mono font-bold text-slate-900">
              {inputs.singlePowerWatts} Вт
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="4"
              max="100"
              step="1"
              value={inputs.singlePowerWatts}
              onChange={(e) =>
                onChange({
                  singlePowerWatts: Number(e.target.value),
                  ledPresetId: 'custom',
                })
              }
              className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="250"
              value={inputs.singlePowerWatts}
              onChange={(e) =>
                onChange({
                  singlePowerWatts: Math.max(1, Number(e.target.value)),
                  ledPresetId: 'custom',
                })
              }
              className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center text-slate-900 bg-white"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {lang === 'ru' ? 'Для расчета энергопотребления' : 'Energiya sarfini hisoblash uchun'}
          </p>
        </div>

        {/* 3. Safety Factor K_z = 1.5 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ru' ? 'Коэффициент запаса (K₃)' : "Zaxira koeffitsiyenti (K₃)"}</span>
            </label>
            <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
              {inputs.safetyFactorKz.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1.2"
              max="1.8"
              step="0.05"
              value={inputs.safetyFactorKz}
              onChange={(e) => onChange({ safetyFactorKz: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700 w-10 text-center">
              {inputs.safetyFactorKz.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">
              {lang === 'ru' ? '1.5 для LED в Узбекистане (ШНК)' : "O'zbekistonda LED uchun 1.5"}
            </span>
            <button
              type="button"
              onClick={onOpenNorms}
              className="text-[10px] text-amber-600 hover:underline"
            >
              {lang === 'ru' ? 'почему 1.5?' : "nima uchun 1.5?"}
            </button>
          </div>
        </div>

        {/* 4. Utilization Coefficient eta */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-500" />
              {lang === 'ru' ? 'Коэффициент использования (η)' : "Foydalanish koeffitsiyenti (η)"}
            </label>
            <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">
              {inputs.utilizationCoeffEta.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.35"
              max="0.75"
              step="0.01"
              value={inputs.utilizationCoeffEta}
              onChange={(e) => onChange({ utilizationCoeffEta: Number(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700 w-10 text-center">
              {inputs.utilizationCoeffEta.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0.40</span>
            <span className="font-bold text-slate-600">0.50</span>
            <span>0.70</span>
          </div>
        </div>
      </div>

      {/* Surface Reflectance Presets */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-600">
            {lang === 'ru' ? 'Помощник коэффициента η по отделке:' : 'Pardozlash bo\'yicha η yordamchisi:'}
          </span>
          {REFLECTANCE_PRESETS.map((rf) => (
            <button
              key={rf.id}
              type="button"
              onClick={() =>
                onChange({
                  utilizationCoeffEta: rf.recommendedEta,
                  reflectanceProfile: rf.id as any,
                })
              }
              className={`px-2 py-0.5 rounded-md border text-[11px] transition-colors ${
                Math.abs(inputs.utilizationCoeffEta - rf.recommendedEta) < 0.01
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lang === 'ru' ? rf.nameRu.split('(')[0] : rf.nameUz.split('(')[0]} (η = {rf.recommendedEta})
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {lang === 'ru'
              ? 'Диапазон η: 0.40–0.70 (по умолчанию 0.50)'
              : 'Oraliq η: 0.40–0.70 (standart 0.50)'}
          </span>
        </div>
      </div>
    </div>
  );
};
