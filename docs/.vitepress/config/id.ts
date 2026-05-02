import { defineConfig } from "vitepress"

export const id = defineConfig({
  lang: "id-ID",
  description: "Buku tidak resmi dan opini untuk pemula",

  themeConfig: {
    nav: [
      { text: "Beranda", link: "/id/" },
      { text: "Kata Pengantar", link: "/id/preface.md" },
      { text: "Mulai", link: "/id/introduction/index.md" },
      { text: "Praktik Terbaik", link: "/id/best-practices/intro.md" },
    ],
    sidebar: [
      {
        text: "Kata Pengantar",
        items: [{ text: "Kata Pengantar", link: "/id/preface.md" }],
      },
      {
        text: "Mulai",
        items: [
          { text: "Pengenalan", link: "/id/introduction/index.md" },
          {
            text: "Kelebihan dan Kekurangan",
            link: "/id/introduction/advantages-and-disadvantages.md",
          },
          {
            text: "Instalasi",
            link: "/id/introduction/installation.md",
          },
        ],
      },
      {
        text: "Bahasa Nix",
        items: [{ text: "Dasar", link: "/id/the-nix-language/index.md" }],
      },
      {
        text: "NixOS dengan Flakes",
        items: [
          {
            text: "Mulai dengan NixOS",
            link: "/id/nixos-with-flakes/get-started-with-nixos.md",
          },
          {
            text: "Pengenalan Flakes",
            link: "/id/nixos-with-flakes/introduction-to-flakes.md",
          },
          {
            text: "NixOS dengan Flakes Diaktifkan",
            link: "/id/nixos-with-flakes/nixos-with-flakes-enabled.md",
          },
          {
            text: "Penjelasan flake.nix NixOS",
            link: "/id/nixos-with-flakes/nixos-flake-configuration-explained.md",
          },
          {
            text: "Kemampuan kombinasi Flakes dan sistem modul Nixpkgs",
            link: "/id/nixos-with-flakes/nixos-flake-and-module-system.md",
          },
          {
            text: "Mulai dengan Home Manager",
            link: "/id/nixos-with-flakes/start-using-home-manager.md",
          },
          {
            text: "Modularisasi Konfigurasi",
            link: "/id/nixos-with-flakes/modularize-the-configuration.md",
          },
          {
            text: "Memperbarui Sistem",
            link: "/id/nixos-with-flakes/update-the-system.md",
          },
          {
            text: "Menurunkan atau Meningkatkan Paket",
            link: "/id/nixos-with-flakes/downgrade-or-upgrade-packages.md",
          },
          {
            text: "Tips Berguna Lainnya",
            link: "/id/nixos-with-flakes/other-useful-tips.md",
          },
        ],
      },
      {
        text: "Penggunaan Lanjutan Nixpkgs",
        items: [
          { text: "Pengenalan", link: "/id/nixpkgs/intro.md" },
          { text: "callPackage", link: "/id/nixpkgs/callpackage.md" },
          { text: "Overriding", link: "/id/nixpkgs/overriding.md" },
          { text: "Overlays", link: "/id/nixpkgs/overlays.md" },
          {
            text: "Beberapa Instance Nixpkgs",
            link: "/id/nixpkgs/multiple-nixpkgs.md",
          },
        ],
      },
      {
        text: "Nix Store & Binary Cache",
        items: [
          { text: "Pengenalan", link: "/id/nix-store/intro.md" },
          {
            text: "Tambahkan Server Binary Cache",
            link: "/id/nix-store/add-binary-cache-servers.md",
          },
          {
            text: "Host Server Binary Cache Anda Sendiri",
            link: "/id/nix-store/host-your-own-binary-cache-server.md",
          },
        ],
      },
      {
        text: "Praktik Terbaik",
        items: [
          { text: "Pengenalan", link: "/id/best-practices/intro.md" },
          {
            text: "Menjalankan binary yang diunduh di NixOS",
            link: "/id/best-practices/run-downloaded-binaries-on-nixos.md",
          },
          {
            text: "Menyederhanakan Perintah Terkait NixOS",
            link: "/id/best-practices/simplify-nixos-related-commands.md",
          },
          {
            text: "Mempercepat Debugging Dotfiles",
            link: "/id/best-practices/accelerating-dotfiles-debugging.md",
          },
          {
            text: "NIX_PATH dan Flake Registry Kustom",
            link: "/id/best-practices/nix-path-and-flake-registry.md",
          },
          {
            text: "Deployment Jarak Jauh",
            link: "/id/best-practices/remote-deployment.md",
          },
          {
            text: "Debugging Derivations dan Ekspresi Nix",
            link: "/id/best-practices/debugging.md",
          },
        ],
      },

      {
        text: "Penggunaan Lain dari Flakes",
        items: [
          { text: "Pengenalan", link: "/id/other-usage-of-flakes/intro.md" },
          {
            text: "Flake Inputs",
            link: "/id/other-usage-of-flakes/inputs.md",
          },
          {
            text: "Flake Outputs",
            link: "/id/other-usage-of-flakes/outputs.md",
          },
          {
            text: "CLI Baru",
            link: "/id/other-usage-of-flakes/the-new-cli.md",
          },
          {
            text: "Sistem Modul & Opsi Kustom",
            link: "/id/other-usage-of-flakes/module-system.md",
          },
          {
            text: "[WIP]Testing",
            link: "/id/other-usage-of-flakes/testing.md",
          },
        ],
      },
      {
        text: "Lingkungan Dev di NixOS",
        items: [
          {
            text: "nix shell, nix develop & pkgs.runCommand",
            link: "/id/development/intro.md",
          },
          {
            text: "Lingkungan Dev",
            link: "/id/development/dev-environments.md",
          },
          {
            text: "[WIP]Packaging 101",
            link: "/id/development/packaging-101.md",
          },
          {
            text: "Kompilasi Cross-platform",
            link: "/id/development/cross-platform-compilation.md",
          },
          {
            text: "Distributed Building",
            link: "/id/development/distributed-building.md",
          },
          {
            text: "[WIP]Pengembangan Kernel",
            link: "/id/development/kernel-development.md",
          },
        ],
      },
      {
        text: "Topik Lanjutan",
        items: [{ text: "Topik Lanjutan", link: "/id/advanced-topics/index.md" }],
      },
      {
        text: "Pertanyaan yang Sering Diajukan",
        items: [{ text: "Pertanyaan yang Sering Diajukan", link: "/id/faq/index.md" }],
      },
    ],
  },
})
