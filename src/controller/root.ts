import { ChartConfiguration, ChartDataSets, ChartPoint } from "chart.js"
import express, { RequestHandler, Router } from "express"
import { Ipv4AddressUtil } from "net-decode"
import Db from "../db"
import { PeriodStats } from "../types"
import { CollectionUtil } from "../utils"

export class RootController {
    readonly router: Router = express.Router()

    constructor(private readonly db: Db) {
        this.router.get("/", this.handleReq)
    }

    private readonly handleReq: RequestHandler = async (_, res) => {
        const stats = await this.db.getDailyPeriodStats()
        const trafficChart = constructTrafficBarChart(stats)

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

function constructTrafficBarChart(stats: PeriodStats[]): ChartConfiguration {
    type ChartDataSet = ChartDataSets & {
        data: ChartPoint[]
    }

    const dataSets = new Map<number, ChartDataSet>()
    for (const stat of stats) {
        const date = stat.periodStart
            .toLocal()
            .startOf("day")
            .toISO()

        for (const [addr, device] of stat.devices) {
            const dataSet = CollectionUtil.computeIfAbsent(
                dataSets,
                addr,
                () => ({
                    label: Ipv4AddressUtil.toString(addr),
                    data: []
                })
            )

            const dataPoint: ChartPoint = {
                t: date,
                y: (device.bytesIn + device.bytesOut) / 1000_000_000
            }
            dataSet.data.push(dataPoint)
        }
    }

    const chart: ChartConfiguration = {
        type: "bar",
        data: {
            datasets: Array.from(dataSets.values())
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
