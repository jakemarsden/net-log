import { ChartConfiguration, ChartDataSets, ChartPoint } from "chart.js"
import express, { RequestHandler, Router } from "express"
import { Ipv4Address, Ipv4AddressUtil } from "net-decode"
import Db from "../db"
import { DeviceGroup, PeriodStats } from "../types"
import { CollectionUtil } from "../utils"

export class RootController {
    readonly router: Router = express.Router()

    constructor(
        private readonly db: Db,
        private readonly groups: DeviceGroup[],
        private readonly defaultGroup: string
    ) {
        this.router.get("/", this.handleReq)
    }

    private readonly handleReq: RequestHandler = async (_, res) => {
        const logName = `${this.constructor.name}:handleReq`
        console.debug(`${logName} :: quering database`)

        const stats = await this.db.getDailyPeriodStats()
        const trafficChart = constructTrafficBarChart(stats, this.groups, this.defaultGroup)

        const renderOpts = {
            app: {
                baseUrl: process.env.APP_URL!,
                title: process.env.APP_TITLE!,
                trafficChart
            }
        }

        console.debug(`${logName} :: rendering template`)
        res.render("index", renderOpts)
    }
}

function constructTrafficBarChart(
    stats: PeriodStats[],
    groups: DeviceGroup[],
    defaultGroup: string
): ChartConfiguration {

    type ChartDataSet = ChartDataSets & {
        data: ChartPoint[]
    }

    // groupName => (dateStr => { bytes })
    const groupStats = new Map<string, Map<string, { bytes: number }>>()
    for (const stat of stats) {

        const dateStr = stat.periodStart.toISO()
        for (const [deviceAddr, deviceStat] of stat.devices) {

            const group = findGroupByAddress(deviceAddr, groups)
            const dataPoints = CollectionUtil.computeIfAbsent(
                groupStats,
                group === undefined ? defaultGroup : group.name,
                () => new Map<string, { bytes: number }>()
            )
            const dataPoint = CollectionUtil.computeIfAbsent(
                dataPoints,
                dateStr,
                () => ({ bytes: 0 })
            )
            dataPoint.bytes += deviceStat.bytesIn + deviceStat.bytesOut
        }
    }

    const dataSets: ChartDataSet[] = Array.from(groupStats.keys())
        .sort()
        .map(groupName => {
            const groupStat = groupStats.get(groupName)!
            const data = Array.from(groupStat.keys())
                .sort()
                .map(dateStr => ({
                    t: dateStr,
                    y: groupStat.get(dateStr)!.bytes / 1_000_000_000.0
                }))
            return {
                backgroundColor: toColorHash(groupName, 0.2),
                borderColor: toColorHash(groupName),
                borderWidth: 1,
                label: groupName,
                data
            }
        })

    const chart: ChartConfiguration = {
        type: "bar",
        data: {
            datasets: dataSets
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0.2)",
                        offsetGridLines: true
                    },
                    offset: true,
                    type: "time",
                    time: {
                        unit: "day"
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0.2)"
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Traffic (GB)"
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }
    return chart
}

function findGroupByAddress(addr: Ipv4Address, groups: DeviceGroup[]): DeviceGroup | undefined {
    const foundGroup = groups.find(
        group => group.addresses.some(
            ([network, netmask]) => Ipv4AddressUtil.networkAddress(addr, netmask) === network
        )
    )
    return foundGroup
}

/**
 * @param alpha in the range [0, 1.0]
 */
function toColorHash(value: string, alpha: number = 1.0): string {
    if (alpha < 0 || alpha > 1.0) {
        throw new TypeError(`Illegal color alpha channel (expected [0, 1.0]): ${alpha}`)
    }
    const hash = hashCode(value)
    const r = (hash & 0xff0000) >> 16
    const g = (hash & 0xff00) >> 8
    const b = hash & 0xff
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function hashCode(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return hash
}
