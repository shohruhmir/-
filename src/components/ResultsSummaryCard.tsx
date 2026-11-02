import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  Sun, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Calculator, 
  Sparkles,
  Zap
} from 'lucide-react';
import { CalculationInputs, CalculationOutputs } from '../types/calculator';
import { formatNum, formatUZS } from '../utils/lightingMath';
import { ZONE_PRESETS } from '../data/shnkNorms';

interface ResultsSummaryCardProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
}

export const ResultsSummaryCard: React.FC<ResultsSummaryCardProps> = ({
  lang,
  inputs,
  outputs,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const zone = ZONE_PRESETS.find((z) => z.id === inputs.zoneId);
  const zoneName = zone 
    ? (lang === 'ru' ? zone.nameRu : zone.nameUz) 
    : (lang === 'ru' ? 'Пользовательская норма' : "Maxsus me'yor");

  const copySummaryToClipboard = () => {
    const text = `=== РАСЧЕТ ОСВЕЩЕННОСТИ ПО ШНК 2.01.05-24 ===
Зона: ${zoneName}
Габариты помещения: ${inputs.lengthM} × ${inputs.widthM} × ${inputs.heightM} м
Общая площадь: ${outputs.areaM2} м²
Нормативная освещенность: ${outputs.targetIlluminanceLux} лк
Коэффициент запаса Кз: ${inputs.safetyFactorKz}
Коэффициент использования η: ${inputs.utilizationCoeffEta}
Необходимый световой поток: ${formatNum(outputs.requiredTotalFluxLm)} лм
Светильник: LED ${inputs.singleFluxLm} лм (${inputs.singlePowerWatts} Вт)
Рекомендуемое количество: ${outputs.recommendedLuminairesCount} шт.
Расчетная фактическая освещенность: ${outputs.actualIlluminanceLux} лк (${outputs.illuminanceMarginPct >= 0 ? '+' : ''}${outputs.illuminanceMarginPct}%)
Суммарная мощность: ${outputs.totalPowerWatts} Вт (${outputs.specificPowerWattsPerM2} Вт/м²)
Годовое электропотребление: ${formatNum(outputs.annualEnergyKWh)} кВт·ч/год
Ориентировочные затраты в год: ${formatUZS(outputs.annualCostUZS)} сўм`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
      {/* Decorative ambient lighting effect */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10 border-b border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {lang === 'ru' ? 'Результаты расчета освещения' : "Yoritish hisob-kitob natijalari"}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {zoneName} • {inputs.lengthM} × {inputs.widthM} м (H = {inputs.heightM} м)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              outputs.isNormCompliant
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {outputs.isNormCompliant ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'ru'
                    ? `Норма ШНК выполнена (+${outputs.illuminanceMarginPct}% запаса)`
                    : `ShNQ talabi bajarildi (+${outputs.illuminanceMarginPct}%)`}
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>
                  {lang === 'ru'
                    ? `Ниже нормы (${outputs.illuminanceMarginPct}%)`
                    : `Me'yordan kam (${outputs.illuminanceMarginPct}%)`}
                </span>
              </>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={copySummaryToClipboard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-600 transition-colors"
            title={lang === 'ru' ? 'Скопировать спецификацию в буфер' : 'Nusxa olish'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{lang === 'ru' ? 'Скопировано!' : 'Nusxalandi!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{lang === 'ru' ? 'Копировать' : 'Nusxa'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards Required by Prompt */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 relative z-10 mb-6">
        {/* 1. Общая площадь (S) */}
        <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ru' ? 'Общая площадь (S)' : 'Umumiy maydon (S)'}
            </span>
            <Maximize2 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {outputs.areaM2}
              <span className="text-base sm:text-lg font-normal text-slate-400 ml-1">м²</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              {inputs.lengthM} × {inputs.widthM} м
            </div>
          </div>
        </div>

        {/* 2. Нормативная освещенность (E) */}
        <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ru' ? 'Норма освещенности (E)' : "Me'yoriy yoritilganlik (E)"}
            </span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {outputs.targetIlluminanceLux}
              <span className="text-base sm:text-lg font-normal text-slate-400 ml-1">лк</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {lang === 'ru' ? 'ШНК 2.01.05-24' : 'ShNQ 2.01.05-24'}
            </div>
          </div>
        </div>

        {/* 3. Необходимый суммарный световой поток (Phi_общ) */}
        <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">
              {lang === 'ru' ? 'Требуемый поток (Фобщ)' : "Talab qilingan oqim (Фобщ)"}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              {formatNum(outputs.requiredTotalFluxLm)}
              <span className="text-base sm:text-lg font-normal text-slate-400 ml-1">лм</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Kз={inputs.safetyFactorKz} • η={inputs.utilizationCoeffEta}
            </div>
          </div>
        </div>

        {/* 4. Рекомендуемое количество светильников (N) */}
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 rounded-xl border border-amber-500/40 hover:border-amber-500/60 transition-all flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-amber-300 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {lang === 'ru' ? 'Количество светильников (N)' : "Yoritgichlar soni (N)"}
            </span>
            <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                {outputs.recommendedLuminairesCount}
              </span>
              <span className="text-sm sm:text-base font-semibold text-amber-200">
                {lang === 'ru' ? 'шт.' : 'dona'}
              </span>
            </div>
            <div className="text-[11px] text-amber-200/80 mt-1">
              LED по {inputs.singleFluxLm} лм ({inputs.singlePowerWatts} Вт)
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar: Actual illuminance, Installed power, Uniformity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 mb-4 relative z-10 text-xs">
        {/* Actual estimated Lux */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <span className="text-slate-400">
            {lang === 'ru' ? 'Фактическая освещенность:' : 'Haqiqiy yoritilganlik:'}
          </span>
          <span className="font-mono font-bold text-white text-sm">
            {outputs.actualIlluminanceLux} лк
          </span>
          <span className="text-[10px] text-emerald-400 font-medium font-mono">
            ({outputs.illuminanceMarginPct >= 0 ? `+${outputs.illuminanceMarginPct}%` : `${outputs.illuminanceMarginPct}%`})
          </span>
        </div>

        {/* Total installed power */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <span className="text-slate-400">
            {lang === 'ru' ? 'Суммарная мощность:' : 'Umumiy quvvat:'}
          </span>
          <span className="font-mono font-bold text-white text-sm">
            {outputs.totalPowerWatts} Вт
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({outputs.specificPowerWattsPerM2} Вт/м²)
          </span>
        </div>

        {/* Actual total luminous flux */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <span className="text-slate-400">
            {lang === 'ru' ? 'Фактический поток:' : 'Haqiqiy oqim:'}
          </span>
          <span className="font-mono font-bold text-white text-sm">
            {formatNum(outputs.actualTotalFluxLm)} лм
          </span>
        </div>
      </div>

      {/* Accordion: Step-by-step mathematical calculation formulas */}
      <div className="relative z-10 border-t border-slate-700/80 pt-3">
        <button
          type="button"
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors py-1"
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'ru'
              ? 'Пошаговый расчет и формулы по ШНК 2.01.05-24'
              : "ShNQ 2.01.05-24 bo'yicha bosqichma-bosqich hisoblash formulalari"}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{showFormulaDetails ? (lang === 'ru' ? 'Скрыть' : 'Yashirish') : (lang === 'ru' ? 'Развернуть' : 'Ko\'rsatish')}</span>
            {showFormulaDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showFormulaDetails && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono space-y-3.5 text-slate-300">
            {/* Step 1 */}
            <div>
              <div className="text-[11px] text-amber-400 font-sans font-bold mb-1">
                {lang === 'ru' ? '1. Площадь помещения (S):' : '1. Xona maydoni (S):'}
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                S = Длина × Ширина = {inputs.lengthM} × {inputs.widthM} = <span className="text-white font-bold">{outputs.areaM2} м²</span>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <div className="text-[11px] text-amber-400 font-sans font-bold mb-1">
                {lang === 'ru'
                  ? '2. Общий требуемый световой поток (Фобщ):'
                  : '2. Talab etiladigan umumiy yorug\'lik oqimi (Фобщ):'}
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                Фобщ = (E × S × Kз) / η = ({outputs.targetIlluminanceLux} × {outputs.areaM2} × {inputs.safetyFactorKz}) / {inputs.utilizationCoeffEta} = <span className="text-emerald-400 font-bold">{formatNum(outputs.requiredTotalFluxLm)} лм</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-1">
                {lang === 'ru'
                  ? 'где E — нормируемая освещенность (лк); Kз = 1.5 — коэффициент запаса для LED в Узбекистане; η — коэффициент использования.'
                  : "bunda E — me'yoriy yoritilganlik (lk); Kз = 1.5 — O'zbekiston iqlimida LED uchun zaxira koeffitsiyenti; η — foydalanish koeffitsiyenti."}
              </div>
            </div>

            {/* Step 3 */}
            <div>
              <div className="text-[11px] text-amber-400 font-sans font-bold mb-1">
                {lang === 'ru'
                  ? '3. Количество светильников (N):'
                  : '3. Yoritgichlar soni (N):'}
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                N = ⌈Фобщ / Ф₁⌉ = ⌈{formatNum(outputs.requiredTotalFluxLm)} / {inputs.singleFluxLm}⌉ = ⌈{outputs.calculatedLuminairesRaw.toFixed(2)}⌉ = <span className="text-amber-400 font-bold">{outputs.recommendedLuminairesCount} шт.</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans mt-1">
                {lang === 'ru'
                  ? 'Округление производится до ближайшего большего целого числа.'
                  : "Yaqin katta butun songa qarab yaxlitlanadi."}
              </div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="text-[11px] text-amber-400 font-sans font-bold mb-1">
                {lang === 'ru'
                  ? '4. Проверочный расчет фактической освещенности (Eфакт):'
                  : '4. Haqiqiy yoritilganlikni tekshirish hisobi (Eфакт):'}
              </div>
              <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
                Eфакт = (N × Ф₁ × η) / (S × Kз) = ({outputs.recommendedLuminairesCount} × {inputs.singleFluxLm} × {inputs.utilizationCoeffEta}) / ({outputs.areaM2} × {inputs.safetyFactorKz}) = <span className="text-white font-bold">{outputs.actualIlluminanceLux} лк</span> (Запас: +{outputs.illuminanceMarginPct}%)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
