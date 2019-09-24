import fs from "fs"
import { Ipv4AddressUtil } from "net-decode"
import path from "path"
import { DeviceGroup } from "./types"

/**
 * See: `config.example.json`
 */
interface RawConfig {
    defaultGroup: string
    groups: Record<string, string[]>
}

export interface AppConfig {
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
        groups: parseDeviceGroups(raw.groups)
    }
}

function parseDeviceGroups(groupConfig: Record<string, string[]>): DeviceGroup[] {
    return Object.entries(groupConfig).map(([name, addresses]) => ({
        name,
        addresses: addresses.map(address => {
            const [network, prefix] = address.split(/[/]/)
            return [
                Ipv4AddressUtil.valueOf(network),
                Ipv4AddressUtil.networkMask(parseInt(prefix, 10))
            ]
        })
    }))
}
