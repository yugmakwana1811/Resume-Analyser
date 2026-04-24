import { useEffect, useRef } from "react";
import * as THREE from "three";

type OrbitalBackgroundProps = {
  enabled?: boolean;
};

export default function OrbitalBackground({ enabled = true }: OrbitalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(new THREE.Color("#f7f8fc"), 8.5, 22);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12.5);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x9ab6ff, 0.85);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.75);
    dir.position.set(5, 6, 10);
    scene.add(dir);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(1, 4);
    const createOrb = (color: string, scale: number, position: THREE.Vector3) => {
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.32,
        metalness: 0.08,
        transparent: true,
        opacity: 0.72,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(scale);
      mesh.position.copy(position);
      group.add(mesh);
      return mesh;
    };

    const orbA = createOrb("#2f67ff", 1.75, new THREE.Vector3(-2.5, 1.2, -0.8));
    const orbB = createOrb("#4cb9d6", 2.25, new THREE.Vector3(2.8, -1.4, -1.8));
    const orbC = createOrb("#a6b7ff", 1.15, new THREE.Vector3(0.6, 2.8, -3.2));

    const starCount = 520;
    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const ix = i * 3;
      positions[ix] = (Math.random() - 0.5) * 18;
      positions[ix + 1] = (Math.random() - 0.5) * 12;
      positions[ix + 2] = -Math.random() * 18;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.018,
      color: new THREE.Color("#2f67ff"),
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    let raf = 0;
    let last = performance.now();
    let running = true;

    const setSize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;

      group.rotation.y += dt * 0.12;
      group.rotation.x += dt * 0.06;

      orbA.rotation.y += dt * 0.18;
      orbB.rotation.x += dt * 0.12;
      orbC.rotation.z += dt * 0.14;

      stars.rotation.y += dt * 0.03;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    setSize();
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", setSize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", setSize);
      starsGeometry.dispose();
      starsMaterial.dispose();
      geometry.dispose();
      group.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material && "dispose" in mesh.material) {
          (mesh.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
    };
  }, [enabled]);

  return <canvas ref={canvasRef} className="orbital-canvas" aria-hidden="true" />;
}

