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
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
