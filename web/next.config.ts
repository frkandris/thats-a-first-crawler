import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A magyar felület magyar URL-eket használ; belül a route-mappák angol
  // nevűek (app/[locale]/collection), a magyar aliasokat itt képezzük le.
  async rewrites() {
    return [
      {
        source: "/:locale(hu|en)/gyujtemeny",
        destination: "/:locale/collection",
      },
      {
        source: "/:locale(hu|en)/gyujtemeny/:slug",
        destination: "/:locale/collection/:slug",
      },
    ];
  },
};

export default nextConfig;
