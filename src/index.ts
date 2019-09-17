// should be the first import
import "./env"

import { Cap } from "cap"
import statRecorder from "./stat-recorder"

main()

function main(): void {
    const captureDevice = process.env.CAPTURE_DEVICE!
    const commitInterval = parseInt(process.env.COMMIT_INTERVAL!, 10)

    openCaptureDevice(captureDevice, "ETHERNET", statRecorder.handleFrame)
    setInterval(statRecorder.commit, 1000 * commitInterval)
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

    console.debug(`Opening device for packet capture: "${deviceName}"`)
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

    console.debug(`Capturing network traffic on "${deviceName}"`)
    cap.on("packet", (nbytes, truncated) => callback(truncated ? frameBuf : frameBuf.subarray(0, nbytes), truncated))

    let open = true
    const closeCaptureDevice = () => {
        if (open) {
            console.debug(`Closing capture device: "${deviceName}"`)
            open = false
            cap.close()
        }
    }
    return closeCaptureDevice
}
