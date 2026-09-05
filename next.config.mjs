/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Supabase Storage public bucket host — update if the project ref changes.
        hostname: 'drcahfhippwhiiqwjept.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
