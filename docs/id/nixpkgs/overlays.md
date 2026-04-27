# Overlays

Di bagian sebelumnya, kita belajar tentang menimpa derivation dengan `pkgs.xxx.override { ... }` atau `pkgs.xxx.overrideAttrs (finalAttrs: previousAttrs: { ... });`. Namun, pendekatan ini akan menghasilkan derivation baru dan tidak memodifikasi derivation asli dalam instance `pkgs`. Jika derivation yang ingin Anda timpa juga digunakan oleh paket Nix lain, mereka akan tetap menggunakan derivation yang tidak dimodifikasi.

Untuk memodifikasi derivation secara global dalam instance nixpkgs default, Nix menyediakan fitur yang disebut "overlays".

Dalam lingkungan Nix tradisional, overlays dapat dikonfigurasi secara global menggunakan file `~/.config/nixpkgs/overlays.nix` atau `~/.config/nixpkgs/overlays/*.nix`. Namun, dengan fitur Flakes, untuk memastikan reprodusibilitas sistem, overlays tidak dapat mengandalkan konfigurasi di luar repositori Git.

Saat menggunakan `flake.nix` untuk mengkonfigurasi NixOS, baik Home Manager maupun NixOS menyediakan opsi `nixpkgs.overlays` untuk mendefinisikan overlays. Anda dapat merujuk ke dokumentasi berikut untuk detail lebih lanjut:

- [Home Manager docs - `nixpkgs.overlays`](https://nix-community.github.io/home-manager/options.xhtml#opt-nixpkgs.overlays)
- [Nixpkgs source code - `nixpkgs.overlays`](https://github.com/NixOS/nixpkgs/blob/30d7dd7e7f2cba9c105a6906ae2c9ed419e02f17/nixos/modules/misc/nixpkgs.nix#L169)

Mari kita lihat contoh modul yang memuat overlays. Modul ini dapat digunakan sebagai modul Home Manager atau modul NixOS, karena definisinya sama:

```nix
# ./overlays/default.nix
{ config, pkgs, lib, ... }:

{
  nixpkgs.overlays = [
    # Overlay 1: Gunakan `self` dan `super` untuk mengekspresikan
    # hubungan inheritance
    (self: super: {
      google-chrome = super.google-chrome.override {
        commandLineArgs =
          "--proxy-server='https=127.0.0.1:3128;http=127.0.0.1:3128'";
      };
    })

    # Overlay 2: Gunakan `final` dan `prev` untuk mengekspresikan
    # hubungan antara yang baru dan yang lama
    (final: prev: {
      steam = prev.steam.override {
        extraPkgs = pkgs: with pkgs; [
          keyutils
          libkrb5
          libpng
          libpulseaudio
          libvorbis
          stdenv.cc.cc.lib
          xorg.libXcursor
          xorg.libXi
          xorg.libXinerama
          xorg.libXScrnSaver
        ];
        extraProfile = "export GDK_SCALE=2";
      };
    })

    # Overlay 3: Definisikan overlays dalam file lain
    # Konten ./overlays/overlay3/default.nix sama seperti di atas:
    # `(final: prev: { xxx = prev.xxx.override { ... }; })`
    (import ./overlay3)
  ];
}
```

Dalam contoh di atas, kami mendefinisikan tiga overlays.

1. Overlay 1 memodifikasi derivation `google-chrome` dengan menambahkan argumen command-line untuk server proxy.
2. Overlay 2 memodifikasi derivation `steam` dengan menambahkan paket ekstra dan variabel lingkungan.
3. Overlay 3 didefinisikan dalam file terpisah `./overlays/overlay3/default.nix`.

Salah satu contoh mengimpor konfigurasi di atas sebagai modul NixOS adalah sebagai berikut:

```nix
# ./flake.nix
{
  inputs = {
    # ...
  };

  outputs = inputs@{ nixpkgs, ... }: {
    nixosConfigurations = {
      my-nixos = nixpkgs.lib.nixosSystem {
        modules = [
          ./configuration.nix

          # import the module that contains overlays
          (import ./overlays)
        ];
      };
    };
  };
}
```

Ini hanya contoh. Silakan tulis overlays Anda sendiri sesuai kebutuhan Anda.

## Multiple nixpkgs Instances with different Overlays

`nixpkgs.overlays = [...];` yang disebutkan di atas langsung memodifikasi instance nixpkgs global `pkgs`. Jika overlays Anda membuat perubahan pada beberapa paket tingkat rendah, itu mungkin berdampak pada modul lain. Salah satu kelemahan adalah peningkatan kompilasi lokal (karena invalidasi cache), dan mungkin juga ada masalah fungsionalitas dengan paket yang terpengaruh.

Jika Anda ingin memanfaatkan overlays hanya di lokasi tertentu tanpa mempengaruhi instance nixpkgs default, Anda dapat membuat instance nixpkgs baru dan menerapkan overlays Anda padanya. Kami akan membahas cara melakukan ini di bagian berikutnya [The Ingenious Uses of Multiple nixpkgs Instances](./multiple-nixpkgs.md).

## Referensi

- [Chapter 3. Overlays - nixpkgs Manual](https://nixos.org/manual/nixpkgs/stable/#chap-overlays)
