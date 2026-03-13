import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type ScrollPoseState = {
    activeIndex: number; // current section index
    between: number; // 0..1 towards next section
    sectionId: string; // debug
};

type Pose = {
    // camera
    camPos: THREE.Vector3;
    camFov: number;

    // model group
    groupPos: THREE.Vector3;
    groupRot: THREE.Euler;

    // split intensity (0..1)
    split: number;

    // ✅ base clone offset per pose (x/y/z)
    baseOffset: THREE.Vector3;

    // ✅ NEW: per-pose color (hex/css)
    color: string;
};

type Hero3DModelProps = {
    poseRef: React.RefObject<ScrollPoseState>;

    modelUrl?: string;
    rootName?: string;
    partNames?: [string, string, string, string];
};

const TARGET_SIZE = 6;

function makePremiumHoloMat() {
    return new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
        premultipliedAlpha: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 1 },
            uColor: { value: new THREE.Color("#ff1f2d") },
            uRim: { value: 2 },
            uRimPow: { value: 2.4 },
            uOpacity: { value: 0.7 },
            uGlitchAmt: { value: 1 },
            uSliceCount: { value: 5 },
            uSliceSpeed: { value: 2.2 },
            uSliceWidth: { value: 0.05 },
            uLineDensity: { value: 20 },
            uLineSpeed: { value: 0.85 },
            uLineStrength: { value: 50 },
            uLineThin: { value: 0.1 },
            uDiagStrength: { value: 1 },
            uDiagDensity: { value: 70.0 },
        },
        vertexShader: `
      varying vec3 vWPos;
      varying vec3 vWNormal;
      varying vec3 vObjPos;
      varying float vSliceMask;
      varying float vFlicker;
      uniform float uTime;
      uniform float uGlitchAmt;
      uniform float uSliceCount;
      uniform float uSliceSpeed;
      uniform float uSliceWidth;
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      void main() {
        vec3 pos = position;
        vObjPos = pos;
        vec4 world0 = modelMatrix * vec4(pos, 1.0);
        float band = floor((world0.y + uTime * uSliceSpeed) * uSliceCount);
        float rnd = hash(band);
        float bandPhase = fract((world0.y + uTime * uSliceSpeed) * uSliceCount);
        float sliceMask =
          smoothstep(0.0, uSliceWidth, bandPhase) *
          (1.0 - smoothstep(1.0 - uSliceWidth, 1.0, bandPhase));
        float on = step(0.78, rnd);
        vSliceMask = sliceMask * on;
        float dx = (hash(band + 10.0) - 0.5) * 0.18 * uGlitchAmt;
        float dz = (hash(band + 20.0) - 0.5) * 0.10 * uGlitchAmt;
        pos.x += dx * vSliceMask;
        pos.z += dz * vSliceMask;
        float jitterOn = step(0.985, hash2(vec2(uTime * 2.0, world0.y * 3.0)));
        pos += normal * (jitterOn * 0.01 * uGlitchAmt);
        vFlicker = 0.7 + 0.3 * sin(uTime * 55.0 + band * 3.0);
        vec4 world = modelMatrix * vec4(pos, 1.0);
        vWPos = world.xyz;
        vWNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
        fragmentShader: `
      varying vec3 vWPos;
      varying vec3 vWNormal;
      varying vec3 vObjPos;
      varying float vSliceMask;
      varying float vFlicker;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uRim;
      uniform float uRimPow;
      uniform float uOpacity;
      uniform float uLineDensity;
      uniform float uLineSpeed;
      uniform float uLineStrength;
      uniform float uLineThin;
      uniform float uDiagStrength;
      uniform float uDiagDensity;
      float noise(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float lineBand(float x, float thin) { float d = abs(x - 0.5); return smoothstep(thin, 0.0, d); }
      void main() {
        vec3 V = normalize(cameraPosition - vWPos);
        float rim = pow(1.0 - max(dot(V, normalize(vWNormal)), 0.0), uRimPow) * uRim;
        float n = noise(vWPos.xz * 4.0 + uTime * 0.2);
        float core = 0.35 + 0.25 * n;
        float sliceGlow = vSliceMask * (0.1 + 0.6 * vFlicker);
        float y = vObjPos.y * uLineDensity + uTime * uLineSpeed;
        float f = fract(y);
        float ln = pow(lineBand(f, uLineThin), 2.2);
        float burst = step(0.992, noise(vec2(floor(y), uTime * 0.7)));
        float lineGlow = ln * (0.55 + 0.85 * burst);
        float d = (vObjPos.x + vObjPos.y * 0.7) * uDiagDensity + uTime * (uLineSpeed * 0.65);
        float df = fract(d);
        float dln = pow(lineBand(df, uLineThin * 1.15), 2.0);
        float diagGlow = dln * uDiagStrength * (0.65 + 0.35 * noise(vWPos.xz * 2.0 + uTime));
        float intensity = core + rim + sliceGlow * 1.2 + lineGlow * uLineStrength + diagGlow;
        vec3 col = uColor * intensity;
        float a = uOpacity * (0.25 + rim * 0.9 + sliceGlow + lineGlow * 0.75 + diagGlow * 0.5);
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }
    `,
    });
}

function damp(current: number, target: number, lambda: number, dt: number) {
    return THREE.MathUtils.damp(current, target, lambda, dt);
}
function smoothstep01(x: number) {
    const t = THREE.MathUtils.clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
}

type Parts = {
    p1: THREE.Object3D | null;
    p2: THREE.Object3D | null;
    p3: THREE.Object3D | null;
    p4: THREE.Object3D | null;
};

function findRootAndParts(
    scene: THREE.Object3D,
    rootName: string,
    partNames: [string, string, string, string]
) {
    const root = (scene.getObjectByName(rootName) as THREE.Object3D | null) ?? scene;
    const [p1, p2, p3, p4] = partNames.map((n) => root.getObjectByName(n) as THREE.Object3D | null);
    return { root, parts: { p1, p2, p3, p4 } as Parts };
}

function applyMaterial(root: THREE.Object3D, mat: THREE.Material) {
    root.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if ((mesh as any).isMesh) {
            mesh.frustumCulled = false;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            mesh.material = mat;
        }
    });
}

const Hero3DModel: React.FC<Hero3DModelProps> = ({
    poseRef,
    modelUrl = "X.glb",
    rootName = "ROOT_X",
    partNames = ["Part_1", "Part_2", "Part_3", "Part_4"],
}) => {
    const group = useRef<THREE.Group>(null);

    // ✅ base clone transform lives on this group (updates every frame)
    const baseCloneGroup = useRef<THREE.Group>(null);

    const fittedScale = useRef(1);

    const baseOffsetRef = useRef(new THREE.Vector3(0, 0.05, 0.05));
    const baseOffsetTmp = useRef(new THREE.Vector3());

    // ✅ NEW: temp colors to avoid allocations
    const cA = useRef(new THREE.Color());
    const cB = useRef(new THREE.Color());
    const cOut = useRef(new THREE.Color());

    const { scene: gltfScene } = useGLTF(modelUrl);
    const baseScene = useMemo(() => gltfScene.clone(true), [gltfScene]);
    const holoScene = useMemo(() => gltfScene.clone(true), [gltfScene]);

    const base = useMemo(() => findRootAndParts(baseScene, rootName, partNames), [baseScene, rootName, partNames]);
    const holo = useMemo(() => findRootAndParts(holoScene, rootName, partNames), [holoScene, rootName, partNames]);

    const { camera } = useThree();

    const baseMat = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: new THREE.Color("#070000"),
                emissive: new THREE.Color("#ff1a2b"),
                emissiveIntensity: 0.0,
                metalness: 0,
                roughness: 0,
                transparent: true,
                opacity: 0.3,
                depthWrite: true,
            }),
        []
    );

    const holoMat = useMemo(() => makePremiumHoloMat(), []);

    const p1Pos = useRef(new THREE.Vector3());
    const p2Pos = useRef(new THREE.Vector3());
    const p3Pos = useRef(new THREE.Vector3());
    const p4Pos = useRef(new THREE.Vector3());

    const vCam = useRef(new THREE.Vector3());
    const vGroup = useRef(new THREE.Vector3());

    const POSES: Pose[] = useMemo(
        () => [
            {
                camPos: new THREE.Vector3(0, 0.2, 12.0),
                camFov: 40,
                groupPos: new THREE.Vector3(0, 0, 0),
                groupRot: new THREE.Euler(Math.PI / 2, 0, 0),
                split: 0.0,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ff1f2d",
            },
            {
                camPos: new THREE.Vector3(0.25, 0.3, 9.2),
                camFov: 30,
                groupPos: new THREE.Vector3(0.0, 0.02, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 3, 0.15, 0.0),
                split: 1,
                baseOffset: new THREE.Vector3(0.0, -0.05, 0.05),
                color: "#22d3ee",
            },
            {
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.02, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 0.0),
                split: 0.3,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ee6322",
            },
            {
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.05, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 3.0),
                split: 0.5,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#2291c5",
            },
            {
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.02, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 0.0),
                split: 0.3,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#2258ee",
            },
            {
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.05, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 3.0),
                split: 0.5,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#22c55e",
            },

            {
                camPos: new THREE.Vector3(0.0, 0.35, 10.5),
                camFov: 55,
                groupPos: new THREE.Vector3(0.0, 0.0, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2, 0.0, 0.0),
                split: 0.0,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ff1f2d",
            }

        ],
        []
    );

    useEffect(() => {
        if (!group.current) return;

        const box = new THREE.Box3().setFromObject(holo.root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        base.root.position.sub(center);
        holo.root.position.sub(center);

        const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z);
        fittedScale.current = scale;
        group.current.scale.setScalar(scale);

        applyMaterial(base.root, baseMat);
        applyMaterial(holo.root, holoMat);

        camera.position.copy(POSES[0].camPos);
        camera.lookAt(0, 0, 0);

        baseOffsetRef.current.copy(POSES[0].baseOffset);
        baseCloneGroup.current?.position.copy(baseOffsetRef.current);

        // ✅ init color to pose 0
        (holoMat as THREE.ShaderMaterial).uniforms.uColor.value.set(POSES[0].color);
        baseMat.emissive.set(POSES[0].color);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFrame((state, dt) => {
        if (!group.current) return;

        const t = state.clock.getElapsedTime();
        (holoMat as THREE.ShaderMaterial).uniforms.uTime.value += dt;

        const idx = poseRef.current?.activeIndex ?? 0;
        const between = smoothstep01(poseRef.current?.between ?? 0);

        const a = POSES[Math.min(idx, POSES.length - 1)];
        const b = POSES[Math.min(idx + 1, POSES.length - 1)];

        // ✅ per-pose color (lerp)
        cA.current.set(a.color);
        cB.current.set(b.color);
        cOut.current.copy(cA.current).lerp(cB.current, between);
        (holoMat as THREE.ShaderMaterial).uniforms.uColor.value.copy(cOut.current);
        baseMat.emissive.copy(cOut.current);

        // camera
        vCam.current.copy(a.camPos).lerp(b.camPos, between);
        state.camera.position.x = damp(state.camera.position.x, vCam.current.x, 6, dt);
        state.camera.position.y = damp(state.camera.position.y, vCam.current.y, 6, dt);
        state.camera.position.z = damp(state.camera.position.z, vCam.current.z, 6, dt);

        if ((state.camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const cam = state.camera as THREE.PerspectiveCamera;
            const targetFov = THREE.MathUtils.lerp(a.camFov, b.camFov, between);
            cam.fov = damp(cam.fov, targetFov, 6, dt);
            cam.updateProjectionMatrix();
        }
        state.camera.lookAt(0, 0, 0);

        // group pos
        vGroup.current.copy(a.groupPos).lerp(b.groupPos, between);
        const floatX = Math.sin(t * 0.18) * 0.04;
        const floatY = Math.sin(t * 0.24) * 0.03;
        const floatZ = Math.sin(t * 0.14) * 0.02;

        group.current.position.set(
            damp(group.current.position.x, vGroup.current.x + floatX, 8, dt),
            damp(group.current.position.y, vGroup.current.y + floatY, 8, dt),
            damp(group.current.position.z, vGroup.current.z + floatZ, 8, dt)
        );

        // group rot
        let rx = THREE.MathUtils.lerp(a.groupRot.x, b.groupRot.x, between);
        let ry = THREE.MathUtils.lerp(a.groupRot.y, b.groupRot.y, between);
        let rz = THREE.MathUtils.lerp(a.groupRot.z, b.groupRot.z, between);

        if (idx === 0) {
            const heroW = 1 - between;
            rx += Math.sin(t * 0.85) * 0.06 * heroW;
            ry += Math.sin(t * 0.60 + 1.3) * 0.10 * heroW;
            rz += Math.sin(t * 0.75 + 2.1) * 0.30 * heroW;
        }

        group.current.rotation.x = damp(group.current.rotation.x, rx, 8, dt);
        group.current.rotation.y = damp(group.current.rotation.y, ry, 8, dt);
        group.current.rotation.z = damp(group.current.rotation.z, rz, 8, dt);

        // base clone offset
        baseOffsetTmp.current.copy(a.baseOffset).lerp(b.baseOffset, between);
        const boAlpha = 1 - Math.exp(-dt * 10);
        baseOffsetRef.current.lerp(baseOffsetTmp.current, boAlpha);

        if (baseCloneGroup.current) {
            baseCloneGroup.current.position.copy(baseOffsetRef.current);
        }

        // split
        const split = THREE.MathUtils.lerp(a.split, b.split, between);
        const maxExplode = 1.45;
        const zLift = 0.22;
        const e = split * maxExplode;

        const p1T = new THREE.Vector3(-e, +e, +split * zLift);
        const p2T = new THREE.Vector3(+e, +e, -split * zLift);
        const p3T = new THREE.Vector3(+e, -e, +split * zLift);
        const p4T = new THREE.Vector3(-e, -e, -split * zLift);

        const alpha = 1 - Math.exp(-dt * 10);
        p1Pos.current.lerp(p1T, alpha);
        p2Pos.current.lerp(p2T, alpha);
        p3Pos.current.lerp(p3T, alpha);
        p4Pos.current.lerp(p4T, alpha);

        const applyParts = (parts: Parts) => {
            parts.p1?.position.copy(p1Pos.current);
            parts.p2?.position.copy(p2Pos.current);
            parts.p3?.position.copy(p3Pos.current);
            parts.p4?.position.copy(p4Pos.current);

            const rotAmt = split * 0.28;
            parts.p1?.rotation.set(0, 0, +rotAmt);
            parts.p2?.rotation.set(0, 0, -rotAmt);
            parts.p3?.rotation.set(0, 0, +rotAmt * 0.6);
            parts.p4?.rotation.set(0, 0, -rotAmt * 0.6);
        };

        applyParts(base.parts);
        applyParts(holo.parts);

        // breathe
        const breathe = 1 + Math.sin(t * 0.38) * 0.01;
        group.current.scale.setScalar(fittedScale.current * breathe);

        // disable vertex deformation during transitions
        const TRANSITION_DEADZONE = 0.04;
        const stable = between <= TRANSITION_DEADZONE || between >= 1 - TRANSITION_DEADZONE;
        (holoMat as THREE.ShaderMaterial).uniforms.uGlitchAmt.value = stable ? 1 : 0;
    });

    return (
        <group ref={group} rotation={[Math.PI / 2, 0, 0]}>
            <group ref={baseCloneGroup}>
                <primitive object={baseScene} />
            </group>

            <primitive object={holoScene} />
        </group>
    );
};

export default Hero3DModel;

/*


                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.02, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 0.0),
                split: 0.3,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ee6322",
            },
            {
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.05, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 3.0),
                split: 0.5,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#22c55e",
            },
            {
                camPos: new THREE.Vector3(0.0, 0.35, 10.5),
                camFov: 55,
                groupPos: new THREE.Vector3(0.0, 0.0, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2, 0.0, 0.0),
                split: 0.0,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ff1f2d",
            }, 
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.02, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 0.0),
                split: 0.3,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ee6322",
            },
            {
                camPos: new THREE.Vector3(-0.25, 0.28, 8.0),
                camFov: 42,
                groupPos: new THREE.Vector3(0.0, -0.05, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2 + 0.18, -0.1, 3.0),
                split: 0.5,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#22c55e",
            },
            {
                camPos: new THREE.Vector3(0.0, 0.35, 10.5),
                camFov: 55,
                groupPos: new THREE.Vector3(0.0, 0.0, 0.0),
                groupRot: new THREE.Euler(Math.PI / 2, 0.0, 0.0),
                split: 0.0,
                baseOffset: new THREE.Vector3(0, 0.05, 0.05),
                color: "#ff1f2d",
            }
            */
