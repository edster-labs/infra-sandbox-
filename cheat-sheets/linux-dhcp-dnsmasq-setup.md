# Linux Network Administration: Building Isolated DHCP Core Nodes

## 🎯 Purpose
Quick reference command sheets for deploying localized lightweight DHCP address engines (`dnsmasq`) inside private network topologies where no cloud interface exits match.

---

## 🛠️ Step-by-Step Server Deployment Mappings

### 1. Define Static Local Switching Profiles
To act as an authoritative distribution gateway, the network adapter interface must be assigned a fixed, static address block structure:
```bash
# Inject static parameters onto the distribution interface link
sudo ip addr add 192.168.50.1/24 dev ens4
sudo ip link set ens4 up
```

### 2. Install and Initialize the System Service
```bash
# Update package source indexes and acquire the application modules
sudo apt update
sudo apt install dnsmasq-base dnsmasq -y
```

### 3. Service Control Routines
When debugging address assignments, run the service engine in the system foreground to monitor live client lease request messages in real time:

```bash
# Run the application in the foreground for live debugging analysis
sudo dnsmasq -C /etc/dnsmasq.conf -d

# Restart the daemon normally once internal file edits are complete
sudo systemctl restart dnsmasq
```

---

## 📝 Critical Netplan Bridge Optimization Blueprint
If your custom lab environment uses an internal software bridge array loop (`br0`) inside an Ubuntu VM shell to join multiple customer networks, enforce these parameters within `/etc/netplan/01-lab.yaml` to prevent network drop timeouts:

```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens3:
      dhcp4: no
      optional: true    # Prevents a 2-minute system hang during boot
  bridges:
    br0:
      interfaces: [ens3]
      dhcp4: yes
      parameters:
        stp: false      # Netplan equivalent of bridge_stp off
        forward-delay: 0 # Netplan equivalent of bridge_fd 0
```
