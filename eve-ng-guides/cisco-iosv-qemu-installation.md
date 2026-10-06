# Cisco IOSvL2 (QEMU Image) Appliance Deployment Setup
<!-- toc -->
## 🎯 Purpose
Import official Cisco IOSv / IOSvL2 `.qcow2` virtual switch images into the QEMU layer of EVE-NG, resolving boot loop issues through image naming constraints.

---

## 🛠️ Step-by-Step Appliance Deployment Blueprint

### Step 1: Extract & Prepare the Image Asset locally
1. Decompress the target archive file on your local workstation: `Cisco IOSvL2-20250305T215209Z-001.zip`.
2. Locate the master compiled switch virtual disk file inside the unzipped folder: `vios_l2-adventerprisek9-m.ssa.high_iron_20200929.qcow2`.
3. **Crucial Step:** Rename that file on your local desktop computer to match this exact lowercase naming requirement:
   ```text
   virtioa.qcow2
   ```

### Step 2: Upload Files to the Backend System Directory
1. Open your SFTP/SCP client utility (e.g., WinSCP or FileZilla) and establish a secure connection to your EVE-NG host server.
2. Navigate to the explicit remote QEMU switch destination directory:
   ```text
   /opt/unetlab/addons/qemu/viosl2-iron-2020/
   ```
3. Drag and drop your newly renamed `virtioa.qcow2` file from your desktop into that folder, overwriting any bad or corrupted placeholder images.

### Step 3: Apply the Core Permissions Wrapper Repair
Return to your active EVE-NG terminal SSH session window and execute the security and ownership repair tool script to let the virtualization manager own the new file:
```bash
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

---

## 🔍 Validation & Verification
Power on your virtual switches within the EVE-NG browser graphics interface canvas. Open a console session to verify the node boots directly past the basic hardware initialization checks into the Cisco IOS command line terminal without getting caught in a perpetual boot loop.
<!-- endtoc -->
