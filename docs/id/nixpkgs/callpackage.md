# `pkgs.callPackage`

`pkgs.callPackage` digunakan untuk parameterisasi konstruksi Nix Derivation. Untuk memahami tujuannya, pertama-tama mari kita pertimbangkan bagaimana kita akan mendefinisikan paket Nix (juga dikenal sebagai Derivation) tanpa menggunakan `pkgs.callPackage`.

## 1. Tanpa `pkgs.callPackage`

Kita dapat mendefinisikan paket Nix menggunakan kode seperti ini:

```nix
pkgs.writeShellScriptBin "hello" ''echo "hello, ryan!"''
```

Untuk memverifikasi ini, Anda dapat menggunakan `nix repl`, dan Anda akan melihat bahwa hasilnya memang sebuah Derivation:

```shell
› nix repl -f '<nixpkgs>'
Welcome to Nix 2.13.5. Type :? for help.

Loading installable ''...
Added 19203 variables.

nix-repl> pkgs.writeShellScriptBin "hello" '' echo "hello, xxx!" ''
«derivation /nix/store/zhgar12vfhbajbchj36vbbl3mg6762s8-hello.drv»
```

Meskipun definisi Derivation ini cukup ringkas, sebagian besar Derivation di nixpkgs jauh lebih kompleks. Di bagian sebelumnya, kami memperkenalkan dan secara ekstensif menggunakan metode `import xxx.nix` untuk mengimpor ekspresi Nix dari file Nix lain, yang dapat meningkatkan maintainability kode.

1. Untuk meningkatkan maintainability, Anda dapat menyimpan definisi Derivation dalam file terpisah, misalnya `hello.nix`.
   1. Namun, konteks dalam `hello.nix` itu sendiri tidak termasuk variabel `pkgs`, jadi Anda perlu memodifikasi kontennya untuk meneruskan `pkgs` sebagai parameter ke `hello.nix`.
2. Di tempat di mana Anda perlu menggunakan Derivation ini, Anda dapat menggunakan `import ./hello.nix pkgs` untuk mengimpor `hello.nix` dan menggunakan `pkgs` sebagai parameter untuk mengeksekusi fungsi yang didefinisikan di dalamnya.

Mari kita lanjutkan memverifikasi ini menggunakan `nix repl`, dan Anda akan melihat bahwa hasilnya masih sebuah Derivation:

```shell
› cat hello.nix
pkgs:
  pkgs.writeShellScriptBin "hello" '' echo "hello, xxx!" ''

› nix repl -f '<nixpkgs>'
Welcome to Nix 2.13.5. Type :? for help.

warning: Nix search path entry '/nix/var/nix/profiles/per-user/root/channels' does not exist, ignoring
Loading installable ''...
Added 19203 variables.

nix-repl> import ./hello.nix pkgs
«derivation /nix/store/zhgar12vfhbajbchj36vbbl3mg6762s8-hello.drv»
```

## 2. Menggunakan `pkgs.callPackage`

Dalam contoh sebelumnya tanpa `pkgs.callPackage`, kita langsung meneruskan `pkgs` sebagai parameter ke `hello.nix`. Namun, pendekatan ini memiliki beberapa kelemahan:

1. Semua dependensi lain dari Derivation `hello` terikat erat dengan `pkgs`.
   1. Jika kita memerlukan dependensi custom, kita harus memodifikasi `pkgs` atau konten `hello.nix`, yang bisa merepotkan.
2. Dalam kasus di mana `hello.nix` menjadi kompleks, sulit untuk menentukan Derivation mana dari `pkgs` yang diandalkannya, membuatnya sulit untuk menganalisis dependensi antar Derivation.

