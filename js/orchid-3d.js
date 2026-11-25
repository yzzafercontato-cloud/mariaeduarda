import * as THREE from 'https://esm.sh/three@0.170.0';
import { RoomEnvironment } from 'https://esm.sh/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';

/**
 * Creates a curved 3D orchid petal mesh using a parametric Shape + vertex bending.
 */
function createCurvedPetal(width, length, cupDepth, bendBack, material, segments = 18) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.55, length * 0.18, width * 0.95, length * 0.58, 0, length);
  shape.bezierCurveTo(-width * 0.95, length * 0.58, -width * 0.55, length * 0.18, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, segments);
  const pos = geo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = Math.min(Math.max(y / length, 0), 1);
    const xNorm = width > 0 ? x / width : 0;

    // Natural cupping + graceful backward arch at tip
    const cup = (xNorm * xNorm) * cupDepth * Math.sin(t * Math.PI);
    const arch = -Math.pow(t, 1.8) * bendBack;
    pos.setZ(i, cup + arch);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

/**
 * Builds a single Phalaenopsis Orchid blossom in Beige, Brown & Gold.
 */
function buildOrchidBlossom(scale = 1) {
  const flower = new THREE.Group();

  // Velvety classic beige-ivory petal material
  const petalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf6ede0),
    roughness: 0.36,
    metalness: 0.04,
    sheen: 1.0,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color(0xe2c896),
    clearcoat: 0.15,
    side: THREE.DoubleSide
  });

  // Soft warm gold-tinted sepal material
  const sepalMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xefe2cf),
    roughness: 0.4,
    metalness: 0.06,
    sheen: 0.9,
    sheenColor: new THREE.Color(0xc8a46b),
    side: THREE.DoubleSide
  });

  // Espresso brown + gold labellum (center lip)
  const lipMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x5c3622),
    roughness: 0.32,
    metalness: 0.15,
    sheen: 1.0,
    sheenColor: new THREE.Color(0xd8b982),
    side: THREE.DoubleSide
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4b270),
    metalness: 0.92,
    roughness: 0.18,
    emissive: new THREE.Color(0x3a2609),
    emissiveIntensity: 0.25
  });

  // 1. Dorsal Sepal (top)
  const dorsal = createCurvedPetal(0.46, 1.05, 0.16, 0.22, sepalMat);
  dorsal.rotation.z = 0;
  dorsal.rotation.x = -0.14;
  flower.add(dorsal);

  // 2. Two Lateral Sepals (bottom-left & bottom-right)
  const latSepalL = createCurvedPetal(0.42, 0.98, 0.15, 0.2, sepalMat);
  latSepalL.rotation.z = Math.PI * 0.78;
  latSepalL.rotation.x = -0.1;
  flower.add(latSepalL);

  const latSepalR = createCurvedPetal(0.42, 0.98, 0.15, 0.2, sepalMat);
  latSepalR.rotation.z = -Math.PI * 0.78;
  latSepalR.rotation.x = -0.1;
  flower.add(latSepalR);

  // 3. Two Broad Butterfly Lateral Petals (left & right)
  const petalL = createCurvedPetal(0.78, 1.15, 0.24, 0.16, petalMat);
  petalL.rotation.z = Math.PI * 0.44;
  petalL.position.z = 0.04;
  flower.add(petalL);

  const petalR = createCurvedPetal(0.78, 1.15, 0.24, 0.16, petalMat);
  petalR.rotation.z = -Math.PI * 0.44;
  petalR.position.z = 0.04;
  flower.add(petalR);

  // 4. Sculpted Labellum (Center Lip)
  const lipCenter = createCurvedPetal(0.28, 0.52, -0.22, -0.18, lipMat);
  lipCenter.rotation.z = Math.PI;
  lipCenter.position.set(0, -0.05, 0.12);
  flower.add(lipCenter);

  const lipWingL = createCurvedPetal(0.18, 0.34, 0.12, 0.05, goldMat);
  lipWingL.rotation.z = Math.PI * 0.65;
  lipWingL.rotation.y = 0.35;
  lipWingL.position.set(-0.08, -0.06, 0.16);
  flower.add(lipWingL);

  const lipWingR = createCurvedPetal(0.18, 0.34, 0.12, 0.05, goldMat);
  lipWingR.rotation.z = -Math.PI * 0.65;
  lipWingR.rotation.y = -0.35;
  lipWingR.position.set(0.08, -0.06, 0.16);
  flower.add(lipWingR);

  // 5. Golden Column / Pearl Center
  const columnGeo = new THREE.SphereGeometry(0.11, 24, 24);
  const column = new THREE.Mesh(columnGeo, goldMat);
  column.scale.set(1, 1.25, 0.9);
  column.position.set(0, 0.04, 0.16);
  flower.add(column);

  flower.scale.setScalar(scale);
  return flower;
}

