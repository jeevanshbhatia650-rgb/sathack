'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';

const CUBE_SIZE = 0.96;
const GAP = 0.045;
const STEP = 1.005; // 0.96 + 0.045
const MASTER_SCALE = 1.48;
const SATELLITE_SCALE = 1.35;
const STACK_SCALE = 1.06;

type Axis = 'x' | 'y' | 'z';
type Mode = 'SOLVING' | 'DRAGGING' | 'FALLING';

interface FaceDecal {
  face: 'top' | 'front' | 'right' | 'left';
  text: string;
}

interface CubieData {
  id: number;
  isSatellite: boolean;
  gx: number; // strictly integer -1, 0, 1
  gy: number; // strictly integer -1, 0, 1
  gz: number; // strictly integer -1, 0, 1
  basePos: THREE.Vector3;
  color: string;
  decals?: FaceDecal[];
  quaternion: THREE.Quaternion;
  // Physics state for FALLING mode
  worldPos: THREE.Vector3;
  worldQuat: THREE.Quaternion;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  settled: boolean;
}

const PALETTE = {
  purple: '#B4B0F5',
  gold: '#E2C870',
  charcoal: '#18181B',
};

// Exact satellite positions in open negative space matching the inspiration layout
const SATELLITE_DEFS = [
  {
    id: 101,
    pos: new THREE.Vector3(-5.2, -1.4, 2.6),
    rot: new THREE.Euler(0.45, 0.55, -0.3),
    color: PALETTE.gold,
    decals: [
      { face: 'top' as const, text: '1.1%' },
      { face: 'front' as const, text: '($)' },
    ],
    gx: -3,
    gy: -1,
    gz: 1,
  },
  {
    id: 102,
    pos: new THREE.Vector3(2.4, 3.1, 2.6),
    rot: new THREE.Euler(0.5, -0.6, 0.25),
    color: PALETTE.purple,
    decals: [
      { face: 'top' as const, text: '3.2%' },
      { face: 'front' as const, text: '◆' },
    ],
    gx: 2,
    gy: 2,
    gz: 1,
  },
  {
    id: 103,
    pos: new THREE.Vector3(4.5, -1.3, 2.6),
    rot: new THREE.Euler(0.4, 0.65, -0.25),
    color: PALETTE.purple,
    decals: [
      { face: 'top' as const, text: '⇄' },
      { face: 'front' as const, text: '4.8%' },
    ],
    gx: 3,
    gy: -1,
    gz: 1,
  },
];

