#include <common>
#include <packing>

varying vec2 v_uv;
varying vec3 v_normal;

uniform sampler2D u_depthTexture;

uniform float u_time;
uniform float u_cameraNear;
uniform float u_cameraFar;
uniform vec3 u_cameraViewPos;
uniform vec2 u_resolution;

// Waves
uniform sampler2D u_waveTextureDisplacement;
uniform sampler2D u_waveTextureNormals;
uniform float u_textureScale;
uniform vec2 u_waveOffset1;
uniform vec2 u_waveOffset2;

uniform vec3 u_waterColor;
uniform vec3 u_deepWaterColor;
uniform vec3 u_foamColor;

uniform float u_depthThreshold;
uniform float u_foamThreshold;

////////////////////////////////////////////////////////////

float getDepth( const in vec2 screenPosition ) {
    #if DEPTH_PACKING == 1
        return unpackRGBAToDepth( texture2D( u_depthTexture, screenPosition ) );
    #else
        return texture2D( u_depthTexture, screenPosition ).x;
    #endif
}

float getViewZ( const in float depth ) {
    float viewZ = perspectiveDepthToViewZ( depth, u_cameraNear, u_cameraFar );
    return viewZToOrthographicDepth(viewZ, u_cameraNear, u_cameraFar);
}

////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////

void main() {
    vec2 screenUV = gl_FragCoord.xy / u_resolution;

    float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z) * (u_cameraFar - u_cameraNear);             // actual depth
    float scenelinearEyeDepth    = getViewZ(getDepth( screenUV )) * (u_cameraFar - u_cameraNear);       // from depth pass (without water plane)
    float diff = saturate(scenelinearEyeDepth - fragmentLinearEyeDepth); // water depth

    // waves
    float displacement = 0.0;
    // float displacement = texture2D(u_waveTextureDisplacement, v_uv * u_textureScale + u_waveOffset1 * u_time).x
    //                   * texture2D(u_waveTextureDisplacement, v_uv * u_textureScale + u_waveOffset2 * u_time).x ;

    // shoreline + waves
    vec3 waterColor = mix(u_foamColor, u_waterColor, diff + displacement);

    // vec3 waterNormals = texture2D(u_waveTextureNormals, v_uv * u_textureScale + u_waveOffset1 * u_time).rgb
    //                   * texture2D(u_waveTextureNormals, v_uv * u_textureScale + u_waveOffset2 * u_time).rgb;
    // vec3 viewDir = normalize(u_cameraViewPos - gl_FragColor.xyz);
    // waterColor += saturate(dot(viewDir, waterNormals)) * u_foamColor;

    // output
    gl_FragColor.rgb = waterColor;
    gl_FragColor.a = 0.8;

    #include <tonemapping_fragment>
}