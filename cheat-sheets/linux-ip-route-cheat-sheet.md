# Linux Network Administration: Interface IP & Route Management
<!-- toc -->
## 🎯 Purpose
Quick reference command guide sheet for manually inspecting, appending, stack-building, and tearing down IP addresses and gateway configurations inside Linux systems.

---

## 🛠️ Interface Address Operations

### 1. Assign an IP Identity Link
Unlike other systems that automatically override previous address spaces, the Linux kernel allows you to continuously stack multiple network addresses onto a single interface layout.
```bash
sudo ip addr add [ip_address]/[subnet] dev [interface_name]

# Practical Application Example:
sudo ip addr add 10.10.10.10/24 dev ens3
```

### 2. Purge an Incorrect IP Address (Correction Routine)
If you configure a wrong IP address mapping or make a typo, use the `del` parameter modifier to remove that specific entry from the device network adapter configuration tier stack:
```bash
sudo ip addr del [ip_address]/[subnet] dev [interface_name]

# Practical Application Example:
sudo ip addr del 10.10.10.1/24 dev ens3
```

### 3. Toggle Interface Electrical Link States
```bash
# Administrative interface turn ON
sudo ip link set [interface_name] up

# Administrative interface turn OFF
sudo ip link set [interface_name] down
```

---

## 🔀 Gateway Routing Operations

### 1. Inject an Interface Subnet Default Routing Path
Inject the missing system boundary default routing path ("The Exit Route") to let the operating system resolve external addresses:
```bash
sudo ip route add default via [gateway_ip_address]

# Practical Application Example:
sudo ip route add default via 10.10.10.1
```

### 2. Verify Live Linux Routing & Address Space Telemetry
```bash
# View active ip bindings and link speed metrics
ip a

# View active system kernel routing table structures
ip route show
```
<!-- endtoc -->
