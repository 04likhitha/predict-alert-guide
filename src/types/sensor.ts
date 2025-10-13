export type AssetType = 'wind' | 'solar';

export type FailureType = 
  | 'normal' 
  | 'inverter_failure' 
  | 'gearbox_failure' 
  | 'panel_hotspot' 
  | 'generator_failure';

export interface SensorData {
  timestamp: Date;
  assetType: AssetType;
  assetId: string;
  
  // Wind turbine specific
  windSpeed?: number;
  rotorSpeed?: number;
  gearboxTemp?: number;
  
  // Solar panel specific
  panelVoltage?: number;
  panelCurrent?: number;
  moduleTemp?: number;
  irradiance?: number;
  
  // Common
  powerOutput: number;
  ambientTemp: number;
  humidity: number;
  
  // Predictions
  failureType: FailureType;
  rulHours: number;
  confidence: number;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  assetId: string;
}

export interface Recommendation {
  problem: string;
  solution: string;
  priority: 'low' | 'medium' | 'high';
}
