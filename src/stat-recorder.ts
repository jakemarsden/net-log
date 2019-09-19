import { DateTime, Duration } from "luxon"
import { decodeFrame, decodePacket, Ipv4Address, Ipv4AddressUtil } from "net-decode"
import Db from "./db"
import { DeviceStats, PeriodStats } from "./types"
import { CollectionUtil } from "./utils"

export default class StatRecorder {
    private stats: PeriodStats = initStats(DateTime.utc())

    constructor(private readonly db: Db, private readonly network: Ipv4Address, private readonly netmask: Ipv4Address) {
    }

    /**
     * Record statistics about the recieved frame as part of the current period
     */
    handleFrame(frameBuf: Buffer): void {
        const { stats, network, netmask } = this

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

        const srcAddr = packet.sourceAddress
        const dstAddr = packet.destinationAddress
        const srcInSubnet = Ipv4AddressUtil.networkAddress(srcAddr, netmask) === network
        const dstInSubnet = Ipv4AddressUtil.networkAddress(dstAddr, netmask) === network
        const packetBytes = frame.payload.byteLength // don't count layer 2 headers

        if (srcInSubnet) {
            const srcStats = CollectionUtil.computeIfAbsent(stats.devices, srcAddr, initDeviceStats)
            srcStats.bytesOut += packetBytes
            srcStats.packets++
        }
        if (dstInSubnet) {
            const dstStats = CollectionUtil.computeIfAbsent(stats.devices, dstAddr, initDeviceStats)
            dstStats.bytesIn += packetBytes
            dstStats.packets++
        }
        if (srcInSubnet || dstInSubnet) {
            stats.bytes += packetBytes
            stats.packets++
        }
    }

    /**
     * Write the current period's statistics to disk and then start a new period
     */
    commit(): void {
        const { stats, db } = this
        const now = DateTime.utc()

        this.stats = initStats(now)

        stats.periodLen = stats.periodStart.diff(now).negate()

        this.db.savePeriodStats(stats)
    }
}

/**
 * Create blank statistics for a new period starting *now*
 */
function initStats(periodStart: DateTime): PeriodStats {
    const stat: PeriodStats = {
        periodStart,
        periodLen: Duration.fromMillis(0),
        devices: new Map(),
        bytes: 0,
        packets: 0
    }
    return stat
}

function initDeviceStats(): DeviceStats {
    return {
        bytesIn: 0,
        bytesOut: 0,
        packets: 0
    }
}
