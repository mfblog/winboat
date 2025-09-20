import { InstallConfiguration } from "../../types";

export function getPodmanRun(conf: InstallConfiguration) {
  return `podman run --replace -d --name WinBoat \
    --privileged \
    --device /dev/kvm \
    --cap-add NET_ADMIN \
    --network slirp4netns:port_handler=slirp4netns \
    -p 8006:8006 \
    -p 7148:7148 \
    -p 7149:7149 \
    -p 3389:3389/tcp \
    -p 3389:3389/udp \
    -v data:/storage \
    -v $HOME:/shared \
    -v /dev/bus/usb:/dev/bus/usb \
    -v ./oem:/oem \
    ${conf.customIsoPath && `-v ${conf.customIsoPath}:/boot.iso`} \`
    -e VERSION=${conf.windowsVersion || 11} \
    -e RAM_SIZE=${conf.ramGB || 4}G \
    -e CPU_CORES=${conf.cpuThreads || 4} \
    -e DISK_SIZE=${conf.diskSpaceGB || 64}G \
    -e USERNAME=${conf.username || "MyWindowsUser"} \
    -e PASSWORD=${conf.password || "MyWindowsPassword"} \
    -e HOME=$HOME \
    -e LANGUAGE=${conf.windowsLanguage || "English"} \
    -e ARGUMENTS="-cpu host,arch_capabilities=off -qmp tcp:0.0.0.0:7149,server,wait=off" \
    ghcr.io/dockur/windows:4.35`
}


/**
 * TODO - I don't think this'd be needed at all - the run script is probably going to be way more
 * convenient to manage
 * Might be best to generate (podman kube generate WinBoat) to generate the kube yaml from one
 * that's been created via the run script instead.
 * 
 * # Save the output of this file and use kubectl create -f to import
 * it into Kubernetes.
 *
 * Created with podman-5.6.1
 * NOTE: If you generated this yaml from an unprivileged and rootless podman container on an SELinux
 * enabled system, check the podman generate kube man page for steps to follow to ensure that your
 * pod/container has the right permissions to access the volumes added.
 */
export function getPodmanKube(conf: InstallConfiguration) {
  return `apiVersion: v1 \
kind: Pod \
metadata: \
  creationTimestamp: "2025-09-20T15:30:33Z" \
  labels: \
    app: WinBoat-pod \
  name: WinBoat-pod \
spec: \
  containers: \
  - env: \
    - name: VERSION \
      value: ${conf.windowsVersion || 11} \
    - name: PASSWORD \
      value: ${conf.password || "MyWindowsPassword"} \
    - name: LANGUAGE \
      value: ${conf.windowsLanguage || "English"} \
    - name: HOME \
      value: $HOME \
    - name: USERNAME \
      value: ${conf.username || "MyWindowsUser"} \
    - name: ARGUMENTS \
      value: -cpu host,arch_capabilities=off -qmp tcp:0.0.0.0:7149,server,wait=off \
    - name: CPU_CORES \
      value: ${conf.cpuThreads || 4} \
    - name: RAM_SIZE \
      value: ${conf.ramGB || 4}G \
    - name DISK_SIZE \
      value: ${conf.diskSpaceGB || 64}G \
    image: ghcr.io/dockur/windows:4.35 \
    name: WinBoat \
    ports: \
    - containerPort: 3389 \
      hostPort: 3389 \
    - containerPort: 7148 \
      hostPort: 7148 \
    - containerPort: 7149 \
      hostPort: 7149 \
    - containerPort: 8006 \
      hostPort: 8006 \
    - containerPort: 3389 \
      hostPort: 3389 \
      protocol: UDP \
    securityContext: \
      privileged: true \
      procMount: Unmasked \
    volumeMounts: \
    - mountPath: /dev/bus/usb \
      name: dev-bus-usb-host-0 \
    - mountPath: /oem \
      name: home-$USER-.winboat-oem-host-1 \
    - mountPath: /shared \
      name: home-$USER-host-2 \
    - mountPath: /storage \
      name: data-pvc \
  volumes: \
  - hostPath: \
      path: /dev/bus/usb \
      type: Directory \
    name: dev-bus-usb-host-0 \
  - hostPath: \
      path: $HOME/.winboat/oem \
      type: Directory \
    name: home-$USER-.winboat-oem-host-1 \
  - hostPath: \
      path: $HOME \
      type: Directory \
    name: home-$USER-host-2 \
  - name: data-pvc \
    persistentVolumeClaim: \
      claimName: data`
}