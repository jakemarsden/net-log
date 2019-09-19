import { DateTime, Duration } from "luxon"
import { Ipv4Address } from "net-decode"

/**
 * Statistics for a single period
 */
export interface PeriodStats {
    /**
     * UTC
     */
    periodStart: DateTime
    periodLen: Duration
    bytes: number
    packets: number
    devices: Map<Ipv4Address, DeviceStats>
}

export interface DeviceStats {
    bytesIn: number
    bytesOut: number
    packets: number
}
