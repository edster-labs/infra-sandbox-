# Case Study: OSPFv2 Multi-Area Enterprise Topology & High-Availability Core

<section style="max-width: 720px !important; margin: 16px 0 28px 0 !important;">

This lab documents the design, Variable Length Subnet Masking (VLSM) allocation, and deployment of a multi-area OSPFv2 enterprise network. Building upon single-area fundamentals, this topology introduces inter-area segmentation (**Area 0** and **Area 10**), dual-ISP WAN failover via Type-5 External LSAs, HSRP first-hop redundancy, LACP EtherChannel switching, centralized DHCP relay services, and Linux active-backup NIC bonding.

</section>

---

## 🗺️ Network Topology & Logical Design

<img width="3692" height="1721" alt="multi-area-ospf" src="https://github.com/user-attachments/assets/3e108a14-71d2-4670-9d89-d67a850b3887" />


### 1. Architecture & Core Technologies
* **Multi-Area OSPF (`router ospf 1`):** Segmented into **Area 0 (Backbone)** and **Area 10**, bridged by **R11** operating as the Area Border Router (ABR) with deterministic static Router IDs (`1.1.1.1` through `33.33.33.33`).
* **Redundant Backbone Transit:** Routers **R1, R2, R3, and R11** dual-home into two isolated Layer 2 switches (**L2-SW1** and **L2-SW2**), forming independent OSPF Broadcast Multi-Access transit segments with Equal-Cost Multi-Path (ECMP) load balancing.
* **Dual-ISP WAN Failover:** **R1** acts as the primary internet exit (`default-information originate`, seed metric `1`), while **R22** serves as an automatic cold-standby backup exit (`default-information originate metric 10`).
* **Access Layer & Gateway Redundancy:**
  * **ASW1** and **ASW2** interconnect via a 2-link LACP EtherChannel (`Po1`) carrying 802.1Q tagged VLANs `20` and `30` with native VLAN `999` and VLAN `1` pruned.
  * **R2** (`Gi0/0`) and **R3** (`Gi0/0`) operate Router-on-a-Stick (ROAS) subinterfaces running **HSRP** to provide redundant virtual default gateways (`172.25.12.3` for VLAN 20 and `172.25.13.3` for VLAN 30).
* **Centralized DHCP & Relay:** **R11** acts as the centralized DHCP server for all three LAN segments, while **R2, R3, and R33** forward client broadcasts across OSPF areas via `ip helper-address`.
* **Server High Availability (Linux NIC Bonding):** The Lubuntu server (`Servers_LAN30`) dual-homes across ASW1 and ASW2 using Netplan `active-backup` (`bond0` on `ens4`/`ens5`) while isolating `ens3` for out-of-band management via route metric tuning (`500` vs. `100`).

---

## 📊 Verified VLSM Addressing Plan (`172.25.10.0/17` Block)

Starting from the `172.25.10.0/17` (`255.255.128.0`) address block, subnets were allocated from largest host requirement to smallest:
* **Users (`500` usable hosts):** Borrowed 9 host bits ($2^9 - 2 = 510$ usable IPs) → `/23`
* **Managers (`200` usable hosts):** Borrowed 8 host bits ($2^8 - 2 = 254$ usable IPs) → `/24`
* **Servers (`100` usable hosts):** Borrowed 7 host bits ($2^7 - 2 = 126$ usable IPs) → `/25`
* **Backbone Transit & P2P Links:** Allocated `/29` subnets for multi-access broadcast segments and `/30` subnets for point-to-point links.

