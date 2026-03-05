(function () {

    /* ── helpers ── */
    function rnd(a, b) { return a + Math.random() * (b - a); }

    /* ── color palette ── */
    const C = {
        purple:  0x7c3aed,
        purpleL: 0xa78bfa,
        purpleLL:0xc4b5fd,
        teal:    0x22d3ee,
        green:   0x10b981,
        orange:  0xf97316,
    };

    /* ── shared materials ── */
    function makeMaterials() {
        return {
            board:   new THREE.MeshStandardMaterial({ color:0x1a472a, metalness:.3, roughness:.7, emissive:0x0a2a14, emissiveIntensity:.35 }),
            pin:     new THREE.MeshStandardMaterial({ color:0xfbbf24, metalness:.8, roughness:.2, emissive:0xfbbf24, emissiveIntensity:.12 }),
            chip:    new THREE.MeshStandardMaterial({ color:0x111827, metalness:.9, roughness:.1, emissive:0x7c3aed, emissiveIntensity:.18 }),
            led:     new THREE.MeshStandardMaterial({ color:C.teal,   emissive:C.teal,   emissiveIntensity:2.2 }),
            packet:  new THREE.MeshStandardMaterial({ color:C.purpleLL, emissive:C.purpleLL, emissiveIntensity:1.8, transparent:true, opacity:.88 }),
            trace:   new THREE.LineBasicMaterial({ color:C.green, transparent:true, opacity:.22 }),
        };
    }

    /* ── build Arduino board group ── */
    function makeBoard(mats) {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, .08, 1.1), mats.board));
        const chip = new THREE.Mesh(new THREE.BoxGeometry(.5, .14, .5), mats.chip);
        chip.position.y = .11;
        g.add(chip);
        for (let p = 0; p < 6; p++) {
            const pin = new THREE.Mesh(new THREE.BoxGeometry(.06, .22, .06), mats.pin);
            pin.position.set(-0.75 + p * 0.28, -.15,  0.62); g.add(pin);
            const pin2 = pin.clone(); pin2.position.z = -0.62; g.add(pin2);
        }
        const led = new THREE.Mesh(new THREE.SphereGeometry(.055, 8, 8), mats.led);
        led.position.set(.6, .12, .3); g.add(led);
        return g;
    }

    /* ── build one scene for a section ── */
    function buildScene(sectionId, opts) {
        const section = document.getElementById(sectionId);
        if (!section) return null;

        /* canvas */
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
        section.style.position = 'relative';
        section.style.overflow  = 'hidden';
        section.insertBefore(canvas, section.firstChild);

        /* renderer */
        const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);  

        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120);
        camera.position.z = opts.camZ || 18;

        /* fog */
        scene.fog = new THREE.FogExp2(0x04050f, opts.fog || 0.032);

        /* lights */
        scene.add(new THREE.AmbientLight(0xffffff, .15));
        const dl = new THREE.DirectionalLight(0xa78bfa, .8);
        dl.position.set(4, 6, 6); scene.add(dl);
        const pl1 = new THREE.PointLight(C.teal,   1.3, 28); pl1.position.set(-7,  4, 5); scene.add(pl1);
        const pl2 = new THREE.PointLight(C.purple, 1.1, 26); pl2.position.set( 9, -3, 4); scene.add(pl2);
        const pl3 = new THREE.PointLight(C.green,  .7,  20); pl3.position.set( 0, -7, 2); scene.add(pl3);

        const mats = makeMaterials();

        /* ── Arduino boards ── */
        const boards = [];
        for (let i = 0; i < (opts.boards || 12); i++) {
            const b = makeBoard(mats);
            b.userData = {
                px:rnd(-16,16), py:rnd(-9,9), pz:rnd(-18,-6),
                vx:rnd(-.004,.004), vy:rnd(-.003,.003), vz:rnd(-.002,.002),
                rx:rnd(0,Math.PI*2), ry:rnd(0,Math.PI*2), rz:rnd(0,Math.PI*2),
                vrx:rnd(-.006,.006), vry:rnd(-.007,.007), vrz:rnd(-.005,.005),
            };
            b.position.set(b.userData.px, b.userData.py, b.userData.pz);
            scene.add(b); boards.push(b);
        }

        /* ── sensor nodes (octahedrons) ── */
        const sensors = [];
        const sCols = [C.teal, C.green, C.orange, C.purpleL];
        for (let i = 0; i < (opts.sensors || 22); i++) {
            const col = sCols[i % sCols.length];
            const mat = new THREE.MeshStandardMaterial({
                color:col, emissive:col, emissiveIntensity:1.1,
                transparent:true, opacity:.82, metalness:.4, roughness:.3
            });
            const m = new THREE.Mesh(new THREE.OctahedronGeometry(rnd(.16,.34), 0), mat);
            m.userData = {
                px:rnd(-20,20), py:rnd(-11,11), pz:rnd(-20,-6),
                vx:rnd(-.006,.006), vy:rnd(-.005,.005), vz:rnd(-.003,.003),
                rx:0, ry:0, rz:0,
                vrx:rnd(-.014,.014), vry:rnd(-.018,.018), vrz:rnd(-.01,.01),
                pulseT:Math.random()*Math.PI*2,
            };
            m.position.set(m.userData.px, m.userData.py, m.userData.pz);
            scene.add(m); sensors.push(m);
        }

        /* ── circuit traces ── */
        const traces = [];
        for (let i = 0; i < (opts.traces || 16); i++) {
            const s1 = sensors[Math.floor(Math.random() * sensors.length)];
            const s2 = sensors[Math.floor(Math.random() * sensors.length)];
            if (s1 === s2) continue;
            const geo  = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(s1.userData.px, s1.userData.py, s1.userData.pz),
                new THREE.Vector3(s1.userData.px, s2.userData.py, (s1.userData.pz+s2.userData.pz)/2),
                new THREE.Vector3(s2.userData.px, s2.userData.py, s2.userData.pz),
            ]);
            const line = new THREE.Line(geo, mats.trace.clone());
            line.userData = { s1, s2, phaseOff: Math.random() * Math.PI * 2 };
            scene.add(line); traces.push(line);
        }

        /* ── data packets ── */
        const packets = [];
        for (let i = 0; i < (opts.packets || 30); i++) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.09), mats.packet.clone());
            m.userData = {
                px:rnd(-20,20), py:rnd(-11,11), pz:rnd(-19,-6),
                vx:rnd(-.03,.03), vy:rnd(-.02,.02), vz:rnd(-.015,.015),
                pulseT:Math.random()*Math.PI*2,
            };
            m.position.set(m.userData.px, m.userData.py, m.userData.pz);
            scene.add(m); packets.push(m);
        }

        /* ── wifi rings (torus) ── */
        const wifiRings = [];
        for (let i = 0; i < (opts.wifi || 8); i++) {
            const mat = new THREE.MeshStandardMaterial({
                color:C.teal, emissive:C.teal, emissiveIntensity:.7,
                transparent:true, opacity:rnd(.15,.35), wireframe:true,
            });
            const m = new THREE.Mesh(new THREE.TorusGeometry(rnd(.28,.65), .03, 8, 24), mat);
            m.userData = {
                px:rnd(-18,18), py:rnd(-10,10), pz:rnd(-18,-6),
                vx:rnd(-.003,.003), vy:rnd(-.003,.003),
                pulseT:Math.random()*Math.PI*2,
            };
            m.position.set(m.userData.px, m.userData.py, m.userData.pz);
            m.rotation.x = Math.PI / 2;
            scene.add(m); wifiRings.push(m);
        }

        /* ── particles ── */
        const pCount = opts.particles || 900;
        const pPos = new Float32Array(pCount * 3);
        const pCol = new Float32Array(pCount * 3);
        const pCols = [new THREE.Color(C.purple), new THREE.Color(C.teal), new THREE.Color(C.green), new THREE.Color(C.purpleL)];
        for (let i = 0; i < pCount; i++) {
            pPos[i*3]=rnd(-26,26); pPos[i*3+1]=rnd(-14,14); pPos[i*3+2]=rnd(-22,-6);
            const c = pCols[i % pCols.length];
            pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
        const pMesh = new THREE.Points(pGeo,
            new THREE.PointsMaterial({ size:.042, vertexColors:true, transparent:true, opacity:.5 }));
        scene.add(pMesh);

        /* ── wrap bounds ── */
        function wrap(u, lx, ly, lz) {
            if (u.px >  lx) u.px = -lx; if (u.px < -lx) u.px =  lx;
            if (u.py >  ly) u.py = -ly; if (u.py < -ly) u.py =  ly;
            if (u.pz > -6)   u.pz = -6;      if (u.pz < -lz) u.pz = -lz + 4;
        }

        /* ── resize ── */
        function resize() {
            const w = section.offsetWidth, h = section.offsetHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(section);

        /* ── tick function ── */
        let localT = 0;
        function tick() {
            localT += .012;

         
            function depthFade(pz) {
                return Math.min(1, Math.max(0, (-pz - 6) / 8));
            }

            boards.forEach(b => {
                const u = b.userData;
                u.px+=u.vx; u.py+=u.vy; u.pz+=u.vz;
                u.rx+=u.vrx; u.ry+=u.vry; u.rz+=u.vrz;
                wrap(u,18,11,14);
                b.position.set(u.px,u.py,u.pz);
                b.rotation.set(u.rx,u.ry,u.rz);
            
                const fade = depthFade(u.pz);
                b.traverse(child => { if(child.material) child.material.opacity = fade; child.material && (child.material.transparent = true); });
            });

            sensors.forEach(m => {
                const u = m.userData;
                u.px+=u.vx; u.py+=u.vy; u.pz+=u.vz;
                u.rx+=u.vrx; u.ry+=u.vry; u.rz+=u.vrz;
                u.pulseT+=.04;
                wrap(u,21,12,15);
                m.position.set(u.px,u.py,u.pz);
                m.rotation.set(u.rx,u.ry,u.rz);
                m.material.emissiveIntensity = 1.1 + Math.sin(u.pulseT) * .55;
                m.scale.setScalar(1 + Math.sin(u.pulseT*.7) * .07);
                m.material.opacity = 0.82 * depthFade(u.pz);
            });

            traces.forEach((line, i) => {
                const {s1, s2, phaseOff} = line.userData;
                line.material.opacity = .08 + .22 * Math.abs(Math.sin(localT*.75 + phaseOff));
                line.geometry.setFromPoints([
                    new THREE.Vector3(s1.position.x, s1.position.y, s1.position.z),
                    new THREE.Vector3(s1.position.x, s2.position.y, (s1.position.z+s2.position.z)/2),
                    new THREE.Vector3(s2.position.x, s2.position.y, s2.position.z),
                ]);
            });

            packets.forEach(m => {
                const u = m.userData;
                u.px+=u.vx; u.py+=u.vy; u.pz+=u.vz;
                u.pulseT+=.06;
                wrap(u,22,13,15);
                m.position.set(u.px,u.py,u.pz);
                m.rotation.y+=.06; m.rotation.x+=.04;
                m.material.emissiveIntensity = 1.4 + Math.sin(u.pulseT) * .9;
                m.material.opacity = 0.88 * depthFade(u.pz);
            });

            wifiRings.forEach(m => {
                const u = m.userData;
                u.px+=u.vx; u.py+=u.vy; u.pulseT+=.024;
                wrap(u,20,11,15);
                m.position.x=u.px; m.position.y=u.py;
                m.scale.setScalar(1 + .32*Math.sin(u.pulseT));
                m.material.opacity = (0.12 + 0.2*Math.abs(Math.sin(u.pulseT))) * depthFade(u.pz);
                m.rotation.z+=.008;
            });

            const pos = pMesh.geometry.attributes.position.array;
            for (let i = 0; i < pCount; i++) {
                pos[i*3+1] += .003 * Math.sin(localT + i*.1);
                pos[i*3]   += .002 * Math.cos(localT*.5 + i*.07);
            }
            pMesh.geometry.attributes.position.needsUpdate = true;
            pMesh.rotation.y = localT * .01;

            pl1.intensity = 1.1 + .45*Math.sin(localT*1.1);
            pl2.intensity = .9  + .38*Math.sin(localT*.8 + 1);

            renderer.render(scene, camera);
        }

        return { tick, renderer };
    }

    /* ══════════════════════════════════════════
       INIT — wait for THREE to be ready
    ══════════════════════════════════════════ */
    function init() {
        if (typeof THREE === 'undefined') {
            setTimeout(init, 80); return;
        }

        /* hero — denser */
        const heroS = buildScene('hero', {
            camZ:20, fog:.028,
            boards:14, sensors:24, traces:18, packets:35, wifi:10, particles:1000,
        });

        /* about — slightly lighter */
        const aboutS = buildScene('about', {
            camZ:18, fog:.032,
            boards:9,  sensors:16, traces:12, packets:22, wifi:6,  particles:650,
        });

        /* contact — lighter still */
        const contactS = buildScene('contact', {
            camZ:18, fog:.034,
            boards:8,  sensors:14, traces:10, packets:18, wifi:5,  particles:550,
        });

        /* master loop */
        function loop() {
            requestAnimationFrame(loop);
            if (heroS)    heroS.tick();
            if (aboutS)   aboutS.tick();
            if (contactS) contactS.tick();
        }
        loop();
    }

    /* run after DOM ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
