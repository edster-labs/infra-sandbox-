# Diagnostic & Recovery Protocol for EVE-NG GUI Login Failures

## 🎯 Problem Statement
The EVE-NG web browser dashboard rejects administrative authentication attempts or freezes on the login splash screen, frequently caused by disk exhaustion or database corruption following an ungraceful shutdown.

---

## 🛠️ Step-by-Step System Recovery Flow

### Step 1: Audit Physical Storage Allocation
Log into the server command-line interface (CLI) as `root` and check for file system space exhaustion:
```bash
df -h
```
* **Analysis:** Inspect the row terminating at the root directory (`/`). If the `Use%` metric displays **100%**, the web portal cannot write temporary session descriptors.
* **Resolution:** Navigate to `/opt/unetlab/addons/` and purge heavy, unused `.iso` or `.qcow2` files to free up disk arrays before continuing.

### Step 2: Clear Filesystem Permissions & Database States
If storage levels are normal, run the built-in system hooks to fix file owners and repair table integrity:
```bash
# Force-repair global repository security permissions
sudo /opt/unetlab/wrappers/unl_wrapper -a fixpermissions

# Restore database tables from internal transaction logs
sudo /opt/unetlab/wrappers/unl_wrapper -a restoredb
```

### Step 3: Hard-Reset the Primary Administrator Credentials
If the portal still blocks the default `admin / eve` combination, execute these exact SQL queries to clear corrupt keys and inject a fresh, out-of-the-box administrator profile:

```bash
# A. Purge existing corrupt admin account logs
echo "DELETE from users where username = 'admin';" | mysql --host=localhost --user=root --password=eve-ng eve_ng_db

# B. Inject a clean, standardized default admin security account
echo "INSERT INTO users VALUES ('admin',NULL,'root@localhost',-1,'Eve-NGAdministrator','85262adf74518bbb70c7cb94cd6159d91669e5a81edf1efebd543eadbda9fa2b',NULL,'','admin','',1); " | mysql --host=localhost --user=root --password=eve-ng eve_ng_db
```

### Step 4: Browser Session Purge
Always use an **Incognito / Private Window** or clear your browser's history and active cookies after completing these database steps to prevent expired local session state tokens from causing false authentication failures.
