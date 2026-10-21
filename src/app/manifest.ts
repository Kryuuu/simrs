import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIMRS Modern - Sistem Informasi Manajemen Rumah Sakit",
    short_name: "SIMRS",
    description: "Sistem Informasi Manajemen Rumah Sakit Modern, Terintegrasi, dan Berstandar Kemenkes",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
