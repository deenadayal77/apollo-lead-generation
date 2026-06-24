/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default config;
