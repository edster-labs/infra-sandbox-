<div id="master-osi-table"></div>
  
| OSI Layer | Attack Type / Defensive Measure | Category | Primary Target / Method | Live Notebook Link |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 7 (Application)** | **WAF & Web App Firewall Inspection** | Application | Decrypts SSL/TLS, runs JS browser tests, and parses raw HTTP data to block bad requests. | [👉Layer 7 Framework](./layer-7-application/application-layer-waf-framework.md) |
| | *Cloud Scrubbing (L7 Payload Inspection)* | *Hybrid* | *DPI parsing of decoded app payload to catch Layer 7 logic attacks inside the scrubbing center.* | [👉L3 Cloud Scrubbing Detail](./layer-3-network/cloud-scrubbing-framework.md#important-note) |
| **Layer 6 (Presentation)** | **TLS/SSL Handshake Defenses** | Protocol | Stops cryptographic handshake floods from draining crypto processing hardware. | [👉Layer 6 Framework](./layer-6-presentation/tls-ssl-handshake-defenses.md) |
| **Layer 5 (Session)** | **Session Hijacking Mitigation** | Protocol | Protects session controls to keep connection state pools from filling up. | [👉Layer 5 Framework](./layer-5-session/session-exhaustion-mitigation.md) |
| | **Session Table Exhaustion** | Protocol | Prevents state pool starvation by strictly enforcing connection timeouts and IP limits. | [👉Layer 5 Framework](./layer-5-session/session-exhaustion-mitigation.md) |
| | **RPC Protocol Exploits** | Protocol | Blocks malformed session-control packets via strict network-level endpoint isolation. | [👉Layer 5 Framework](./layer-5-session/session-exhaustion-mitigation.md) |
| **Layer 4 (Transport)** | **SYN / UDP Flood Protection** | Protocol | Drops state exhaustion attacks using stateless validation tracking (SYN cookies). | [👉Layer 4 Framework](./layer-4-transport/tcp-syn-udp-flood-mitigation.md) |
| | *Cloud Scrubbing (L4 State Cleaning)* | *Hybrid* | *Uses high-capacity Layer 4 firewalls at the scrubbing center to drop SYN/UDP floods before the WAF.* | [👉L3 Cloud Scrubbing](./layer-3-network/cloud-scrubbing-framework.md#important-note) |
| **Layer 3 (Network)** | **ICMP Floods (Volumetric)** | Volumetric | Protects bandwidth pipes from saturation using BGP Anycast routing diversion. | [👉Layer 3 Framework](./layer-3-network/cloud-scrubbing-framework.md) |
| | **Smurf Attacks (Amplification)** | Volumetric | Kills spoofed reflection loops by disabling directed broadcasts on edge interfaces. | [👉Layer 3 Framework](./layer-3-network/cloud-scrubbing-framework.md) |
| | **ICMP Redirection Attacks** | Protocol | Prevents Man-in-the-Middle traffic interception by dropping Type 5 routing updates. | [👉Layer 3 Framework](./layer-3-network/cloud-scrubbing-framework.md) |
| | **LAND Attacks (Stack Exhaustion)** | Protocol | Blocks spoofed loopback packets using firewall Strict Reverse Path Forwarding (RPF). | [👉Layer 3 Framework](./layer-3-network/cloud-scrubbing-framework.md) |
| | **Ping Sweeps (Reconnaissance)** | Protocol | Blinds automated network mapping tools by dropping or rate-limiting public Echo queries. | [👉Layer 3 Framework](./layer-3-network/cloud-scrubbing-framework.md) |
| **Layer 2 (Data Link)** | **Layer 2 Protocol Hardening** | Protocol | Uses 802.1X and Dynamic ARP Inspection (DAI) to stop local switch tables from crashing. | [👉Layer 2 Framework](./layer-2-data-link/l2-mitigation-framework.md) |
| **Layer 1 (Physical)** | **Perimeter & Physical Link Protection** | Physical | Hardens hardware boxes, fiber runs, and physical link lines. | [👉Layer 1 Framework](./layer-1-physical/physical-layer-security-framework.md) |

