# Linux Netplan Interface Configuration

## 🎯 Objective & Environment
*   **Goal:** Add multiple network interfaces (`ens3`, `ens4`, `ens5`) to a Linux system, setting up a mix of DHCP and a static IP with default routing.
*   **Target File:** `/etc/netplan/01-network-manager-all.yaml` (Filename may vary depending on the distribution).

## 🛠️ Configuration Blueprint
Open the netplan configuration file:
```bash
sudo nano /etc/netplan/01-network-manager-all.yaml
```

Paste or modify the network configuration layout:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens3:
      dhcp4: true
      optional: true
    ens4:
      dhcp4: true
      optional: true
    ens5:
      dhcp4: no
      optional: true             
      addresses:
        - 192.168.1.100/24
      routes:
        - to: default
          via: 192.168.1.1
      nameservers:
        addresses:
```

## 🔍 Verification & Application Commands
After saving the changes, apply and test the configuration:
* `sudo netplan try` -> Safely tests the configuration and rolls back if connectivity is lost.
* `sudo netplan apply` -> Forces the changes to take effect immediately.
* `ip a` -> Verifies the new IP addresses are properly bound to `ens3`, `ens4`, and `ens5`.

## ⚠️ Known Issues & Operational Best Practices
*   **The Boot Delay Gotcha:** Always append `optional: true` to any interface that is not strictly mandatory for core system functionality. If omitted, Ubuntu will flag the interface as critical and force a **2-minute boot delay** while waiting for a link status that might never come online.
*   **YAML Indentation Warning:** YAML is strictly sensitive to spacing. Never use the `Tab` key; always use regular spaces for indentation, otherwise Netplan will throw a parsing error during application.