export const PlayableRubiksCube: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const { viewport } = useThree();
  const cubeMeshRefs = useRef<(THREE.Group | null)[]>([]);

  // Master isometric orientation tracker
  const masterRotRef = useRef<{ x: number; y: number }>({ x: 0.56, y: -0.74 });
  const masterQuatRef = useRef<THREE.Quaternion>(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0.56, -0.74, 0.38))
  );

  const modeRef = useRef<Mode>('SOLVING');
  const isReassemblingRef = useRef<boolean>(false);
  const reassembleStartTimeRef = useRef<number>(0);
  const fallStartTimeRef = useRef<number>(0);

  // Initialize the 27 main cubies + 3 satellites
  const [cubies, setCubies] = useState<CubieData[]>(() => {
    const list: CubieData[] = [];
    let id = 0;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          let color = PALETTE.purple;

          // Top summit & front accent blocks: Ochre Gold
          if (
            (x === -1 && y === 1 && z === 0) ||
            (x === 0 && y === 1 && z === 0) ||
            (x === 1 && y === 0 && z === 1) ||
            (x === 1 && y === -1 && z === 0)
          ) {
            color = PALETTE.gold;
          }
          // Top-right corner contrast blocks: Charcoal
          else if (
            (x === 1 && y === 1 && z === -1) ||
            (x === 1 && y === 1 && z === 0)
          ) {
            color = PALETTE.charcoal;
          }

          // Technical CAD face icons matching inspiration image
          let decals: FaceDecal[] | undefined = undefined;
          if (x === -1 && y === 0 && z === 1) decals = [{ face: 'front', text: '□' }];
          else if (x === 0 && y === 1 && z === 1) decals = [{ face: 'top', text: '○' }];
          else if (x === 0 && y === -1 && z === 1) decals = [{ face: 'front', text: '■' }];
          else if (x === 1 && y === 0 && z === 1) decals = [{ face: 'front', text: '↕' }];
          else if (x === -1 && y === 1 && z === 1) decals = [{ face: 'top', text: '◇' }];

          const localPos = new THREE.Vector3(x * STEP, y * STEP, z * STEP);
          const initialWorldPos = localPos
            .clone()
            .multiplyScalar(MASTER_SCALE)
            .applyEuler(new THREE.Euler(0.56, -0.74, 0.38));

          list.push({
            id,
            isSatellite: false,
            gx: x,
            gy: y,
            gz: z,
            basePos: localPos,
            color,
            decals,
            quaternion: new THREE.Quaternion(),
            worldPos: initialWorldPos,
            worldQuat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.56, -0.74, 0.38)),
            vel: new THREE.Vector3(),
            angVel: new THREE.Vector3(),
            settled: false,
          });
          id++;
        }
      }
    }

    // 3 Detached Satellites in Negative Space
    SATELLITE_DEFS.forEach((sat) => {
      const initQuat = new THREE.Quaternion().setFromEuler(sat.rot);
      list.push({
        id: sat.id,
        isSatellite: true,
        gx: sat.gx,
        gy: sat.gy,
        gz: sat.gz,
        basePos: sat.pos.clone(),
        color: sat.color,
        decals: sat.decals,
        quaternion: initQuat,
        worldPos: sat.pos.clone(),
        worldQuat: initQuat.clone(),
        vel: new THREE.Vector3(),
        angVel: new THREE.Vector3(),
        settled: false,
      });
    });

    return list;
  });

  // Autonomous Solver State
  const autoSolverRef = useRef<{
    timer: number;
    axis: Axis;
    layer: number;
    dir: number;
    startTime: number;
    duration: number;
    isMoving: boolean;
    currentAngle: number;
  }>({
    timer: 0,
    axis: 'x',
    layer: 1,
    dir: 1,
    startTime: 0,
    duration: 0.65,
    isMoving: false,
    currentAngle: 0,
  });

  // User Pointer Drag / Click State
  const pointerStateRef = useRef<{
    active: boolean;
    isDragging: boolean;
    axis: Axis;
    layer: number;
    startClient: { x: number; y: number };
    currentAngle: number;
    targetAngle: number;
    snapping: boolean;
    lastUserActivity: number;
  }>({
    active: false,
    isDragging: false,
    axis: 'x',
    layer: 1,
    startClient: { x: 0, y: 0 },
    currentAngle: 0,
    targetAngle: 0,
    snapping: false,
    lastUserActivity: 0,
  });

  // Switch between SOLVING / FALLING modes based on scroll
  useEffect(() => {
    if (scrollY >= 60) {
      if (modeRef.current !== 'FALLING') {
        modeRef.current = 'FALLING';
        isReassemblingRef.current = false;
        fallStartTimeRef.current = performance.now();
        // Dispersion impulse directed towards the flanks
        setCubies((prev) =>
          prev.map((c, i) => {
            const isLeft = i < 15;
            return {
              ...c,
              vel: new THREE.Vector3(
                (isLeft ? -1 : 1) * (2.4 + Math.random() * 2.0),
                (c.gy - 1) * 2.0,
                (Math.random() - 0.5) * 1.5
              ),
              angVel: new THREE.Vector3(
                (Math.random() - 0.5) * 4.5,
                (Math.random() - 0.5) * 4.5,
                (Math.random() - 0.5) * 4.5
              ),
              settled: false,
            };
          })
        );
      }
    } else {
      if (modeRef.current === 'FALLING') {
        modeRef.current = 'SOLVING';
        isReassemblingRef.current = true;
        reassembleStartTimeRef.current = performance.now();
      }
    }
  }, [scrollY]);

  // Pointer Down on any cubie face: initiates Click-or-Drag detection
  const handlePointerDown = (e: ThreeEvent<PointerEvent>, cubie: CubieData) => {
    if (scrollY >= 60 || cubie.isSatellite || pointerStateRef.current.snapping) return;
    e.stopPropagation();

    // If solver is currently mid-turn, finish it immediately before starting drag
    if (autoSolverRef.current.isMoving) {
      const finalAngle = autoSolverRef.current.dir * (Math.PI / 2);
      const { axis, layer } = autoSolverRef.current;
      autoSolverRef.current.isMoving = false;
      autoSolverRef.current.currentAngle = 0;

      const axisVec =
        axis === 'x'
          ? new THREE.Vector3(1, 0, 0)
          : axis === 'y'
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(0, 0, 1);
      const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, finalAngle);

      setCubies((prev) =>
        prev.map((c) => {
          if (c.isSatellite) return c;
          const inSlice =
            (axis === 'x' && c.gx === layer) ||
            (axis === 'y' && c.gy === layer) ||
            (axis === 'z' && c.gz === layer);
          if (!inSlice) return c;

          const pos = new THREE.Vector3(c.gx, c.gy, c.gz).applyQuaternion(rotQuat);
          return {
            ...c,
            gx: Math.round(pos.x),
            gy: Math.round(pos.y),
            gz: Math.round(pos.z),
            quaternion: c.quaternion.clone().premultiply(rotQuat),
          };
        })
      );
    }

    modeRef.current = 'DRAGGING';

    const normal = e.face?.normal || new THREE.Vector3(0, 0, 1);
    let axis: Axis = 'x';
    let layer = cubie.gx;

    if (Math.abs(normal.x) > 0.8) {
      axis = 'y';
      layer = cubie.gy;
    } else if (Math.abs(normal.y) > 0.8) {
      axis = 'z';
      layer = cubie.gz;
    } else {
      axis = 'x';
      layer = cubie.gx;
    }

    pointerStateRef.current = {
      active: true,
      isDragging: false,
      axis,
      layer,
      startClient: { x: e.clientX, y: e.clientY },
      currentAngle: 0,
      targetAngle: 0,
      snapping: false,
      lastUserActivity: performance.now(),
    };
  };

  // Window pointer listeners for Drag and Click-to-Twist
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      const state = pointerStateRef.current;
      if (!state.active || state.snapping) return;

      const dx = e.clientX - state.startClient.x;
      const dy = e.clientY - state.startClient.y;
      const dist = Math.hypot(dx, dy);

      if (dist >= 6) {
        state.isDragging = true;
        state.currentAngle = (dx - dy) * 0.018;
        state.lastUserActivity = performance.now();
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      const state = pointerStateRef.current;
      if (!state.active || state.snapping) return;

      const dx = e.clientX - state.startClient.x;
      const dy = e.clientY - state.startClient.y;
      const dist = Math.hypot(dx, dy);

      state.active = false;
      state.lastUserActivity = performance.now();

      if (dist < 6) {
        // SINGLE-CLICK SLICE TOGGLE (< 6px): rotate crisp 90° immediately!
        state.targetAngle = Math.PI / 2;
        state.currentAngle = 0;
        state.snapping = true;
      } else {
        // DRAG-TO-TWIST SLICE: snap to nearest 90° increment
        const quarter = Math.PI / 2;
        const snappedSteps = Math.round(state.currentAngle / quarter);
        state.targetAngle = snappedSteps * quarter;
        state.snapping = true;
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, []);

  // Compute designated stacking slot for a cubie:
  // 2 straight tiers on both sides strictly within website
  const getStackSlot = (index: number, floorY: number, viewportWidth: number) => {
    const isLeft = index < 15;
    const localIdx = isLeft ? index : index - 15; // 0 to 14

    // 2 Tiers on each side:
    // Tier 0 (bottom row on divider line): 8 cubes (localIdx 0 to 7)
    // Tier 1 (top row stacked on top of tier 0): 7 cubes (localIdx 8 to 14)
    const tier = localIdx < 8 ? 0 : 1;
    const col = tier === 0 ? localIdx : localIdx - 8; // 0..7 for tier 0; 0..6 for tier 1

    const spacingX = 1.06;
    const blockH = 1.05;

    // Bounds strictly within website and viewport
    const siteHalfWidth = Math.min(viewportWidth / 2 - 1.25, 9.4);
    const leftOuter = -siteHalfWidth;
    const rightInner = 1.45;

    let slotX = 0;
    if (isLeft) {
      // Left side straight line: Row 0 from leftOuter to leftOuter + 7*spacingX
      const tierOffset = tier === 1 ? spacingX * 0.5 : 0;
      slotX = leftOuter + col * spacingX + tierOffset;
    } else {
      // Right side straight line: Row 0 from rightInner to rightInner + 7*spacingX
      const tierOffset = tier === 1 ? spacingX * 0.5 : 0;
      slotX = rightInner + col * spacingX + tierOffset;
    }

    const slotY = floorY + 0.54 + tier * blockH;
    const slotZ = 0;

    return {
      pos: new THREE.Vector3(slotX, slotY, slotZ),
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)), // 100% upright, straight line
    };
  };

  // Frame Physics & State Machine Loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.03);
    const now = performance.now();
    const mode = modeRef.current;

    // -------------------------------------------------------------------------
    // 0. MASTER ISOMETRIC ROTATION + SUBTLE CURSOR PARALLAX
    // -------------------------------------------------------------------------
    if (mode !== 'FALLING') {
      const targetMasterX = 0.56 + state.pointer.y * 0.28;
      const targetMasterY = -0.74 + state.pointer.x * 0.28;

      masterRotRef.current.x = THREE.MathUtils.lerp(
        masterRotRef.current.x,
        targetMasterX,
        0.1
      );
      masterRotRef.current.y = THREE.MathUtils.lerp(
        masterRotRef.current.y,
        targetMasterY,
        0.1
      );
      masterQuatRef.current.setFromEuler(
        new THREE.Euler(masterRotRef.current.x, masterRotRef.current.y, 0.38)
      );
    }

    // -------------------------------------------------------------------------
    // 1. DRAGGING / CLICK SNAP COMPLETION WITH STRICT INTEGER GRID ENFORCEMENT
    // -------------------------------------------------------------------------
    if (pointerStateRef.current.snapping) {
      const pState = pointerStateRef.current;
      pState.currentAngle = THREE.MathUtils.lerp(
        pState.currentAngle,
        pState.targetAngle,
        0.28
      );

      if (Math.abs(pState.currentAngle - pState.targetAngle) < 0.015) {
        const finalAngle = pState.targetAngle;
        const { axis, layer } = pState;
        pState.snapping = false;
        pState.currentAngle = 0;
        pState.targetAngle = 0;

        if (Math.abs(finalAngle) > 0.01) {
          const axisVec =
            axis === 'x'
              ? new THREE.Vector3(1, 0, 0)
              : axis === 'y'
              ? new THREE.Vector3(0, 1, 0)
              : new THREE.Vector3(0, 0, 1);
          const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, finalAngle);

          setCubies((prev) =>
            prev.map((c) => {
              if (c.isSatellite) return c;
              const inSlice =
                (axis === 'x' && c.gx === layer) ||
                (axis === 'y' && c.gy === layer) ||
                (axis === 'z' && c.gz === layer);
              if (!inSlice) return c;

              const pos = new THREE.Vector3(c.gx, c.gy, c.gz).applyQuaternion(rotQuat);
              const nextQuat = c.quaternion.clone().premultiply(rotQuat);

              return {
                ...c,
                gx: Math.round(pos.x),
                gy: Math.round(pos.y),
                gz: Math.round(pos.z),
                quaternion: nextQuat,
              };
            })
          );
        }
      }
    }

    // Seamlessly resume SOLVING mode after 2.0s of user inactivity
    if (
      mode === 'DRAGGING' &&
      !pointerStateRef.current.active &&
      !pointerStateRef.current.snapping &&
      now - pointerStateRef.current.lastUserActivity > 2000
    ) {
      modeRef.current = 'SOLVING';
      autoSolverRef.current.timer = 0;
    }

    // -------------------------------------------------------------------------
    // 2. AUTONOMOUS SELF-SOLVING LOOP (SOLVING Mode)
    // -------------------------------------------------------------------------
    if (mode === 'SOLVING' && !pointerStateRef.current.active && !pointerStateRef.current.snapping) {
      const solver = autoSolverRef.current;

      if (!solver.isMoving) {
        solver.timer += dt;
        if (solver.timer >= 1.3) {
          solver.timer = 0;
          const axes: Axis[] = ['x', 'y', 'z'];
          const randomAxis = axes[Math.floor(Math.random() * axes.length)];
          const layers = [-1, 0, 1];
          const randomLayer = layers[Math.floor(Math.random() * layers.length)];
          const dir = Math.random() > 0.5 ? 1 : -1;

          solver.axis = randomAxis;
          solver.layer = randomLayer;
          solver.dir = dir;
          solver.startTime = now;
          solver.isMoving = true;
          solver.currentAngle = 0;
        }
      } else {
        const elapsed = (now - solver.startTime) / 1000;
        const progress = Math.min(elapsed / solver.duration, 1);

        // Smooth cubic-in-out easing
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        solver.currentAngle = solver.dir * (Math.PI / 2) * eased;

        // Finish move & strictly snap integer coordinates
        if (progress >= 1) {
          const finalAngle = solver.dir * (Math.PI / 2);
          const { axis, layer } = solver;
          solver.isMoving = false;
          solver.currentAngle = 0;

          const axisVec =
            axis === 'x'
              ? new THREE.Vector3(1, 0, 0)
              : axis === 'y'
              ? new THREE.Vector3(0, 1, 0)
              : new THREE.Vector3(0, 0, 1);
          const rotQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, finalAngle);

          setCubies((prev) =>
            prev.map((c) => {
              if (c.isSatellite) return c;
              const inSlice =
                (axis === 'x' && c.gx === layer) ||
                (axis === 'y' && c.gy === layer) ||
                (axis === 'z' && c.gz === layer);
              if (!inSlice) return c;

              const pos = new THREE.Vector3(c.gx, c.gy, c.gz).applyQuaternion(rotQuat);
              const nextQuat = c.quaternion.clone().premultiply(rotQuat);

              return {
                ...c,
                gx: Math.round(pos.x),
                gy: Math.round(pos.y),
                gz: Math.round(pos.z),
                quaternion: nextQuat,
              };
            })
          );
        }
      }
    }

    // -------------------------------------------------------------------------
    // 3. FALLING CUBES: DYNAMIC ARC INTO 2 STRAIGHT TIERS ON BOTH SIDES
    // -------------------------------------------------------------------------
    if (mode === 'FALLING') {
      const dividerEl =
        typeof document !== 'undefined' ? document.getElementById('footer-divider') : null;
      let floorY = -viewport.height / 2 + 0.58;

      if (dividerEl) {
        const dividerRect = dividerEl.getBoundingClientRect();
        const ndcY = 1 - (dividerRect.top / window.innerHeight) * 2;
        floorY = ndcY * (viewport.height / 2) + 0.58;
      }

      const fallElapsed = (now - fallStartTimeRef.current) / 1000;

      cubies.forEach((c, idx) => {
        const slot = getStackSlot(idx, floorY, viewport.width);

        if (fallElapsed < 0.35) {
          // Dynamic tumble during initial fall
          c.vel.y -= 26 * dt;
          c.worldPos.addScaledVector(c.vel, dt);
          const rotDelta = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(c.angVel.x * dt, c.angVel.y * dt, c.angVel.z * dt)
          );
          c.worldQuat.multiply(rotDelta);
        } else {
          // Smooth glide and snap into exact stack slot
          c.worldPos.lerp(slot.pos, 0.14);
          c.worldQuat.slerp(slot.quat, 0.14);
          if (c.worldPos.distanceTo(slot.pos) < 0.03) {
            c.worldPos.copy(slot.pos);
            c.worldQuat.copy(slot.quat);
          }
        }
      });
    }

    // -------------------------------------------------------------------------
    // 4. MESH TRANSFORMS UPDATE: MATHEMATICAL PRECISION
    // -------------------------------------------------------------------------
    cubies.forEach((c, idx) => {
      const meshGroup = cubeMeshRefs.current[idx];
      if (!meshGroup) return;

      if (mode === 'FALLING') {
        meshGroup.position.copy(c.worldPos);
        meshGroup.quaternion.copy(c.worldQuat);
        meshGroup.scale.setScalar(STACK_SCALE);
      } else {
        // TOP OF PAGE: Exact mathematical positions
        let targetPos: THREE.Vector3;
        let targetQuat: THREE.Quaternion;

        if (c.isSatellite) {
          // Satellites gently repelled from cursor
          const repelX = state.pointer.x * -0.35;
          const repelY = state.pointer.y * -0.35;
          targetPos = new THREE.Vector3(
            c.basePos.x + repelX,
            c.basePos.y + repelY,
            c.basePos.z
          );
          targetQuat = c.quaternion.clone();
        } else {
          // Main grid cubie: strictly computed from integer coordinates
          const localPos = new THREE.Vector3(c.gx * STEP, c.gy * STEP, c.gz * STEP);
          const localQuat = c.quaternion.clone();

          // Apply active slice twist angle
          let activeSliceAngle = 0;
          let activeAxis: Axis = 'x';
          let activeLayer = 0;

          if (pointerStateRef.current.active || pointerStateRef.current.snapping) {
            activeSliceAngle = pointerStateRef.current.currentAngle;
            activeAxis = pointerStateRef.current.axis;
            activeLayer = pointerStateRef.current.layer;
          } else if (autoSolverRef.current.isMoving) {
            activeSliceAngle = autoSolverRef.current.currentAngle;
            activeAxis = autoSolverRef.current.axis;
            activeLayer = autoSolverRef.current.layer;
          }

          if (
            activeSliceAngle !== 0 &&
            ((activeAxis === 'x' && c.gx === activeLayer) ||
              (activeAxis === 'y' && c.gy === activeLayer) ||
              (activeAxis === 'z' && c.gz === activeLayer))
          ) {
            const axisVec =
              activeAxis === 'x'
                ? new THREE.Vector3(1, 0, 0)
                : activeAxis === 'y'
                ? new THREE.Vector3(0, 1, 0)
                : new THREE.Vector3(0, 0, 1);
            const sliceQuat = new THREE.Quaternion().setFromAxisAngle(axisVec, activeSliceAngle);
            localPos.applyQuaternion(sliceQuat);
            localQuat.premultiply(sliceQuat);
          }

          // Transform by master isometric rotation & scale
          targetPos = localPos
            .clone()
            .multiplyScalar(MASTER_SCALE)
            .applyQuaternion(masterQuatRef.current);
          targetQuat = localQuat.clone().premultiply(masterQuatRef.current);
        }

        if (isReassemblingRef.current) {
          // Smooth synchronized return after scrolling back to top
          const elapsed = performance.now() - reassembleStartTimeRef.current;
          const progress = Math.min(elapsed / 850, 1);
          meshGroup.position.lerp(targetPos, 0.18);
          meshGroup.quaternion.slerp(targetQuat, 0.18);
          if (progress >= 1) {
            isReassemblingRef.current = false;
            meshGroup.position.copy(targetPos);
            meshGroup.quaternion.copy(targetQuat);
          }
        } else {
          meshGroup.position.copy(targetPos);
          meshGroup.quaternion.copy(targetQuat);
        }

        meshGroup.scale.setScalar(c.isSatellite ? SATELLITE_SCALE : MASTER_SCALE);
        c.worldPos.copy(meshGroup.position);
        c.worldQuat.copy(meshGroup.quaternion);
      }
    });
  });

  return (
    <group>
      {cubies.map((c, idx) => (
        <group
          key={c.id}
          ref={(el) => {
            cubeMeshRefs.current[idx] = el;
          }}
          onPointerDown={(e) => handlePointerDown(e, c)}
        >
          {/* Sub-Cube Mesh with Synchronously Centered BoxGeometry & 100% Locked 12 Edges */}
          <mesh>
            <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
            <meshStandardMaterial
              color={c.color}
              roughness={0.65}
              metalness={0.1}
            />
            {/* Crisp 1.5px Technical Black Vector Outline */}
            <Edges scale={1.001} threshold={15} color="#111111" />
          </mesh>

          {/* Technical Face Decals Locked to Surface */}
          {c.decals?.map((d, dIdx) => {
            let pos: [number, number, number] = [0, 0, CUBE_SIZE / 2 + 0.005];
            let rot: [number, number, number] = [0, 0, 0];

            if (d.face === 'top') {
              pos = [0, CUBE_SIZE / 2 + 0.005, 0];
              rot = [-Math.PI / 2, 0, 0];
            } else if (d.face === 'right') {
              pos = [CUBE_SIZE / 2 + 0.005, 0, 0];
              rot = [0, Math.PI / 2, 0];
            } else if (d.face === 'left') {
              pos = [-CUBE_SIZE / 2 - 0.005, 0, 0];
              rot = [0, -Math.PI / 2, 0];
            } else if (d.face === 'front') {
              pos = [0, 0, CUBE_SIZE / 2 + 0.005];
              rot = [0, 0, 0];
            }

            return (
              <Text
                key={dIdx}
                position={pos}
                rotation={rot}
                fontSize={c.isSatellite ? 0.28 : 0.24}
                color="#111111"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {d.text}
              </Text>
            );
          })}
        </group>
      ))}
    </group>
  );
};
