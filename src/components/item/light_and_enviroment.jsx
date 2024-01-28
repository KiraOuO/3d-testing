import React from "react";
import { Environment} from "@react-three/drei";


const LightAndEnvironment = () => {
    return (
        <>
            <directionalLight
                position={[0, -10, 0]}
                intensity={2.5}
                color={0xffffff}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={200}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <directionalLight
                position={[10, 2, 5]}
                intensity={2}
                color={0xffffff}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={200}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            <Environment preset="city" background={false} />
        </>
    );
};

export default LightAndEnvironment;
