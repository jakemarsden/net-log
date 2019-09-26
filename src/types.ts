import { DateTime, Duration } from "luxon"
import { Ipv4Address } from "net-decode"

export interface CaptureOptions {
    device: string
    interval: Duration
    /**
     * Array of tuples in the form `[network, netmask]`
     */
    networks: Array<[Ipv4Address, Ipv4Address]>
}

export interface DeviceGroup {
    name: string
    /**
     * Array of tuples in the form `[network, netmask]`
     */
    addresses: Array<[Ipv4Address, Ipv4Address]>
}

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
