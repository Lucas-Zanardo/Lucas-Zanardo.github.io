import Component from './Component';

import * as THREE from 'three';
import { addVector2 } from '../utils/debugGui';

export default class Water extends Component {
    material;
    plane;

    constructor(gameObject, params={size: 100, loadedTextures: null, loadedModels: null, depthTexture: null, vertex: '', fragment: '', renderer: null, camera: null}) {
        super(gameObject);

        const waterTextureDisp = params.loadedTextures.water_texture_disp.data;
        waterTextureDisp.wrapS = waterTextureDisp.wrapT = THREE.RepeatWrapping;
        const waterTextureNorm = params.loadedTextures.water_texture_norm.data;
        waterTextureNorm.wrapS = waterTextureNorm.wrapT = THREE.RepeatWrapping;

        const supportsDepthTextureExtension = !!params.renderer.extensions.get("WEBGL_depth_texture");
        if (supportsDepthTextureExtension) {
            console.log("depth texture extension supported");
        }

        // const waterPlane = new THREE.PlaneGeometry(params.size, params.size);
        const waterMat  = new THREE.ShaderMaterial({ 
            defines: {
               DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
            },
            uniforms: {
                u_time : { value: 0.0 },
                u_depthTexture: { value: params.depthTexture },
                u_resolution: { value: new THREE.Vector2(800, 800) },
                u_cameraFar: { value: params.camera.far },
                u_cameraNear: { value: params.camera.near },
                u_cameraViewPos: { value: params.camera.position },
                u_textureScale: { value: 10. },
    
                u_waveTextureDisplacement: { value: params.loadedTextures.water_texture_disp.data },
                u_waveTextureNormals: { value: params.loadedTextures.water_texture_norm.data },
                
                u_waveOffset1: { value: new THREE.Vector2(.08, .05) },
                u_waveOffset2: { value: new THREE.Vector2(-.1, .05) },
    
                u_waterColor: { value: new THREE.Color('#28ebef') },
                u_deepWaterColor: { value: new THREE.Color('#085a6f') },
                u_foamColor: { value: new THREE.Color('#ffffff') },
                u_depthThreshold: { value: 3.1 },
                u_foamThreshold: { value: 0.3 },
            },
            vertexShader: params.vertex.data,
            fragmentShader: params.fragment.data,
            side: THREE.DoubleSide,
            transparent: true,
            // depthWrite: true,
        });
        this.material = waterMat;

        const waterMesh  = params.loadedModels.water.gltf.scene.clone();
        waterMesh.traverse(( child ) => {
            if ( child instanceof THREE.Mesh ) {
                child.receiveShadow = true;
                child.castShadow = false;
                child.material = this.material;
            }
        });
        this.plane = waterMesh;

        // add to scene
        this.gameObject.transform.add(waterMesh);
    }

    setSize(width, height) {
        this.material.uniforms.u_resolution.value.set(width, height)
        this.material.needsUpdate = true;
    }

    update(time) {
        this.material.uniforms.u_time.value = time.time;
        this.material.needsUpdate = true;
    }

    editorGui(folder) {
        addVector2(folder, this.material.uniforms.u_waveOffset2, 'value', 'waveOffset1').close().onChange(() => { this.material.needsUpdate = true; });
        addVector2(folder, this.material.uniforms.u_waveOffset1, 'value', 'waveOffset2').close().onChange(() => { this.material.needsUpdate = true; });
        folder.addColor(this.material.uniforms.u_waterColor, 'value').name('waterColor').onChange(() => { this.material.needsUpdate = true; });
        folder.addColor(this.material.uniforms.u_deepWaterColor, 'value').name('deepWaterColor').onChange(() => { this.material.needsUpdate = true; });
        folder.addColor(this.material.uniforms.u_foamColor, 'value').name('foamColor').onChange(() => { this.material.needsUpdate = true; });
        folder.add(this.material.uniforms.u_foamThreshold, 'value').name('foamThreshold').onChange(() => { this.material.needsUpdate = true; });
    
        const shaderUniforms = folder.addFolder("Uniforms");
        for(const key of Object.keys(this.material.uniforms)) {
            const val = this.material.uniforms[key];
            if(val.value instanceof THREE.Vector2) {
                addVector2(shaderUniforms, val, 'value', key);
            } else if(typeof val.value === 'number') {
                shaderUniforms.add(val, 'value').name(key).listen();
            }
        }
    }
}