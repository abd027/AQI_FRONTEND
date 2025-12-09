/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable React Strict Mode to prevent double mounting
  // This helps with Leaflet map initialization issues in development
  reactStrictMode: false,
};

module.exports = nextConfig;

