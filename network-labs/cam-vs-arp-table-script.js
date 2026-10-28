// Core Visual State Registries
let isAnimating = false;
const state = { cam: [], arp: [] };

// DOM Interface Element Caches
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
    p1: document.getElementById('port-1'),
    p3: document.getElementById('port-3'),
    nodeA: document.getElementById('node-A'),
    nodeC: document.getElementById('node-C'),
    nodeSw: document.getElementById('node-Switch')
};

// State Synchronization Logic
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
        { port: 'Port 1', mac: '00:AA:00:11' },
        { port: 'Port 3', mac: '00:CC:00:33' }
    ];
    state.arp = [
        { ip: '10.0.0.1', mac: '00:AA:00:11' },
        { ip: '10.0.0.3', mac: '00:CC:00:33' }
    ];
    updateTablesDOM();
    elements.status.textContent = "Status: Mock entries seeded successfully.";
    elements.status.style.borderColor = "#34d399";
    elements.status.style.color = "#34d399";
}

function clearVisualHighlights() {
    Object.values(elements).forEach(el => {
        if(el && el.classList) {
            el.classList.remove('active-node');
            el.style.borderColor = '';
            el.style.background = '';
        }
    });
    elements.p1.style.background = '';
    elements.p3.style.background = '';
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

// Logic Track: Data Plane (Host A -> Switch -> Host C)
function triggerDataPlaneTraffic() {
    if (isAnimating) return;
    toggleUIControls(true);
    clearVisualHighlights();

    elements.status.textContent = "Status: Data plane active. Host A transmitting user payload...";
    elements.status.style.borderColor = "#2563eb";
    elements.status.style.color = "#2563eb";
    elements.nodeA.classList.add('active-node');
    elements.nodeA.style.borderColor = '#2563eb';

    animatePacket(120, 64, 350, 128, 2500, () => {
        elements.nodeA.classList.remove('active-node');
        elements.nodeSw.classList.add('active-node');
        elements.p1.style.background = '#2563eb';
        elements.panelCam.style.borderColor = '#2563eb';
        
        if (!state.cam.some(row => row.mac === '00:AA:00:11')) {
            state.cam.push({ port: 'Port 1', mac: '00:AA:00:11' });
            updateTablesDOM();
        }
        elements.status.textContent = "Status: Switch parsing frame layer-2 headers. Querying CAM Table...";
        
        setTimeout(() => {
            elements.p1.style.background = '';
            elements.p3.style.background = '#2563eb';
            
            if (!state.cam.some(row => row.mac === '00:CC:00:33')) {
                state.cam.push({ port: 'Port 3', mac: '00:CC:00:33' });
                updateTablesDOM();
            }

            animatePacket(450, 128, 680, 64, 2500, () => {
                elements.nodeSw.classList.remove('active-node');
                elements.p3.style.background = '';
                elements.nodeC.style.borderColor = '#2563eb';
                elements.status.textContent = "Status: Forwarding complete via CAM port lookup. ARP cache bypassed.";
                
                setTimeout(() => {
                    clearVisualHighlights();
                    toggleUIControls(false);
                }, 2500);
            });
        }, 2500);
    });
}

// Logic Track: Management Plane (Host A -> Switch CPU SVI Loop)
function triggerManagementTraffic() {
    if (isAnimating) return;
    toggleUIControls(true);
    clearVisualHighlights();

    elements.status.textContent = "Status: Control plane active. Host A starting direct SSH session to Switch...";
    elements.status.style.borderColor = "#7c3aed";
    elements.status.style.color = "#7c3aed";
    elements.nodeA.classList.add('active-node');
    elements.nodeA.style.borderColor = '#7c3aed';

   // animatePacket(120, 64, 350, 128, 2500, () => {
      animatePacket(140, 64, 448, 128, 2500, () => {
        elements.nodeA.classList.remove('active-node');
        elements.nodeSw.classList.add('active-node');
        elements.nodeSw.style.borderColor = '#7c3aed';
        elements.p1.style.background = '#7c3aed';
        elements.panelArp.style.borderColor = '#7c3aed';

        if (!state.cam.some(row => row.mac === '00:AA:00:11')) {
            state.cam.push({ port: 'Port 1', mac: '00:AA:00:11' });
        }
        if (!state.arp.some(row => row.ip === '10.0.0.1')) {
            state.arp.push({ ip: '10.0.0.1', mac: '00:AA:00:11' });
        }
        updateTablesDOM();
        elements.status.textContent = "Status: Switch CPU processing intercept. Learning mapping in internal ARP Cache...";

        setTimeout(() => {
            elements.panelArp.style.borderColor = '';
            elements.panelCam.style.borderColor = '#7c3aed';
            elements.status.textContent = "Status: SVI preparing control response packet. Checking egress port via CAM...";
            
            setTimeout(() => {
              //animatePacket(350, 128, 120, 64, 2500, () => {
                animatePacket(448, 128, 140, 64, 2500, () => {
                    elements.nodeSw.classList.remove('active-node');
                    elements.p1.style.background = '';
                    elements.nodeA.style.borderColor = '#7c3aed';
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

// Initial Boot Strapping Hooks
window.addEventListener('DOMContentLoaded', () => {
    updateTablesDOM();
});

