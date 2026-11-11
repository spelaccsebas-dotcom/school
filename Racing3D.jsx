import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Racing3D({ onGameEnd }) {
  const mountRef = useRef(null);
  const gameRef = useRef({});
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(0);

  const startGame = () => {
    setStarted(true);
    setGameOver(false);
    setScore(0);
    initGame();
  };

  const initGame = () => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 80);

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Road segments
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const roadSegments = [];
    for (let i = 0; i < 20; i++) {
      const geo = new THREE.BoxGeometry(8, 0.2, 10);
      const road = new THREE.Mesh(geo, roadMat);
      road.position.set(0, -0.1, -i * 10 + 50);
      scene.add(road);
      roadSegments.push(road);
    }

    // Lane markings
    const lineMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const lines = [];
    for (let i = 0; i < 20; i++) {
      const geo = new THREE.BoxGeometry(0.2, 0.05, 3);
      const line = new THREE.Mesh(geo, lineMat);
      line.position.set(0, 0.01, -i * 10 + 50);
      scene.add(line);
      lines.push(line);
    }

    // Grass
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const grassL = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 200), grassMat);
    grassL.position.set(-14, -0.2, 0);
    scene.add(grassL);
    const grassR = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 200), grassMat);
    grassR.position.set(14, -0.2, 0);
    scene.add(grassR);

    // Player car
    const carGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(1.5, 0.6, 3);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    carGroup.add(body);
    const roofGeo = new THREE.BoxGeometry(1, 0.5, 1.5);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 0.55, -0.2);
    carGroup.add(roof);
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [[-0.85, -0.3, 1], [0.85, -0.3, 1], [-0.85, -0.3, -1], [0.85, -0.3, -1]].forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      carGroup.add(wheel);
    });
    carGroup.position.set(0, 0.4, 5);
    scene.add(carGroup);

    // Obstacles
    const obstacles = [];
    const obstacleColors = [0x3498db, 0xf39c12, 0x9b59b6, 0x1abc9c];
    for (let i = 0; i < 8; i++) {
      const oGroup = new THREE.Group();
      const oBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 3), new THREE.MeshLambertMaterial({ color: obstacleColors[i % 4] }));
      oGroup.add(oBody);
      const oRoof = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1.5), new THREE.MeshLambertMaterial({ color: obstacleColors[i % 4] }));
      oRoof.position.set(0, 0.55, -0.2);
      oGroup.add(oRoof);
      oGroup.position.set((Math.random() - 0.5) * 5, 0.4, -i * 25 - 30);
      scene.add(oGroup);
      obstacles.push(oGroup);
    }

    const keys = {};
    const onKey = (e) => { keys[e.key] = e.type === 'keydown'; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    let carX = 0;
    let gameSpeed = 0.15;
    let dist = 0;
    let alive = true;
    let animId;

    const animate = () => {
      if (!alive) return;
      animId = requestAnimationFrame(animate);

      // Move car
      if (keys['ArrowLeft'] || keys['a']) carX = Math.max(-3, carX - 0.08);
      if (keys['ArrowRight'] || keys['d']) carX = Math.min(3, carX + 0.08);
      carGroup.position.x += (carX - carGroup.position.x) * 0.1;

      // Move road
      gameSpeed = Math.min(0.5, gameSpeed + 0.0001);
      dist += gameSpeed;

      roadSegments.forEach(r => { r.position.z += gameSpeed; if (r.position.z > 15) r.position.z -= 200; });
      lines.forEach(l => { l.position.z += gameSpeed; if (l.position.z > 15) l.position.z -= 200; });

      // Move obstacles
      obstacles.forEach(o => {
        o.position.z += gameSpeed;
        if (o.position.z > 15) {
          o.position.z = -180;
          o.position.x = (Math.random() - 0.5) * 5;
        }
        // Collision
        const dx = Math.abs(carGroup.position.x - o.position.x);
        const dz = Math.abs(carGroup.position.z - o.position.z);
        if (dx < 1.2 && dz < 2.5) {
          alive = false;
          const finalScore = Math.floor(dist);
          setGameOver(true);
          setScore(finalScore);
          onGameEnd?.(finalScore);
        }
      });

      setScore(Math.floor(dist));
      setSpeed(Math.round(gameSpeed * 200));

      renderer.render(scene, camera);
    };
    animate();

    gameRef.current = { renderer, scene, animId, alive: () => alive, stop: () => { alive = false; }, cleanup: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    }};
  };

  useEffect(() => {
    return () => { gameRef.current.cleanup?.(); };
  }, []);

  const handleStart = () => {
    gameRef.current.cleanup?.();
    startGame();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {started && (
        <div className="flex justify-between w-full text-sm">
          <span className="text-white font-bold">Score: {score}m</span>
          <span className="text-yellow-400 font-bold">🚀 {speed} km/h</span>
          <span className="text-slate-400 text-xs">← → om te sturen</span>
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '320px' }} className="rounded-xl overflow-hidden bg-slate-900 relative">
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
            <div className="text-6xl mb-4">🏎️</div>
            <h3 className="text-white font-bold text-xl mb-2">3D Racing</h3>
            <p className="text-slate-400 text-sm mb-6 text-center">Gebruik ← → om te sturen<br/>Ontwijkt auto's zo lang mogelijk</p>
            <button onClick={handleStart} className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 text-white rounded-xl font-bold text-lg">
              Start Race!
            </button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-white font-bold text-xl mb-1">Game Over!</div>
            <div className="text-yellow-400 mb-4">Afstand: {score}m</div>
            <button onClick={handleStart} className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold">
              Opnieuw
            </button>
          </div>
        )}
      </div>
    </div>
  );
}