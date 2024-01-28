import { useEffect, useRef } from 'react';
import * as CANNON from 'cannon';

const usePhysics = (options = {}, onInit) => {
    const bodyRef = useRef(null);

    useEffect(() => {
        const { mass = 0, position = [0, 0, 0], ...rest } = options;

        const body = new CANNON.Body({
            mass: mass,
            position: new CANNON.Vec3(position[0], position[1], position[2]),
            ...rest,
        });

        onInit(body);
        bodyRef.current = body;

        return () => {
            if (bodyRef.current.world) {
                bodyRef.current.world.removeBody(bodyRef.current);
            }
        };
    }, [options, onInit]);

    return bodyRef.current;
};

export default usePhysics;
