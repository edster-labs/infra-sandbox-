# QEMU Master Image Building & Snapshot Commit Process

## 🎯 Purpose
Build clean master operating system templates (Lubuntu, pfSense, Cisco IOSvL2) within the QEMU environment, and commit active disk changes back to base configurations.

---

## 🏗️ Part 1: Initializing Bare-Metal Node Disks (From Scratch)

### 1. Build the Directory Framework
EVE-NG strictly mandates explicit directory naming standards based on node architecture type. Navigate to the QEMU storage layer and provision the new node folder:
```bash
mkdir -p /opt/unetlab/addons/qemu/linux-lubuntu-22.04
cd /opt/unetlab/addons/qemu/linux-lubuntu-22.04
```

### 2. Format Core Media & Storage Disks
Stage your base installation ISO and create a blank virtual hard drive array:
*   **ISO File Constraint:** Rename your installation source to exactly `cdrom.iso`.
*   **Virtual Disk Provisioning:** Generate an empty `qcow2` master disk file matching this naming convention:

```bash
# Rename the setup source image
mv lubuntu-22.04.5-desktop-amd64.iso cdrom.iso

# Generate a 20GB QCOW2 storage target
/opt/qemu/bin/qemu-img create -f qcow2 virtioa.qcow2 20G
```

---

## 💾 Part 2: Baking & Committing Temporary Installation Snapshots
Because the EVE-NG Community layout creates volatile nodes inside a temporary tracking area, operations performed during an OS setup must be manually baked back into the master workspace.

### 1. Locate the Volatile Live Instance Disk
Boot the node via the web GUI, complete the installation profile, and stop just before clicking restart. Open the EVE terminal and run a query to locate the active volatile runtime snapshot:
```bash
find /opt/unetlab/tmp/0/ -name "*.qcow2" | grep linux-lubuntu
```
*Example runtime output path discovered:*
`/opt/unetlab/tmp/0/bbdd2f0b-8958-4ac0-850d-a16b25065363/3/virtioa.qcow2`

### 2. Verify Instance Authenticity
Ensure the target disk block size matches live active modification stamps before executing structural changes:
```bash
ls -lh /opt/unetlab/tmp/0/bbdd2f0b-8958-4ac0-850d-a16b25065363/3/virtioa.qcow2
```

### 3. Execute Core Disk Data Commit
Commit the temporary database data structures backward directly into the master root disk asset:
```bash
/opt/qemu/bin/qemu-img commit /opt/unetlab/tmp/0/bbdd2f0b-8958-4ac0-850d-a16b25065363/3/virtioa.qcow2
```
*Expected response validation:* **`Image committed.`**

---

## 🧹 Part 3: Environment Cleanup Checklist
1. **Stop the Active Instance:** Turn off the node inside the EVE graphic control dashboard.
2. **Move installer out of loop:** Rename or delete `cdrom.iso` to prevent the loop setup running at next boot:
   ```bash
   mv cdrom.iso cdrom.iso.bak
   ```
3. **Execute Wipe Action:** Right-click the node block in the GUI canvas and choose **Wipe** to clear old cache arrays.
4. **Fix System Rights:** Run the global permissions repair wrapper command:
   ```bash
   /opt/unetlab/wrappers/unl_wrapper -a fixpermissions
   ```
