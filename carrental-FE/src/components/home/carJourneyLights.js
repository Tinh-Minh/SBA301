import * as THREE from "three";

export function createCarLights(model, car, { wake, reducedMotion }) {
    const lamps = new Map();
    model.traverse(object => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const updated = materials.map(material => {
            const front = material.name === "Lgith_Glass_N";
            if (!front && material.name !== "red_glass") return material;
            if (!lamps.has(material)) {
                const illuminated = material.clone();
                illuminated.emissive.set(front ? 0xffedcd : 0xff140a);
                lamps.set(material, { material: illuminated, front });
            }
            return lamps.get(material).material;
        });
        object.material = Array.isArray(object.material) ? updated : updated[0];
    });

    for (const original of lamps.keys()) original.dispose();

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,.5)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    const halos = [];
    for (const front of [true, false]) {
        const material = new THREE.SpriteMaterial({ map: texture, color: front ? 0xffe4ad : 0xff2915, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
        for (const side of [-1, 1]) {
            const halo = new THREE.Sprite(material);
            halo.position.set(side * 0.72, 0.57, front ? 2.37 : -2.55);
            halo.scale.setScalar(front ? 0.44 : 0.36);
            car.add(halo);
            halos.push({ halo, front });
        }
    }

    let timer;
    let pulseStart = -Infinity;
    let brakeUntil = -Infinity;
    let wasDriving = false;
    function queuePulse() {
        timer = setTimeout(() => {
            pulseStart = performance.now();
            wake();
            queuePulse();
        }, 6500 + Math.random() * 3500);
    }
    if (!reducedMotion) queuePulse();
    return {
        update(time, speed) {
            const driving = speed > 0.15;
            if (!reducedMotion && wasDriving && !driving) brakeUntil = time + 850;
            wasDriving = driving;
            const elapsed = (time - pulseStart) / 1400;
            const pulse = !reducedMotion && elapsed >= 0 && elapsed < 1 ? Math.sin(elapsed * Math.PI) ** 2 : 0;
            const brake = time < brakeUntil ? Math.min(1, (brakeUntil - time) / 300) : 0;
            for (const { material, front } of lamps.values()) {
                material.emissiveIntensity = front ? 0.08 + pulse * 2.4 : 0.1 + pulse * 1.1 + brake * 1.8;
            }
            for (const { halo, front } of halos) {
                halo.material.opacity = front ? pulse * 0.65 : (pulse * 0.35 + brake * 0.55);
            }
            return (elapsed >= 0 && elapsed < 1) || brake > 0;
        },
        dispose() { clearTimeout(timer); },
    };
}
