import React from 'react';
import { 
  Maximize2, 
  Ruler, 
  MoveHorizontal, 
  MoveVertical, 
  ArrowUpDown, 
  Layers, 
  Info 
} from 'lucide-react';
import { CalculationInputs, CalculationOutputs } from '../types/calculator';

interface RoomDimensionsInputProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  onChange: (updates: Partial<CalculationInputs>) => void;
}

export const RoomDimensionsInput: React.FC<RoomDimensionsInputProps> = ({
  lang,
  inputs,
  outputs,
  onChange,
}) => {
  const quickSizes = [
    { label: '4 × 3 м', l: 4.0, w: 3.0, h: 2.8, name: lang === 'ru' ? 'Тамбур / Малый' : 'Kichik tambur' },
    { label: '6 × 4 м', l: 6.0, w: 4.0, h: 3.2, name: lang === 'ru' ? 'Жилой дом' : 'Turar-joy' },
    { label: '8 × 5 м', l: 8.0, w: 5.0, h: 3.6, name: lang === 'ru' ? 'Офисный холл' : 'Ofis zali' },
    { label: '12 × 6 м', l: 12.0, w: 6.0, h: 4.2, name: lang === 'ru' ? 'Вестибюль отеля' : 'Mehmonxona lobby' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {lang === 'ru' ? 'Параметры помещения' : 'Xona o\'lchamlari va parametrlari'}
          </h2>
        </div>

        {/* Live calculated Area & Room Index Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span>S = {outputs.areaM2} м²</span>
          </span>
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
            title={lang === 'ru' 
              ? 'Индекс помещения i = (a × b) / [h × (a + b)]' 
              : 'Xona indeksi i = (a × b) / [h × (a + b)]'}
          >
            <span>i = {outputs.roomIndex}</span>
          </span>
        </div>
      </div>

      {/* Quick size presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium mr-1">
          {lang === 'ru' ? 'Готовые шаблоны:' : 'Tayyor andozalar:'}
        </span>
        {quickSizes.map((qs, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() =>
              onChange({
                lengthM: qs.l,
                widthM: qs.w,
                heightM: qs.h,
                customGridCols: 0,
                customGridRows: 0,
              })
            }
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs text-slate-700 whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <span className="font-semibold text-slate-900">{qs.label}</span>
            <span className="text-[10px] text-slate-400">({qs.name})</span>
          </button>
        ))}
      </div>

      {/* Inputs Grid: Length, Width, Height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Length */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MoveHorizontal className="w-4 h-4 text-slate-500" />
              {lang === 'ru' ? 'Длина помещения (a)' : 'Xona uzunligi (a)'}
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="50"
                step="0.1"
                value={inputs.lengthM}
                onChange={(e) =>
                  onChange({
                    lengthM: Math.max(0.5, Number(e.target.value)),
                    customGridCols: 0,
                    customGridRows: 0,
                  })
                }
                className="w-16 px-2 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">м</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={inputs.lengthM}
            onChange={(e) =>
              onChange({
                lengthM: Number(e.target.value),
                customGridCols: 0,
                customGridRows: 0,
              })
            }
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>1 м</span>
            <span>15 м</span>
            <span>30 м</span>
          </div>
        </div>

        {/* Width */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MoveVertical className="w-4 h-4 text-slate-500" />
              {lang === 'ru' ? 'Ширина помещения (b)' : 'Xona kengligi (b)'}
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="30"
                step="0.1"
                value={inputs.widthM}
                onChange={(e) =>
                  onChange({
                    widthM: Math.max(0.5, Number(e.target.value)),
                    customGridCols: 0,
                    customGridRows: 0,
                  })
                }
                className="w-16 px-2 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">м</span>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={inputs.widthM}
            onChange={(e) =>
              onChange({
                widthM: Number(e.target.value),
                customGridCols: 0,
                customGridRows: 0,
              })
            }
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>1 м</span>
            <span>10 м</span>
            <span>20 м</span>
          </div>
        </div>

        {/* Height */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
              {lang === 'ru' ? 'Высота потолка (H)' : 'Shift balandligi (H)'}
            </span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="2.0"
                max="10.0"
                step="0.1"
                value={inputs.heightM}
                onChange={(e) =>
                  onChange({
                    heightM: Math.max(1.8, Number(e.target.value)),
                  })
                }
                className="w-16 px-2 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded text-center focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-xs text-slate-500 font-medium">м</span>
            </div>
          </div>
          <input
            type="range"
            min="2.2"
            max="6.0"
            step="0.1"
            value={inputs.heightM}
            onChange={(e) => onChange({ heightM: Number(e.target.value) })}
            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>2.2 м</span>
            <span>4.0 м</span>
            <span>6.0 м</span>
          </div>
        </div>
      </div>

      {/* Advanced Room Heights (Workplane & Suspension) */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-slate-700 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            {lang === 'ru' ? 'Расчетная плоскость:' : 'Hisobiy tekislik:'}
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => onChange({ workPlaneHeightM: 0.0 })}
              className={`px-2 py-0.5 rounded-md transition-all ${
                inputs.workPlaneHeightM === 0
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ru' ? 'Пол (0.0 м, норма ШНК)' : "Pol (0.0 m, ShNQ)"}
            </button>
            <button
              type="button"
              onClick={() => onChange({ workPlaneHeightM: 0.8 })}
              className={`px-2 py-0.5 rounded-md transition-all ${
                inputs.workPlaneHeightM > 0
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ru' ? 'Стол/Стойка (0.8 м)' : 'Stol / Rasta (0.8 m)'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {lang === 'ru'
              ? `Расчетная высота подвеса светильника: h = ${outputs.calcMountingHeightM.toFixed(1)} м`
              : `Yoritgich osilish balandligi: h = ${outputs.calcMountingHeightM.toFixed(1)} m`}
          </span>
        </div>
      </div>
    </div>
  );
};
