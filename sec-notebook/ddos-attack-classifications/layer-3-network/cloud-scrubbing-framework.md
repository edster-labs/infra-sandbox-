<!-- include-osi-nav -->
<!-- automated-nav-start -->
[⬅️ DDos Attack Threat Mitigation Table](../../../sec-notebook/ddos-attack-classifications/README.md#ddos-attack-threat-mitigation-table)

---
<!-- automated-nav-end -->
# Network Layer (Volume & Routing Protection)

This section maps common Layer 3 network attacks directly to specific architectural and device-level defenses. Because Layer 3 threats range from brute-force traffic saturation to malicious routing logic, countermeasures must be strategically implemented from the upstream provider network down to the local router interface.

---

## 🛠️ The Explicit Layer 3 Attack-to-Mitigation Mapping

### 1. ⚔️ ICMP Floods (Volumetric Threat)
*   **The Exploit:** An attacker orchestrates a botnet to blast an overwhelming volume of standard Ping requests (ICMP Echo Requests) at a target network. The sheer traffic volume chokes the internet circuit and saturates interface buffers before a local firewall can even process them.
*   **The Countermeasure:** **Upstream Cloud Scrubbing & Edge Rate Limiting**
*   **The Deployment Status:** **Requires Administrator Configuration & External Services.** 
*   **The Logic:** If the volume is large enough to choke physical bandwidth, network administrators must work with an upstream cloud scrubbing provider (such as Cloudflare or Akamai) to dynamically divert traffic via BGP routing, sanitizing the volume before it hits the local pipe. For lower-volume attacks, administrators must manually configure rate-limiting policies on the local edge firewall to throttle inbound ICMP packets.

### 2. ⚔️ Smurf Attacks (Amplification Threat)
*   **The Exploit:** The attacker sends ICMP requests to a network's *broadcast address* rather than a single host. Crucially, the packet header is spoofed so the "Source IP" looks like it belongs to the victim. Every active device on that broadcast network unknowingly replies to the spoofed source, flooding the victim with amplified reflective traffic.
*   **The Countermeasure:** **Interface-Level Directed Broadcast Disabling**
*   **The Deployment Status:** **Built-in by Default on Modern Devices / Requires Verification on Legacy Hardware.**
*   **The Logic:** This attack completely breaks if local routers refuse to forward packets destined for a network's broadcast domain if those packets originate from outside that network. While modern operating systems and routers disable directed broadcasts by default today, network administrators must verify or manually enforce this behavior on edge interfaces (e.g., using the command `no ip directed-broadcast` on legacy Cisco IOS).

### 3. ⚔️ ICMP Redirection Attacks (Routing Logic Threat)
*   **The Exploit:** An attacker sends a fraudulent ICMP Type 5 "Redirect" packet to a target machine on a local LAN. The packet misleads the host, claiming that a superior default gateway or shorter routing path exists. The victim's computer blindly trusts the protocol update, re-routes its traffic through the attacker's machine, and becomes vulnerable to a Man-in-the-Middle (MitM) intercept.
*   **The Countermeasure:** **Interface-Level ICMP Redirect Disabling**
*   **The Deployment Status:** **Requires Manual Administrator Hardening.**
*   **The Logic:** Because this relies entirely on a protocol trust exploit, the fix requires strict administrative enforcement. Network administrators must manually configure router interfaces and host operating systems to treat ICMP Type 5 packets as untrusted and drop them entirely (e.g., via the command `no ip redirects` on Cisco interfaces).

### 4. ⚔️ LAND Attacks (Stack Exhaustion Threat)
*   **The Exploit:** The attacker crafts a malicious packet where the **Source IP and Port are intentionally forged to be identical to the Destination IP and Port** (the victim's own address). When the victim device receives it, its TCP/IP stack gets trapped in an infinite loop trying to answer itself, resulting in a system kernel crash or lockup.
*   **The Countermeasure:** **Strict Reverse Path Forwarding (RPF) / Anti-Spoofing Policies**
*   **The Deployment Status:** **Requires Explicit Administrator Enablement on the Firewall.**
*   **The Logic:** Firewalls do not inherently drop these packets unless a security administrator explicitly enables an anti-spoofing policy at the perimeter interface. By turning on features like **Strict RPF** on an enterprise firewall (like a FortiGate), the security appliance automatically checks inbound packets; if a packet arrives on the external internet interface but claims to have an internal, local source address, the firewall recognizes the logical impossibility and drops it instantly.
*(Note: A screenshot from the virtual FortiGate lab showing Strict RPF or anti-spoofing policy configuration can be placed here.)*

### 5. ⚔️ Ping Sweeps (Reconnaissance Threat)
*   **The Exploit:** A preliminary scanning technique where automated scripts rapidly blast ICMP Echo Requests across an entire range of sequential IP addresses. The attacker does not intend to take the network down; the goal is simply mapping out which systems are live and listening for subsequent target attacks.
*   **The Countermeasure:** **Inbound Echo Blocking & Firewall Rate Limiting**
*   **The Deployment Status:** **Requires Custom Administrator Security Profiles.**
*   **The Logic:** Security administrators must explicitly configure edge firewalls to block or strictly throttle inbound ICMP Type 8 (Echo Requests) originating from unverified public zones. Implementing local rate-limiting or dropping public ICMP queries entirely blinds the attacker's scanning tools, making active network architecture invisible to script sweeps.

## Layer 3: ISP/Cloud Scrubbing

Volumetric attacks (like ICMP/Smurf) cannot be stopped at the local firewall because they saturate the internet pipe before reaching it. Traffic must be rerouted via BGP to a cloud provider (like Cloudflare or Akamai) to "scrub" out the bad volume.

### Cloud Scrubbing Mechanics & Deployment Models (Routing Specific)

<a name="important-note"></a>
**Important note:** The ingress entry point uses Layer 3 BGP routing to pull the traffic into the datacenter, but once that traffic crosses the threshold of the scrubbing center, the engineering changes completely. High-capacity Layer 4 firewalls instantly drop the bulk protocol floods (like massive SYN/UDP spikes) to protect state tables. Only the clean-looking TCP traffic is passed up to Layer 7 proxy nodes, where deep packet inspection (DPI), SSL decryption, and behavioral WAF tests parse the raw HTTP data. These methods are detailed in their respective layer profiles.

### How Cloud Scrubbing Works
The process typically follows these four stages:

1. **Detection:** Monitoring traffic for anomalies, such as sudden spikes in volume or suspicious packet patterns.
2. **Diversion:** Once an attack is identified, traffic is rerouted to the provider's scrubbing center. This is most commonly done via BGP (Border Gateway Protocol), where the provider announces your IP prefixes to the internet so that traffic "prefers" their network path.
3. **Filtering (The "Scrubbing"):** Specialized hardware and software analyze the traffic. They use behavioral analysis, known attack signatures, and challenges (like 302 redirects or JavaScript tests) to separate "good" from "bad" traffic.
4. **Re-injection:** The "clean" traffic is sent back to your origin server, often through a GRE tunnel or a direct physical connection to ensure it bypasses the congested path used by the attack.

### Protecting On-Premise vs. Cloud Assets
Cloud scrubbing is not limited to cloud-hosted assets; it is widely used to protect on-premise infrastructure.

* **On-Premise Protection:** For physical data centers, providers use BGP-based redirection to pull traffic into their network, scrub it, and then deliver it to your local facility via secure tunnels.
* **Cloud Assets:** For resources already in a cloud (like AWS or Azure), the process is similar but often more integrated with the cloud provider's internal routing.
* **Hybrid Models:** Many companies use on-premise appliances for small-scale "low and slow" attacks and only trigger cloud scrubbing for large volumetric attacks that would otherwise saturate their internet bandwidth.

### Service Requirements and Contracts
While some providers offer "emergency" onboarding during an active attack, it is highly recommended to have a pre-existing contract.

* **Pre-contract Benefits:** Having a contract ensures that Service Level Agreements (SLAs) are in place, providing guaranteed mitigation times (e.g., sub-5 seconds) and response support.
* **Technical Readiness:** Onboarding involves complex configurations, such as setting up BGP peering and GRE tunnels. If an attack is already in progress, these steps can be difficult to coordinate under pressure, leading to longer downtime.
* **Always-on vs. On-demand:** A contract allows you to choose between Always-on (traffic is always scrubbed) or On-demand (scrubbing starts only when you or the provider detects an attack).

### Key Concepts for Discussion
* **BGP Flowspec:** A modern BGP extension that allows for more granular traffic filtering (e.g., redirecting only specific protocols or ports) rather than all traffic for an IP.
* **Latency:** The trade-off—rerouting traffic through scrubbing centers adds some latency, but prevents a total outage.
* **Volumetric vs. Application Layer:** Scrubbing is excellent for volumetric attacks (flooding your bandwidth), but may require SSL/TLS decryption keys to effectively scrub "application-layer" (Layer 7) attacks.

