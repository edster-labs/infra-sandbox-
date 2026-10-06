# Tuning EVE-NG Kernel Bridges & Fixing DHCP Blackouts
<!-- toc -->
## 🎯 Operational Symptoms & Root Cause
By default, standard Linux bridge structures implement a **15-second Spanning Tree Protocol (STP) listening/learning timeout delay** whenever an interface state transitions to "up". During system boot, this latency creates a race condition that blocks virtual nodes from acquiring DHCP leases from external network infrastructure on time.

---

## 🛠️ Resolution Blueprint: Applying the "Instant-On" Patch
Modify the core Linux network interface definitions file (`/etc/network/interfaces`) to apply a hardware-level configuration fix to every operational bridge port (`pnet0` through `pnet3`).

```linux-config
# =========================================================
# Primary Bridged Adapter (Cloud0 / Management Layer)
# =========================================================
iface eth0 inet manual
auto pnet0
iface pnet0 inet dhcp
    pre-up ip link set dev eth0 up
    bridge_hw eth0
    bridge_ports eth0
    bridge_stp off      # MUST be explicitly disabled
    bridge_fd 0         # Sets forward delay to zero seconds
    bridge_maxwait 0
    post-up brctl setfd pnet0 0  # Manual acceleration command

# =========================================================
# Custom Hypervisor Cloud Adapters (VMnet Interconnects)
# =========================================================
iface eth1 inet manual
auto pnet1
iface pnet1 inet manual
    bridge_ports eth1
    bridge_stp off
    bridge_fd 0         # Bypasses the 15-second timeout window
    bridge_maxwait 0

iface eth2 inet manual
auto pnet2
iface pnet2 inet manual
    bridge_ports eth2
    bridge_stp off
    bridge_fd 0         
    bridge_maxwait 0

iface eth3 inet manual
auto pnet3
iface pnet3 inet manual
    bridge_ports eth3
    bridge_stp off
    bridge_fd 0        
    bridge_maxwait 0
```

---

## 🔍 Post-Deployment Verification Commands
To verify that the configuration changes were accepted by the kernel, run these confirmation commands:

```bash
# 1. Force the interface state update (Warning: Drops active SSH sessions)
sudo ip addr flush dev pnet0 && sudo systemctl restart networking

# 2. Check that the active routing table is populated via DHCP
ip route show
# Expected line: default via [Router_IP] dev pnet0 proto dhcp

# 3. Read the localized active lease allocation logs
cat /var/lib/dhcp/dhclient.pnet0.leases
```

---

## ⚠️ Wireless Hypervisor Layer Gotcha (Nested MAC Blocking)
If your parent physical Windows laptop is connected via **Wi-Fi**, standard wireless network cards will block or drop data packets carrying nested MAC addresses generated inside the virtual machines. 

**The Fix:** If connectivity fails after a virtual network adapter adjustment, open your home router administrative portal (`http://192.168.100.1`), renew the virtual MAC address inside the `.vmx` configuration file, and restart the host router to flush out stuck Address Resolution Protocol (ARP) tables.
<!-- endtoc -->
