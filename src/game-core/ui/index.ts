/**
 * UI/UX Interface System
 * Phase 8: Panels, Lens System, Tooltips, Notifications
 */

// ============================================================================
// 1. UI PANELS
// ============================================================================

export enum UIPanel {
  TOP_BAR = 'top_bar',
  LEFT_SIDEBAR = 'left_sidebar',
  LENS_PANEL = 'lens_panel',
  MINIMAP = 'minimap',
  PROVINCE_INFO = 'province_info',
  ECONOMY = 'economy',
  BUILDINGS = 'buildings',
  POPULATION = 'population',
  POLITICS = 'politics',
  TECHNOLOGY = 'technology',
  DIPLOMACY = 'diplomacy',
}

export interface PanelPosition {
  x: number;
  y: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelConfig {
  id: UIPanel;
  visible: boolean;
  minimized: boolean;
  position: PanelPosition;
  size: PanelSize;
}

export const DEFAULT_PANEL_CONFIGS: Record<UIPanel, PanelConfig> = {
  [UIPanel.TOP_BAR]: {
    id: UIPanel.TOP_BAR,
    visible: true,
    minimized: false,
    position: { x: 0, y: 0 },
    size: { width: 1920, height: 60 },
  },
  [UIPanel.LEFT_SIDEBAR]: {
    id: UIPanel.LEFT_SIDEBAR,
    visible: true,
    minimized: false,
    position: { x: 0, y: 60 },
    size: { width: 250, height: 900 },
  },
  [UIPanel.LENS_PANEL]: {
    id: UIPanel.LENS_PANEL,
    visible: true,
    minimized: false,
    position: { x: 250, y: 60 },
    size: { width: 200, height: 300 },
  },
  [UIPanel.MINIMAP]: {
    id: UIPanel.MINIMAP,
    visible: true,
    minimized: false,
    position: { x: 1720, y: 900 },
    size: { width: 200, height: 150 },
  },
  [UIPanel.PROVINCE_INFO]: {
    id: UIPanel.PROVINCE_INFO,
    visible: false,
    minimized: false,
    position: { x: 1600, y: 200 },
    size: { width: 300, height: 400 },
  },
  [UIPanel.ECONOMY]: {
    id: UIPanel.ECONOMY,
    visible: false,
    minimized: false,
    position: { x: 800, y: 200 },
    size: { width: 400, height: 500 },
  },
  [UIPanel.BUILDINGS]: {
    id: UIPanel.BUILDINGS,
    visible: false,
    minimized: false,
    position: { x: 600, y: 150 },
    size: { width: 500, height: 600 },
  },
  [UIPanel.POPULATION]: {
    id: UIPanel.POPULATION,
    visible: false,
    minimized: false,
    position: { x: 700, y: 180 },
    size: { width: 450, height: 550 },
  },
  [UIPanel.POLITICS]: {
    id: UIPanel.POLITICS,
    visible: false,
    minimized: false,
    position: { x: 650, y: 200 },
    size: { width: 500, height: 500 },
  },
  [UIPanel.TECHNOLOGY]: {
    id: UIPanel.TECHNOLOGY,
    visible: false,
    minimized: false,
    position: { x: 500, y: 150 },
    size: { width: 600, height: 600 },
  },
  [UIPanel.DIPLOMACY]: {
    id: UIPanel.DIPLOMACY,
    visible: false,
    minimized: false,
    position: { x: 550, y: 180 },
    size: { width: 550, height: 550 },
  },
};

// ============================================================================
// 2. LENS SYSTEM (8 lenses)
// ============================================================================

export enum LensType {
  POLITICAL = 'political',
  ECONOMIC = 'economic',
  POPULATION = 'population',
  MILITARY = 'military',
  CULTURE = 'culture',
  RELIGION = 'religion',
  RESOURCES = 'resources',
  INFAMY = 'infamy',
}

export interface LensConfig {
  type: LensType;
  nameKey: string;
  colorScheme: string;
  active: boolean;
}

export const LENS_CONFIGS: Record<LensType, LensConfig> = {
  [LensType.POLITICAL]: {
    type: LensType.POLITICAL,
    nameKey: 'lens.political',
    colorScheme: 'country_colors',
    active: true,
  },
  [LensType.ECONOMIC]: {
    type: LensType.ECONOMIC,
    nameKey: 'lens.economic',
    colorScheme: 'gdp_gradient',
    active: false,
  },
  [LensType.POPULATION]: {
    type: LensType.POPULATION,
    nameKey: 'lens.population',
    colorScheme: 'sol_gradient',
    active: false,
  },
  [LensType.MILITARY]: {
    type: LensType.MILITARY,
    nameKey: 'lens.military',
    colorScheme: 'military_presence',
    active: false,
  },
  [LensType.CULTURE]: {
    type: LensType.CULTURE,
    nameKey: 'lens.culture',
    colorScheme: 'culture_colors',
    active: false,
  },
  [LensType.RELIGION]: {
    type: LensType.RELIGION,
    nameKey: 'lens.religion',
    colorScheme: 'religion_colors',
    active: false,
  },
  [LensType.RESOURCES]: {
    type: LensType.RESOURCES,
    nameKey: 'lens.resources',
    colorScheme: 'resource_markers',
    active: false,
  },
  [LensType.INFAMY]: {
    type: LensType.INFAMY,
    nameKey: 'lens.infamy',
    colorScheme: 'infamy_heatmap',
    active: false,
  },
};

// ============================================================================
// 3. TOOLTIPS
// ============================================================================

export interface TooltipSection {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export interface TooltipContent {
  title: string;
  sections: TooltipSection[];
  footer?: string;
}

export interface ProvinceTooltipData {
  stateName: string;
  owner: string;
  population: number;
  gdp: number;
  sol: number;
  resources: string[];
  buildings: string[];
}

export function createProvinceTooltip(data: ProvinceTooltipData): TooltipContent {
  return {
    title: data.stateName,
    sections: [
      { label: 'Owner', value: data.owner },
      { label: 'Population', value: data.population.toLocaleString() },
      { label: 'GDP', value: `$${data.gdp.toLocaleString()}` },
      { label: 'SoL', value: data.sol.toString(), color: getSolColor(data.sol) },
      { label: 'Resources', value: data.resources.join(', ') || 'None' },
      { label: 'Buildings', value: data.buildings.length.toString() },
    ],
  };
}

function getSolColor(sol: number): string {
  if (sol < 15) return '#ff4444';
  if (sol < 30) return '#ffaa44';
  if (sol < 50) return '#ffff44';
  if (sol < 70) return '#88ff44';
  return '#44ff44';
}

// ============================================================================
// 4. TOP BAR DATA
// ============================================================================

export interface TopBarDate {
  day: number;
  month: number;
  year: number;
}

export interface TopBarData {
  date: TopBarDate;
  government: string;
  treasury: number;
  prestige: number;
  legitimacy: number;
  infamy: number;
  marketAccess: number;
}

export function formatTopBarData(data: TopBarData): TopBarData {
  return {
    date: {
      day: data.date.day,
      month: data.date.month,
      year: data.date.year,
    },
    government: data.government,
    treasury: data.treasury,
    prestige: data.prestige,
    legitimacy: data.legitimacy,
    infamy: data.infamy,
    marketAccess: data.marketAccess,
  };
}

// ============================================================================
// 5. INTERACTION HANDLERS
// ============================================================================

export type InteractionType = 'click' | 'hover' | 'drag' | 'select';
export type InteractionTarget = string;

export interface MouseInteraction {
  type: InteractionType;
  target: InteractionTarget;
  position: PanelPosition;
  timestamp: number;
}

export interface SelectionState {
  selectedProvinces: string[];
  selectedStates: string[];
  selectedCountry: string | null;
  multiSelect: boolean;
}

export function handleProvinceClick(
  provinceId: string,
  currentSelection: SelectionState,
  shiftKey: boolean
): SelectionState {
  if (shiftKey) {
    const isSelected = currentSelection.selectedProvinces.includes(provinceId);
    return {
      ...currentSelection,
      selectedProvinces: isSelected
        ? currentSelection.selectedProvinces.filter((id: string): boolean => id !== provinceId)
        : [...currentSelection.selectedProvinces, provinceId],
    };
  }

  return {
    selectedProvinces: [provinceId],
    selectedStates: [],
    selectedCountry: null,
    multiSelect: false,
  };
}

// ============================================================================
// 6. NOTIFICATION SYSTEM
// ============================================================================

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  EVENT = 'event',
}

export interface GameNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: string;
  category: string;
}

export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  category: string
): GameNotification {
  return {
    id: `notif_${Date.now()}`,
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    category,
  };
}