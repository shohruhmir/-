import React from 'react';
import { 
  Lightbulb, 
  BookOpen, 
  Printer, 
  RotateCcw, 
  MapPin, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface HeaderProps {
  lang: 'ru' | 'uz';
  setLang: (lang: 'ru' | 'uz') => void;
  onOpenNorms: () => void;
  onOpenReport: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  onOpenNorms,
  onOpenReport,
  onReset,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
              <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {lang === 'ru' 
                    ? 'Калькулятор освещенности' 
                    : 'Yoritilganlik kalkulyatori'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ШНК 2.01.05-24
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {lang === 'ru' ? 'Узбекистан' : "O'zbekiston"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'ru'
                  ? 'Светодиодное освещение вестибюлей, холлов и входных групп с оценкой годовых энергозатрат'
                  : "Vestibyullar, zallar va kirish guruhlarining LED yoritilishi va yillik energiya sarfi hisobi"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {/* Language toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'ru'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Русский
              </button>
              <button
                type="button"
                onClick={() => setLang('uz')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'uz'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                O'zbekcha
              </button>
            </div>

            {/* Reference to SHNK */}
            <button
              type="button"
              onClick={onOpenNorms}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors shadow-xs"
              title={lang === 'ru' ? 'Справка по нормам ШНК 2.01.05-24' : "ShNQ 2.01.05-24 me'yorlari bo'yicha ma'lumot"}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ru' ? 'Справка ШНК' : "ShNQ ma'lumotnomasi"}</span>
            </button>

            {/* Print Specification */}
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-xs"
              title={lang === 'ru' ? 'Сформировать отчет / печать' : "Hisobotni shakllantirish / chop etish"}
            >
              <Printer className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang === 'ru' ? 'Спецификация' : 'Spetsifikatsiya'}</span>
            </button>

            {/* Reset button */}
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors"
              title={lang === 'ru' ? 'Сбросить параметры' : 'Qayta tiklash'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
