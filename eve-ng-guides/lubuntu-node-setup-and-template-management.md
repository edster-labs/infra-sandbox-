# EVE-NG Lubuntu Node Setup & Template Management

A practical guide to building, customizing, and maintaining Lubuntu QEMU templates in EVE-NG—covering overlay mechanics, FreeRADIUS setup, safe base-image updates, and storage cleanup.

---

## 1. How EVE-NG Handles Disks Under the Hood

Understanding how QEMU and EVE-NG manage virtual disks prevents file-lock errors and accidental data loss.

### Disk Storage vs. RAM
* **Persistent Overlay Storage:** Session files inside `/opt/unetlab/tmp/0/...` live on your server's **hard drive**, not in RAM. Any packages you install, files you create, or settings you change remain saved on disk even after shutting down the node or rebooting the EVE-NG host.

### Overlay Chains (Backing Files)
* **Read-Only Base Images:** When a node boots in a lab, EVE-NG never modifies the master base image directly.
* **Delta Overlays:** Instead, EVE-NG creates a small overlay file at `/opt/unetlab/tmp/0/<lab-uuid>/<node-id>/virtioa.qcow2` that records only the *differences* (deltas) made after boot. That overlay points back to the master image as its read-only backing file.

### Why Direct Overwrites Fail (`Failed to get "write" lock`)
If you try to run `qemu-img convert` directly from the temporary overlay onto the master `virtioa.qcow2`, QEMU throws a **write-lock error**—even when the node is shut down and `fuser -v` shows zero active processes. 

* **The Cause:** When `qemu-img convert` opens the source overlay, it automatically opens its linked backing image (`virtioa.qcow2`) to read the base OS data. Because the target path is the exact same file, QEMU locks itself out.
* **The Solution:** Convert the image to a temporary filename (`virtioa.qcow2.new`) first, then use `mv` to atomically rename and replace the old base image.

### The Three-Step Commit Flow
1. **`qemu-img convert` (Merge):** Reads the original base image plus all overlay changes and writes a single standalone disk named `virtioa.qcow2.new` inside the template directory.
2. **`mv` (Swap):** Renames `virtioa.qcow2.new` to `virtioa.qcow2`, deleting the old base image and putting the updated one in its place. (This is why `.new` disappears after running `mv`.)
3. **`unl_wrapper` (Permissions):** Fixes file ownership and permissions so EVE-NG can boot new nodes from the updated disk.

---

## 2. Network Cabling and Package Installation

### Cabling for Internet Access
1. Connect **eth0** of the Lubuntu node to **Management (Cloud0)** on the EVE-NG canvas.
2. Cloud0 bridges to the host NAT adapter (e.g., VMware VMnet8), providing DHCP and outbound internet access.
3. Power on the node and open the **VNC Console**.

### Installing Packages
Open a terminal inside the Lubuntu desktop and install your required tools:

```bash
# Update package repositories
sudo apt update

# Install FreeRADIUS server and client utilities
sudo apt install -y freeradius freeradius-utils

# (Optional) Install Chromium browser on the base node
sudo apt install -y chromium-browser
```

---

## 3. FreeRADIUS Configuration and Testing

FreeRADIUS configuration files are located under `/etc/freeradius/3.0/`.

### Step 1: Add a Local Test User
Edit the user authorization file (located at `/etc/freeradius/3.0/mods-config/files/authorize` on some Ubuntu builds):

```bash
sudo nano /etc/freeradius/3.0/users
```

Add a test account entry at the top of the file:

```text
# Local Test Account
testuser  Cleartext-Password := "password123"
```

### Step 2: Define Network Clients
To allow lab switches or routers to authenticate against this server, edit `/etc/freeradius/3.0/clients.conf`:

```text
client lab_network {
    ipaddr      = 192.168.0.0/16
    secret      = radius_shared_secret
    shortname   = lab-switches
}
```

### Step 3: Restart Service and Verify Authentication
Restart the daemon to apply your changes:

```bash
sudo systemctl restart freeradius
```

Test authentication locally using `radtest`:

```bash
radtest testuser password123 127.0.0.1 0 testing123
```

* **`Received Access-Accept`:** Configuration and credentials are working.
* **`Received Access-Reject`:** Something failed. Run FreeRADIUS in foreground debug mode to inspect live logs:

```bash
# Stop the background service
sudo systemctl stop freeradius

# Launch interactive debug mode
sudo freeradius -X
```
Run `radtest` in a second terminal window to watch the authentication trace in real time.

---

