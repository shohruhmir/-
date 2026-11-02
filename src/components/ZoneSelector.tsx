import React, { useState } from 'react';
import { 
  Building, 
  Building2, 
  Hotel, 
  Footprints, 
  DoorOpen, 
  ShieldCheck, 
  Sliders, 
  HelpCircle,
  Check,
  Sofa,
  BedDouble,
  Utensils,
  Bath,
  Columns3,
  Baby,
  Laptop,
  Briefcase,
  Users,
  ShoppingBag,
  ArrowRightLeft,
  Boxes,
  Car,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { ZONE_PRESETS } from '../data/shnkNorms';
import { CalculationInputs, RoomCategory } from '../types/calculator';
import { generateDefaultElectricalItems } from '../utils/electricalGenerator';

interface ZoneSelectorProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  onChange: (updates: Partial<CalculationInputs>) => void;
  onOpenNorms: () => void;
}

export const ZoneSelector: React.FC<ZoneSelectorProps> = ({
  lang,
  inputs,
  onChange,
  onOpenNorms,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building': return <Building className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Hotel': return <Hotel className="w-5 h-5" />;
      case 'Footprints': return <Footprints className="w-5 h-5" />;
      case 'DoorOpen': return <DoorOpen className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Sofa': return <Sofa className="w-5 h-5" />;
      case 'BedDouble': return <BedDouble className="w-5 h-5" />;
      case 'Utensils': return <Utensils className="w-5 h-5" />;
      case 'Bath': return <Bath className="w-5 h-5" />;
      case 'Columns3': return <Columns3 className="w-5 h-5" />;
      case 'Baby': return <Baby className="w-5 h-5" />;
      case 'Laptop': return <Laptop className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5" />;
      case 'ArrowRightLeft': return <ArrowRightLeft className="w-5 h-5" />;
      case 'Boxes': return <Boxes className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
    }
  };

  const handleSelectZone = (zoneId: string) => {
    const selected = ZONE_PRESETS.find((z) => z.id === zoneId);
    if (selected) {
      const isWorkTable = selected.workPlaneRu.includes('0.8');
      const newItems = generateDefaultElectricalItems(
        selected,
        inputs.lengthM,
        inputs.widthM,
        inputs.socketStandardHeightCm,
        inputs.switchStandardHeightCm
      );

      onChange({
        zoneId,
        heightM: inputs.heightM || selected.defaultHeight,
        workPlaneHeightM: isWorkTable ? 0.8 : 0.0,
        electricalItems: newItems,
      });
    } else {
      onChange({ zoneId });
    }
  };

  const categories = [
    { id: 'all', labelRu: 'Все типы помещений', labelUz: 'Barcha xonalar' },
    { id: 'vestibule', labelRu: 'Входные группы (ШНК)', labelUz: 'Kirish guruhlari (ShNQ)' },
    { id: 'commercial', labelRu: 'Офисы и бизнес', labelUz: 'Ofis va tijorat' },
    { id: 'lab', labelRu: 'Лаборатории и спецпомещения', labelUz: 'Laboratoriya va maxsus' },
    { id: 'residential', labelRu: 'Жилые комнаты', labelUz: 'Turar-joy xonalari' },
    { id: 'utility', labelRu: 'Склады и паркинг', labelUz: 'Ombor va garaj' },
  ];

  // Normalize text for flexible search (supports Cyrillic/Latin variants e.g. хожатхона / hojatxona, иқлим / iqlim)
  const normalizeSearch = (str: string) => {
    return str
      .toLowerCase()
      .replace(/қ/g, 'k')
      .replace(/ғ/g, 'g')
      .replace(/ҳ/g, 'x')
      .replace(/ў/g, 'o')
      .replace(/ё/g, 'е');
  };

  const term = searchTerm.toLowerCase().trim();
  const normalizedTerm = normalizeSearch(term);

  const filteredZones = ZONE_PRESETS.filter((zone) => {
    // If user is searching with text, search across ALL categories so nothing is missed
    const matchesCategory =
      term.length > 0 ||
      inputs.selectedCategoryTab === 'all' ||
      zone.category === inputs.selectedCategoryTab;

    if (!term) return matchesCategory;

    const searchableText = `${zone.nameRu} ${zone.nameUz} ${zone.descriptionRu} ${zone.descriptionUz} ${zone.id}`;
    const normalizedText = normalizeSearch(searchableText);

    return (
      searchableText.toLowerCase().includes(term) ||
      normalizedText.includes(normalizedTerm)
    );
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'ru' ? 'Выбор типа помещения и нормы освещенности' : "Xona turini va yoritilganlik me'yorini tanlash"}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'ru'
                ? 'Входные группы, жилые комнаты, офисы и склады по ШНК 2.01.05-24'
                : "Vestibyullar, turar-joy xonalari, ofislar va omborlar (ShNQ 2.01.05-24)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'ru' ? 'Поиск помещения...' : 'Xonani qidirish...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500 w-44"
            />
          </div>

          <button
            type="button"
            onClick={onOpenNorms}
            className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-semibold px-2 py-1.5 rounded-lg border border-amber-200 bg-amber-50"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'ru' ? 'Таблица ШНК' : 'ShNQ jadvali'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 scrollbar-none border-b border-slate-100">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-0.5" />
        {categories.map((cat) => {
          const isActive = inputs.selectedCategoryTab === cat.id && !searchTerm;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSearchTerm('');
                onChange({ selectedCategoryTab: cat.id as any });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {lang === 'ru' ? cat.labelRu : cat.labelUz}
            </button>
          );
        })}
      </div>

      {/* Quick Search Chips from Project Table */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
        <span className="text-slate-400 font-medium whitespace-nowrap shrink-0">
          {lang === 'ru' ? 'Из проекта:' : 'Loyihadan:'}
        </span>
        {[
          'Вестибюль',
          'Шоурум',
          'Махсулотларни сотиш жойи',
          'Кабинет руководителя',
          'Конференц зал',
          'Ходимлар хонаси',
          'Ногиронлар хожатхона',
          'Холл',
          'Хожатхона',
          'Душевая ва хожатхона',
          'Офис',
          'Лаборатория',
          'Молекуляр хонаси',
          'Коридор',
          'Иқлим хонаси',
          'Экиш хонаси',
          'Мойка',
          'Автоклав',
          'Озиқа хонаси',
          'Лестничная клетка',
        ].map((roomName) => (
          <button
            key={roomName}
            type="button"
            onClick={() => setSearchTerm(searchTerm === roomName ? '' : roomName)}
            className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition-colors ${
              searchTerm === roomName
                ? 'bg-amber-600 text-white border-amber-600 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {roomName}
          </button>
        ))}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredZones.map((zone) => {
          const isSelected = inputs.zoneId === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => handleSelectZone(zone.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between group ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                    }`}
                  >
                    {getIcon(zone.iconName)}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight ${
                        isSelected
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {zone.illuminanceLux} {lang === 'ru' ? 'лк' : 'lk'}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                      {lang === 'ru' ? zone.workPlaneRu : zone.workPlaneUz}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 text-sm mb-1 leading-snug">
                  {lang === 'ru' ? zone.nameRu : zone.nameUz}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {lang === 'ru' ? zone.descriptionRu : zone.descriptionUz}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[180px]" title={zone.shnkClause}>
                  {zone.shnkClause.split('/')[0]}
                </span>
                {isSelected ? (
                  <span className="inline-flex items-center text-amber-600 font-bold gap-0.5">
                    <Check className="w-3 h-3" />
                    {lang === 'ru' ? 'Выбрано' : 'Tanlandi'}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {zone.defaultSocketsBase} {lang === 'ru' ? 'роз.' : 'roz.'}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {/* Custom Lux Card */}
        <button
          type="button"
          onClick={() => onChange({ zoneId: 'custom' })}
          className={`relative text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between group ${
            inputs.zoneId === 'custom'
              ? 'border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20 shadow-xs'
              : 'border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50/70 bg-white'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  inputs.zoneId === 'custom'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                {inputs.customLux} {lang === 'ru' ? 'лк' : 'lk'}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">
              {lang === 'ru' ? 'Пользовательская норма' : "Maxsus me'yor (qo'lda kiritish)"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {lang === 'ru'
                ? 'Задать собственное нормативное значение освещенности E вручную'
                : "Kerakli yoritilganlik darajasini o'zingiz belgilang"}
            </p>
          </div>

          {inputs.zoneId === 'custom' ? (
            <div className="mt-3 pt-2 border-t border-amber-200/60" onClick={(e) => e.stopPropagation()}>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                {lang === 'ru' ? 'Норма E, люкс:' : "Me'yoriy E, lyuks:"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={inputs.customLux}
                  onChange={(e) => onChange({ customLux: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={inputs.customLux}
                  onChange={(e) => onChange({ customLux: Math.max(5, Number(e.target.value)) })}
                  className="w-16 px-2 py-1 text-xs border border-slate-300 rounded font-bold text-center text-slate-800"
                />
              </div>
            </div>
          ) : (
            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              {lang === 'ru' ? 'Произвольное значение' : "Ixtiyoriy qiymat"}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
