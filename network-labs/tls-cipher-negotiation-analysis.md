# Project: Analyzing Cryptographic TLS Handshake Failures & Cipher Selection

## 🎯 Lab Scenario & Project Overview
* **Objective:** Diagnose why an active network communication link between a Kali Linux client probe and a Windows 10 IIS FTP/Web target server defaulted to an archaic cipher profile, despite both nodes supporting modern secure encryption standards.
* **Target Node IP:** `192.168.1.10` (Windows 10 Pro Environment)
* **Client Node IP:** `192.168.1.11` (Kali Linux Testing Node)

---

## 🔍 Forensic Data Captures

### 1. External Client Auditing (Nmap SSL Script Scan)
Running an active enumeration check from the Kali client highlights the supported TLS versions and cryptographic offerings exposed on target Port 21:
```bash
nmap --script ssl-enum-ciphers -p 21 192.168.1.10
```
*Key Diagnostic Output Fields:*
```text
PORT   STATE SERVICE
21/tcp open  ftp
| ssl-enum-ciphers: 
|   TLSv1.2: 
|     ciphers: 
|       TLS_RSA_WITH_AES_256_GCM_SHA384 (rsa 2048) - A
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp384r1) - A
|       TLS_DHE_RSA_WITH_AES_256_GCM_SHA384 (dh 2048) - A
|     warnings: 
|       64-bit block cipher 3DES vulnerable to SWEET32 attack
|_  least strength: C
```

### 2. Target Server Supported Protocols (PowerShell Cipher Suite Dump)
Running an internal check on the target Windows system confirms that the machine natively supports premium modern ciphers:
```powershell
PS C:\Users\Administrator> (Get-TlsCipherSuite).Name
# Top Tier Offerings Available:
TLS_AES_256_GCM_SHA384 (TLS 1.3 King)
TLS_AES_128_GCM_SHA256
TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (Modern TLS 1.2 Standard)
```

---

## 📊 The "Smoking Gun" Wireshark Packet Breakdown
During a raw network packet capture tracing the initial **Client Hello** transaction frame, the client explicitly presented its cipher capabilities layout:

```text
Frame 22: 462 bytes captured on interface eth0
Source: 192.168.1.11 (Kali Client) ──> Destination: 192.168.1.10 (IIS Server)
Protocol: Transport Layer Security (TLSv1.2 Record Layer)

Handshake Protocol: Client Hello
  Version: TLS 1.2 (0x0303)
  Supported Versions Extension: TLS 1.3, TLS 1.2, TLS 1.1, TLS 1.0
  Cipher Suites Array (29 suites offered in preference order):
    [1]  TLS_AES_256_GCM_SHA384 (0x1302)
    [5]  TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 (0xc02c)
    [12] TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (0xc030)
    [17] TLS_RSA_WITH_AES_256_GCM_SHA384 (0x009d) <── SELECTION SETTLED HERE
```

---

## 🧩 Architectural Post-Mortem: Why Did Negotiation Fail?

### The Core Mystery
The Kali client offered the ultimate cryptographic profile (`TLS_AES_256_GCM_SHA384`), and the internal Windows settings confirmed the server supported it. Yet, the handshake bypassed the top 16 modern choices and settled on **Option #17: `TLS_RSA_WITH_AES_256_GCM_SHA384`**.

### The Root Cause Identification
1. **Self-Signed RSA Certificate Constraints:** The target IIS server was configured using a basic, self-signed RSA signature key. 
2. **Elliptic Curve Ephemeral (ECDHE) Blockages:** Modern forward-secrecy cipher options (like the top 16 Elliptic Curve options) require highly specific digital signature handshakes to safely compute parameters. 
3. **The Fail-Safe Fallback:** Because the server's certificate was structurally missing key extensions or lacked perfect geometric compatibility with the client's elliptic curve parameters, the server played it safe. It bypassed the superior ciphers and dropped down to the highest available **Static RSA Cipher** guaranteed to establish data exchange using a basic certificate structure.
