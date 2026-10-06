# Layer 7: Application Layer & Web Application Firewall (WAF) Protections

## 1. The Application Target Profile
Layer 7 attacks do not try to flood your network bandwidth or break TCP tables. Instead, they try to kill the host CPU, tank database queries, or exhaust application worker processes by mimicking standard user actions.

## 2. Core Inspection Methods

### Deep Packet Inspection (DPI) & SSL Decryption
*   **The Ingress Catch:** A web application firewall (WAF) cannot inspect traffic it cannot read. If the incoming payload is encrypted, an upstream device—such as a reverse proxy, F5 load balancer, or Next-Gen Firewall—must first terminate the SSL/TLS connection and strip away the encryption.
*   **Payload Parsing:** Once the traffic is decrypted into plain text, the WAF looks past the basic IP and TCP routing headers. It scans the actual contents of the HTTP request, including headers, cookies, POST bodies, and query strings.
*   **Signature Matching:** The WAF immediately drops any requests containing known web attack strings, such as SQL injection payloads, malformed request structures, or the digital fingerprints of common vulnerability scanners.

### Active Interception & Behavioral Tests
*   **302 Redirect Loops:** The system tests whether a connecting client is a legitimate browser by forcing a brief HTTP redirect. This checks if the client can actually process and store cookies properly before letting them see the application page.
*   **JavaScript Proof-of-Work (PoW):** The system challenges the client's browser with a small mathematical puzzle. Real browsers (like Chrome or Safari) solve this instantly in the background without the user noticing. Automated headless scripts usually fail the challenge or spike their own CPU trying to process thousands of puzzles at once.

## 3. Cross-Layer Scrubbing Context
During a large-scale volumetric attack, running these heavy, deep HTTP inspections directly on raw internet links is impossible. The infrastructure would instantly become overwhelmed. Instead, the network relies on cross-layer scrubbing, using high-capacity Layer 3 and Layer 4 defenses to filter out the bulk of the attack traffic before it ever reaches the application layer.

To summarize: 
*   **Layer 3:** Inbound traffic is pulled via BGP diversion to a scrubbing network.
*   **Layer 4:** High-throughput firewalls immediately drop the volumetric SYN/UDP floods.
*   **Layer 7:** Only the clean-looking TCP traffic is passed to the WAF proxy nodes for deep packet inspection, protecting the origin web app server from collapsing.



