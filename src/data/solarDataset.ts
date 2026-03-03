import solarCsvRaw from './solar_master_dataset.csv?raw';

export interface SolarDataRow {
  timestamp: string;
  asset_id: string;
  asset_name: string;
  asset_type: 'Solar';
  capacity_mw: number;
  location_lat: number;
  location_lon: number;
  installation_date: string;
  voltage: number;
  current: number;
  power_output: number;
  irradiance: number;
  humidity: number;
  ambient_temperature: number;
  panel_temperature: number;
  vibration: number;
  failure_type: string;
  failure_probability: number;
  confidence_score: number;
  remaining_useful_life_hours: number;
  theoretical_max_power: number;
  efficiency_percent: number;
  alert_level: string;
  daily_cost: number;
  daily_revenue: number;
  downtime_loss: number;
  roi_percent: number;
  carbon_saved_kg: number;
  energy_generated_kwh: number;
}

function parseCSV(raw: string): SolarDataRow[] {
  const lines = raw.trim().split('\n');
  const headers = lines[0].split(',');
  const numericFields = new Set([
    'capacity_mw','location_lat','location_lon','voltage','current','power_output',
    'irradiance','humidity','ambient_temperature','panel_temperature','vibration',
    'failure_probability','confidence_score','remaining_useful_life_hours',
    'theoretical_max_power','efficiency_percent','daily_cost','daily_revenue',
    'downtime_loss','roi_percent','carbon_saved_kg','energy_generated_kwh'
  ]);
  
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((h, i) => {
      const key = h.trim();
      const val = values[i]?.trim() ?? '';
      row[key] = numericFields.has(key) ? parseFloat(val) || 0 : val;
    });
    return row as SolarDataRow;
  });
}

export const solarDataset: SolarDataRow[] = parseCSV(solarCsvRaw);

// Derive unique assets from the dataset
const assetMap = new Map<string, SolarDataRow>();
solarDataset.forEach(row => {
  if (!assetMap.has(row.asset_id)) assetMap.set(row.asset_id, row);
});

export const solarAssets = Array.from(assetMap.entries()).map(([id, row]) => ({
  id,
  name: row.asset_name,
  capacity_mw: row.capacity_mw,
  location: `${row.location_lat.toFixed(2)}°N, ${row.location_lon.toFixed(2)}°E`,
  lat: row.location_lat,
  lng: row.location_lon,
  installation_date: row.installation_date,
  status: 'operational' as const,
}));

export const solarDatasetMeta = {
  name: "Solar Master Dataset",
  description: "Comprehensive solar farm sensor readings including irradiance, panel temperature, voltage/current, and predictive maintenance metrics across 5 solar farm assets.",
  rows: solarDataset.length,
  columns: 29,
  dateRange: "Jan 2024 – Dec 2024",
  tags: ["solar", "photovoltaic", "irradiance", "temperature", "maintenance"],
  lastUpdated: "2024-12-30",
};
