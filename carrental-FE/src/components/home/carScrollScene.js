import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createCarLights } from "./carJourneyLights.js";
import { prepareWheels, createCustomer, createExhaust, createRoad, createTireTracks } from "./carJourneyEffects.js";

function createBrandMaterial() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#FC6C26";
    context.font = "800 210px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("CarDB", 512, 168);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -8,
        polygonOffsetUnits: -8,
    });
}

function decalOrientation(right, up, normal) {
    const desired = new THREE.Matrix4().makeBasis(right, up, normal);
    const euler = new THREE.Euler();
    const check = new THREE.Matrix4();
    const got = new THREE.Vector3();
    const spin = new THREE.Quaternion();
    const quaternion = new THREE.Quaternion();
    for (const twist of [0, Math.PI / 2, -Math.PI / 2, Math.PI]) {
        quaternion.setFromRotationMatrix(desired);
        spin.setFromAxisAngle(new THREE.Vector3(0, 0, 1), twist);
        quaternion.multiply(spin);
        euler.setFromQuaternion(quaternion);
        check.makeRotationFromEuler(euler);
        got.setFromMatrixColumn(check, 0);
        if (got.dot(right) > 0.85) return euler;
    }
    return euler;
}

function addCarBrand(model, pivot) {
    const material = createBrandMaterial();
    const raycaster = new THREE.Raycaster();
    const inverse = new THREE.Matrix4().copy(pivot.matrixWorld).invert();
    const localBox = new THREE.Box3().setFromObject(model).applyMatrix4(inverse);
    const skip = /glass|wheel|calliper|light|rim|mirror|window|badge|windwos/i;
    const placements = [
        { name: "left-door", origin: [localBox.max.x + 1.4, 0.72, 0.15], direction: [-1, 0, 0], up: [0, 1, 0], size: [1.15, 0.28] },
        { name: "right-door", origin: [localBox.min.x - 1.4, 0.72, 0.15], direction: [1, 0, 0], up: [0, 1, 0], size: [1.15, 0.28] },
        { name: "roof", origin: [0, localBox.max.y + 1.4, -0.15], direction: [0, -1, 0], up: [0, 0, -1], size: [1.45, 0.48] },
        { name: "hood", origin: [0, localBox.max.y + 1.2, 2.2], direction: [0, -1, 0], up: [0, 0, -1], size: [0.82, 0.2] },
    ];
    for (const placement of placements) {
        const origin = new THREE.Vector3(...placement.origin).applyMatrix4(pivot.matrixWorld);
        const direction = new THREE.Vector3(...placement.direction).transformDirection(pivot.matrixWorld).normalize();
        raycaster.set(origin, direction);
        const hit = raycaster.intersectObject(model, true).find(item => item.face && !skip.test(`${item.object.name} ${item.object.parent?.name || ""}`));
        if (!hit) continue;
        const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
        const up = new THREE.Vector3(...placement.up).transformDirection(pivot.matrixWorld).projectOnPlane(normal);
        if (up.lengthSq() < 1e-4) up.set(0, 1, 0).transformDirection(pivot.matrixWorld).projectOnPlane(normal);
        up.normalize();
        const right = new THREE.Vector3().crossVectors(up, normal).normalize();
        const orientation = decalOrientation(right, up, normal);
        const geometry = new DecalGeometry(hit.object, hit.point, orientation, new THREE.Vector3(placement.size[0], placement.size[1], 0.5));
        geometry.applyMatrix4(inverse);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `brand-${placement.name}`;
        mesh.renderOrder = 2;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        pivot.add(mesh);
    }
}

function disposeObject(root) {
    const textures = new Set();
    const materials = new Set();
    root.traverse(object => {
        object.geometry?.dispose();
        for (const material of [].concat(object.material ?? [])) {
            materials.add(material);
            for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        }
    });
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
}

