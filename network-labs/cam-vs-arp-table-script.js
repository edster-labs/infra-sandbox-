// Configuration maps for host nodes properties
const nodesConfig = {
    'A': { id: 'node-A', ip: '10.0.0.1', mac: '00:AA:00:11', port: 'Gi0/0', portId: 'port-1', startY: 64 },
    'B': { id: 'node-B', ip: '10.0.0.2', mac: '00:BB:00:22', port: 'Port 2', portId: 'port-2', startY: 192 },
    'C': { id: 'node-C', ip: '10.0.0.3', mac: '00:CC:00:33', port: 'Port 3', portId: 'port-3', endY: 64 },
    'D': { id: 'node-D', ip: '10.0.0.4', mac: '00:DD:00:44', port: 'Port 4', portId: 'port-4', endY: 192 }
};

let isAnimating = false;
const state = { cam: [], arp: [] };

const elements = {
    status: document.getElementById('status-banner'),
    camBody: document.getElementById('cam-body'),
    arpBody: document.getElementById('arp-body'),
    packet: document.getElementById('packet-pulse'),
    btnData: document.getElementById('btn-data'),
    btnMgmt: document.getElementById('btn-mgmt'),
    btnSeed: document.getElementById('btn-seed'),
    btnFlush: document.getElementById('btn-flush'),
    panelCam: document.getElementById('panel-cam'),
    panelArp: document.getElementById('panel-arp'),
    nodeSw: document.getElementById('node-Switch'),
    srcSelect: document.getElementById('src-select'),
    destSelect: document.getElementById('dest-select')
};

// Handle opacity adjustments dynamically based on user selections
function onNodeSelectionChange() {
    if (isAnimating) return;
    
    const activeSrc = elements.srcSelect.value;
    const activeDest = elements.destSelect.value;

    ['A', 'B'].forEach(key => {
        const nodeEl = document.getElementById(nodesConfig[key].id);
        const portEl = document.getElementById(nodesConfig[key].portId);
        if (key === activeSrc) {
            nodeEl.style.opacity = '1';
            portEl.style.opacity = '1';
        } else {
            nodeEl.style.opacity = '0.4';
            portEl.style.opacity = '0.3';
        }
    });

    ['C', 'D'].forEach(key => {
        const nodeEl = document.getElementById(nodesConfig[key].id);
        const portEl = document.getElementById(nodesConfig[key].portId);
        if (key === activeDest) {
            nodeEl.style.opacity = '1';
            portEl.style.opacity = '1';
        } else {
            nodeEl.style.opacity = '0.4';
            portEl.style.opacity = '0.3';
        }
    });
}

function updateTablesDOM() {
    if (state.cam.length === 0) {
        elements.camBody.innerHTML = `<tr><td colspan="2" style="padding-top:1rem; opacity:0.4; font-style:italic;">CAM Table Empty</td></tr>`;
    } else {
        elements.camBody.innerHTML = state.cam.map(row => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                <td style="padding: 0.5rem 0; color:#60a5fa; font-weight:bold;">${row.port}</td>
                <td style="padding: 0.5rem 0;">${row.mac}</td>
            </tr>
        `).join('');
    }

    if (state.arp.length === 0) {
        elements.arpBody.innerHTML = `<tr><td colspan="2" style="padding-top:1rem; opacity:0.4; font-style:italic;">ARP Cache Empty</td></tr>`;
    } else {
        elements.arpBody.innerHTML = state.arp.map(row => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                <td style="padding: 0.5rem 0; color:#a78bfa; font-weight:bold;">${row.ip}</td>
                <td style="padding: 0.5rem 0;">${row.mac}</td>
            </tr>
        `).join('');
    }
}

function toggleUIControls(disable) {
    isAnimating = disable;
    elements.btnData.disabled = disable;
    elements.btnMgmt.disabled = disable;
    elements.btnSeed.disabled = disable;
    elements.btnFlush.disabled = disable;
    elements.srcSelect.disabled = disable;
    elements.destSelect.disabled = disable;
}

function flushTables() {
    state.cam = [];
    state.arp = [];
    updateTablesDOM();
    elements.status.textContent = "Status: Cache tables flushed completely clear.";
    elements.status.style.borderColor = "#f87171";
    elements.status.style.color = "#f87171";
    clearVisualHighlights();
}

function seedTables() {
    state.cam = [
        { port: 'Gi0/0', mac: '00:AA:00:11' },
        { port: 'Port 2', mac: '00:BB:00:22' },
        { port: 'Port 3', mac: '00:CC:00:33' },
        { port: 'Port 4', mac: '00:DD:00:44' }
    ];
    state.arp = [
        { ip: '10.0.0.1', mac: '00:AA:00:11' },
        { ip: '10.0.0.2', mac: '00:BB:00:22' },
        { ip: '10.0.0.3', mac: '00:CC:00:33' },
        { ip: '10.0.0.4', mac: '00:DD:00:44' }
    ];
    updateTablesDOM();
    elements.status.textContent = "Status: Mock entries seeded successfully.";
    elements.status.style.borderColor = "#34d399";
    elements.status.style.color = "#34d399";
}

function clearVisualHighlights() {
    ['A', 'B', 'C', 'D'].forEach(key => {
        const nodeEl = document.getElementById(nodesConfig[key].id);
        const portEl = document.getElementById(nodesConfig[key].portId);
        if (nodeEl) { nodeEl.classList.remove('active-node'); nodeEl.style.borderColor = ''; }
        if (portEl) portEl.style.background = '';
    });
    elements.nodeSw.classList.remove('active-node');
    elements.nodeSw.style.borderColor = '';
    elements.panelCam.style.borderColor = '';
    elements.panelArp.style.borderColor = '';
    onNodeSelectionChange();
}

