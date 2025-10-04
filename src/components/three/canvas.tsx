'use client'

import { useEffect, useRef, useState } from 'react';
import styles from './canvas.module.scss'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AsciiEffect, ClearMaskPass, ClearPass, ColorifyShader, DotScreenPass, DotScreenShader, EffectComposer, GammaCorrectionShader, FilmPass, MaskPass, OrbitControls, OutputPass, RenderPass, ShaderPass, SobelOperatorShader, UnrealBloomPass, VertexNormalsHelper, VertexTangentsHelper, GlitchPass } from 'three/examples/jsm/Addons.js';
import PickHelper from './utils';

// const ANIMATIONS: [{ objName: string, aniName: string }] = [
//   { objName: 'Object_7', aniName: 'GLTF_created_0Action' }
// ]

const Canvas: React.FC<{ fileName: string, sceneName?: string }> = ({ fileName, sceneName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loader = new GLTFLoader()
  const scene = new THREE.Scene();

  const DOT_LAYER = 1
  const BLOOM_LAYER = 2

  let renderer: THREE.WebGLRenderer;
  let modelsReady = false;
  let mixer: THREE.AnimationMixer | undefined;

  const clock = new THREE.Clock();

  interface MaskRenderTarget {
    target: THREE.WebGLRenderTarget,
    scene?: THREE.Scene,
    camera?: THREE.Camera,
    composer?: THREE.EffectComposer
  }

  const renderTargets = new Map<string, MaskRenderTarget>()

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !canvasRef.current) {
      return;
    }

    renderer = new THREE.WebGLRenderer({ alpha: true, canvas: canvasRef.current })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ReinhardToneMapping

    const canvasRect = canvasRef.current.getBoundingClientRect()

    const fov = 75, aspect = 2, near = 0.1, far = 12;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 3;
    camera.position.y = 5
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

      const mainObjectName = "lil_dood"
      if(mainObjectName) {
        const mainObject = glbRoot.getObjectByName(mainObjectName)
        let mainObjectMesh;
        mainObject.traverse(obj => {
          if('isMesh' in obj && obj.isMesh) {
            mainObjectMesh = obj
          }
        })
        const rtTarget = new THREE.WebGLRenderTarget()
        const mainObjectMaterial = new THREE.MeshBasicMaterial({
          map: rtTarget.texture
        })

        const rtScene = new THREE.Scene(), rtCamera = new THREE.Camera()

        const targetComposer = new EffectComposer(renderer, rtTarget)
        targetComposer.addPass(new RenderPass(rtScene, rtCamera))

        const proceduralMat = new THREE.ShaderMaterial({
          vertexShader: document.querySelector("#procedural-vert").textContext?.trim(),
          fragmentShader: document.querySelector("#noiseRandom3D-frag").textContext?.trim()
        })
        const meshMat = new THREE.MeshPhongMaterial({
          map: rtTarget.texture
        })
        // const postCamera = new THREE.OrthogonalCamera(-1, 1, 1, -1, 0, 1)
      
        // const glitchPass = new GlitchPass()
        // glitchPass.goWild = true
        // targetComposer.addPass(glitchPass)
        //

        const outputPass = new OutputPass()
        targetComposer.addPass(outputPass)

        const postPlane = new THREE.PlaneGeometry(2, 2)
        const postMesh = new THREE.Mesh(postPlane, proceduralMat)
        rtScene.add(postMesh)

        renderTargets.set(mainObjectName, {
          target: rtTarget,
          composer: targetComposer,
          scene: rtScene,
          camera: rtCamera
        })

        console.log({ 1: mainObjectMesh.material, proceduralMat })

        mainObjectMesh.material = meshMat
      }
      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.timeScale = 3
        action.play()
      }

      scene.add(gltf.scene);

    })
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
    // const maskPass = 

    // const composer = new EffectComposer(renderer)

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

      if(renderTargets.size > 0) {
        renderTargets.forEach((obj, key) => {
          // console.log({ obj })
          renderer.setRenderTarget(obj.target);

          const scene = obj.scene ?? new THREE.Scene();
          const camera = obj.camera ?? new THREE.Camera();
          renderer.render(scene, camera)
          obj.composer?.render?.()

          renderer.setRenderTarget(null)
        })
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
      // console.log('hehe')
      controls.update()
      const d = clock.getDelta()
      mixer?.update(d)
      render(0);
    }
    renderer.setAnimationLoop(animate)
    requestAnimationFrame(animate)
  }, [])

  return <canvas className={styles.canvas} ref={canvasRef} />
}

export default Canvas
