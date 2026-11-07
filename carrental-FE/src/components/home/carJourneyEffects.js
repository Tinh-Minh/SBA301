import * as THREE from "three";

export function prepareWheels(model) {
    model.updateWorldMatrix(true, true);
    const wheels = [];
    model.traverse(object => {
        if (/^3DWheel[ _](Front|Rear)[ _][LR]$/.test(object.name)) wheels.push(object);
    });
    return wheels.map(wheel => {
        const worldCenter = new THREE.Box3().setFromObject(wheel).getCenter(new THREE.Vector3());
        const localCenter = wheel.worldToLocal(worldCenter.clone());
        // Move the wheel's own origin to its hub without changing its hierarchy or camber.
        const offset = localCenter.clone().multiply(wheel.scale).applyQuaternion(wheel.quaternion);
        wheel.position.add(offset);
        for (const child of wheel.children) child.position.sub(localCenter);
        const rest = wheel.quaternion.clone();
        const rotation = new THREE.Quaternion();
        const axis = new THREE.Vector3(1, 0, 0);
        const direction = /[ _]R$/.test(wheel.name) ? -1 : 1;
        return {
            wheel,
            spin(angle) { wheel.quaternion.copy(rest).multiply(rotation.setFromAxisAngle(axis, angle * direction)); },
        };
    });
}

function createPerson(jacketColor, skinColor) {
    const person = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
    const jacket = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.85 });
    const trousers = new THREE.MeshStandardMaterial({ color: 0x252a30, roughness: 0.9 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x191b1f, roughness: 0.65 });
    function capsule(material, radius, length, x, y, z, parent = person) {
        const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 5, 10), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        parent.add(mesh);
        return mesh;
    }
    capsule(jacket, 0.16, 0.36, 0, 1.12, 0).scale.z = 0.78;
    capsule(skin, 0.115, 0.09, 0, 1.59, 0);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), dark);
    hair.position.set(0, 1.66, 0);
    person.add(hair);
    const arms = [-1, 1].map(side => {
        const shoulder = new THREE.Group();
        shoulder.position.set(side * 0.205, 1.31, 0);
        shoulder.rotation.z = side * 0.10;
        person.add(shoulder);
        capsule(jacket, 0.06, 0.18, 0, -0.15, 0, shoulder);
        const elbow = new THREE.Group();
        elbow.position.y = -0.28;
        elbow.rotation.x = -0.12;
        shoulder.add(elbow);
        capsule(jacket, 0.052, 0.16, 0, -0.13, 0, elbow);
        capsule(skin, 0.05, 0.025, 0, -0.29, 0, elbow);
        return { shoulder, elbow, side };
    });
    const legs = [-1, 1].map(side => capsule(trousers, 0.075, 0.59, side * 0.095, 0.47, 0));
    [-1, 1].forEach(side => {
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.28), dark);
        shoe.position.set(side * 0.095, 0.08, 0.06);
        shoe.castShadow = true;
        person.add(shoe);
    });
    [-1, 1].forEach(side => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), dark);
        eye.position.set(side * 0.045, 1.62, 0.103);
        person.add(eye);
    });
    const materials = [skin, jacket, trousers, dark];
    materials.forEach(material => { material.transparent = true; });
    return { person, arms, legs, materials };
}

export function createCustomer() {
    const first = createPerson(0xfc6c26, 0xc99472);
    const second = createPerson(0x356e78, 0xd5a887);
    function speechBubble(color) {
        const canvas = document.createElement('canvas');
        canvas.width = 480; canvas.height = 100;
        const context = canvas.getContext('2d');
        for (let frame = 0; frame < 3; frame++) {
            context.save();
            context.translate(frame * 160, 0);
            context.fillStyle = '#fffdf6';
            context.beginPath(); context.roundRect(4, 4, 152, 76, 22); context.fill();
            context.beginPath(); context.moveTo(58, 72); context.lineTo(70, 96); context.lineTo(90, 72); context.fill();
            context.fillStyle = color;
            [50, 80, 110].forEach((x, index) => {
                context.globalAlpha = index === frame ? 1 : 0.3;
                context.beginPath(); context.arc(x, 42, 6, 0, Math.PI * 2); context.fill();
            });
            context.restore();
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.repeat.x = 1 / 3;
        const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map:texture, transparent:true, depthWrite:false, toneMapped:false }));
        bubble.scale.set(0.86, 0.54, 1);
        bubble.position.y = 2.10;
        return bubble;
    }
    const bubbles = [speechBubble('#e56525'), speechBubble('#356e78')];
    first.person.add(bubbles[0]);
    second.person.add(bubbles[1]);
    const conversation = new THREE.Group();
    first.person.position.x = -0.52;
    second.person.position.x = 0.52;
    first.person.rotation.y = Math.PI / 2;
    second.person.rotation.y = -Math.PI / 2;
    conversation.add(first.person, second.person);
    conversation.position.set(-2.1, 0, 0.1);
    return {
        person: conversation,
        update(time, weight, reducedMotion) {
            [first, second].forEach((participant, index) => {
                const speaking = !reducedMotion && Math.floor(time / 2200) % 2 === index;
                const gesture = speaking ? 0.5 + Math.sin(time / 420) * 0.5 : 0;
                participant.arms.forEach(({ shoulder, elbow, side }, armIndex) => {
                    shoulder.rotation.z = side * (0.10 + gesture * 0.04);
                    shoulder.rotation.x = -0.06 - gesture * (armIndex === 0 ? 0.18 : 0.08);
                    elbow.rotation.x = -0.12 - gesture * (armIndex === 0 ? 0.30 : 0.12);
                });
            });
            bubbles.forEach((bubble, index) => {
                const speaking = reducedMotion || Math.floor(time / 2200) % 2 === index;
                bubble.material.opacity = weight * (speaking ? 1 : 0.25);
                bubble.material.map.offset.x = (reducedMotion ? 0 : Math.floor(time / 220) % 3) / 3;
                bubble.position.y = 2.10 + (reducedMotion ? 0 : Math.sin(time / 500 + index * Math.PI) * 0.035);
            });
        },
        legs: [...first.legs, ...second.legs],
        materials: [...first.materials, ...second.materials],
    };
}

