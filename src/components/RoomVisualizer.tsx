import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Sparkles, 
  Plug, 
  Trash2, 
  Sliders, 
  X,
  Plus,
  DoorOpen,
  AppWindow,
  RotateCw,
  MinusCircle,
  PlusCircle,
  ArrowRightLeft,
  ArrowUpDown,
  Compass,
  Layers,
  ChevronDown,
  Check,
  Move
} from 'lucide-react';
import { 
  CalculationInputs, 
  CalculationOutputs, 
  ElectricalItem, 
  WallSide, 
  DoorItem, 
  WindowItem 
} from '../types/calculator';

interface RoomVisualizerProps {
  lang: 'ru' | 'uz';
  inputs: CalculationInputs;
  outputs: CalculationOutputs;
  onChange: (updates: Partial<CalculationInputs>) => void;
}

export const RoomVisualizer: React.FC<RoomVisualizerProps> = ({
  lang,
  inputs,
  outputs,
  onChange,
}) => {
  const [viewLayer, setViewLayer] = useState<'all' | 'lighting' | 'electrical'>('all');
  
  // Permanent Active Settings Tab (Never disappears when mouse moves!)
  const [activeTab, setActiveTab] = useState<'doors' | 'windows' | 'electrical'>('doors');
  
  // Currently active selected item ID
  const [selectedDoorId, setSelectedDoorId] = useState<string>('door_main');
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [selectedElectricalId, setSelectedElectricalId] = useState<string | null>(null);
  const [selectedLuminaireId, setSelectedLuminaireId] = useState<string | null>(null);

  // Dragging state with move-threshold to prevent accidental dragging on clicks
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const isActualDragRef = useRef<boolean>(false);

  const [showAddWindowDropdown, setShowAddWindowDropdown] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG Canvas dimensions
  const svgWidth = 660;
  const svgHeight = 420;
  const padding = 50;

  const roomLength = Math.max(0.5, inputs.lengthM);
  const roomWidth = Math.max(0.5, inputs.widthM);

  const availableWidth = svgWidth - padding * 2;
  const availableHeight = svgHeight - padding * 2;

  // Scale factor to fit room in canvas
  const scale = Math.min(
    availableWidth / roomLength,
    availableHeight / roomWidth
  );

  const drawnWidth = roomLength * scale;
  const drawnHeight = roomWidth * scale;

  const startX = (svgWidth - drawnWidth) / 2;
  const startY = (svgHeight - drawnHeight) / 2;

  const cols = outputs.gridCols;
  const rows = outputs.gridRows;

  // Ensure default doors exist
  const doors: DoorItem[] = inputs.doors && inputs.doors.length > 0 
    ? inputs.doors 
    : [
        {
          id: 'door_main',
          wall: 'bottom',
          positionPct: 50,
          widthM: 0.9,
          swingInward: true,
          swingSide: 'right',
          labelRu: 'Входная дверь',
          labelUz: 'Kirish eshigi',
        },
      ];

  // Sync active door id if current one deleted or not found
  const activeDoor = doors.find((d) => d.id === selectedDoorId) || doors[0];

  const windows: WindowItem[] = inputs.windows || [];
  const activeWindow = windows.find((w) => w.id === selectedWindowId) || (windows.length > 0 ? windows[0] : null);

  const electricalItems = inputs.electricalItems || [];
  const activeElectrical = electricalItems.find((e) => e.id === selectedElectricalId) || (electricalItems.length > 0 ? electricalItems[0] : null);

  // Luminaire coordinate generator
  const luminaires: { id: string; x: number; y: number; colIdx: number; rowIdx: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + (c + 0.5) * (drawnWidth / cols);
      const y = startY + (r + 0.5) * (drawnHeight / rows);
      luminaires.push({ id: `lum_${r}_${c}`, x, y, colIdx: c, rowIdx: r });
    }
  }

  // Calculate coordinates for electrical items on the walls
  const getElectricalItemCoords = (item: ElectricalItem) => {
    const pct = Math.max(5, Math.min(95, item.positionPct)) / 100;
    let x = 0;
    let y = 0;

    switch (item.wall) {
      case 'top':
        x = startX + drawnWidth * pct;
        y = startY;
        break;
      case 'bottom':
        x = startX + drawnWidth * pct;
        y = startY + drawnHeight;
        break;
      case 'left':
        x = startX;
        y = startY + drawnHeight * pct;
        break;
      case 'right':
        x = startX + drawnWidth;
        y = startY + drawnHeight * pct;
        break;
    }

    return { x, y };
  };

  const showLights = viewLayer === 'all' || viewLayer === 'lighting';
  const showElectrical = viewLayer === 'all' || viewLayer === 'electrical';

  // Door Management
  const handleUpdateDoor = (id: string, updates: Partial<DoorItem>) => {
    const updated = doors.map((d) => (d.id === id ? { ...d, ...updates } : d));
    onChange({ doors: updated });
  };

  const handleAddDoor = () => {
    const newDoor: DoorItem = {
      id: `door_${Date.now()}`,
      wall: 'bottom',
      positionPct: doors.length === 1 ? (doors[0].positionPct > 50 ? 25 : 75) : 50,
      widthM: 0.9,
      swingInward: true,
      swingSide: 'right',
      labelRu: `Дверь ${doors.length + 1}`,
      labelUz: `Eshik ${doors.length + 1}`,
    };
    onChange({ doors: [...doors, newDoor] });
    setSelectedDoorId(newDoor.id);
    setActiveTab('doors');
  };

  const handleDeleteDoor = (id: string) => {
    if (doors.length <= 1) return; // Keep at least one main entrance door
    const remaining = doors.filter((d) => d.id !== id);
    onChange({ doors: remaining });
    if (selectedDoorId === id && remaining.length > 0) {
      setSelectedDoorId(remaining[0].id);
    }
  };

  // Window Management
  const handleUpdateWindow = (id: string, updates: Partial<WindowItem>) => {
    const updated = windows.map((w) => (w.id === id ? { ...w, ...updates } : w));
    onChange({ windows: updated });
  };

  const handleAddWindowOnWall = (wall: WallSide) => {
    const newWindow: WindowItem = {
      id: `win_${Date.now()}`,
      wall,
      positionPct: 50,
      widthM: 1.5,
      labelRu: `Окно ${windows.length + 1}`,
      labelUz: `Deraza ${windows.length + 1}`,
    };
    onChange({ windows: [...windows, newWindow] });
    setSelectedWindowId(newWindow.id);
    setActiveTab('windows');
    setShowAddWindowDropdown(false);
  };

  const handleDeleteWindow = (id: string) => {
    const remaining = windows.filter((w) => w.id !== id);
    onChange({ windows: remaining });
    if (selectedWindowId === id) {
      setSelectedWindowId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Window Arrangement Presets
  const handleApplyWindowPreset = (preset: 'none' | 'single' | 'corner' | 'opposite' | 'three_sides') => {
    switch (preset) {
      case 'none':
        onChange({ windows: [] });
        setSelectedWindowId(null);
        break;
      case 'single': {
        const newWins: WindowItem[] = [
          { id: 'win_top_1', wall: 'top', positionPct: 50, widthM: 1.5, labelRu: 'Окно (Верх)', labelUz: 'Deraza (Yuqori)' },
        ];
        onChange({ windows: newWins });
        setSelectedWindowId('win_top_1');
        break;
      }
      case 'corner': {
        const newWins: WindowItem[] = [
          { id: 'win_top_1', wall: 'top', positionPct: 70, widthM: 1.5, labelRu: 'Окно (Верх)', labelUz: 'Deraza (Yuqori)' },
          { id: 'win_left_1', wall: 'left', positionPct: 30, widthM: 1.5, labelRu: 'Окно (Лево)', labelUz: 'Deraza (Chap)' },
        ];
        onChange({ windows: newWins });
        setSelectedWindowId('win_top_1');
        break;
      }
      case 'opposite': {
        const newWins: WindowItem[] = [
          { id: 'win_top_1', wall: 'top', positionPct: 50, widthM: 1.5, labelRu: 'Окно (Север)', labelUz: 'Deraza (Shimol)' },
          { id: 'win_bot_1', wall: 'bottom', positionPct: 80, widthM: 1.2, labelRu: 'Окно (Юг)', labelUz: 'Deraza (Janub)' },
        ];
        onChange({ windows: newWins });
        setSelectedWindowId('win_top_1');
        break;
      }
      case 'three_sides': {
        const newWins: WindowItem[] = [
          { id: 'win_left_1', wall: 'left', positionPct: 50, widthM: 1.5, labelRu: 'Окно (Лево)', labelUz: 'Deraza (Chap)' },
          { id: 'win_top_1', wall: 'top', positionPct: 50, widthM: 2.0, labelRu: 'Окно (Центр)', labelUz: 'Deraza (Markaz)' },
          { id: 'win_right_1', wall: 'right', positionPct: 50, widthM: 1.5, labelRu: 'Окно (Право)', labelUz: 'Deraza (O\'ng)' },
        ];
        onChange({ windows: newWins });
        setSelectedWindowId('win_top_1');
        break;
      }
    }
  };

  // Electrical items updater
  const handleUpdateElectricalItem = (id: string, updates: Partial<ElectricalItem>) => {
    onChange({
      electricalItems: electricalItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteElectricalItem = (id: string) => {
    const remaining = electricalItems.filter((i) => i.id !== id);
    onChange({ electricalItems: remaining });
    if (selectedElectricalId === id) {
      setSelectedElectricalId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Dynamic Cross-Wall Dragging on SVG
  const handleStartDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    isActualDragRef.current = false;
    setDraggingId(id);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingId || !svgRef.current || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) {
      isActualDragRef.current = true;
    }

    if (!isActualDragRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * svgWidth;
    const mouseY = ((e.clientY - svgRect.top) / svgRect.height) * svgHeight;

    // Calculate perpendicular distance to each of the 4 walls
    const distTop = Math.abs(mouseY - startY);
    const distBottom = Math.abs(mouseY - (startY + drawnHeight));
    const distLeft = Math.abs(mouseX - startX);
    const distRight = Math.abs(mouseX - (startX + drawnWidth));

    const minDist = Math.min(distTop, distBottom, distLeft, distRight);
    let targetWall: WallSide = 'top';
    if (minDist === distTop) targetWall = 'top';
    else if (minDist === distBottom) targetWall = 'bottom';
    else if (minDist === distLeft) targetWall = 'left';
    else if (minDist === distRight) targetWall = 'right';

    // Calculate percentage along target wall
    let pct = 50;
    if (targetWall === 'top' || targetWall === 'bottom') {
      pct = Math.round(((mouseX - startX) / drawnWidth) * 100);
    } else {
      pct = Math.round(((mouseY - startY) / drawnHeight) * 100);
    }
    pct = Math.max(10, Math.min(90, pct));

    // Check if dragging door
    const door = doors.find((d) => d.id === draggingId);
    if (door) {
      handleUpdateDoor(door.id, { wall: targetWall, positionPct: pct });
      return;
    }

    // Check if dragging window
    const win = windows.find((w) => w.id === draggingId);
    if (win) {
      handleUpdateWindow(win.id, { wall: targetWall, positionPct: pct });
      return;
    }

    // Check if dragging electrical item
    const elec = electricalItems.find((i) => i.id === draggingId);
    if (elec) {
      pct = Math.max(5, Math.min(95, pct));
      handleUpdateElectricalItem(elec.id, { wall: targetWall, positionPct: pct });
    }
  };

  const handleEndDrag = () => {
    setDraggingId(null);
    dragStartRef.current = null;
    isActualDragRef.current = false;
  };

  useEffect(() => {
    const onGlobalMouseUp = () => {
      setDraggingId(null);
      dragStartRef.current = null;
      isActualDragRef.current = false;
    };
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => window.removeEventListener('mouseup', onGlobalMouseUp);
  }, []);

  const wallNames: Record<WallSide, { ru: string; uz: string }> = {
    top: { ru: 'Верхняя (Север)', uz: 'Yuqori (Shimol)' },
    bottom: { ru: 'Нижняя (Юг/Вход)', uz: 'Pastki (Janub)' },
    left: { ru: 'Левая (Запад)', uz: 'Chap (G\'arb)' },
    right: { ru: 'Правая (Восток)', uz: 'O\'ng (Sharq)' },
  };

  // Helper to render architectural door leaf and swing arc based on wall, inward/outward, and left/right swing
  const renderDoorOpening = (door: DoorItem) => {
    const pct = Math.max(8, Math.min(92, door.positionPct)) / 100;
    const doorWidthPx = Math.max(32, door.widthM * scale);
    const isSelected = selectedDoorId === door.id && activeTab === 'doors';
    const swingSide = door.swingSide || 'right';
    const swingInward = door.swingInward ?? true;

    let dx = 0;
    let dy = 0;
    let isHorizontal = true;

    if (door.wall === 'top') {
      dx = startX + drawnWidth * pct - doorWidthPx / 2;
      dy = startY;
      isHorizontal = true;
    } else if (door.wall === 'bottom') {
      dx = startX + drawnWidth * pct - doorWidthPx / 2;
      dy = startY + drawnHeight;
      isHorizontal = true;
    } else if (door.wall === 'left') {
      dx = startX;
      dy = startY + drawnHeight * pct - doorWidthPx / 2;
      isHorizontal = false;
    } else if (door.wall === 'right') {
      dx = startX + drawnWidth;
      dy = startY + drawnHeight * pct - doorWidthPx / 2;
      isHorizontal = false;
    }

    // Geometry of hinge (H), closed tip (C), and open tip (T)
    let hingeX = dx;
    let hingeY = dy;
    let openX = dx;
    let openY = dy;
    let closedX = dx;
    let closedY = dy;
    let sweepFlag = 0;

    if (door.wall === 'bottom') {
      const sign = swingInward ? -1 : 1;
      if (swingSide === 'left') {
        hingeX = dx; hingeY = dy;
        closedX = dx + doorWidthPx; closedY = dy;
        openX = dx; openY = dy + sign * doorWidthPx;
        sweepFlag = sign < 0 ? 0 : 1;
      } else {
        hingeX = dx + doorWidthPx; hingeY = dy;
        closedX = dx; closedY = dy;
        openX = dx + doorWidthPx; openY = dy + sign * doorWidthPx;
        sweepFlag = sign < 0 ? 1 : 0;
      }
    } else if (door.wall === 'top') {
      const sign = swingInward ? 1 : -1;
      if (swingSide === 'left') {
        hingeX = dx; hingeY = dy;
        closedX = dx + doorWidthPx; closedY = dy;
        openX = dx; openY = dy + sign * doorWidthPx;
        sweepFlag = sign > 0 ? 1 : 0;
      } else {
        hingeX = dx + doorWidthPx; hingeY = dy;
        closedX = dx; closedY = dy;
        openX = dx + doorWidthPx; openY = dy + sign * doorWidthPx;
        sweepFlag = sign > 0 ? 0 : 1;
      }
    } else if (door.wall === 'left') {
      const sign = swingInward ? 1 : -1;
      if (swingSide === 'left') {
        hingeX = dx; hingeY = dy;
        closedX = dx; closedY = dy + doorWidthPx;
        openX = dx + sign * doorWidthPx; openY = dy;
        sweepFlag = sign > 0 ? 0 : 1;
      } else {
        hingeX = dx; hingeY = dy + doorWidthPx;
        closedX = dx; closedY = dy;
        openX = dx + sign * doorWidthPx; openY = dy + doorWidthPx;
        sweepFlag = sign > 0 ? 1 : 0;
      }
    } else if (door.wall === 'right') {
      const sign = swingInward ? -1 : 1;
      if (swingSide === 'left') {
        hingeX = dx; hingeY = dy;
        closedX = dx; closedY = dy + doorWidthPx;
        openX = dx + sign * doorWidthPx; openY = dy;
        sweepFlag = sign < 0 ? 1 : 0;
      } else {
        hingeX = dx; hingeY = dy + doorWidthPx;
        closedX = dx; closedY = dy;
        openX = dx + sign * doorWidthPx; openY = dy + doorWidthPx;
        sweepFlag = sign < 0 ? 0 : 1;
      }
    }

    return (
      <g
        key={door.id}
        className="cursor-pointer select-none"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedDoorId(door.id);
          setActiveTab('doors');
        }}
        onMouseDown={(e) => handleStartDrag(e, door.id)}
      >
        {/* Wall opening cut */}
        <rect
          x={isHorizontal ? dx : dx - 3}
          y={isHorizontal ? dy - 3 : dy}
          width={isHorizontal ? doorWidthPx : 6}
          height={isHorizontal ? 6 : doorWidthPx}
          fill="#1e293b"
        />

        {/* Selection indicator */}
        {isSelected && (
          <rect
            x={isHorizontal ? dx - 4 : dx - 6}
            y={isHorizontal ? dy - 6 : dy - 4}
            width={isHorizontal ? doorWidthPx + 8 : 12}
            height={isHorizontal ? 12 : doorWidthPx + 8}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            rx="3"
          />
        )}

        {/* Door Sill */}
        <line
          x1={isHorizontal ? dx : dx}
          y1={isHorizontal ? dy : dy}
          x2={isHorizontal ? dx + doorWidthPx : dx}
          y2={isHorizontal ? dy : dy + doorWidthPx}
          stroke="#f59e0b"
          strokeWidth="3.5"
        />

        {/* Swing Arc Path */}
        <path
          d={`M ${closedX} ${closedY} A ${doorWidthPx} ${doorWidthPx} 0 0 ${sweepFlag} ${openX} ${openY}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.8"
        />

        {/* Open Door Leaf */}
        <line
          x1={hingeX}
          y1={hingeY}
          x2={openX}
          y2={openY}
          stroke="#fde68a"
          strokeWidth="2.5"
        />

        {/* Hinge Pin */}
        <circle cx={hingeX} cy={hingeY} r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

        {/* Door Label */}
        <text
          x={isHorizontal ? dx + doorWidthPx / 2 : (door.wall === 'left' ? dx - 12 : dx + 16)}
          y={isHorizontal ? (door.wall === 'bottom' ? dy + 18 : dy - 8) : dy + doorWidthPx / 2 + 3}
          fill="#fbbf24"
          fontSize="9.5"
          fontWeight="bold"
          textAnchor="middle"
          className="font-sans pointer-events-none"
        >
          {door.labelRu || 'Дверь'} ({door.widthM}м)
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {lang === 'ru'
                ? 'Интерактивный 2D-план: Светильники, двери, окна и розетки'
                : "Interaktiv 2D reja: Yoritgichlar, eshik, derazalar va rozetkalar"}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'ru'
                ? 'Кликните на любой элемент или используйте панель настроек внизу (настройки остаются открытыми)'
                : "Istalgan elementni bosing yoki pastki sozlamalar panelidan foydalaning"}
            </p>
          </div>
        </div>

        {/* View Layer Selector Buttons */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewLayer('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                viewLayer === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'ru' ? 'Все слои' : 'Barchasi'}
            </button>
            <button
              type="button"
              onClick={() => setViewLayer('lighting')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewLayer === 'lighting'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{lang === 'ru' ? 'Освещение' : 'Yoritish'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayer('electrical')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewLayer === 'electrical'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plug className="w-3 h-3 text-violet-500" />
              <span>{lang === 'ru' ? 'Электрика' : 'Elektr'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Schematic */}
      <div className="w-full bg-slate-950 rounded-xl p-3 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Info Ribbon */}
        <div className="w-full flex items-center justify-between text-xs px-2 py-1 mb-1 z-10 min-h-[28px]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700">
              <Move className="w-3 h-3 text-amber-400" />
              {lang === 'ru' ? 'Можно перемещать элементы мышью прямо на плане' : 'Elementlarni rejada surish mumkin'}
            </span>
          </div>

          <span className="font-mono text-[11px] text-slate-400">
            {inputs.lengthM} × {inputs.widthM} м (S = {outputs.areaM2} м²)
          </span>
        </div>

        {/* Razor-sharp Vector SVG */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[440px] select-none cursor-default"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleEndDrag}
        >
          {/* Outer Room Floor Boundary */}
          <rect
            x={startX}
            y={startY}
            width={drawnWidth}
            height={drawnHeight}
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="3.5"
            rx="6"
          />

          {/* Dimension: Room Length (Top) */}
          <g>
            <line
              x1={startX}
              y1={startY - 16}
              x2={startX + drawnWidth}
              y2={startY - 16}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line x1={startX} y1={startY - 22} x2={startX} y2={startY - 10} stroke="#64748b" strokeWidth="1.5" />
            <line x1={startX + drawnWidth} y1={startY - 22} x2={startX + drawnWidth} y2={startY - 10} stroke="#64748b" strokeWidth="1.5" />
            <text
              x={startX + drawnWidth / 2}
              y={startY - 22}
              fill="#cbd5e1"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              L = {inputs.lengthM} м
            </text>
          </g>

          {/* Dimension: Room Width (Right) */}
          <g>
            <line
              x1={startX + drawnWidth + 16}
              y1={startY}
              x2={startX + drawnWidth + 16}
              y2={startY + drawnHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line x1={startX + drawnWidth + 10} y1={startY} x2={startX + drawnWidth + 22} y2={startY} stroke="#64748b" strokeWidth="1.5" />
            <line x1={startX + drawnWidth + 10} y1={startY + drawnHeight} x2={startX + drawnWidth + 22} y2={startY + drawnHeight} stroke="#64748b" strokeWidth="1.5" />
            <text
              x={startX + drawnWidth + 24}
              y={startY + drawnHeight / 2 + 4}
              fill="#cbd5e1"
              fontSize="11"
              fontWeight="bold"
              textAnchor="start"
              className="font-mono"
            >
              W = {inputs.widthM} м
            </text>
          </g>

          {/* Guidelines Grid */}
          {showLights && (
            <>
              {Array.from({ length: cols + 1 }).map((_, c) => (
                <line
                  key={`vline-${c}`}
                  x1={startX + c * (drawnWidth / cols)}
                  y1={startY}
                  x2={startX + c * (drawnWidth / cols)}
                  y2={startY + drawnHeight}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ))}
              {Array.from({ length: rows + 1 }).map((_, r) => (
                <line
                  key={`hline-${r}`}
                  x1={startX}
                  y1={startY + r * (drawnHeight / rows)}
                  x2={startX + drawnWidth}
                  y2={startY + r * (drawnHeight / rows)}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ))}
            </>
          )}

          {/* Windows on All Sides */}
          {windows.map((win) => {
            const pct = Math.max(8, Math.min(92, win.positionPct)) / 100;
            const winWidthPx = Math.max(28, win.widthM * scale);
            const isSelected = selectedWindowId === win.id && activeTab === 'windows';

            let wx = 0;
            let wy = 0;
            let isHorizontal = true;

            if (win.wall === 'top') {
              wx = startX + drawnWidth * pct - winWidthPx / 2;
              wy = startY - 4;
              isHorizontal = true;
            } else if (win.wall === 'bottom') {
              wx = startX + drawnWidth * pct - winWidthPx / 2;
              wy = startY + drawnHeight - 3;
              isHorizontal = true;
            } else if (win.wall === 'left') {
              wx = startX - 4;
              wy = startY + drawnHeight * pct - winWidthPx / 2;
              isHorizontal = false;
            } else if (win.wall === 'right') {
              wx = startX + drawnWidth - 3;
              wy = startY + drawnHeight * pct - winWidthPx / 2;
              isHorizontal = false;
            }

            return (
              <g
                key={win.id}
                className="cursor-pointer select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWindowId(win.id);
                  setActiveTab('windows');
                }}
                onMouseDown={(e) => handleStartDrag(e, win.id)}
              >
                {/* Wall gap under window */}
                <rect
                  x={wx}
                  y={wy}
                  width={isHorizontal ? winWidthPx : 7}
                  height={isHorizontal ? 7 : winWidthPx}
                  fill="#1e293b"
                />

                {/* Highlight ring if selected */}
                {isSelected && (
                  <rect
                    x={wx - 4}
                    y={wy - 4}
                    width={isHorizontal ? winWidthPx + 8 : 15}
                    height={isHorizontal ? 15 : winWidthPx + 8}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    rx="2"
                  />
                )}

                {/* Window Outer Sill / Frame */}
                <rect
                  x={wx}
                  y={wy}
                  width={isHorizontal ? winWidthPx : 7}
                  height={isHorizontal ? 7 : winWidthPx}
                  fill="#0369a1"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  rx="1"
                />

                {/* Double glass lines */}
                {isHorizontal ? (
                  <>
                    <line x1={wx + 2} y1={wy + 2} x2={wx + winWidthPx - 2} y2={wy + 2} stroke="#ffffff" strokeWidth="1" />
                    <line x1={wx + 2} y1={wy + 5} x2={wx + winWidthPx - 2} y2={wy + 5} stroke="#ffffff" strokeWidth="1" />
                  </>
                ) : (
                  <>
                    <line x1={wx + 2} y1={wy + 2} x2={wx + 2} y2={wy + winWidthPx - 2} stroke="#ffffff" strokeWidth="1" />
                    <line x1={wx + 5} y1={wy + 2} x2={wx + 5} y2={wy + winWidthPx - 2} stroke="#ffffff" strokeWidth="1" />
                  </>
                )}

                {/* Window label */}
                <text
                  x={isHorizontal ? wx + winWidthPx / 2 : (win.wall === 'left' ? wx - 12 : wx + 18)}
                  y={isHorizontal ? (win.wall === 'top' ? wy - 6 : wy + 16) : wy + winWidthPx / 2 + 3}
                  fill="#7dd3fc"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-sans pointer-events-none"
                >
                  {win.labelRu || 'Окно'} ({win.widthM}м)
                </text>
              </g>
            );
          })}

          {/* Doors on Walls */}
          {doors.map((door) => renderDoorOpening(door))}

          {/* Luminaires */}
          {showLights &&
            luminaires.map((lum, idx) => {
              const coneRadius = Math.max(24, Math.min(drawnWidth / cols, drawnHeight / rows) * 0.85);
              const isSelected = selectedLuminaireId === lum.id;

              return (
                <g
                  key={`lum-${idx}`}
                  className="cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLuminaireId(lum.id);
                  }}
                >
                  <circle
                    cx={lum.x}
                    cy={lum.y}
                    r={coneRadius}
                    fill="#fef08a"
                    fillOpacity="0.08"
                    stroke="#facc15"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.3"
                    pointerEvents="none"
                  />

                  {isSelected && (
                    <circle
                      cx={lum.x}
                      cy={lum.y}
                      r="14"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  <circle
                    cx={lum.x}
                    cy={lum.y}
                    r={isSelected ? 9 : 7.5}
                    fill="#ffffff"
                    stroke={isSelected ? '#f59e0b' : '#eab308'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <circle
                    cx={lum.x}
                    cy={lum.y}
                    r="2.5"
                    fill={isSelected ? '#d97706' : '#ca8a04'}
                  />

                  <text
                    x={lum.x}
                    y={lum.y - 12}
                    fill="#fef08a"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono pointer-events-none"
                  >
                    #{idx + 1}
                  </text>
                </g>
              );
            })}

          {/* Electrical Sockets and Switches along walls */}
          {showElectrical &&
            electricalItems.map((item) => {
              const { x, y } = getElectricalItemCoords(item);
              const isSocket = item.category === 'socket';
              const isSelected = selectedElectricalId === item.id && activeTab === 'electrical';

              return (
                <g
                  key={item.id}
                  className="cursor-pointer select-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElectricalId(item.id);
                    setActiveTab('electrical');
                  }}
                  onMouseDown={(e) => handleStartDrag(e, item.id)}
                >
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="13"
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {isSocket ? (
                    <g transform={`translate(${x}, ${y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={isSelected ? 8 : 6.5}
                        fill={
                          item.type === 'socket_ip44'
                            ? '#0284c7'
                            : item.type === 'socket_power_ac'
                            ? '#dc2626'
                            : '#8b5cf6'
                        }
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1.5}
                      />
                      {item.type === 'socket_double' ? (
                        <>
                          <circle cx="-2" cy="0" r="1.2" fill="#ffffff" />
                          <circle cx="2" cy="0" r="1.2" fill="#ffffff" />
                        </>
                      ) : item.type === 'socket_power_ac' ? (
                        <text
                          x="0"
                          y="3"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-sans pointer-events-none"
                        >
                          ⚡
                        </text>
                      ) : (
                        <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                      )}
                    </g>
                  ) : (
                    <g transform={`translate(${x}, ${y})`}>
                      <rect
                        x={isSelected ? -7 : -6}
                        y={isSelected ? -7 : -6}
                        width={isSelected ? 14 : 12}
                        height={isSelected ? 14 : 12}
                        rx="2"
                        fill={item.type === 'switch_pass_through' ? '#2563eb' : '#0ea5e9'}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1.5}
                      />
                      {item.type === 'switch_pass_through' ? (
                        <text
                          x="0"
                          y="3.5"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-sans pointer-events-none"
                        >
                          ⇄
                        </text>
                      ) : item.type === 'switch_double' ? (
                        <line x1="0" y1="-5" x2="0" y2="5" stroke="#ffffff" strokeWidth="1.2" />
                      ) : (
                        <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                      )}
                    </g>
                  )}
                </g>
              );
            })}
        </svg>

        {/* Legend of Symbols */}
        <div className="w-full flex items-center justify-center gap-4 flex-wrap text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 rounded-xs bg-amber-500 inline-block" />
            <span>{lang === 'ru' ? 'Дверь (с дугой распаха)' : 'Eshik (ochilish yoyi)'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 rounded-xs bg-sky-500 inline-block border border-sky-300" />
            <span>{lang === 'ru' ? 'Окна (с любых стен)' : 'Derazalar (har tomonda)'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span>{lang === 'ru' ? 'LED Светильник' : 'LED Chiroq'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
            <span>{lang === 'ru' ? 'Розетка 220В' : 'Rozetka'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
            <span>{lang === 'ru' ? 'Выключатель' : 'O\'chirgich'}</span>
          </div>
        </div>
      </div>

      {/* PERMANENT SETTINGS CONTROLLER (NEVER DISAPPEARS WHEN MOVING MOUSE) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
        {/* Navigation Tabs for settings */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('doors')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'doors'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>{lang === 'ru' ? '🚪 Двери и открывание' : '🚪 Eshik va ochilish'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'doors' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {doors.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('windows')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'windows'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AppWindow className="w-4 h-4" />
              <span>{lang === 'ru' ? '🪟 Окна и остекление' : '🪟 Derazalar'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'windows' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {windows.length}
              </span>
            </button>

            {electricalItems.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('electrical')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'electrical'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Plug className="w-4 h-4" />
                <span>{lang === 'ru' ? '⚡ Электроточки' : '⚡ Rozetkalar'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'electrical' ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {electricalItems.length}
                </span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            {lang === 'ru' ? 'Настройки всегда зафиксированы и не пропадают' : 'Sozlamalar paneli doimiy ochiq'}
          </div>
        </div>

        {/* TAB 1: DOORS SETTINGS */}
        {activeTab === 'doors' && activeDoor && (
          <div className="space-y-3 animate-in fade-in duration-100">
            {/* Door Selector Header if multiple doors */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'ru' ? 'Выбрать дверь:' : 'Eshikni tanlash:'}
                </span>
                {doors.map((d, index) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDoorId(d.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      selectedDoorId === d.id
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {d.labelRu || `Дверь ${index + 1}`} ({d.widthM}м)
                  </button>
                ))}
              </div>

              {doors.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddDoor}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'ru' ? '+ Добавить 2-ю дверь' : '+ Eshik qo\'shish'}</span>
                </button>
              )}
            </div>

            {/* Detailed Controls for Selected Door */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Control 1: Opening Direction (Inward vs Outward) */}
              <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'ru' ? '1. Направление открывания:' : '1. Ochilish yo\'nalishi:'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">
                    {activeDoor.swingInward ? (lang === 'ru' ? 'Внутрь' : 'Ichkariga') : (lang === 'ru' ? 'Наружу' : 'Tashqariga')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateDoor(activeDoor.id, { swingInward: true })}
                    className={`px-2.5 py-2 rounded-lg font-bold text-xs transition-colors text-center ${
                      activeDoor.swingInward
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? 'Внутрь комнаты' : 'Ichkariga'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateDoor(activeDoor.id, { swingInward: false })}
                    className={`px-2.5 py-2 rounded-lg font-bold text-xs transition-colors text-center ${
                      !activeDoor.swingInward
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title={lang === 'ru' ? 'По нормам эвакуации и пожарной безопасности' : 'Evakuatsiya xavfsizligi bo\'yicha'}
                  >
                    {lang === 'ru' ? 'Наружу (эвакуация)' : 'Tashqariga'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {activeDoor.swingInward 
                    ? (lang === 'ru' ? 'Стандарт для жилых комнат и офисов' : 'Turar-joy va ofis xonalari')
                    : (lang === 'ru' ? 'Эвакуационный выход наружу для холлов и вестибюлей' : 'Vestibyul va xollardan chiqish')}
                </p>
              </div>

              {/* Control 2: Hinge side / Swing side (Left vs Right) */}
              <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {lang === 'ru' ? '2. Сторона петель (распах):' : '2. Eshik ilmog\'i:'}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">
                    {activeDoor.swingSide === 'left' ? (lang === 'ru' ? 'Левая' : 'Chap') : (lang === 'ru' ? 'Правая' : 'O\'ng')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateDoor(activeDoor.id, { swingSide: 'left' })}
                    className={`px-2.5 py-2 rounded-lg font-bold text-xs transition-colors text-center ${
                      activeDoor.swingSide === 'left'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? '◀ Петли слева' : '◀ Chap tomonda'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateDoor(activeDoor.id, { swingSide: 'right' })}
                    className={`px-2.5 py-2 rounded-lg font-bold text-xs transition-colors text-center ${
                      activeDoor.swingSide !== 'left'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang === 'ru' ? 'Петли справа ▶' : 'O\'ng tomonda ▶'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {lang === 'ru' ? 'Определяет поворот полотна и угол открывания дуги' : 'Eshik polotnosi aylanma yoyi tomoni'}
                </p>
              </div>

              {/* Control 3: Wall, Position & Width */}
              <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{lang === 'ru' ? '3. Стена и ширина:' : '3. Devor va kenglik:'}</span>
                  <select
                    value={activeDoor.wall}
                    onChange={(e) => handleUpdateDoor(activeDoor.id, { wall: e.target.value as WallSide })}
                    className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                  >
                    <option value="bottom">{lang === 'ru' ? '▼ Нижняя (Вход)' : '▼ Pastki (Kirish)'}</option>
                    <option value="top">{lang === 'ru' ? '▲ Верхняя' : '▲ Yuqori devor'}</option>
                    <option value="left">{lang === 'ru' ? '◄ Левая' : '◄ Chap devor'}</option>
                    <option value="right">{lang === 'ru' ? '► Правая' : '► O\'ng devor'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{lang === 'ru' ? 'Позиция:' : 'O\'rni:'}</span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={activeDoor.positionPct}
                    onChange={(e) => handleUpdateDoor(activeDoor.id, { positionPct: Number(e.target.value) })}
                    className="w-full accent-amber-600 h-1.5 bg-amber-200 rounded cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-800 text-xs w-8 text-right">{activeDoor.positionPct}%</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <select
                    value={activeDoor.widthM}
                    onChange={(e) => handleUpdateDoor(activeDoor.id, { widthM: Number(e.target.value) })}
                    className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800"
                  >
                    <option value={0.8}>0.8 м (Межкомнатная)</option>
                    <option value={0.9}>0.9 м (Стандарт 90см)</option>
                    <option value={1.2}>1.2 м (Полуторная 120см)</option>
                    <option value={1.5}>1.5 м (Двустворчатая 150см)</option>
                  </select>

                  {doors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDoor(activeDoor.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                      title={lang === 'ru' ? 'Удалить эту дверь' : 'O\'chirish'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Удалить' : 'O\'chirish'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WINDOWS SETTINGS */}
        {activeTab === 'windows' && (
          <div className="space-y-3 animate-in fade-in duration-100">
            {/* Presets and Add buttons bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-700">
                  {lang === 'ru' ? 'Пресеты остекления:' : 'Deraza sxemalari:'}
                </span>

                <button
                  type="button"
                  onClick={() => handleApplyWindowPreset('none')}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                    windows.length === 0
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={lang === 'ru' ? 'Глухое помещение без окон' : 'Derazasiz xona'}
                >
                  {lang === 'ru' ? 'Без окон' : 'Derazasiz'}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyWindowPreset('single')}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                    windows.length === 1 && windows[0].wall === 'top'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={lang === 'ru' ? 'Окно с одной стороны (Север / Верх)' : '1 tomonlama deraza'}
                >
                  {lang === 'ru' ? '1 сторона (Верх)' : '1 tomon (Yuqori)'}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyWindowPreset('corner')}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs text-slate-700 font-semibold transition-colors"
                  title={lang === 'ru' ? 'Угловое остекление с двух смежных сторон' : 'Burchakli derazalar (2 tomon)'}
                >
                  {lang === 'ru' ? 'Угловые (2 стороны)' : 'Burchakli'}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyWindowPreset('opposite')}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs text-slate-700 font-semibold transition-colors"
                  title={lang === 'ru' ? 'Окна с двух противоположных сторон (Сквозные)' : 'Qarama-qarshi derazalar'}
                >
                  {lang === 'ru' ? 'Напротив (2 стороны)' : 'Qarama-qarshi'}
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyWindowPreset('three_sides')}
                  className="px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-xs text-slate-700 font-semibold transition-colors"
                  title={lang === 'ru' ? 'Окна с трех сторон (Панорамное)' : '3 tomonlama panoramali'}
                >
                  {lang === 'ru' ? 'С 3-х сторон' : '3 tomondan'}
                </button>
              </div>

              {/* Add window dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddWindowDropdown(!showAddWindowDropdown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-50 text-sky-800 text-xs font-bold hover:bg-sky-100 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? '+ Добавить окно на стену' : '+ Deraza qo\'shish'}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {showAddWindowDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAddWindowOnWall('top')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-slate-800 font-medium flex items-center justify-between"
                    >
                      <span>▲ {lang === 'ru' ? 'На верхнюю стену' : 'Yuqori devor'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWindowOnWall('bottom')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-slate-800 font-medium flex items-center justify-between"
                    >
                      <span>▼ {lang === 'ru' ? 'На нижнюю стену' : 'Pastki devor'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWindowOnWall('left')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-slate-800 font-medium flex items-center justify-between"
                    >
                      <span>◄ {lang === 'ru' ? 'На левую стену' : 'Chap devor'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddWindowOnWall('right')}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-slate-800 font-medium flex items-center justify-between"
                    >
                      <span>► {lang === 'ru' ? 'На правую стену' : 'O\'ng devor'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* If windows exist, show individual window settings */}
            {windows.length > 0 && activeWindow ? (
              <div className="p-3.5 rounded-xl bg-white border border-sky-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-sky-100 pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === 'ru' ? 'Выбрать окно:' : 'Derazani tanlash:'}
                    </span>
                    {windows.map((w, index) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWindowId(w.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                          activeWindow.id === w.id
                            ? 'bg-sky-100 text-sky-900 border border-sky-300 shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {w.labelRu || `Окно ${index + 1}`} ({wallNames[w.wall][lang].split(' ')[0]})
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWindow(activeWindow.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Убрать это окно' : 'O\'chirish'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Wall selector */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      {lang === 'ru' ? 'Разместить на стене:' : 'Devorni tanlash:'}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateWindow(activeWindow.id, { wall: 'top' })}
                        className={`px-2 py-1.5 rounded-md font-semibold text-xs transition-colors text-center ${
                          activeWindow.wall === 'top'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ▲ {lang === 'ru' ? 'Верхняя' : 'Yuqori'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateWindow(activeWindow.id, { wall: 'bottom' })}
                        className={`px-2 py-1.5 rounded-md font-semibold text-xs transition-colors text-center ${
                          activeWindow.wall === 'bottom'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ▼ {lang === 'ru' ? 'Нижняя' : 'Pastki'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateWindow(activeWindow.id, { wall: 'left' })}
                        className={`px-2 py-1.5 rounded-md font-semibold text-xs transition-colors text-center ${
                          activeWindow.wall === 'left'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ◄ {lang === 'ru' ? 'Левая' : 'Chap'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateWindow(activeWindow.id, { wall: 'right' })}
                        className={`px-2 py-1.5 rounded-md font-semibold text-xs transition-colors text-center ${
                          activeWindow.wall === 'right'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ► {lang === 'ru' ? 'Правая' : 'O\'ng'}
                      </button>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      {lang === 'ru' ? 'Позиция вдоль стены:' : 'Devor bo\'ylab o\'rni:'}
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="range"
                        min="10"
                        max="90"
                        step="5"
                        value={activeWindow.positionPct}
                        onChange={(e) => handleUpdateWindow(activeWindow.id, { positionPct: Number(e.target.value) })}
                        className="w-full accent-sky-600 h-1.5 bg-sky-200 rounded cursor-pointer"
                      />
                      <span className="font-mono font-bold text-slate-800 text-xs w-8 text-right">{activeWindow.positionPct}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'ru' ? 'Можно также перемещать мышью на чертеже' : 'Rejada sichqoncha bilan ham surish mumkin'}
                    </span>
                  </div>

                  {/* Width */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      {lang === 'ru' ? 'Ширина остекления:' : 'Deraza kengligi:'}
                    </span>
                    <select
                      value={activeWindow.widthM}
                      onChange={(e) => handleUpdateWindow(activeWindow.id, { widthM: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <option value={1.0}>1.0 м (Малое окно)</option>
                      <option value={1.2}>1.2 м (Стандартное 1.2м)</option>
                      <option value={1.5}>1.5 м (Широкое 1.5м)</option>
                      <option value={1.8}>1.8 м (Большое 1.8м)</option>
                      <option value={2.0}>2.0 м (Двустворчатое 2.0м)</option>
                      <option value={2.5}>2.5 м (Панорамное 2.5м)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                {lang === 'ru'
                  ? 'В помещении сейчас нет окон (глухой холл/комната). Выберите пресет выше или нажмите "+ Добавить окно на стену".'
                  : 'Xonada derazalar o\'rnatilmagan. Yuqoridagi sxemalardan birini tanlang yoki yangi deraza qo\'shing.'}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ELECTRICAL ITEMS SETTINGS */}
        {activeTab === 'electrical' && activeElectrical && (
          <div className="p-3.5 rounded-xl bg-white border border-violet-200 shadow-xs space-y-3 animate-in fade-in duration-100">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-violet-100 pb-2">
              <div className="flex items-center gap-2">
                <Plug className="w-4 h-4 text-violet-600" />
                <span className="font-bold text-violet-950 text-xs">
                  {lang === 'ru' ? activeElectrical.labelRu : activeElectrical.labelUz}
                </span>
                <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-800 text-[10px] font-mono font-bold">
                  {wallNames[activeElectrical.wall][lang]} ({activeElectrical.positionPct}%)
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteElectricalItem(activeElectrical.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-rose-600 hover:bg-rose-50 text-xs font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'ru' ? 'Удалить точку' : 'O\'chirish'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'ru' ? 'Стена размещения:' : 'Joylashgan devori:'}
                </span>
                <select
                  value={activeElectrical.wall}
                  onChange={(e) => handleUpdateElectricalItem(activeElectrical.id, { wall: e.target.value as WallSide })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="bottom">{wallNames.bottom[lang]}</option>
                  <option value="top">{wallNames.top[lang]}</option>
                  <option value="left">{wallNames.left[lang]}</option>
                  <option value="right">{wallNames.right[lang]}</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'ru' ? 'Позиция вдоль стены:' : 'Devor bo\'ylab o\'rni:'}
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min="5"
                    max="95"
                    step="5"
                    value={activeElectrical.positionPct}
                    onChange={(e) => handleUpdateElectricalItem(activeElectrical.id, { positionPct: Number(e.target.value) })}
                    className="w-full accent-violet-600 h-1.5 bg-violet-200 rounded cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-800 text-xs w-8 text-right">{activeElectrical.positionPct}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'ru' ? 'Высота от пола (h, см):' : 'Pol sathidan balandlik (sm):'}
                </span>
                <input
                  type="number"
                  min="10"
                  max="250"
                  step="5"
                  value={activeElectrical.heightCm}
                  onChange={(e) => handleUpdateElectricalItem(activeElectrical.id, { heightCm: Number(e.target.value) })}
                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg font-bold text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layout Dimensions & Spacing Footnote */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            {lang === 'ru' ? 'Шаг по длине (Lx)' : 'Uzunlik qadami (Lx)'}
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {outputs.spacingXM} м
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            до стен: {outputs.wallSpacingXM} м
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            {lang === 'ru' ? 'Шаг по ширине (Ly)' : 'Kenglik qadami (Ly)'}
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {outputs.spacingYM} м
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            до стен: {outputs.wallSpacingYM} м
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            {lang === 'ru' ? 'Проемы в помещении' : 'Xona o\'yiqlari'}
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {doors.length} {lang === 'ru' ? 'дв.' : 'esh.'} / {windows.length} {lang === 'ru' ? 'ок.' : 'der.'}
          </span>
          <span className="text-[10px] text-sky-700 block mt-0.5 font-medium">
            {windows.length === 0 
              ? (lang === 'ru' ? 'Без окон' : 'Derazasiz') 
              : (lang === 'ru' ? `Окна (${windows.map(w => wallNames[w.wall].ru.split(' ')[0]).join(', ')})` : `${windows.length} ta deraza`)}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-500 block uppercase font-medium">
            {lang === 'ru' ? 'Равномерность (L / h)' : 'Bir xillik (L / h)'}
          </span>
          <span className="font-mono font-bold text-slate-900 text-sm">
            {outputs.spacingToHeightRatio}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
            {outputs.spacingToHeightRatio <= 1.4 ? 'Норма ≤ 1.4' : 'Превышает 1.4'}
          </span>
        </div>
      </div>
    </div>
  );
};
