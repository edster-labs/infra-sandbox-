# EVE-NG to VMware Interface Matrix & Topology Bridging
<!-- toc -->
## 🎯 Objective & Environment
* **Purpose:** Document the exact mapping between EVE-NG virtual clouds, physical VMware adapters, Linux interfaces, and network subnets.
* **Environment:** EVE-NG Community VM deployed on VMware Workstation.

## 🏆 The Master Topology Interface Map
Use this matrix to trace data paths from external virtual subnets through the hypervisor down into the lab environment:

| EVE Cloud | VMware NIC | Linux Interface | Network Subnet | Network Profile Type | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cloud0** | NIC 1 | `ens3` (`eth0`) | `192.168.36.0/24` | NAT / Host Mgmt | Static EVE Management IP: `.138` |
| **Cloud1** | NIC 2 | `ens4` (`eth1`) | `192.168.213.0/24`| Custom (`VMnet2`) | Isolated Host-Only segment |
| **Cloud2** | NIC 3 | `ens5` (`eth2`) | `192.168.36.0/24` | NAT (`VMnet8`) | Shared NAT bridge segment |
| **Cloud3** | NIC 4 | `ens6` (`eth3`) | `192.168.88.0/24` | Custom (`VMnet1`) | Isolated Host-Only segment |

*⚠️ **The NAT Twin Alert:** Cloud0 and Cloud2 both lease IP addresses from the `192.168.36.x` pool because they terminate on the same hypervisor `VMnet8` interface framework.*

---

## 🛠️ Linux Kernel Bridge Configuration (`/etc/network/interfaces`)
The following configuration baseline establishes native Linux bridge ports (`pnet`) bound to the underlying virtual hardware adapters:

```linux-config
# =========================================================
# Cloud0 - Core Management Bridge (Static Layout)
# =========================================================
auto pnet0
iface pnet0 inet static
    address 192.168.36.138
    netmask 255.255.255.0
    gateway 192.168.36.2
    dns-nameservers 8.8.8.8 1.1.1.1
    bridge_ports eth0
    bridge_stp off
    bridge_fd 0
    bridge_maxwait 0
    pre-up ip link set dev eth0 up
    post-up brctl setfd pnet0 0

# =========================================================
# Cloud1 through Cloud3 - Passthrough Virtual Switching
# =========================================================
auto pnet1
iface pnet1 inet manual
    bridge_ports eth1
    bridge_stp off
    bridge_fd 0           # Instant forwarding for lab nodes
    bridge_maxwait 0

auto pnet2
iface pnet2 inet manual
    bridge_ports eth2
    bridge_stp off
    bridge_fd 0           
    bridge_maxwait 0

auto pnet3
iface pnet3 inet manual
    bridge_ports eth3
    bridge_stp off
    bridge_fd 0        
    bridge_maxwait 0
```

## 🔍 Active Verification Data (`ip a` Output)
Live interface verification capture inside a running test node (`Lubuntu-PC`):
```bash
ed@Lubuntu-PC:~\$ ip a
2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.36.136/24 metric 100 brd 192.168.36.255 scope global dynamic ens3
3: ens4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.213.128/24 metric 100 brd 192.168.213.255 scope global dynamic ens4
4: ens5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.36.139/24 metric 100 brd 192.168.36.255 scope global dynamic ens5
5: ens6: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.88.131/24 metric 100 brd 192.168.88.255 scope global dynamic ens6
```
<!-- endtoc -->
