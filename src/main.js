// Three.js via import map
import * as THREE from 'three'

// Engine
import { createRenderer } from './engine/renderer.js'
import { createCamera } from './engine/camera.js'
import { createControls } from './engine/controls.js'
import { startLoop } from './engine/loop.js'

// World
import { SceneManager } from './world/sceneManager.js'

// Bootstrap
const renderer = createRenderer()
const camera = createCamera()
const sceneManager = new SceneManager(camera)
const controls = createControls(camera, renderer.domElement)

startLoop(renderer, camera, sceneManager, controls)
