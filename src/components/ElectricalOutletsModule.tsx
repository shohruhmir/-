import React, { useState } from 'react';
import { 
  Zap, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  Sliders, 
  RotateCcw, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Layers, 
  Settings2,
  Plug,
  Power
} from 'lucide-react';
import { CalculationInputs, CalculationOutputs, ElectricalItem, WallSide } from '../types/calculator';
import { ZONE_PRESETS } from '../data/shnkNorms';
import { generateDefaultElectricalItems } from '../utils/electricalGenerator';

interface ElectricalOutletsModuleProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  onChange: (updates: Partial<CalculationInputs>) => void;
}

export const ElectricalOutletsModule: React.FC<ElectricalOutletsModuleProps> = ({
  lang,
  inputs,
  outputs,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'items' | 'panel'>('summary');

  const zone = ZONE_PRESETS.find((z) => z.id === inputs.zoneId) || ZONE_PRESETS[0];

  const handleRegenerateDefaults = () => {
    const items = generateDefaultElectricalItems(
      zone,
      inputs.lengthM,
      inputs.widthM,
      inputs.socketStandardHeightCm,
      inputs.switchStandardHeightCm
    );
    onChange({ electricalItems: items });
  };

  const handleAddItem = (category: 'socket' | 'switch') => {
    const newId = `${category}_${Date.now()}`;
    const newItem: ElectricalItem = category === 'socket'
      ? {
          id: newId,
          category: 'socket',
          type: 'socket_double',
          wall: 'top',
          positionPct: 50,
          heightCm: inputs.socketStandardHeightCm,
          labelRu: 'Дополнительная розетка',
          labelUz: 'Qo\'shimcha rozetka',
        }
      : {
          id: newId,
          category: 'switch',
          type: 'switch_single',
          wall: 'bottom',
          positionPct: 25,
          heightCm: inputs.switchStandardHeightCm,
          labelRu: 'Выключатель',
          labelUz: 'O\'chirgich',
        };

    onChange({
      electricalItems: [...inputs.electricalItems, newItem],
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      electricalItems: inputs.electricalItems.filter((i) => i.id !== id),
    });
  };

  const handleUpdateItem = (id: string, updates: Partial<ElectricalItem>) => {
    onChange({
      electricalItems: inputs.electricalItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const sockets = inputs.electricalItems.filter((i) => i.category === 'socket');
  const switches = inputs.electricalItems.filter((i) => i.category === 'switch');

  const wallNames: Record<WallSide, { ru: string; uz: string }> = {
    top: { ru: 'Верхняя (Север)', uz: 'Yuqori devor' },
    bottom: { ru: 'Нижняя (Вход)', uz: 'Kirish devori' },
    left: { ru: 'Левая стена', uz: 'Chap devor' },
    right: { ru: 'Правая стена', uz: 'O\'ng devor' },
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold text-xs">
            5
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {lang === 'ru'
                ? 'Расположение розеток и выключателей'
                : 'Rozetkalar va o\'chirgichlar joylashuvi va hisobi'}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold">
                ПУЭ / ШНК
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'ru'
                ? 'Инженерные нормы размещения, высоты монтажа от пола и спецификация кабелей'
                : "Pol sathidan balandlik, devorlarga taqsimlash va kabel hisobi"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRegenerateDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors shadow-xs"
            title={lang === 'ru' ? 'Расставить розетки и выключатели по норме' : 'Me\'yor bo\'yicha avtomatik taqsimlash'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-violet-600" />
            <span>{lang === 'ru' ? 'Авторасстановка по норме' : 'Avtomatik joylash'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI tiles for Electrical installation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        {/* Total Sockets */}
        <div className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200/80">
          <div className="flex items-center justify-between text-violet-700 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Всего розеток' : 'Jami rozetkalar'}
            </span>
            <Plug className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-violet-950 font-mono">
            {sockets.length}
            <span className="text-xs font-semibold text-violet-700 ml-1">шт.</span>
          </div>
          <div className="text-[10px] text-violet-700/80 mt-1">
            {lang === 'ru' ? `Норма: ≥ ${outputs.recommendedSocketsByNorm} шт.` : `Me'yor: ≥ ${outputs.recommendedSocketsByNorm} dona`}
          </div>
        </div>

        {/* Total Switches */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Выключатели' : 'O\'chirgichlar'}
            </span>
            <Power className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950 font-mono">
            {switches.length}
            <span className="text-xs font-semibold text-blue-700 ml-1">шт.</span>
          </div>
          <div className="text-[10px] text-blue-700/80 mt-1">
            {switches.some((s) => s.type === 'switch_pass_through') 
              ? (lang === 'ru' ? 'С проходными выкл.' : 'O\'tish o\'chirgichlar bilan') 
              : (lang === 'ru' ? 'Стандартные клавиши' : 'Standart klavishlar')}
          </div>
        </div>

        {/* Sockets Cable (3x2.5) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Кабель розеток (3×2.5)' : 'Rozetka kabeli (3×2.5)'}
            </span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ~{outputs.estSocketsCableM}
            <span className="text-xs font-semibold text-slate-500 ml-1">м</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            ВВГнг-LS 3×2.5 мм²
          </div>
        </div>

        {/* Lighting Cable (3x1.5) */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-semibold">
              {lang === 'ru' ? 'Кабель света (3×1.5)' : 'Yoritish kabeli (3×1.5)'}
            </span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono">
            ~{outputs.estLightingCableM}
            <span className="text-xs font-semibold text-amber-800 ml-1">м</span>
          </div>
          <div className="text-[10px] text-amber-700 mt-1 font-mono">
            ВВГнг-LS 3×1.5 мм²
          </div>
        </div>
      </div>

      {/* Tabs navigation: Points List vs Electrical Panel Specification */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-4 pb-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'summary'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ru' ? 'Список и высоты точек' : 'Nuqtalar ro\'yxati'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('panel')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'panel'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ru' ? 'Щиток и автоматика' : 'Elektr qalqoni va avtomatlar'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddItem('socket')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-violet-200 bg-violet-50 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? '+ Розетка' : '+ Rozetka'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddItem('switch')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? '+ Выключатель' : '+ O\'chirgich'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Points Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="p-2.5">{lang === 'ru' ? 'Тип устройства' : 'Qurilma turi'}</th>
                  <th className="p-2.5">{lang === 'ru' ? 'Стена расположения' : 'Joylashgan devor'}</th>
                  <th className="p-2.5 text-center">{lang === 'ru' ? 'Позиция %' : 'Pozitsiya %'}</th>
                  <th className="p-2.5 text-center">{lang === 'ru' ? 'Высота от пола' : 'Pol sathidan balandlik'}</th>
                  <th className="p-2.5">{lang === 'ru' ? 'Назначение / Описание' : 'Vazifasi'}</th>
                  <th className="p-2.5 text-right">{lang === 'ru' ? 'Действия' : 'Amallar'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inputs.electricalItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Device Type Select */}
                    <td className="p-2.5">
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            type: e.target.value as any,
                            category: e.target.value.startsWith('socket') ? 'socket' : 'switch',
                          })
                        }
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                      >
                        <optgroup label={lang === 'ru' ? 'Розетки' : 'Rozetkalar'}>
                          <option value="socket_double">{lang === 'ru' ? 'Розетка двойная 220В' : 'Ikki barobar rozetka'}</option>
                          <option value="socket_single">{lang === 'ru' ? 'Розетка одинарная 220В' : 'Yakka rozetka'}</option>
                          <option value="socket_ip44">{lang === 'ru' ? 'Влагозащитная IP44' : 'IP44 namlikdan himoyalangan'}</option>
                          <option value="socket_power_ac">{lang === 'ru' ? 'Силовая (Кондиционер/Завеса)' : 'Kuchlanishli (Konditsioner)'}</option>
                        </optgroup>
                        <optgroup label={lang === 'ru' ? 'Выключатели' : 'O\'chirgichlar'}>
                          <option value="switch_single">{lang === 'ru' ? 'Выключатель 1-клавишный' : '1-klavishli o\'chirgich'}</option>
                          <option value="switch_double">{lang === 'ru' ? 'Выключатель 2-клавишный' : '2-klavishli o\'chirgich'}</option>
                          <option value="switch_pass_through">{lang === 'ru' ? 'Проходной переключатель' : 'O\'tish o\'chirgichi'}</option>
                        </optgroup>
                      </select>
                    </td>

                    {/* Wall select */}
                    <td className="p-2.5">
                      <select
                        value={item.wall}
                        onChange={(e) => handleUpdateItem(item.id, { wall: e.target.value as WallSide })}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700"
                      >
                        <option value="bottom">{lang === 'ru' ? wallNames.bottom.ru : wallNames.bottom.uz}</option>
                        <option value="top">{lang === 'ru' ? wallNames.top.ru : wallNames.top.uz}</option>
                        <option value="left">{lang === 'ru' ? wallNames.left.ru : wallNames.left.uz}</option>
                        <option value="right">{lang === 'ru' ? wallNames.right.ru : wallNames.right.uz}</option>
                      </select>
                    </td>

                    {/* Position slider */}
                    <td className="p-2.5 text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <input
                          type="range"
                          min="5"
                          max="95"
                          step="5"
                          value={item.positionPct}
                          onChange={(e) => handleUpdateItem(item.id, { positionPct: Number(e.target.value) })}
                          className="w-16 h-1 accent-violet-600 bg-slate-200 rounded cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-slate-700 w-8">{item.positionPct}%</span>
                      </div>
                    </td>

                    {/* Height CM */}
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="10"
                          max="250"
                          step="5"
                          value={item.heightCm}
                          onChange={(e) => handleUpdateItem(item.id, { heightCm: Number(e.target.value) })}
                          className="w-14 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-center font-bold text-slate-900"
                        />
                        <span className="text-[11px] text-slate-500 font-mono">см</span>
                      </div>
                    </td>

                    {/* Label */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={lang === 'ru' ? item.labelRu : item.labelUz}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            [lang === 'ru' ? 'labelRu' : 'labelUz']: e.target.value,
                          })
                        }
                        className="w-full px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-800"
                      />
                    </td>

                    {/* Delete */}
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={lang === 'ru' ? 'Удалить точку' : 'O\'chirish'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Installation Height Reference Note */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-600 shrink-0" />
              <span>
                <strong>{lang === 'ru' ? 'Стандартные высоты монтажа:' : 'Standart o\'rnatish balandliklari:'}</strong>{' '}
                {lang === 'ru'
                  ? 'Выключатели: h = 90 см (со стороны ручки двери); Розетки общего назначения: h = 30 см; Розетки фартука кухни / стойки: h = 105 см; Кондиционер / завеса: h = 220 см.'
                  : "O'chirgichlar: h = 90 sm; Umumiy rozetkalar: h = 30 sm; Oshxona fartuki: h = 105 sm; Konditsioner: h = 220 sm."}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'panel' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Lighting Breaker */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {lang === 'ru' ? 'Группа освещения (Линия 1)' : 'Yoritish liniyasi'}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-100 text-amber-900">
                  10A / Тип B или C
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                {lang === 'ru'
                  ? `Автоматический выключатель на ${outputs.recommendedBreakerLightingA}А. Питание ${outputs.recommendedLuminairesCount} шт. LED светильников общей мощностью ${outputs.totalPowerWatts} Вт.`
                  : `${outputs.recommendedLuminairesCount} dona LED yoritgich uchun ${outputs.recommendedBreakerLightingA}A avtomat.`}
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Кабель: ВВГнг-LS 3×1.5 мм² (~{outputs.estLightingCableM} м)
              </div>
            </div>

            {/* Sockets Breaker */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {lang === 'ru' ? 'Розеточная группа (Линия 2)' : 'Rozetkalar liniyasi'}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-violet-100 text-violet-900">
                  16A / Тип C
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                {lang === 'ru'
                  ? `Автоматический выключатель на ${outputs.recommendedBreakerSocketsA}А. Питает до 6-8 розеток общего назначения суммарной мощностью до 3.5 кВт.`
                  : `Umumiy rozetkalar uchun ${outputs.recommendedBreakerSocketsA}A avtomatik o'chirgich.`}
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Кабель: ВВГнг-LS 3×2.5 мм² (~{outputs.estSocketsCableM} м)
              </div>
            </div>

            {/* RCD Protection */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {lang === 'ru' ? 'Дифференциальная защита (УЗО)' : 'UZO himoyasi'}
                </span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-100 text-emerald-900">
                  30 мА (ток утечки)
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                {lang === 'ru'
                  ? 'Защита от поражения электрическим током людей при прямом прикосновении. Обязательна для розеточных сетей и влажных зон.'
                  : "Inson xavfsizligi va elektr toki urishidan himoyalash uchun 30mA UZO."}
              </p>
              <div className="text-[11px] font-mono text-emerald-700 font-semibold pt-2 border-t border-slate-200">
                {lang === 'ru' ? 'Требование ПУЭ / ГОСТ' : 'PUE / GOST talabi'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
