/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // R2 domains from your media data
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'public.*.r2.cloudflarestorage.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'movie-site.*.r2.cloudflarestorage.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestream.com',
        pathname: '**',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '500MB',
    },
  },
};

export default nextConfig;
