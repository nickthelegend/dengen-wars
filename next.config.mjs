/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/team',
        permanent: false,
      },
    ]
  },
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
}

export default nextConfig