# Lab: EIGRP Multi-Router Architecture & Path Manipulation

## 🎯 Core Concepts to Validate
* **Autonomous System (AS) Alignment:** EIGRP routers will strictly form neighbor relationships only if their AS numbers match identically (`router eigrp 10`).
* **The Composite Metric:** EIGRP calculates paths using an advanced algebraic formula based on path **Bandwidth** and **Delay** parameters rather than simple hop counts, guaranteeing selection of the optimal physical circuit route.
* **Feasible Successors:** Pre-calculates loop-free backup routing paths inside the local topology map using the Feasibility Condition, allowing sub-second convergence if a primary link fails.

---

## 🛠️ Guided Task Execution Checklist

### Step 1: Initialize Neighbor Adjacency
Activate the EIGRP routing engine process across the core infrastructure fabric using precision wildcard boundary masks to limit the updates to targeted interfaces:
```cisco
R1(config)# router eigrp 10
R1(config-router)# no auto-summary
R1(config-router)# network 172.16.1.0 0.0.0.1
```

### Step 2: Advertise Isolated Edge LAN Subnets
Inject the local endpoint subnets into the dynamic routing loop:
* **Server1 LAN:** `192.168.0.0/24` (Advertised out from R1)
* **PC2 LAN:** `172.16.5.0/24` (Advertised out from R2)
* **PC3 LAN:** `172.16.6.0/24` (Advertised out from R3)

### Step 3: Verification & Traffic Engineering Path Audits
Examine how traffic coming from R3 selects a route path to target the PC2 LAN environment. Analyze the path selection metric cost variations between passing the traffic through R1 vs. jumping via R4.

---

## 🔍 Diagnostics & Telemetry Verification Library
```cisco
show ip eigrp neighbors      ! Verify neighbor engine discovery states
show ip eigrp topology       ! Inspect Successor and Feasible Successor backup trees
show ip route eigrp          ! View active EIGRP injects running in the primary RIB
```
	