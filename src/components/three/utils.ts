import * as THREE from 'three'
import { Object3D, Object3DNode } from 'three/webgpu';

export default class PickHelper {
  raycaster: THREE.Raycaster;
  pickedObject: THREE.Object3D | null;
  pickedObjectSavedColor: number;

  constructor() {
    this.raycaster = new THREE.Raycaster()
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0
  }
  pick(normalPos: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera, time: number) {
    if (this.pickedObject) {
      this.pickedObject = null
    }
    this.raycaster.setFromCamera(normalPos, camera)
    const intersectedObjs = this.raycaster.intersectObjects(scene.children)
    if (intersectedObjs.length) {
      this.pickedObject = intersectedObjs[0].object
    }
  }
}
