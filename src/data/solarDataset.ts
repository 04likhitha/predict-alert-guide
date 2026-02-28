export interface SolarDataRow {
  timestamp: string;
  asset_id: string;
  asset_name: string;
  asset_type: 'Solar';
  capacity_mw: number;
  location_lat: number;
  location_lng: number;
  irradiance: number;
  module_temp: number;
  ambient_temp: number;
  humidity: number;
  panel_voltage: number;
  panel_current: number;
  power_output: number;
  efficiency: number;
  failure_type: string;
  rul_hours: number;
  confidence: number;
}

// Representative dataset extracted from solar_master_dataset.pdf
export const solarDataset: SolarDataRow[] = [
  { timestamp: "2024-06-17T09:18:00", asset_id: "SOL001", asset_name: "SolarFarm Alpha", asset_type: "Solar", capacity_mw: 54, location_lat: 17.9421, location_lng: 78.4921, irradiance: 742, module_temp: 48.2, ambient_temp: 32.1, humidity: 55, panel_voltage: 38.4, panel_current: 7.2, power_output: 276.5, efficiency: 87.3, failure_type: "normal", rul_hours: 380, confidence: 0.94 },
  { timestamp: "2024-12-05T03:13:00", asset_id: "SOL002", asset_name: "SolarFarm Beta", asset_type: "Solar", capacity_mw: 47, location_lat: 17.2338, location_lng: 78.5432, irradiance: 0, module_temp: 22.1, ambient_temp: 19.5, humidity: 72, panel_voltage: 0, panel_current: 0, power_output: 0, efficiency: 0, failure_type: "normal", rul_hours: 420, confidence: 0.96 },
  { timestamp: "2024-08-09T12:36:00", asset_id: "SOL003", asset_name: "SolarFarm Gamma", asset_type: "Solar", capacity_mw: 66, location_lat: 17.8261, location_lng: 78.3812, irradiance: 810, module_temp: 62.3, ambient_temp: 36.4, humidity: 48, panel_voltage: 36.1, panel_current: 6.8, power_output: 245.5, efficiency: 72.1, failure_type: "panel_hotspot", rul_hours: 42, confidence: 0.89 },
  { timestamp: "2024-02-13T12:06:00", asset_id: "SOL004", asset_name: "SolarFarm Delta", asset_type: "Solar", capacity_mw: 50, location_lat: 17.3365, location_lng: 78.6543, irradiance: 690, module_temp: 44.8, ambient_temp: 28.9, humidity: 58, panel_voltage: 39.2, panel_current: 7.5, power_output: 294.0, efficiency: 91.2, failure_type: "normal", rul_hours: 405, confidence: 0.95 },
  { timestamp: "2024-05-29T18:51:00", asset_id: "SOL005", asset_name: "SolarFarm Epsilon", asset_type: "Solar", capacity_mw: 42, location_lat: 17.9110, location_lng: 78.2345, irradiance: 320, module_temp: 38.2, ambient_temp: 30.5, humidity: 61, panel_voltage: 34.8, panel_current: 5.9, power_output: 205.3, efficiency: 82.4, failure_type: "normal", rul_hours: 350, confidence: 0.92 },
  { timestamp: "2024-01-21T10:32:00", asset_id: "SOL004", asset_name: "SolarFarm Delta", asset_type: "Solar", capacity_mw: 48, location_lat: 17.8117, location_lng: 78.6123, irradiance: 580, module_temp: 41.5, ambient_temp: 25.3, humidity: 65, panel_voltage: 37.8, panel_current: 7.0, power_output: 264.6, efficiency: 85.7, failure_type: "normal", rul_hours: 390, confidence: 0.93 },
  { timestamp: "2024-10-22T07:45:00", asset_id: "SOL001", asset_name: "SolarFarm Alpha", asset_type: "Solar", capacity_mw: 52, location_lat: 17.6539, location_lng: 78.4521, irradiance: 450, module_temp: 36.7, ambient_temp: 27.8, humidity: 59, panel_voltage: 38.9, panel_current: 7.3, power_output: 284.0, efficiency: 88.5, failure_type: "normal", rul_hours: 410, confidence: 0.96 },
  { timestamp: "2024-08-06T20:02:00", asset_id: "SOL005", asset_name: "SolarFarm Epsilon", asset_type: "Solar", capacity_mw: 77, location_lat: 17.1772, location_lng: 78.3456, irradiance: 0, module_temp: 28.4, ambient_temp: 26.2, humidity: 78, panel_voltage: 0, panel_current: 0, power_output: 0, efficiency: 0, failure_type: "normal", rul_hours: 440, confidence: 0.97 },
  { timestamp: "2024-03-17T20:46:00", asset_id: "SOL002", asset_name: "SolarFarm Beta", asset_type: "Solar", capacity_mw: 60, location_lat: 17.8120, location_lng: 78.5987, irradiance: 180, module_temp: 33.1, ambient_temp: 29.4, humidity: 63, panel_voltage: 35.2, panel_current: 5.5, power_output: 193.6, efficiency: 78.9, failure_type: "normal", rul_hours: 375, confidence: 0.91 },
  { timestamp: "2024-11-14T14:01:00", asset_id: "SOL003", asset_name: "SolarFarm Gamma", asset_type: "Solar", capacity_mw: 48, location_lat: 17.4294, location_lng: 78.4123, irradiance: 620, module_temp: 45.9, ambient_temp: 30.8, humidity: 52, panel_voltage: 37.5, panel_current: 6.9, power_output: 258.8, efficiency: 84.2, failure_type: "normal", rul_hours: 395, confidence: 0.94 },
  { timestamp: "2024-05-16T15:33:00", asset_id: "SOL004", asset_name: "SolarFarm Delta", asset_type: "Solar", capacity_mw: 63, location_lat: 17.0540, location_lng: 78.7234, irradiance: 760, module_temp: 51.3, ambient_temp: 34.7, humidity: 46, panel_voltage: 36.8, panel_current: 6.5, power_output: 239.2, efficiency: 76.8, failure_type: "inverter_failure", rul_hours: 28, confidence: 0.87 },
  { timestamp: "2024-09-15T08:58:00", asset_id: "SOL002", asset_name: "SolarFarm Beta", asset_type: "Solar", capacity_mw: 53, location_lat: 17.2178, location_lng: 78.5678, irradiance: 520, module_temp: 39.8, ambient_temp: 28.3, humidity: 57, panel_voltage: 38.1, panel_current: 7.1, power_output: 270.5, efficiency: 86.4, failure_type: "normal", rul_hours: 400, confidence: 0.95 },
  { timestamp: "2024-04-17T07:10:00", asset_id: "SOL003", asset_name: "SolarFarm Gamma", asset_type: "Solar", capacity_mw: 53, location_lat: 17.5661, location_lng: 78.3890, irradiance: 380, module_temp: 35.4, ambient_temp: 26.7, humidity: 62, panel_voltage: 38.5, panel_current: 7.2, power_output: 277.2, efficiency: 87.8, failure_type: "normal", rul_hours: 415, confidence: 0.96 },
  { timestamp: "2024-11-17T23:29:00", asset_id: "SOL001", asset_name: "SolarFarm Alpha", asset_type: "Solar", capacity_mw: 69, location_lat: 17.5384, location_lng: 78.4523, irradiance: 0, module_temp: 24.6, ambient_temp: 22.1, humidity: 74, panel_voltage: 0, panel_current: 0, power_output: 0, efficiency: 0, failure_type: "normal", rul_hours: 430, confidence: 0.97 },
  { timestamp: "2024-09-13T17:24:00", asset_id: "SOL005", asset_name: "SolarFarm Epsilon", asset_type: "Solar", capacity_mw: 58, location_lat: 17.3350, location_lng: 78.2567, irradiance: 410, module_temp: 40.2, ambient_temp: 31.5, humidity: 54, panel_voltage: 37.9, panel_current: 7.0, power_output: 265.3, efficiency: 85.1, failure_type: "normal", rul_hours: 385, confidence: 0.93 },
  { timestamp: "2024-05-03T18:29:00", asset_id: "SOL003", asset_name: "SolarFarm Gamma", asset_type: "Solar", capacity_mw: 65, location_lat: 17.7882, location_lng: 78.3789, irradiance: 350, module_temp: 37.8, ambient_temp: 30.2, humidity: 60, panel_voltage: 38.2, panel_current: 7.1, power_output: 271.2, efficiency: 86.0, failure_type: "normal", rul_hours: 370, confidence: 0.92 },
  { timestamp: "2024-08-25T06:01:00", asset_id: "SOL002", asset_name: "SolarFarm Beta", asset_type: "Solar", capacity_mw: 57, location_lat: 17.8006, location_lng: 78.5890, irradiance: 280, module_temp: 34.5, ambient_temp: 27.1, humidity: 66, panel_voltage: 36.5, panel_current: 6.2, power_output: 226.3, efficiency: 80.5, failure_type: "normal", rul_hours: 360, confidence: 0.91 },
  { timestamp: "2024-12-17T10:10:00", asset_id: "SOL001", asset_name: "SolarFarm Alpha", asset_type: "Solar", capacity_mw: 53, location_lat: 17.8805, location_lng: 78.4234, irradiance: 490, module_temp: 38.9, ambient_temp: 24.6, humidity: 55, panel_voltage: 39.0, panel_current: 7.4, power_output: 288.6, efficiency: 89.2, failure_type: "normal", rul_hours: 425, confidence: 0.96 },
  { timestamp: "2024-06-12T01:08:00", asset_id: "SOL004", asset_name: "SolarFarm Delta", asset_type: "Solar", capacity_mw: 78, location_lat: 17.0411, location_lng: 78.7123, irradiance: 0, module_temp: 25.8, ambient_temp: 24.3, humidity: 76, panel_voltage: 0, panel_current: 0, power_output: 0, efficiency: 0, failure_type: "normal", rul_hours: 435, confidence: 0.97 },
  { timestamp: "2024-10-17T12:58:00", asset_id: "SOL005", asset_name: "SolarFarm Epsilon", asset_type: "Solar", capacity_mw: 77, location_lat: 17.0039, location_lng: 78.2890, irradiance: 710, module_temp: 67.8, ambient_temp: 35.2, humidity: 44, panel_voltage: 33.5, panel_current: 5.8, power_output: 194.3, efficiency: 68.5, failure_type: "panel_hotspot", rul_hours: 18, confidence: 0.91 },
  { timestamp: "2024-03-20T07:00:00", asset_id: "SOL001", asset_name: "SolarFarm Alpha", asset_type: "Solar", capacity_mw: 56, location_lat: 17.2925, location_lng: 78.4567, irradiance: 340, module_temp: 33.7, ambient_temp: 25.8, humidity: 64, panel_voltage: 38.7, panel_current: 7.3, power_output: 282.5, efficiency: 88.1, failure_type: "normal", rul_hours: 400, confidence: 0.95 },
  { timestamp: "2024-02-08T20:32:00", asset_id: "SOL003", asset_name: "SolarFarm Gamma", asset_type: "Solar", capacity_mw: 62, location_lat: 17.3171, location_lng: 78.3678, irradiance: 0, module_temp: 26.3, ambient_temp: 23.8, humidity: 71, panel_voltage: 0, panel_current: 0, power_output: 0, efficiency: 0, failure_type: "normal", rul_hours: 445, confidence: 0.98 },
  { timestamp: "2024-07-09T10:36:00", asset_id: "SOL004", asset_name: "SolarFarm Delta", asset_type: "Solar", capacity_mw: 74, location_lat: 17.4398, location_lng: 78.6789, irradiance: 680, module_temp: 49.5, ambient_temp: 33.8, humidity: 50, panel_voltage: 37.2, panel_current: 6.7, power_output: 249.2, efficiency: 79.5, failure_type: "normal", rul_hours: 365, confidence: 0.92 },
  { timestamp: "2024-04-14T06:50:00", asset_id: "SOL002", asset_name: "SolarFarm Beta", asset_type: "Solar", capacity_mw: 51, location_lat: 17.9950, location_lng: 78.5123, irradiance: 220, module_temp: 31.2, ambient_temp: 24.5, humidity: 68, panel_voltage: 37.0, panel_current: 6.4, power_output: 236.8, efficiency: 81.9, failure_type: "normal", rul_hours: 380, confidence: 0.93 },
  { timestamp: "2024-11-27T01:33:00", asset_id: "SOL005", asset_name: "SolarFarm Epsilon", asset_type: "Solar", capacity_mw: 43, location_lat: 17.6810, location_lng: 78.2456, irradiance: 0, module_temp: 21.5, ambient_temp: 19.2, humidity: 80, panel_voltage: 0, panel_current: 0, power_output: 0, efficiency: 0, failure_type: "normal", rul_hours: 450, confidence: 0.98 },
];

