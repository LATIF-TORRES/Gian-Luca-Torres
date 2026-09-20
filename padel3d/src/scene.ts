import * as THREE from 'three';

export interface PadelScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  playerSlot: THREE.Group;
  opponentSlot: THREE.Group;
  ball: THREE.Mesh;
  resize: () => void;
  render: () => void;
}

const COURT_LENGTH = 11;
const COURT_WIDTH = 6;
const WALL_HEIGHT = 3.2;

export function createPadelScene(canvas: HTMLCanvasElement): PadelScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060f20);
  scene.fog = new THREE.Fog(0x060f20, 14, 30);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 5.5, 10.5);
  camera.lookAt(0, 1.1, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  // Lighting: cool hall ambience + a warm key light, similar mood to the app's own theme.
  scene.add(new THREE.AmbientLight(0x8fa6d9, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(6, 10, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const rim = new THREE.PointLight(0xc6f135, 0.6, 20);
  rim.position.set(-4, 4, -4);
  scene.add(rim);

  // Floor - padel-court turquoise/green turf.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(COURT_WIDTH, COURT_LENGTH),
    new THREE.MeshStandardMaterial({ color: 0x1c6e5e, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Court line markings.
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  function addLine(width: number, depth: number, x: number, z: number) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(x, 0.01, z);
    scene.add(line);
  }
  addLine(COURT_WIDTH - 0.3, 0.08, 0, COURT_LENGTH / 2 - 0.2);
  addLine(COURT_WIDTH - 0.3, 0.08, 0, -(COURT_LENGTH / 2 - 0.2));
  addLine(0.08, COURT_LENGTH - 0.3, COURT_WIDTH / 2 - 0.2, 0);
  addLine(0.08, COURT_LENGTH - 0.3, -(COURT_WIDTH / 2 - 0.2), 0);

  // Net across the middle.
  const net = new THREE.Mesh(
    new THREE.BoxGeometry(COURT_WIDTH - 0.4, 0.9, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x0b1e3d, transparent: true, opacity: 0.85 })
  );
  net.position.set(0, 0.45, 0);
  scene.add(net);
  const netPostMat = new THREE.MeshStandardMaterial({ color: 0x2a3a5c });
  for (const x of [-(COURT_WIDTH / 2 - 0.3), COURT_WIDTH / 2 - 0.3]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1), netPostMat);
    post.position.set(x, 0.5, 0);
    scene.add(post);
  }

  // Glass-look enclosure walls, like a real padel court.
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x8fd3ff,
    transparent: true,
    opacity: 0.16,
    roughness: 0.1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  function addWall(width: number, height: number, x: number, z: number, rotY: number) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMat);
    wall.position.set(x, height / 2, z);
    wall.rotation.y = rotY;
    scene.add(wall);
  }
  addWall(COURT_WIDTH, WALL_HEIGHT, 0, -COURT_LENGTH / 2, 0);
  addWall(COURT_WIDTH, WALL_HEIGHT, 0, COURT_LENGTH / 2, Math.PI);
  addWall(COURT_LENGTH * 0.55, WALL_HEIGHT * 0.7, -COURT_WIDTH / 2, -COURT_LENGTH * 0.22, Math.PI / 2);
  addWall(COURT_LENGTH * 0.55, WALL_HEIGHT * 0.7, -COURT_WIDTH / 2, COURT_LENGTH * 0.22, Math.PI / 2);
  addWall(COURT_LENGTH * 0.55, WALL_HEIGHT * 0.7, COURT_WIDTH / 2, -COURT_LENGTH * 0.22, -Math.PI / 2);
  addWall(COURT_LENGTH * 0.55, WALL_HEIGHT * 0.7, COURT_WIDTH / 2, COURT_LENGTH * 0.22, -Math.PI / 2);

  const playerSlot = new THREE.Group();
  playerSlot.position.set(0, 0, COURT_LENGTH / 2 - 2.2);
  scene.add(playerSlot);

  const opponentSlot = new THREE.Group();
  opponentSlot.position.set(0, 0, -(COURT_LENGTH / 2 - 2.2));
  scene.add(opponentSlot);

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xc6f135, emissive: 0x2c3d0a, roughness: 0.4 })
  );
  ball.castShadow = true;
  ball.position.copy(playerSlot.position).setY(1);
  scene.add(ball);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function render() {
    renderer.render(scene, camera);
  }

  return { scene, camera, renderer, playerSlot, opponentSlot, ball, resize, render };
}