export function createExhaust(scene, renderer) {
    const count = 96;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
    const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uHeight: { value: 1000 } },
        vertexShader: `attribute float aSize; attribute float aAlpha; uniform float uHeight; varying float vAlpha;
            void main() { vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p;
            gl_PointSize = clamp(aSize * uHeight / max(0.1, -p.z), 1.0, 120.0); vAlpha = aAlpha; }`,
        fragmentShader: `varying float vAlpha; void main() {
            float puff = 1.0 - smoothstep(0.03, 0.5, length(gl_PointCoord - 0.5));
            gl_FragColor = vec4(0.43, 0.44, 0.42, vAlpha * puff * puff); }`,
    });
    const cloud = new THREE.Points(geometry, material);
    cloud.frustumCulled = false;
    cloud.renderOrder = 2;
    scene.add(cloud);
    const particles = Array.from({ length: count }, () => ({ age: 9, life: 1, position: new THREE.Vector3(), velocity: new THREE.Vector3(), size: 0 }));
    const rear = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const scale = new THREE.Vector3();
    let next = 0;
    let budget = 0;
    return {
        update(dt, speed, car, enabled) {
            material.uniforms.uHeight.value = renderer.domElement.height;
            car.getWorldScale(scale);
            car.updateWorldMatrix(true, false);
            budget += enabled && speed > 0.08 ? dt * Math.min(30, speed * 3) : 0;
            while (budget >= 1) {
                const particle = particles[next];
                rear.set(next % 2 ? 0.65 : -0.65, 0.2, -2.56).applyMatrix4(car.matrixWorld);
                direction.set((Math.random() - 0.5) * 0.2, 0.15, -0.5).transformDirection(car.matrixWorld);
                particle.position.copy(rear);
                particle.velocity.copy(direction).multiplyScalar(0.5 + Math.random() * 0.5);
                particle.age = 0;
                particle.life = 0.7 + Math.random() * 0.8;
                particle.size = scale.x * (0.08 + Math.random() * 0.07);
                next = (next + 1) % count;
                budget--;
            }
            let alive = false;
            particles.forEach((particle, index) => {
                particle.age += dt;
                const age = particle.age / particle.life;
                if (age < 1) {
                    alive = true;
                    particle.position.addScaledVector(particle.velocity, dt);
                    particle.position.y += dt * 0.16;
                    particle.position.toArray(positions, index * 3);
                    sizes[index] = particle.size + age * 0.6;
                    alphas[index] = Math.sin(Math.PI * age) * 0.2;
                } else alphas[index] = 0;
            });
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.aSize.needsUpdate = true;
            geometry.attributes.aAlpha.needsUpdate = true;
            return alive;
        },
    };
}

export function createRoad(scene) {
    const road = new THREE.Group();
    const markings = new THREE.MeshBasicMaterial({ color: 0xd3a476, transparent: true, opacity: 0, depthWrite: false });
    const strips = [];
    for (let i = 0; i < 14; i++) {
        for (const side of [-1, 1]) {
            const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.9), markings);
            strip.rotation.x = -Math.PI / 2;
            strip.position.set(side * 1.8, 0, (i - 7) * 2.5);
            road.add(strip);
            strips.push({ strip, base: strip.position.z });
        }
    }
    scene.add(road);
    return {
        update(car, overhead, distance, depart) {
            markings.opacity = Math.max(THREE.MathUtils.smoothstep(overhead, 0.35, 0.85) * 0.55,
                THREE.MathUtils.smoothstep(depart, 0.05, 0.6) * 0.3);
            road.visible = markings.opacity > 0.01;
            road.position.copy(car.position);
            road.position.y -= 0.025;
            road.rotation.y = car.rotation.y;
            road.scale.copy(car.scale);
            for (const { strip, base } of strips) strip.position.z = base - distance % 2.5;
        },
    };
}
