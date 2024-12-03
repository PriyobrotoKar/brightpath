/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'priyobroto-brightpath.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
