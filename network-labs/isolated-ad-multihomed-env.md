# Project: Isolated Active Directory Multi-Homed Lab Environment

## 🎯 Project Overview & Objective
Design and implement a highly secure, isolated "Black Site" Active Directory lab environment. The sandbox architecture ensures target virtual machines (VMs) are mathematically isolated from the physical host network layer while retaining controlled, outbound internet access via a secondary multi-homed NAT interface for updates and testing tools.

---

## 🗺️ Network Architecture & IP Schema

The lab leverages a **Dual-Homed configuration** across all virtual node deployments to strictly isolate service traffic from internet traffic:
*   **Interface 1 (Internal):** Dedicated purely to secure lab infrastructure traffic (Active Directory, SMB, DNS, DHCP). **Outbound Internet is blocked.**
*   **Interface 2 (NAT):** Dedicated exclusively to outbound internet access (System updates, remote packages, forwarded DNS queries).

### 📊 Network Addressing Matrix (Subnet: 192.168.1.0/26)

| Host Node Asset | Internal IP Target | Infrastructure Role | MAC Allocation Strategy |
| :--- | :--- | :--- | :--- |
| **VirtualBox Host** | `192.168.1.1` | Virtual Gateway Layer | Inactive / Silenced in Internal Mode |
| **WinServer2022** | `192.168.1.2` | **Domain Controller (DC)** / DNS / DHCP Server | Static Manual Assignment |
| **Win10 Pro** | `192.168.1.10` | Domain Member Client Target Workstation | Automated DHCP Reservation |
| **Kali Linux** | `192.168.1.11` | Attacker Testing Node | Automated DHCP Reservation |

---

## 🧠 Infrastructure Configuration (The Lab Brain)

### 🖥️ Windows Server 2022 Core Baseline
1. **Interface Settings:** Configured static IP `192.168.1.2` on the internal network card. **Left the Default Gateway field entirely BLANK** to avoid interface routing metric conflicts with the secondary NAT adapter.
2. **DNS Topology:** Bound primary DNS resolution vectors locally to the loopback address (`127.0.0.1`).
3. **Active Directory:** Initialized a new Active Directory Forest instance mapped to domain: **`lab.local`** (NetBIOS: `LAB`).
4. **DHCP Scope Allocations:**
   * **Distribution Range:** `192.168.1.12` to `192.168.1.62`
   * **Reservations:** Wired hardware static reservations matching client VirtualBox MAC strings for the Win10 Client (`.10`) and Kali Attacker (`.11`).
   * **Option 003 (Router/Gateway):** Set to `192.168.1.1` (Temporarily deactivated until a dedicated lab firewall/router node is spun up).
   * **Option 006 (DNS Servers):** Explicitly distributed as `192.168.1.2`.
5. **DNS Forwarder Integration:** Seeded upstream public DNS addresses (`8.8.8.8`) within the core DNS manager engine (`dnsmgmt.msc`) to allow isolated clients to safely resolve external domain queries via the DC proxy link.

---

## 🔒 The "Black Site" Transition & Isolation Strategy

To achieve absolute environment isolation, the standard VirtualBox default host behaviors were systematically disabled to avoid interference:
1. **Kill Host DHCP Daemons:** Executed the administrative command-line utility on the parent physical host machine to wipe out conflicting host-only address arrays:
   ```bash
   VBoxManage dhcpserver remove --netname HostInterfaceNetworking
   ```
2. **Internal Network Shift:** Transitioned all active VM network adapter configurations from traditional "Host-Only" hooks into an isolated **Internal Network** tier named explicitly: **`LabNetwork`**.

---

## ⚙️ Endpoint Operational Configurations

### 💻 Windows 10 Pro (The Target Endpoint)
* **Domain Adjacency:** Successfully joined to the `lab.local` domain architecture.
* **Firewall Scoping:** Provisioned custom targeted inbound firewall exclusions allowing precise penetration testing capabilities across the **Domain Profile** network layer:
  ```powershell
  # Surgically permit ICMPv4 diagnostics and SMB scanning traffic
  Enable-NetFirewallRule -DisplayName "File and Printer Sharing (Echo Request - ICMPv4-In)"
  Enable-NetFirewallRule -DisplayGroup "File and Printer Sharing"
  ```
* **DNS Matrix Cleanup:** Disabled the default setting *"Register this connection's address in DNS"* on the internet-facing **NAT interface** properties card. This blocks rogue NAT-allocated IPs or IPv6 junk strings from contaminating the internal Active Directory database zones.

### 🐉 Kali Linux (The Attacker Endpoint)
* **Interface `eth0` Mapping:** Bound interface mode configuration to **DHCP** to automatically catch the dedicated `.11` IP address reservation assignment from the DC.
* **Name Resolution Tuning (`/etc/nsswitch.conf`):** Modified the host lookup hierarchy string line to place `dns` explicitly ahead of `mdns4_minimal`. This completely stops Ubuntu/Debian `.local` mDNS multicast resolution components from hijacking active corporate Active Directory queries.
* **NetworkManager Route Optimization:**
  * **Interface Route Metrics:** Assigned the NAT internet interface (`eth1`) an operational priority metric of **`50`**, and assigned the internal lab interface (`eth0`) a priority metric of **`200`**. This guarantees outbound internet requests automatically prefer exiting via the NAT gateway.
  * **DNS Resolution Priority Selection:** Set the internal lab interface (`eth0`) DNS selection index explicitly to **`-1`**. This forces the internal Domain Controller (`192.168.1.2`) to stay permanently pinned at the absolute top of the client `/etc/resolv.conf` file descriptor map.

---

## 🔍 Operational Verification & Maintenance Quick-Reference

Use this technical dictionary checklist to maintain system configurations and verify the health of the sandbox space:

```bash
# 1. Inspect live host routing table metrics and interface paths
ip route

# 2. Force the internal lab interface DNS selection to hold top priority priority
sudo nmcli connection modify "Wired 1" ipv4.dns-priority -1

# 3. Request immediate IP renewals from administrative command line prompts
ipconfig /renew                # Executed on Windows Target nodes
sudo nmcli con up "Wired 1"    # Executed on Kali Attacker nodes

# 4. Audit domain health, Active Directory service mapping, and DNS records
nslookup lab.local             # Basic check
dig @192.168.1.2 lab.local     # Deep Linux dig query
```

---

## ⚠️ Known Gotchas & Troubleshooting Realities
* **The Kali DNS Overwrite Issue:** If the Kali Linux machine suddenly loses standard internet access or fails to look up external domains, the local system system tools have likely allowed the NAT DHCP server to overwrite name lookups. Always execute `cat /etc/resolv.conf` first to confirm your internal Windows Server (`192.168.1.2`) remains active at the top of the file mapping list.
