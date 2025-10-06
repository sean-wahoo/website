"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./canvas.module.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  AsciiEffect,
  ClearMaskPass,
  ClearPass,
  ColorifyShader,
  DotScreenPass,
  DotScreenShader,
  EffectComposer,
  GammaCorrectionShader,
  FilmPass,
  MaskPass,
  OrbitControls,
  OutputPass,
  RenderPass,
  ShaderPass,
  SobelOperatorShader,
  UnrealBloomPass,
  VertexNormalsHelper,
  VertexTangentsHelper,
  GlitchPass,
  RenderPixelatedPass,
} from "three/examples/jsm/Addons.js";
import PickHelper from "./utils";

// const ANIMATIONS: [{ objName: string, aniName: string }] = [
//   { objName: 'Object_7', aniName: 'GLTF_created_0Action' }
// ]

const Canvas: React.FC<{ fileName: string; sceneName?: string }> = ({
  fileName,
  sceneName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loader = new GLTFLoader();
  const scene = new THREE.Scene();

  const DOT_LAYER = 1;
  const BLOOM_LAYER = 2;

  let renderer: THREE.WebGLRenderer;
  let modelsReady = false;
  let mixer: THREE.AnimationMixer | undefined;

  const clock = new THREE.Clock();

  interface MaskRenderTarget {
    target: THREE.WebGLRenderTarget;
    scene?: THREE.Scene;
    camera?: THREE.Camera;
    composer?: EffectComposer;
  }

  const renderTargets = new Map<string, MaskRenderTarget>();

  const models = new THREE.Group();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined" ||
      !canvasRef.current
    ) {
      return;
    }

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: canvasRef.current,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;

    renderer.setClearColor(0xe0e0e0, 0);

    const canvasRect = canvasRef.current.getBoundingClientRect();

    const fov = 45,
      aspect = 2,
      near = 0.1,
      far = 12;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 5;
    camera.position.x = 6;
    camera.position.y = 5;
    camera.lookAt(new THREE.Vector3(0, 20, 0));
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(camera);

    const lightColor = 0xffffff;
    const lightIntensity = 3;
    const light = new THREE.DirectionalLight(lightColor, lightIntensity);
    light.position.set(-1, 2, 4);

    scene.add(light);
    renderer.setSize(canvasRect.width, canvasRect.height);

    let mixer: THREE.AnimationMixer | undefined;
    loader.load(`/models/${fileName}`, (gltf) => {
      const glbRoot = gltf.scene;

      const mainObjectName = "lil_dood";

      for (const object of glbRoot.children) {
        let objectMesh: THREE.Mesh | undefined;
        object?.traverse((obj) => {
          if ("isMesh" in obj && obj.isMesh) {
            objectMesh = obj as THREE.Mesh;
          }
        });
        const rtTarget = new THREE.WebGLRenderTarget(
          window.innerWidth,
          window.innerHeight,
          { stencilBuffer: true },
        );

        const originalMaterial = objectMesh?.material;
        const rtScene = new THREE.Scene();
        if (mainObjectName === object.name) {
          const mainObjectMesh = objectMesh;
          const mainObject = glbRoot.getObjectByName(
            mainObjectName,
          ) as THREE.Object3D;

          const rtCamera = new THREE.PerspectiveCamera(-1, 1, 1, -1);
          rtCamera.position.z = 5;
          rtCamera.position.x = 6;
          rtCamera.position.y = 5;
          const targetComposer = new EffectComposer(renderer, rtTarget);
          targetComposer.addPass(new RenderPass(rtScene, camera));

          // const filmPass = new FilmPass(0.5, false)

          const proceduralMat = new THREE.ShaderMaterial({
            vertexShader: document
              .querySelector("#vertexshader")!
              .textContent?.trim(),
            fragmentShader: document
              .querySelector("#noiseRandom3D-frag")!
              .textContent?.trim(),
          });

          const colorPass1 = new ShaderPass(ColorifyShader);
          colorPass1.uniforms["tDiffuse"].value = 1;
          colorPass1.uniforms["color"].value = new THREE.Color(0, 0.5, 0.2);

          const colorPass2 = new ShaderPass(ColorifyShader);
          colorPass2.uniforms["tDiffuse"].value = 0.2;
          colorPass2.uniforms["color"].value = new THREE.Color(0.1, 0.2, 0.5);
          colorPass2.renderToScreen = false;

          // targetComposer.addPass(colorPass1);
          // const postCamera = new THREE.OrthogonalCamera(-1, 1, 1, -1, 0, 1)

          const glitchPass = new GlitchPass();
          glitchPass.goWild = true;
          //

          // targetComposer.addPass(filmPass)
          const clearPass = new ClearPass();
          const clearMaskPass = new ClearMaskPass();

          const maskPass = new MaskPass(rtScene, camera);
          const maskPassDesk = new MaskPass(scene, camera);

          const pixelPass = new RenderPixelatedPass(6, scene, camera);

          targetComposer.addPass(clearPass);

          targetComposer.addPass(maskPassDesk);
          targetComposer.addPass(new ShaderPass(proceduralMat));
          targetComposer.addPass(glitchPass);
          targetComposer.addPass(colorPass2);
          targetComposer.addPass(clearMaskPass);
          targetComposer.addPass(maskPass);
          targetComposer.addPass(new ShaderPass(proceduralMat));
          targetComposer.addPass(glitchPass);
          targetComposer.addPass(colorPass1);
          targetComposer.addPass(clearMaskPass);

          const outputPass = new OutputPass();
          targetComposer.addPass(outputPass);

          targetComposer.setSize(window.innerWidth, window.innerHeight);

          renderTargets.set(mainObjectName, {
            target: rtTarget,
            composer: targetComposer,
            scene: rtScene,
            camera: rtCamera,
          });

          rtScene.add(mainObject);
          if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(rtScene);
            const action = mixer.clipAction(gltf.animations[0]);
            action.timeScale = 3.7;
            action.play();
          }

          // if (mainObjectMesh) {
          // targetComposer.render(0);
          // }
          renderer.clear();
          targetComposer.render();
          // scene.add(rtScene);
        } // if (originalMaterial) {
        //   objectMesh!.material = originalMaterial;
        // }
        // models.add(object);
        // r
        // rtScene.add(object);
        // scene.add(rtScene);
      }

      // gltf.scene.add(models);
      scene.add(gltf.scene);
    });
    const canvas = renderer.domElement;
    function getCanvasRelativePosition(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) * canvas.width) / rect.width,
        y: ((event.clientY - rect.top) * canvas.height) / rect.height,
      };
    }

    function resetRendererSize(renderer: THREE.WebGLRenderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const resize = canvas.width !== width || canvas.height !== height;

      if (resize) {
        renderer.setSize(width, height, false);
      }
      return resize;
    }

    let renderRequested = false;
    function render(time: number) {
      renderRequested = false;
      time *= 0.001;

      const canvas = renderer.domElement;
      const canvasRect = canvas.getBoundingClientRect();
      if (resetRendererSize(renderer)) {
        // camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      renderer.clear();
      if (renderTargets.size > 0) {
        const c = new THREE.Clock();
        renderTargets.forEach((obj, key) => {
          renderer.setRenderTarget(obj.target);

          const scene = obj.scene ?? new THREE.Scene();
          const camera = obj.camera ?? new THREE.Camera();
          if (obj.composer) {
            obj.composer.setSize(canvasRect.width, canvasRect.height);
            obj.composer.render(c.getDelta());
          }
          renderer.render(scene, camera);
          renderer.setRenderTarget(null);
        });
      }
      // controls.update();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1;
      controls.enablePan = false;
      controls.enableRotate = false;
      controls.enableZoom = false;

      renderer.render(scene, camera);
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
      controls.update();
      const d = clock.getDelta();
      mixer?.update(d);
      render(0);
    };
    renderer.setAnimationLoop(animate);
    //
    // requestAnimationFrame(animate);
  }, []);

  return <canvas className={styles.canvas} ref={canvasRef} />;
};

export default Canvas;
