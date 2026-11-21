'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { PlayableRubiksCube } from './PlayableRubiksCube';

export const RubiksCubeCanvas: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <OrthographicCamera makeDefault position={[0, 0.4, 20]} zoom={50} />
        <ambientLight intensity={1.3} />
        <directionalLight position={[10, 15, 10]} intensity={1.45} />
        <directionalLight position={[-8, -5, -6]} intensity={0.45} />
        <Suspense fallback={null}>
          <PlayableRubiksCube scrollY={scrollY} />
        </Suspense>
      </Canvas>
    </div>
  );
};
