export interface CharacterDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  model: string;
  /** Desired real-world height in scene units (meters) - the loader measures the raw
   * model's bounding box and scales/grounds it to match, since these free models come in
   * wildly different native scales (some in centimeters, some already in meters). */
  targetHeight: number;
  /** Extra Y rotation (radians) so the model faces +Z (toward the net) by default. */
  faceOffset: number;
  price: number;
  idleClip: string;
  hitClip: string;
}

// Free, rigged, animated CC0/permissive glTF models bundled with the three.js project's
// own examples (mrdoob/three.js, examples/models/gltf) - real characters with real
// skeletal animation, not placeholder art.
export const CHARACTERS: CharacterDef[] = [
  {
    id: 'horse',
    name: 'Ferdinand',
    description: 'Das schnelle Pferd — dein Starter-Charakter',
    emoji: '🐴',
    model: 'models/horse.glb',
    targetHeight: 1.8,
    faceOffset: Math.PI / 2,
    price: 0,
    idleClip: 'horse_A_',
    hitClip: 'horse_A_',
  },
  {
    id: 'parrot',
    name: 'Polly',
    description: 'Der flinke Papagei',
    emoji: '🦜',
    model: 'models/parrot.glb',
    targetHeight: 1.1,
    faceOffset: Math.PI / 2,
    price: 50,
    idleClip: 'parrot_A_',
    hitClip: 'parrot_A_',
  },
  {
    id: 'robot',
    name: 'RoboSmash',
    description: 'Präziser Roboter-Champion',
    emoji: '🤖',
    model: 'models/robot.glb',
    targetHeight: 1.7,
    faceOffset: 0,
    price: 100,
    idleClip: 'Idle',
    hitClip: 'Punch',
  },
  {
    id: 'soldier',
    name: 'Captain Serve',
    description: 'Der taktische Profi',
    emoji: '🎖️',
    model: 'models/soldier.glb',
    targetHeight: 1.8,
    faceOffset: Math.PI,
    price: 150,
    idleClip: 'Idle',
    hitClip: 'Run',
  },
];

export function getCharacter(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export const DEFAULT_CHARACTER_ID = CHARACTERS[0].id;
