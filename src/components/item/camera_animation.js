import * as THREE from "three";
import { gsap } from "gsap";

export const animateCameraPosition = (camera, targetPosition, callback) => {
    const currentPosition = new THREE.Vector3().copy(camera.position);
    const zoomFactor = window.innerWidth > 768 ? 0.5 : 1.8;
    const zoomedTargetPosition = new THREE.Vector3().copy(targetPosition).multiplyScalar(zoomFactor);

    const startTime = performance.now();
    const duration = 900;

    const updateCameraPosition = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / duration);

        const newPosition = new THREE.Vector3().copy(currentPosition).lerp(zoomedTargetPosition, progress);
        camera.position.copy(newPosition);

        if (progress < 1) {
            requestAnimationFrame(updateCameraPosition);
        } else {
            callback();
        }
    };

    requestAnimationFrame(updateCameraPosition);
};

export const animateTextBlock = (textBlockRef, color) => {
    gsap.to(textBlockRef.style, { opacity: 1, duration: 0.3, ease: "power3.out", color });
};
