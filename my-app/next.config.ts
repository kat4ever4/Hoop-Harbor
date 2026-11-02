import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Temporary: send the homepage to the recruit list until the real Home page exists.
  // /roster is the old address of the list, kept so old links still work.
  async redirects() {
    return [
      { source: "/", destination: "/recruits", permanent: false },
      { source: "/roster", destination: "/recruits", permanent: false },
    ];
  },
};

export default nextConfig;
