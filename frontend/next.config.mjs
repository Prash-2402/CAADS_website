/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase project storage — avatar images
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        // Supabase project storage (alternative subdomain pattern)
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
};

export default nextConfig;
