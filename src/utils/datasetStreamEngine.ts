import { solarDataset, solarAssets, type SolarDataRow } from '@/data/solarDataset';
import { windDataset, windAssets, type WindDataRow } from '@/data/windDataset';
import { type SensorData, type Alert, type FailureType, type AssetType } from '@/types/sensor';

// ── Derived asset list from datasets ──
export interface DatasetAsset {
  id: string;
  name: string;
  type: AssetType;
  capacity_mw: number;
  location: string;
  lat: number;
  lng: number;
  installation_date: string;
  status: string;
}

export const allAssets: DatasetAsset[] = [
  ...solarAssets.map(a => ({ id: a.id, name: a.name, type: 'solar' as AssetType, capacity_mw: a.capacity_mw, location: a.location, lat: a.lat, lng: a.lng, installation_date: a.installation_date, status: a.status })),
  ...windAssets.map(a => ({ id: a.id, name: a.name, type: 'wind' as AssetType, capacity_mw: a.capacity_mw, location: a.location, lat: a.lat, lng: a.lng, installation_date: a.installation_date, status: a.status })),
];

// ── Group dataset rows by asset_id ──
const solarByAsset: Record<string, SolarDataRow[]> = {};
solarDataset.forEach(row => {
  if (!solarByAsset[row.asset_id]) solarByAsset[row.asset_id] = [];
  solarByAsset[row.asset_id].push(row);
});

const windByAsset: Record<string, WindDataRow[]> = {};
windDataset.forEach(row => {
  if (!windByAsset[row.asset_id]) windByAsset[row.asset_id] = [];
  windByAsset[row.asset_id].push(row);
});

// ── Loop index tracker ──
const loopIndices: Record<string, number> = {};

function getNextIndex(assetId: string, totalRows: number): number {
  if (loopIndices[assetId] === undefined) loopIndices[assetId] = 0;
  const idx = loopIndices[assetId];
  loopIndices[assetId] = (idx + 1) % totalRows;
  return idx;
}

// ── Convert a dataset row to SensorData ──
function solarRowToSensorData(row: SolarDataRow): SensorData {
  return {
    timestamp: new Date(),
    assetType: 'solar',
    assetId: row.asset_id,
    panelVoltage: row.panel_voltage,
    panelCurrent: row.panel_current,
    moduleTemp: row.module_temp,
    irradiance: row.irradiance,
    powerOutput: row.power_output,
    ambientTemp: row.ambient_temp,
    humidity: row.humidity,
    failureType: row.failure_type as FailureType,
    rulHours: row.rul_hours,
    confidence: row.confidence,
  };
}

function windRowToSensorData(row: WindDataRow): SensorData {
  return {
    timestamp: new Date(),
    assetType: 'wind',
    assetId: row.asset_id,
    windSpeed: row.wind_speed,
    rotorSpeed: row.rotor_speed,
    gearboxTemp: row.gearbox_temp,
    powerOutput: row.power_output,
    ambientTemp: row.ambient_temp,
    humidity: row.humidity,
    failureType: row.failure_type as FailureType,
    rulHours: row.rul_hours,
    confidence: row.confidence,
  };
}

// ── Public API: get next reading for an asset (loops through dataset) ──
export function getNextReading(assetId: string): SensorData | null {
  if (solarByAsset[assetId]) {
    const rows = solarByAsset[assetId];
    const idx = getNextIndex(assetId, rows.length);
    return solarRowToSensorData(rows[idx]);
  }
  if (windByAsset[assetId]) {
    const rows = windByAsset[assetId];
    const idx = getNextIndex(assetId, rows.length);
    return windRowToSensorData(rows[idx]);
  }
  return null;
}

// ── Get current reading for ALL assets (one tick) ──
export function getAllCurrentReadings(): Record<string, SensorData> {
  const result: Record<string, SensorData> = {};
  allAssets.forEach(asset => {
    const reading = getNextReading(asset.id);
    if (reading) result[asset.id] = reading;
  });
  return result;
}

// ── Alert generation from dataset readings ──
export function generateAlertFromReading(data: SensorData): Alert | null {
  if (data.failureType === 'normal') {
    if (data.rulHours < 200) {
      return {
        id: `alert-${Date.now()}-${data.assetId}`,
        severity: 'low',
        message: `${data.assetId}: Approaching maintenance window (${Math.round(data.rulHours)}h remaining)`,
        timestamp: new Date(),
        assetId: data.assetId,
      };
    }
    return null;
  }

  const severityMap: Record<string, string> = {
    inverter_failure: data.rulHours < 20 ? 'critical' : 'high',
    gearbox_failure: data.rulHours < 30 ? 'critical' : 'high',
    panel_hotspot: data.rulHours < 15 ? 'critical' : 'medium',
    generator_failure: data.rulHours < 25 ? 'critical' : 'high',
  };

  const messageMap: Record<string, string> = {
    inverter_failure: 'Inverter failure detected',
    gearbox_failure: 'Gearbox wear detected',
    panel_hotspot: 'Panel hotspot detected',
    generator_failure: 'Generator issues detected',
  };

  return {
    id: `alert-${Date.now()}-${data.assetId}`,
    severity: (severityMap[data.failureType] || 'medium') as Alert['severity'],
    message: `${data.assetId}: ${messageMap[data.failureType] || data.failureType} - ${Math.round(data.rulHours)}h RUL`,
    timestamp: new Date(),
    assetId: data.assetId,
  };
}

// ── Get asset info by ID ──
export function getAssetById(assetId: string): DatasetAsset | undefined {
  return allAssets.find(a => a.id === assetId);
}

// ── Get all dataset rows for an asset (for historical views) ──
export function getDatasetRowsForAsset(assetId: string): (SolarDataRow | WindDataRow)[] {
  return solarByAsset[assetId] || windByAsset[assetId] || [];
}

// ── Get all dataset rows (combined) ──
export function getAllDatasetRows(): { solar: SolarDataRow[]; wind: WindDataRow[] } {
  return { solar: solarDataset, wind: windDataset };
}
