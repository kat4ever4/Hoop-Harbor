import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Temporary: send the homepage to the roster until the real Home page exists.
  async redirects() {
    return [{ source: "/", destination: "/roster", permanent: false }];
  },
};

export default nextConfig;
