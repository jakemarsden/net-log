import Knex from "knex"
import { DateTime, Duration } from "luxon"
import { Ipv4Address } from "net-decode"
import { DeviceStats, PeriodStats } from "./types"
import { CollectionUtil } from "./utils"

export type ConnectionDetails = RemoteDbConnDetails | SocketDbConnDetails | FileDbConnDetails

interface RemoteDbConnDetails {
    host: string
    port: number
    database: string
    user: string
    password: string
    /**
     * In milliseconds, defaults to `10_000`
     */
    connectTimeout?: number
    requestTimeout?: number
    charset?: string
    timezone?: string
    debug?: boolean
}

interface SocketDbConnDetails {
    socketPath: string
    user: string
    password: string
    database: string
    debug?: boolean
}

interface FileDbConnDetails {
    filename: string
    debug?: boolean
}

interface PeriodStatRow {
    /**
     * `DATETIME NOT NULL`
     */
    period_start: Date
    /**
     * `INTEGER UNSIGNED NOT NULL`
     */
    period_len: number
    /**
     * `INTEGER UNSIGNED NOT NULL`
     */
    ip_addr: number
    /**
     * `BIGINT UNSIGNED NOT NULL`
     */
    bytes_in: number
    /**
     * `BIGINT UNSIGNED NOT NULL`
     */
    bytes_out: number
    /**
     * `BIGINT UNSIGNED NOT NULL`
     */
    packets: number
}

export default class Db {
    private readonly db: Knex

    constructor(type: string, connDetails: ConnectionDetails) {
        this.db = Knex({
            client: type,
            connection: connDetails,
            debug: connDetails.debug
        })
    }

    async getDailyPeriodStats(): Promise<PeriodStats[]> {
        const logName = `${this.constructor.name}:getDailyPeriodStats`
        console.debug(`${logName} :: selecting from database`)

        const rows = await this.db.queryBuilder()
            .select({
                period_start: "period_start",
                ip_addr: "ip_addr"
            })
            .sum({
                bytes_in: "bytes_in",
                bytes_out: "bytes_out",
                packets: "packets"
            })
            .from("period_stat")
            // TODO: Don't hard-code the local timezone, get it from the client
            .groupByRaw("DATE(CONVERT_TZ(period_start, '+00:00', '+12:00'))")
            .groupBy("ip_addr")

        console.debug(`${logName} :: selected ${rows.length} rows`)
        return parseStatRows(rows)
    }

    async savePeriodStats(stats: PeriodStats): Promise<void> {
        const rows = constructStatRows(stats)
        if (rows.length === 0) {
            console.info(`No rows to commit to the database`)
            return
        }
        try {
            await this.db.queryBuilder()
                .insert(rows)
                .into("period_stat")
        } catch (err) {
            console.trace(`Unable to commit ${rows.length} rows to the database`, err)
            return
        }
        console.debug(`Committed ${rows.length} rows to the database`)
    }
}

function parseStatRows(rows: PeriodStatRow[]): PeriodStats[] {
    const stats = new Map<number, PeriodStats>()
    for (const row of rows) {
        const periodStart = DateTime.fromJSDate(row.period_start, { zone: "utc" })
            .toLocal()
            .startOf("day")
        const stat: PeriodStats = CollectionUtil.computeIfAbsent(
            stats,
            periodStart.toMillis(),
            () => ({
                periodStart,
                periodLen: Duration.fromObject({ seconds: row.period_len }),
                bytes: 0,
                packets: 0,
                devices: new Map<Ipv4Address, DeviceStats>()
            })
        )
        stat.bytes += row.bytes_in
        stat.bytes += row.bytes_out
        stat.packets += row.packets

        const deviceStat: DeviceStats = CollectionUtil.computeIfAbsent(
            stat.devices,
            row.ip_addr,
            () => ({
                bytesIn: 0,
                bytesOut: 0,
                packets: 0
            })
        )
        deviceStat.bytesIn += row.bytes_in as number
        deviceStat.bytesOut += row.bytes_out
        deviceStat.packets += row.packets
    }
    return Array.from(stats.values())
}

function constructStatRows(stats: PeriodStats): PeriodStatRow[] {
    const rows: PeriodStatRow[] = []

    const periodStart = stats.periodStart.toJSDate()
    const periodLen = stats.periodLen.as("milliseconds")
    for (const [addr, device] of stats.devices) {
        const row: PeriodStatRow = {
            period_start: periodStart,
            period_len: periodLen,
            ip_addr: addr,
            bytes_in: device.bytesIn,
            bytes_out: device.bytesOut,
            packets: device.packets
        }
        rows.push(row)
    }
    return rows
}
