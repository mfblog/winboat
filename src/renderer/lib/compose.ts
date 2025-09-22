import { type PortConfiguration } from "../../types";
import { WINBOAT_DIR } from "./constants";
const fs: typeof import('fs') = require('fs');
const path: typeof import('path') = require('path');
const YAML: typeof import('yaml') = require('yaml');

export function getPortConfigurationFromCompose(): PortConfiguration | null {
    try {
        const composeFilePath = path.join(WINBOAT_DIR, 'docker-compose.yml');
        if (!fs.existsSync(composeFilePath)) {
            return null;
        }
        
        const composeContent = fs.readFileSync(composeFilePath, 'utf8');
        const composeConfig = YAML.parse(composeContent) as any;
        
        const ports = composeConfig.services.windows.ports;
        
        // Extract port numbers from port mappings
        const rdpTcpPort = parseInt(ports.find((p: string) => p.includes(':3389/tcp'))?.split(':')[0] || '3389');
        const rdpUdpPort = parseInt(ports.find((p: string) => p.includes(':3389/udp'))?.split(':')[0] || '3389');
        
        // Validate that RDP TCP and UDP ports match
        if (rdpTcpPort !== rdpUdpPort) {
            console.error('RDP TCP and UDP ports do not match in compose file');
            throw new Error('RDP TCP and UDP ports do not match in compose file');
        }
        
        const vncWebPort = parseInt(ports.find((p: string) => p.endsWith(':8006'))?.split(':')[0] || '8006');
        const guestApiPort = parseInt(ports.find((p: string) => p.endsWith(':7148'))?.split(':')[0] || '7148');
        const qemuQmpPort = parseInt(ports.find((p: string) => p.endsWith(':7149'))?.split(':')[0] || '7149');
        
        return {
            rdpPort: rdpTcpPort,
            vncWebPort,
            guestApiPort,
            qemuQmpPort
        };
    } catch (error) {
        console.error('Failed to read port configuration from compose file:', error);
        return null;
    }
}