(function() {
    let isClampingMode = false;
    let hoveredNodeId = null;
    let animationTimer = null;

    // Database mapping details panels to interactive physical layout elements
    const nodeDatabase = {
        'node-a': {
            name: 'Host A (Source Node)',
            state: 'Transmitting Initial SYN',
            desc: 'Initiates a standard TCP handshake session. Connected locally via a standard 1500-byte MTU Ethernet interface, it naturally requests a Maximum Segment Size (MSS) of 1460 bytes (1500 bytes MTU - 20 bytes IPv4 Header - 20 bytes TCP Header).'
        },
        'node-router': {
            name: 'VPN Gateway Router',
            state: 'Header Interception Phase',
            desc: 'A stateful transit path gateway. Because internal cryptographic encapsulation headers (like IPsec or WireGuard) subtract up to 60-100 bytes from the transit tunnel MTU, this node monitors inbound TCP connection rules to squeeze segment sizing down and safeguard data limits.'
        },
        'node-b': {
            name: 'Host B (Remote Destination Server)',
            state: 'Receiving Handshake Frame',
            desc: 'Processes the inbound network handshake request. By accepting the altered TCP MSS properties natively on arrival, it voluntarily caps all corresponding outbound packet structures to avoid catastrophic fragmentation faults down the line.'
        }
    };

    // Resets layout and fires a multi-stage transition pipeline
    function triggerPacketAnimation() {
        const packet = document.getElementById('packet');
        const wire = document.getElementById('wire-track');
        if (!packet || !wire) return;

        // Clear existing running schedules safely
        clearInterval(animationTimer);
        packet.removeAttribute('style');
        packet.className = 'packet-transit';
        wire.className = 'wire-line';

        // Stage 0: Package Deployment
        packet.style.opacity = '1';
        packet.innerText = 'SYN: MSS 1460';
        wire.classList.add('active-pulse');

        let position = 15; // Percent offset start from Left boundary
        
        animationTimer = setInterval(() => {
            position += 1.5;
            packet.style.left = `${position}%`;

            // Stage 1: Hit Middlebox Router Checkpoint (At roughly 50% spatial pathing)
            if (position >= 50 && position < 52) {
                if (isClampingMode) {
                    packet.classList.add('clamped-state');
                    packet.innerText = 'SYN: MSS 1360';
                }
            }

            // Stage 2: Safe Inbound Termination
            if (position >= 85) {
                clearInterval(animationTimer);
                packet.style.opacity = '0';
                wire.classList.remove('active-pulse');
            }
        }, 30);
    }

    function renderActiveLayout() {
        const routerNode = document.getElementById('node-router');
        if (!routerNode) return;

        if (isClampingMode) {
            routerNode.querySelector('.node-subtitle').innerText = 'Clamping Active (1360B)';
            routerNode.style.borderColor = 'var(--accent-orange)';
        } else {
            routerNode.querySelector('.node-subtitle').innerText = 'Transit Middlebox';
            routerNode.style.borderColor = 'var(--border)';
        }
        
        triggerPacketAnimation();
    }

    function handleHover(nodeId, isEntering) {
        const panel = document.getElementById('details-panel');
        if (!panel) return;

        if (isEntering) {
            hoveredNodeId = nodeId;
            const data = nodeDatabase[nodeId];
            
            // Contextual string modifications dependent on selected pathway switch configurations
            let contextDesc = data.desc;
            if (nodeId === 'node-router' && isClampingMode) {
                contextDesc = '🔥 CLAMPING ACTIVE: The router unzips the TCP Options space on the fly, intercepts the 1460-Byte request, and overwrites the binary field value directly to 1360 Bytes before re-checksumming the outbound packet.';
            } else if (nodeId === 'node-b' && isClampingMode) {
                contextDesc = '✅ CLAMP EFFECT COMPLETE: Host B accepts the frame believing Host A organically requested 1360 Bytes. Host B will safely match this size on returns, entirely eliminating fragmentation across the hidden VPN tunnel.';
            }

            panel.innerHTML = `
                <div class="details-title">
                    <span style="color: #ffffff;">${data.name}</span>
                    <span class="details-tag-size">${data.state}</span>
                </div>
                <p class="details-desc">${contextDesc}</p>
            `;
        } else {
            hoveredNodeId = null;
            resetDefaultPanelText();
        }
    }

    function resetDefaultPanelText() {
        const panel = document.getElementById('details-panel');
        if (!panel) return;
        panel.innerHTML = `<p class="details-desc" style="text-align: center; color: #94a3b8;">💡 Click either calculation pathway above, or hover/tap any network node component to inspect real-time frame mutations and TCP options fields.</p>`;
    }

    function setClampingMode(enableClamp) {
        isClampingMode = enableClamp;
        
        const btnStd = document.getElementById('btn-standard');
        const btnClamp = document.getElementById('btn-clamp');
        
        if (isClampingMode) {
            btnStd.classList.remove('active');
            btnClamp.classList.add('active', 'clamped');
        } else {
            btnClamp.classList.remove('active', 'clamped');
            btnStd.classList.add('active');
        }

        resetDefaultPanelText();
        renderActiveLayout();
    }

    // Attach DOM listener dependencies explicitly safely on load
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('btn-standard').addEventListener('click', () => setClampingMode(false));
        document.getElementById('btn-clamp').addEventListener('click', () => setClampingMode(true));

        const nodes = ['node-a', 'node-router', 'node-b'];
        nodes.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('mouseenter', () => handleHover(id, true));
                el.addEventListener('mouseleave', () => handleHover(id, false));
                el.addEventListener('click', () => triggerPacketAnimation());
            }
        });

        renderActiveLayout();
    });
})();
