# Technical Analysis: The Lifecycle of a Virtual Cable Interface

## 🎯 Conceptual Overview
When you link two nodes inside the EVE-NG graphical interface canvas, you are not simply drawing a picture—you are writing explicit instructions that tell the underlying Linux kernel to build physical and logical software interfaces on the fly.

---

## 🛠️ The Internal Virtual Cable Lifecycle Process

### State 1: The Node is Powered Down
While a lab device node is off, the corresponding host interface bridge remains empty. Running a status check reveals only the core infrastructure physical interface link:
```bash
root@eve-ng:~# brctl show pnet2
bridge name     bridge id               STP enabled     interfaces
pnet2           8000.a2eb64a5c359       no              eth2
```

### State 2: The Node is Launched (The "Plug-in" Command)
The moment you click **Start** in the web dashboard interface console, EVE-NG hooks trigger a sequence that sets up a virtual tap interface inside the Linux kernel and patches it directly into the target bridge network segment:
```bash
# What EVE-NG executes silently in the system background:
ip link create vunl0_2_0 type veth
brctl addif pnet2 vunl0_2_0
```

### State 3: The Node is Fully On
Once operational, checking the bridge status reveals that the virtual cable interface link is active and attached to the target bridge:
```bash
root@eve-ng:~# brctl show pnet2
bridge name     bridge id               STP enabled     interfaces
pnet2           8000.a2eb64a5c359       no              eth2
                                                        vunl0_2_0
```

---

## 📊 Decoding the `vunl` Logical Coordinate Layout
The name of the dynamic interface (`vunl0_2_0`) serves as a precise coordinate system mapping out where the device sits inside the host filesystem:
*   **`vunl`:** Virtual UNetLab (the underlying, legacy architecture engine title of EVE-NG).
*   **`0`:** The system User ID identifier (value `0` maps explicitly to the primary system Administrator).
*   **`2`:** The specific Lab ID instance string (matching the numerical identifier found in your active web browser URL bar).
*   **`0`:** The internal unique Node ID number assigned to that exact node component block on the map workspace.

---

## ⚙️ Customizing Underlying Node Blueprints (`linux.yml`)
To tweak the baseline resource configurations (like changing default RAM size, assigning CPU limit hooks, or updating graphics display variables) for all future Linux instances, modify the architecture profile definitions template:
```bash
sudo nano /opt/unetlab/html/templates/amd/linux.yml
```
