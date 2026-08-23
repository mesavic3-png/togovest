/** @type {import('next').NextConfig} */
const nextConfig={
  images:{remotePatterns:[{protocol:"https",hostname:"images.unsplash.com"}]},
  experimental:{workerThreads:true,cpus:1}
};
export default nextConfig;