| Segment / Link | OSPF Area | Subnet / CIDR | Subnet Mask | Usable Host Range | Broadcast IP | Device & Gateway Assignments |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Users_LAN10** | Area 10 | `172.25.10.0/23` | `255.255.254.0` | `.10.1` – `.11.254` | `.11.255` | **R33** ROAS `.10.1` (DHCP Relay to R11) |
| **Managers_LAN20** | Area 0 | `172.25.12.0/24` | `255.255.255.0` | `.12.1` – `.12.254` | `.12.255` | **R2** (`.12.1`), **R3** (`.12.2`), **HSRP VIP** `.12.3` |
| **Servers_LAN30** | Area 0 | `172.25.13.0/25` | `255.255.255.128` | `.13.1` – `.13.126` | `.13.127` | **R2** (`.13.1`), **R3** (`.13.2`), **HSRP VIP** `.13.3` |
| **L2-SW1 Transit** | Area 0 | `172.25.13.128/29` | `255.255.255.248` | `.13.129` – `.13.134` | `.13.135` | **R1** (`.129`), **R2** (`.130`), **R3** (`.131`), **R11** (`.132`) |
| **L2-SW2 Transit** | Area 0 | `172.25.13.136/29` | `255.255.255.248` | `.13.137` – `.13.142` | `.13.143` | **R1** (`.137`), **R2** (`.138`), **R3** (`.139`), **R11** (`.140`) |
| **R11 ↔ R22 (P2P)** | Area 10 | `172.25.13.144/30` | `255.255.255.252` | `.13.145` – `.13.146` | `.13.147` | **R11** (`.145`), **R22** (`.146`) |
| **R11 ↔ R33 (P2P)** | Area 10 | `172.25.13.148/30` | `255.255.255.252` | `.13.149` – `.13.150` | `.13.151` | **R11** (`.149`), **R33** (`.150`) |
| **R22 ↔ R33 (Serial)** | Area 10 | `172.25.13.152/30` | `255.255.255.252` | `.13.153` – `.13.154` | `.13.155` | **R22** (`.153`), **R33** (`.154`) on `Serial1/2`–`1/3` |

---

## ⚙️ OSPF Network Types Reference

| OSPF Network Type | Dynamic Discovery | Packet Transmission | Uses DR / BDR? | Topology Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Broadcast** | Yes (via Hellos) | Multicast (`224.0.0.5`, `224.0.0.6`) | **Yes** | Backbone transit switches (`L2-SW1`, `L2-SW2`) & Ethernet P2P links |
| **Point-to-Point** | Yes (via Hellos) | Multicast (`224.0.0.5`) | **No** | Serial link between `R22` and `R33` (`Serial1/2`–`1/3`) |
| **Non-Broadcast (NBMA)** | No (Manual neighbor) | Unicast | **Yes** | Legacy Frame Relay / ATM multipoint clouds |
| **Point-to-Multipoint** | Yes (via Hellos) | Multicast (`224.0.0.5`) | **No** | Hub-and-spoke topologies without DR/BDR overhead |
| **P2MP Non-Broadcast** | No (Manual neighbor) | Unicast | **No** | Hub-and-spoke environments blocking multicast |

---

## 🖥️ Server High-Availability Configuration (Linux Netplan)

To eliminate single-switch failure at the server tier, `Servers_LAN30` uses an **active-backup bond (`bond0`)** across `ens4` (connected to `ASW1`) and `ens5` (connected to `ASW2`). The out-of-band management NIC (`ens3`) is assigned a higher DHCP route metric (`500`) so production and internet traffic strictly traverse `bond0` (`metric 100`).

### Netplan Configuration (`/etc/netplan/01-network-manager-all.yaml`)
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    ens3:
      dhcp4: yes
      dhcp4-overrides:
        route-metric: 500
      optional: true
    ens4:
      dhcp4: no
    ens5:
      dhcp4: no
  bonds:
    bond0:
      interfaces:
        - ens4
        - ens5
      dhcp4: yes
      parameters:
        mode: active-backup
        primary: ens4
        mii-monitor-interval: 100
```

### Routing Table Verification (`ip route`)
```text
default via 172.25.13.3 dev bond0 proto dhcp src 172.25.13.13 metric 100 
default via 192.168.36.2 dev ens3 proto dhcp src 192.168.36.154 metric 500 
8.8.8.8 via 172.25.13.3 dev bond0 proto dhcp src 172.25.13.13 metric 100 
172.25.13.0/25 dev bond0 proto kernel scope link src 172.25.13.13 metric 100 
172.25.13.3 dev bond0 proto dhcp scope link src 172.25.13.13 metric 100 
192.168.36.0/24 dev ens3 proto kernel scope link src 192.168.36.154 metric 500 
192.168.36.2 dev ens3 proto dhcp scope link src 192.168.36.154 metric 500 
```

---

## 📜 Relevant Device Configurations

Click any device below to expand its active interfaces, routing protocols, HSRP groups, and switching rules.

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🌐 R1 — Primary WAN Gateway & Area 0 Backbone Router</summary>

 ```ios