/**
 * 3D Sculpted Orchid ("Orquídea Imperial")
 * Scroll-choreographed WebGL element inspired by Klimt Wine.
 */
export function initOrchid3D(gsap, ScrollTrigger) {
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
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.75;

  const camera = new THREE.PerspectiveCamera(
    36,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.15, 8.8);

  // Warm Studio Lighting
  scene.add(new THREE.AmbientLight(0xf5efe6, 0.75));

  const keyLight = new THREE.DirectionalLight(0xfff0d6, 2.1);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc8a46b, 2.4);
  rimLight.position.set(-5, 2, -4);
  scene.add(rimLight);

  const warmFill = new THREE.PointLight(0xd8b982, 1.4, 12);
  warmFill.position.set(0, -2.5, 3);
  scene.add(warmFill);

  const masterGroup = new THREE.Group();
  const orchidGroup = new THREE.Group();
  masterGroup.add(orchidGroup);
  scene.add(masterGroup);

  // --- Curved Bronze-Brown Stem ---
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, -1.9, -0.35),
    new THREE.Vector3(-0.15, -0.8, -0.2),
    new THREE.Vector3(0.05, 0.15, -0.08),
    new THREE.Vector3(0.35, 1.05, 0.05),
    new THREE.Vector3(0.65, 1.65, -0.05)
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 40, 0.036, 12, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x4a3326),
    roughness: 0.55,
    metalness: 0.12
  });
  orchidGroup.add(new THREE.Mesh(stemGeo, stemMat));

  // --- Primary Orchid Blossom ---
  const mainBlossom = buildOrchidBlossom(1.05);
  mainBlossom.position.set(0.02, 0.15, 0.06);
  mainBlossom.rotation.set(0.08, -0.15, 0.08);
  orchidGroup.add(mainBlossom);

  // --- Secondary Upper Blossom ---
  const upperBlossom = buildOrchidBlossom(0.68);
  upperBlossom.position.set(0.42, 1.12, 0.12);
  upperBlossom.rotation.set(-0.12, 0.35, -0.22);
  orchidGroup.add(upperBlossom);

  // --- Golden Bud at Tip ---
  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4b270),
    metalness: 0.9,
    roughness: 0.2
  });
  const budGeo = new THREE.SphereGeometry(0.11, 20, 20);
  const bud = new THREE.Mesh(budGeo, goldMat);
  bud.scale.set(0.85, 1.35, 0.85);
  bud.position.set(0.66, 1.68, -0.04);
  orchidGroup.add(bud);

  // --- Klimt-Inspired Thin Golden Halo Ring ---
  const haloGeo = new THREE.TorusGeometry(1.65, 0.012, 20, 100);
  const haloMesh = new THREE.Mesh(haloGeo, goldMat);
  haloMesh.rotation.x = Math.PI * 0.38;
  haloMesh.rotation.y = Math.PI * 0.14;
  orchidGroup.add(haloMesh);

  // --- Floating Golden Pollen Particles ---
  const particles = [];
  const particleGeo = new THREE.SphereGeometry(1, 16, 16);
  for (let i = 0; i < 18; i++) {
    const p = new THREE.Mesh(particleGeo, goldMat);
    const size = 0.02 + Math.random() * 0.04;
    p.scale.setScalar(size);
    const angle = (i / 18) * Math.PI * 2;
    const dist = 1.2 + Math.random() * 0.95;
    const y = (Math.random() - 0.5) * 2.8;
    p.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
    p.userData = {
      baseY: y,
      speed: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      orbitRadius: dist,
      angle
    };
    orchidGroup.add(p);
    particles.push(p);
  }

  const isMobile = () => window.innerWidth < 1024;

  // Initial Hero state: compact, strictly in outer bottom-left corner
  const state = {
    x: isMobile() ? -1.75 : -4.65,
    y: isMobile() ? -1.8 : -1.75,
    z: isMobile() ? -3.0 : -1.0,
    rotX: 0.16,
    rotY: 0.35,
    rotZ: 0.06,
    scale: isMobile() ? 0.22 : 0.3
  };

  masterGroup.position.set(state.x, state.y, state.z);
  orchidGroup.rotation.set(state.rotX, state.rotY, state.rotZ);
  masterGroup.scale.setScalar(state.scale);

  // Scroll-Choreographed Timeline (pinned to outer corners so it NEVER touches text or buttons)
  if (gsap && ScrollTrigger) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#smooth-content',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.45
      }
    });

    const m = isMobile();

    // Section 2 (Prioridade): dedicated left stage (0 overlap with right text)
    tl.to(state, {
      x: m ? -1.6 : -2.35,
      y: m ? 1.3 : 0.05,
      z: m ? -2.8 : 0.25,
      rotX: -0.05,
      rotY: 0.95,
      rotZ: 0.12,
      scale: m ? 0.24 : 0.78,
      duration: 1.2,
      ease: 'power2.inOut'
    })
    // Section 3 (Tratamentos): far top-left corner (clear of centered headline & 2x2 photo grid)
    .to(state, {
      x: m ? -1.75 : -4.75,
      y: m ? 1.4 : 1.5,
      z: m ? -3.0 : -0.8,
      rotX: 0.16,
      rotY: 2.65,
      rotZ: -0.14,
      scale: m ? 0.22 : 0.3,
      duration: 1.4,
      ease: 'power2.inOut'
    })
    // Section 4 (Não é vaidade): bottom-left outer corner (below portrait, clear of right cards)
    .to(state, {
      x: m ? -1.75 : -4.7,
      y: m ? -1.55 : -1.55,
      z: m ? -3.0 : -0.8,
      rotX: -0.1,
      rotY: 4.35,
      rotZ: 0.1,
      scale: m ? 0.22 : 0.3,
      duration: 1.3,
      ease: 'power2.inOut'
    })
    // Section 5 (Autocuidado): dedicated right stage (0 overlap with left text)
    .to(state, {
      x: m ? 1.6 : 2.35,
      y: m ? 1.3 : 0.05,
      z: m ? -2.8 : 0.25,
      rotX: 0.08,
      rotY: 5.7,
      rotZ: -0.08,
      scale: m ? 0.24 : 0.78,
      duration: 1.2,
      ease: 'power2.inOut'
    })
    // Section 6 & Footer: bottom-left outer corner (clear of right CTA & footer)
    .to(state, {
      x: m ? -1.75 : -4.7,
      y: m ? -1.55 : -1.45,
      z: m ? -3.0 : -0.8,
      rotX: 0.05,
      rotY: 6.75,
      rotZ: -0.05,
      scale: m ? 0.22 : 0.3,
      duration: 1.3,
      ease: 'power2.inOut'
    });
  }

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    pointer.x += (pointer.targetX - pointer.x) * 0.05;
    pointer.y += (pointer.targetY - pointer.y) * 0.05;

    const floatY = Math.sin(t * 1.1) * 0.08;
    masterGroup.position.set(
      state.x + pointer.x * 0.16,
      state.y + floatY - pointer.y * 0.12,
      state.z
    );
    masterGroup.scale.setScalar(state.scale);

    orchidGroup.rotation.set(
      state.rotX + pointer.y * 0.18,
      state.rotY + pointer.x * 0.25 + Math.sin(t * 0.45) * 0.1,
      state.rotZ
    );

    haloMesh.rotation.z = t * 0.22;
    particles.forEach((p) => {
      const d = p.userData;
      p.position.y = d.baseY + Math.sin(t * d.speed + d.phase) * 0.15;
      const a = d.angle + t * 0.14;
      p.position.x = Math.cos(a) * d.orbitRadius;
      p.position.z = Math.sin(a) * d.orbitRadius;
    });

    renderer.render(scene, camera);
  }
  animate();
}
