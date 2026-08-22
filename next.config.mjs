/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow QR codes (external generator) and Supabase Storage (profile pics) to be
    // rendered via next/image if we opt into it later. We mostly use plain <img> today.
    remotePatterns: [
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
