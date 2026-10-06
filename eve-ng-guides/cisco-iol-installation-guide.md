# Cisco IOS-on-Linux (IOL/IOU) Images & Licensing Integration
<!-- toc -->
## 🎯 Objective
Install Cisco IOL Layer 3 binaries into the EVE-NG filesystem and generate a mathematically valid license validation key bound to the local host footprint.

---

## 📁 System Filesystem Layout
Move your files via SFTP/SCP client (e.g., WinSCP) to these explicit backend system directories:

*   **L3 Image Binary Path:** `/opt/unetlab/addons/iol/bin/i86bi_LinuxL3-AdvEnterpriseK9-M2_157_3_May_2018.bin`
*   **License Matrix Path:** `/opt/unetlab/addons/iol/bin/iourc`

*⚠️ **Critical File Constraint:** The license file must be named exactly `iourc` in lowercase. **Do not append any file extension** (e.g., avoid `iourc.txt`).*

---

## 🛠️ Deployment Steps

### 1. Generate the Mathematical Host License Key
Cisco IOL verifies an engine hashing loop that cross-references your string hostname and host hex ID. Run this Python automation layout directly inside the EVE-NG shell to compute the key and write the file automatically:

```bash
python3 -c '
import os
import socket
hostname = socket.gethostname()
print("="*40)
print(f"Generating IOURC for local hostname: {hostname}")
print("="*40)
ioukey = 0
for char in hostname:
    ioukey += ord(char)
ioukey = (ioukey * 582 + 9) & 0xffffffff
license_str = f"[license]\n{hostname} = {ioukey:016x};\n"
with open("/opt/unetlab/addons/iol/bin/iourc", "w") as f:
    f.write(license_str)
print("File successfully generated at: /opt/unetlab/addons/iol/bin/iourc")
print("Content Configuration Block:")
print(license_str)'
```

### 2. Clean Windows Text Artifacts
If the license matrix file was modified inside a Windows notepad app before transport, strip out hidden carriage return (`\r\n`) line terminators that cause license errors in Linux:
```bash
sed -i 's/\r$//' /opt/unetlab/addons/iol/bin/iourc
```

### 3. Repair File Permissions
Apply the core EVE security wrapper permissions fix across the entire root environment tree:
```bash
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

---

## 🔍 Verification Commands
Verify the contents of the license file:
```bash
cat /opt/unetlab/addons/iol/bin/iourc
```
*Expected output blueprint:*
```text
[license]
eve-ng = 0000000000052215;
```
<!-- endtoc -->
