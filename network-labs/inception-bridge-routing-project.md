# Project: The Inception Bridge & Isolated Routing Matrix

## 🎯 Project Overview & Objective
Demonstrate proper multi-tier enterprise routing architecture by creating an isolated lab environment ("Hidden Subnet Island") inside EVE-NG, and proving hypervisor network translation by establishing end-to-end communication from the local physical host workstation down to a hidden Linux endpoint node.

---

## 🗺️ Structural Lab Topology Matrix
The network topology is constructed across multiple device layers using this explicit interconnect blueprint:

```text
[ Physical Windows Host ]
          │ (192.168.36.1 / VMnet8 NAT Subnet)
          ▼
[ EVE Cloud2 NAT Bridge ]
          │
    (Gi0/0 - DHCP: 192.168.36.135)
[ Cisco Layer 3 Core Switch / Router ]
    (Gi0/2 - Static IP: 10.10.10.1/24)
          │
[ Generic Lab Bridge (No Cloud / Isolated) ]
          │
          ▼
   [ Lubuntu PC Node ] (Static IP: 10.10.10.50/24 | GW: 10.10.10.1)
```

---

## 🛠️ Configuration Steps

### 1. Cisco Layer 3 Core Device Initialization
Access the Cisco node command line interface and execute the following configuration mapping to bind interfaces and enable global IP routing engine hooks:
```cisco
configure terminal
!
ip routing
!
interface GigabitEthernet0/0
 description Connects to External Cloud2 (Hypervisor NAT Subnet)
 ip address dhcp
 no shutdown
!
interface GigabitEthernet0/2
 description Connects to Isolated Lab Network Bridge Segment
 ip address 10.10.10.1 255.255.255.0
 no shutdown
end
```

### 2. Lubuntu Endpoint Node Configuration
Configure the target Linux workstation network interfaces manually to ensure proper routing path registration:
```bash
# Set up localized IP address structure
sudo ip addr add 10.10.10.50/24 dev ens3

# Bring up the interface link
sudo ip link set ens3 up

# Inject the gateway exit path via the Cisco interface block
sudo ip route add default via 10.10.10.1
```

### 3. Inject the Windows Static Route (The Secret Tunnel)
Because the host physical Windows computer does not natively know that the `10.10.10.0/24` subnet resides behind the hypervisor network switch, it drops the frames. Open a **Windows CMD terminal as Administrator** and inject a persistent static route path using the Cisco router's WAN IP address as the next hop:

```cmd
:: Add the target network path route entry
route add 10.10.10.0 mask 255.255.255.0 192.168.36.135

:: Verify the path is properly registered in the Windows routing table
route print | findstr 10.10.10.0
```

---

## 🔍 Validation & Proof of Execution
Perform an **Inception Ping** from your real Windows command prompt window out to the hidden internal system asset:
```cmd
C:\Windows\system32> ping 10.10.10.50
```
*Verification Result: ICMP replies confirm packets are actively traversing the hypervisor VMnet layer, bridging through the Linux kernel interfaces, hopping the virtual Cisco switch engine, and hitting the targeted endpoint successfully.*
