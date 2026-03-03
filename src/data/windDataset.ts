import windCsvRaw from './wind_master_dataset.csv?raw';

export interface WindDataRow {
  timestamp: string;
  asset_id: string;
  asset_name: string;
  asset_type: 'Wind';
  capacity_mw: number;
  location_lat: number;
  location_lon: number;
  installation_date: string;
  voltage: number;
  current: number;
  power_output: number;
  vibration: number;
  rotor_speed: number;
  gearbox_temperature: number;
  wind_speed: number;
  humidity: number;
  ambient_temperature: number;
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

function parseCSV(raw: string): WindDataRow[] {
  const lines = raw.trim().split('\n');
  const headers = lines[0].split(',');
  const numericFields = new Set([
    'capacity_mw','location_lat','location_lon','voltage','current','power_output',
    'vibration','rotor_speed','gearbox_temperature','wind_speed','humidity',
    'ambient_temperature','failure_probability','confidence_score',
    'remaining_useful_life_hours','theoretical_max_power','efficiency_percent',
    'daily_cost','daily_revenue','downtime_loss','roi_percent','carbon_saved_kg',
    'energy_generated_kwh'
  ]);
  
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',');
    const row: any = {};
    headers.forEach((h, i) => {
      const key = h.trim();
      const val = values[i]?.trim() ?? '';
      row[key] = numericFields.has(key) ? parseFloat(val) || 0 : val;
    });
    return row as WindDataRow;
  });
}

export const windDataset: WindDataRow[] = parseCSV(windCsvRaw);

// Derive unique assets from the dataset
const assetMap = new Map<string, WindDataRow>();
windDataset.forEach(row => {
  if (!assetMap.has(row.asset_id)) assetMap.set(row.asset_id, row);
});

export const windAssets = Array.from(assetMap.entries()).map(([id, row]) => ({
  id,
  name: row.asset_name,
  capacity_mw: row.capacity_mw,
  location: `${row.location_lat.toFixed(2)}°N, ${row.location_lon.toFixed(2)}°E`,
  lat: row.location_lat,
  lng: row.location_lon,
  installation_date: row.installation_date,
  status: 'operational' as const,
}));

export const windDatasetMeta = {
  name: "Wind Master Dataset",
  description: "Comprehensive wind farm sensor data including wind speed, rotor speed, gearbox temperature, power output, and predictive maintenance metrics across 5 wind turbine assets.",
  rows: windDataset.length,
  columns: 30,
  dateRange: "Jan 2024 – Dec 2024",
  tags: ["wind", "turbine", "gearbox", "rotor", "maintenance"],
  lastUpdated: "2024-12-29",
};
