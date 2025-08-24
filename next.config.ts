import type { NextConfig } from 'next';
//@ts-ignore
import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  sw: '/sw.js',
};

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  //transpilePackages: ['@genesyshub/core'],

  experimental: {
    inlineCss: true,
    useCache: true,
    clientSegmentCache: true,
    viewTransition: true,
  },
};

export default withPWA(pwaConfig)(nextConfig);