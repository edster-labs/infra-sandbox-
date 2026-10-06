# Technical Analysis: WPA3 SAE (Dragonfly) & The 4-Way Handshake

## 🎯 Conceptual Architecture
In modern WPA3-Personal Wi-Fi environments, client authentication and packet data protection are split into two sequential steps: **SAE (Key Negotiation)** followed by the **4-Way Handshake (Session Deployment)**.

---

## 🎨 Part 1: Diffie-Hellman Key Exchange (The Color Mixing Analogy)
To establish a unique Pairwise Master Key (PMK) over a hostile wireless medium without exposing the actual password, the system uses Simultaneous Authentication of Equals (SAE), powered by Diffie-Hellman mathematics.

```text
[Public Channel Parameter] ───> Agreed Color: YELLOW (Visible to all sniffers)

  Supplicant (Phone Node)                             Authenticator (Access Point)
  ┌────────────────────────┐                          ┌────────────────────────┐
  │ Secret: RED            │                          │ Secret: BLUE           │
  │ Mixes: Red + Yellow    │                          │ Mixes: Blue + Yellow   │
  └───────────┬────────────┘                          └───────────┬────────────┘
              │ (Sends ORANGE)                             │ (Sends GREEN)
              └───────────────► ─── [ AIRWAVES ] ─── ◄─────┘
              │                                           │
  ┌───────────▼────────────┐                          ┌───────────▼────────────┐
  │ Takes AP Green Mix     │                          │ Takes Phone Orange Mix │
  │ Adds Secret RED        │                          │ Adds Secret BLUE       │
  ├────────────────────────┴──────────────────────────┴────────────────────────┤
  │ Shared Value Concluded: BROWNISH SEED MATRIX (The Pairwise Master Key / PMK)│
  └────────────────────────────────────────────────────────────────────────────┘
```
* **The Security Advantage:** An eavesdropping attacker only observes the transmission of the raw public variables (`Yellow`, `Orange`, and `Green`). They cannot calculate the final `Brownish` master seed because they do not own either of the local private source secrets (`Red` or `Blue`). 

---

## 🏗️ Part 2: The 4-Way Handshake & The PTK "Utility Belt"

Once SAE delivers the unique, mathematically isolated **PMK**, the system initiates the 4-Way Handshake. This process combines the PMK with random hardware inputs—the Access Point Nonce (**ANonce**), the Supplicant Nonce (**SNonce**), and the device **MAC addresses**—through a Pseudo-Random Function (**HMAC-SHA256**) to forge a one-time-use session bundle called the **Pairwise Transient Key (PTK)**.

The resulting PTK is partitioned into three distinct operational keys, acting like a utility belt:
```text
      ┌───► KCK (Key Confirmation Key) ───> The Wax Seal (Calculates the MIC Integrity)
      │
PTK  ─┼───► KEK (Key Encryption Key)   ───> The Privacy Wrapper (Encrypts Group Keys)
      │
      └───► TK (Temporal Key)          ───> The Workhorse (High-Speed AES Data Lock)
```

1.  **KCK (Key Confirmation Key):** Provides message integrity. It calculates the **Message Integrity Check (MIC)** string. This acts like a digital wax seal, proving both nodes hold the identical PMK without ever exposing the key over the air.
2.  **KEK (Key Encryption Key):** Provides key privacy. It encrypts downstream keys, like wrapping up the Group Temporal Key (GTK) used for broadcast/multicast network discoveries before transport.
3.  **TK (Temporal Key):** The infrastructure workhorse. Once the handshake is complete, this key encrypts and decrypts all your actual internet traffic (HTTPS, data frames) using high-speed symmetric **AES-GCM**.

---

## 🔍 The 4-Way Handshake Workflow

```text
Step 1: [AP] ─────────────── ANonce (Random Value) ───────────────> [Phone]
        * Phone catches the ANonce, generates its own SNonce, and computes the PTK.

Step 2: [AP] <────────── SNonce + MIC (Signed via KCK) ─────────── [Phone]
        * AP computes the PTK locally, verifies the MIC. If it matches, the password is valid!

Step 3: [AP] ────────── MIC + GTK (Encrypted via KEK) ──────────> [Phone]
        * AP passes the group wireless keys. Phone checks the MIC to verify the AP is real.
```
