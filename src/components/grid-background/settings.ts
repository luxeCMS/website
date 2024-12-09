export const settings = {
  pixelSize: 15.0, // Size of each pixel
  pixelGap: 5.0, // Gap between pixels
  baseColor: [0.05, 0.05, 0.05], // Dark grey
  highlightColor: [0.8, 0.8, 0.8], // Neon green
  circleRadius: 0.5, // Size of the mouse influence (in normalized coordinates)
  innerRadius: 0.2, // Inner radius where intensity is maximum
  falloffPower: 1.0, // Power of the falloff curve (higher = sharper falloff)
  minIntensity: 0.05, // Minimum pixel intensity
  maxIntensity: 0.4, // Maximum pixel intensity
  transitionDuration: 2000.0, // Base transition duration in ms
  transitionVariation: 1000.0, // Random variation in transition duration
  fadeOutDuration: 1500.0, // Duration for fading out when leaving mouse radius
  noiseScale: 0.5, // Scale of the noise pattern
  noiseSpeed: 0.5, // Speed of the noise animation
} as const;
