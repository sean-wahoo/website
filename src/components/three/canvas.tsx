"use client";

import { useEffect, useRef } from "react";
import styles from "./canvas.module.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  ClearMaskPass,
  ClearPass,
  EffectComposer,
  ShaderPass,
  FilmShader,
  OrbitControls,
  OutputPass,
  RenderPass,
} from "three/examples/jsm/Addons.js";

interface CUSTOM_SCENE {
  sceneName: string;
  animations: {
    name: string;
    timeScale: number;
  }[];
  cameraSettings?: {
    additionalZoom?: number;
    target?: THREE.Vector3;
    [key: string]: any;
  };
  objects: {
    name: string;
    main?: boolean;
    color?: THREE.Color;
    customScene?: THREE.Scene;
  }[];
}
const PRO_SCENES: CUSTOM_SCENE[] = [
  {
    sceneName: "dood_at_desk",
    cameraSettings: {
      target: new THREE.Vector3(0.25, 1, 0.5),
    },
    animations: [
      {
        name: "GLTF_created_0",
        timeScale: 3,
      },
    ],
    objects: [
      {
        name: "desk_setup",
        color: new THREE.Color(0.1, 0.2, 0.5),
      },
      {
        name: "lil_dood",
        main: true,
        color: new THREE.Color(0, 0.5, 0.2),
        customScene: new THREE.Scene(),
      },
    ],
  },
  {
    sceneName: "dood_petting_cat",
    cameraSettings: {
      additionalZoom: -8,
    },
    animations: [
      {
        name: "human_animation",
        timeScale: 1,
      },
    ],
    objects: [
      {
        name: "human",
        main: true,
        color: new THREE.Color(0, 0.5, 0.2),
        customScene: new THREE.Scene(),
      },
      {
        name: "Sketchfab_model",
        color: new THREE.Color(0.9, 0.45, 0.17),
      },
    ],
  },
];

const Canvas: React.FC<{
  fileName: string;
  order: number;
  sceneName?: string;
}> = ({ fileName, sceneName, order }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loader = new GLTFLoader();
  const scene = new THREE.Scene();
  const filmPass = new ShaderPass(FilmShader);

  let sceneAdded = false;

  const CANVAS_ASPECT = 1;
  const CANVAS_W = 320;
  const CANVAS_H = CANVAS_ASPECT === 1 ? CANVAS_W : CANVAS_W / 2;

  let renderer: THREE.WebGLRenderer;

  let baseComposer: EffectComposer | undefined;

  useEffect(() => {
    const clock = new THREE.Clock();
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      !canvasRef.current
    ) {
      return;
    }

    const sceneToLoad = PRO_SCENES.find((s) => s.sceneName === sceneName);
    if (!sceneToLoad) return;

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvasRef.current,
      logarithmicDepthBuffer: true,
      stencil: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    renderer.setClearColor(0xe0e0e0, 0);

    const fov = 45,
      aspect = 1,
      near = 0.1,
      far = 12;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;
    camera.position.x = 6;
    camera.position.y = 4;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(camera);

    if (sceneToLoad.cameraSettings) {
      const c = sceneToLoad.cameraSettings;
      if (c.additionalZoom) {
        camera.position.x += c.additionalZoom;
      }
      if (c.target) {
        controls.target = c.target;
      }
    }

    const lightColor = 0xffffff;
    const lightIntensity = 3;
    const light = new THREE.DirectionalLight(lightColor, lightIntensity);
    light.position.set(-1, 2, 4);

    scene.add(light);
    renderer.setSize(CANVAS_W, CANVAS_H, true);

    let mixer: THREE.AnimationMixer | undefined;

    loader.load(`/models/${fileName}`, (gltf) => {
      const glbRoot = gltf.scene;

      const baseTarget = new THREE.WebGLRenderTarget(
        window.innerWidth,
        window.innerHeight,
        { stencilBuffer: true },
      );
      baseComposer = new EffectComposer(renderer, baseTarget);

      const renderPass = new RenderPass(scene, camera);
      renderPass.clear = false;

      const clearPass = new ClearPass();
      const clearMaskPass = new ClearMaskPass();
      baseComposer.addPass(clearPass);
      baseComposer.addPass(renderPass);
      baseComposer.addPass(filmPass);
      baseComposer.addPass(clearMaskPass);

      let animationScene = scene;

      for (let i = 0; i < sceneToLoad.objects.length; i++) {
        const objToLoad = sceneToLoad.objects[i];
        const foundObj = glbRoot.getObjectByName(objToLoad.name);
        if (!foundObj) continue;
        const maskMaterial = new THREE.MeshBasicMaterial({
          stencilWrite: true,
          stencilRef: 1,
          color: objToLoad.color,
          stencilFunc: THREE.AlwaysStencilFunc,
          stencilFail: THREE.ReplaceStencilOp,
          stencilZFail: THREE.ReplaceStencilOp,
          stencilZPass: THREE.ReplaceStencilOp,
        });
        foundObj.traverse((child) => {
          if ("material" in child) {
            child.material = maskMaterial;
          }
        });
      }
      const outputPass = new OutputPass();
      baseComposer.addPass(outputPass);

      if (!sceneAdded) {
        scene.add(gltf.scene);
        sceneAdded = true;
      }

      if (gltf.animations.length && sceneToLoad.animations.length) {
        mixer = new THREE.AnimationMixer(animationScene);
        for (const sceneAnimation of sceneToLoad.animations) {
          const gltfAnimation = gltf.animations.find(
            (a) => a.name === sceneAnimation.name,
          );
          if (!gltfAnimation) {
            continue;
          }
          const action = mixer.clipAction(gltfAnimation as THREE.AnimationClip);
          action.play();
          action.timeScale = sceneAnimation.timeScale;
        }
      }
    });

    function resetRendererSize(renderer: THREE.WebGLRenderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const resize = canvas.width !== width || canvas.height !== height;

      if (resize) {
        renderer.setSize(CANVAS_W, CANVAS_H, false);
      }
      return resize;
    }

    let renderRequested = false;
    function render(time: number) {
      renderRequested = false;

      if (resetRendererSize(renderer)) {
        camera.aspect = 1;
        camera.updateProjectionMatrix();
      }

      controls.autoRotate = true;
      controls.autoRotateSpeed = order % 2 ? 1 : -1;

      controls.enablePan = false;
      controls.enableRotate = false;
      controls.enableZoom = false;

      baseComposer?.render(time);
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
      }
    }

    controls.addEventListener("change", requestRenderIfNotRequested);
    window.addEventListener("resize", requestRenderIfNotRequested);

    renderer.autoClear = false;
    const animate = () => {
      const d = clock.getDelta();
      controls.update();
      Object.defineProperty(
        filmPass.uniforms,
        "time",
        new THREE.Uniform(Math.PI ** (10 + d) / 2),
      );
      mixer?.update(d);
      render(d);
    };
    renderer.setAnimationLoop(animate);
  }, []);

  return (
    <canvas
      data-align={order % 2 === 0 ? "left" : "right"}
      className={styles.canvas}
      ref={canvasRef}
    />
  );
};

export default Canvas;
