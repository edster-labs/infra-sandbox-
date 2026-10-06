# DDoS Attack Classifications & OSI Mapping

A centralized systems engineering reference mapping Distributed Denial of Service (DDoS) attack profiles against specific layers of the Open Systems Interconnection (OSI) model.

## 🎯 Core Target Tiers Defined

1. **Volumetric (Layer 3/4):** Targets the Pipe (Bandwidth saturation via raw payload delivery).
2. **Protocol (Layer 4):** Targets the State (Exhaustion of firewall connection tables, kernel queues, and OS memory spaces).
3. **Application (Layer 7):** Targets the CPU/RAM (Exploits application logic, script engines, and complex database queries).

---

## 🗺️ OSI Layer Target Directory

### [📁 Layer 3: Network Layer](./layer-3/)
*   **Mechanisms:** Infrastructure saturation via non-connection-oriented traffic vectors.
*   **Active Profiles:**
    *   `icmp-smurf-floods.md` - ICMP Echo Request amplification and legacy LAND edge crashes.

### [📁 Layer 4: Transport Layer](./layer-4/)
*   **Mechanisms:** Protocol stack state exploitation, connection pool starvation, and handshake manipulation.
*   **Active Profiles:**
    *   [`tcp-syn-mechanics.md`](./layer-4/tcp-syn-mechanics.md) - Stateless validation using cryptographic tracking cookies.

### [📁 Layer 7: Application Layer](./layer-7/)
*   **Mechanisms:** High-overhead requests parsing, database indexing exhaustion, and resource-heavy pagination scraping.
*   **Active Profiles:**
    *   [`cloud-scraping-mitigation.md`](./layer-7/cloud-scraping-mitigation.md) - Residential proxy rotation, TLS fingerprinting, and behavioral rate limits.
