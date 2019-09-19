import Knex from "knex"
import { PeriodStats } from "./types"

export type ConnectionDetails = RemoteDbConnDetails | SocketDbConnDetails | FileDbConnDetails

interface RemoteDbConnDetails {
    host: string
    port: number
    database: string
    user: string
    password: string
    /**
     * In milliseconds, defaults to `10000`
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

export default class Db {
    private readonly db: Knex

    constructor(type: string, connDetails: ConnectionDetails) {
        this.db = Knex({
            client: type,
            connection: connDetails,
            debug: connDetails.debug
        })
    }

    savePeriodStats(stats: PeriodStats): void {
        const rows = constructStatRows(stats)
        if (rows.length === 0) {
            console.info(`No rows to commit to the database`)
            return
        }
        this.db.queryBuilder()
            .insert(rows)
            .into("period_stat")
            .then(() => console.debug(`Committed ${rows.length} rows to the database`))
            .catch(err => console.trace(`Unable to commit ${rows.length} rows to the database`, err))
    }
}

function constructStatRows(stats: PeriodStats): object[] {
    const rows: object[] = []

    const periodStart = stats.periodStart.toFormat("yyyy-MM-dd HH:mm:ss.SSS")
    const periodLen = stats.periodLen.as("milliseconds")
    for (const [addr, device] of stats.devices) {
        const row = {
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
