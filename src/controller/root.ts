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
        const stats = await this.db.getDailyPeriodStats()
        const trafficChart = constructTrafficBarChart(stats, this.groups, this.defaultGroup)

        const renderOpts = {
            app: {
                baseUrl: process.env.APP_URL!,
                title: process.env.APP_TITLE!,
                trafficChart
            }
        }
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

    const dataSets: ChartDataSet[] = Array.from(groupStats.entries()).map(([groupName, groupStat]) => ({
        label: groupName,
        data: Array.from(groupStat.entries()).map(([dateStr, stat]) => ({
            t: dateStr,
            y: stat.bytes / 1_000_000_000.0
        }))
    }))

    const chart: ChartConfiguration = {
        type: "bar",
        data: {
            datasets: dataSets
        },
        options: {
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        unit: "day"
                    }
                }],
                yAxes: [{
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
