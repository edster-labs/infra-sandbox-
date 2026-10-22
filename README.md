
Welcome to the master infrastructure lab and sandbox repository. This environment serves as a centralized, living engineering notebook tracking configurations, network deployments, and security validations.

## 📁 Repository Directory

* ⚙️ **System Architecture:** [Go to Infrastructure Blueprints](./system-architecture/)
* 📑 **Cheat Sheets:** [Go to Reference Guides](./cheat-sheets/)
* 📡 **EVE-NG Guides:** [Go to Deployment Documentation](./eve-ng-guides/)
* 💻 **Network Labs:** [Go to Lab Topologies](./network-labs/)
* 🛡️ **Security Notebook:** [Go to Security Matrix](./sec-notebook/README.md)

<!-- tree -->
## 🌐 Architektúra repozitára / Technical Site Tree
<div class="site-tree-container" style="font-family: Arial; line-height: 1.6; font-size: 17px;">
  <p style="margin: 0; font-weight: bold; font-size: 20px;">[infra-sandbox-] (Root Adresár)</p>
  <ul style="list-style-type: none; margin: 0; padding-left: 20px; border-left: 1px dashed #CCCCCC;">
    <li style="margin-top: 10px;">
      <details open style="cursor: pointer;">
        <summary style="font-weight: bold; color: #f1f5f9;">📁 [cheat-sheets]</summary>
        <ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./cheat-sheets/linux-dhcp-dnsmasq-setup.md" style="font-weight: 600; font-size: 17px;">linux-dhcp-dnsmasq-setup.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Linux Network Administration: Building Isolated DHCP Core Nodes)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./cheat-sheets/linux-ip-route-cheat-sheet.md" style="font-weight: 600; font-size: 17px;">linux-ip-route-cheat-sheet.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Linux Network Administration: Interface IP & Route Management)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./cheat-sheets/linux-netplan-configuration.md" style="font-weight: 600; font-size: 17px;">linux-netplan-configuration.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Linux Netplan Interface Configuration)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./cheat-sheets/win-powershell-firewall-rules.md" style="font-weight: 600; font-size: 17px;">win-powershell-firewall-rules.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Windows PowerShell Advanced NetFirewall Configurations)</span>
          </li>
        </ul>
      </details>
    </li>
    <li style="margin-top: 10px;">
      <details open style="cursor: pointer;">
        <summary style="font-weight: bold; color: #f1f5f9;">📁 [eve-ng-guides]</summary>
        <ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/cisco-iol-installation-guide.md" style="font-weight: 600; font-size: 17px;">cisco-iol-installation-guide.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Cisco IOS-on-Linux (IOL/IOU) Images & Licensing Integration)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/cisco-iosv-qemu-installation.md" style="font-weight: 600; font-size: 17px;">cisco-iosv-qemu-installation.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Cisco IOSvL2 (QEMU Image) Appliance Deployment Setup)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-bridge-deadlock-fix.md" style="font-weight: 600; font-size: 17px;">eve-bridge-deadlock-fix.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Resolving Linux Networking Service Deadlocks & Phantom Bridges)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-bridge-speed-optimization.md" style="font-weight: 600; font-size: 17px;">eve-bridge-speed-optimization.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Tuning EVE-NG Kernel Bridges & Fixing DHCP Blackouts)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-gui-recovery-protocol.md" style="font-weight: 600; font-size: 17px;">eve-gui-recovery-protocol.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Diagnostic & Recovery Protocol for EVE-NG GUI Login Failures)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-node-template-naming.md" style="font-weight: 600; font-size: 17px;">eve-node-template-naming.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Modifying Default EVE-NG Node Templates & Hostnames)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-qemu-directory-rules.md" style="font-weight: 600; font-size: 17px;">eve-qemu-directory-rules.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (EVE-NG QEMU Appliance Directory Strategy & Image Provisioning)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-virtual-cable-lifecycle.md" style="font-weight: 600; font-size: 17px;">eve-virtual-cable-lifecycle.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Technical Analysis: The Lifecycle of a Virtual Cable Interface)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/eve-vmware-nic-mapping.md" style="font-weight: 600; font-size: 17px;">eve-vmware-nic-mapping.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (EVE-NG to VMware Interface Matrix & Topology Bridging)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/linux-apt-dependency-repair.md" style="font-weight: 600; font-size: 17px;">linux-apt-dependency-repair.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Linux System Administration: Repairing Corrupted APT Package Lists)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./eve-ng-guides/qemu-image-baking-guide.md" style="font-weight: 600; font-size: 17px;">qemu-image-baking-guide.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (QEMU Master Image Building & Snapshot Commit Process)</span>
          </li>
        </ul>
      </details>
    </li>
    <li style="margin-top: 10px;">
      <details open style="cursor: pointer;">
        <summary style="font-weight: bold; color: #f1f5f9;">📁 [network-labs]</summary>
        <ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/cisco-eigrp-routing-lab.md" style="font-weight: 600; font-size: 17px;">cisco-eigrp-routing-lab.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Lab: EIGRP Multi-Router Architecture & Path Manipulation)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/cisco-ospfv2-single-area.md" style="font-weight: 600; font-size: 17px;">cisco-ospfv2-single-area.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Case Study: OSPFv2 Single-Area Core Topology & VLSM Design)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/cisco-ripv2-routing-lab.md" style="font-weight: 600; font-size: 17px;">cisco-ripv2-routing-lab.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Lab: RIPv2 Dynamic Routing & Passive Interface Optimization)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/dhcp-relay-concept-and-implementation.md" style="font-weight: 600; font-size: 17px;">dhcp-relay-concept-and-implementation.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Basic and conceptual Layer 3 DHCP Relay Reference Architecture)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/inception-bridge-routing-project.md" style="font-weight: 600; font-size: 17px;">inception-bridge-routing-project.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Project: The Inception Bridge & Isolated Routing Matrix)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/isolated-ad-multihomed-env.md" style="font-weight: 600; font-size: 17px;">isolated-ad-multihomed-env.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Project: Isolated Active Directory Multi-Homed Lab Environment)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/lubuntu-internet-rdp-bake.md" style="font-weight: 600; font-size: 17px;">lubuntu-internet-rdp-bake.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Deploying High-Performance RDP Access on Isolated Linux Lab Nodes)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/root_guard_behavior.md" style="font-weight: 600; font-size: 17px;">root_guard_behavior.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Root Guard Behavior Lab)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./network-labs/tls-cipher-negotiation-analysis.md" style="font-weight: 600; font-size: 17px;">tls-cipher-negotiation-analysis.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Project: Analyzing Cryptographic TLS Handshake Failures & Cipher Selection)</span>
          </li>
        </ul>
      </details>
    </li>
    <li style="margin-top: 10px;">
      <details open style="cursor: pointer;">
        <summary style="font-weight: bold; color: #f1f5f9;">📁 [sec-notebook]</summary>
        <ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./sec-notebook/cryptography-cipher-theory.md" style="font-weight: 600; font-size: 17px;">cryptography-cipher-theory.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Cryptographic Reference: Parsing TLS 1.2 vs. TLS 1.3 Ciphers)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./sec-notebook/wireless-security-evolution.md" style="font-weight: 600; font-size: 17px;">wireless-security-evolution.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Reference: Wireless Security Frameworks & Encryption Engines)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./sec-notebook/wpa3-sae-fourway-handshake.md" style="font-weight: 600; font-size: 17px;">wpa3-sae-fourway-handshake.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (Technical Analysis: WPA3 SAE (Dragonfly) & The 4-Way Handshake)</span>
          </li>
        </ul>
      </details>
    </li>
    <li style="margin-top: 10px;">
      <details open style="cursor: pointer;">
        <summary style="font-weight: bold; color: #f1f5f9;">📁 [system-architecture]</summary>
        <ul style="list-style-type: none; padding-left: 20px; margin-top: 4px;">
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./system-architecture/ci-cd-ui-ux-frameworks.md" style="font-weight: 600; font-size: 17px;">ci-cd-ui-ux-frameworks.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (🔄 Real-World Case Study: Applying CI/CD and UI/UX to This Sandbox)</span>
          </li>
          <li style="margin-bottom: 4px; font-size: 17px;">
            ├── <a href="./system-architecture/pipeline-architecture.md" style="font-weight: 600; font-size: 17px;">pipeline-architecture.md</a>
            <span style="color: #cbd5e1; font-size: 17px;">... (🛠️ Autonomous Documentation Engine & CI/CD Pipeline Architecture)</span>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</div>
<!-- endtree -->


