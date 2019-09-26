import fs from "fs"
import { Duration } from "luxon"
import { Ipv4Address, Ipv4AddressUtil } from "net-decode"
import path from "path"
import { CaptureOptions, DeviceGroup } from "./types"

/**
 * See: `config.example.json`
 */
interface RawConfig {
    capture: {
        device: string
        interval: number
        networks: string[]
    }
    defaultGroup: string
    groups: Record<string, string[]>
}

export interface AppConfig {
    capture: CaptureOptions
    defaultGroup: string
    groups: DeviceGroup[]
}

const configFilePath = path.resolve(process.cwd(), process.env.CONFIG_FILE!)
const configFile = fs.readFileSync(configFilePath, { encoding: "utf8" })
const rawConfig: RawConfig = JSON.parse(configFile)

const APP_CONFIG: AppConfig = parseAppConfig(rawConfig)
export default APP_CONFIG

function parseAppConfig(raw: RawConfig): AppConfig {
    return {
        ...raw,
        capture: parseCaptureOptions(raw),
        groups: parseDeviceGroups(raw)
    }
}

function parseCaptureOptions(raw: RawConfig): CaptureOptions {
    const { device, interval, networks } = raw.capture
    return {
        device,
        interval: Duration.fromObject({ seconds: interval }),
        networks: networks.map(parseIpv4SlashPrefix)
    }
}

function parseDeviceGroups(raw: RawConfig): DeviceGroup[] {
    const { groups } = raw
    return Object.entries(groups).map(([name, addresses]) => ({
        name,
        addresses: addresses.map(parseIpv4SlashPrefix)
    }))
}

function parseIpv4SlashPrefix(str: string): [Ipv4Address, Ipv4Address] {
    const [network, prefix] = str.split(/\//)
    return [
        Ipv4AddressUtil.valueOf(network),
        Ipv4AddressUtil.networkMask(parseInt(prefix, 10))
    ]
}
