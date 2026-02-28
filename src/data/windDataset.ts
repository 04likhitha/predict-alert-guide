export interface WindDataRow {
  timestamp: string;
  asset_id: string;
  asset_name: string;
  asset_type: 'Wind';
  capacity_mw: number;
  location_lat: number;
  location_lng: number;
  wind_speed: number;
  rotor_speed: number;
  gearbox_temp: number;
  ambient_temp: number;
  humidity: number;
  power_output: number;
  efficiency: number;
  failure_type: string;
  rul_hours: number;
  confidence: number;
}

export const windDataset: WindDataRow[] = [
  { timestamp: "2024-07-25T22:50:00", asset_id: "WND001", asset_name: "WindFarm Apex", asset_type: "Wind", capacity_mw: 150, location_lat: 17.4850, location_lng: 78.1234, wind_speed: 12.4, rotor_speed: 18.2, gearbox_temp: 52.3, ambient_temp: 28.4, humidity: 62, power_output: 1850, efficiency: 88.5, failure_type: "normal", rul_hours: 400, confidence: 0.95 },
  { timestamp: "2024-04-29T19:29:00", asset_id: "WND002", asset_name: "WindFarm Breeze", asset_type: "Wind", capacity_mw: 146, location_lat: 17.3456, location_lng: 78.2345, wind_speed: 14.8, rotor_speed: 21.5, gearbox_temp: 58.7, ambient_temp: 31.2, humidity: 55, power_output: 2120, efficiency: 91.2, failure_type: "normal", rul_hours: 380, confidence: 0.94 },
  { timestamp: "2024-06-15T19:41:00", asset_id: "WND003", asset_name: "WindFarm Cyclone", asset_type: "Wind", capacity_mw: 108, location_lat: 17.5678, location_lng: 78.3456, wind_speed: 9.8, rotor_speed: 14.2, gearbox_temp: 73.5, ambient_temp: 34.8, humidity: 48, power_output: 980, efficiency: 72.4, failure_type: "gearbox_failure", rul_hours: 35, confidence: 0.88 },
  { timestamp: "2024-03-21T15:17:00", asset_id: "WND004", asset_name: "WindFarm Drift", asset_type: "Wind", capacity_mw: 149, location_lat: 17.6789, location_lng: 78.4567, wind_speed: 16.2, rotor_speed: 23.8, gearbox_temp: 55.1, ambient_temp: 26.5, humidity: 58, power_output: 2340, efficiency: 93.8, failure_type: "normal", rul_hours: 420, confidence: 0.96 },
  { timestamp: "2024-04-27T12:05:00", asset_id: "WND005", asset_name: "WindFarm Echo", asset_type: "Wind", capacity_mw: 133, location_lat: 17.7890, location_lng: 78.5678, wind_speed: 11.5, rotor_speed: 16.8, gearbox_temp: 50.8, ambient_temp: 29.7, humidity: 60, power_output: 1680, efficiency: 86.2, failure_type: "normal", rul_hours: 390, confidence: 0.94 },
  { timestamp: "2024-08-09T15:19:00", asset_id: "WND003", asset_name: "WindFarm Cyclone", asset_type: "Wind", capacity_mw: 156, location_lat: 17.5432, location_lng: 78.3234, wind_speed: 15.6, rotor_speed: 22.4, gearbox_temp: 56.9, ambient_temp: 32.1, humidity: 52, power_output: 2200, efficiency: 90.5, failure_type: "normal", rul_hours: 410, confidence: 0.95 },
  { timestamp: "2024-09-07T17:27:00", asset_id: "WND002", asset_name: "WindFarm Breeze", asset_type: "Wind", capacity_mw: 138, location_lat: 17.3567, location_lng: 78.2456, wind_speed: 13.2, rotor_speed: 19.5, gearbox_temp: 54.2, ambient_temp: 30.5, humidity: 56, power_output: 1920, efficiency: 89.1, failure_type: "normal", rul_hours: 395, confidence: 0.94 },
  { timestamp: "2024-01-23T18:20:00", asset_id: "WND001", asset_name: "WindFarm Apex", asset_type: "Wind", capacity_mw: 126, location_lat: 17.4678, location_lng: 78.1345, wind_speed: 10.5, rotor_speed: 15.3, gearbox_temp: 48.5, ambient_temp: 22.8, humidity: 68, power_output: 1450, efficiency: 83.7, failure_type: "normal", rul_hours: 370, confidence: 0.93 },
  { timestamp: "2024-11-22T01:45:00", asset_id: "WND004", asset_name: "WindFarm Drift", asset_type: "Wind", capacity_mw: 143, location_lat: 17.6890, location_lng: 78.4678, wind_speed: 8.2, rotor_speed: 11.8, gearbox_temp: 42.3, ambient_temp: 20.5, humidity: 75, power_output: 890, efficiency: 74.5, failure_type: "normal", rul_hours: 350, confidence: 0.91 },
  { timestamp: "2024-10-18T21:19:00", asset_id: "WND005", asset_name: "WindFarm Echo", asset_type: "Wind", capacity_mw: 149, location_lat: 17.7789, location_lng: 78.5567, wind_speed: 14.1, rotor_speed: 20.8, gearbox_temp: 57.4, ambient_temp: 29.2, humidity: 54, power_output: 2080, efficiency: 90.8, failure_type: "normal", rul_hours: 405, confidence: 0.95 },
  { timestamp: "2024-02-26T12:18:00", asset_id: "WND001", asset_name: "WindFarm Apex", asset_type: "Wind", capacity_mw: 120, location_lat: 17.4590, location_lng: 78.1456, wind_speed: 15.8, rotor_speed: 10.5, gearbox_temp: 78.2, ambient_temp: 25.3, humidity: 65, power_output: 750, efficiency: 62.5, failure_type: "generator_failure", rul_hours: 22, confidence: 0.86 },
  { timestamp: "2024-01-24T01:40:00", asset_id: "WND002", asset_name: "WindFarm Breeze", asset_type: "Wind", capacity_mw: 142, location_lat: 17.3678, location_lng: 78.2567, wind_speed: 7.5, rotor_speed: 10.2, gearbox_temp: 41.8, ambient_temp: 18.9, humidity: 72, power_output: 720, efficiency: 70.8, failure_type: "normal", rul_hours: 340, confidence: 0.90 },
  { timestamp: "2024-12-08T03:58:00", asset_id: "WND003", asset_name: "WindFarm Cyclone", asset_type: "Wind", capacity_mw: 117, location_lat: 17.5345, location_lng: 78.3345, wind_speed: 6.8, rotor_speed: 9.5, gearbox_temp: 38.9, ambient_temp: 17.5, humidity: 78, power_output: 580, efficiency: 65.2, failure_type: "normal", rul_hours: 330, confidence: 0.89 },
  { timestamp: "2024-09-03T01:21:00", asset_id: "WND005", asset_name: "WindFarm Echo", asset_type: "Wind", capacity_mw: 157, location_lat: 17.7678, location_lng: 78.5456, wind_speed: 17.5, rotor_speed: 25.2, gearbox_temp: 61.3, ambient_temp: 33.5, humidity: 47, power_output: 2480, efficiency: 95.2, failure_type: "normal", rul_hours: 440, confidence: 0.97 },
  { timestamp: "2024-07-31T20:13:00", asset_id: "WND004", asset_name: "WindFarm Drift", asset_type: "Wind", capacity_mw: 106, location_lat: 17.6678, location_lng: 78.4456, wind_speed: 11.2, rotor_speed: 16.1, gearbox_temp: 76.8, ambient_temp: 35.2, humidity: 45, power_output: 1120, efficiency: 75.8, failure_type: "gearbox_failure", rul_hours: 15, confidence: 0.90 },
  { timestamp: "2024-06-14T01:44:00", asset_id: "WND001", asset_name: "WindFarm Apex", asset_type: "Wind", capacity_mw: 151, location_lat: 17.4789, location_lng: 78.1567, wind_speed: 13.8, rotor_speed: 20.1, gearbox_temp: 53.7, ambient_temp: 28.9, humidity: 59, power_output: 1980, efficiency: 89.8, failure_type: "normal", rul_hours: 405, confidence: 0.95 },
  { timestamp: "2024-09-18T22:07:00", asset_id: "WND002", asset_name: "WindFarm Breeze", asset_type: "Wind", capacity_mw: 110, location_lat: 17.3789, location_lng: 78.2678, wind_speed: 9.2, rotor_speed: 13.5, gearbox_temp: 46.2, ambient_temp: 27.4, humidity: 63, power_output: 1280, efficiency: 80.5, failure_type: "normal", rul_hours: 360, confidence: 0.92 },
  { timestamp: "2024-05-16T20:23:00", asset_id: "WND004", asset_name: "WindFarm Drift", asset_type: "Wind", capacity_mw: 156, location_lat: 17.6567, location_lng: 78.4345, wind_speed: 16.5, rotor_speed: 24.1, gearbox_temp: 57.8, ambient_temp: 31.8, humidity: 51, power_output: 2380, efficiency: 94.1, failure_type: "normal", rul_hours: 430, confidence: 0.96 },
  { timestamp: "2024-05-16T12:53:00", asset_id: "WND003", asset_name: "WindFarm Cyclone", asset_type: "Wind", capacity_mw: 114, location_lat: 17.5567, location_lng: 78.3567, wind_speed: 10.8, rotor_speed: 15.8, gearbox_temp: 51.5, ambient_temp: 30.2, humidity: 57, power_output: 1560, efficiency: 85.3, failure_type: "normal", rul_hours: 385, confidence: 0.93 },
  { timestamp: "2024-07-21T09:20:00", asset_id: "WND005", asset_name: "WindFarm Echo", asset_type: "Wind", capacity_mw: 160, location_lat: 17.7890, location_lng: 78.5789, wind_speed: 18.2, rotor_speed: 26.5, gearbox_temp: 63.8, ambient_temp: 34.2, humidity: 43, power_output: 2560, efficiency: 96.5, failure_type: "normal", rul_hours: 445, confidence: 0.97 },
  { timestamp: "2024-11-04T12:55:00", asset_id: "WND001", asset_name: "WindFarm Apex", asset_type: "Wind", capacity_mw: 112, location_lat: 17.4567, location_lng: 78.1234, wind_speed: 12.8, rotor_speed: 8.5, gearbox_temp: 81.2, ambient_temp: 29.8, humidity: 58, power_output: 680, efficiency: 58.2, failure_type: "generator_failure", rul_hours: 12, confidence: 0.85 },
  { timestamp: "2024-10-25T07:48:00", asset_id: "WND003", asset_name: "WindFarm Cyclone", asset_type: "Wind", capacity_mw: 114, location_lat: 17.5456, location_lng: 78.3456, wind_speed: 10.2, rotor_speed: 14.8, gearbox_temp: 49.5, ambient_temp: 26.8, humidity: 64, power_output: 1420, efficiency: 82.8, failure_type: "normal", rul_hours: 375, confidence: 0.93 },
  { timestamp: "2024-06-27T18:43:00", asset_id: "WND002", asset_name: "WindFarm Breeze", asset_type: "Wind", capacity_mw: 145, location_lat: 17.3890, location_lng: 78.2789, wind_speed: 14.5, rotor_speed: 21.2, gearbox_temp: 55.8, ambient_temp: 30.8, humidity: 53, power_output: 2050, efficiency: 90.2, failure_type: "normal", rul_hours: 400, confidence: 0.95 },
  { timestamp: "2024-08-18T01:08:00", asset_id: "WND004", asset_name: "WindFarm Drift", asset_type: "Wind", capacity_mw: 154, location_lat: 17.6456, location_lng: 78.4234, wind_speed: 7.8, rotor_speed: 11.2, gearbox_temp: 43.5, ambient_temp: 24.5, humidity: 70, power_output: 850, efficiency: 72.8, failure_type: "normal", rul_hours: 345, confidence: 0.90 },
  { timestamp: "2024-05-07T17:15:00", asset_id: "WND005", asset_name: "WindFarm Echo", asset_type: "Wind", capacity_mw: 129, location_lat: 17.7567, location_lng: 78.5345, wind_speed: 11.8, rotor_speed: 17.2, gearbox_temp: 52.1, ambient_temp: 29.5, humidity: 58, power_output: 1720, efficiency: 87.5, failure_type: "normal", rul_hours: 390, confidence: 0.94 },
];