## 4. Exporting a New Standalone Template (`linux-lubuntu-radius`)

Use this workflow when you want to save a specialized appliance (like a pre-configured FreeRADIUS server) as its own template without modifying your clean base Lubuntu image.

1. **Shut Down Cleanly:** Power off the Lubuntu node from the guest OS menu or EVE-NG canvas.
2. **Create the Template Directory:** SSH into EVE-NG as `root` and create a folder prefixed with `linux-`:
   ```bash
   mkdir -p /opt/unetlab/addons/qemu/linux-lubuntu-radius
   ```
3. **Locate Your Node's Overlay Disk:**
   ```bash
   find /opt/unetlab/tmp/ -name "virtioa.qcow2"
   ```
4. **Convert Overlay into a Standalone Base Image:**
   ```bash
   qemu-img convert -O qcow2 /opt/unetlab/tmp/0/<lab-uuid>/<node-id>/virtioa.qcow2 /opt/unetlab/addons/qemu/linux-lubuntu-radius/virtioa.qcow2
   ```
5. **Fix System Permissions:**
   ```bash
   /opt/unetlab/wrappers/unl_wrapper -a fixpermissions
   ```

---

## 5. Updating an Existing Base Image (`virtioa.qcow2.new` Pattern)

Use this workflow when committing changes (such as installing Chromium) directly back into an existing template like `linux-lubuntu-24.04`.

> **Warning:** Ensure **no other labs or nodes** are actively using this base image before replacing it. Any existing nodes built from the old image must be wiped afterward so they rebuild against the updated backing file.

1. **Shut Down Cleanly:** Power off the Lubuntu node on the canvas.
2. **Step 1 — Convert to `.new`:** Merge the overlay and base disk into a temporary target file:
   ```bash
   qemu-img convert -O qcow2 /opt/unetlab/tmp/0/<lab-uuid>/<node-id>/virtioa.qcow2 /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2.new
   ```
3. **Step 2 — Swap & Replace:** Overwrite the old base image with the newly merged file:
   ```bash
   mv /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2.new /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2
   ```
4. **Step 3 — Fix Permissions:**
   ```bash
   /opt/unetlab/wrappers/unl_wrapper -a fixpermissions
   ```

---

## 6. Storage Audit and Post-Install Cleanup

### Check Human-Readable File Sizes
Always pass `-h` to `ls` so byte counts don't look ten times larger at a glance (e.g., `14098497536` bytes is **14.1 GB**, not 140 GB):

```bash
ls -lh /opt/unetlab/addons/qemu/linux-lubuntu-24.04/
```
Example output:
```text
total 17G
-rw-r--r-- 1 root root 3.3G Nov  5 20:10 cdrom.iso.bak
-rw-r--r-- 1 root root  14G Nov  9 19:08 virtioa.qcow2
```

You can also inspect virtual vs. actual disk allocation using `qemu-img info`:
```bash
qemu-img info /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2
```

### Remove Leftover Installation Media (`cdrom.iso.bak`)
Once your OS is installed and committed to `virtioa.qcow2`, delete the backup ISO to free up ~3.3 GB and prevent accidental installer reboots:

```bash
rm /opt/unetlab/addons/qemu/linux-lubuntu-24.04/cdrom.iso.bak
```

### Optional: Compress the Base Image
To shrink the base QCOW2 file on disk without losing data, convert it with the `-c` (compress) flag:

```bash
qemu-img convert -c -O qcow2 /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2 /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2.compressed
mv /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2.compressed /opt/unetlab/addons/qemu/linux-lubuntu-24.04/virtioa.qcow2
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

### Verify Overall Partition Usage
```bash
df -h
```

---

## 7. Wiping Nodes and Cleaning Temporary Directories

### Rebuild Node Overlays in the UI (Recommended)
After updating a base image, force existing lab nodes to load the new version:
1. Right-click the node on the EVE-NG canvas.
2. Click **Wipe**. This deletes the old `/opt/unetlab/tmp/0/<lab-uuid>/<node-id>/` overlay folder and creates a fresh one linked to your updated base image on next boot.

### Manual CLI Cleanup
If you need to remove a specific node's temporary directory manually (ensure all nodes in that lab are stopped first):

```bash
# Delete a single node's temporary overlay folder
rm -rf /opt/unetlab/tmp/0/<lab-uuid>/<node-id>/

# Or clear all temporary session folders under Pod 0 (only when all labs are stopped)
rm -rf /opt/unetlab/tmp/0/*

# Re-apply permissions
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```
