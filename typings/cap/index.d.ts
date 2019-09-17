declare module "cap" {
    import { EventEmitter } from "events"

    export interface CapDevice {
        name: string
        description: string
        addresses: CapDeviceAddr[]
        /**
         * eg. `"PCAP_IF_LOOPBACK"`
         */
        flags?: string
    }

    export interface CapDeviceAddr {
        addr: string
        netmask?: string
        broadaddr?: string
    }

    /**
     * A packet nbytes in size was captured. truncated indicates if the entire packet did not fit inside the Buffer
     * supplied to open()
     */
    export type CapListener = (nbytes: number, truncated: boolean) => void

    export class Cap extends EventEmitter {
        /**
         * If ip is given, the (first) device name associated with ip, or undefined is returned if not found. If ip is
         * not given, the device name of the first non-loopback device is returned
         */
        static findDevice(ip?: string): string | undefined

        /**
         * Returns a list of available devices and related information
         */
        static deviceList(): CapDevice[]

        /**
         * Creates and returns a new Cap instance
         */
        constructor()

        /**
         * Opens device and starts capturing packets using filter. To see the syntax for filter check pcap-filter man
         * page (http://www.tcpdump.org/manpages/pcap-filter.7.html). bufSize is the size of the internal buffer that
         * libpcap uses to temporarily store packets until they are emitted. buffer is a Buffer large enough to store
         * one packet. If open() is called again without a previous call to close(), an implicit close() will occur
         * first
         *
         * @return eg. `"ETHERNET"`
         * @throws if the device doesn't exist
         */
        open(device: string, filter: string, bufSize: number, buffer: Buffer): string

        /**
         * Stops capturing
         */
        close(): void

        /**
         * (Windows ONLY) This sets the minimum number of packet bytes that must be captured before the full packet data
         * is made available. If this value is set too high, you may not receive any packets until WinPCap's internal
         * buffer fills up. Therefore it's generally best to pass in 0 to this function after calling open(), despite it
         * resulting in more syscalls
         */
        setMinBytes?(bytes: number): void

        /**
         * Sends an arbitrary, raw packet on the opened device. nBytes is the number of bytes in buffer to send
         * (starting from position 0) and defaults to buffer.length
         *
         * @throws if the underlying device doesn't support pcap_sendpacket
         */
        send(buffer: Buffer, length?: number): void

        /**
         * Add an event listener for recieved packets
         */
        on(event: "packet", listener: CapListener): this
    }

    export const decoders: {
        PROTOCOL: ProtocolConstants

        Ethernet: (b: Buffer, offset?: number) => object

        ICMPV4: (b: Buffer, nbytes: number, offset?: number) => object
        IPV4: (b: Buffer, offset?: number) => object
        IPV6: (b: Buffer, offset?: number) => object

        ARP: (b: Buffer, offset?: number) => object
        SCTP: (b: Buffer, nbytes: number, offset?: number) => object
        TCP: (b: Buffer, offset?: number) => object
        UDP: (b: Buffer, offset?: number) => object
    }

    type ProtocolConstants = {
        ETHERNET: Record<number, string> & Record<string, number>
        IP: Record<number, string> & Record<string, number>
    }
}
