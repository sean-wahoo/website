'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './canvas.module.scss'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AsciiEffect, ClearMaskPass, ClearPass, ColorifyShader, DotScreenPass, DotScreenShader, EffectComposer, GammaCorrectionShader, MaskPass, OrbitControls, OutputPass, RenderPass, ShaderPass, SobelOperatorShader, UnrealBloomPass, VertexNormalsHelper, VertexTangentsHelper } from 'three/examples/jsm/Addons.js';
import PickHelper from './utils';

const ANIMATIONS: [{ objName: string, aniName: string }] = [
  { objName: 'Object_7', aniName: 'GLTF_created_0Action' }
]

const Canvas: React.FC<{ fileName: string, objectNames?: [string] }> = ({ fileName, objectNames }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loader = new GLTFLoader()
  const scene = new THREE.Scene();

  const DOT_LAYER = 1
  const BLOOM_LAYER = 2

  let renderer: THREE.WebGLRenderer;
  let modelsReady = false;
  let mixer: THREE.AnimationMixer | undefined;

  const clock = new THREE.Clock();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !canvasRef.current) {
      return;
    }

    renderer = new THREE.WebGLRenderer({ alpha: true, canvas: canvasRef.current })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ReinhardToneMapping

    const canvasRect = canvasRef.current.getBoundingClientRect()

    const fov = 75, aspect = 2, near = 0.1, far = 20;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 3;
    camera.lookAt(0, 0, 0)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true;
    scene.add(camera)

    const lightColor = 0xffffff, lightIntensity = 3;
    const light = new THREE.DirectionalLight(lightColor, lightIntensity)
    light.position.set(-1, 2, 4)

    scene.add(light)
    renderer.setSize(canvasRect.width, canvasRect.height)

    let mixer: THREE.AnimationMixer | undefined;
    loader.load(`/models/${fileName}`, gltf => {
      const glbRoot = gltf.scene
      const models: { [key: string]: THREE.Object3D } = {};
      console.log({ gltf })
      glbRoot.children.forEach(obj => {
        console.log({ obj })
        if ('animations' in obj && obj.animations.length) {
          console.log("yeyey", obj)
        }
        if (obj.isObject3D) {
          models[obj.name] = obj
          scene.add(obj)
        }
      })
      if (gltf.animations.length) {
        const animationsToUse = gltf.animations.filter(gltfA => ANIMATIONS.map(a => a.aniName === gltfA.name));
        for (const a of animationsToUse) {
          const modelKeys = Object.keys(models)
          const link = ANIMATIONS.find(constA => constA.aniName === a.name && modelKeys.includes(constA.objName))
          if (!link) continue;
          const model = models[link.objName]
          mixer = new THREE.AnimationMixer(model);

          const animationAction = mixer.clipAction(a)
          animationAction.play()
          console.log({ animationAction, link })
        }
      }

      // const animationAction = mixer.clipAction()


      // scene.add(gltf.scene);
      return;
      const objsToAdd: THREE.Object3D[] = [];
      for (const model of models) {
        model.traverse(obj => {
          if ('material' in obj && 'isMesh' in obj && obj.isMesh) {
            objsToAdd.push(obj)
          }
        })
      }

      scene.add(...objsToAdd)
    })
    //
    //
    //   loader.load('/models/dood_at_desk.glb', gltf => {
    //     const root = gltf.scene;
    //
    //     const cube = root.getObjectByName('desk_setup')
    //
    //     const human = cube?.children[0] as THREE.Mesh
    //
    //     // const bodyRenderTarget = new THREE.WebGLRenderTarget()
    //
    //     const baseHumanMaterial = new THREE.MeshPhongMaterial({
    //       // opacity: 0.2,
    //       // transparent: true,
    //       // map: bodyRenderTarget.texture,
    //       depthWrite: false,
    //       // dithering: true
    //     })
    //
    //     human.scale.multiplyScalar(0.25)
    //     human.position.set(0, 2, 0)
    //     human.rotation.set(3 * Math.PI / 2, 0, 0)
    //
    //     human.material = baseHumanMaterial;
    //
    //     const edgesGeo = new THREE.EdgesGeometry(human.geometry)
    //     const edgesMaterial = new THREE.LineBasicMaterial({ linewidth: 1, opacity: 1 })
    //     const edges = new THREE.LineSegments(edgesGeo, edgesMaterial)
    //
    //     // human.layers.enable(DOT_LAYER)
    //     // edges.layers.enable(BLOOM_LAYER)
    //
    //     human.add(edges)
    //     scene.add(human)
    //
    //     human.material.premultipliedAlpha = true
    //     human.material.blending = THREE.SubtractiveBlending;
    //     // human.material.blending = THREE.MultiplyBlending
    //
    //     // bodyRenderTarget.resolveDepthBuffer = false
    //     // renderer.setRenderTarget(bodyRenderTarget)
    //     // human.material.blending = THREE.NoBlending
    //   })

    const canvas = renderer.domElement
    function getCanvasRelativePosition(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height,
      }
    }

    function resetRendererSize(renderer: THREE.WebGLRenderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth, height = canvas.clientHeight;
      const resize = canvas.width !== width || canvas.height !== height;

      if (resize) {
        renderer.setSize(width, height, false)
      }
      return resize;
    }

    let renderRequested = false;
    function render(time: number) {
      renderRequested = false;
      time *= 0.001

      const canvas = renderer.domElement;
      const canvasRect = canvas.getBoundingClientRect()
      if (resetRendererSize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix()
      }

      controls.update()
      renderer.render(scene, camera)
    }

    function requestRenderIfNotRequested() {
      if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render)
      }
    }

    controls.addEventListener('change', requestRenderIfNotRequested)
    window.addEventListener('resize', requestRenderIfNotRequested)

    requestRenderIfNotRequested()
    const animate = () => {
      console.log('hehe')
      requestAnimationFrame(animate)
      controls.update()
      mixer?.update(clock.getDelta())

      render(clock.getDelta())
    }
    animate()
  }, [])

  return <canvas className={styles.canvas} ref={canvasRef} />
}

export default Canvas
