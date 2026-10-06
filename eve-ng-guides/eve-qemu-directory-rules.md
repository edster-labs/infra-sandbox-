# EVE-NG QEMU Appliance Directory Strategy & Image Provisioning
<!-- toc -->
## 🎯 Purpose
Document the mandatory directory structures and file-naming rules required by the EVE-NG QEMU engine to systematically recognize Cisco switches, routers, and pfSense appliances.

---

## 📋 Master Storage Architecture
All uploaded virtual appliances must reside within subfolders under the root QEMU tree: `/opt/unetlab/addons/qemu/`.

| Appliance Type | Required Folder Name Prefix | Required Internal Disk Filename | Required Installation Media |
| :--- | :--- | :--- | :--- |
| **Cisco IOSv-L2** | `viosl2-` (e.g., `viosl2-iron-2020`) | `virtioa.qcow2` | *None (Direct deployment)* |
| **Cisco IOSv 15.9**| `vios-` (e.g., `vios-15.9.3-M6`) | `virtioa.qcow2` | *None (Direct deployment)* |
| **pfSense Firewall**| `pfsense-` (e.g., `pfsense-netgate-2.7`) | `virtioa.qcow2` | `cdrom.iso` (Remove after setup) |

---

## 🛠️ Step-by-Step Installation Procedures

### A. Cisco IOSv-L2 (Layer 2 / Layer 3 Switching Node)
1. Initialize the deployment target directory folder:
   ```bash
   mkdir -p /opt/unetlab/addons/qemu/viosl2-iron-2020
   ```
2. Transfer your source `.qcow2` switch disk image file into the folder using an SFTP client (e.g., WinSCP).
3. Change the name of the switch disk asset to match the engine specification: **`virtioa.qcow2`**

### B. Cisco IOSv 15.9(3)M6 (Enterprise Core Router Node)
1. Initialize the router target system directory path:
   ```bash
   mkdir -p /opt/unetlab/addons/qemu/vios-15.9.3-M6
   ```
2. Upload the raw source router `.qcow2` appliance asset.
3. Standardize the root filename identifier to: **`virtioa.qcow2`**

### C. pfSense Firewall (Custom OS Media Installation)
1. Initialize the target firewall deployment path:
   ```bash
   mkdir -p /opt/unetlab/addons/qemu/pfsense-netgate-1.1.1
   ```
2. Upload a blank 100GB placeholder hard disk array asset named `empty100G.qcow2` and rename it to **`virtioa.qcow2`**.
3. Upload your firewall setup ISO bundle asset and name it exactly **`cdrom.iso`**.
4. Launch the virtual node inside the EVE-NG graphic canvas interface, open the VNC/Telnet control display console, and complete the firewall installation wizard steps directly onto the empty `virtioa.qcow2` disk asset.
5. **⚠️ Crucial Post-Install Step:** Once the installation wizard states it is complete, power off the node in the web console, navigate back to the system directory, and **permanently delete `cdrom.iso`**. If omitted, the node will enter a perpetual boot loop back into the installation interface menu.

---

## ⚙️ Hypervisor Performance Optimization
Every time an image is modified, added, or renamed, you must trigger the native filesystem permissions repair tool wrapper utility:
```bash
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

*💡 **The Architecture Golden Rule:** Ensure that `Intel VT-x/EPT` or `AMD-V/RVI` nested hardware virtualization toggles are explicitly enabled inside your parent VMware Workstation system processor properties screen. If disabled, QEMU engine nodes will lock up or fail to process commands.*
<!-- endtoc -->