hostname R1
!
interface GigabitEthernet0/0
 description Primary ISP WAN (DHCP)
 ip address dhcp
 no shutdown
!
interface GigabitEthernet0/1
 description Transit to L2-SW1 (Area 0)
 ip address 172.25.13.129 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
interface GigabitEthernet0/2
 description Transit to L2-SW2 (Area 0)
 ip address 172.25.13.137 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
router ospf 1
 router-id 1.1.1.1
 default-information originate
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🔀 R2-dhcp-relay — ROAS, HSRP Primary (VLAN 20) & Area 0 Backbone</summary>

 ```ios
hostname R2-dhcp-relay
!
interface GigabitEthernet0/0
 description Trunk Uplink to ASW1
 no ip address
 no shutdown
!
interface GigabitEthernet0/0.20
 description Managers_LAN20 Gateway (HSRP Active)
 encapsulation dot1Q 20
 ip address 172.25.12.1 255.255.255.0
 ip helper-address 172.25.13.140
 ip helper-address 172.25.13.132
 standby version 2
 standby 20 ip 172.25.12.3
 standby 20 priority 110
 standby 20 preempt
 ip ospf 1 area 0
!
interface GigabitEthernet0/0.30
 description Servers_LAN30 Gateway (HSRP Standby)
 encapsulation dot1Q 30
 ip address 172.25.13.1 255.255.255.128
 ip helper-address 172.25.13.140
 ip helper-address 172.25.13.132
 standby version 2
 standby 30 ip 172.25.13.3
 standby 30 preempt
 ip ospf 1 area 0
!
interface GigabitEthernet0/1
 description Transit to L2-SW1 (Area 0)
 ip address 172.25.13.130 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
interface GigabitEthernet0/2
 description Transit to L2-SW2 (Area 0)
 ip address 172.25.13.138 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
router ospf 1
 router-id 2.2.2.2
 passive-interface GigabitEthernet0/0.20
 passive-interface GigabitEthernet0/0.30
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🔀 R3-dhcp-relay — ROAS, HSRP Primary (VLAN 30) & Area 0 Backbone</summary>

 ```ios
hostname R3-dhcp-relay
!
interface GigabitEthernet0/0
 description Trunk Uplink to ASW2
 no ip address
 no shutdown
!
interface GigabitEthernet0/0.20
 description Managers_LAN20 Gateway (HSRP Standby)
 encapsulation dot1Q 20
 ip address 172.25.12.2 255.255.255.0
 ip helper-address 172.25.13.140
 ip helper-address 172.25.13.132
 standby version 2
 standby 20 ip 172.25.12.3
 standby 20 preempt
 ip ospf 1 area 0
!
interface GigabitEthernet0/0.30
 description Servers_LAN30 Gateway (HSRP Active)
 encapsulation dot1Q 30
 ip address 172.25.13.2 255.255.255.128
 ip helper-address 172.25.13.140
 ip helper-address 172.25.13.132
 standby version 2
 standby 30 ip 172.25.13.3
 standby 30 priority 110
 standby 30 preempt
 ip ospf 1 area 0
!
interface GigabitEthernet0/1
 description Transit to L2-SW1 (Area 0)
 ip address 172.25.13.131 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
interface GigabitEthernet0/2
 description Transit to L2-SW2 (Area 0)
 ip address 172.25.13.139 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
