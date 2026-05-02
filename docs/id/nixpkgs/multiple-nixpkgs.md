# Penggunaan Cerdik dari Multiple nixpkgs Instances

Di bagian [Downgrade or Upgrade Packages](../nixos-with-flakes/downgrade-or-upgrade-packages.md), kita telah melihat cara membuat instance multiple nixpkgs yang berbeda menggunakan metode `import nixpkgs {...}`, dan menggunakannya di submodul mana pun melalui `specialArgs`. Ada banyak aplikasi untuk teknik ini, beberapa yang umum meliputi:

1. Membuat instance nixpkgs dengan commit ID berbeda untuk menginstal berbagai versi paket perangkat lunak. Pendekatan ini digunakan di bagian sebelumnya [Downgrade or Upgrade Packages](../nixos-with-flakes/downgrade-or-upgrade-packages.md).

2. Jika Anda ingin memanfaatkan overlays tanpa mempengaruhi instance nixpkgs default, Anda dapat membuat instance nixpkgs baru dan menerapkan overlays padanya.

   - `nixpkgs.overlays = [...];` yang disebutkan di bagian sebelumnya tentang Overlays langsung memodifikasi instance nixpkgs global. Jika overlays Anda membuat perubahan pada beberapa paket tingkat rendah, itu mungkin berdampak pada modul lain. Salah satu kelemahan adalah peningkatan kompilasi lokal (karena invalidasi cache), dan mungkin juga ada masalah fungsionalitas dengan paket yang terpengaruh.

3. Dalam kompilasi lintas-arsitektur sistem, Anda dapat membuat instance nixpkgs multiple untuk secara selektif menggunakan simulasi QEMU untuk kompilasi dan cross-compilation di lokasi yang berbeda, atau untuk menambahkan berbagai parameter kompilasi GCC.

Kesimpulannya, membuat instance nixpkgs multiple sangat menguntungkan.

## Membuat instance `nixpkgs`

Mari kita pertama-tama memahami cara membuat instance nixpkgs non-global. Sintaks yang paling umum adalah sebagai berikut:

```nix
{
  # contoh sederhana
  pkgs-xxx = import nixpkgs {
    # seperti yang kita katakan sebelumnya, `system` atau `localSystem` diperlukan di sini.
    system = "x86_64-linux";
  };

  # nixpkgs dengan overlays custom
  pkgs-yyy = import nixpkgs {
    system = "x86_64-linux";

    overlays = [
      (self: super: {
        google-chrome = super.google-chrome.override {
          commandLineArgs =
            "--proxy-server='https=127.0.0.1:3128;http=127.0.0.1:3128'";
        };
        # ... overlays lainnya
      })
    ];
  };

  # contoh yang lebih kompleks (cross-compiling)
  pkgs-zzz = import nixpkgs {
    localSystem = "x86_64-linux";
    crossSystem = {
      config = "riscv64-unknown-linux-gnu";

      # https://wiki.nixos.org/wiki/Build_flags
      # opsi ini sama dengan menambahkan `-march=rv64gc` ke CFLAGS.
      # CFLAGS akan digunakan sebagai argumen command line untuk gcc/clang.
      gcc.arch = "rv64gc";
      # setara dengan `-mabi=lp64d` di CFLAGS.
      gcc.abi = "lp64d";
    };

    overlays = [
      (self: super: {
        google-chrome = super.google-chrome.override {
          commandLineArgs =
            "--proxy-server='https=127.0.0.1:3128;http=127.0.0.1:3128'";
        };
        # ... overlays lainnya
      })
    ];
  };
}
```

Kita telah belajar dalam studi sintaks Nix kita:

> Ekspresi `import` mengambil path ke file Nix lain sebagai argumen dan mengembalikan hasil eksekusi dari file Nix tersebut. Jika argumen untuk `import` adalah path folder, ia mengembalikan hasil eksekusi file `default.nix` di dalam folder tersebut.

`nixpkgs` adalah flake dengan file `default.nix` di direktori root-nya. Jadi, `import nixpkgs` pada dasarnya mengembalikan hasil eksekusi [nixpkgs/default.nix]. Dimulai dari file ini, Anda dapat menemukan bahwa implementasi `import nixpkgs` ada di [pkgs/top-level/impure.nix], seperti yang dikutip di bawah ini:

```nix
# ... skipping some lines

{ # We put legacy `system` into `localSystem` if `localSystem` was not passed.
  # If neither is passed, assume we are building packages on the current
  # (build, in GNU Autotools parlance) platform.
  localSystem ? { system = args.system or builtins.currentSystem; }

# These are needed only because nix's `--arg` command-line logic doesn't work
# with unnamed parameters allowed by ...
, system ? localSystem.system
, crossSystem ? localSystem

, # Fallback: The contents of the configuration file found at $NIXPKGS_CONFIG or
  # $HOME/.config/nixpkgs/config.nix.
  config ? let
  # ... skipping some lines

, # Overlays are used to extend Nixpkgs collection with additional
  # collections of packages.  These collection of packages are part of the
  # fix-point made by Nixpkgs.
  overlays ? let
  # ... skipping some lines

, crossOverlays ? []

, ...
} @ args:

# If `localSystem` was explicitly passed, legacy `system` should
# not be passed, and vice versa.
assert args ? localSystem -> !(args ? system);
assert args ? system -> !(args ? localSystem);

import ./. (builtins.removeAttrs args [ "system" ] // {
  inherit config overlays localSystem;
})
```

Oleh karena itu, `import nixpkgs {...}` secara efektif memanggil fungsi ini, dan attribute set berikutnya menjadi argumen untuk fungsi ini.

## Pertimbangan

Saat membuat instance nixpkgs multiple, ada beberapa detail yang perlu diingat. Berikut adalah beberapa masalah umum yang perlu dipertimbangkan:

1. Menurut artikel [1000 instances of nixpkgs](https://discourse.nixos.org/t/1000-instances-of-nixpkgs/17347) yang dibagikan oleh @fbewivpjsbsby, bukan praktik yang baik untuk menggunakan `import` untuk menyesuaikan `nixpkgs` dalam submodul atau sub-flakes. Ini karena setiap `import` mengevaluasi secara terpisah, membuat instance nixpkgs baru setiap kali. Seiring pertumbuhan jumlah konfigurasi, ini dapat menyebabkan waktu build lebih lama dan penggunaan memori lebih tinggi. Oleh karena itu, disarankan untuk membuat semua instance nixpkgs dalam file `flake.nix`.

2. Saat mencampur simulasi QEMU dan cross-compilation, harus berhati-hati untuk menghindari duplikasi kompilasi paket yang tidak perlu.

[nixpkgs/default.nix]: https://github.com/NixOS/nixpkgs/blob/nixos-25.11/default.nix
[pkgs/top-level/impure.nix]: https://github.com/NixOS/nixpkgs/blob/nixos-25.11/pkgs/top-level/impure.nix
