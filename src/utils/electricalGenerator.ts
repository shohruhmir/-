import { ElectricalItem, ZoneNorm, WallSide } from '../types/calculator';

/**
 * Generates initial electrical items (sockets and switches) for a given room zone and dimensions
 */
export function generateDefaultElectricalItems(
  zone: ZoneNorm,
  lengthM: number,
  widthM: number,
  socketStandardHeightCm = 30,
  switchStandardHeightCm = 90
): ElectricalItem[] {
  const area = lengthM * widthM;
  const items: ElectricalItem[] = [];

  // 1. SWITCHES at entrance (Bottom wall near door, usually at ~20% or ~80% position)
  if (zone.defaultSwitchType === 'pass_through') {
    items.push({
      id: 'sw_main',
      category: 'switch',
      type: 'switch_pass_through',
      wall: 'bottom',
      positionPct: 20,
      heightCm: switchStandardHeightCm,
      labelRu: 'Проходной выкл. (Вход)',
      labelUz: 'O\'tish o\'chirgich (Kirish)',
    });
    // Second pass-through switch on opposite or side wall
    items.push({
      id: 'sw_secondary',
      category: 'switch',
      type: 'switch_pass_through',
      wall: 'top',
      positionPct: 80,
      heightCm: switchStandardHeightCm,
      labelRu: 'Проходной выкл. (Зона 2)',
      labelUz: 'O\'tish o\'chirgich (2-hudud)',
    });
  } else if (zone.defaultSwitchType === 'double') {
    items.push({
      id: 'sw_main',
      category: 'switch',
      type: 'switch_double',
      wall: 'bottom',
      positionPct: 20,
      heightCm: switchStandardHeightCm,
      labelRu: '2-клавишный выключатель',
      labelUz: '2-tugmali o\'chirgich',
    });
  } else {
    items.push({
      id: 'sw_main',
      category: 'switch',
      type: 'switch_single',
      wall: 'bottom',
      positionPct: 20,
      heightCm: switchStandardHeightCm,
      labelRu: '1-клавишный выключатель',
      labelUz: '1-tugmali o\'chirgich',
    });
  }

  // 2. SOCKETS: calculate baseline number
  const recommendedCount = Math.max(
    zone.defaultSocketsBase,
    Math.round(zone.defaultSocketsBase + area * zone.socketsPerM2)
  );

  // Specific room profiles:
  if (zone.id === 'kitchen') {
    // Kitchen countertop, fridge, microwave, extra
    items.push({
      id: 'soc_fridge',
      category: 'socket',
      type: 'socket_single',
      wall: 'left',
      positionPct: 15,
      heightCm: 30,
      labelRu: 'Холодильник (h=30см)',
      labelUz: 'Muzlatgich (h=30sm)',
    });
    items.push({
      id: 'soc_countertop_1',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 30,
      heightCm: 105,
      labelRu: 'Фартук / Столешница (h=105см)',
      labelUz: 'Ish stoli / Fartuk (h=105sm)',
    });
    items.push({
      id: 'soc_countertop_2',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 70,
      heightCm: 105,
      labelRu: 'Техника / Чайник (h=105см)',
      labelUz: 'Choynak / Texnika (h=105sm)',
    });
    items.push({
      id: 'soc_dining',
      category: 'socket',
      type: 'socket_double',
      wall: 'right',
      positionPct: 60,
      heightCm: 30,
      labelRu: 'Обеденный стол (h=30см)',
      labelUz: 'Ovqatlanish stoli (h=30sm)',
    });
    items.push({
      id: 'soc_ac',
      category: 'socket',
      type: 'socket_power_ac',
      wall: 'right',
      positionPct: 20,
      heightCm: 220,
      labelRu: 'Кондиционер (h=220см)',
      labelUz: 'Konditsioner (h=220sm)',
    });
  } else if (zone.id === 'autoclave_room') {
    // Autoclave sterilization room needs high power sockets
    items.push({
      id: 'soc_autoclave_power',
      category: 'socket',
      type: 'socket_power_ac',
      wall: 'top',
      positionPct: 40,
      heightCm: 110,
      labelRu: 'Силовая розетка автоклава (16-25А)',
      labelUz: 'Avtoklav uchun yuqori quvvatli rozetka',
    });
    items.push({
      id: 'soc_drying',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 75,
      heightCm: 110,
      labelRu: 'Сушильный шкаф / Стерилизатор',
      labelUz: 'Quritish shkafi / Sterilizator',
    });
    items.push({
      id: 'soc_exhaust',
      category: 'socket',
      type: 'socket_single',
      wall: 'left',
      positionPct: 50,
      heightCm: 220,
      labelRu: 'Приточно-вытяжная вентиляция',
      labelUz: 'Havoni tortish ventilyatsiyasi',
    });
  } else if (zone.id === 'accessible_toilet' || zone.id === 'toilet_standard' || zone.id === 'shower_and_toilet' || zone.id === 'bathroom' || zone.requiresIP44) {
    // Sanitary / Wet rooms
    items.push({
      id: 'soc_ip44_1',
      category: 'socket',
      type: 'socket_ip44',
      wall: 'right',
      positionPct: 35,
      heightCm: 110,
      labelRu: 'Влагозащитная розетка IP44',
      labelUz: 'Namlikdan himoyalangan IP44 rozetka',
    });
    items.push({
      id: 'soc_ip44_2',
      category: 'socket',
      type: 'socket_ip44',
      wall: 'left',
      positionPct: 65,
      heightCm: 90,
      labelRu: 'Влагозащитная розетка IP44',
      labelUz: 'Namlikdan himoyalangan IP44',
    });
  } else if (zone.category === 'lab') {
    // General Laboratory & Clean rooms
    items.push({
      id: 'soc_lab_bench_1',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 30,
      heightCm: 105,
      labelRu: 'Лабораторный стол 1 (h=105см)',
      labelUz: 'Laboratoriya stoli 1',
    });
    items.push({
      id: 'soc_lab_bench_2',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 70,
      heightCm: 105,
      labelRu: 'Лабораторный стол 2 (h=105см)',
      labelUz: 'Laboratoriya stoli 2',
    });
    items.push({
      id: 'soc_analyzer',
      category: 'socket',
      type: 'socket_double',
      wall: 'right',
      positionPct: 50,
      heightCm: 105,
      labelRu: 'Приборы / Анализаторы',
      labelUz: 'O\'lchov asboblari',
    });
    items.push({
      id: 'soc_laminar',
      category: 'socket',
      type: 'socket_power_ac',
      wall: 'left',
      positionPct: 40,
      heightCm: 150,
      labelRu: 'Ламинарный бокс / Вытяжка',
      labelUz: 'Laminar boks / Ventilyatsiya',
    });
  } else if (zone.category === 'vestibule') {
    // Vestibule / Lobby
    items.push({
      id: 'soc_cleaning_1',
      category: 'socket',
      type: 'socket_double',
      wall: 'bottom',
      positionPct: 80,
      heightCm: socketStandardHeightCm,
      labelRu: 'У входа / Клининг',
      labelUz: 'Kirish / Tozalash texnikasi',
    });
    items.push({
      id: 'soc_cleaning_2',
      category: 'socket',
      type: 'socket_single',
      wall: 'top',
      positionPct: 30,
      heightCm: socketStandardHeightCm,
      labelRu: 'Общая уборочная',
      labelUz: 'Umumiy tozalash rozetkasi',
    });
    items.push({
      id: 'soc_security',
      category: 'socket',
      type: 'socket_double',
      wall: 'right',
      positionPct: 50,
      heightCm: socketStandardHeightCm,
      labelRu: 'Пост охраны / Видеонаблюдение',
      labelUz: 'Qo\'riqlash posti / Kamera',
    });
    if (area > 20) {
      items.push({
        id: 'soc_curtain',
        category: 'socket',
        type: 'socket_power_ac',
        wall: 'bottom',
        positionPct: 50,
        heightCm: 220,
        labelRu: 'Тепловая завеса над дверью',
        labelUz: 'Issiqlik pardasi (eshik tepasida)',
      });
    }
  } else {
    // Standard Residential or Commercial Room
    // Bottom wall (near entrance)
    items.push({
      id: 'soc_1',
      category: 'socket',
      type: 'socket_double',
      wall: 'bottom',
      positionPct: 80,
      heightCm: socketStandardHeightCm,
      labelRu: 'Розетка у входа',
      labelUz: 'Kirish oldidagi rozetka',
    });
    // Top wall (main media/desk/workspace)
    items.push({
      id: 'soc_2',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 35,
      heightCm: socketStandardHeightCm,
      labelRu: 'ТВ / Рабочая зона',
      labelUz: 'TV / Ishchi zona',
    });
    items.push({
      id: 'soc_3',
      category: 'socket',
      type: 'socket_double',
      wall: 'top',
      positionPct: 70,
      heightCm: socketStandardHeightCm,
      labelRu: 'Мультимедиа / ПК',
      labelUz: 'Multimedia / Kompyuter',
    });
    // Left & Right walls
    items.push({
      id: 'soc_4',
      category: 'socket',
      type: 'socket_single',
      wall: 'left',
      positionPct: 50,
      heightCm: socketStandardHeightCm,
      labelRu: 'Угловая розетка',
      labelUz: 'Burchak rozetkasi',
    });
    items.push({
      id: 'soc_5',
      category: 'socket',
      type: 'socket_single',
      wall: 'right',
      positionPct: 65,
      heightCm: socketStandardHeightCm,
      labelRu: 'Боковая розетка',
      labelUz: 'Yon devor rozetkasi',
    });
    // AC socket for rooms > 12 m2
    if (area >= 12) {
      items.push({
        id: 'soc_ac',
        category: 'socket',
        type: 'socket_power_ac',
        wall: 'right',
        positionPct: 20,
        heightCm: 220,
        labelRu: 'Кондиционер / Сплит-система',
        labelUz: 'Konditsioner (h=220sm)',
      });
    }
  }

  return items;
}
