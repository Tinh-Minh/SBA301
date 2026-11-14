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
        update() {
            markings.opacity = 0;
            road.visible = false;
        },
    };
}

function createTreadTexture() {
    const width = 64;
    const height = 256;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(18,16,14,0.88)";
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "destination-out";
    context.fillStyle = "rgba(0,0,0,0.45)";
    for (let y = 0; y < height; y += 18) context.fillRect(6, y, width - 12, 3);
    context.globalCompositeOperation = "destination-in";
    const edge = context.createLinearGradient(0, 0, width, 0);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(0.18, "rgba(0,0,0,1)");
    edge.addColorStop(0.82, "rgba(0,0,0,1)");
    edge.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = edge;
    context.fillRect(0, 0, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.premultiplyAlpha = false;
    texture.anisotropy = 8;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export function createTireTracks(scene) {
    const texture = createTreadTexture();
    const tracks = new Map();
    const contact = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const side = new THREE.Vector3();
    const view = new THREE.Vector3();
    const maxPoints = 80;
    let armed = false;

    function createTrack(wheel) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(maxPoints * 2 * 3);
        const uvs = new Float32Array(maxPoints * 2 * 2);
        const alphas = new Float32Array(maxPoints * 2);
        const indices = new Uint16Array((maxPoints - 1) * 6);
        for (let index = 0; index < maxPoints - 1; index += 1) {
            const left = index * 2;
            const offset = index * 6;
            indices[offset] = left;
            indices[offset + 1] = left + 1;
            indices[offset + 2] = left + 2;
            indices[offset + 3] = left + 1;
            indices[offset + 4] = left + 3;
            indices[offset + 5] = left + 2;
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
        geometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.setDrawRange(0, 0);
        const material = new THREE.ShaderMaterial({
            uniforms: { map: { value: texture } },
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
            vertexShader: `
                attribute float alpha;
                varying float vAlpha;
                varying vec2 vUv;
                void main() {
                    vAlpha = alpha;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D map;
                varying float vAlpha;
                varying vec2 vUv;
                void main() {
                    vec4 color = texture2D(map, vUv);
                    float opacity = color.a * vAlpha;
                    if (opacity < 0.03) discard;
                    gl_FragColor = vec4(color.rgb * opacity, opacity);
                }
            `,
        });
        material.map = texture;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 3;
        mesh.frustumCulled = false;
        mesh.visible = false;
        scene.add(mesh);
        const track = { points: [], geometry, mesh, side: new THREE.Vector3(1, 0, 0) };
        tracks.set(wheel.uuid, track);
        return track;
    }

    function rebuild(track, halfWidth) {
        const points = track.points;
        const count = points.length;
        if (count < 2) {
            track.mesh.visible = false;
            return;
        }
        const positions = track.geometry.attributes.position.array;
        const uvs = track.geometry.attributes.uv.array;
        const alphas = track.geometry.attributes.alpha.array;
        let traveled = 0;
        for (let index = 0; index < count; index += 1) {
            const current = points[index].position;
            const before = points[Math.max(0, index - 1)].position;
            const after = points[Math.min(count - 1, index + 1)].position;
            forward.subVectors(after, before);
            if (forward.lengthSq() > 1e-6) {
                forward.normalize();
                side.crossVectors(forward, view);
                if (side.lengthSq() > 1e-6) {
                    side.normalize();
                    if (side.dot(track.side) < 0) side.negate();
                    track.side.lerp(side, 0.45).normalize();
                }
            }
            const vertex = index * 6;
            positions[vertex] = current.x + track.side.x * halfWidth - view.x * 0.03;
            positions[vertex + 1] = current.y + track.side.y * halfWidth - view.y * 0.03;
            positions[vertex + 2] = current.z + track.side.z * halfWidth - view.z * 0.03;
            positions[vertex + 3] = current.x - track.side.x * halfWidth - view.x * 0.03;
            positions[vertex + 4] = current.y - track.side.y * halfWidth - view.y * 0.03;
            positions[vertex + 5] = current.z - track.side.z * halfWidth - view.z * 0.03;
            if (index > 0) traveled += current.distanceTo(before);
            const along = traveled / Math.max(halfWidth * 5, 0.08);
            const fade = Math.min(1, (index + 1) / Math.min(count, 6)) * 0.72;
            uvs[index * 4] = 0.12;
            uvs[index * 4 + 1] = along;
            uvs[index * 4 + 2] = 0.88;
            uvs[index * 4 + 3] = along;
            alphas[index * 2] = fade;
            alphas[index * 2 + 1] = fade;
        }
        track.geometry.attributes.position.needsUpdate = true;
        track.geometry.attributes.uv.needsUpdate = true;
        track.geometry.attributes.alpha.needsUpdate = true;
        track.geometry.setDrawRange(0, (count - 1) * 6);
        track.mesh.visible = true;
    }

    function trim(points, maxLength) {
        let length = 0;
        for (let index = points.length - 1; index > 0; index -= 1) {
            length += Math.hypot(points[index].position.x - points[index - 1].position.x, points[index].position.z - points[index - 1].position.z);
            if (length > maxLength) {
                points.splice(0, index);
                return;
            }
        }
    }

    return {
        update(dt, { wheels, groundY, worldRadius, active, camera, retain = true }) {
            camera.getWorldDirection(view);
            const aging = retain ? 1 : 12;
            for (const track of tracks.values()) {
                for (const point of track.points) point.age += dt * aging;
                while (track.points.length && track.points[0].age > 2.4) track.points.shift();
            }
            const rearWheels = wheels.filter(({ wheel }) => /Rear/.test(wheel.name));
            const halfWidth = Math.max(worldRadius * 0.22, 0.035);
            const paint = () => {
                for (const track of tracks.values()) rebuild(track, halfWidth);
                return [...tracks.values()].some(track => track.mesh.visible);
            };
            if (!active || rearWheels.length < 2 || !(worldRadius > 0)) {
                armed = false;
                return paint();
            }
            const spacing = Math.max(worldRadius * 0.14, 0.03);
            const maxLength = Math.max(worldRadius * 5.5, 1.15);
            if (!armed) {
                armed = true;
                for (const track of tracks.values()) track.points.length = 0;
                for (const { wheel } of rearWheels) {
                    const track = tracks.get(wheel.uuid) ?? createTrack(wheel);
                    wheel.getWorldPosition(contact);
                    contact.y = groundY;
                    track.points.push({ position: contact.clone(), age: 0 });
                }
                return false;
            }
            for (const { wheel } of rearWheels) {
                const track = tracks.get(wheel.uuid) ?? createTrack(wheel);
                wheel.getWorldPosition(contact);
                contact.y = groundY;
                const points = track.points;
                const last = points.at(-1);
                const step = last ? contact.distanceTo(last.position) : spacing;
                if (!last || step > 4) {
                    points.length = 0;
                    points.push({ position: contact.clone(), age: 0 });
                    continue;
                }
                if (points.length === 1) {
                    if (step >= spacing) points.push({ position: contact.clone(), age: 0 });
                } else if (step >= spacing) {
                    const copies = Math.min(8, Math.ceil(step / spacing));
                    for (let copy = 1; copy <= copies; copy += 1) {
                        const position = last.position.clone().lerp(contact, copy / copies);
                        position.y = THREE.MathUtils.lerp(last.position.y, groundY, copy / copies);
                        points.push({ position, age: 0 });
                    }
                } else {
                    last.position.copy(contact);
                    last.age = 0;
                }
                while (points.length > maxPoints) points.shift();
                trim(points, maxLength);
            }
            return paint();
        },
    };
}
