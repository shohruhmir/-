import React from 'react';
import { 
  Zap, 
  Coins, 
  Clock, 
  Calendar, 
  Leaf, 
  TrendingDown, 
  ShieldCheck, 
  Activity,
  Sliders,
  DollarSign
} from 'lucide-react';
import { CalculationInputs, CalculationOutputs } from '../types/calculator';
import { TARIFF_PRESETS } from '../data/shnkNorms';
import { formatNum, formatUZS } from '../utils/lightingMath';

interface EnergyCostCardProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  onChange: (updates: Partial<CalculationInputs>) => void;
}

export const EnergyCostCard: React.FC<EnergyCostCardProps> = ({
  lang,
  inputs,
  outputs,
  onChange,
}) => {
  const quickHours = [
    { label: lang === 'ru' ? '24 ч (Круглосуточно)' : '24 s (Tun-u kun)', h: 24 },
    { label: lang === 'ru' ? '16 ч (Вестибюль)' : '16 s (Vestibyul)', h: 16 },
    { label: lang === 'ru' ? '12 ч (Вечер / ночь)' : '12 s (Kechki/tungi)', h: 12 },
    { label: lang === 'ru' ? '8 ч (Рабочий день)' : '8 s (Ish vaqti)', h: 8 },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
            4
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {lang === 'ru'
                ? 'Оценка энергозатрат и расходов за год'
                : 'Yillik elektr energiyasi sarfi va xarajatlar bahosi'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'ru'
                ? 'Расчет по тарифам Республики Узбекистан для светодиодных систем'
                : "O'zbekiston Respublikasi tariflari bo'yicha LED tizimlari uchun hisob"}
            </p>
          </div>
        </div>

        {/* Total installed power pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {outputs.totalPowerWatts} Вт ({outputs.totalPowerKW.toFixed(3)} кВт)
          </span>
        </div>
      </div>

      {/* Main Energy Results Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {/* Annual kWh */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Годовое потребление' : "Yillik iste'mol"}
            </span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 font-mono">
            {formatNum(outputs.annualEnergyKWh)}
            <span className="text-xs font-semibold text-emerald-700 ml-1">кВт·ч/год</span>
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1">
            ~{Math.round(outputs.annualEnergyKWh / 12)} кВт·ч / {lang === 'ru' ? 'месяц' : 'oy'}
          </div>
        </div>

        {/* Annual Cost in UZS */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Годовые затраты' : 'Yillik xarajat'}
            </span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950 font-mono">
            {formatUZS(outputs.annualCostUZS)}
            <span className="text-xs font-semibold text-blue-700 ml-1">сўм</span>
          </div>
          <div className="text-[11px] text-blue-700/80 mt-1">
            ~{formatUZS(outputs.monthlyCostUZS)} сўм / {lang === 'ru' ? 'месяц' : 'oy'}
          </div>
        </div>

        {/* Annual Savings vs Fluorescent */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Экономия против ЛЛ' : 'Lyuminessentga nisbatan tejov'}
            </span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono">
            {formatUZS(outputs.annualMoneySavedUZS)}
            <span className="text-xs font-semibold text-amber-800 ml-1">сўм/год</span>
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">
            Сэкономлено: {formatNum(outputs.annualEnergySavedKWh)} кВт·ч
          </div>
        </div>

        {/* CO2 Reduction */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Выбросы CO₂' : 'CO₂ chiqindisi'}
            </span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatNum(outputs.annualCO2Kg)}
            <span className="text-xs font-semibold text-slate-500 ml-1">кг/год</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {lang === 'ru' ? 'Экологический след здания' : 'Ekologik barqarorlik'}
          </div>
        </div>
      </div>

      {/* Inputs for Energy Calculations: Hours, Days, Sensor, Tariff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
        {/* Operating Hours & Motion Sensor */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                {lang === 'ru' ? 'Режим работы (часов в сутки):' : 'Ish rejimi (kuniga soat):'}
              </label>
              <span className="text-xs font-bold font-mono text-slate-900">
                {inputs.hoursPerDay} {lang === 'ru' ? 'ч/сут' : 's/kun'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={inputs.hoursPerDay}
              onChange={(e) => onChange({ hoursPerDay: Number(e.target.value) })}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick hour buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickHours.map((qh, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange({ hoursPerDay: qh.h })}
                className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${
                  inputs.hoursPerDay === qh.h
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {qh.label}
              </button>
            ))}
          </div>

          {/* Motion Sensor Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="motionSensor"
              checked={inputs.hasMotionSensor}
              onChange={(e) => onChange({ hasMotionSensor: e.target.checked })}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
            />
            <label htmlFor="motionSensor" className="text-xs cursor-pointer">
              <span className="font-semibold text-slate-800 block">
                {lang === 'ru'
                  ? 'Датчик движения / присутствия (экономия 35%)'
                  : 'Harakat / mavjudlik datchigi (35% tejash)'}
              </span>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                {lang === 'ru'
                  ? 'Снижает энергопотребление в часы отсутствия жильцов и посетителей'
                  : "Kechasi va odamlar kam bo'lgan vaqtda chiroqlarni avtomatik o'chiradi"}
              </span>
            </label>
          </div>
        </div>

        {/* Electricity Tariff Selection for Uzbekistan */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-slate-500" />
                {lang === 'ru' ? 'Тариф на электроэнергию в Узбекистане:' : "O'zbekistonda elektr energiyasi tarifi:"}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="100"
                  max="5000"
                  step="50"
                  value={inputs.tariffUZS}
                  onChange={(e) =>
                    onChange({
                      tariffUZS: Math.max(0, Number(e.target.value)),
                      selectedTariffId: 'custom',
                    })
                  }
                  className="w-20 px-2 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded text-center"
                />
                <span className="text-[11px] text-slate-500 font-medium">сўм/кВт·ч</span>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {TARIFF_PRESETS.map((tariff) => {
                const isSelected = inputs.selectedTariffId === tariff.id;
                return (
                  <button
                    key={tariff.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        tariffUZS: tariff.rateUZS,
                        selectedTariffId: tariff.id,
                      })
                    }
                    className={`p-2 rounded-lg border text-left transition-colors text-xs ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{tariff.nameRu.split('(')[0]}</span>
                      <span className="font-mono text-[11px] text-slate-900 ml-1">
                        {tariff.rateUZS} сўм
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'ru'
                ? 'Тарифы синхронизированы с действующими нормативами АО «Узэнергосбыт»'
                : "'O'zenergosotish' AJ ning amaldagi tariflariga moslashtirilgan"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