`pkgs.callPackage`, sebagai alat untuk parameterisasi konstruksi Derivation, mengatasi masalah-masalah ini. Mari kita lihat kode sumber dan komentarnya [nixpkgs/lib/customisation.nix#L101-L121](https://github.com/NixOS/nixpkgs/blob/fe138d3/lib/customisation.nix#L101-L121):

```nix
  /* Call the package function in the file `fn` with the required
    arguments automatically.  The function is called with the
    arguments `args`, but any missing arguments are obtained from
    `autoArgs`.  This function is intended to be partially
    parameterised, e.g.,

      callPackage = callPackageWith pkgs;
      pkgs = {
        libfoo = callPackage ./foo.nix { };
        libbar = callPackage ./bar.nix { };
      };

    If the `libbar` function expects an argument named `libfoo`, it is
    automatically passed as an argument.  Overrides or missing
    arguments can be supplied in `args`, e.g.

      libbar = callPackage ./bar.nix {
        libfoo = null;
        enableX11 = true;
      };
  */
  callPackageWith = autoArgs: fn: args:
    let
      f = if lib.isFunction fn then fn else import fn;
      fargs = lib.functionArgs f;

      # All arguments that will be passed to the function
      # This includes automatic ones and ones passed explicitly
      allArgs = builtins.intersectAttrs fargs autoArgs // args;

    # ......
```

Pada dasarnya, `pkgs.callPackage` digunakan sebagai `pkgs.callPackage fn args`, di mana placeholder `fn` adalah file Nix atau fungsi, dan `args` adalah attribute set. Berikut cara kerjanya:

1. `pkgs.callPackage fn args` pertama-tama memeriksa apakah `fn` adalah fungsi atau file. Jika itu file, ia mengimpor fungsi yang didefinisikan di dalamnya.
   1. Setelah langkah ini, Anda memiliki fungsi, biasanya dengan parameter seperti `lib`, `stdenv`, `fetchurl`, dan mungkin beberapa parameter custom.
2. Selanjutnya, `pkgs.callPackage fn args` menggabungkan `args` dengan attribute set `pkgs`. Jika ada konflik, parameter di `args` akan menimpa yang ada di `pkgs`.
3. Kemudian, `pkgs.callPackage fn args` mengekstrak parameter fungsi `fn` dari attribute set yang digabungkan dan menggunakannya untuk mengeksekusi fungsi.
4. Hasil eksekusi fungsi adalah Derivation, yaitu paket Nix.

Apa yang bisa menjadi file Nix atau fungsi, digunakan sebagai argumen untuk `pkgs.callPackage`, terlihat seperti apa? Anda dapat memeriksa contoh yang telah kami gunakan sebelumnya di [Nixpkgs's Advanced Usage - Introduction](./intro.md): `hello.nix`, `fcitx5-rime.nix`, `vscode/with-extensions.nix`, dan `firefox/common.nix`. Semuanya dapat diimpor menggunakan `pkgs.callPackage`.

Misalnya, jika Anda telah mendefinisikan konfigurasi kernel NixOS custom di `kernel.nix` dan membuat nama branch development dan kode sumber kernel dapat dikonfigurasi:

```nix
{
  lib,
  stdenv,
  linuxManualConfig,

  src,
  boardName,
  ...
}:
(linuxManualConfig {
  version = "5.10.113-thead-1520";
  modDirVersion = "5.10.113";

  inherit src lib stdenv;

  # file path to the generated kernel config file(the `.config` generated by make menuconfig)
  #
  # here is a special usage to generate a file path from a string
  configfile = ./. + "${boardName}_config";

  allowImportFromDerivation = true;
})
```

Anda dapat menggunakan `pkgs.callPackage ./hello.nix {}` di modul Nix mana pun untuk mengimpor dan menggunakannya, mengganti parameter apa pun sesuai kebutuhan:

```nix
{ lib, pkgs, pkgsKernel, kernel-src, ... }:

{
  # ......

  boot = {
    # ......
    kernelPackages = pkgs.linuxPackagesFor (pkgs.callPackage ./pkgs/kernel {
        src = kernel-src;  # kernel source is passed as a `specialArgs` and injected into this module.
        boardName = "licheepi4a";  # the board name, used to generate the kernel config file path.
    });

  # ......
}
```

Seperti ditunjukkan di atas, dengan menggunakan `pkgs.callPackage`, Anda dapat meneruskan `src` dan `boardName` yang berbeda ke fungsi yang didefinisikan di `kernel.nix`, untuk menghasilkan paket kernel yang berbeda. Ini memungkinkan Anda menyesuaikan `kernel.nix` yang sama ke kode sumber kernel yang berbeda dan development board.

Keuntungan dari `pkgs.callPackage` adalah:

1. Definisi derivation diparameterisasi, dan semua dependensi Derivation adalah parameter fungsi dalam definisinya. Ini memudahkan untuk menganalisis dependensi antar Derivation.
2. Semua dependensi dan parameter custom lainnya dari Derivation dapat dengan mudah diganti dengan menggunakan parameter kedua dari `pkgs.callPackage`, sangat meningkatkan reusabilitas Derivation.
3. Sambil mencapai dua fungsi di atas, ini tidak meningkatkan kompleksitas kode, karena semua dependensi di `pkgs` dapat secara otomatis disuntikkan.

Jadi selalu disarankan untuk menggunakan `pkgs.callPackage` untuk mendefinisikan Derivation.

## Referensi

- [Chapter 13. Callpackage Design Pattern - Nix Pills](https://nixos.org/guides/nix-pills/callpackage-design-pattern.html)
- [callPackage, a tool for the lazy - The Summer of Nix](https://summer.nixos.org/blog/callpackage-a-tool-for-the-lazy/)
- [Document what callPackage does and its preconditions - Nixpkgs Issues](https://github.com/NixOS/nixpkgs/issues/36354)
