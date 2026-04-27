# Kemampuan kombinasi Flakes dan sistem modul Nixpkgs

## Penjelasan Struktur Modul Nixpkgs {#simple-introduction-to-nixpkgs-module-structure}

> Cara kerja detail sistem modul ini akan diperkenalkan di bagian [Modularizing NixOS Configuration](./modularize-the-configuration.md) berikutnya. Di sini, kita hanya akan membahas beberapa pengetahuan dasar.

Anda mungkin bertanya-tanya mengapa file konfigurasi `/etc/nixos/configuration.nix` mematuhi definisi Nixpkgs Module dan dapat direferensikan langsung dalam `flake.nix`.

Untuk memahami ini, kita perlu terlebih dahulu mempelajari asal usul sistem modul Nixpkgs dan tujuannya.

Semua kode implementasi NixOS disimpan dalam direktori [Nixpkgs/nixos](https://github.com/NixOS/nixpkgs/tree/master/nixos), dan sebagian besar kode sumber ini ditulis dalam bahasa Nix. Untuk menulis dan memelihara kode Nix dalam jumlah besar seperti itu, dan untuk memungkinkan pengguna secara fleksibel menyesuaikan berbagai fungsi sistem NixOS mereka, sistem modular untuk kode Nix sangat penting.

Sistem modular untuk kode Nix ini juga diimplementasikan dalam repositori Nixpkgs dan terutama digunakan untuk modularisasi konfigurasi sistem NixOS. Namun, ini juga banyak digunakan dalam konteks lain, seperti nix-darwin dan home-manager. Karena NixOS dibangun di atas sistem modular ini, wajar saja bahwa file konfigurasinya, termasuk `/etc/nixos/configuration.nix`, adalah Nixpkgs Modules.

Sebelum menyelami konten berikutnya, penting untuk memiliki pemahaman dasar tentang bagaimana sistem modul ini beroperasi.

Berikut adalah struktur sederhana dari Nixpkgs Module:

```nix
{lib, config, options, pkgs, ...}:
{
  # Mengimpor Modul lain
  imports = [
    # ...
    ./xxx.nix
  ];
  for.bar.enable = true;
  # Deklarasi opsi lainnya
  # ...
}
```

Definisinya sebenarnya adalah fungsi Nix, dan memiliki lima **parameter yang dihasilkan secara otomatis, disuntikkan secara otomatis, dan bebas deklarasi** yang disediakan oleh sistem modul:

1. `lib`: Library fungsi built-in yang disertakan dengan nixpkgs, menawarkan banyak fungsi praktis untuk mengoperasikan ekspresi Nix.
   - Untuk informasi lebih lanjut, lihat <https://nixos.org/manual/nixpkgs/stable/#id-1.4>.
2. `config`: Set semua nilai opsi dalam lingkungan saat ini, yang akan banyak digunakan di bagian berikutnya tentang sistem modul.
3. `options`: Set semua opsi yang didefinisikan dalam semua Modul di lingkungan saat ini.
4. `pkgs`: Koleksi yang berisi semua paket nixpkgs, bersama dengan beberapa fungsi utilitas terkait.
   - Pada tahap pemula, Anda dapat menganggap defaultnya sebagai `nixpkgs.legacyPackages.<system>` — di mana `<system>` adalah arsitektur mesin Anda (misalnya `x86_64-linux`), dan nilai `pkgs` dapat disesuaikan melalui opsi `nixpkgs.pkgs`.
5. `modulesPath`: Parameter yang hanya tersedia di NixOS, yang merupakan path yang menunjuk ke [nixpkgs/nixos/modules](https://github.com/NixOS/nixpkgs/tree/nixos-25.11/nixos/modules).
   - Ini didefinisikan di [nixpkgs - modulesPath].
   - Biasanya digunakan untuk mengimpor modul NixOS tambahan dan dapat ditemukan di sebagian besar file `hardware-configuration.nix` yang dihasilkan otomatis NixOS.

## Meneruskan Parameter Non-default ke Submodul {#pass-non-default-parameters-to-submodules}

Jika Anda perlu meneruskan parameter non-default lainnya ke submodul, Anda perlu menggunakan beberapa metode khusus untuk secara manual menentukan parameter non-default ini.

Sistem modul Nixpkgs menyediakan dua cara untuk meneruskan parameter non-default:

1. Parameter `specialArgs` dari fungsi `nixpkgs.lib.nixosSystem`
2. Menggunakan opsi `_module.args` di modul mana pun untuk meneruskan parameter

Dokumentasi resmi untuk kedua parameter ini terkubur dalam-dalam dan samar serta sulit dipahami. Jika pembaca tertarik, saya akan menyertakan link di sini:

1. `specialArgs`: Ada penyebutan yang tersebar terkait dengannya di NixOS Manual dan Nixpkgs Manual.
   - Nixpkgs Manual: [Module System - Nixpkgs]
   - NixOS Manual: [nixos manual - specialArgs]
2. `_module.args`:
   - NixOS Manual: [Appendix A. Configuration Options](https://nixos.org/manual/nixos/stable/options#opt-_module.args)
   - Source Code: [nixpkgs/nixos-25.11/lib/modules.nix - _module.args]

Singkatnya, `specialArgs` dan `_module.args` keduanya memerlukan attribute set sebagai nilainya, dan mereka melayani tujuan yang sama, meneruskan semua parameter dalam attribute set ke semua submodul. Perbedaan di antara mereka adalah:

1. Opsi `_module.args` dapat digunakan di modul mana pun untuk meneruskan parameter satu sama lain, yang lebih fleksibel daripada `specialArgs`, yang hanya dapat digunakan dalam fungsi `nixpkgs.lib.nixosSystem`.
2. `_module.args` dideklarasikan di dalam modul, jadi harus dievaluasi setelah semua modul telah dievaluasi sebelum dapat digunakan. Ini berarti bahwa **jika Anda menggunakan parameter yang diteruskan melalui `_module.args` di `imports = [ ... ];`, itu akan menghasilkan kesalahan `infinite recursion`**. Dalam kasus ini, Anda harus menggunakan `specialArgs` sebagai gantinya.

Saya pribadi lebih suka `specialArgs` karena lebih langsung dan lebih mudah digunakan, dan gaya penamaan `_xxx` membuatnya terasa seperti hal internal yang tidak cocok untuk digunakan dalam file konfigurasi pengguna.

Misalkan Anda ingin meneruskan dependensi tertentu ke submodul untuk digunakan. Anda dapat menggunakan parameter `specialArgs` untuk meneruskan `inputs` ke semua submodul:

```nix{11}
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    another-input.url = "github:username/repo-name/branch-name";
  };

  outputs = inputs@{ self, nixpkgs, another-input, ... }: {
    nixosConfigurations.my-nixos = nixpkgs.lib.nixosSystem {
      # Set semua parameter inputs sebagai argumen khusus untuk semua submodul,
      # sehingga Anda dapat langsung menggunakan semua dependensi di inputs dalam submodul
      specialArgs = { inherit inputs; };
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

Atau Anda dapat mencapai efek yang sama menggunakan opsi `_module.args`:

```nix{13}
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    another-input.url = "github:username/repo-name/branch-name";
  };
  outputs = inputs@{ self, nixpkgs, another-input, ... }: {
    nixosConfigurations.my-nixos = nixpkgs.lib.nixosSystem {
      modules = [
        ./configuration.nix
        {
          # Set semua parameter inputs sebagai argumen khusus untuk semua submodul,
          # sehingga Anda dapat langsung menggunakan semua dependensi di inputs dalam submodul
          _module.args = { inherit inputs; };
        }
      ];
    };
  };
}
```

Pilih salah satu dari dua metode di atas untuk memodifikasi konfigurasi Anda, dan kemudian Anda dapat menggunakan parameter `inputs` di `/etc/nixos/configuration.nix`. Sistem modul akan secara otomatis mencocokkan `inputs` yang didefinisikan dalam `specialArgs` dan menyuntikkannya ke semua submodul yang memerlukan parameter ini:

```nix{3}
# Nix akan mencocokkan berdasarkan nama dan secara otomatis menyuntikkan inputs
# dari specialArgs/_module.args ke parameter ketiga fungsi ini
{ config, pkgs, inputs, ... }:
{
  # ...
}
```

Bagian berikutnya akan mendemonstrasikan cara menggunakan `specialArgs`/`_module.args` untuk menginstal perangkat lunak sistem dari sumber flake lain.

## Menginstal Perangkat Lunak Sistem dari Sumber Flake Lain {#install-system-packages-from-other-flakes}

Kebutuhan paling umum untuk mengelola sistem adalah menginstal perangkat lunak, dan kami telah melihat di bagian sebelumnya cara menginstal paket dari repositori nixpkgs resmi menggunakan `environment.systemPackages`. Paket-paket ini semua berasal dari repositori nixpkgs resmi.

Sekarang, kita akan belajar cara menginstal paket perangkat lunak dari sumber flake lain, yang jauh lebih fleksibel daripada menginstal langsung dari nixpkgs. Kasus penggunaan utama adalah untuk menginstal versi terbaru dari perangkat lunak yang belum ditambahkan atau diperbarui di Nixpkgs.

Mengambil editor Helix sebagai contoh, berikut cara mengkompilasi dan menginstal branch master Helix secara langsung.

Pertama, tambahkan sumber data input helix ke `flake.nix`:

```nix{6,11,17}
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";

    # helix editor, gunakan branch master
    helix.url = "github:helix-editor/helix/master";
  };

  outputs = inputs@{ self, nixpkgs, ... }: {
    nixosConfigurations.my-nixos = nixpkgs.lib.nixosSystem {
      specialArgs = { inherit inputs; };
      modules = [
        ./configuration.nix

        # Modul ini bekerja sama dengan parameter `specialArgs` yang kita gunakan di atas
        # pilih salah satu dari dua metode untuk digunakan
        # { _module.args = { inherit inputs; };}
      ];
    };
  };
}
```

Selanjutnya, Anda dapat mereferensikan sumber data input flake ini di `configuration.nix`:

```nix{1,10}
{ config, pkgs, inputs, ... }:
{
  # ...
  environment.systemPackages = with pkgs; [
    git
    vim
    wget
    # Di sini, paket helix diinstal dari sumber data input helix
    inputs.helix.packages."${pkgs.stdenv.hostPlatform.system}".helix
  ];
  # ...
}
```

Lakukan perubahan yang diperlukan dan deploy dengan `sudo nixos-rebuild switch`. Deployment akan memakan waktu lebih lama kali ini karena Nix akan mengkompilasi seluruh program Helix dari sumber.

Setelah deployment, Anda dapat langsung menguji dan memverifikasi instalasi menggunakan perintah `hx` di terminal.

Selain itu, jika Anda hanya ingin mencoba versi terbaru Helix dan memutuskan apakah akan menginstalnya di sistem Anda nanti, ada cara yang lebih sederhana untuk melakukannya dalam satu perintah (tetapi seperti yang disebutkan sebelumnya, mengkompilasi dari sumber akan memakan waktu lama):

```bash
nix run github:helix-editor/helix/master
```

Kami akan membahas lebih detail tentang penggunaan `nix run` di bagian berikutnya [Usage of the New CLI](../other-usage-of-flakes/the-new-cli.md).

## Memanfaatkan Fitur dari Paket Flakes Lain

Sebenarnya, ini adalah fungsionalitas utama Flakes — sebuah flake dapat bergantung pada flakes lain, memungkinkannya untuk memanfaatkan fitur yang mereka sediakan. Ini mirip dengan bagaimana kita menggabungkan fungsionalitas dari library lain saat menulis program dalam TypeScript, Go, Rust, dan bahasa pemrograman lainnya.

Contoh di atas, menggunakan versi terbaru dari Flake Helix resmi, mengilustrasikan fungsionalitas ini. Lebih banyak kasus penggunaan akan dibahas nanti, dan berikut adalah beberapa contoh yang direferensikan untuk penyebutan di masa depan:

- [Getting Started with Home Manager](./start-using-home-manager.md): Ini memperkenalkan Home-Manager komunitas sebagai dependensi, memungkinkan pemanfaatan langsung fitur yang disediakan oleh Flake ini.
- [Downgrading or Upgrading Packages](./downgrade-or-upgrade-packages.md): Di sini, versi Nixpkgs yang berbeda diperkenalkan sebagai dependensi, memungkinkan pemilihan fleksibel paket dari berbagai versi Nixpkgs.

## Lebih Banyak Tutorial Flakes

Hingga titik ini, kita telah belajar cara menggunakan Flakes untuk mengkonfigurasi sistem NixOS. Jika Anda memiliki lebih banyak pertanyaan tentang Flakes atau ingin belajar lebih mendalam, silakan rujuk langsung ke dokumen resmi/semi-resmi berikut:

- Dokumentasi resmi Nix Flakes:
  - [Nix flakes - Nix Manual](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake)
  - [Flakes - nix.dev](https://nix.dev/concepts/flakes)
- Serangkaian tutorial oleh Eelco Dolstra (Pencipta Nix) tentang Flakes:
  - [Nix Flakes, Part 1: An introduction and tutorial (Eelco Dolstra, 2020)](https://www.tweag.io/blog/2020-05-25-flakes/)
  - [Nix Flakes, Part 2: Evaluation caching (Eelco Dolstra, 2020)](https://www.tweag.io/blog/2020-06-25-eval-cache/)
  - [Nix Flakes, Part 3: Managing NixOS systems (Eelco Dolstra, 2020)](https://www.tweag.io/blog/2020-07-31-nixos-flakes/)
- Dokumen berguna lainnya:
  - [Practical Nix Flakes](https://serokell.io/blog/practical-nix-flakes)

[nix flake - Nix Manual]:
  https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake#flake-inputs
[nixpkgs/flake.nix]: https://github.com/NixOS/nixpkgs/tree/nixos-25.11/flake.nix
[nixpkgs/nixos/lib/eval-config.nix]:
  https://github.com/NixOS/nixpkgs/tree/nixos-25.11/nixos/lib/eval-config.nix
[Module System - Nixpkgs]:
  https://github.com/NixOS/nixpkgs/blob/nixos-25.11/doc/module-system/module-system.chapter.md
[nixpkgs/nixos-25.11/lib/modules.nix - _module.args]:
  https://github.com/NixOS/nixpkgs/blob/nixos-25.11/lib/modules.nix#L122-L184
[nixos manual - specialArgs]:
  https://github.com/NixOS/nixpkgs/blob/nixos-25.11/nixos/doc/manual/development/option-types.section.md?plain=1#L283-L290
[nixpkgs - modulesPath]: https://github.com/NixOS/nixpkgs/blob/nixos-25.11/nixos/lib/eval-config-minimal.nix#L42
