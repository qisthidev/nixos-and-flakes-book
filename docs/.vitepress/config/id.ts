import { defineConfig } from "vitepress"

export const id = defineConfig({
  lang: "id-ID",
  description: "Buku tidak resmi dan opini untuk pemula",

  themeConfig: {
    nav: [
      { text: "Beranda", link: "/" },
      { text: "Kata Pengantar", link: "/preface.md" },
      { text: "Mulai", link: "/introduction/index.md" },
      { text: "Praktik Terbaik", link: "/best-practices/intro.md" },
    ],
    sidebar: [
      {
        text: "Kata Pengantar",
        items: [{ text: "Kata Pengantar", link: "/preface.md" }],
      },
      {
        text: "Mulai",
        items: [
          { text: "Pengenalan", link: "/introduction/index.md" },
          {
            text: "Kelebihan dan Kekurangan",
            link: "/introduction/advantages-and-disadvantages.md",
          },
          {
            text: "Instalasi",
            link: "/introduction/installation.md",
          },
        ],
      },
      {
        text: "Bahasa Nix",
        items: [{ text: "Dasar", link: "/the-nix-language/index.md" }],
      },
      {
        text: "NixOS dengan Flakes",
        items: [
          {
            text: "Mulai dengan NixOS",
            link: "/nixos-with-flakes/get-started-with-nixos.md",
          },
          {
            text: "Pengenalan Flakes",
            link: "/nixos-with-flakes/introduction-to-flakes.md",
          },
          {
            text: "NixOS dengan Flakes Diaktifkan",
            link: "/nixos-with-flakes/nixos-with-flakes-enabled.md",
          },
          {
            text: "Penjelasan flake.nix NixOS",
            link: "/nixos-with-flakes/nixos-flake-configuration-explained.md",
          },
          {
            text: "Kemampuan kombinasi Flakes dan sistem modul Nixpkgs",
            link: "/nixos-with-flakes/nixos-flake-and-module-system.md",
          },
          {
            text: "Mulai dengan Home Manager",
            link: "/nixos-with-flakes/start-using-home-manager.md",
          },
          {
            text: "Modularisasi Konfigurasi",
            link: "/nixos-with-flakes/modularize-the-configuration.md",
          },
          {
            text: "Memperbarui Sistem",
            link: "/nixos-with-flakes/update-the-system.md",
          },
          {
            text: "Menurunkan atau Meningkatkan Paket",
            link: "/nixos-with-flakes/downgrade-or-upgrade-packages.md",
          },
          {
            text: "Tips Berguna Lainnya",
            link: "/nixos-with-flakes/other-useful-tips.md",
          },
        ],
      },
      {
        text: "Penggunaan Lanjutan Nixpkgs",
        items: [
          { text: "Pengenalan", link: "/nixpkgs/intro.md" },
          { text: "callPackage", link: "/nixpkgs/callpackage.md" },
          { text: "Overriding", link: "/nixpkgs/overriding.md" },
          { text: "Overlays", link: "/nixpkgs/overlays.md" },
          {
            text: "Beberapa Instance Nixpkgs",
            link: "/nixpkgs/multiple-nixpkgs.md",
          },
        ],
      },
      {
        text: "Nix Store & Binary Cache",
        items: [
          { text: "Pengenalan", link: "/nix-store/intro.md" },
          {
            text: "Tambahkan Server Binary Cache",
            link: "/nix-store/add-binary-cache-servers.md",
          },
          {
            text: "Host Server Binary Cache Anda Sendiri",
            link: "/nix-store/host-your-own-binary-cache-server.md",
          },
        ],
      },
      {
        text: "Praktik Terbaik",
        items: [
          { text: "Pengenalan", link: "/best-practices/intro.md" },
          {
            text: "Menjalankan binary yang diunduh di NixOS",
            link: "/best-practices/run-downloaded-binaries-on-nixos.md",
          },
          {
            text: "Menyederhanakan Perintah Terkait NixOS",
            link: "/best-practices/simplify-nixos-related-commands.md",
          },
          {
            text: "Mempercepat Debugging Dotfiles",
            link: "/best-practices/accelerating-dotfiles-debugging.md",
          },
          {
            text: "NIX_PATH dan Flake Registry Kustom",
            link: "/best-practices/nix-path-and-flake-registry.md",
          },
          {
            text: "Deployment Jarak Jauh",
            link: "/best-practices/remote-deployment.md",
          },
          {
            text: "Debugging Derivations dan Ekspresi Nix",
            link: "/best-practices/debugging.md",
          },
        ],
      },

      {
        text: "Penggunaan Lain dari Flakes",
        items: [
          { text: "Pengenalan", link: "/other-usage-of-flakes/intro.md" },
          {
            text: "Flake Inputs",
            link: "/other-usage-of-flakes/inputs.md",
          },
          {
            text: "Flake Outputs",
            link: "/other-usage-of-flakes/outputs.md",
          },
          {
            text: "CLI Baru",
            link: "/other-usage-of-flakes/the-new-cli.md",
          },
          {
            text: "Sistem Modul & Opsi Kustom",
            link: "/other-usage-of-flakes/module-system.md",
          },
          {
            text: "[WIP]Testing",
            link: "/other-usage-of-flakes/testing.md",
          },
        ],
      },
      {
        text: "Lingkungan Dev di NixOS",
        items: [
          {
            text: "nix shell, nix develop & pkgs.runCommand",
            link: "/development/intro.md",
          },
          {
            text: "Lingkungan Dev",
            link: "/development/dev-environments.md",
          },
          {
            text: "[WIP]Packaging 101",
            link: "/development/packaging-101.md",
          },
          {
            text: "Kompilasi Cross-platform",
            link: "/development/cross-platform-compilation.md",
          },
          {
            text: "Distributed Building",
            link: "/development/distributed-building.md",
          },
          {
            text: "[WIP]Pengembangan Kernel",
            link: "/development/kernel-development.md",
          },
        ],
      },
      {
        text: "Topik Lanjutan",
        items: [{ text: "Topik Lanjutan", link: "/advanced-topics/index.md" }],
      },
      {
        text: "Pertanyaan yang Sering Diajukan",
        items: [{ text: "Pertanyaan yang Sering Diajukan", link: "/faq/index.md" }],
      },
    ],
  },
})
