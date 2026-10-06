# Reference: DDoS Attack Classifications & Layered Mitigation Framework

## 🎯 Conceptual Overview
Denial-of-Service architectures are categorized by the specific layer or metric they target. While some focus on saturating physical hardware pipes, others exploit the structural states of operating system kernels or application logic.

---

## 📊 The Master Attack Classification Matrix

| Attack Vector | Vector Category | Primary Target / Method of Operation |
| :--- | :--- | :--- |
| **SYN Flood** | Protocol | Targets the "half-open" connection state (TCP backlog queue). |
| **ICMP Echo Flood** | Volumetric | Aims to saturate the network circuit with sheer traffic volume. |
| **ICMP Redirection** | Protocol / MitM | Exploits protocol routing trust to divert traffic to a dead end. |
| **LAND Attack** | Protocol (Legacy) | Spoofs a loopback packet (Source = Destination) to crash the TCP stack. |
| **Smurf Attack** | Volumetric (Legacy)| Amplifies broadcast traffic to flood the victim's input pipe. |
| **WinNuke Attack** | Protocol (Legacy) | Exploits OS Kernel vulnerabilities via NetBIOS Out-of-Bounds (OOB) data. |
| **Ping Sweep** | Reconnaissance | Non-destructive; maps active live IP structures across a subnet. |

### 💡 Core Target Tiers Defined
1. 🌊 **Volumetric:** Targets the **Pipe** (Bandwidth saturation).
2. 🔄 **Protocol:** Targets the **State** (Firewall/Server memory tables and backlog queues).
3. 💻 **Application:** Targets the **CPU** (Application logic, script engines, and database queries).

---

## 🛡️ The Layered DDoS Mitigation Framework (OSI Model)

Modern infrastructure defense requires separating counter-measures across the specific layers of the Open Systems Interconnection (OSI) stack to neutralize attacks before they exhaust resources:

### 🌐 Layer 3: Network Layer (Volume & Routing Protection)
*   **Attack Types Targeted:** ICMP Floods, Smurf Attacks, ICMP Redirection, LAND Attacks, Ping Sweeps.
*   **The Mitigation Strategy:**
    *   **ISP/Cloud Scrubbing Centers:** Volumetric attacks cannot be stopped at the local firewall layer because they saturate the internet bandwidth pipe before reaching it. Traffic must be rerouted via BGP to a cloud provider (e.g., Cloudflare, Akamai) to "scrub" out the bad volume.
    *   **Anti-Spoofing (BCP 38):** Instantly drop packets where the source IP address is spoofed or physically impossible (e.g., a packet matching the internal private network range arriving from the external WAN interface, which completely stops the LAND attack).
    *   **Disabling ICMP Directed Broadcasts:** Enforcing this parameter across edge interfaces entirely neutralizes Smurf amplification attacks.
    *   **Rate Limiting & Firewalls:** Drop ICMP traffic or active Ping Sweeps at the edge if they exceed a specific threshold.

### 🔄 Layer 4: Transport Layer (Protocol Stack Protection)
*   **Attack Types Targeted:** SYN Floods, WinNuke Attacks, UDP Floods.
*   **The Mitigation Strategy:**
    *   **SYN Cookies:** The server responds to incoming `SYN` requests with a `SYN-ACK` containing a mathematically hashed sequence number (the cookie), delaying memory allocation until a valid client `ACK` returns. This completely defeats the SYN Flood connection queue exhaustion.
    *   **TCP Intercept / Proxies:** Security devices like firewalls (or Meraki MX appliances) intercept the initial TCP handshake, validate that the client is legitimate, and only then pass the connection to the internal server structure.
    *   **OS Kernel Patching:** Modern operating systems have long patched the specific NetBIOS Out-of-Band (OOB) vulnerabilities that allowed old-school WinNuke attacks to crash the network stack.

### 💻 Layer 7: Application Layer (Logic & Payload Protection)
*   **Attack Types Targeted:** HTTP Floods, Slowloris, Cloud Scraping, API Abuse.
*   **The Mitigation Strategy:**
    *   **Web Application Firewalls (WAF):** Inspects the actual payload of the HTTP/HTTPS request layers. It detects repetitive string patterns, malicious user agents, or automated scraping scripts.
    *   **Behavioral Analysis & CAPTCHAs:** Challenges suspicious traffic layer patterns to differentiate a real browser human from a headless botnet script.
    *   **Timeout Tuning:** For attacks like Slowloris (which send HTTP headers agonizingly slowly to keep connections open), keep web server connection timeouts low and aggressive to force connection drops.

---

## 🧠 Deep Dive: Defending SYN Floods with Stateless SYN Cookies

### The Vulnerability: Connection State Exhaustion
In a standard TCP three-way handshake, the server must store the client's session details (state) in memory immediately after receiving the initial `SYN` packet. During a SYN flood, these "half-open" slots fill up the backlog queue, blocking legitimate users.

### The Defense: The Stateless Initial Sequence Number (ISN)
**SYN Cookies** are a stateless mechanism that allows a server to verify a TCP connection attempt without allocating *any* memory or system pool resources until the final `ACK` arrives. The server discards the client's information instantly and encodes the necessary validation parameters directly into the **Initial Sequence Number (ISN)** of its `SYN-ACK` response.

```text
32-Bit OSPF/TCP SYN Cookie ISN Construction Blueprint:
┌────────────────────────┬───────────────────┬─────────────────────────────────┐
│  Timestamp (5 Bits)    │   MSS (3 Bits)    │    Cryptographic Hash (24 Bits) │
└────────────────────────┬───────────────────┬─────────────────────────────────┐
```
*   **Timestamp (5 bits):** A slowly incrementing time variable ensuring the cookie expires securely after a short operational window (e.g., 64 seconds).
*   **MSS Encoding (3 bits):** Encodes the client's requested Maximum Segment Size using 8 predefined system values.
*   **Cryptographic Hash (24 bits):** A secret signature hash (SHA/SipHash) of the Client IP/Port, Server IP/Port, the timestamp, and a rotating server secret key.

*🔍 **The Handshake Verification:** When the client sends the final `ACK`, the server subtracts `1` from the acknowledgment number, recalculates the hash parameters locally, and checks if it matches. If verified, the server allocates memory for the socket connection.*
