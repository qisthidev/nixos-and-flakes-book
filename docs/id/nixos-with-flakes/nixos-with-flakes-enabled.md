# Mengaktifkan NixOS dengan Flakes

Dibandingkan dengan metode konfigurasi default yang saat ini digunakan di NixOS, Flakes menawarkan reprodusibilitas yang lebih baik. Definisi struktur paketnya yang jelas secara inheren mendukung dependensi pada repositori Git lain, memfasilitasi berbagi kode. Oleh karena itu, buku ini menyarankan menggunakan Flakes untuk mengelola konfigurasi sistem.

Bagian ini menjelaskan cara menggunakan Flakes untuk mengelola konfigurasi sistem NixOS, dan **Anda tidak perlu tahu apa pun tentang Flakes sebelumnya**.

## Mengaktifkan Dukungan Flakes untuk NixOS {#enable-nix-flakes}

Saat ini, Flakes masih merupakan fitur eksperimental dan tidak diaktifkan secara default. Kita perlu memodifikasi file `/etc/nixos/configuration.nix` secara manual untuk mengaktifkan fitur Flakes dan alat command-line nix baru yang menyertainya:

```nix{12,16}
{ config, pkgs, ... }:

{
  imports = [
    # Include the results of the hardware scan.
    ./hardware-configuration.nix
  ];

  # ......

  # Enable the Flakes feature and the accompanying new nix command-line tool
  nix.settings.experimental-features = [ "nix-command" "flakes" ];
  environment.systemPackages = with pkgs; [
    # Flakes clones its dependencies through the git command,
    # so git must be installed first
    git
    vim
    wget
  ];
  # Set the default editor to vim
  environment.variables.EDITOR = "vim";

  # ......
}
```

Setelah membuat perubahan ini, jalankan `sudo nixos-rebuild switch` untuk menerapkan modifikasi. Kemudian, Anda dapat menggunakan fitur Flakes untuk mengelola konfigurasi sistem Anda.

Alat command-line nix baru juga menawarkan beberapa fitur yang nyaman. Misalnya, Anda sekarang dapat menggunakan perintah `nix repl` untuk membuka lingkungan interaktif nix. Jika Anda tertarik, Anda dapat menggunakannya untuk meninjau dan menguji semua sintaks Nix yang telah Anda pelajari sebelumnya.

## Beralih Konfigurasi Sistem ke `flake.nix` {#switch-to-flake-nix}

Setelah mengaktifkan fitur Flakes, perintah `sudo nixos-rebuild switch` akan memprioritaskan pembacaan file `/etc/nixos/flake.nix`, dan jika tidak ditemukan, akan mencoba menggunakan `/etc/nixos/configuration.nix`.

Anda dapat mulai dengan menggunakan template resmi untuk belajar cara menulis flake. Pertama, periksa template apa yang tersedia:

```bash
nix flake show templates
```

Di antaranya, template `templates#full` mendemonstrasikan semua penggunaan yang mungkin. Lihat kontennya:

```bash
nix flake init -t templates#full
cat flake.nix
```

Merujuk pada template ini, buat file `/etc/nixos/flake.nix` dan tulis konten konfigurasi. Semua modifikasi sistem berikutnya akan diambil alih oleh Nix Flakes. Berikut adalah contoh kontennya:

```nix{15}
{
  description = "A simple NixOS flake";

  inputs = {
    # NixOS official package source, using the nixos-25.11 branch here
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  };

  outputs = { self, nixpkgs, ... }@inputs: {
    # Please replace my-nixos with your hostname
    nixosConfigurations.my-nixos = nixpkgs.lib.nixosSystem {
      modules = [
        # Import the previous configuration.nix we used,
        # so the old configuration file still takes effect
        ./configuration.nix
      ];
    };
  };
}
```

Di sini kita mendefinisikan sistem bernama `my-nixos`, dengan file konfigurasinya terletak di `/etc/nixos/` sebagai `./configuration.nix`. Ini berarti kita masih menggunakan konfigurasi lama.

Sekarang, ketika Anda menjalankan `sudo nixos-rebuild switch` untuk menerapkan konfigurasi, sistem seharusnya tidak berubah sama sekali karena kita hanya beralih menggunakan Nix Flakes, dan konten konfigurasi tetap konsisten dengan sebelumnya.

> Jika hostname sistem Anda bukan `my-nixos`, Anda perlu memodifikasi nama `nixosConfigurations` di `flake.nix`, atau menggunakan `--flake /etc/nixos#my-nixos` untuk menentukan nama konfigurasi.

Setelah beralih, kita dapat mengelola sistem melalui fitur Flakes.

Saat ini, flake kita mencakup file-file ini:

- `/etc/nixos/flake.nix`: Titik masuk untuk flake, yang dikenali dan di-deploy ketika `sudo nixos-rebuild switch` dijalankan.
- `/etc/nixos/flake.lock`: File lock versi yang dihasilkan secara otomatis, yang mencatat sumber data, nilai hash, dan nomor versi dari semua input dalam seluruh flake, memastikan reprodusibilitas sistem.
- `/etc/nixos/configuration.nix`: Ini adalah file konfigurasi kita sebelumnya, yang diimpor sebagai modul di `flake.nix`. Saat ini, semua konfigurasi sistem ditulis dalam file ini.
- `/etc/nixos/hardware-configuration.nix`: Ini adalah file konfigurasi hardware sistem, dihasilkan oleh NixOS, yang menggambarkan informasi hardware sistem.

## Kesimpulan

Hingga titik ini, kita hanya menambahkan file konfigurasi yang sangat sederhana, `/etc/nixos/flake.nix`, yang hanya menjadi wrapper tipis di sekitar `/etc/nixos/configuration.nix`, tidak menawarkan fungsionalitas baru dan tidak memperkenalkan perubahan yang mengganggu.

Dalam konten buku yang mengikuti, kita akan belajar tentang struktur dan fungsionalitas `flake.nix` dan secara bertahap melihat manfaat yang dapat dibawa oleh wrapper semacam itu.

> Catatan: Metode manajemen konfigurasi yang dijelaskan dalam buku ini BUKAN "Semuanya dalam satu file". Disarankan untuk mengkategorikan konten konfigurasi ke dalam file nix yang berbeda, kemudian memperkenalkan file konfigurasi ini dalam daftar `modules` dari `flake.nix`, dan mengelolanya dengan Git.
>
> Manfaat dari pendekatan ini adalah organisasi file konfigurasi yang lebih baik dan peningkatan maintainability konfigurasi. Bagian [Modularisasi Konfigurasi NixOS](./modularize-the-configuration.md) akan menjelaskan secara detail cara memodularisasi konfigurasi NixOS Anda, dan [Tips Berguna Lainnya - Mengelola Konfigurasi NixOS dengan Git](./other-useful-tips.md) akan memperkenalkan beberapa praktik terbaik untuk mengelola konfigurasi NixOS dengan Git.
