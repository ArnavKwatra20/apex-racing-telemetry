export type DriverId = 'ax01' | 'rb07' | 'km22'
export type SectorId = 'all' | 's1' | 's2' | 's3'

export interface Driver {
  id: DriverId
  code: string
  name: string
  team: string
  color: string
  style: string
  pace: number
  consistency: number
  degradation: number
}

export interface TelemetryPoint {
  distance: number
  speed: number
  rpm: number
  throttle: number
  brake: number
  gear: number
  lateralG: number
  longitudinalG: number
  fuel: number
}

export interface Lap {
  number: number
  time: number
  topSpeed: number
  averageSpeed: number
  fuel: number
  compound: 'SOFT' | 'MEDIUM' | 'HARD'
  telemetry: TelemetryPoint[]
}

export interface TireState {
  compound: Lap['compound']
  temperature: number
  wear: number
  degradation: number
}

export const drivers: Driver[] = [
  { id: 'ax01', code: 'AX-01', name: 'Ari Vale', team: 'Nova Racing', color: '#e6a46a', style: 'Late braker', pace: 1.06, consistency: 0.88, degradation: 1.05 },
  { id: 'rb07', code: 'RB-07', name: 'Rin Bell', team: 'Velocity Works', color: '#82c6bf', style: 'Smooth operator', pace: 0.99, consistency: 0.96, degradation: 0.78 },
  { id: 'km22', code: 'KM-22', name: 'Kade Moss', team: 'Apex Motorsport', color: '#c48ad9', style: 'Corner specialist', pace: 1.02, consistency: 0.93, degradation: 0.9 },
]

export const laps = Array.from({ length: 9 }, (_, index) => index + 12)
export const sectors = [
  { id: 'all' as SectorId, label: 'FULL LAP' },
  { id: 's1' as SectorId, label: 'S1' },
  { id: 's2' as SectorId, label: 'S2' },
  { id: 's3' as SectorId, label: 'S3' },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function buildTelemetry(driver: Driver, lapNumber: number): TelemetryPoint[] {
  const points: TelemetryPoint[] = []
  const fuelStart = 71.8 - (lapNumber - 12) * 1.62
  for (let index = 0; index < 96; index += 1) {
    const progress = index / 95
    const distance = progress * 5.842
    const sectorWave = Math.sin(progress * Math.PI * 6)
    const corner = Math.max(0, Math.sin(progress * Math.PI * 6 - 0.8))
    const brakingZone = Math.max(0, Math.sin(progress * Math.PI * 6 + 1.4))
    const speed = clamp(236 + 48 * Math.sin(progress * Math.PI * 2 - 0.4) - corner * (75 - driver.pace * 8) + driver.pace * 5 - (lapNumber - 16) * 0.8, 108, 318)
    const throttle = clamp(92 - brakingZone * 88 + Math.sin(progress * 19) * 3 + (driver.id === 'rb07' ? 3 : 0), 0, 100)
    const brake = clamp(brakingZone * (driver.id === 'ax01' ? 94 : 82) + Math.max(0, -sectorWave) * 8, 0, 100)
    const gear = clamp(Math.round(speed / 43), 2, 8)
    points.push({
      distance: Number(distance.toFixed(3)),
      speed: Math.round(speed),
      rpm: Math.round(clamp(4800 + speed * 24 + throttle * 13 - gear * 390, 4200, 11300)),
      throttle: Math.round(throttle),
      brake: Math.round(brake),
      gear,
      lateralG: Number((sectorWave * (0.68 + driver.pace * 0.12) + Math.sin(progress * 31) * 0.08).toFixed(2)),
      longitudinalG: Number(((throttle / 100) * 0.72 - (brake / 100) * 1.18).toFixed(2)),
      fuel: Number((fuelStart - progress * 0.42).toFixed(2)),
    })
  }
  return points
}

export function buildLap(driver: Driver, lapNumber: number): Lap {
  const telemetry = buildTelemetry(driver, lapNumber)
  const averageSpeed = Math.round(telemetry.reduce((sum, point) => sum + point.speed, 0) / telemetry.length)
  const topSpeed = Math.max(...telemetry.map((point) => point.speed))
  const baseTime = 88.92 - (driver.pace - 1) * 3.2 - (lapNumber - 12) * 0.14 + Math.sin(lapNumber * 1.7) * 0.12
  return {
    number: lapNumber,
    time: Number((baseTime + (1 - driver.consistency) * 0.35).toFixed(3)),
    topSpeed,
    averageSpeed,
    fuel: telemetry[0].fuel,
    compound: lapNumber < 16 ? 'MEDIUM' : lapNumber < 19 ? 'HARD' : 'MEDIUM',
    telemetry,
  }
}

export function formatLapTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${(seconds - minutes * 60).toFixed(3).padStart(6, '0')}`
}

export function sectorTime(lap: Lap, sector: SectorId) {
  if (sector === 'all') return lap.time
  const factors = [0.318, 0.361, 0.321]
  const rawTimes = factors.map((factor, index) => lap.time * factor + Math.sin(lap.number + index) * 0.035)
  const scale = lap.time / rawTimes.reduce((sum, time) => sum + time, 0)
  const index = sector === 's1' ? 0 : sector === 's2' ? 1 : 2
  return rawTimes[index] * scale
}

export function getTireState(driver: Driver, lap: Lap): TireState {
  const lapAge = Math.max(0, lap.number - 12)
  const wear = clamp(8 + lapAge * 1.7 * driver.degradation, 8, 42)
  const temperature = Math.round(91 + lapAge * 0.8 + (driver.id === 'ax01' ? 3 : 0))
  return {
    compound: lap.compound,
    temperature,
    wear: Math.round(wear),
    degradation: Number((wear * 0.42).toFixed(1)),
  }
}

export function getSectorRange(sector: SectorId) {
  if (sector === 's1') return [0, 1.94]
  if (sector === 's2') return [1.94, 3.88]
  if (sector === 's3') return [3.88, 5.842]
  return [0, 5.842]
}
