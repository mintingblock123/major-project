/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino-pretty"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
