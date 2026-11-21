"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ArrowUpRight, Sparkles, Zap, Calendar, ChevronDown } from "lucide-react";

interface HeroScrollSectionProps {
  onOpenFixMeet: () => void;
}

// ── Technical Decal Canvas Texture Generator ──
function createDecalTexture(type: "1.1%" | "3.2%" | "4.8%" | "arrows-dual" | "target-node" | "axis-grid"): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  ctx.strokeStyle = "#111111";
  ctx.fillStyle = "#111111";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (type === "1.1%") {
    // Corner calibration ticks
    const p = 40;
    const l = 32;
    // Top-left
    ctx.beginPath(); ctx.moveTo(p, p + l); ctx.lineTo(p, p); ctx.lineTo(p + l, p); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(size - p - l, p); ctx.lineTo(size - p, p); ctx.lineTo(size - p, p + l); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(p, size - p - l); ctx.lineTo(p, size - p); ctx.lineTo(p + l, size - p); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(size - p - l, size - p); ctx.lineTo(size - p, size - p); ctx.lineTo(size - p, size - p - l); ctx.stroke();

    // Bold technical percentage
    ctx.font = "900 108px 'SF Mono', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("1.1%", size / 2, size / 2 - 25);

    // Node icon / currency symbol below
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 + 90, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "800 44px 'SF Mono', monospace";
    ctx.fillText("$", size / 2, size / 2 + 92);

    // Diagonal coordinate arrow
    ctx.beginPath();
    ctx.moveTo(size - 90, 90); ctx.lineTo(size - 60, 60);
    ctx.moveTo(size - 80, 60); ctx.lineTo(size - 60, 60); ctx.lineTo(size - 60, 80);
    ctx.stroke();

  } else if (type === "3.2%") {
    // Diamond / Ethereum-style polyhedron node wireframe
    ctx.beginPath();
    ctx.moveTo(size / 2, 70);
    ctx.lineTo(size / 2 + 65, 135);
    ctx.lineTo(size / 2, 175);
    ctx.lineTo(size / 2 - 65, 135);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 2, 70);
    ctx.lineTo(size / 2, 175);
    ctx.stroke();

    // Bold technical percentage
    ctx.font = "900 108px 'SF Mono', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("3.2%", size / 2, size / 2 + 50);

    // Micro technical badge below
    ctx.font = "700 24px 'SF Mono', monospace";
    ctx.fillText("PROTO · SPEC 01", size / 2, size - 80);

    // Arrow in bottom-left
    ctx.beginPath();
    ctx.moveTo(85, size - 85); ctx.lineTo(60, size - 60);
    ctx.moveTo(75, size - 60); ctx.lineTo(60, size - 60); ctx.lineTo(60, size - 75);
    ctx.stroke();

  } else if (type === "4.8%") {
    // Segmented circular node icon
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(size / 2, 120, 48, -Math.PI * 0.8, Math.PI * 0.3);
    ctx.stroke();

    // 4 small satellite dots
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((a) => {
      ctx.beginPath();
      ctx.arc(size / 2 + Math.cos(a) * 48, 120 + Math.sin(a) * 48, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bold technical percentage
    ctx.font = "900 108px 'SF Mono', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("4.8%", size / 2, size / 2 + 55);

    // Technical indicator
    ctx.font = "800 24px 'SF Mono', monospace";
    ctx.fillText("[ DELTA: +0.89 ]", size / 2, size - 80);

  } else if (type === "arrows-dual") {
    // Technical coordinate arrows with tick marks
    ctx.lineWidth = 7;
    // Arrow top-right
    ctx.beginPath();
    ctx.moveTo(size / 2 - 80, size / 2 + 80);
    ctx.lineTo(size / 2 + 80, size / 2 - 80);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 2 + 40, size / 2 - 80);
    ctx.lineTo(size / 2 + 80, size / 2 - 80);
    ctx.lineTo(size / 2 + 80, size / 2 - 40);
    ctx.stroke();

    // Arrow bottom-left
    ctx.beginPath();
    ctx.moveTo(size / 2 - 40, size / 2 + 80);
    ctx.lineTo(size / 2 - 80, size / 2 + 80);
    ctx.lineTo(size / 2 - 80, size / 2 + 40);
    ctx.stroke();

    // Dimension tick lines
    ctx.font = "800 28px 'SF Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("0.89mm", size / 2 + 40, size / 2 + 40);

  } else if (type === "target-node") {
    // Crosshair target node
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size / 2 - 110, size / 2); ctx.lineTo(size / 2 + 110, size / 2);
    ctx.moveTo(size / 2, size / 2 - 110); ctx.lineTo(size / 2, size / 2 + 110);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 10, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === "axis-grid") {
    // 3x3 dot matrix + axis label
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        ctx.beginPath();
        ctx.arc(size / 2 + c * 50, size / 2 - 20 + r * 50, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.font = "800 26px 'SF Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("MATRIX // 3x3", size / 2, size - 90);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export default function HeroScrollSection({ onOpenFixMeet }: HeroScrollSectionProps) {
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollWrapper = scrollWrapperRef.current;
    const canvas = canvasRef.current;
    if (!scrollWrapper || !canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ── Three.js Scene Setup ──
    const scene = new THREE.Scene();

    // Calibrated Perspective Camera with narrow FOV to minimize distortion
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Soft Studio Lighting (no harsh specular blowouts) ──
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.7);
    mainLight.position.set(7, 10, 8);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.85);
    fillLight.position.set(-7, -4, -6);
    scene.add(fillLight);

    const topSoftWarm = new THREE.PointLight(0xfef3c7, 0.9, 20);
    topSoftWarm.position.set(0, 7, 3);
    scene.add(topSoftWarm);

    // ── Root Group for All 3D Content (Controlled by Scroll) ──
    const rubikGroup = new THREE.Group();
    rubikGroup.scale.set(0.68, 0.68, 0.68);
    scene.add(rubikGroup);

    // ── Master Group for Tilted Isometric Reference Angle ──
    // Matches target SWAPP reference angle: [Math.PI / 5, -Math.PI / 4, Math.PI / 8]
    const masterAssembly = new THREE.Group();
    masterAssembly.rotation.set(Math.PI / 5, -Math.PI / 4, Math.PI / 8);
    rubikGroup.add(masterAssembly);

    // Static group (18 stationary cubes: x !== 1)
    const staticGroup = new THREE.Group();
    masterAssembly.add(staticGroup);

    // Slice group (9 cubes for right/top slice: x === 1)
    const sliceGroup = new THREE.Group();
    masterAssembly.add(sliceGroup);

    // ── Colors matching Vice Protocol / SWAPP Reference ──
    const COLOR_PURPLE = 0xb4b0f5;  // Soft Periwinkle Purple (~20 cubes)
    const COLOR_GOLD = 0xe2c870;    // Muted Warm Gold (~5 cubes)
    const COLOR_CHARCOAL = 0x18181b;// Deep Charcoal (~2 contrast cubes)

    const CUBE_SIZE = 0.85;
    const GAP = 0.04;
    const STEP = 0.89; // CUBE_SIZE + GAP = 0.89

    // Geometries & Materials
    const roundedCubeGeo = new RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 4, 0.03);
    const boxRefGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    const edgesGeometry = new THREE.EdgesGeometry(boxRefGeo);
    const edgeLineMaterial = new THREE.LineBasicMaterial({
      color: 0x111111,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.95,
    });

    const matPurple = new THREE.MeshStandardMaterial({
      color: COLOR_PURPLE,
      roughness: 0.65,
      metalness: 0.1,
    });

    const matGold = new THREE.MeshStandardMaterial({
      color: COLOR_GOLD,
      roughness: 0.65,
      metalness: 0.1,
    });

    const matCharcoal = new THREE.MeshStandardMaterial({
      color: COLOR_CHARCOAL,
      roughness: 0.65,
      metalness: 0.1,
    });

    function getSubCubeMaterial(x: number, y: number, z: number): THREE.MeshStandardMaterial {
      // 2 Deep Charcoal contrast cubes
      if (x === 1 && y === -1 && z === 0) return matCharcoal;
      if (x === 0 && y === -1 && z === -1) return matCharcoal;

      // 5 Muted Warm Gold accent cubes (top corner & front outer slice)
      if (x === 1 && y === 1 && z === 1) return matGold;
      if (x === 1 && y === 1 && z === 0) return matGold;
      if (x === 0 && y === 1 && z === 1) return matGold;
      if (x === -1 && y === 1 && z === 1) return matGold;
      if (x === 1 && y === 0 && z === 1) return matGold;

      // Primary body cubes (~20 cubes)
      return matPurple;
    }

    // Helper to create decal plane
    const decalPlaneGeo = new THREE.PlaneGeometry(0.70, 0.70);
    const makeDecalMesh = (texture: THREE.CanvasTexture) => {
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      });
      return new THREE.Mesh(decalPlaneGeo, mat);
    };

    // Pre-create textures
    const texDecal11 = createDecalTexture("1.1%");
    const texDecal32 = createDecalTexture("3.2%");
    const texDecal48 = createDecalTexture("4.8%");
    const texArrowsDual = createDecalTexture("arrows-dual");
    const texTargetNode = createDecalTexture("target-node");
    const texAxisGrid = createDecalTexture("axis-grid");

    // ── Build Exact 3x3x3 Rubik's Assembly (27 cubes) ──
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const material = getSubCubeMaterial(x, y, z);
          const subCube = new THREE.Mesh(roundedCubeGeo, material);
          subCube.position.set(x * STEP, y * STEP, z * STEP);

          // Technical Black Vector Outline (1.5px CAD illustration border)
          const edges = new THREE.LineSegments(edgesGeometry, edgeLineMaterial);
          edges.scale.set(1.002, 1.002, 1.002);
          subCube.add(edges);

          // Technical Decals on select visible outer faces of the main assembly
          if (x === 0 && y === 1 && z === 0) {
            // Top face: Dual directional coordinate arrows
            const decal = makeDecalMesh(texArrowsDual);
            decal.position.set(0, CUBE_SIZE / 2 + 0.003, 0);
            decal.rotation.x = -Math.PI / 2;
            subCube.add(decal);
          } else if (x === -1 && y === 0 && z === 1) {
            // Front face: Target crosshair node
            const decal = makeDecalMesh(texTargetNode);
            decal.position.set(0, 0, CUBE_SIZE / 2 + 0.003);
            subCube.add(decal);
          } else if (x === 1 && y === 0 && z === 0) {
            // Right face: 3x3 axis grid
            const decal = makeDecalMesh(texAxisGrid);
            decal.position.set(CUBE_SIZE / 2 + 0.003, 0, 0);
            decal.rotation.y = Math.PI / 2;
            subCube.add(decal);
          }

          // Slice vs Static grouping
          if (x === 1) {
            sliceGroup.add(subCube);
          } else {
            staticGroup.add(subCube);
          }
        }
      }
    }

    // ── 3 Detached Satellite Cubes (Matching Reference Spec) ──
    const satellitesGroup = new THREE.Group();
    rubikGroup.add(satellitesGroup);

    // 1. Bottom-Left Cube: Position [-3.4, -1.3, 0.5], Gold, tilted independently
    const satBL = new THREE.Mesh(roundedCubeGeo, matGold);
    satBL.position.set(-3.4, -1.3, 0.5);
    satBL.rotation.set(0.35, 0.45, -0.2);
    const satBLEdges = new THREE.LineSegments(edgesGeometry, edgeLineMaterial);
    satBLEdges.scale.set(1.002, 1.002, 1.002);
    satBL.add(satBLEdges);
    // Add "1.1%" decal on front face
    const decalBL = makeDecalMesh(texDecal11);
    decalBL.position.set(0, 0, CUBE_SIZE / 2 + 0.003);
    satBL.add(decalBL);
    satellitesGroup.add(satBL);

    // 2. Top-Right Cube: Position [1.4, 2.3, 0.8], Purple, tilted independently
    const satTR = new THREE.Mesh(roundedCubeGeo, matPurple);
    satTR.position.set(1.4, 2.3, 0.8);
    satTR.rotation.set(-0.25, 0.4, 0.3);
    const satTREdges = new THREE.LineSegments(edgesGeometry, edgeLineMaterial);
    satTREdges.scale.set(1.002, 1.002, 1.002);
    satTR.add(satTREdges);
    // Add "3.2%" decal on front face
    const decalTR = makeDecalMesh(texDecal32);
    decalTR.position.set(0, 0, CUBE_SIZE / 2 + 0.003);
    satTR.add(decalTR);
    satellitesGroup.add(satTR);

    // 3. Bottom-Right Cube: Position [2.6, -1.0, 0.6], Purple, tilted independently
    const satBR = new THREE.Mesh(roundedCubeGeo, matPurple);
    satBR.position.set(2.6, -1.0, 0.6);
    satBR.rotation.set(0.4, -0.35, 0.45);
    const satBREdges = new THREE.LineSegments(edgesGeometry, edgeLineMaterial);
    satBREdges.scale.set(1.002, 1.002, 1.002);
    satBR.add(satBREdges);
    // Add "4.8%" decal on front face
    const decalBR = makeDecalMesh(texDecal48);
    decalBR.position.set(0, 0, CUBE_SIZE / 2 + 0.003);
    satBR.add(decalBR);
    satellitesGroup.add(satBR);

    // ── Mouse Subtle Parallax ──
    let mouseX = 0;
    let mouseY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handlePointerMove);

    // ── Scroll State & Smooth Interpolation ──
    let targetScrollProgress = 0;
    let smoothScrollProgress = 0;

    const onScroll = () => {
      if (!scrollWrapper) return;
      const rect = scrollWrapper.getBoundingClientRect();
      const scrollDist = scrollWrapper.clientHeight - window.innerHeight;
      const currentScroll = -rect.top;
      targetScrollProgress = Math.max(0, Math.min(1, currentScroll / Math.max(1, scrollDist)));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── Animation Loop (60FPS Hardware Accelerated) ──
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth scroll lerp (0.08 factor gives instant response with zero jitter)
      smoothScrollProgress += (targetScrollProgress - smoothScrollProgress) * 0.08;
      const p = smoothScrollProgress;

      // ── SLICE TWIST ANIMATION ──
      // Animate ONLY sliceGroup.rotation.x smoothly back and forth by Math.PI / 6 (30 deg)
      // using a slow, elegant sine wave so the slice twists cohesively without scattering
      sliceGroup.rotation.x = Math.sin(elapsedTime * 1.4) * (Math.PI / 6);

      // Subtle ambient hover bob for the master assembly
      const ambientBob = Math.sin(elapsedTime * 1.5) * 0.05;

      // Independent floating bob for satellite cubes
      satBL.position.y = -1.3 + Math.sin(elapsedTime * 1.6) * 0.10;
      satBL.rotation.z = -0.2 + Math.cos(elapsedTime * 1.2) * 0.03;

      satTR.position.y = 2.3 + Math.sin(elapsedTime * 1.8 + 1.2) * 0.10;
      satTR.rotation.y = 0.4 + Math.sin(elapsedTime * 1.3) * 0.03;

      satBR.position.y = -1.0 + Math.sin(elapsedTime * 1.5 + 2.5) * 0.10;
      satBR.rotation.x = 0.4 + Math.cos(elapsedTime * 1.4) * 0.03;

      // Gentle mouse parallax on the root assembly
      masterAssembly.rotation.y = -Math.PI / 4 + mouseX * 0.06;
      masterAssembly.rotation.x = Math.PI / 5 - mouseY * 0.05;

      // ── SCROLL-DRIVEN 3D RUBIK CUBE MOVEMENT ──
      // Phase 1 (p=0): Centered at (X=0, Y=0, Scale=0.68)
      // Phase 2 (p=0.4->1.0): Rubik cube glides smoothly down and rightward into the warm card
      // - Card center in world coordinates: X = +2.46, Y = 0.0
      // - Rubik cube lands centered in the warm card at (X = p * 2.46, Y = 0)
      // - Scale: 0.68 -> 0.48 (perfectly proportioned focal jewel inside the 512px card)
      const isMobile = width < 1024;
      const targetPosY = isMobile 
        ? -p * 1.8 + ambientBob 
        : ambientBob;
      const targetPosX = isMobile 
        ? 0 
        : p * 2.46;
      const targetScale = isMobile
        ? Math.max(0.44, 0.60 - p * 0.16)
        : Math.max(0.46, 0.68 - p * 0.20);

      rubikGroup.position.set(targetPosX, targetPosY, 0);
      rubikGroup.scale.set(targetScale, targetScale, targetScale);

      // ── DOM ELEMENTS DIRECT RAF TRANSFORMS (NO REACT RE-RENDERS) ──
      // Phase 1 (Image 1 Hero): Full at p=0, fades out smoothly between p=0.10 and p=0.38
      if (phase1Ref.current) {
        const p1Opacity = Math.max(0, Math.min(1, 1 - (p - 0.10) / 0.28));
        const p1TranslateY = -p * 90;
        phase1Ref.current.style.opacity = p1Opacity.toFixed(3);
        phase1Ref.current.style.transform = `translate3d(0, ${p1TranslateY.toFixed(1)}px, 0)`;
        phase1Ref.current.style.pointerEvents = p1Opacity > 0.05 ? "auto" : "none";
      }

      // Phase 2 (Image 2 Editorial): Enters between p=0.30 and p=0.60, full at p >= 0.60
      if (phase2Ref.current) {
        const p2Opacity = Math.max(0, Math.min(1, (p - 0.30) / 0.30));
        const p2TranslateY = (1 - p2Opacity) * 45;
        phase2Ref.current.style.opacity = p2Opacity.toFixed(3);
        phase2Ref.current.style.transform = `translate3d(0, ${p2TranslateY.toFixed(1)}px, 0)`;
        phase2Ref.current.style.pointerEvents = p2Opacity > 0.05 ? "auto" : "none";
      }

      // Background Tone Transition:
      // p=0.0 -> 0.40: #FAFAFC (Crisp Light Background from Image 1)
      // p=0.40 -> 0.80: #FAF9F6 (Warm Linen Tone from Image 2)
      // p=0.80 -> 1.0: Smoothly blends toward #07080B to meet the dark site
      if (bgRef.current) {
        if (p < 0.4) {
          bgRef.current.style.backgroundColor = "#FAFAFC";
        } else if (p < 0.8) {
          bgRef.current.style.backgroundColor = "#FAF9F6";
        } else {
          const darkT = Math.min(1, (p - 0.8) / 0.2);
          const r = Math.round(250 * (1 - darkT) + 7 * darkT);
          const g = Math.round(249 * (1 - darkT) + 8 * darkT);
          const b = Math.round(246 * (1 - darkT) + 11 * darkT);
          bgRef.current.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }
      }

      // Scroll Prompt Pill fades out early (p > 0.08)
      if (scrollPromptRef.current) {
        const promptOpacity = Math.max(0, 1 - p / 0.08);
        scrollPromptRef.current.style.opacity = promptOpacity.toFixed(3);
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize Handler ──
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      onScroll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", handlePointerMove);
      renderer.dispose();
      roundedCubeGeo.dispose();
      boxRefGeo.dispose();
      edgesGeometry.dispose();
      decalPlaneGeo.dispose();
      matPurple.dispose();
      matGold.dispose();
      matCharcoal.dispose();
      edgeLineMaterial.dispose();
      texDecal11.dispose();
      texDecal32.dispose();
      texDecal48.dispose();
      texArrowsDual.dispose();
      texTargetNode.dispose();
      texAxisGrid.dispose();
    };
  }, []);

  return (
    <div
      ref={scrollWrapperRef}
      className="relative w-full"
      style={{ height: "230vh" }}
    >
      {/* ── STICKY VIEWPORT (PINNED FOR 100VH WHILE USER SCROLLS) ── */}
      <div
        ref={bgRef}
        className="sticky top-0 h-screen w-full overflow-hidden transition-colors duration-200 select-none"
        style={{ backgroundColor: "#FAFAFC" }}
      >
        {/* Subtle Architectural Dot Grid Accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* ── 3D THREE.JS CANVAS (INTERACTIVE RUBIK'S CUBE) ── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
        />

        {/* ══════════════════════════════════════════════════════════
            PHASE 1: IMAGE 1 EXACT RECREATION (SWAPP / VICE PROTOCOL)
            Full-screen light background, giant bold WEBWINK®,
            capsule tabs, bottom ticker bar. Fades out on scroll.
        ══════════════════════════════════════════════════════════ */}
        <div
          ref={phase1Ref}
          className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-slate-950 will-change-transform overflow-hidden"
        >
          {/* Top Bar (Image 1) */}
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full relative z-30 pt-2">
            {/* Left: Brand Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center text-xs font-black font-mono shadow-sm">
                W
              </div>
              <span className="text-sm font-black tracking-tight text-slate-900">
                Webwink Protocol
              </span>
            </div>

            {/* Center: Neo-Editorial Capsule Tabs (From Image 1) */}
            <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100/90 border border-slate-200/90 text-xs font-bold text-slate-600 backdrop-blur-md shadow-sm">
              <a href="#services" className="px-3.5 py-1 rounded-full hover:bg-white hover:text-slate-950 shadow-sm transition-all">
                Services
              </a>
              <a href="#services" className="px-3.5 py-1 rounded-full hover:bg-white hover:text-slate-950 shadow-sm transition-all">
                Rate Card
              </a>
              <a href="#guarantees" className="px-3.5 py-1 rounded-full hover:bg-white hover:text-slate-950 shadow-sm transition-all">
                Guarantees
              </a>
              <a href="#live-showcase" className="px-3.5 py-1 rounded-full hover:bg-white hover:text-slate-950 shadow-sm transition-all">
                Showcase
              </a>
              <a href="#contact" className="px-3.5 py-1 rounded-full hover:bg-white hover:text-slate-950 shadow-sm transition-all">
                Contact
              </a>
            </div>

            {/* Right: Quick Action Links */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <a href="#services" className="hover:text-slate-950 transition-colors hidden sm:inline-block">
                Go to Specs
              </a>
              <button
                onClick={onOpenFixMeet}
                className="hover:text-slate-950 underline underline-offset-4 decoration-amber-500 font-extrabold cursor-pointer"
              >
                Go to Sprints →
              </button>
            </div>
          </div>

          {/* ── CENTER STAGE: DEDICATED VISUAL STAGE CONTAINER (HEIGHT: 440PX) ── */}
          <div className="relative my-auto flex flex-col items-center justify-center w-full max-w-6xl mx-auto">
            
            {/* Visual Stage Container: 440px height, centered directly over WEBWINK */}
            <div className="relative w-full h-[400px] sm:h-[440px] flex items-center justify-center pointer-events-none">
              
              {/* Background Title: Ultra-condensed proportions (scaleY: 1.3, letter-spacing: -0.05em) */}
              <div className="absolute inset-0 flex items-center justify-center select-none z-1">
                <h1
                  className="text-[19vw] sm:text-[18vw] lg:text-[215px] font-black tracking-[-0.05em] text-slate-950 leading-none select-none inline-flex items-start"
                  style={{ transform: "scaleY(1.3)", transformOrigin: "center center" }}
                >
                  WEBWINK
                  <span className="text-[4.5vw] sm:text-[3.5vw] lg:text-[44px] font-black font-mono ml-2 text-slate-800 -translate-y-4 sm:-translate-y-6">
                    ®
                  </span>
                </h1>
              </div>

              {/* ── Frosted Blur Orbs (Depth Accents from Target Reference) ── */}
              {/* Orb 1: Floating circular backdrop-blur over top-left of the "W" */}
              <div
                className="absolute w-[72px] h-[72px] rounded-full pointer-events-none z-15 shadow-2xl"
                style={{
                  top: "10%",
                  left: "14%",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  background: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.6) 0%, rgba(30, 30, 40, 0.45) 50%, rgba(10, 10, 15, 0.8) 100%)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
                }}
              />

              {/* Orb 2: Floating circular backdrop-blur over bottom-right of the "K" */}
              <div
                className="absolute w-[72px] h-[72px] rounded-full pointer-events-none z-15 shadow-2xl"
                style={{
                  bottom: "16%",
                  right: "16%",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  background: "radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.6) 0%, rgba(30, 30, 40, 0.45) 50%, rgba(10, 10, 15, 0.8) 100%)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
                }}
              />

              {/* Dark glassmorphic blur patch overlapping the bottom-left edge of the cube */}
              <div
                className="absolute w-32 h-32 rounded-full pointer-events-none z-15 blur-lg opacity-40"
                style={{
                  bottom: "18%",
                  left: "26%",
                  background: "radial-gradient(circle, rgba(15, 15, 25, 0.8) 0%, rgba(15, 15, 25, 0) 70%)",
                }}
              />

            </div>

            {/* ── Subtitle & CTA Buttons (Safely Positioned Below the Cube) ── */}
            <div className="relative z-30 mt-8 sm:mt-10 max-w-xl mx-auto text-center pointer-events-auto">
              <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed">
                Simple and complete commercial engines for high-growth businesses. High-ticket web applications, autonomous AI agents, and 5–14 day delivery sprints.
              </p>

              {/* Capsule CTA Buttons */}
              <div className="mt-5 flex items-center justify-center gap-3">
                <a
                  href="#services"
                  className="px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore 2026 Rate Card</span>
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                </a>
                <button
                  onClick={onOpenFixMeet}
                  className="px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-300 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-700" />
                  <span>Fix a Meet</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Status Bar (Image 1) */}
          <div className="pt-2 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-bold text-slate-500 max-w-7xl mx-auto w-full relative z-30 pb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700">
                • Last delivery: Enterprise AI Sales Engine deployed in 7 days for SaaS client
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <a
                href="https://github.com/jeevanshbhatia650-rgb/agency_brochure"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-950 transition-colors"
              >
                GitHub
              </a>
              <span>·</span>
              <button
                onClick={onOpenFixMeet}
                className="hover:text-slate-950 transition-colors cursor-pointer"
              >
                Book Sprint
              </button>
              <span>·</span>
              <a href="#contact" className="hover:text-slate-950 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            PHASE 2: IMAGE 2 EXACT RECREATION ("VISUAL POETRY" EDITORIAL)
            Large lowercase headline, ochre accent card on right,
            stats +250k / +800k / 100%, social pills. Fades in on scroll!
        ══════════════════════════════════════════════════════════ */}
        <div
          ref={phase2Ref}
          className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-8 lg:p-10 text-slate-950 opacity-0 pointer-events-none will-change-transform overflow-hidden"
        >
          {/* Top Bar for Editorial Phase */}
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full relative z-30">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-950 text-white">
                Webwink Studio
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline-block">
                • 2026 Commercial Velocity
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenFixMeet}
                className="px-4 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Reserve 2026 Slot →
              </button>
            </div>
          </div>

          {/* Main Editorial Grid (Image 2 Structure) */}
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto relative z-30">
            {/* Left 6 Columns: Giant Lowercase Headline, Description, Social Pills, Key Metrics */}
            <div className="lg:col-span-6 flex flex-col justify-center relative z-30 pointer-events-auto">
              {/* Giant Lowercase Headline (from Image 2: "visual poetry") */}
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-950 leading-[0.95] mb-5">
                commercial<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700">
                  precision.
                </span>
              </h2>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-slate-600 max-w-md font-medium leading-relaxed mb-6">
                Welcome to engineering-grade agency infrastructure. We replace sluggish agency retainers with 5 to 14 day high-ticket sprints: high-conversion web applications, live analytics dashboards, and autonomous AI chatbots.
              </p>

              {/* Social / Channel Circular Pills (from Image 2: yt, ig, fb, x) */}
              <div className="flex items-center gap-2 mb-8">
                <a
                  href="https://github.com/jeevanshbhatia650-rgb/agency_brochure"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                  title="GitHub"
                >
                  gh
                </a>
                <a
                  href="#services"
                  className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                  title="Services"
                >
                  svc
                </a>
                <button
                  onClick={onOpenFixMeet}
                  className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-950 hover:text-white transition-all shadow-sm cursor-pointer"
                  title="Calendar"
                >
                  cal
                </button>
                <a
                  href="#contact"
                  className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                  title="Contact"
                >
                  mail
                </a>
              </div>

              {/* Key Impact Numbers (from Image 2: +250k, +800k, 100%) */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200">
                <div>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                    +250k
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                    Qualified impressions delivered
                  </span>
                </div>

                <div>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                    +800k
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                    Client pipeline unlocked
                  </span>
                </div>

                <div>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-amber-600 tracking-tight">
                    100%
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-500 mt-1">
                    Direct code ownership
                  </span>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: Warm Ochre Accent Card (from Image 2) */}
            {/* The 3D Rubik's cube has now smoothly migrated directly into this zone! */}
            <div className="lg:col-span-6 relative flex justify-end">
              <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#EAB308] via-[#F59E0B] to-[#D97706] p-6 sm:p-8 text-slate-950 shadow-[0_25px_60px_rgba(245,158,11,0.3)] flex flex-col justify-between min-h-[420px] sm:min-h-[460px] w-full max-w-lg overflow-hidden group">
                {/* Specular Highlight Sheen */}
                <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-white/25 blur-3xl pointer-events-none" />

                {/* Top Row: Autonomous Sprint Badge & Globe Icon */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="px-3.5 py-1.5 rounded-full bg-black/10 backdrop-blur-md border border-black/10 text-[11px] font-black tracking-wider uppercase text-slate-900">
                    ⚡ Autonomous Sprint Model
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                </div>

                {/* Center empty showcase area where the 3D Rubik's Cube hovers */}
                <div className="my-auto py-16 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full bg-black/5 border border-black/5 blur-[1px] pointer-events-none" />
                </div>

                {/* Bottom Row: Sprint Pillars & Action Arrow */}
                <div className="relative z-10 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950/90 text-white backdrop-blur-md shadow-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                          Rapid 5 to 14 Day Delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Production launches delivered on fixed dates.
                      </p>
                    </div>

                    <button
                      onClick={onOpenFixMeet}
                      className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer ml-3 flex-shrink-0"
                      title="Reserve Sprint"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Bar: Transition Callout to dark site */}
          <div className="pt-3 border-t border-slate-200/90 flex items-center justify-between text-[11px] font-bold text-slate-500 max-w-7xl mx-auto w-full relative z-30">
            <span className="text-slate-700">
              Scroll down to explore the 2026 Commercial Rate Card &amp; Interactive Engine ↓
            </span>
            <div className="flex items-center gap-3">
              <a href="#services" className="hover:text-slate-950 transition-colors">
                View All 6 Core Services
              </a>
            </div>
          </div>
        </div>

        {/* ── Scroll Guide Indicator ── */}
        <div
          ref={scrollPromptRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1.5 transition-opacity duration-300"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            Scroll to explore
          </span>
          <div className="w-1 h-3 rounded-full bg-slate-400 animate-bounce" />
        </div>

      </div>
    </div>
  );
}
