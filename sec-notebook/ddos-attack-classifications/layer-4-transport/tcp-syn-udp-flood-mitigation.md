# Layer 4: Transport Layer & Protocol Flood Protection

## 1. The Protocol Target Profile
Layer 4 attacks exploit the state tracking engines of operating system kernels and network firewalls. The goal is to saturate connection memory tables—specifically host-based firewall state tables (like conntrack) and the OS TCP stack queues—so that legitimate handshakes are dropped, even if the internet link itself isn't full.

## 2. In-Center Layer 4 Scrubbing Mechanisms
When a volumetric flood is pulled into a cloud scrubbing network via Layer 3 BGP routing, it hits massive, hardware-accelerated Layer 4 infrastructure clusters. These systems process millions of packets per second:

*   **SYN Proxying:** The scrubbing center acts as an intercepting mediator. Here the Next generation firewalls dedicated for this task intercept the incoming `SYN` packets and handle the initial 3-way handshake validation. The true origin server never sees the connection until the client proves it is real by returning the final `ACK`.
*   **UDP Threshold Rate-Limiting:** Since UDP is connectionless, scrubbing centers use hardware-driven filtering appliances (built on dedicated ASICs/FPGAs or fast software pipelines like eBPF/XDP) to drop sudden spikes of random-port traffic (like DNS, NTP, or Memcached amplification payloads) before they can exhaust host interface queues. The exact method of how these dedicated hardware work is out of scope for this discussion.

## 3. Host-Level Kernel Protections

### TCP SYN Cookies

#### The Problem: SYN Floods
*   **Normal Handshake:** During a standard TCP three-way handshake, a client sends a SYN packet, the server replies with SYN-ACK and allocates memory in a backlog queue (SYN queue) to store half-open connection state, and the client replies with an ACK.
*   **The Attack:** An attacker floods the server with fake SYN packets using spoofed source IP addresses.
*   **Resource Exhaustion:** The server's SYN queue fills up quickly because it waits for final ACK responses that never arrive, forcing it to drop connections for legitimate users.

#### How SYN Cookies Work
**Stateless Response:** When the SYN queue is full, the server does not store any state or allocate memory for incoming requests. Instead, it generates a cryptographically encoded sequence number (the cookie) and sends it back in the SYN-ACK packet.

The 32-bit Structure: The encoded sequence number contains:
*   **Bits 0–23 (24 Bits):** Cryptographic Hash Mix. This takes up the first 24 bits.
*   **Bits 24–28 (5 Bits):** Timestamp Counter. This sits right in the middle.
*   **Bits 29–31 (3 Bits):** Encoded MSS Value. This closes out the final 3 bits.

```text
┌───────────────────────────────┬─────────────┬──────────────────────────────┐
│    Cryptographic Hash Mix     │  Timestamp  │      Encoded MSS Value       │
│           (24 Bits)           │  (5 Bits)   │           (3 Bits)           │
└───────────────────────────────┴─────────────┴──────────────────────────────┘
 0                                           24            29              31  (Bits)
```

When the client returns the final `ACK`, the host subtracts `1` from the acknowledgment value, re-runs the hash, and instantly creates an active socket *only* if the math matches. Else the traffic is dropped.

#### Why the attacker fails
Because the attacker is using a spoofed (fake) IP address, they never actually receive the server’s SYN-ACK packet containing the cookie. The attacker has two options, both of which fail:

*   **Option A: Flooding Blind ACK Packets (Guessing)**
    They must send fake ACK packets to match their fake SYN packets, meaning they must blindly guess the exact 24-bit hash and the correct 5-bit timestamp. The odds of randomly guessing a valid 32-bit cookie are roughly 1 in 4 billion.
*   **Option B: Doing Nothing (Standard SYN Flood)**
    The attacker never even sends the final ACK packet, leaving the connection half-open. But as SYN cookies force the server to be completely stateless, no memory is allocated when the SYN arrives. If no ACK ever comes back, the server simply forgets the request ever happened—wasting zero memory.

### There are other methods which are Linux Kernel Networking related, which are out of scope for this discussion.
