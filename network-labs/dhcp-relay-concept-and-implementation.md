## Topology & Data Flow Map

<img width="2358" height="1252" alt="dhcp-relay-lab" src="https://github.com/user-attachments/assets/98b2d5af-b1f2-4495-b9b8-9ddfa4fdcd93" />

# Basic and conceptual Layer 3 DHCP Relay Reference Architecture

## 🎯 Lab Objective
Document a scalable enterprise infrastructure design inside an EVE-NG environment hosted on VMware Workstation. This documentation highlights how to configure a centralized DHCP server (Router) to dynamically allocate IP addresses to multiple downstream segments across a single Layer 3 transit link, eliminating redundant physical cabling.

## 🛠 Active Network Configurations

### 1. Centralized DHCP Server (Router Node)
```text
ip dhcp excluded-address 192.168.1.1 192.168.1.10
ip dhcp excluded-address 192.168.10.1 192.168.10.10
ip dhcp excluded-address 172.16.20.1 172.16.20.10
ip dhcp excluded-address 192.168.30.1 192.168.30.10
!
ip dhcp pool SVI_10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
!
ip dhcp pool SVI_20
 network 172.16.20.0 255.255.255.0
 default-router 172.16.20.1
 dns-server 8.8.8.8
!
ip dhcp pool SVI_30
 network 192.168.30.0 255.255.255.0
 default-router 192.168.30.1
 dns-server 1.1.1.1
!
interface GigabitEthernet0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
# Core Return Paths back to the Switch Transit Link
ip route 192.168.10.0 255.255.255.0 192.168.1.11
ip route 172.16.20.0 255.255.255.0 192.168.1.11
ip route 192.168.30.0 255.255.255.0 192.168.1.11
```

### 2. Multi-Layer Distribution Core (Switch Node)
```text
interface GigabitEthernet0/0
 no switchport
 ip address dhcp
 negotiation auto
!
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
 ip helper-address 192.168.1.1
!
interface Vlan20
 ip address 172.16.20.1 255.255.255.0
 ip helper-address 192.168.1.1
!
interface Vlan30
 ip address 192.168.30.1 255.255.255.0
 ip helper-address 192.168.1.1
```
---

## ⚡ Quick Protocol Summary: The Blueprint Flow

When an end-host requests an IP address across an enterprise relay architecture, the handshake executes through these three precise sequence steps:

1. **The Client Broadcast:** The Virtual PC (VPC) shoots out a blind `DHCPDISCOVER` broadcast frame. Because it does not possess an IP identity yet, the packet's internal **`GIADDR`** field is populated as **`0.0.0.0`**.
2. **The Switch Interception:** The Layer 3 Switch catches the local broadcast on its access port. It activates the relay agent, converts the broadcast into a targeted Layer 3 routed unicast packet, and explicitly writes its own local SVI IP address (**`192.168.30.1`**) straight into the **`GIADDR`** field slot before routing it upstream.
3. **The Router Scope Selection:** The Central Router receives the unicast packet. It completely ignores the physical wire interface the packet arrived on and scans the **`GIADDR`** value (**`192.168.30.1`**). By reading this label, the database instantly knows to select a lease scope out of **`ip dhcp pool SVI_30`** and routes the contract back to the switch gateway.