function animatePacket(startX, startY, endX, endY, duration, callback) {
    elements.packet.style.display = 'block';
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        elements.packet.setAttribute('cx', startX + (endX - startX) * progress);
        elements.packet.setAttribute('cy', startY + (endY - startY) * progress);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            elements.packet.style.display = 'none';
            callback();
        }
    }
    requestAnimationFrame(step);
}

function triggerDataPlaneTraffic() {
    if (isAnimating) return;
    const srcKey = elements.srcSelect.value;
    const destKey = elements.destSelect.value;
    const srcNode = nodesConfig[srcKey];
    const destNode = nodesConfig[destKey];

    toggleUIControls(true);
    clearVisualHighlights();

    const nodeAEl = document.getElementById(srcNode.id);
    const portInEl = document.getElementById(srcNode.portId);
    const portOutEl = document.getElementById(destNode.portId);
    const nodeCEl = document.getElementById(destNode.id);

    nodeAEl.style.opacity = '1';
    nodeAEl.classList.add('active-node');
    nodeAEl.style.borderColor = '#2563eb';

    elements.status.textContent = `Status: Data plane active. Host ${srcKey} transmitting payload to Host ${destKey}...`;
    elements.status.style.borderColor = "#2563eb";
    elements.status.style.color = "#2563eb";

    animatePacket(140, srcNode.startY, 448, 128, 2500, () => {
        nodeAEl.classList.remove('active-node');
        elements.nodeSw.classList.add('active-node');
        portInEl.style.opacity = '1';
        portInEl.style.background = '#2563eb';
        elements.panelCam.style.borderColor = '#2563eb';
        
        if (!state.cam.some(row => row.mac === srcNode.mac)) {
            state.cam.push({ port: srcNode.port, mac: srcNode.mac });
            updateTablesDOM();
        }
        elements.status.textContent = "Status: Switch parsing frame layer-2 headers. Querying CAM Table...";
        
        setTimeout(() => {
            portInEl.style.background = '';
            portOutEl.style.opacity = '1';
            portOutEl.style.background = '#2563eb';
            
            if (!state.cam.some(row => row.mac === destNode.mac)) {
                state.cam.push({ port: destNode.port, mac: destNode.mac });
                updateTablesDOM();
            }

            animatePacket(448, 128, 756, destNode.endY, 2500, () => {
                elements.nodeSw.classList.remove('active-node');
                portOutEl.style.background = '';
                nodeCEl.style.opacity = '1';
                nodeCEl.style.borderColor = '#2563eb';
                elements.status.textContent = "Status: Forwarding complete via CAM port lookup. ARP cache bypassed.";
                
                setTimeout(() => {
                    clearVisualHighlights();
                    toggleUIControls(false);
                }, 2500);
            });
        }, 2500);
    });
}

function triggerManagementTraffic() {
    if (isAnimating) return;
    const srcKey = elements.srcSelect.value;
    const srcNode = nodesConfig[srcKey];

    toggleUIControls(true);
    clearVisualHighlights();

    const nodeAEl = document.getElementById(srcNode.id);
    const portInEl = document.getElementById(srcNode.portId);

    nodeAEl.style.opacity = '1';
    nodeAEl.classList.add('active-node');
    nodeAEl.style.borderColor = '#7c3aed';

    elements.status.textContent = `Status: Control plane active. Host ${srcKey} starting direct SSH session to Switch SVI...`;
    elements.status.style.borderColor = "#7c3aed";
    elements.status.style.color = "#7c3aed";

    animatePacket(140, srcNode.startY, 448, 128, 2500, () => {
        nodeAEl.classList.remove('active-node');
        elements.nodeSw.classList.add('active-node');
        elements.nodeSw.style.borderColor = '#7c3aed';
        portInEl.style.opacity = '1';
        portInEl.style.background = '#7c3aed';
        elements.panelArp.style.borderColor = '#7c3aed';

        if (!state.cam.some(row => row.mac === srcNode.mac)) {
            state.cam.push({ port: srcNode.port, mac: srcNode.mac });
        }
        if (!state.arp.some(row => row.ip === srcNode.ip)) {
            state.arp.push({ ip: srcNode.ip, mac: srcNode.mac });
        }
        updateTablesDOM();
        elements.status.textContent = "Status: Switch CPU processing intercept. Learning mapping in internal ARP Cache...";

        setTimeout(() => {
            elements.panelArp.style.borderColor = '';
            elements.panelCam.style.borderColor = '#7c3aed';
            elements.status.textContent = "Status: SVI preparing control response packet. Checking egress port via CAM...";
            
            setTimeout(() => {
                animatePacket(448, 128, 140, srcNode.startY, 2500, () => {
                    elements.nodeSw.classList.remove('active-node');
                    portInEl.style.background = '';
                    nodeAEl.style.borderColor = '#7c3aed';
                    elements.status.textContent = "Status: Control response packet delivered back to host.";
                    
                    setTimeout(() => {
                        clearVisualHighlights();
                        toggleUIControls(false);
                    }, 2500);
                });
            }, 2500);
        }, 2500);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    onNodeSelectionChange();
    updateTablesDOM();
});