router ospf 1
 router-id 3.3.3.3
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🏛️ R11-dhcp-server — Area Border Router (ABR Area 0 / Area 10) & Central DHCP Server</summary>

 ```ios
hostname R11-dhcp-server
!
ip dhcp excluded-address 172.25.10.1 172.25.10.10
ip dhcp excluded-address 172.25.12.1 172.25.12.10
ip dhcp excluded-address 172.25.13.1 172.25.13.10
!
ip dhcp pool vlan10
 network 172.25.10.0 255.255.254.0
 default-router 172.25.10.1
 dns-server 8.8.8.8
!
ip dhcp pool vlan20
 network 172.25.12.0 255.255.255.0
 default-router 172.25.12.3
 dns-server 8.8.8.8
!
ip dhcp pool vlan30
 network 172.25.13.0 255.255.255.128
 default-router 172.25.13.3
 dns-server 8.8.8.8
!
interface GigabitEthernet0/0
 description Transit to L2-SW2 (Area 0)
 ip address 172.25.13.140 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
interface GigabitEthernet0/1
 description Transit to L2-SW1 (Area 0)
 ip address 172.25.13.132 255.255.255.248
 ip ospf 1 area 0
 no shutdown
!
interface GigabitEthernet0/2
 description P2P Link to R22 (Area 10)
 ip address 172.25.13.145 255.255.255.252
 ip ospf 1 area 10
 no shutdown
!
interface GigabitEthernet0/3
 description P2P Link to R33 (Area 10)
 ip address 172.25.13.149 255.255.255.252
 ip ospf 1 area 10
 no shutdown
!
router ospf 1
 router-id 11.11.11.11
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🌐 R22 — Backup WAN Exit (Type-5 External Metric 10) & Area 10 Router</summary>

 ```ios
hostname R22
!
interface Ethernet0/0
 description Backup ISP WAN (DHCP)
 ip address dhcp
 no shutdown
!
interface Ethernet0/1
 description P2P Link to R11 (Area 10)
 ip address 172.25.13.146 255.255.255.252
 ip ospf 1 area 10
 no shutdown
!
interface Serial1/3
 description Serial P2P Link to R33 (Area 10)
 ip address 172.25.13.153 255.255.255.252
 ip ospf 1 area 10
 no shutdown
!
router ospf 1
 router-id 22.22.22.22
 default-information originate metric 10
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🔀 R33-dhcp-relay — Area 10 Edge Router & Users_LAN10 Gateway</summary>
 
```ios
hostname R33-dhcp-relay
!
interface Ethernet0/0
 description Trunk Uplink to ASW11
 no ip address
 no shutdown
!
interface Ethernet0/0.10
 description Users_LAN10 Gateway & DHCP Relay
 encapsulation dot1Q 10
 ip address 172.25.10.1 255.255.254.0
 ip helper-address 172.25.13.149
 ip ospf 1 area 10
!
interface Ethernet0/1
 description P2P Link to R11 (Area 10)
 ip address 172.25.13.150 255.255.255.252
 ip ospf 1 area 10
 no shutdown
!
interface Serial1/2
 description Serial P2P Link to R22 (Area 10)
 ip address 172.25.13.154 255.255.255.252
 ip ospf 1 area 10
 no shutdown
!
router ospf 1
 router-id 33.33.33.33
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
 🔌 ASW1 — Access Switch 1 (LACP Po1, VLANs 20/30, PortFast & BPDU Guard)</summary>

 ```ios
hostname ASW1
spanning-tree mode pvst
!
interface Port-channel1
 description LACP Inter-Switch Trunk to ASW2
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 20,30
 switchport mode trunk
 switchport nonegotiate
!
interface GigabitEthernet0/0
 description Access Port - Managers_LAN20 (VLAN 20)
 switchport access vlan 20
 switchport mode access
 spanning-tree portfast edge
 spanning-tree bpduguard enable
!
interface GigabitEthernet0/2
 description Trunk Uplink to R2
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 20,30
 switchport mode trunk
!
interface GigabitEthernet0/3
 description Access Port - Servers_LAN30 bond0 Primary (VLAN 30)
 switchport access vlan 30
 switchport mode access
 switchport nonegotiate
 spanning-tree portfast edge
 spanning-tree bpduguard enable
!
interface range GigabitEthernet1/0 - 1
 description LACP Members to ASW2
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 20,30
 switchport mode trunk
 switchport nonegotiate
 channel-protocol lacp
 channel-group 1 mode active
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
 🔌 ASW2 — Access Switch 2 (LACP Po1, VLANs 20/30, PortFast & BPDU Guard)</summary>

 ```ios
hostname ASW2
spanning-tree mode pvst
!
interface Port-channel1
 description LACP Inter-Switch Trunk to ASW1
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 20,30
 switchport mode trunk
 switchport nonegotiate
!
interface range GigabitEthernet0/0 - 1
 description LACP Members to ASW1
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 20,30
 switchport mode trunk
 switchport nonegotiate
 channel-protocol lacp
 channel-group 1 mode active
!
interface GigabitEthernet0/2
 description Trunk Uplink to R3
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 20,30
 switchport mode trunk
 switchport nonegotiate
!
interface GigabitEthernet0/3
 description Access Port - Servers_LAN30 bond0 Backup (VLAN 30)
 switchport access vlan 30
 switchport mode access
 switchport nonegotiate
 spanning-tree portfast edge
 spanning-tree bpduguard enable
```

