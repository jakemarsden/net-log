// should be the first import
import "./env"

import { Cap } from "cap"
import express, { Request, RequestHandler, Response } from "express"
import APP_CONFIG from "./config"
import { RootController } from "./controller"
import Db, { ConnectionDetails } from "./db"
import StatRecorder from "./stat-recorder"

main()

function main(): void {
    const appHost = process.env.APP_HOST!
    const appPort = parseInt(process.env.APP_PORT!, 10)
    const appUrl = process.env.APP_URL = normaliseUrl(process.env.APP_URL!)

    const dbConn: ConnectionDetails = {
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!, 10),
        database: process.env.DB_NAME!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        timezone: "utc"
    }

    const db = new Db(process.env.DB_TYPE!, dbConn)
    const rootController = new RootController(db, APP_CONFIG.groups, APP_CONFIG.defaultGroup)
    const trafficStats = new StatRecorder(db, APP_CONFIG.capture)

    const app = express()
    app.set("view engine", "pug")
    app.set("views", "public")

    app.use((req, res, next) => {
        res.on(
            "finish",
            () => console.debug(`${req.method} ${req.protocol} ${req.url} => (${res.statusCode} ${res.statusMessage})`)
        )
        console.debug(`${req.method} ${req.protocol} ${req.url}`)
        next()
    })

    app.use(`${appUrl}/static`, express.static("public/static"))
    app.use(appUrl || "/", rootController.router)

    app.listen(
        appPort,
        appHost,
        () => {
            console.info(`Application started and listening on http://${appHost}:${appPort}${appUrl || "/"}`)

            // Start capturing and recording network traffic
            openCaptureDevice(
                APP_CONFIG.capture.device,
                "ETHERNET",
                frameBuf => trafficStats.handleFrame(frameBuf)
            )
            setInterval(() => trafficStats.commit(), APP_CONFIG.capture.interval.as("milliseconds"))
        }
    )
}

/**
 * @return a callback to close the device
 */
function openCaptureDevice(
    deviceName: string,
    linkType: string,
    callback: (frameBuf: Buffer, truncated: boolean) => void
): () => void {

    const filter = ""
    const mtu = 65535
    const libcapBufSize = 160 * mtu
    const frameBuf = Buffer.alloc(mtu)

    const cap = new Cap()

    console.info(`Opening device for packet capture: "${deviceName}"`)
    const capType = cap.open(deviceName, filter, libcapBufSize, frameBuf)

    if (capType !== linkType) {
        try {
            cap.close()
        } finally {
            // nop
        }
        throw new Error(`Unexpected link type for device "${deviceName}": expected "${linkType}" but was "${capType}"`)
    }

    if ("setMaxListeners" in cap) {
        cap.setMaxListeners(0)
    }

    console.info(`Capturing network traffic on "${deviceName}"`)
    cap.on("packet", (nbytes, truncated) => callback(truncated ? frameBuf : frameBuf.subarray(0, nbytes), truncated))

    let open = true
    const closeCaptureDevice = () => {
        if (open) {
            console.info(`Closing capture device: "${deviceName}"`)
            open = false
            cap.close()
        }
    }
    return closeCaptureDevice
}

/**
 * Ensures the URL contains a leading slash but not a trailing slash, or is an empty string
 */
function normaliseUrl(url: string): string {
    if (url.endsWith("/")) {
        url = url.substring(0, url.length - 1)
    }
    if (!url.startsWith("/") && url.length !== 0) {
        url = "/" + url
    }
    return url
}
