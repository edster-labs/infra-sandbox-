# Layer 3: Cloud Scrubbing Mechanics & Deployment Models

## How Cloud Scrubbing Works
The process typically follows these four stages:

1. **Detection:** Monitoring traffic for anomalies, such as sudden spikes in volume or suspicious packet patterns.
2. **Diversion:** Once an attack is identified, traffic is rerouted to the provider's scrubbing center. This is most commonly done via BGP (Border Gateway Protocol), where the provider announces your IP prefixes to the internet so that traffic "prefers" their network path.
3. **Filtering (The "Scrubbing"):** Specialized hardware and software analyze the traffic. They use behavioral analysis, known attack signatures, and challenges (like 302 redirects or JavaScript tests) to separate "good" from "bad" traffic.
4. **Re-injection:** The "clean" traffic is sent back to your origin server, often through a GRE tunnel or a direct physical connection to ensure it bypasses the congested path used by the attack.

## Protecting On-Premise vs. Cloud Assets
Cloud scrubbing is not limited to cloud-hosted assets; it is widely used to protect on-premise infrastructure.

* **On-Premise Protection:** For physical data centers, providers use BGP-based redirection to pull traffic into their network, scrub it, and then deliver it to your local facility via secure tunnels.
* **Cloud Assets:** For resources already in a cloud (like AWS or Azure), the process is similar but often more integrated with the cloud provider's internal routing.
* **Hybrid Models:** Many companies use on-premise appliances for small-scale "low and slow" attacks and only trigger cloud scrubbing for large volumetric attacks that would otherwise saturate their internet bandwidth.

## Service Requirements and Contracts
While some providers offer "emergency" onboarding during an active attack, it is highly recommended to have a pre-existing contract.

* **Pre-contract Benefits:** Having a contract ensures that Service Level Agreements (SLAs) are in place, providing guaranteed mitigation times (e.g., sub-5 seconds) and response support.
* **Technical Readiness:** Onboarding involves complex configurations, such as setting up BGP peering and GRE tunnels. If an attack is already in progress, these steps can be difficult to coordinate under pressure, leading to longer downtime.
* **Always-on vs. On-demand:** A contract allows you to choose between Always-on (traffic is always scrubbed) or On-demand (scrubbing starts only when you or the provider detects an attack).

## Key Concepts for Discussion

* **BGP Flowspec:** A modern BGP extension that allows for more granular traffic filtering (e.g., redirecting only specific protocols or ports) rather than all traffic for an IP.
* **Latency:** The trade-off—rerouting traffic through scrubbing centers adds some latency, but prevents a total outage.
* **Volumetric vs. Application Layer:** Scrubbing is excellent for volumetric attacks (flooding your bandwidth), but may require SSL/TLS decryption keys to effectively scrub "application-layer" (Layer 7) attacks.
