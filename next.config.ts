
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pwm.im-cdn.it', // Added this new pattern
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['https://6000-firebase-studio-1748527150580.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev'],
};

export default nextConfig;
