
# 🌋 DDoS Attack Classifications by OSI Layer

This master matrix catalogs infrastructure and application layer DDoS vectors. Click on any specific layer to jump directly to its dedicated lab framework, device configurations, and verification logs.

<!-- toc -->
<!-- endtoc -->

| OSI Layer | Attack Type | Category | Primary Target / Method | Live Notebook Link |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 7**<br>*(Application)* | HTTP(S) Flood | Application | Floods web servers with GET/POST requests to exhaust CPU/RAM/DB. | [Go to Layer 7 Framework](./layer-7/application-layer-waf-framework.md) |
| | Slowloris | Application | Keeps HTTP connections open as slowly as possible to exhaust thread pools. | |
| | HTTP/2 Rapid Reset | Application | Rapidly opens and cancels streams to spike server CPU. | |
| **Layer 6**<br>*(Presentation)* | Encryption Exhaustion | Protocol | Target SSL/TLS handshake processing to drain crypto chips. | [Go to Layer 6 Framework](./layer-6/tls-ssl-handshake-defenses.md) |
| **Layer 5**<br>*(Session)* | Session Hijacking | Protocol | Attacks session control protocols to exhaust connection state limits. | [Go to Layer 5 Framework](./layer-5/session-exhaustion-mitigation.md) |
| **Layer 4**<br>*(Transport)* | **SYN Flood** | Protocol | Targets the "half-open" TCP connection state backlog queue. | [Go to Layer 4 Framework](./layer-4/tcp-syn-udp-flood-mitigation.md) |
| | UDP Flood | Volumetric | Floods random ports to force resource-intensive ICMP replies. | |
| | DNS / NTP / Memcached | Volumetric | Spoofs victim IP to send small queries, returning amplified traffic. | |
| **Layer 3**<br>*(Network)* | ICMP Echo Flood | Volumetric | Aims to saturate the network pipe with sheer traffic volume. | [Go to Layer 3 Framework](./layer-3/cloud-scrubbing-framework.md) |
| | LAND Attack | Protocol | Spoofed packets (source=destination IP) to loop and crash TCP stacks. | |
| | Teardrop / Frag. Attack | Protocol | Sends overlapping packet fragments to crash OS reassembly. | |
| **Layer 2**<br>*(Data Link)* | MAC Flooding | Protocol | Floods switch CAM tables to force "fail-open" hub broadcasting. | [Go to Layer 2 Framework](./layer-2/dot1x-dai-mitigation-framework.md) |
| | ARP Spoofing / Poisoning | Protocol | Associates malicious MAC addresses with trusted gateway IPs. | |
| | Rogue DHCP / Starvation | Protocol | Spoofs a DHCP server or exhausts the IP pool to drop connections. | |
| **Layer 1**<br>*(Physical)* | Physical Air-Gap Breach | Physical | Rogue physical connections or tapping layer-1 media directly. | [Go to Layer 1 Framework](./layer-1/physical-layer-security-framework.md) |
