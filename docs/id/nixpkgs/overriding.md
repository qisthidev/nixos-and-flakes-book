# Overriding

Di Nix, Anda dapat menyesuaikan paket Nix di `pkgs` dengan menggunakan fungsi `override`, yang memungkinkan Anda mendefinisikan parameter build custom dan mengembalikan derivation baru dengan nilai yang ditimpa. Mari kita lihat contohnya:

```nix
pkgs.fcitx5-rime.override { rimeDataPkgs = [ ./rime-data-flypy ]; }
```

Dalam contoh di atas, kita menimpa parameter `rimeDataPkgs` dari derivation `fcitx5-rime` untuk menggunakan paket custom yang disebut `rime-data-flypy`. Ini membuat derivation baru di mana `rimeDataPkgs` ditimpa, sementara parameter lain tetap tidak berubah.

Untuk mengetahui parameter mana dari paket tertentu yang dapat ditimpa, ada beberapa pendekatan yang dapat Anda ikuti:

1. Periksa kode sumber paket di repositori Nixpkgs di GitHub, seperti [`fcitx5-rime.nix`](https://github.com/NixOS/nixpkgs/blob/e4246ae1e7f78b7087dce9c9da10d28d3725025f/pkgs/tools/inputmethods/fcitx5/fcitx5-rime.nix). Pastikan untuk memilih branch yang sesuai, seperti `nixos-unstable`, jika Anda menggunakan branch tersebut.
2. Gunakan perintah `nix repl -f '<nixpkgs>'` untuk membuka Nix REPL dan kemudian masukkan `:e pkgs.fcitx5-rime`. Ini membuka kode sumber paket di editor default Anda, di mana Anda dapat melihat semua parameter paket. Untuk mempelajari penggunaan dasar `nix repl`, Anda dapat mengetik `:?` untuk melihat informasi bantuan.

Dengan menggunakan metode ini, Anda dapat menemukan parameter input paket dan menentukan mana yang dapat dimodifikasi menggunakan `override`.

Misalnya, mari kita lihat kode sumber [pkgs.hello]:

```nix
{ callPackage
, lib
, stdenv
, fetchurl
, nixos
, testers
, hello
}:

stdenv.mkDerivation (finalAttrs: {
  pname = "hello";
  version = "2.12.1";

  src = fetchurl {
    url = "mirror://gnu/hello/hello-${finalAttrs.version}.tar.gz";
    sha256 = "sha256-jZkUKv2SV28wsM18tCqNxoCZmLxdYH2Idh9RLibH2yA=";
  };

  doCheck = true;

  # ...
})
```

Dalam contoh ini, atribut `pname`, `version`, `src`, dan `doCheck` semuanya dapat ditimpa menggunakan `overrideAttrs`. Misalnya:

```nix
helloWithDebug = pkgs.hello.overrideAttrs (finalAttrs: previousAttrs: {
  doCheck = false;
});
```

Dalam kode di atas, kita menggunakan `overrideAttrs` untuk menimpa atribut `doCheck`, sementara membiarkan atribut lain tidak berubah.

Anda juga dapat menimpa beberapa atribut default yang didefinisikan dalam `stdenv.mkDerivation` menggunakan `overrideAttrs`. Misalnya:

```nix
helloWithDebug = pkgs.hello.overrideAttrs (finalAttrs: previousAttrs: {
  separateDebugInfo = true;
});
```

Dalam kasus ini, kita menimpa atribut `separateDebugInfo`, yang didefinisikan dalam `stdenv.mkDerivation`, bukan dalam kode sumber `hello`.

Untuk melihat semua atribut yang didefinisikan dalam `stdenv.mkDerivation`, Anda dapat memeriksa kode sumbernya dengan menggunakan `nix repl -f '<nixpkgs>'` dan memasukkan `:e stdenv.mkDerivation`.

Ini akan membuka kode sumber di editor default Anda. Jika Anda baru menggunakan `nix repl`, Anda dapat mengetik `:?` untuk melihat informasi bantuan.

## Referensi

- [Chapter 4. Overriding - nixpkgs Manual](https://nixos.org/manual/nixpkgs/stable/#chap-overrides)

[pkgs.hello]: https://github.com/NixOS/nixpkgs/blob/nixos-25.11/pkgs/applications/misc/hello/default.nix
