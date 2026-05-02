# Menjalankan Biner yang Diunduh di NixOS

Karena NixOS tidak ketat mengikuti Filesystem Hierarchy Standard (FHS), biner yang diunduh dari internet mungkin tidak berfungsi langsung di NixOS. Namun, ada berbagai metode yang tersedia untuk membuatnya berfungsi dengan baik.

Untuk panduan komprehensif yang menyajikan sepuluh pendekatan berbeda untuk menjalankan biner yang diunduh di NixOS, saya merekomendasikan membaca artikel [Different methods to run a non-nixos executable on Nixos](https://unix.stackexchange.com/questions/522822/different-methods-to-run-a-non-nixos-executable-on-nixos) dan lihat [nix-alien](https://github.com/thiagokokada/nix-alien). Atau jika Anda familiar dengan Docker, menjalankan biner dalam container Docker juga merupakan pilihan yang baik.

Di antara metode-metode ini, saya secara pribadi lebih suka membuat lingkungan FHS untuk menjalankan biner, karena terbukti nyaman dan mudah digunakan. Untuk mengatur lingkungan seperti itu, Anda dapat menambahkan kode berikut ke salah satu modul Nix Anda:

```nix
{ config, pkgs, lib, ... }:

{
  # ......omit many configurations

  environment.systemPackages = with pkgs; [
    # ......omit many packages

    # Buat lingkungan FHS menggunakan perintah `fhs`, memungkinkan eksekusi paket non-NixOS di NixOS!
    (let base = pkgs.appimageTools.defaultFhsEnvArgs; in
      pkgs.buildFHSEnv (base // {
      name = "fhs";
      targetPkgs = pkgs:
        # pkgs.buildFHSEnv hanya menyediakan lingkungan FHS minimal,
        # kurang banyak paket dasar yang dibutuhkan oleh sebagian besar perangkat lunak.
        # Oleh karena itu, kita perlu menambahkannya secara manual.
        #
        # pkgs.appimageTools menyediakan paket dasar yang diperlukan oleh sebagian besar perangkat lunak.
        (base.targetPkgs pkgs) ++ (with pkgs; [
          pkg-config
          ncurses
          # Silakan tambahkan lebih banyak paket di sini jika diperlukan.
        ]
      );
      profile = "export FHS=1";
      runScript = "bash";
      extraOutputsToInstall = ["dev"];
    }))
  ];

  # ......omit many configurations
}
```

Setelah men-deploy konfigurasi ini, Anda dapat menggunakan perintah `fhs` untuk membuka shell FHS, dan kemudian Anda dapat menjalankan biner yang diunduh di dalam shell ini.
