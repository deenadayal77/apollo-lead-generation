import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default config;
