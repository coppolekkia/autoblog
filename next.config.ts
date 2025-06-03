
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
        hostname: 'pwm.im-cdn.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ansa.it', // Ensure this entry is present
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: ['https://6000-firebase-studio-1748527150580.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev'],
};

export default nextConfig;
