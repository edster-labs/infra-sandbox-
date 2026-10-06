
| OSI Layer | Attack Type / Defensive Measure | Category | Primary Target / Method | Live Notebook Link |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 7 (Application)** | **Application WAF & Payload Inspection** | Application | Inspects raw HTTP data, decrypts SSL/TLS payloads, and runs behavior challenges. | [Go to Layer 7 Framework](./layer-7-application/application-layer-waf-framework.md) |
| | *Cloud Scrubbing (Data Center Analysis)* | *Hybrid* | *Executes Deep Packet Inspection (DPI) and Layer 7 behavioral tests once traffic is ingested.* | [Go to L3 Scrubbing Detail](./layer-3-network/cloud-scrubbing-framework.md#important-note) |
| **Layer 6 (Presentation)** | **TLS/SSL Handshake Defenses** | Protocol | Targets SSL/TLS cryptographic handshakes to prevent resource exhaustion. | [Go to Layer 6 Framework](./layer-6-presentation/tls-ssl-handshake-defenses.md) |
| **Layer 5 (Session)** | **Session Hijacking Mitigation** | Protocol | Protects session control protocols to prevent connection state limits from filling up. | [Go to Layer 5 Framework](./layer-5-session/session-exhaustion-mitigation.md) |
| **Layer 4 (Transport)** | **SYN / UDP Flood Protection** | Protocol | Bypasses local connection table allocations using stateless validation cookies. | [Go to Layer 4 Framework](./layer-4-transport/tcp-syn-udp-flood-mitigation.md) |
| **Layer 3 (Network)** | **BGP Traffic Diversion (Scrubbing)** | Volumetric | Reroutes global ingress via BGP path manipulation to protect infrastructure edge pipes. | [Go to Layer 3 Framework](./layer-3-network/cloud-scrubbing-framework.md) |
| **Layer 2 (Data Link)** | **Layer 2 Protocol Hardening** | Protocol | Implements 802.1X validation and Dynamic ARP Inspection (DAI) against local switching table exhaustion. | [Go to Layer 2 Framework](./layer-2-data-link/dot1x-dai-mitigation-framework.md) |
| **Layer 1 (Physical)** | **Perimeter & Physical Link Protection** | Physical | Hardens hardware terminations, fiber paths, and physical transport layer isolation. | [Go to Layer 1 Framework](./layer-1-physical/physical-layer-security-framework.md) |

