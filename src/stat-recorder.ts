import { decodeFrame, decodePacket, Ipv4Address } from "net-decode"

let stats: PeriodStats = initStats(Date.now())

/**
 * Statistics for a single period
 */
interface PeriodStats {
    /**
     * Millis since the epoch
     */
    periodStart: number
    /**
     * Millis since the epoch
     */
    periodEnd: number

    devices: Record<Ipv4Address, DeviceStats>
    total: TrafficStats
}

interface DeviceStats {
    in: TrafficStats
    out: TrafficStats
}

interface TrafficStats {
    bytes: number
    packets: number
}

/**
 * Record statistics about the recieved frame as part of the current period
 */
function handleFrame(frameBuf: Buffer): void {
    const frame = decodeFrame(frameBuf)
    if (frame === undefined) {
        // don't record non-decodable frames
        return
    }

    const packet = "ethertype" in frame ? decodePacket(frame.ethertype, frame.payload) : undefined
    if (packet === undefined) {
        // don't record non-network traffic
        return
    }

    const packetBytes = frame.payload.byteLength // don't count layer 2 headers
    const { sourceAddress: srcAddr, destinationAddress: dstAddr } = packet

    const srcStats = stats.devices[srcAddr] || (stats.devices[srcAddr] = initDeviceStats())
    const dstStats = stats.devices[dstAddr] || (stats.devices[dstAddr] = initDeviceStats())
    srcStats.out.bytes += packetBytes
    srcStats.out.packets++
    dstStats.in.bytes += packetBytes
    dstStats.in.packets++

    stats.total.bytes += packetBytes
    stats.total.packets++
}

/**
 * Write the current period's statistics to disk and then start a new period
 */
function commit(): void {
    const now = Date.now()

    const periodStats = stats
    stats = initStats(now)
    periodStats.periodEnd = now

    console.info(JSON.stringify(periodStats, null, 2))
}

/**
 * Create blank statistics for a new period starting *now*
 */
function initStats(periodStart: number): PeriodStats {
    const stat: PeriodStats = {
        periodStart,
        periodEnd: 0,
        devices: {},
        total: initTrafficStats()
    }
    return stat
}

function initDeviceStats(): DeviceStats {
    return {
        in: initTrafficStats(),
        out: initTrafficStats()
    }
}

function initTrafficStats(): TrafficStats {
    return {
        bytes: 0,
        packets: 0
    }
}

const statRecorder = {
    handleFrame,
    commit
}
export default statRecorder