</details>

<details markdown="1" style="cursor: pointer; margin-bottom: 10px;">
<summary style="font-weight: bold; color: #38bdf8;">
🔌 ASW11 — Area 10 Access Switch (VLAN 10, PortFast & BPDU Guard)</summary>

```ios
hostname ASW11
spanning-tree mode pvst
!
interface GigabitEthernet0/0
 description Access Port - Users_LAN10 (VLAN 10)
 switchport access vlan 10
 switchport mode access
 switchport nonegotiate
 spanning-tree portfast edge
 spanning-tree bpduguard enable
!
interface GigabitEthernet0/3
 description Trunk Uplink to R33
 switchport trunk encapsulation dot1q
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10
 switchport mode trunk
 switchport nonegotiate
```
</details>

## 🔍 Key Milestones & Troubleshooting Wins
* Area 10 & Serial P2P Verification: Verified EVE-NG hypervisor clocking on Serial1/3, confirmed POINT_TO_POINT vs. BROADCAST OSPF network types, and standardized clean static Router IDs (1.1.1.1–33.33.33.33) across all routers.
* WAN Failover & Type-5 LSA Analysis: Tested shutting down R1's primary WAN interface (Gi0/0), verified R22 automatically injected its backup Type-5 External LSA (O*E2 0.0.0.0/0 [110/10]) once R1's primary default route ([110/1]) withdrew, and confirmed uninterrupted external reachability (8.8.8.8 / 1.1.1.1).
* Layer 2 vs. Layer 3 Gateway Separation: Proved that L2 access switches (ASW1) forward client frames transparently without requiring an ip default-gateway for data-plane transit, which isolated and resolved a missing default-router parameter in R11's centralized DHCP pool.
* Access Layer Topology Simplification: Removed redundant diagonal router uplinks (Gi0/3), relying on single 802.1Q trunk uplinks per router (R2 → ASW1 and R3 → ASW2) bridged cleanly by the Po1 LACP inter-switch trunk.
* End-to-End Connectivity & DHCP Relay: Verified full DORA DHCP leases and cross-area ICMP reachability between Users_LAN10 (172.25.10.11/23), Managers_LAN20 (172.25.12.12/24), and Servers_LAN30 (172.25.13.13/25).

## 📝Note:
In order to achieve full mesh between R2/R3 and ASW1/ASW2 without causing IP subnet overlaps or Spanning Tree loops one way is to use so called <BR> Multi-Chassis EtherChannel (MEC) technologies—specifically StackWise Virtual or Virtual Switching System (VSS) on Catalyst switches, or vPC (Virtual Port Channel) on Nexus switches.

### How It Works in Enterprise Hardware
* The Core Concept: Normally, a router cannot bundle two links into a single Layer 3 Port-Channel if those links go to two different physical switches.
* The Solution: Technologies like VSS, StackWise Virtual, or vPC merge ASW1 and ASW2 at the control plane so they act as a single logical switch to connected devices.
* The Result: R2 can bundle its links to ASW1 and ASW2 into a single Port-Channel1 (with .20 and .30 subinterfaces sitting on Po1), and R3 can do the exact same thing with its own Port-Channel1. This creates a true active-active full mesh with zero wasted IP addresses and zero STP blocked ports.

### Why this Lab Doesn't Support It
* Virtual images in EVE-NG like vIOS / IOL do not support VSS, StackWise Virtual, or vPC (those require specialized hardware ASICs or NX-OS/Catalyst 9000v images).
* That is why using a single uplink per router (R2 → ASW1 and R3 → ASW2) bridged by LACP EtherChannel (Po1) between the switches was the cleanest workaround for an EVE-NG vIOS lab!


## 🚀 Planned Lab Expansion (Phase 2)
* Dual-Process OSPF Redistribution: Introduce a secondary OSPF process (router ospf 2) on the boundary edge to simulate multi-domain route redistribution and administrative distance tuning.
