## Layer 3 DHCP Relay Topology

<img width="2616" height="1631" alt="image" src="https://github.com/user-attachments/assets/056a5daf-d989-42f9-bdb8-d0fe58a57fdc" />

# Conceptual Blueprint: Layer 3 DHCP Relay Architecture   

## 🎯 Lab Objective
Document a scalable enterprise infrastructure design inside an EVE-NG environment hosted on VMware Workstation, highlighting a centralized DHCP server (Router) dynamically allocating IP addresses to multiple downstream segments across a single Layer 3 transit link. This implementation leverages explicit static return routes to establish deterministic reachability back to the client subnets.

## 🛠 Active Network Configurations

### 1. Centralized DHCP Server (Router Node)
```text
Router#show run | beg dhcp
ip dhcp excluded-address 192.168.1.1 192.168.1.10
ip dhcp excluded-address 192.168.30.1 192.168.30.10
ip dhcp excluded-address 172.16.20.1 172.16.20.10
ip dhcp excluded-address 192.168.10.1 192.168.10.10
!
ip dhcp pool SVI_30
 network 192.168.30.0 255.255.255.0
 default-router 192.168.30.1
 dns-server 1.1.1.1
!
ip dhcp pool Default_Pool
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 8.8.8.8
!
ip dhcp pool SVI_20
 network 172.16.20.0 255.255.255.0
 default-router 172.16.20.1
 dns-server 8.8.8.8
!
ip dhcp pool SVI_10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
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
!
interface GigabitEthernet0/0
 no switchport
 ip address dhcp
 negotiation auto
!
interface GigabitEthernet0/1
 switchport access vlan 30
 switchport mode access
 switchport nonegotiate
 negotiation auto
 spanning-tree portfast edge
 spanning-tree bpduguard enable
!
interface GigabitEthernet0/2
 switchport access vlan 20
 switchport mode access
 switchport nonegotiate
 negotiation auto
 spanning-tree portfast edge
 spanning-tree bpduguard enable
!
interface GigabitEthernet0/3
 switchport access vlan 10
 switchport mode access
 switchport nonegotiate
 negotiation auto
 spanning-tree portfast edge
 spanning-tree bpduguard enable
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

# Gateway of last resort 
!
ip route 0.0.0.0 0.0.0.0 192.168.1.1
ip ssh server algorithm encryption aes128-ctr aes192-ctr aes256-ctr
ip ssh client algorithm encryption aes128-ctr aes192-ctr aes256-ctr
!


```
---

## ⚡ Quick Protocol Summary: The Blueprint Flow

When an end-host requests an IP address across an enterprise relay architecture, the handshake executes through these three precise sequence steps:

1. **The Client Broadcast:** The Virtual PC (VPC) shoots out a blind `DHCPDISCOVER` broadcast frame. Because it does not possess an IP identity yet, the packet's internal **`GIADDR`** field is populated as **`0.0.0.0`**.
2. **The Switch Interception:** The Layer 3 Switch catches the local broadcast on its access port. It activates the relay agent, converts the broadcast into a targeted Layer 3 routed unicast packet, and explicitly writes its own local SVI IP address (**`192.168.30.1`**) straight into the **`GIADDR`** field slot before routing it upstream.
3. **The Router Scope Selection:** The Central Router receives the unicast packet. It completely ignores the physical wire interface the packet arrived on and scans the **`GIADDR`** value (**`192.168.30.1`**). By reading this label, the database instantly knows to select a lease scope out of **`ip dhcp pool SVI_30`** and routes the contract back to the switch gateway.

