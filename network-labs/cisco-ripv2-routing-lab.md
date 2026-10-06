<img width="2595" height="1410" alt="RIPv2" src="https://github.com/user-attachments/assets/bd825975-3724-46ab-826e-c4f239727b2b" />

# Lab: RIPv2 Dynamic Routing & Passive Interface Optimization

## 🎯 Topology Overview & Objective
Deploy Routing Information Protocol version 2 (RIPv2) across a 4-router core ring infrastructure to achieve full end-to-end connectivity across all isolated edge LAN segments while securing user access layers.

---

## 🛠️ Configuration Blueprints

### Router R1 Configuration
```cisco
R1(config)# router rip
R1(config-router)# version 2
R1(config-router)# no auto-summary
R1(config-router)# network 172.16.0.0
R1(config-router)# network 192.168.0.0
R1(config-router)# passive-interface GigabitEthernet0/0
```

### Router R2 Configuration
```cisco
R2(config)# router rip
R2(config-router)# version 2
R2(config-router)# no auto-summary
R2(config-router)# network 172.16.0.0
R2(config-router)# passive-interface GigabitEthernet0/2
```

### Router R3 Configuration
```cisco
R3(config)# router rip
R3(config-router)# version 2
R3(config-router)# no auto-summary
R3(config-router)# network 172.16.0.0
R3(config-router)# passive-interface GigabitEthernet0/3
```

### Router R4 Configuration
```cisco
R4(config)# router rip
R4(config-router)# version 2
R4(config-router)# no auto-summary
R4(config-router)# network 172.16.0.0
```

---

## ⚠️ Operational Gotchas & Best Practices
* **The `no auto-summary` Requirement:** Classless routing updates in RIPv2 will be broken by default if auto-summary is left enabled, causing the routers to advertise classful boundaries (`/16` and `/24`) instead of precise subnets.
* **Security Scoping (`passive-interface`):** Always configure user-facing interfaces (LAN subnets leading to endpoints) as passive. This blocks the router from broadcasting multicast updates out onto user ports, saving bandwidth and preventing rogue routing advertisements.
