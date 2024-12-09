export default `precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_pixelSize;
uniform float u_gap;
uniform float u_circleRadius;
uniform float u_minIntensity;
uniform float u_maxIntensity;
uniform vec3 u_baseColor;
uniform vec3 u_highlightColor;
uniform float u_time;
uniform float u_innerRadius;
uniform float u_falloffPower;

// Improved smoothstep function with customizable falloff
float customSmoothstep(float edge0, float edge1, float x, float power) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return 1.0 - pow(1.0 - pow(t, power), power);
}

// Noise functions
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Get pixel ID and transition state
vec2 getPixelId(vec2 pos) {
    return floor(pos / (u_pixelSize + u_gap));
}

float getPixelSeed(vec2 pixelId) {
    return hash(pixelId);
}

// Calculate radial gradient with smooth falloff
float calculateRadialGradient(float dist) {
    // Create three zones: inner, transition, and outer
    float innerFalloff = u_innerRadius * u_circleRadius;
    float outerFalloff = u_circleRadius;
    
    // Smooth transition between zones
    if (dist < innerFalloff) {
        return 1.0;
    } else {
        return customSmoothstep(outerFalloff, innerFalloff, dist, u_falloffPower);
    }
}

// Calculate transition timing for a pixel
float getTransitionTiming(vec2 pixelId, float mouseDistance) {
    float seed = getPixelSeed(pixelId);
    float transitionOffset = seed * 1000.0;
    float normalizedTime = u_time * 0.001;
    
    vec2 noisePos = pixelId * 0.1 + vec2(normalizedTime * 0.2);
    float flowNoise = noise(noisePos);
    
    return normalizedTime + flowNoise + transitionOffset;
}

// Calculate pixel intensity with smooth transitions
float calculatePixelIntensity(vec2 pixelCenter, vec2 mouse) {
    vec2 pixelId = getPixelId(pixelCenter);
    float dist = distance(pixelCenter, mouse) / u_resolution.y;
    
    // Calculate radial gradient
    float radialGradient = calculateRadialGradient(dist);
    
    // Get pixel-specific random values
    float seed = getPixelSeed(pixelId);
    float maxIntensity = mix(u_minIntensity, u_maxIntensity, seed);
    
    // Calculate time-based transition
    float transitionTime = getTransitionTiming(pixelId, dist);
    float timeScale = 0.5 + seed * 0.5;
    float animatedIntensity = sin(transitionTime * timeScale) * 0.5 + 0.5;
    
    // Combine animations with radial gradient
    float baseIntensity = mix(u_minIntensity, maxIntensity, animatedIntensity);
    return mix(u_minIntensity, baseIntensity, radialGradient);
}

void main() {
    vec2 st = gl_FragCoord.xy;
    
    // Check if we're in a gap
    vec2 gridPos = mod(st, u_pixelSize + u_gap);
    if (gridPos.x > u_pixelSize || gridPos.y > u_pixelSize) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    // Calculate pixel center
    vec2 pixelCenter = st - gridPos + vec2(u_pixelSize * 0.5);
    
    // Calculate intensity with smooth transitions
    float intensity = calculatePixelIntensity(pixelCenter, u_mouse);
    
    // Apply non-linear curve and mix colors
    float adjustedIntensity = pow(intensity, 1.5);
    vec3 color = mix(u_baseColor, u_highlightColor, adjustedIntensity);
    
    gl_FragColor = vec4(color, 1.0);
}`;
