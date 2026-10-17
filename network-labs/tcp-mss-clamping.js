(function() {
    let isClampingMode = false;
    let hoveredNodeId = null;
    let animationTimer = null;
    
    let isPaused = true;
    let currentPosition = 10; // Start offset mapped cleanly to Host A position

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

    function stepAnimation() {
        const packet = document.getElementById('packet');
        const wire = document.getElementById('wire-track');
        if (!packet || !wire) return;

        if (isPaused) return;

        currentPosition += 0.4; 
        packet.style.left = `${currentPosition}%`;
        packet.style.opacity = '1';
        wire.classList.add('active-pulse');

        // Middlebox Gateway Checkpoint (Router sits around 50% width marker)
        if (currentPosition >= 50) {
            if (isClampingMode) {
                packet.classList.add('clamped-state');
                packet.innerText = 'SYN: MSS 1360';
            } else {
                packet.classList.remove('clamped-state');
                packet.innerText = 'SYN: MSS 1460';
            }
        } else {
            packet.classList.remove('clamped-state');
            packet.innerText = 'SYN: MSS 1460';
        }

        // Endpoint Delivery Boundary (Host B sits at 90% space)
        if (currentPosition >= 90) {
            clearInterval(animationTimer);
            isPaused = true;
            packet.style.opacity = '0';
            wire.classList.remove('active-pulse');
            updatePlaybackButtons();
        }
    }

    function startPlayback() {
        if (!isPaused) return;
        
        isPaused = false;
        updatePlaybackButtons();
        
        if (currentPosition >= 90) {
            resetPlayback();
            isPaused = false;
        }

        clearInterval(animationTimer);
        animationTimer = setInterval(stepAnimation, 30);
    }

    function pausePlayback() {
        isPaused = true;
        updatePlaybackButtons();
        clearInterval(animationTimer);
        const wire = document.getElementById('wire-track');
        if (wire) wire.classList.remove('active-pulse');
    }

    function resetPlayback() {
        isPaused = true;
        currentPosition = 10;
        clearInterval(animationTimer);
        updatePlaybackButtons();

        const packet = document.getElementById('packet');
        const wire = document.getElementById('wire-track');
        if (packet && wire) {
            packet.style.left = `${currentPosition}%`;
            packet.style.opacity = '0';
            packet.classList.remove('clamped-state');
            packet.innerText = 'SYN: MSS 1460';
            wire.classList.remove('active-pulse');
        }
    }

    function updatePlaybackButtons() {
        const btnPlay = document.getElementById('btn-play');
        const btnPause = document.getElementById('btn-pause');
        
        if (!btnPlay || !btnPause) return;

        if (isPaused) {
            btnPlay.style.background = 'var(--accent-blue)';
            btnPlay.style.color = '#000000';
            btnPause.style.background = '#273549';
            btnPause.style.color = '#f8fafc';
        } else {
            btnPlay.style.background = '#273549';
            btnPlay.style.color = '#f8fafc';
            btnPause.style.background = 'var(--accent-orange)';
            btnPause.style.color = '#000000';
        }
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
        
        if (currentPosition >= 50 && isClampingMode) {
            const packet = document.getElementById('packet');
            if (packet) {
                packet.classList.add('clamped-state');
                packet.innerText = 'SYN: MSS 1360';
            }
        }
    }

    function handleHover(nodeId, isEntering) {
        const panel = document.getElementById('details-panel');
        if (!panel) return;

        if (isEntering) {
            hoveredNodeId = nodeId;
            const data = nodeDatabase[nodeId];
            
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

        renderActiveLayout();
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('btn-standard').addEventListener('click', () => setClampingMode(false));
        document.getElementById('btn-clamp').addEventListener('click', () => setClampingMode(true));
        
        document.getElementById('btn-play').addEventListener('click', startPlayback);
        document.getElementById('btn-pause').addEventListener('click', pausePlayback);
        document.getElementById('btn-reset').addEventListener('click', resetPlayback);

        const nodes = ['node-a', 'node-router', 'node-b'];
        nodes.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('mouseenter', () => handleHover(id, true));
                el.addEventListener('mouseleave', () => handleHover(id, false));
                el.addEventListener('click', () => {
                    startPlayback();
                });
            }
        });

        resetPlayback();
        renderActiveLayout();
    });
})();
