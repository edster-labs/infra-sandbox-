# Windows PowerShell Advanced NetFirewall Configurations

## 🎯 Purpose
Quick reference command directory for provision, auditing, and deleting custom security boundary rules inside Windows 10/11 Pro lab endpoints.

---

## 🛠️ Automated Rule Deployments

### 1. Provision Custom ICMPv4 Rules for Internal Pen-Testing Nodes
This rule creates a distinct boundary profile to allow internal validation nodes (e.g., Kali Linux) to safely reach target Windows lab operating system nodes over ICMPv4:
```powershell
New-NetFirewallRule -Name "Lab_ICMP_Allow" `
    -DisplayName "Allow Ping from Lab" `
    -Description "Custom rule for Kali-to-Win11 connectivity" `
    -Group "LAB_INFRASTRUCTURE" `
    -Protocol ICMPv4 `
    -IcmpType 8 `
    -Action Allow `
    -Profile Domain,Private
```

### 2. Provision Custom Bound Scoping for Hypervisor Network Interfaces
This baseline configuration scales security permissions by binding custom firewall profiles across nested virtualization environments (`VMnet8`):
```powershell
New-NetFirewallRule -Name "Lab_ICMP_Allow" `
    -DisplayName "Allow Ping from Lab" `
    -Description "Custom rule for GNS3-to-Win10 VMNIC8 connectivity" `
    -Group "LAB_INFRASTRUCTURE" `
    -Protocol ICMPv4 `
    -IcmpType 8 `
    -Action Allow `
    -Profile Private,Public
```

### 3. Quick-Toggle Built-In Administrative Infrastructure Rules
```powershell
# Enable native core ICMP file and print sharing hooks
Enable-NetFirewallRule -DisplayName "File and Printer Sharing (Echo Request - ICMPv4-In)"

# Enable native targeted local DNS Server services
Set-NetFirewallRule -DisplayGroup "DNS Server" -Enabled True
```

---

## 🔍 Auditing & Administrative Deletions

### 1. Audit Live Custom Group Rules (Table View)
Verify that the new settings are running correctly by targeting the specific tracking identifier:
```powershell
Get-NetFirewallRule -Group "LAB_INFRASTRUCTURE" | Format-Table DisplayName, Enabled, Direction, Protocol -AutoSize
```
*Expected Output Blueprint:*
```text
DisplayName         Enabled Direction Protocol
-----------         ------- --------- --------
Allow Ping from Lab    True   Inbound  ICMPv4
```

### 2. Nuke/Remove Custom Firewall Groupings
Clear the space instantly by dropping the entire custom group asset tree:
```powershell
Remove-NetFirewallRule -Group "LAB_INFRASTRUCTURE"
```
