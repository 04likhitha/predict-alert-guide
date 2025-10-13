import { SensorData, AssetType, FailureType, Alert, Recommendation } from '@/types/sensor';

const ASSET_IDS = {
  wind: ['WT_1', 'WT_2', 'WT_3', 'WT_4', 'WT_5'],
  solar: ['SP_1', 'SP_2', 'SP_3', 'SP_4', 'SP_5'],
};

const FAILURE_TYPES: FailureType[] = [
  'normal',
  'inverter_failure',
  'gearbox_failure',
  'panel_hotspot',
  'generator_failure',
];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomFailureType(assetType: AssetType): FailureType {
  const rand = Math.random();
  
  if (assetType === 'wind') {
    if (rand < 0.7) return 'normal';
    if (rand < 0.85) return 'gearbox_failure';
    if (rand < 0.95) return 'generator_failure';
    return 'inverter_failure';
  } else {
    if (rand < 0.7) return 'normal';
    if (rand < 0.85) return 'panel_hotspot';
    return 'inverter_failure';
  }
}

export function generateSensorData(assetType: AssetType): SensorData {
  const failureType = randomFailureType(assetType);
  const isFailure = failureType !== 'normal';
  
  const baseData = {
    timestamp: new Date(),
    assetType,
    assetId: ASSET_IDS[assetType][Math.floor(Math.random() * 5)],
    ambientTemp: randomInRange(20, 42),
    humidity: randomInRange(40, 90),
    failureType,
    rulHours: isFailure ? randomInRange(5, 50) : randomInRange(150, 450),
    confidence: randomInRange(0.75, 0.98),
  };

  if (assetType === 'wind') {
    return {
      ...baseData,
      windSpeed: randomInRange(8, 18),
      rotorSpeed: isFailure ? randomInRange(8, 15) : randomInRange(15, 26),
      gearboxTemp: isFailure ? randomInRange(70, 85) : randomInRange(40, 70),
      powerOutput: isFailure ? randomInRange(50, 120) : randomInRange(120, 210),
    };
  } else {
    return {
      ...baseData,
      panelVoltage: randomInRange(26, 44),
      panelCurrent: randomInRange(5, 8.5),
      moduleTemp: isFailure ? randomInRange(60, 75) : randomInRange(30, 60),
      irradiance: randomInRange(580, 800),
      powerOutput: isFailure ? randomInRange(150, 220) : randomInRange(220, 350),
    };
  }
}

export function generateAlert(data: SensorData): Alert | null {
  if (data.failureType === 'normal') {
    if (data.rulHours < 200) {
      return {
        id: `alert-${Date.now()}`,
        severity: 'low',
        message: `${data.assetId}: Approaching maintenance window (${Math.round(data.rulHours)}h remaining)`,
        timestamp: new Date(),
        assetId: data.assetId,
      };
    }
    return null;
  }

  const severityMap = {
    inverter_failure: data.rulHours < 20 ? 'critical' : 'high',
    gearbox_failure: data.rulHours < 30 ? 'critical' : 'high',
    panel_hotspot: data.rulHours < 15 ? 'critical' : 'medium',
    generator_failure: data.rulHours < 25 ? 'critical' : 'high',
  };

  const messageMap = {
    inverter_failure: 'Inverter failure detected',
    gearbox_failure: 'Gearbox wear detected',
    panel_hotspot: 'Panel hotspot detected',
    generator_failure: 'Generator issues detected',
  };

  return {
    id: `alert-${Date.now()}`,
    severity: severityMap[data.failureType as keyof typeof severityMap] as Alert['severity'],
    message: `${data.assetId}: ${messageMap[data.failureType as keyof typeof messageMap]} - ${Math.round(data.rulHours)}h RUL`,
    timestamp: new Date(),
    assetId: data.assetId,
  };
}

export function getRecommendation(failureType: FailureType): Recommendation {
  const recommendations: Record<FailureType, Recommendation> = {
    normal: {
      problem: 'System operating normally',
      solution: 'Continue routine monitoring and scheduled maintenance',
      priority: 'low',
    },
    inverter_failure: {
      problem: 'Inverter showing signs of failure - voltage irregularities and efficiency loss detected',
      solution: 'Schedule inverter inspection and replacement. Check DC/AC conversion efficiency. Inspect capacitors and cooling system.',
      priority: 'high',
    },
    gearbox_failure: {
      problem: 'Gearbox temperature elevation and vibration anomalies indicate bearing wear',
      solution: 'Plan immediate gearbox inspection. Check lubrication levels and bearing condition. Schedule maintenance shutdown.',
      priority: 'high',
    },
    panel_hotspot: {
      problem: 'Hotspot formation on solar panel indicates cell damage or shading issues',
      solution: 'Conduct thermal imaging inspection. Clean panels and check for physical damage. Replace affected modules if needed.',
      priority: 'medium',
    },
    generator_failure: {
      problem: 'Generator showing performance degradation - reduced power output and temperature anomalies',
      solution: 'Inspect generator bearings, rotor, and stator. Check cooling system. Plan for potential generator overhaul or replacement.',
      priority: 'high',
    },
  };

  return recommendations[failureType];
}
