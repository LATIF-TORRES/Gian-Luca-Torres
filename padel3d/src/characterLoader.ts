import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { CharacterDef } from './characters';

const loader = new GLTFLoader();
const cache = new Map<string, Promise<GLTF>>();

function loadGltf(path: string): Promise<GLTF> {
  if (!cache.has(path)) {
    cache.set(path, loader.loadAsync(path));
  }
  return cache.get(path)!;
}

export interface LoadedCharacter {
  object: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  play: (clip: string, opts?: { loop?: boolean; fadeIn?: number }) => void;
}

export async function loadCharacter(def: CharacterDef): Promise<LoadedCharacter> {
  const gltf = await loadGltf(def.model);
  const object = cloneSkinned(gltf.scene) as THREE.Object3D;

  // Normalize wildly different native model scales (some of these free assets are
  // authored in centimeters, others in meters) to a consistent real-world height, and
  // ground the model so its feet sit on y=0 regardless of where its pivot originally was.
  // A freshly cloned object's matrices aren't computed yet, so Box3 would read stale
  // identity transforms without this explicit update.
  object.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(object);
  const rawHeight = rawBox.max.y - rawBox.min.y;
  const scaleFactor = rawHeight > 0 ? def.targetHeight / rawHeight : 1;
  object.scale.setScalar(scaleFactor);
  object.position.y = -rawBox.min.y * scaleFactor;
  object.rotation.y = def.faceOffset;
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const mixer = new THREE.AnimationMixer(object);
  const actions = new Map<string, THREE.AnimationAction>();
  for (const clip of gltf.animations) {
    actions.set(clip.name, mixer.clipAction(clip));
  }

  let current: THREE.AnimationAction | null = null;
  function play(clipName: string, opts: { loop?: boolean; fadeIn?: number } = {}) {
    const action = actions.get(clipName);
    if (!action) return;
    if (current === action) return;
    action.reset();
    action.setLoop(opts.loop === false ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = opts.loop === false;
    action.fadeIn(opts.fadeIn ?? 0.2);
    action.play();
    if (current) current.fadeOut(0.2);
    current = action;
  }

  return { object, mixer, actions, play };
}
