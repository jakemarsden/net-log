// should be the first import
import "./env"

import { Cap } from "cap"
import express from "express"
import { Ipv4AddressUtil } from "net-decode"
import { RootController } from "./controller"
import Db, { ConnectionDetails } from "./db"
import StatRecorder from "./stat-recorder"

main()

function main(): void {
    const captureDevice = process.env.CAPTURE_DEVICE!
    const captureNetwork = Ipv4AddressUtil.valueOf(process.env.CAPTURE_NETWORK!)
    const captureNetmask = Ipv4AddressUtil.networkMask(parseInt(process.env.CAPTURE_PREFIX!, 10))
    const commitInterval = parseInt(process.env.COMMIT_INTERVAL!, 10)
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
    const rootController = new RootController(db)
    const trafficStats = new StatRecorder(db, captureNetwork, captureNetmask)

    const app = express()
    app.set("view engine", "pug")
    app.set("views", "public")

    app.use(`${appUrl}/static`, express.static("public/static"))
    app.use(appUrl || "/", rootController.router)

    app.listen(
        appPort,
        appHost,
        () => {
            console.info(`Application started and listening on http://${appHost}:${appPort}${appUrl || "/"}`)

            // Start capturing and recording network traffic
            openCaptureDevice(
                captureDevice,
                "ETHERNET",
                frameBuf => trafficStats.handleFrame(frameBuf)
            )
            setInterval(() => trafficStats.commit(), 1000 * commitInterval)
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
