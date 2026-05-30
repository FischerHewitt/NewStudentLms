import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdf-parse references canvas/encoding at module load; alias them away
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    }
    return config
  },
}

export default nextConfig
