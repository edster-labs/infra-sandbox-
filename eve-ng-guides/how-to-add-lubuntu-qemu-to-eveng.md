# Installing Lubuntu QEMU Nodes in EVE-NG Community Edition
<!-- toc -->
Modern network engineering labs frequently require multi-homed Linux workloads—such as web servers, database clusters, or application firewalls—that interface with multiple subnets across a topology. While external management virtual machines (such as a standalone `toaster` automation controller hosted directly on VMware Workstation) excel at Out-of-Band (OOB) script execution via Ansible or NETCONF, representing multi-interface workloads directly on the EVE-NG canvas requires a native QEMU virtual machine image.

Attempting to connect an external virtual machine to multiple subnets via separate EVE-NG Cloud objects (`Cloud0`, `Cloud1`, `Cloud2`) introduces severe visual clutter and false topology representations, making a single host appear as disjointed network icons. By deploying a dedicated Lubuntu 24.04 Desktop QEMU template inside EVE-NG, network engineers gain clean single-icon nodes with native, multi-interface bindings (`eth0`, `eth1`, `eth2`).

This guide details the end-to-end procedure for building, installing, committing, and verifying a permanent Lubuntu 24.04 template image within EVE-NG Community Edition.

---

## 1. Directory Structure and Image Preparation Rules

EVE-NG enforces strict naming conventions and directory hierarchies for QEMU image recognition. Deviating from these conventions causes node boot failures, missing template options, or QEMU parameter mismatches.

### Directory Naming and File Requirements

1. **Folder Prefix Constraint**: The QEMU directory inside `/opt/unetlab/addons/qemu/` must begin strictly with `linux-` (e.g., `linux-lubuntu-24.04`). If the directory lacks the `linux-` prefix, EVE-NG will fail to map the QEMU hardware parameters.
2. **ISO Image Identifier**: The installer ISO file must be named exactly `cdrom.iso`. EVE-NG will not attach arbitrary ISO filenames (such as `lubuntu-24.04.4-desktop-amd64.iso`) to the QEMU virtual CD-ROM drive.
3. **Virtual Disk Image**: A primary target disk formatted as `virtioa.qcow2` must exist within the directory prior to node power-on.

### Shell Execution: Directory Setup and Disk Creation

Execute the following commands in the EVE-NG SSH terminal to create the image directory, position the ISO file, generate a 20 GB virtual disk, and set system permissions:

```bash
mkdir -p /opt/unetlab/addons/qemu/linux-lubuntu-24.04
cd /opt/unetlab/addons/qemu/linux-lubuntu-24.04

# Copy or move your downloaded ISO into place as cdrom.iso
cp /path/to/lubuntu-24.04.4-desktop-amd64.iso cdrom.iso

# Create a 20GB Copy-on-Write QEMU disk
qemu-img create -f qcow2 virtioa.qcow2 20G
```

### Permission Script Path Resolution

A common operational error involves mistyping the EVE-NG wrapper script directory. The binary resides under `/opt/unetlab/wrappers/` (plural).

```bash
# Correct Wrapper Execution
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

If executed without the plural `wrappers` directory, the shell returns an error:
`-bash: /opt/unetlab/wrapper/unl_wrapper: No such file or directory`

### Directory Inspection

Confirm the directory structure before launching the EVE-NG Web UI:

```bash
root@eve-ng:/opt/unetlab/addons/qemu/linux-lubuntu-24.04# tree
.
├── cdrom.iso
└── virtioa.qcow2

