import * as THREE from 'https://esm.sh/three@0.170.0';
import { RoomEnvironment } from 'https://esm.sh/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';

/**
 * 3D Luxury Aesthetic Serum Bottle ("Elixir Dourado")
 * Inspired by Klimt Wine's scroll-choreographed 3D product storytelling.
 */
export function initSerum3D(gsap, ScrollTrigger) {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return null;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  const scene = new THREE.Scene();

  // Studio reflections without external HDRI
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(
    36,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.2, 8.5);

  // Warm luxury lighting
  const ambientLight = new THREE.AmbientLight(0xf5efe6, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffe6b8, 2.2);
  keyLight.position.set(5, 6, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc8a46b, 2.6);
  rimLight.position.set(-5, 2, -4);
  scene.add(rimLight);

  const bottomGlow = new THREE.PointLight(0xd8b982, 1.5, 10);
  bottomGlow.position.set(0, -3.5, 2);
  scene.add(bottomGlow);

  // Master group for scroll choreography + mouse parallax
  const masterGroup = new THREE.Group();
  const bottleGroup = new THREE.Group();
  masterGroup.add(bottleGroup);
  scene.add(masterGroup);

  // --- Materials ---
  const amberGlassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x6e4427),
    metalness: 0.05,
    roughness: 0.07,
    transmission: 0.68,
    thickness: 1.4,
    ior: 1.52,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    attenuationColor: new THREE.Color(0x4a2915),
    attenuationDistance: 1.8
  });

  const goldSerumMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xd9b36c),
    emissive: new THREE.Color(0x52340f),
    emissiveIntensity: 0.35,
    metalness: 0.15,
    roughness: 0.12,
    transmission: 0.35,
    ior: 1.45
  });

  const brushedGoldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4b270),
    metalness: 0.92,
    roughness: 0.2
  });

  const espressoCapMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2c1e16),
    metalness: 0.08,
    roughness: 0.48
  });

  const labelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf3eadc),
    metalness: 0.1,
    roughness: 0.55
  });

  // --- 1. Sculpted Glass Bottle Body (LatheGeometry) ---
  const bottleProfile = [
    new THREE.Vector2(0.0, -1.35),
    new THREE.Vector2(0.72, -1.35),
    new THREE.Vector2(0.84, -1.24),
    new THREE.Vector2(0.86, -1.05),
    new THREE.Vector2(0.86, 0.38),
    new THREE.Vector2(0.82, 0.58),
    new THREE.Vector2(0.62, 0.78),
    new THREE.Vector2(0.35, 0.9),
    new THREE.Vector2(0.35, 1.08),
    new THREE.Vector2(0.28, 1.08),
    new THREE.Vector2(0.28, 0.92)
  ];
  const bottleGeo = new THREE.LatheGeometry(bottleProfile, 64);
  const bottleMesh = new THREE.Mesh(bottleGeo, amberGlassMat);
  bottleGroup.add(bottleMesh);

  // --- 2. Inner Golden Serum Liquid ---
  const liquidProfile = [
    new THREE.Vector2(0.0, -1.16),
    new THREE.Vector2(0.73, -1.16),
    new THREE.Vector2(0.75, -1.02),
    new THREE.Vector2(0.75, 0.25),
    new THREE.Vector2(0.66, 0.36),
    new THREE.Vector2(0.0, 0.36)
  ];
  const liquidGeo = new THREE.LatheGeometry(liquidProfile, 48);
  const liquidMesh = new THREE.Mesh(liquidGeo, goldSerumMat);
  bottleGroup.add(liquidMesh);

  // --- 3. Classic Beige & Gold Label Band ---
  const labelGeo = new THREE.CylinderGeometry(0.868, 0.868, 1.02, 64, 1, true);
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.y = -0.32;
  bottleGroup.add(labelMesh);

  // Thin gold trim rings around label
  const trimGeo = new THREE.TorusGeometry(0.87, 0.012, 16, 64);
  const trimTop = new THREE.Mesh(trimGeo, brushedGoldMat);
  trimTop.rotation.x = Math.PI / 2;
  trimTop.position.y = 0.19;
  bottleGroup.add(trimTop);

  const trimBottom = new THREE.Mesh(trimGeo, brushedGoldMat);
  trimBottom.rotation.x = Math.PI / 2;
  trimBottom.position.y = -0.83;
  bottleGroup.add(trimBottom);

  // --- 4. Brushed Gold Collar & Ribbed Accent ---
  const collarGeo = new THREE.CylinderGeometry(0.39, 0.4, 0.34, 48);
  const collarMesh = new THREE.Mesh(collarGeo, brushedGoldMat);
  collarMesh.position.y = 1.15;
  bottleGroup.add(collarMesh);

  const collarRingGeo = new THREE.TorusGeometry(0.405, 0.018, 16, 48);
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(collarRingGeo, brushedGoldMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1.04 + i * 0.11;
    bottleGroup.add(ring);
  }

  // --- 5. Espresso Dropper Bulb ---
  const bulbProfile = [
    new THREE.Vector2(0.0, 1.98),
    new THREE.Vector2(0.14, 1.96),
    new THREE.Vector2(0.24, 1.82),
    new THREE.Vector2(0.26, 1.56),
    new THREE.Vector2(0.27, 1.31),
    new THREE.Vector2(0.0, 1.31)
  ];
  const bulbGeo = new THREE.LatheGeometry(bulbProfile, 48);
  const bulbMesh = new THREE.Mesh(bulbGeo, espressoCapMat);
  bottleGroup.add(bulbMesh);

  // --- 6. Sculptural Golden Halo Ring (Klimt-inspired orbit) ---
  const haloGeo = new THREE.TorusGeometry(1.55, 0.014, 24, 100);
  const haloMesh = new THREE.Mesh(haloGeo, brushedGoldMat);
  haloMesh.rotation.x = Math.PI * 0.36;
  haloMesh.rotation.y = Math.PI * 0.15;
  bottleGroup.add(haloMesh);

  // --- 7. Floating Golden Micro-Droplets ---
  const droplets = [];
  const dropletGeo = new THREE.SphereGeometry(1, 24, 24);
  for (let i = 0; i < 16; i++) {
    const radius = 0.03 + Math.random() * 0.055;
    const drop = new THREE.Mesh(dropletGeo, i % 3 === 0 ? goldSerumMat : brushedGoldMat);
    drop.scale.setScalar(radius);
    const angle = (i / 16) * Math.PI * 2;
    const dist = 1.25 + Math.random() * 0.85;
    const y = (Math.random() - 0.5) * 2.6;
    drop.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
    drop.userData = {
      baseY: y,
      speed: 0.7 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      orbitRadius: dist,
      angle
    };
    bottleGroup.add(drop);
    droplets.push(drop);
  }

  // Responsive positioning helper
  const isMobile = () => window.innerWidth < 900;

  // Initial state (Hero: right side, subtle elegance)
  const state = {
    x: isMobile() ? 0 : 2.15,
    y: isMobile() ? -0.35 : -0.15,
    z: isMobile() ? -1.4 : 0,
    rotX: 0.12,
    rotY: -0.45,
    rotZ: -0.14,
    scale: isMobile() ? 0.65 : 0.92
  };

  masterGroup.position.set(state.x, state.y, state.z);
  bottleGroup.rotation.set(state.rotX, state.rotY, state.rotZ);
  masterGroup.scale.setScalar(state.scale);

  // Scroll-driven timeline (Klimt Wine style choreography)
  if (gsap && ScrollTrigger) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.4
      }
    });

    const m = isMobile();

    // 1 -> Section 2 (Prioridade): glides left, turns smoothly
    tl.to(state, {
      x: m ? 0 : -2.25,
      y: m ? 0.1 : 0.05,
      z: m ? -1.8 : 0.3,
      rotX: -0.08,
      rotY: 1.45,
      rotZ: 0.16,
      scale: m ? 0.62 : 1.0,
      duration: 1.2,
      ease: 'power2.inOut'
    })
    // 2 -> Section 3 (Versões / Tratamentos): sweeps right & tilts dynamically
    .to(state, {
      x: m ? 0 : 2.35,
      y: m ? -0.2 : 0.18,
      z: m ? -2.0 : -0.2,
      rotX: 0.22,
      rotY: 3.15,
      rotZ: -0.22,
      scale: m ? 0.58 : 0.88,
      duration: 1.4,
      ease: 'power2.inOut'
    })
    // 3 -> Section 4 (Não é vaidade - dark section): dramatic center-right spin
    .to(state, {
      x: m ? 0 : 2.1,
      y: m ? 0.1 : -0.1,
      z: m ? -1.8 : 0.5,
      rotX: -0.15,
      rotY: 5.1,
      rotZ: 0.12,
      scale: m ? 0.64 : 1.04,
      duration: 1.3,
      ease: 'power2.inOut'
    })
    // 4 -> Section 5 (Autocuidado começa aqui): serene left float
    .to(state, {
      x: m ? 0 : -2.15,
      y: m ? 0 : 0.0,
      z: m ? -1.8 : 0.2,
      rotX: 0.1,
      rotY: 6.4,
      rotZ: -0.12,
      scale: m ? 0.6 : 0.94,
      duration: 1.2,
      ease: 'power2.inOut'
    })
    // 5 -> Section 6 & 7 (Avaliação & Final CTA): settles right beside CTA
    .to(state, {
      x: m ? 0 : 2.0,
      y: m ? -0.3 : -0.08,
      z: m ? -2.0 : 0.4,
      rotX: 0.06,
      rotY: 7.85,
      rotZ: -0.08,
      scale: m ? 0.58 : 0.96,
      duration: 1.3,
      ease: 'power2.inOut'
    });
  }

  // Pointer parallax
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    pointer.x += (pointer.targetX - pointer.x) * 0.05;
    pointer.y += (pointer.targetY - pointer.y) * 0.05;

    // Gentle levitation
    const floatY = Math.sin(t * 1.15) * 0.09;
    masterGroup.position.set(
      state.x + pointer.x * 0.18,
      state.y + floatY - pointer.y * 0.12,
      state.z
    );
    masterGroup.scale.setScalar(state.scale);

    bottleGroup.rotation.set(
      state.rotX + pointer.y * 0.18,
      state.rotY + pointer.x * 0.28 + t * 0.12,
      state.rotZ
    );

    // Independent halo & droplets motion
    haloMesh.rotation.z = t * 0.25;
    droplets.forEach((drop) => {
      const d = drop.userData;
      drop.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.14;
      const a = d.angle + t * 0.15;
      drop.position.x = Math.cos(a) * d.orbitRadius;
      drop.position.z = Math.sin(a) * d.orbitRadius;
    });

    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, masterGroup, bottleGroup };
}