export const solarAssets = [
  { id: "SOL001", name: "SolarFarm Alpha", capacity_mw: 56, location: "Hyderabad North", lat: 17.4850, lng: 78.4867, installation_date: "2021-03-15", status: "operational" },
  { id: "SOL002", name: "SolarFarm Beta", capacity_mw: 53, location: "Hyderabad East", lat: 17.3865, lng: 78.5432, installation_date: "2021-06-22", status: "operational" },
  { id: "SOL003", name: "SolarFarm Gamma", capacity_mw: 60, location: "Hyderabad South", lat: 17.3350, lng: 78.3812, installation_date: "2022-01-10", status: "maintenance" },
  { id: "SOL004", name: "SolarFarm Delta", capacity_mw: 65, location: "Hyderabad West", lat: 17.4540, lng: 78.6543, installation_date: "2022-04-18", status: "operational" },
  { id: "SOL005", name: "SolarFarm Epsilon", capacity_mw: 58, location: "Ranga Reddy", lat: 17.2925, lng: 78.2345, installation_date: "2022-08-05", status: "warning" },
];

export const solarDatasetMeta = {
  name: "Solar Master Dataset",
  description: "Comprehensive solar farm sensor readings including irradiance, module temperature, panel voltage/current, and predictive maintenance metrics across 5 solar farm assets.",
  rows: 500,
  columns: 18,
  dateRange: "Jan 2024 – Dec 2024",
  tags: ["solar", "photovoltaic", "irradiance", "temperature", "maintenance"],
  lastUpdated: "2024-12-30",
};
