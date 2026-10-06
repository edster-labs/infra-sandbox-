<img width="2244" height="1498" alt="ospfv2-single-area" src="https://github.com/user-attachments/assets/f4e68a6b-c02d-4156-8f98-d403e51e4a91" />

# Case Study: OSPFv2 Single-Area Core Topology & VLSM Design
<!-- toc -->
## 🎯 Topology Map
<!-- DRAG AND DROP YOUR TOPOLOGY IMAGE DIRECTLY RIGHT HERE -->

---

## 🗺️ Part 1: VLSM Subnetting Architecture

* **Root Address Block Allocation:** `172.20.15.0/22`
* **Master Network ID:** `172.20.12.0/22` (Calculated block size: 4)

### 📊 The Master VLSM Addressing Matrix
Subnets are mathematically prioritized and allocated sequentially from the largest host requirement tiers down to the point-to-point transit networks:

| Subnet Target Profile | Usable Hosts | CIDR | Block Size | Subnet Mask | Network ID | Usable IP Address Range | Broadcast IP |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| 👥 **Users LAN** | 500 | `/23` | 2 | `255.255.254.0` | `172.20.12.0` | `172.20.12.1` – `172.20.13.254` | `172.20.13.255` |
| 👔 **Managers LAN** | 200 | `/24` | 1 | `255.255.255.0` | `172.20.14.0` | `172.20.14.1` – `172.20.14.254` | `172.20.14.255` |
| 🖥️ **Servers LAN** | 100 | `/25` | 128 | `255.255.255.128` | `172.20.15.0` | `172.20.15.1` – `172.20.15.126` | `172.20.15.127` |
| 🔗 **P2P Link: R1 / R2** | 2 | `/30` | 4 | `255.255.255.252` | `172.20.15.128` | `172.20.15.129` – `172.20.15.130` | `172.20.15.131` |
| 🔗 **P2P Link: R1 / R3** | 2 | `/30` | 4 | `255.255.255.252` | `172.20.15.132` | `172.20.15.133` – `172.20.15.134` | `172.20.15.135` |
| 🔗 **P2P Link: R2 / R4** | 2 | `/30` | 4 | `255.255.255.252` | `172.20.15.136` | `172.20.15.137` – `172.20.15.138` | `172.20.15.139` |
| 🔗 **P2P Link: R3 / R4** | 2 | `/30` | 4 | `255.255.255.252` | `172.20.15.140` | `172.20.15.141` – `172.20.15.142` | `172.20.15.143` |

### 🔍 Binary Calculations & Engineering Log
* **500 Host Requirement Tier:** Borrowed 9 host bits (2⁹ = 512 total bits). Mask calculation: `255.255.11111110.00000000`. Direct block size configuration of 2, starting at base address `172.20.12.0/23`.
* **200 Host Requirement Tier:** Borrowed 8 host bits (2⁸ = 256 total bits). Step up to the next available block boundary: `172.20.14.0/24`. Block size: 1.
* **100 Host Requirement Tier:** Borrowed 7 host bits (2⁷ = 128 total bits). Next available address space: `172.20.15.0/25`. Block size: 128.
* **Point-to-Point Links:** Standardized on `/30` subnets providing exactly 2 usable node interfaces. Mask calculation: `255.255.255.11111100`. Custom block size increments of 4, initializing at boundary `172.20.15.128/30`.

---

## 🛠️ Part 2: OSPFv2 Routing Deployment Strategy

*💡 **Modern Enterprise Best Practice:** Rather than running legacy wildcard calculations using broad `network` commands inside the OSPF sub-configuration routing loop, the protocol is bound directly to active device interfaces. This completely eliminates wildcard calculation overlap vulnerabilities:*

```cisco
R2(config)# interface GigabitEthernet0/1
R2(config-if)# ip ospf 1 area 0
!
R2(config)# interface GigabitEthernet0/4
R2(config-if)# ip ospf 1 area 0
```

---

## 🔍 Part 3: Live Telemetry & Verification Captures (R1 Data Set)

### 1. Neighbor Adjacency Audit (`show ip ospf neighbor`)
Confirm that dynamic protocol discovery successfully logs a stable **`FULL`** synchronization state with all adjacent neighbors:
```text
R1#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
3.3.3.3           1   FULL/BDR        00:00:34    172.20.15.134   GigabitEthernet0/3
2.2.2.2           1   FULL/BDR        00:00:32    172.20.15.130   GigabitEthernet0/2
```

### 2. Active Routing Table Structure Verification (`show ip route`)
Ensure Equal-Cost Multi-Pathing (ECMP) load balancing routes are working, and verify that the local RIB contains exact matches for the VLSM design criteria:
```text
R1#show ip route
Gateway of last resort is 172.20.15.134 to network 0.0.0.0

O*E2  0.0.0.0/0 [110/1] via 172.20.15.134, 00:39:33, GigabitEthernet0/3
                [110/1] via 172.20.15.130, 00:39:33, GigabitEthernet0/2
      1.0.0.0/32 is subnetted, 1 subnets
C        1.1.1.1 is directly connected, Loopback0
      172.20.0.0/16 is variably subnetted, 10 subnets, 5 masks
O        172.20.12.0/23 [110/2] via 172.20.15.134, 00:25:41, GigabitEthernet0/3
O        172.20.14.0/24 [110/2] via 172.20.15.130, 00:27:14, GigabitEthernet0/2
C        172.20.15.0/25 is directly connected, GigabitEthernet0/0
L        172.20.15.1/32 is directly connected, GigabitEthernet0/0
C        172.20.15.128/30 is directly connected, GigabitEthernet0/2
```

### 3. Link-State Database Health Auditing (`show ip ospf database`)
```text
R1#show ip ospf database

            OSPF Router with ID (172.20.15.133) (Process ID 1)

                Router Link States (Area 0)
Link ID         ADV Router      Age         Seq#       Checksum Link count
2.2.2.2         2.2.2.2         863         0x8000000B 0x00D7E1 4
3.3.3.3         3.3.3.3         755         0x8000000B 0x005549 4
4.4.4.4         4.4.4.4         724         0x80000009 0x003B2D 3
172.20.15.133   172.20.15.133   878         0x8000000B 0x004D5D 4

                Type-5 AS External Link States
Link ID         ADV Router      Age         Seq#       Checksum Tag
0.0.0.0         4.4.4.4         498         0x80000003 0x00F4A8 4
```

### 4. Data Plane Inter-Network Connectivity Logs (ICMP Testing Matrix)
```text
R1#ping 172.20.15.134  (R3 Interface Link)     -> !!!!! (100% Success Rate)
R1#ping 172.20.14.11   (Managers Core Network)  -> !!!!! (100% Success Rate)
R1#ping 172.20.12.11   (Users Endpoint Core)    -> !!!!! (100% Success Rate)
```
<!-- endtoc -->
