<img width="2950" height="1776" alt="image" src="https://github.com/user-attachments/assets/6214cb87-0bfa-4e7a-ba94-abe63766b611" />
# Root Guard Behavior Lab

## Objective
The objective of this lab is to configure STP Root Guard on a Cisco switch interface, force a topology convergence event by introducing a competing root bridge candidate, and observe how Root Guard safely blocks the port without disabling the physical link.

---

## Topology Context & Configuration
* **Initial State:** `S2` is the designated Root Bridge for VLAN 10 (Bridge Priority: `32768`, MAC: `5000.0002.0000`).
* **Root Guard Activation:** Root Guard is enabled on interface `Gi0/3` of `S1`. This port directly links `S1` to `S3`.
* **The Trigger:** The command `spanning-tree vlan 10 root primary` is executed on `S3`. This lowers `S3`'s priority to `24576` (MAC: `5000.0008.0000`), forcing it to broadcast superior BPDUs in an attempt to claim the Root Bridge role.

---

## Verification Outputs

### 1. Spanning Tree Status on S1 (`show spanning-tree vlan 10`)
When `S3` transmits the superior BPDUs toward `S1`, Root Guard intercepts them on interface `Gi0/3` and immediately places the port into a broken, root-inconsistent state:

```text
S1# show spanning-tree vlan 10

VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    32778
             Address     5000.0002.0000
             Cost        4
             Port        3 (GigabitEthernet0/2)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     5000.0007.0000
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/2               Root FWD 4         128.3    P2p
Gi0/3               Desg BKN*4         128.4    P2p *ROOT_Inc
```

### 2. Interface Status on S1 (`show interfaces status`)
While Spanning Tree logically blocks the data plane on `Gi0/3`, the interface remains physically online and operational at Layer 2:

```text
S1# show interfaces status | inc 0/3
Gi0/3 connected trunk a-full auto RJ45
```

---

## Key Takeaways

* **Root-Inconsistent State vs. Err-disabled:** 
  It is a very common trap to assume that features like Root Guard err-disable a port just like BPDU Guard does. This lab shows they don't! Root Guard keeps the interface up at Layer 2 (`connected`) but places the STP logical state into `BKN` (Broken / Root Inconsistent).

* **Automatic Recovery:** 
  Because the interface stays `connected`, the moment `S3` stops sending those superior BPDUs, `S1` will automatically transition the port back through standard STP states to forwarding without the need to do a manual `shutdown` / `no shutdown`.
