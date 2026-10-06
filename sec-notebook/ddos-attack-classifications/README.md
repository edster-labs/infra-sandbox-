# DDoS Attack Classifications by OSI Layer

| OSI Layer | Attack Type | Category | Primary Target / Method | Mitigation & Countermeasures |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 7**<br>*(Application)* | **HTTP(S) Flood** | Application | Floods web servers with GET/POST requests to exhaust CPU/RAM/DB. | **WAF** (Web Application Firewall), rate limiting, CAPTCHAs, behavioral analytics. |
| | **Slowloris** | Application | Keeps HTTP connections open as slowly as possible to exhaust the thread pool. | Reduce timeout limits, limit max concurrent connections per IP, reverse proxies. |
| | **HTTP/2 Rapid Reset** | Application | Rapidly opens and cancels streams to spike server CPU. | Install latest vendor patches, apply strict stream concurrency limits on load balancers. |
| **Layer 4**<br>*(Transport)* | **SYN Flood** | Protocol | Targets the "half-open" TCP connection state (backlog queue). | **SYN Cookies**, reducing SYN-RECEIVED timeouts, firewall rate limiting. |
| | **UDP Flood** | Volumetric | Floods random ports to force resource-intensive ICMP unreachable replies. | **Cloud Scrubbing Centers**, Anycast routing, blocking unused UDP ports at the edge. |
| | **DNS / NTP / Memcached** | Volumetric | Spoofs victim IP to send small queries to open servers, returning massive amplified traffic. | **Cloud Scrubbing**, BCP 38 (Source Address Validation), disabling unused protocol features (e.g., `monlist`). |
| **Layer 3**<br>*(Network)* | **ICMP Echo Flood** | Volumetric | Aims to saturate the network pipe with sheer ICMP traffic volume. | Rate-limiting ICMP traffic at the edge firewall, dropping non-essential ICMP. |
| | **LAND Attack** | Protocol | Spoofed packet (source=destination IP) to loop and crash the TCP stack. | Modern OS patches, ingress/egress filtering to drop packets where source IP equals internal IP. |
| | **Teardrop / Frag. Attack** | Protocol | Sends overlapping packet fragments to crash the OS during reassembly. | Modern OS kernel updates, inline IPS (Intrusion Prevention Systems) to inspect/drop malformed fragments. |
| **Layer 2**<br>*(Data Link)* | **MAC Flooding** | Protocol / Resource | Floods the switch's CAM table to force it to act like a hub and broadcast all traffic. | **Port Security** (limiting the number of allowed MAC addresses per switch port). |
| | **ARP Spoofing / Poisoning** | Protocol | Associates the attacker's MAC address with the IP address of a legitimate target/gateway. | **DAI (Dynamic ARP Inspection)**, pairing with DHCP Snooping, static ARP entries. |
| | **Rogue DHCP / Starvation** | Protocol | Spoofs a DHCP server or exhausts the DHCP IP pool to disrupt network operations. | **DHCP Snooping** (trusting only specific uplink ports), Port Security. |
| | **802.1X Bypass / EAPOL** | Protocol | Attempts to spoof authorized MACs or flood EAPOL packets to degrade network access control. | **802.1X Implementation**, MAC Authentication Bypass (MAB) strings, strict re-authentication timers. |
