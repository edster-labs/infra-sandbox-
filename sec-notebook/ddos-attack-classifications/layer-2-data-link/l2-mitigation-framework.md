<!-- include-osi-nav -->
<!-- automated-nav-start -->
[⬅️ DDos Attack Threat Mitigation Table](../../../sec-notebook/ddos-attack-classifications/#ddos-attack-threat-mitigation-table)

---
<!-- automated-nav-end -->
# Data link layer

# 🛡️ Data Link Layer Security & Mitigation Framework

This module details the core Layer 2 vulnerability vectors, threat mechanics, and specific structural mitigation playbooks required to secure the enterprise LAN edge before traffic reaches higher-layer inspection gateways.

---

## 📁 Core Layer 2 Threat Matrices & Explanations

### 1. MAC Flooding (CAM Table Exhaustion)
* **The Exploit:** An attacker floods an access port with thousands of spoofed source MAC addresses per second. This quickly exhausts the switch's hardware **Content Addressable Memory (CAM) Table**. Once the CAM table is entirely saturated, the switch can no longer map ports to MAC addresses and falls back to a primitive "fail-open" hub state, broadcasting all subsequent local traffic out of every single interface, allowing the attacker to passively sniff sensitive data.
* **Infrastructure Mitigation:** **Cisco Port Security**. By explicitly setting a maximum threshold for unique MAC addresses allowed on an access interface and configuring a restrictive drop action, you completely halt CAM exhaustion vectors.
```text
interface GigabitEthernet0/1
 switchport mode access
 switchport port-security
 switchport port-security maximum 2
 switchport port-security violation shutdown
```

### 2. DHCP Starvation & Rogue DHCP Server Attacks
* **The Exploit:** 
  * **DHCP Starvation:** The attacker utilizes tools like `Yersinia` to rapidly request every available IP address inside the subnet pool using spoofed source MAC addresses, causing immediate Denial of Service (DoS) for legitimate incoming endpoints.
  * **Rogue DHCP Server:** Once the legitimate scope is fully starved, the attacker stands up a rogue DHCP server on their node, handing out lease options that designate the attacker's machine as the Default Gateway, orchestrating a seamless Man-in-the-Middle (MiTM) interception platform.
* **Infrastructure Mitigation:** **DHCP Snooping**. This establishes a layer of trust across the switch plane. Edge client ports are designated as `untrusted`, which instantly drops incoming DHCP Offer/Ack server responses, while valid upstream trunk ports connected to real servers are configured as `trusted`.
```text
ip dhcp snooping
ip dhcp snooping vlan 10
!
interface GigabitEthernet0/24
 description Upstream Trusted Server Link
 ip dhcp snooping trust
```

### 3. ARP Spoofing / Poisoning (MiTM)
* **The Exploit:** The attacker broadcasts unsolicited, malicious **Gratuitous ARP (GARP)** replies across the broadcast domain. These messages falsely state that the attacker's physical MAC address belongs to the IP address of the local Default Gateway. Local client nodes update their internal ARP caches with this toxic binding, blinding routing calculations and sending all outbound Internet-bound frames directly to the attacker for inspection and modification.
* **Infrastructure Mitigation:** **Dynamic ARP Inspection (DAI)**. DAI automatically intercepts every single incoming ARP packet on untrusted ports and cross-references its Source MAC and Source IP against the cryptographic binding database built dynamically by DHCP Snooping. If the binding doesn't match, the frame is instantly dropped.
```text
ip arp inspection vlan 10
```

### 4. Unauthorized Physical Network Access
* **The Exploit:** An attacker gains unauthorized physical access to a building and plugs a rogue workstation, micro-PC, or packet-sniffing tap directly into an open network wall jack or an unconfigured phone port, bypassing external perimeter network firewalls entirely and achieving direct access to the internal trusted network fabric.
* **Infrastructure Mitigation:** **802.1X Port-Based Authentication**. By forcing edge switches to block all non-EAP traffic until an external **Lubuntu AAA RADIUS** server verifies cryptographically safe machine or user credentials, physical link drops are neutralized automatically.
```text
aaa authentication dot1x default group radius
dot1x system-auth-control
!
interface GigabitEthernet0/1
 authentication port-control auto
 dot1x pae authenticator
```




