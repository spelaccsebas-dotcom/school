import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,0,0,1,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export default function DungeonCrawler({ onGameEnd }) {
  const mountRef = useRef(null);
  const gameRef = useRef({});
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [coins, setCoins] = useState(0);

  const initGame = () => {
    const mount = mountRef.current;
    if (!mount) return;
    gameRef.current.cleanup?.();

    const W = mount.clientWidth, H = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    scene.fog = new THREE.Fog(0x111122, 5, 15);

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100);
    camera.position.set(1.5, 0.5, 1.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    // Lighting
    const torch = new THREE.PointLight(0xff9944, 2, 6);
    camera.add(torch);
    scene.add(camera);
    const ambient = new THREE.AmbientLight(0x222244, 0.5);
    scene.add(ambient);

    // Build maze
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x445566 });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x334433 });
    const ceilMat = new THREE.MeshLambertMaterial({ color: 0x222233 });
    const exitMat = new THREE.MeshLambertMaterial({ color: 0x00ff88, emissive: new THREE.Color(0x00ff44) });

    const coinObjects = [];
    const coinMat = new THREE.MeshLambertMaterial({ color: 0xffdd00, emissive: new THREE.Color(0xffaa00) });

    for (let z = 0; z < MAZE.length; z++) {
      for (let x = 0; x < MAZE[z].length; x++) {
        const cell = MAZE[z][x];
        // Floor
        const floor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 1), floorMat);
        floor.position.set(x, -0.05, z);
        scene.add(floor);
        // Ceiling
        const ceil = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 1), ceilMat);
        ceil.position.set(x, 1.05, z);
        scene.add(ceil);

        if (cell === 1) {
          const wall = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), wallMat);
          wall.position.set(x, 0.5, z);
          scene.add(wall);
        } else if (cell === 2) {
          const exit = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), exitMat);
          exit.position.set(x, 0.4, z - 0.4);
          scene.add(exit);
        } else if (cell === 0 && Math.random() < 0.15) {
          const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), coinMat);
          coin.position.set(x, 0.2, z);
          coin.rotation.x = Math.PI / 2;
          scene.add(coin);
          coinObjects.push({ mesh: coin, x, z, collected: false });
        }
      }
    }

    const keys = {};
    const onKey = (e) => { keys[e.key] = e.type === 'keydown'; };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    let yaw = 0;
    let animId;
    let alive = true;
    let elapsed = 0;
    let coinCount = 0;

    const isWall = (x, z) => {
      const mx = Math.round(x), mz = Math.round(z);
      if (mx < 0 || mz < 0 || mz >= MAZE.length || mx >= MAZE[0].length) return true;
      return MAZE[mz][mx] === 1;
    };

    const lastTime = { t: performance.now() };

    const animate = (now) => {
      if (!alive) return;
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime.t) / 1000, 0.05);
      lastTime.t = now;
      elapsed += dt;

      if (Math.floor(elapsed) > time) setTime(Math.floor(elapsed));

      // Rotate
      if (keys['ArrowLeft'] || keys['q']) yaw += dt * 2;
      if (keys['ArrowRight'] || keys['e']) yaw -= dt * 2;

      const speed = 3;
      const dx = Math.sin(yaw), dz = Math.cos(yaw);
      let nx = camera.position.x, nz = camera.position.z;

      if (keys['ArrowUp'] || keys['w']) { nx += dx * dt * speed; nz += dz * dt * speed; }
      if (keys['ArrowDown'] || keys['s']) { nx -= dx * dt * speed; nz -= dz * dt * speed; }

      if (!isWall(nx, camera.position.z)) camera.position.x = nx;
      if (!isWall(camera.position.x, nz)) camera.position.z = nz;
      camera.rotation.y = yaw;

      // Check exit
      const ex = Math.round(camera.position.x), ez = Math.round(camera.position.z);
      if (MAZE[ez]?.[ex] === 2) {
        alive = false;
        setWon(true);
        onGameEnd?.(coinCount * 50 + Math.max(0, 300 - Math.floor(elapsed)));
        return;
      }

      // Collect coins
      coinObjects.forEach(coin => {
        if (!coin.collected) {
          const dist = Math.hypot(camera.position.x - coin.x, camera.position.z - coin.z);
          if (dist < 0.6) {
            coin.collected = true;
            scene.remove(coin.mesh);
            coinCount++;
            setCoins(coinCount);
          }
        }
      });

      // Rotate coins
      coinObjects.forEach(coin => { if (!coin.collected) coin.mesh.rotation.y += dt * 2; });

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    gameRef.current = {
      cleanup: () => {
        alive = false;
        cancelAnimationFrame(animId);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('keyup', onKey);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
    };
  };

  useEffect(() => () => gameRef.current.cleanup?.(), []);

  const handleStart = () => {
    setStarted(true); setWon(false); setTime(0); setCoins(0);
    setTimeout(initGame, 50);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {started && (
        <div className="flex justify-between w-full text-sm">
          <span className="text-yellow-400 font-bold">🪙 {coins} munten</span>
          <span className="text-white font-bold">⏱ {time}s</span>
          <span className="text-slate-400 text-xs">WASD/Pijlen bewegen | Q/E draaien</span>
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '320px' }} className="rounded-xl overflow-hidden bg-slate-950 relative">
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10">
            <div className="text-6xl mb-4">🏰</div>
            <h3 className="text-white font-bold text-xl mb-2">3D Dungeon Crawler</h3>
            <p className="text-slate-400 text-sm mb-2 text-center">Vind de groene uitgang!</p>
            <p className="text-slate-500 text-xs mb-6 text-center">WASD / Pijlen = lopen | Q/E = draaien<br/>Verzamel gouden munten voor bonuspunten</p>
            <button onClick={handleStart} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg">
              Start Dungeon!
            </button>
          </div>
        )}
        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-white font-bold text-xl mb-1">Ontsnapt!</div>
            <div className="text-yellow-400 mb-1">🪙 {coins} munten • ⏱ {time}s</div>
            <button onClick={handleStart} className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
              Opnieuw
            </button>
          </div>
        )}
      </div>
    </div>
  );
}