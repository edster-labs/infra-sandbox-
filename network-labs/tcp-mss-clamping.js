(function() {
    let isClampingMode = false;
    let hoveredNodeId = null;
    let animationTimer = null;
    
    let isPaused = true;
    let currentPosition = 10; // Start offset mapped cleanly to Host A position
    let playbackSpeedMs = 30; // Default millisecond interval per animation step

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

        if (isPaused) {
            clearInterval(animationTimer);
            return;
        }

        // Advance packet across the wire track line
        currentPosition += 0.5; 
        packet.style.left = `${currentPosition}%`;
        packet.style.opacity = '1';
        wire.classList.add('active-pulse');

        // Middlebox Checkpoint: Gateway Router sits at the 50% width marker
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

        // Endpoint Boundary: Host B destination sits at the 90% marker
        if (currentPosition >= 90) {
            clearInterval(animationTimer);
            isPaused = true;
            packet.style.opacity = '0';
            wire.classList.remove('active-pulse');
            updatePlaybackButtons();
        }
    }

    function startPlayback() {
        // Stop any currently running background timers to prevent loop stacking
        clearInterval(animationTimer);
        
        isPaused = false;
        updatePlaybackButtons();
        
        // Auto-reset frame position if user clicks Play when packet is at the end line
        if (currentPosition >= 90) {
            currentPosition = 10;
        }

        // Start fresh interval cycle running at the user-defined speed rate
        animationTimer = setInterval(stepAnimation, playbackSpeedMs);
    }

    function pausePlayback() {
        isPaused = true;
        clearInterval(animationTimer);
        updatePlaybackButtons();
        const wire = document.getElementById('wire-track');
        if (wire) wire.classList.remove('active-pulse');
    }

    function resetPlayback() {
        isPaused = true;
        clearInterval(animationTimer);
        currentPosition = 10;
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

    // Dynamic speed configuration interface utility
    function setPlaybackSpeed(newSpeedMs) {
        playbackSpeedMs = newSpeedMs;
        
        // Handle UI styling updates for your speed controller selections
        const speedOptions =;
        speedOptions.forEach(speed => {
            const btn = document.getElementById(`btn-speed-${speed}`);
            if (btn) {
                if (speed === newSpeedMs) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });

        // Apply new timing configuration dynamically if the packet is moving
        if (!isPaused) {
            clearInterval(animationTimer);
            animationTimer = setInterval(stepAnimation, playbackSpeedMs);
        }
    }

    function updatePlaybackButtons() {
        const btnPlay = document.getElementById('btn-play');
        const btnPause = document.getElementById('btn-pause');
        
        if (!btnPlay || !btnPause) return;

        if (isPaused) {
            btnPlay.style.background = 'var(--accent-blue, #2563eb)';
            btnPlay.style.color = '#ffffff';
            btnPause.style.background = '#273549';
            btnPause.style.color = '#f8fafc';
        } else {
            btnPlay.style.background = '#273549';
            btnPlay.style.color = '#f8fafc';
            btnPause.style.background = 'var(--accent-orange, #d97706)';
            btnPause.style.color = '#ffffff';
        }
    }

    function renderActiveLayout() {
        const routerNode = document.getElementById('node-router');
        if (!routerNode) return;

        const subtitle = routerNode.querySelector('.node-subtitle');
        if (isClampingMode) {
            if (subtitle) subtitle.innerText = 'Clamping Active (1360B)';
            routerNode.style.borderColor = 'var(--accent-orange, #d97706)';
        } else {
            if (subtitle) subtitle.innerText = 'Transit Middlebox';
            routerNode.style.borderColor = 'var(--border, #334155)';
        }
    }

    function handleHover(nodeId, isEntering) {
        const panel = document.getElementById('details-panel');
        if (!panel) return;

        if (isEntering) {
            hoveredNodeId = nodeId;
            const data = nodeDatabase[nodeId];
            if (!data) return;
            
            let contextDesc = data.desc;
            if (nodeId === 'node-router' && isClampingMode) {
                contextDesc = '🔥 CLAMPING ACTIVE: The router unzips the TCP Options space on the fly, intercepts the 1460-Byte request, and overwrites the binary field value directly to 1360 Bytes before re-checksumming the outbound packet.';
            } else if (nodeId === 'node-b' && isClampingMode) {
                contextDesc = '✅ CLAMP EFFECT COMPLETE: Host B accepts the frame believing Host A organically requested 1360 Bytes. Host B will safely match this size on returns, entirely eliminating fragmentation across the hidden VPN tunnel.';
            }

            panel.innerHTML = `
                <div class="details-title">
                    <span style="color: #ffffff;">${data.name}</span>
                    <span class="details-tag-size" style="font-size: 12px; font-weight: 700; background-color: #334155; padding: 4px 10px; border-radius: 6px; color: #cbd5e1;">${data.state}</span>
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
        
        const btnStandard = document.getElementById('btn-standard');
        const btnClamp = document.getElementById('btn-clamp');
        
        if (!btnStandard || !btnClamp) return;

        if (isClampingMode) {
            btnStandard.classList.remove('active');
            btnClamp.classList.add('active', 'clamped');
        } else {
            btnClamp.classList.remove('active', 'clamped');
            btnStandard.classList.add('active');
        }

        renderActiveLayout();
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Safe DOM query checks before running click hook bindings
        const btnStandard = document.getElementById('btn-standard');
        const btnClamp = document.getElementById('btn-clamp');
        const btnPlay = document.getElementById('btn-play');
        const btnPause = document.getElementById('btn-pause');
        const btnReset = document.getElementById('btn-reset');

        if (btnStandard) btnStandard.addEventListener('click', () => setClampingMode(false));
        if (btnClamp) btnClamp.addEventListener('click', () => setClampingMode(true));
        
        if (btnPlay) btnPlay.addEventListener('click', startPlayback);
        if (btnPause) btnPause.addEventListener('click', pausePlayback);
        if (btnReset) btnReset.addEventListener('click', resetPlayback);

        // Map events to your layout interface speed controller nodes if present in HTML
        const speedFast = document.getElementById('btn-speed-20');
		const speedNormal = document.getElementById('btn-speed-50');
		const speedSlow = document.getElementById('btn-speed-100');
		if (speedFast) speedFast.addEventListener('click', () => setPlaybackSpeed(20));
		if (speedNormal) speedNormal.addEventListener('click', () => setPlaybackSpeed(50));
		if (speedSlow) speedSlow.addEventListener('click', () => setPlaybackSpeed(100));
		const nodes = ['node-a', 'node-router', 'node-b'];
		nodes.forEach(id => {
		const el = document.getElementById(id);
		if (el) {
		el.addEventListener('mouseenter', () => handleHover(id, true));
		el.addEventListener('mouseleave', () => handleHover(id, false));
		}
		});
		resetPlayback();
		renderActiveLayout();
		});
		})();
