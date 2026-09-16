import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
       {
              protocol: 'https',
              hostname: 'b2bezysales.com',
              port: '',
              pathname: '/RR-Briyani/image/**',
            },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
};

export default nextConfig;
