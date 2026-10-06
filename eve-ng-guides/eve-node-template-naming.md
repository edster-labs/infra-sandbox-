# Modifying Default EVE-NG Node Templates & Hostnames
<!-- toc -->
## 🎯 Objective & Directory Context
* **Purpose:** Access and modify the native EVE-NG hardware configuration templates to change default settings, interface counts, or base names for virtual nodes.
* **Directory Root:** `/opt/unetlab/html/templates/`

---

## 🛠️ Configuration Paths & Architecture Tiers
EVE-NG separates its node definition files based on the underlying host CPU architecture. Navigate to the proper sub-directory to find your target device template configuration:

```bash
# Navigate to the core templates directory
cd /opt/unetlab/html/templates

# List the architecture deployment tiers
ls
# Output channels: amd / intel
```

### 🧬 Targeting AMD-Specific Cisco VIOS Templates
If you are running your virtualization sandbox environment on an AMD platform, change directories to step into the file configuration layer:

```bash
# Change directory to the AMD template repository
cd /opt/unetlab/html/templates/amd

# Locate the Cisco Virtual IOS (vIOS) Router and Switch configuration mappings
ls vios*
# Target output matches: viosl2.yml (Switch) | vios.yml (Router)
```

## 📝 Editing Protocol
To change the default settings (like RAM allocations, naming prefixes, or interface counts), edit the target YAML configuration blueprints using the system text editor:
```bash
sudo nano viosl2.yml
```
*⚠️ **Operational Warning:** Ensure you maintain strict YAML syntax indentation spacing when saving changes to these system templates to avoid breaking the node instantiation engine inside the EVE web browser console.*
<!-- endtoc -->
