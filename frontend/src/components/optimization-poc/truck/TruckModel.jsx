import React from 'react';
import TruckCabin from './TruckCabin.jsx';
import TruckCargoBox from './TruckCargoBox.jsx';
import TruckWheel from './TruckWheel.jsx';

function TruckModel({ truck, scale }) {
  const width = truck.ancho_cm * scale;
  const height = truck.alto_cm * scale;
  const depth = truck.largo_cm * scale;
  const cabDepth = Math.max(depth * 0.24, 1.55);
  const cabGap = 0.34;
  const cabZ = depth / 2 + cabDepth * 0.56 + cabGap;
  const wheelRadius = Math.max(height * 0.11, 0.32);
  const wheelWidth = Math.max(wheelRadius * 0.56, 0.2);
  const wheelY = wheelRadius - 0.02;
  const wheelX = width / 2 + wheelWidth * 0.04;
  const rearWheelZ = -depth * 0.34;
  const frontWheelZ = cabZ + cabDepth * 0.04;
  const wheelZPositions = [rearWheelZ, frontWheelZ];

  return (
    <group>
      <TruckCargoBox width={width} height={height} depth={depth} />
      <TruckCabin width={width} height={height} depth={depth} cabZ={cabZ} wheelRadius={wheelRadius} wheelZ={frontWheelZ} wheelX={wheelX} />
      {wheelZPositions.flatMap((wheelZ) => [
        <TruckWheel key={`left-${wheelZ}`} x={-wheelX} y={wheelY} z={wheelZ} radius={wheelRadius} width={wheelWidth} />,
        <TruckWheel key={`right-${wheelZ}`} x={wheelX} y={wheelY} z={wheelZ} radius={wheelRadius} width={wheelWidth} />,
      ])}
    </group>
  );
}

export default TruckModel;
