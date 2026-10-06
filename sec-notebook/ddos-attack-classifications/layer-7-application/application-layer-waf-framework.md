# Layer 7: Application Layer & Web Application Firewall (WAF) Protections

## 1. The Application Target Profile
Layer 7 attacks do not try to flood your network bandwidth or break TCP tables. Instead, they try to kill the host CPU, tank database queries, or exhaust application worker processes by mimicking standard user actions.

## 2. Core Inspection Methods

### Deep Packet Inspection (DPI) & SSL Decryption
*   **The Ingress Catch:** A web application firewall cannot inspect traffic it cannot read. If the payload is encrypted, the proxy or scrubbing node must terminate the SSL/TLS connection first.
*   **Payload Parsing:** Once decrypted, the engine looks past the IP/TCP headers and scans the actual HTTP request headers, cookies, POST bodies, and query strings.
*   **Signature Matching:** Drops payloads containing known web attack strings (like SQL injection strings, bad request formatting, or common scanner signatures).

### Active Interception & Behavioral Tests
*   **302 Redirect Loops:** Testing if a client actually handles cookie storage properly by forcing a brief HTTP redirect before showing the application page.
*   **JavaScript Proof-of-Work (PoW):** Handing the connecting client a small mathematical puzzle. Legit browsers solve it instantly without the user seeing it. Automated headless scripts usually fail the challenge or spike their own CPU trying to run it thousands of times.

## 3. Cross-Layer Scrubbing Context
In a large scale attack, these high-overhead HTTP inspections are never done on raw internet links. 

*   **Layer 3:** Inbound traffic is pulled via BGP diversion to a scrubbing network.
*   **Layer 4:** High-throughput firewalls immediately drop the volumetric SYN/UDP floods.
*   **Layer 7:** Only the clean-looking TCP traffic is passed to the WAF proxy nodes for deep packet inspection, protecting the origin web app server from collapsing.

