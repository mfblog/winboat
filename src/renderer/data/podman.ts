import { ComposeConfig } from "../../types";
import { RESTART_ON_FAILURE } from "../lib/constants";

// TODO: investigate whether this approach is even necessary.
export const PODMAN_DEFAULT_COMPOSE: ComposeConfig = {
    name: "winboat",
    volumes: {
        data: null,
    },
    networks: {
        podman: {
            external: true,
        },
    },
    services: {
        windows: {
            image: "ghcr.io/dockur/windows:5.07",
            container_name: "WinBoat_Podman",
            environment: {
                VERSION: "11",
                RAM_SIZE: "4G",
                CPU_CORES: "4",
                DISK_SIZE: "64G",
                USERNAME: "MyWindowsUser",
                PASSWORD: "MyWindowsPassword",
                HOME: "${HOME}",
                LANGUAGE: "English",
                HOST_PORTS: "7149",
                ARGUMENTS: "-qmp tcp:0.0.0.0:7149,server,wait=off",
            },
            cap_add: ["NET_ADMIN"],
            privileged: true,
            ports: [
                "127.0.0.1::8006", // VNC Web Interface
                "127.0.0.1::7148", // Winboat Guest Server API
                "127.0.0.1::7149", // QEMU QMP Port
                "127.0.0.1::3389/tcp", // RDP
                "127.0.0.1::3389/udp", // RDP
            ],
            stop_grace_period: "120s",
            restart: RESTART_ON_FAILURE,
            volumes: [
                "data:/storage",
                "${HOME}:/shared",
                "/dev/bus/usb:/dev/bus/usb:rslave", // QEMU Synamic USB Passthrough
                "./oem:/oem",
            ],
            devices: ["/dev/kvm", "/dev/net/tun", "/dev/bus/usb"],
        },
    },
};
