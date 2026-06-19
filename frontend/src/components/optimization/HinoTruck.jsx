import React from 'react';
import { useGLTF } from '@react-three/drei';

function HinoTruck() {
  const { scene } = useGLTF(
    '/models/hino_truck_300_series_euro5.glb'
  );

  return (
    <primitive
      object={scene}
      scale={86}
      position={[1.5, -0.33, 1.58]}
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
}

useGLTF.preload('/models/hino_truck_300_series_euro5.glb');

export default HinoTruck;