0 directories, 2 files
```

---

## 2. EVE-NG Canvas Provisioning and Interface Topology

Once the directory and disk structures are established, the template becomes available in the EVE-NG node catalog under **Linux**.

### Recommended Node Configuration Parameters

To prevent installer crashes caused by memory starvation, specify appropriate hardware parameters during node addition:

| Parameter Field | Recommended Setting | Technical Purpose & Operational Constraint |
| :--- | :--- | :--- |
| **Node Template** | `Linux` | Standard QEMU wrapper for Linux guest OS operating systems. |
| **Image** | `linux-lubuntu-24.04` | Maps to `/opt/unetlab/addons/qemu/linux-lubuntu-24.04/`. |
| **RAM** | `2048` to `4096` MB | **Critical**: Default 1024 MB allocation causes out-of-memory (OOM) installer crashes during Lubuntu desktop initialization. |
| **CPU** | `2` Cores | Accelerates installation and desktop GUI responsiveness. |
| **Console** | `vnc` | Enables graphical display access for OS installation. |
| **Number of Interfaces** | `3` or `4` | Exposes native `eth0`, `eth1`, `eth2`, and `eth3` ports on a single canvas icon. |

### Dual-Plane Cabling Model

Connecting internal workload interfaces across separate functional planes ensures clean management and data path isolation:

* **Primary Interface (`eth0`)**: Connect to **`Management (Cloud0)`**. Bridges directly to VMware `VMnet8` (NAT) on subnet `192.168.36.0/24`. Receives DHCP address, enables Internet access for package updates (`apt update`), and allows OOB management/SSH access from `toaster` (`192.168.36.153`).
* **Secondary Interface (`eth1`)**: Connect to lab switch port (e.g., `SW1 Gi0/1` on `LAN30` / `VMnet2` / `192.168.213.0/24`). Handles in-band data traffic within the simulated network topology.
* **Tertiary Interface (`eth2`)**: Connect to secondary lab segments or DMZ firewalls for multi-homed server scenarios.

---

## 3. Operating System Installation and Media Unmounting

Powering on the newly provisioned node launches the QEMU instance with both `cdrom.iso` and `virtioa.qcow2` attached.

### Installer Execution Steps

1. Start the node on the EVE-NG canvas and click the node icon to open the **VNC Console**.
2. Select **Install Lubuntu 24.04 LTS** from the GRUB boot menu.
3. At the disk partitioning prompt, select **Erase Disk**. This target operates exclusively on the virtual disk (`virtioa.qcow2`) without impacting the underlying host or VMware filesystem.
4. Complete user account credentials, hostname assignment, and timezone settings, then click **Install**.

### Handling the Installation Completion Wizard

Upon installation completion, the installer displays a dialog box offering an immediate system reboot with a checked "Restart now" box alongside a "Done" button.

1. **Uncheck "Restart now"**: Prevents QEMU from initiating an automated soft reboot while `cdrom.iso` remains attached.
2. **Click "Done"**: Closes the installer wizard, returning the environment to the Live desktop.
3. **Graceful Shutdown**: Open the Lubuntu Start menu on the VNC desktop and select **Shut Down** (or stop the node from the EVE-NG canvas). A clean OS shutdown flushes unwritten cache buffers to the virtual disk.

### Renaming the Installation ISO

Once the VNC session closes and the node transitions to a stopped state, rename `cdrom.iso` to prevent EVE-NG from mounting the installer media on subsequent boots:

```bash
cd /opt/unetlab/addons/qemu/linux-lubuntu-24.04/
mv cdrom.iso cdrom.iso.bak
```

---

## 4. Committing Temporary Overlays to Base Image Template

EVE-NG Community Edition utilizes Copy-on-Write (CoW) overlays to isolate lab changes from base disk templates.

### Understanding EVE-NG Storage Architecture

When a QEMU node runs within an EVE-NG lab, all write operations occur inside a temporary session directory under `/opt/unetlab/tmp/0/<lab-uuid>/<node-id>/virtioa.qcow2`. Consequently, inspecting the base image file `/opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2` immediately post-installation reveals a tiny file size (~196 KB), despite the full operating system existing inside the node's overlay.

Unlike EVE-NG Professional Edition, which includes a GUI "Commit" menu item, EVE-NG Community Edition requires committing overlay data back to the base template via the QEMU CLI toolchain.

### Step-by-Step CLI Commit Procedure

#### Step 1: Ensure Node Shutdown
Verify on the EVE-NG web canvas that the Lubuntu node is in a **Stopped** (greyed-out) state to release file locks on `virtioa.qcow2`.

#### Step 2: Locate the Node Overlay Path
Search the temporary storage hierarchy for the target node's overlay disk:

```bash
root@eve-ng:/opt/unetlab/tmp/0# tree -L 2
.
├── 2a3ad599-c0cf-4686-bcbf-9b30e74c2aa4
│   └── 1
```

Or locate it dynamically:

```bash
find /opt/unetlab/tmp/ -name "virtioa.qcow2"
```

Output:
`/opt/unetlab/tmp/0/2a3ad599-c0cf-4686-bcbf-9b30e74c2aa4/1/virtioa.qcow2`

#### Step 3: Execute Image Commit
Merge the OS installation data from the overlay into the base template:

```bash
qemu-img commit /opt/unetlab/tmp/0/2a3ad599-c0cf-4686-bcbf-9b30e74c2aa4/1/virtioa.qcow2
```

Terminal Output:
`Image committed.`

#### Step 4: Verify Base Template Disk Expansion
Inspect the file size of the base template:

```bash
root@eve-ng:/opt/unetlab/addons/qemu/linux-lubuntu-24.04# ls -tlr
total 11244564
-rw-r--r-- 1 root root 3452508160 Nov  5 20:10 cdrom.iso.bak
-rw-r--r-- 1 root root 8061976576 Nov  9 13:36 virtioa.qcow2
```

The base virtual disk `virtioa.qcow2` expands from `196 KB` to `8,061,976,576 bytes` (~8.06 GB), confirming that the complete OS installation has been committed into the base template image.

#### Step 5: Re-Apply EVE-NG File Permissions
Set ownership and access rights across the newly expanded template:

```bash
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

---

## 5. Storage Audit and Template Reusability

Following the base image commit, verify that host storage capacity remains sufficient for ongoing topology expansion.

### Storage Capacity Inspection

```bash
root@eve-ng:/opt/unetlab/addons/qemu/linux-lubuntu-24.04# df -h
Filesystem                         Size  Used Avail Use% Mounted on
tmpfs                              967M  1.7M  965M   1% /run
/dev/mapper/ubuntu--vg-ubuntu--lv  136G   30G  101G  23% /
tmpfs                              4.8G     0  4.8G   0% /dev/shm
tmpfs                              5.0M     0  5.0M   0% /run/lock
tmpfs                              4.8G     0  4.8G   0% /run/qemu
/dev/sda2                          2.0G  336M  1.5G  19% /boot
tmpfs                              967M  4.0K  967M   1% /run/user/0
```

101 GB of available disk space on the root logical volume (`/dev/mapper/ubuntu--vg-ubuntu--lv`).
<!-- endtoc -->
