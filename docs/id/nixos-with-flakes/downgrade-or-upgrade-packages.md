# Menurunkan atau Meningkatkan Versi Paket

Saat bekerja dengan Flakes, Anda mungkin menghadapi situasi di mana Anda perlu menurunkan atau meningkatkan paket tertentu untuk mengatasi bug atau masalah kompatibilitas. Dalam Flakes, versi paket dan nilai hash terkait langsung dengan commit git dari input flake mereka. Untuk memodifikasi versi paket, Anda perlu mengunci commit git dari input flake.

Berikut adalah contoh bagaimana Anda dapat menambahkan beberapa input nixpkgs, masing-masing menggunakan commit atau branch git yang berbeda:

```nix{8-13,19-20,27-42}
{
  description = "NixOS configuration of Ryan Yin";

  inputs = {
    # Default ke branch nixos-unstable
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    # Branch stabil terbaru dari nixpkgs, digunakan untuk rollback versi
    # Versi terbaru saat ini adalah 25.11
    nixpkgs-stable.url = "github:nixos/nixpkgs/nixos-25.11";

    # Anda juga dapat menggunakan hash commit git tertentu untuk mengunci versi
    nixpkgs-fd40cef8d.url = "github:nixos/nixpkgs/fd40cef8d797670e203a27a91e4b8e6decf0b90c";
  };

  outputs = inputs@{
    self,
    nixpkgs,
    nixpkgs-stable,
    nixpkgs-fd40cef8d,
    ...
  }: {
    nixosConfigurations = {
      my-nixos = nixpkgs.lib.nixosSystem {
        # Parameter `specialArgs` meneruskan
        # instance nixpkgs non-default ke modul nix lainnya
        specialArgs = let
          system = "x86_64-linux";
        in {
          # Untuk menggunakan paket dari nixpkgs-stable,
          # kita konfigurasikan beberapa parameter terlebih dahulu
          pkgs-stable = import nixpkgs-stable {
            inherit system;
            # Untuk menggunakan Chrome, kita perlu mengizinkan
            # instalasi perangkat lunak non-free.
            config.allowUnfree = true;
          };
          pkgs-fd40cef8d = import nixpkgs-fd40cef8d {
            inherit system;
            config.allowUnfree = true;
          };
        };

        modules = [
          ./hosts/my-nixos

          # Omit konfigurasi lainnya...
        ];
      };
    };
  };
}
```

> **CATATAN**: Saat menggunakan `import nixpkgs { ... }` Anda harus menyediakan `system` atau `localSystem` untuk menentukan arsitektur target; ini berbeda dari mendefinisikan konfigurasi NixOS dengan `nixpkgs.lib.nixosSystem`.
> Yang terakhir sudah memiliki `nixpkgs.hostPlatform` yang diatur dalam `hardware-configuration.nix` yang dihasilkan, sedangkan `import nixpkgs { ... }` yang baru membuat instance baru yang tidak mewarisi nilai tersebut.

Dalam contoh di atas, kami telah mendefinisikan beberapa input nixpkgs: `nixpkgs`, `nixpkgs-stable`, dan `nixpkgs-fd40cef8d`. Setiap input sesuai dengan commit atau branch git yang berbeda.

Selanjutnya, Anda dapat merujuk ke paket dari `pkgs-stable` atau `pkgs-fd40cef8d` di dalam submodul Anda. Berikut adalah contoh submodul Home Manager:

```nix{4-7,13,25}
{
  pkgs,
  config,
  # Nix akan mencari dan menyuntikkan parameter ini
  # dari `specialArgs` di `flake.nix`
  pkgs-stable,
  # pkgs-fd40cef8d,
  ...
}:

{
  # Gunakan paket dari `pkgs-stable` alih-alih `pkgs`
  home.packages = with pkgs-stable; [
    firefox-wayland

    # Dukungan Chrome Wayland rusak di branch nixos-unstable,
    # jadi kami fallback ke branch stabil untuk saat ini.
    # Referensi: https://github.com/swaywm/sway/issues/7562
    google-chrome
  ];

  programs.vscode = {
    enable = true;
    # Rujuk vscode dari `pkgs-stable` alih-alih `pkgs`
    package = pkgs-stable.vscode;
  };
}
```

## Mengunci versi paket dengan overlay

Pendekatan di atas sempurna untuk paket aplikasi, tetapi kadang-kadang Anda perlu mengganti library yang digunakan oleh paket-paket tersebut. Di sinilah [Overlays](../nixpkgs/overlays.md) bersinar! Overlays dapat mengedit atau mengganti atribut apa pun dari paket, tetapi untuk saat ini kita hanya akan mengunci paket ke versi nixpkgs yang berbeda. Kelemahan utama mengedit dependensi dengan overlay adalah instalasi Nix Anda akan mengkompilasi ulang semua paket yang terpasang yang bergantung padanya, tetapi situasi Anda mungkin memerlukannya untuk perbaikan bug tertentu.

```nix
# overlays/mesa.nix
{ config, pkgs, lib, pkgs-fd40cef8d, ... }:
{
  nixpkgs.overlays = [
    # Overlay: Gunakan `self` dan `super` untuk mengekspresikan
    # hubungan inheritance
    (self: super: {
      mesa = pkgs-fd40cef8d.mesa;
    })
  ];
}
```

## Menerapkan konfigurasi baru

Dengan menyesuaikan konfigurasi seperti yang ditunjukkan di atas, Anda dapat men-deploy-nya menggunakan `sudo nixos-rebuild switch`. Ini akan menurunkan versi Firefox/Chrome/VSCode Anda ke yang sesuai dengan `nixpkgs-stable` atau `nixpkgs-fd40cef8d`.

> Menurut [1000 instances of nixpkgs](https://discourse.nixos.org/t/1000-instances-of-nixpkgs/17347), bukan praktik yang baik menggunakan `import` dalam submodul atau sub-flakes untuk menyesuaikan `nixpkgs`. Setiap `import` mengevaluasi secara terpisah, membuat instance nixpkgs baru setiap kali. Seiring pertumbuhan konfigurasi, ini dapat menyebabkan waktu build lebih lama dan penggunaan memori lebih tinggi. Untuk menghindari masalah ini, kami membuat semua instance nixpkgs di file `flake.nix`.
