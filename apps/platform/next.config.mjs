/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'brightpath-dev.s3.ap-south-1.amazonaws.com',
      },
      {
        hostname: 'pbs.twimg.com',
      },
    ],
  },
};

export default nextConfig;
