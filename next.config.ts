import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // RainbowKit's default wallet list pulls in @wagmi/connectors' Coinbase/
  // Base connector, which chains into @coinbase/cdp-sdk's x402 payment
  // module. That module dynamically imports optional @x402/* packages we
  // don't have installed (a runtime feature-detection pattern) — Next.js's
  // bundler tries to statically resolve them and fails the build. We don't
  // use that payment feature, so this only opts the package out of build-
  // time bundling in favor of a native Node require, which isn't invoked.
  serverExternalPackages: ["@coinbase/cdp-sdk", "@base-org/account"],
};

export default nextConfig;