export const windAssets = [
  { id: "WND001", name: "WindFarm Apex", capacity_mw: 140, location: "Anantapur", lat: 17.4850, lng: 78.1234, installation_date: "2020-11-20", status: "operational" },
  { id: "WND002", name: "WindFarm Breeze", capacity_mw: 135, location: "Kurnool", lat: 17.3456, lng: 78.2345, installation_date: "2021-02-14", status: "operational" },
  { id: "WND003", name: "WindFarm Cyclone", capacity_mw: 130, location: "Kadapa", lat: 17.5678, lng: 78.3456, installation_date: "2021-07-30", status: "warning" },
  { id: "WND004", name: "WindFarm Drift", capacity_mw: 145, location: "Nellore", lat: 17.6789, lng: 78.4567, installation_date: "2022-03-12", status: "operational" },
  { id: "WND005", name: "WindFarm Echo", capacity_mw: 150, location: "Prakasam", lat: 17.7890, lng: 78.5678, installation_date: "2022-09-08", status: "operational" },
];

export const windDatasetMeta = {
  name: "Wind Master Dataset",
  description: "Comprehensive wind farm sensor data including wind speed, rotor speed, gearbox temperature, power output, and predictive maintenance metrics across 5 wind turbine assets.",
  rows: 500,
  columns: 17,
  dateRange: "Jan 2024 – Dec 2024",
  tags: ["wind", "turbine", "gearbox", "rotor", "maintenance"],
  lastUpdated: "2024-12-29",
};
