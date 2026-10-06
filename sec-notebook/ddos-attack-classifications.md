# Reference: DDoS Attack Classifications & Stateless TCP Protections

## 🎯 Conceptual Overview
Denial-of-Service architectures are categorized by the specific layer or metric they target. While some focus on saturating physical hardware pipes, others exploit the structural states of operating system kernels.

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

## 🛡️ Deep Dive: Defending SYN Floods with Stateless SYN Cookies

### The Vulnerability: Connection State Exhaustion
In a standard TCP three-way handshake, the server must store the client's session details (state) in memory immediately after receiving the initial `SYN` packet. During a SYN flood, these "half-open" slots fill up the backlog queue, blocking legitimate users.

### The Defense: The Stateless Initial Sequence Number (ISN)
**SYN Cookies** are a stateless mechanism that allows a server to verify a TCP connection attempt without allocating *any* memory or system pool resources until the final `ACK` arrives. The server discards the client's information instantly and encodes the necessary validation parameters directly into the **Initial Sequence Number (ISN)** of its `SYN-ACK` response.

```text
32-Bit OSPF/TCP SYN Cookie ISN Construction Blueprint:
┌────────────────────────┬───────────────────┬─────────────────────────────────┐
│  Timestamp (5 Bits)    │   MSS (3 Bits)    │    Cryptographic Hash (24 Bits) │
└────────────────────────┴───────────────────┴─────────────────────────────────┘
```
* **Timestamp (5 bits):** A slowly incrementing time variable ensuring the cookie expires securely after a short operational window (e.g., 64 seconds).
* **MSS Encoding (3 bits):** Encodes the client's requested Maximum Segment Size using 8 predefined system values.
* **Cryptographic Hash (24 bits):** A secret signature hash (SHA/SipHash) of the Client IP/Port, Server IP/Port, the timestamp, and a rotating server secret key.

*🔍 **The Handshake Verification:** When the client sends the final `ACK`, the server subtracts `1` from the acknowledgment number, recalculates the hash parameters locally, and checks if it matches. If verified, the server allocates memory for the socket connection.*
