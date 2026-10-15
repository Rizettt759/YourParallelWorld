
import * as THREE from "three";

const container = document.getElementById("character3D");

if (container) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#080c1b");

    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2));

    const light = new THREE.PointLight(0x9b5cff, 35);
    light.position.set(2, 3, 4);
    scene.add(light);

    // A temporary character with a visible front
    const character = new THREE.Group();
    scene.add(character);

    const purple = new THREE.MeshStandardMaterial({
        color: "#7b2cff",
        roughness: 0.35,
        metalness: 0.25
    });

    const face = new THREE.MeshStandardMaterial({
        color: "#e9d8ff",
        emissive: "#6d20ff",
        emissiveIntensity: 0.6
    });

    const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.42, 1.1, 6, 16),
        purple
    );
    character.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 24, 24),
        purple
    );
    head.position.y = 1.05;
    character.add(head);

    // Glowing eyes make the front easy to identify
    for (const x of [-0.12, 0.12]) {
        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.045, 12, 12),
            face
        );
        eye.position.set(x, 1.08, 0.285);
        character.add(eye);
    }

    // Keep the character at the centre of the viewer
    character.position.y = -0.1;

    // Free rotation using the mouse or touchpad
    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    const canvas = renderer.domElement;

    canvas.addEventListener("pointerdown", (event) => {
        dragging = true;
        previousX = event.clientX;
        previousY = event.clientY;
        canvas.style.cursor = "grabbing";

        if (canvas.setPointerCapture) {
            canvas.setPointerCapture(event.pointerId);
        }
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;

        const yaw = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            deltaX * 0.01
        );

        const pitch = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            deltaY * 0.01
        );

        // Apply both rotations for diagonal movement and full flips
        character.quaternion.premultiply(yaw);
        character.quaternion.premultiply(pitch);

        previousX = event.clientX;
        previousY = event.clientY;
    });

    function stopDragging() {
        dragging = false;
        canvas.style.cursor = "grab";
    }

    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);

    // Resize the viewer with the window
    window.addEventListener("resize", () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}
