import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "react-three-fiber";
import * as CANNON from 'cannon';
import usePhysics from "./physics.jsx";
import textureImage from "../../../public/leather.jpg";

const RectangleWithShortThreadAndTexture = ({ parentObject }) => {
    const groupRef = useRef();
    const boxRef = useRef();
    const threadRef = useRef();

    // Создаем тело прямоугольника для физики
    const boxBody = usePhysics({ mass: 1 }, (body) => {
        body.addShape(new CANNON.Box(new CANNON.Vec3(0.005, 0.025, 0.025)));
        body.position.set(0.051, 0, -0.08);
        body.angularDamping = 0.1;
        boxRef.current = body;
    });

    // Создаем тело нити для физики
    const threadBody = usePhysics({ mass: 0 }, (body) => {
        body.addShape(new CANNON.Box(new CANNON.Vec3(0.001, 0.025, 0.001)));
        body.position.set(0, 0.025, 0);
        body.angularDamping = 0.1;
        threadRef.current = body;
    });

    useEffect(() => {
        const group = new THREE.Group();
        groupRef.current = group;
        parentObject.add(group);

        // Создаем прямоугольник
        const boxGeometry = new THREE.BoxGeometry(0.01, 0.05, 0.05);
        const texture = new THREE.TextureLoader().load(textureImage);
        const boxMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        group.add(boxMesh);

        // Создаем нить (линию)
        const threadGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.05, 0),
        ]);
        const threadMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const threadLine = new THREE.Line(threadGeometry, threadMaterial);
        group.add(threadLine);

        return () => {
            parentObject.remove(group);
        };
    }, [parentObject]);

    // Обновляем позицию объектов при изменении тел физики
    useFrame(() => {
        if (groupRef.current && boxRef.current) {
            groupRef.current.position.copy(boxRef.current.position);
            groupRef.current.quaternion.copy(boxRef.current.quaternion);
        }
    });

    return null;
};

export default RectangleWithShortThreadAndTexture;
