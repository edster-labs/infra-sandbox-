# 🛡️ DDoS & Network Security Lab Sandbox

Welcome to the infrastructure security notebook. This dashboard aggregates live deep dives, configuration files, and verification logs across the OSI model layers.

<!-- toc -->

| OSI Layer | Primary Target / Method | Key Mitigation Tech | Live Notebook Link |
| :--- | :--- | :--- | :--- |
| **Layer 7**<br>*(Application)* | HTTP(S) Floods, Slowloris, Stream Resets | WAF, Rate Limiting, CAPTCHAs | [Go to Layer 7 Closet](./sec-notebook/layer-7/application-layer-waf-framework.md) |
| **Layer 6**<br>*(Presentation)* | Encryption Exhaustion, TLS Attacks | SSL Tuning, Session Resumption | [Go to Layer 6 Closet](./sec-notebook/layer-6/tls-ssl-handshake-defenses.md) |
| **Layer 5**<br>*(Session)* | Session Hijacking, Protocol Manipulation | Session Timeouts, Connection Caps | [Go to Layer 5 Closet](./sec-notebook/layer-5/session-exhaustion-mitigation.md) |
| **Layer 4**<br>*(Transport)* | TCP SYN Floods, UDP Pipe Exhaustion | SYN Cookies, Anycast Routing | [Go to Layer 4 Closet](./sec-notebook/layer-4/tcp-syn-udp-flood-mitigation.md) |
| **Layer 3**<br>*(Network)* | ICMP Floods, Reflection Amplification | Cloud Scrubbing, BCP 38 | [Go to Layer 3 Closet](./sec-notebook/layer-3/cloud-scrubbing-framework.md) |
| **Layer 2**<br>*(Data Link)* | MAC Floods, ARP Poisoning, DHCP Attacks | DAI, DHCP Snooping, 802.1X | [Go to Layer 2 Closet](./sec-notebook/layer-2/dot1x-dai-mitigation-framework.md) |
| **Layer 1**<br>*(Physical)* | Physical Air-Gap / Cable Breaches | Port Disabling, Hardware Locks | [Go to Layer 1 Closet](./sec-notebook/layer-1/physical-layer-security-framework.md) |

<!-- endtoc -->