export function createCarScrollScene(host, { onReady, onError, reducedMotion }) {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    const pivot = new THREE.Group();
    scene.add(pivot);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environmentMap = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    environment.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2));
    const key = new THREE.DirectionalLight(0xfff4e8, 4);
    key.position.set(3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.1, far: 20 });
    key.shadow.normalBias = 0.025;
    key.shadow.bias = -0.0002;
    key.shadow.radius = 4;
    scene.add(key);
    scene.add(key.target);
    const rim = new THREE.DirectionalLight(0xffffff, 3);
    rim.position.set(-4, 3, -5);
    scene.add(rim);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.16, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    let disposed = false;
    let frame = 0;
    let visible = true;
    const current = { x: 0, y: -0.18, scale: 1.12, yaw: -0.65, tilt: 0, overhead: 0, distance: 0, customer: 0, depart: 0, wheelCloseup: 0, wheelSpinSpeed: 0, lapX: 0, lapZ: 0 };
    let target = { ...current };
    const wheels = [];
    let introWheel;
    let wheelRadius = 0;
    let introSpin = 0;
    let closeShotReady = false;
    const wheelCenter = new THREE.Vector3();
    const wheelAxis = new THREE.Vector3();
    const carCenter = new THREE.Vector3();
    const closePosition = new THREE.Vector3();
    const closeTarget = new THREE.Vector3();
    const wideTarget = new THREE.Vector3();
    let lights;
    const customer = createCustomer();
    pivot.add(customer.person);
    customer.person.visible = false;
    const exhaust = createExhaust(scene, renderer);
    const road = createRoad(scene);
    const tracks = createTireTracks(scene);
    const screenOffset = new THREE.Vector3();
    const lightOffset = new THREE.Vector3(3, 7, 5);
    let previousTravel = 0;
    let loaded = false;
    let readyNotified = false;
    let lastTime = 0;
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const visibility = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
        else { cancelAnimationFrame(frame); frame = 0; }
    });
    visibility.observe(host);

    function resize() {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        closeShotReady = false;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        schedule();
    }
    function schedule() {
        if (!disposed && !frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function draw(time) {
        frame = 0;
        const dt = Math.min((time - lastTime) / 1000 || 0.016, 0.15);
        lastTime = time;
        let moving = false;
        for (const key of Object.keys(current)) {
            const destination = key === "yaw" ? current[key] + THREE.MathUtils.euclideanModulo(target[key] - current[key] + Math.PI, Math.PI * 2) - Math.PI : target[key];
            current[key] = reducedMotion ? destination : THREE.MathUtils.damp(current[key], destination, 10, dt);
            if (Math.abs(current[key] - destination) > 0.0002) moving = true;
        }
        const distance = 10.5;
        const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
        const width = height * camera.aspect;
        const fit = Math.min(1.2, width * 0.82 / 5.3);
        const departureView = THREE.MathUtils.smoothstep(current.depart, 0, 0.05);
        const lowCamera = camera.aspect < 1 ? 1.1 : 1.65;
        camera.position.set(0, THREE.MathUtils.lerp(THREE.MathUtils.lerp(2.4, 11, current.overhead), lowCamera, departureView), THREE.MathUtils.lerp(distance, 0.25, current.overhead));
        camera.lookAt(0, THREE.MathUtils.lerp(0.65, lowCamera + 0.45, departureView), 0);
        pivot.rotation.set(0, current.yaw, current.tilt);
        pivot.scale.setScalar(fit * current.scale);
        screenOffset.set(current.x * width, current.y * height, 0).applyQuaternion(camera.quaternion);
        pivot.position.copy(screenOffset);
        // The low rear camera keeps the road's vanishing point beneath the headline.
        // Only depth changes: the wheels stay on the same ground plane.
        pivot.position.z -= current.depart * 18;
        pivot.position.x += current.lapX;
        pivot.position.z += current.lapZ;
        ground.position.set(pivot.position.x, pivot.position.y - 0.01, pivot.position.z);
        key.position.copy(pivot.position).add(lightOffset);
        key.target.position.copy(pivot.position);
        key.target.updateMatrixWorld();
        // Keep the opening camera planted: the car drives out of the wheel shot.
        // The wide view stays on the headline's stage while the car loops offscreen.
        wideTarget.set(0, THREE.MathUtils.lerp(0.65, lowCamera + 0.45, departureView), 0);
        camera.lookAt(wideTarget);
        if (introWheel && current.wheelCloseup > 0.0002) {
            if (!closeShotReady) {
            pivot.updateWorldMatrix(true, true);
            introWheel.getWorldPosition(wheelCenter);
            pivot.localToWorld(carCenter.set(0, 0.65, 0));
            wheelAxis.set(1, 0, 0).transformDirection(introWheel.matrixWorld);
            if (wheelAxis.dot(closeTarget.copy(wheelCenter).sub(carCenter)) < 0) wheelAxis.negate();
            const radius = wheelRadius * pivot.scale.x;
            const framing = camera.aspect < 1 ? 0.52 : 0.62;
            const closeDistance = radius / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * framing * Math.min(1, camera.aspect));
            closePosition.copy(wheelCenter).addScaledVector(wheelAxis, closeDistance);
            closePosition.y += radius * 0.28;
            closeTarget.copy(wheelCenter);
            closeTarget.y += radius * 0.26;
            closeShotReady = true;
            }
            camera.position.lerp(closePosition, current.wheelCloseup);
            camera.lookAt(wideTarget.lerp(closeTarget, current.wheelCloseup));
        }
        const travelSpeed = (current.distance - previousTravel) / Math.max(dt, 0.001);
        previousTravel = current.distance;
        if (!reducedMotion) introSpin += dt * current.wheelSpinSpeed;
        for (const wheel of wheels) wheel.spin(current.distance / 0.39 + introSpin);
        customer.person.visible = current.customer > 0.02;
        customer.materials.forEach(material => { material.opacity = current.customer; });
        customer.person.position.x = -2.1;
        customer.update(time, current.customer, reducedMotion);
        const lightsActive = lights?.update(time, Math.abs(travelSpeed));
        const smokeAlive = exhaust.update(dt, Math.abs(travelSpeed), pivot, loaded && !reducedMotion);
        road.update(pivot, current.overhead, current.distance, current.depart);
        const tracksAlive = tracks.update(dt, {
            wheels,
            groundY: pivot.position.y + 0.02,
            worldRadius: wheelRadius * pivot.scale.x,
            camera,
            active: false,
        });
        renderer.render(scene, camera);
        if (loaded && !readyNotified) { readyNotified = true; onReady(); }
        if ((!reducedMotion && current.wheelCloseup > 0.0002) || moving || smokeAlive || lightsActive || tracksAlive || (!reducedMotion && current.customer > 0.02)) schedule();
    }
    function syncVisibility() {
        if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
        else schedule();
    }
    document.addEventListener("visibilitychange", syncVisibility);
    resize();

    new GLTFLoader().load("/models/car.glb", gltf => {
        if (disposed) { disposeObject(gltf.scene); return; }
        const model = gltf.scene;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const scale = 5.3 / Math.max(size.x, size.y, size.z);
        const normalized = new THREE.Group();
        model.position.sub(center);
        normalized.add(model);
        normalized.scale.setScalar(scale);
        normalized.position.y = size.y * scale / 2;
        model.traverse(object => {
            if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        wheels.push(...prepareWheels(model));
        pivot.add(normalized);
        pivot.updateWorldMatrix(true, true);
        addCarBrand(model, pivot);
        introWheel = wheels.find(({ wheel }) => /^3DWheel[ _]Front[ _]L$/.test(wheel.name))?.wheel;
        if (introWheel) {
            const wheelSize = new THREE.Box3().setFromObject(introWheel).getSize(new THREE.Vector3());
            wheelRadius = Math.max(wheelSize.x, wheelSize.y, wheelSize.z) / (2 * pivot.scale.x);
        }
        lights = createCarLights(model, pivot, { wake:schedule, reducedMotion });
        loaded = true;
        schedule();
    }, undefined, error => { if (!disposed) onError(error); });

    return {
        setPose(pose) {
            target = pose;
            if (!loaded || reducedMotion) Object.assign(current, target);
            schedule();
        },
        dispose() {
            disposed = true;
            lights?.dispose();
            cancelAnimationFrame(frame);
            observer.disconnect();
            visibility.disconnect();
            document.removeEventListener("visibilitychange", syncVisibility);
            disposeObject(scene);
            environmentMap.dispose();
            key.shadow.map?.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        },
    };
}
