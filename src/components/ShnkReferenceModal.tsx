import React from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Info, 
  Building, 
  Sun,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { ZONE_PRESETS } from '../data/shnkNorms';

interface ShnkReferenceModalProps {
  lang: 'ru' | 'uz';
  isOpen: boolean;
  onClose: () => void;
}

export const ShnkReferenceModal: React.FC<ShnkReferenceModalProps> = ({
  lang,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === 'ru'
                  ? 'Справка по нормам ШНК 2.01.05-24'
                  : "ShNQ 2.01.05-24 me'yorlari bo'yicha ma'lumot"}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ru'
                  ? '«Естественное и искусственное освещение» Республики Узбекистан'
                  : "\"Tabiiy va sun'iy yoritish\" — O'zbekiston Respublikasi shaharsozlik normalari"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-5 overflow-y-auto text-xs text-slate-700 space-y-5">
          {/* Section 1: Overview */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <h3 className="font-bold text-amber-900 text-sm mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              {lang === 'ru'
                ? 'Статус и область применения ШНК 2.01.05-24'
                : 'ShNQ 2.01.05-24 maqomi va qo\'llanish sohasi'}
            </h3>
            <p className="text-amber-950 leading-relaxed">
              {lang === 'ru'
                ? 'ШНК 2.01.05-24 («Естественное и искусственное освещение») утверждены Министерством строительства и жилищно-коммунального хозяйства Республики Узбекистан. Нормы устанавливают обязательные требования к проектированию искусственного освещения жилых, общественных зданий, холлов и наружных входных групп.'
                : "ShNQ 2.01.05-24 me'yorlari O'zbekiston Respublikasi Qurilish va uy-joy kommunal xo'jaligi vazirligi tomonidan tasdiqlangan. Mazkur me'yorlar turar-joy, jamoat binolari vestibyullari va kirish maydonchalarini loyihalashda majburiy hisoblanadi."}
            </p>
          </div>

          {/* Section 2: Normative Table for Vestibules */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2.5 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-600" />
              {lang === 'ru'
                ? 'Таблица нормируемой освещенности входных зон'
                : 'Kirish zonalari uchun me\'yoriy yoritilganlik jadvali'}
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                    <th className="p-2.5">
                      {lang === 'ru' ? 'Тип помещения / зоны' : 'Xona / zona turi'}
                    </th>
                    <th className="p-2.5 text-center">
                      {lang === 'ru' ? 'Норма E, лк' : 'Me\'yor E, lk'}
                    </th>
                    <th className="p-2.5">
                      {lang === 'ru' ? 'Плоскость нормирования' : 'Me\'yoriy tekislik'}
                    </th>
                    <th className="p-2.5">
                      {lang === 'ru' ? 'Пункт ШНК' : 'ShNQ bandi'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {ZONE_PRESETS.map((zone) => (
                    <tr key={zone.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">
                        {lang === 'ru' ? zone.nameRu : zone.nameUz}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-900">
                          {zone.illuminanceLux} лк
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {lang === 'ru' ? zone.workPlaneRu : zone.workPlaneUz}
                      </td>
                      <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                        {zone.shnkClause}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Why Kz = 1.5 for LED in Uzbekistan */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {lang === 'ru'
                ? 'Почему для светодиодов в Узбекистане Kз = 1.5?'
                : "Nima uchun O'zbekistonda LED uchun Kз = 1.5 olinadi?"}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {lang === 'ru'
                ? 'Коэффициент запаса Кз компенсирует неизбежное снижение освещенности в процессе эксплуатации светильников. В климатических условиях Узбекистана действуют особые факторы:'
                : "Zaxira koeffitsiyenti Kз yoritgichlardan foydalanish davomida yorug'lik oqimining pasayishini qoplaydi. O'zbekistonning iqlim sharoitida quyidagi omillar hisobga olinadi:"}
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>
                <strong>{lang === 'ru' ? 'Высокая запыленность:' : 'Yuqori changlanish darajasi:'}</strong>{' '}
                {lang === 'ru'
                  ? 'Сухой и ветреный климат региона приводит к ускоренному оседанию пыли на оптических рассеивателях вестибюлей и входных групп.'
                  : "Quruq va shamolli iqlim natijasida optik tarqatgichlarda chang tez to'planadi."}
              </li>
              <li>
                <strong>{lang === 'ru' ? 'Температурная деградация кристаллов:' : 'Yuqori harorat ta\'siri:'}</strong>{' '}
                {lang === 'ru'
                  ? 'Высокие летние температуры (до +45 °C) ускоряют термическую деградацию люминофора и светодиодных чипов.'
                  : "Yozgi issiq (+45 °C gacha) svetodiod kristallari va lyuminoforning eskirishini tezlashtiradi."}
              </li>
              <li>
                <strong>{lang === 'ru' ? 'Регламент обслуживания:' : 'Xizmat ko\'rsatish oraliqlari:'}</strong>{' '}
                {lang === 'ru'
                  ? 'Стандартный регламент чистки потолочных светильников в жилых домах составляет 1-2 раза в год.'
                  : "Yoritgichlarni tozalash odatda yiliga 1-2 marotaba amalga oshiriladi."}
              </li>
            </ul>
          </div>

          {/* Section 4: Additional Requirements (Flicker, CRI, UGR) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-900 block mb-1">
                {lang === 'ru' ? 'Пульсация освещенности' : "Yorug'lik pulsatsiyasi"}
              </span>
              <span className="text-amber-600 font-mono font-bold text-sm block mb-1">
                Кп ≤ 10–15%
              </span>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru'
                  ? 'Запрещено использование дешевых драйверов с высокой пульсацией, вызывающих утомляемость глаз.'
                  : "Ko'z toliqishini keltirib chiqaradigan sifatsiz drayverlar taqiqlanadi."}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-900 block mb-1">
                {lang === 'ru' ? 'Индекс цветопередачи' : "Rang berish indeksi"}
              </span>
              <span className="text-blue-600 font-mono font-bold text-sm block mb-1">
                Ra (CRI) ≥ 80
              </span>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru'
                  ? 'Обеспечивает естественное восприятие интерьера, лиц посетителей и отделочных материалов.'
                  : "Interyer va ranglarning tabiiy ko'rinishini ta'minlaydi."}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-900 block mb-1">
                {lang === 'ru' ? 'Цветовая температура' : "Rang harorati"}
              </span>
              <span className="text-emerald-600 font-mono font-bold text-sm block mb-1">
                3000K – 4000K
              </span>
              <p className="text-[11px] text-slate-500">
                {lang === 'ru'
                  ? 'Теплый или нейтральный белый свет создает комфортную атмосферу гостеприимства.'
                  : "Iliq yoki neytral oq yorug'lik shinam muhit yaratadi."}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {lang === 'ru' ? 'Понятно, закрыть' : 'Tushunarli, yopish'}
          </button>
        </div>
      </div>
    </div>
  );
};
