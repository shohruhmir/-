import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  FileCheck, 
  Building, 
  Zap, 
  Lightbulb, 
  Calendar 
} from 'lucide-react';
import { CalculationInputs, CalculationOutputs } from '../types/calculator';
import { ZONE_PRESETS } from '../data/shnkNorms';
import { formatNum, formatUZS } from '../utils/lightingMath';

interface SpecificationExportModalProps {
  lang: 'ru' | 'uz';
  isOpen: boolean;
  onClose: () => void;
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
}

export const SpecificationExportModal: React.FC<SpecificationExportModalProps> = ({
  lang,
  isOpen,
  onClose,
  inputs,
  outputs,
}) => {
  const [projectName, setProjectName] = useState(
    lang === 'ru' ? 'Входная группа жилого комплекса' : 'Turar-joy majmuasi kirish guruhi'
  );
  const [designerName, setDesignerName] = useState(
    lang === 'ru' ? 'Инженер по электроосвещению' : 'Yoritish muhandisi'
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const zone = ZONE_PRESETS.find((z) => z.id === inputs.zoneId);
  const zoneName = zone ? (lang === 'ru' ? zone.nameRu : zone.nameUz) : 'Пользовательская норма';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
ТЕХНИЧЕСКИЙ ОТЧЕТ И СПЕЦИФИКАЦИЯ
Расчет освещенности по ШНК 2.01.05-24 (Республика Узбекистан)

Объект: ${projectName}
Разработчик: ${designerName}
Дата расчета: ${new Date().toLocaleDateString('ru-RU')}

1. ИСХОДНЫЕ ДАННЫЕ
- Зона: ${zoneName}
- Габариты: ${inputs.lengthM} × ${inputs.widthM} м (высота H = ${inputs.heightM} м)
- Площадь: ${outputs.areaM2} м²
- Нормативная освещенность: ${outputs.targetIlluminanceLux} лк (ШНК 2.01.05-24)
- Коэффициент запаса Кз: ${inputs.safetyFactorKz} (светодиоды)
- Коэффициент использования η: ${inputs.utilizationCoeffEta}

2. РЕЗУЛЬТАТЫ СВЕТОТЕХНИЧЕСКОГО РАСЧЕТА
- Требуемый суммарный световой поток: ${formatNum(outputs.requiredTotalFluxLm)} лм
- Выбранный светильник: Светодиодный LED, ${inputs.singleFluxLm} лм, ${inputs.singlePowerWatts} Вт
- Расчетное количество светильников: ${outputs.calculatedLuminairesRaw.toFixed(2)} шт.
- Принятое количество светильников: ${outputs.recommendedLuminairesCount} шт.
- Расчетная фактическая освещенность: ${outputs.actualIlluminanceLux} лк (запас +${outputs.illuminanceMarginPct}%)
- Рекомендуемая сетка размещения: ${outputs.gridCols} × ${outputs.gridRows} (шаг ${outputs.spacingXM} × ${outputs.spacingYM} м)

3. ЭНЕРГЕТИЧЕСКИЕ И ЭКСПЛУАТАЦИОННЫЕ ПОКАЗАТЕЛИ
- Установленная мощность освещения: ${outputs.totalPowerWatts} Вт (${outputs.specificPowerWattsPerM2} Вт/м²)
- Режим работы: ${inputs.hoursPerDay} ч/сут, ${inputs.daysPerYear} дн/год ${inputs.hasMotionSensor ? '(с датчиком присутствия)' : ''}
- Годовое электропотребление: ${formatNum(outputs.annualEnergyKWh)} кВт·ч/год
- Тариф на электроэнергию: ${formatNum(inputs.tariffUZS)} сўм/кВт·ч
- Годовые эксплуатационные затраты: ${formatUZS(outputs.annualCostUZS)} сўм/год (~${formatUZS(outputs.monthlyCostUZS)} сўм/мес)
- Экономия по сравнению с люминесцентными светильниками: ${formatUZS(outputs.annualMoneySavedUZS)} сўм/год
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Actions */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'ru' ? 'Инженерная спецификация и отчет' : 'Muhandislik spetsifikatsiyasi va hisoboti'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{lang === 'ru' ? 'Скопировано' : 'Nusxalandi'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'ru' ? 'Копировать текст' : 'Matnni nusxalash'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'ru' ? 'Печать / PDF' : 'Chop etish / PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="px-8 py-6 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 font-sans space-y-6">
          {/* Header of Report */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-600 block mb-1">
                ШНК 2.01.05-24 • РЕСПУБЛИКА УЗБЕКИСТАН
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                РАСЧЕТ ОСВЕЩЕННОСТИ И СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Метод коэффициента использования светового потока для светодиодных систем
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Дата: {new Date().toLocaleDateString('ru-RU')}</div>
              <div>Версия норм: ШНК 2.01.05-24</div>
            </div>
          </div>

          {/* Project Details Input Fields (editable directly in modal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {lang === 'ru' ? 'Наименование объекта / проекта:' : 'Obyekt / loyiha nomi:'}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                {lang === 'ru' ? 'Инженер / проектировщик:' : 'Loyiha muhandisi:'}
              </label>
              <input
                type="text"
                value={designerName}
                onChange={(e) => setDesignerName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table 1: Parameters of room and norms */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              1. Исходные данные и геометрия помещения
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600 w-1/2">Назначение зоны / помещения:</td>
                    <td className="p-2.5 font-bold text-slate-900">{zoneName}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Нормируемая освещенность (E):</td>
                    <td className="p-2.5 font-bold text-slate-900">{outputs.targetIlluminanceLux} лк (по ШНК 2.01.05-24)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Размеры в плане (Длина × Ширина):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{inputs.lengthM} × {inputs.widthM} м</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Общая площадь помещения (S):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{outputs.areaM2} м²</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Высота помещения (H) / подвеса (h):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{inputs.heightM} м / {outputs.calcMountingHeightM.toFixed(1)} м</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Индекс помещения (i):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{outputs.roomIndex}</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Коэффициент запаса (Kз) / использования (η):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">Kз = {inputs.safetyFactorKz} • η = {inputs.utilizationCoeffEta}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Calculation Results & Equipment */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              2. Результаты расчета освещенности и спецификация LED светильников
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600 w-1/2">Суммарный требуемый световой поток (Фобщ):</td>
                    <td className="p-2.5 font-bold font-mono text-emerald-700">{formatNum(outputs.requiredTotalFluxLm)} лм</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Световой поток одного светильника (Ф₁):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{inputs.singleFluxLm} лм ({inputs.singlePowerWatts} Вт)</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Рекомендуемое количество светильников (N):</td>
                    <td className="p-2.5 font-black text-amber-600 text-sm">{outputs.recommendedLuminairesCount} шт.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Фактическая расчетная освещенность (Eфакт):</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {outputs.actualIlluminanceLux} лк (Запас: +{outputs.illuminanceMarginPct}%) — Соотв. норме
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Рекомендуемая схема размещения:</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">
                      {outputs.gridCols} × {outputs.gridRows} (шаг {outputs.spacingXM} × {outputs.spacingYM} м)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Суммарная установленная мощность (Pобщ):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">
                      {outputs.totalPowerWatts} Вт ({outputs.specificPowerWattsPerM2} Вт/м²)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: Electrical Sockets & Switches Specification */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              3. Спецификация розеток, выключателей и электропроводки (ПУЭ / ШНК)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600 w-1/2">Количество розеток 220В / 16А:</td>
                    <td className="p-2.5 font-bold font-mono text-violet-700">
                      {outputs.totalSocketsCount} шт. (по норме ≥ {outputs.recommendedSocketsByNorm} шт.)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Количество выключателей:</td>
                    <td className="p-2.5 font-bold font-mono text-blue-700">{outputs.totalSwitchesCount} шт.</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Ориентировочная длина кабеля розеток (ВВГнг-LS 3×2.5):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">~{outputs.estSocketsCableM} м</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Ориентировочная длина кабеля освещения (ВВГнг-LS 3×1.5):</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">~{outputs.estLightingCableM} м</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Рекомендуемая защитная автоматика (щиток):</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      Авт. 10А (освещение) + Авт. 16А (розетки) + УЗО 30мА (дифзащита)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Общее количество электроустановочных точек:</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{outputs.totalElectricalPoints} точек</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4: Annual Energy & Cost Assessment */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              4. Оценка энергопотребления и эксплуатационных затрат (Узбекистан)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600 w-1/2">Режим работы светильников:</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">
                      {inputs.hoursPerDay} ч/сут ({inputs.daysPerYear} дней/год)
                      {inputs.hasMotionSensor ? ' • с датчиком движения' : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Годовое электропотребление:</td>
                    <td className="p-2.5 font-bold font-mono text-emerald-700">{formatNum(outputs.annualEnergyKWh)} кВт·ч/год</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Применяемый тариф на электроэнергию:</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{formatNum(inputs.tariffUZS)} сўм / кВт·ч</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Годовые эксплуатационные затраты:</td>
                    <td className="p-2.5 font-black text-blue-700 text-sm">{formatUZS(outputs.annualCostUZS)} сўм / год</td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="p-2.5 font-medium text-slate-600">Ориентировочные ежемесячные расходы:</td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">~{formatUZS(outputs.monthlyCostUZS)} сўм / месяц</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-600">Годовая экономия по сравнению с ЛЛ светильниками:</td>
                    <td className="p-2.5 font-bold text-amber-700">
                      {formatUZS(outputs.annualMoneySavedUZS)} сўм/год ({formatNum(outputs.annualEnergySavedKWh)} кВт·ч)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature / Approval Section */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="text-slate-500 mb-6 font-medium">Расчет составил:</div>
              <div className="border-b border-slate-400 pb-1 flex justify-between items-end">
                <span className="font-semibold text-slate-800">{designerName}</span>
                <span className="text-[10px] text-slate-400 font-mono">(подпись)</span>
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-6 font-medium">Проверил (ГИП / Главный энергетик):</div>
              <div className="border-b border-slate-400 pb-1 flex justify-between items-end">
                <span className="font-semibold text-slate-400">________________________</span>
                <span className="text-[10px] text-slate-400 font-mono">(подпись, дата)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
