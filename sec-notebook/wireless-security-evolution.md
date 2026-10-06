# Reference: Wireless Security Frameworks & Encryption Engines
<!-- toc -->
## 🎯 The Holy Trinity of Network Security Architecture
Modern, high-security infrastructure design relies on a precise three-part cryptographic blueprint to defend data over the air:
*   🔒 **RSA (Asymmetric) provides the TRUST:** Confirms the identity of the server/gateway (e.g., verifying a RADIUS server's certificate within an EAP-TLS handshake to prevent rogue access points).
*   🔀 **Diffie-Hellman provides the PRIVACY:** Establishes **Perfect Forward Secrecy (PFS)** by dynamically computing short-lived keys that cannot be calculated retroactively even if a master password is leaked.
*   ⚡ **AES (Symmetric) provides the SPEED:** Handles the heavy lifting of high-speed bulk data packet encryption across the wireless spectrum.

---

## 📊 Evolutionary Wireless Security Matrix

| Standard Profile | Base Standard | 802.1X Support | Encryption Engine | Integrity Mechanism (MIC) | Lifecycle Status (2026) |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **WEP** | 802.11-1997 | No | RC4 (Stream) | CRC-32 (Weak ICV) | **Obsolete** |
| **TKIP** | 802.11i | Yes (WPA) | RC4 + Per-Packet Keying | Michael MIC | **Obsolete** |
| **WPA** | 802.11i | Yes | RC4 (with TKIP) | Michael MIC | **Obsolete** |
| **WPA2** | 802.11i | Yes | AES-CCMP (128-bit) | CBC-MAC | **Baseline Legacy** |
| **WPA3** | 802.11-2016+ | Yes | AES-GCMP (128-bit) | GMAC | **Standard Baseline** |
| **WPA3-Ent** | 802.11-2020+ | Yes | AES-GCMP (256-bit) | GMAC-256 | **High-Security Tier** |

---

## 🧠 Decoding Cipher Nomenclature: TLS 1.2 vs. TLS 1.3 vs. WPA3

You can read the underlying architectural mechanics of an encrypted session simply by analyzing how the naming strings are structured:

### 1. TLS 1.2 (Explicit Complex Design)
* **Example Name:** `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
* **Nomenclature Logic:** Manually spells out the entire operational engine: Key Exchange (`ECDHE`) + Authentication (`RSA`) + Bulk Encryption (`AES_256_GCM`) + Verification Hash (`SHA384`).

### 2. TLS 1.3 (Streamlined Design)
* **Example Name:** `TLS_AES_256_GCM_SHA384`
* **Nomenclature Logic:** Drops the key exchange listing entirely to keep strings clean. The system assumes a secure Elliptic Curve Ephemeral (ECC) exchange by default, listing only the data encryption and hash engines.

### 3. WPA3 (Ultra-Lean Protocol Target)
* **Example Name:** `AES-GCMP-256`
* **Nomenclature Logic:** Lists *only* the data muscle encryption format. The control layer handles authentication via Simultaneous Authentication of Equals (SAE/Dragonfly) behind the scenes.
<!-- endtoc -->
