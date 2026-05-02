# Memulai dengan NixOS

Sekarang setelah kita mempelajari dasar-dasar bahasa Nix, kita dapat mulai menggunakannya untuk mengonfigurasi sistem NixOS kita. File konfigurasi default untuk NixOS terletak di `/etc/nixos/configuration.nix`. File ini berisi semua konfigurasi deklaratif untuk sistem, termasuk pengaturan untuk zona waktu, bahasa, layout keyboard, jaringan, pengguna, file system, dan opsi boot.

Untuk memodifikasi keadaan sistem dengan cara yang dapat direproduksi (yang sangat direkomendasikan), kita perlu mengedit file `/etc/nixos/configuration.nix` secara manual dan kemudian menjalankan `sudo nixos-rebuild switch` untuk menerapkan konfigurasi yang dimodifikasi. Perintah ini menghasilkan lingkungan sistem baru berdasarkan file konfigurasi yang dimodifikasi, menetapkan lingkungan baru sebagai default, dan mempertahankan lingkungan sebelumnya dalam opsi boot grub/systemd-boot. Ini memastikan bahwa kita selalu dapat rollback ke lingkungan lama bahkan jika yang baru gagal untuk start.

Meskipun `/etc/nixos/configuration.nix` adalah metode klasik untuk mengonfigurasi NixOS, ini bergantung pada sumber data yang dikonfigurasi oleh `nix-channel` dan kurang mekanisme penguncian versi, membuat reprodusibilitas sistem menjadi tantangan. Pendekatan yang lebih baik adalah menggunakan Flakes, yang menyediakan reprodusibilitas dan memfasilitasi manajemen konfigurasi.

Dalam bagian ini, kita akan terlebih dahulu belajar cara mengelola NixOS menggunakan metode klasik (`/etc/nixos/configuration.nix`), dan kemudian kita akan menjelajahi Flakes yang lebih canggih.

## Mengonfigurasi Sistem menggunakan `/etc/nixos/configuration.nix`

File `/etc/nixos/configuration.nix` adalah metode default dan klasik untuk mengonfigurasi NixOS. Meskipun kurang beberapa fitur canggih Flakes, ini masih banyak digunakan dan memberikan fleksibilitas dalam konfigurasi sistem.

Untuk mengilustrasikan cara menggunakan `/etc/nixos/configuration.nix`, mari kita pertimbangkan contoh di mana kita mengaktifkan SSH dan menambahkan pengguna bernama `ryan` ke sistem. Kita dapat mencapai ini dengan menambahkan konten berikut ke `/etc/nixos/configuration.nix`:

```nix{14-38}
# Edit this configuration file to define what should be installed on
# your system.  Help is available in the configuration.nix(5) man page
# and in the NixOS manual (accessible by running 'nixos-help').
{ config, pkgs, ... }:

{
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  # Omit previous configuration settings...

  # Add user 'ryan'
  users.users.ryan = {
    isNormalUser = true;
    description = "ryan";
    extraGroups = [ "networkmanager" "wheel" ];
    openssh.authorizedKeys.keys = [
        # Replace with your own public key
        "ssh-ed25519 <some-public-key> ryan@ryan-pc"
    ];
    packages = with pkgs; [
      firefox
    #  thunderbird
    ];
  };

  # Enable the OpenSSH daemon.
  services.openssh = {
    enable = true;
    settings = {
      X11Forwarding = true;
      PermitRootLogin = "no"; # disable root login
      PasswordAuthentication = false; # disable password login
    };
    openFirewall = true;
  };

  # Omit the rest of the configuration...
}
```

Dalam konfigurasi ini, kita mendeklarasikan niat kita untuk mengaktifkan layanan openssh, menambahkan public key SSH untuk pengguna 'ryan', dan menonaktifkan login password.

Untuk men-deploy konfigurasi yang dimodifikasi, jalankan `sudo nixos-rebuild switch`. Perintah ini akan menerapkan perubahan, menghasilkan lingkungan sistem baru, dan menetapkannya sebagai default. Anda sekarang dapat login ke sistem menggunakan SSH dengan kunci SSH yang dikonfigurasi.

> Anda selalu dapat mencoba menambahkan `--show-trace --print-build-logs --verbose` ke perintah `nixos-rebuild` untuk mendapatkan pesan error yang detail jika Anda mengalami error selama deployment.

Ingat bahwa setiap perubahan yang dapat direproduksi pada sistem dapat dilakukan dengan memodifikasi file `/etc/nixos/configuration.nix` dan men-deploy perubahan dengan `sudo nixos-rebuild switch`.

Untuk menemukan opsi konfigurasi dan dokumentasi:

- Gunakan mesin pencari seperti Google, misalnya, cari `Chrome NixOS` untuk menemukan informasi terkait NixOS tentang Chrome. NixOS Wiki dan kode sumber Nixpkgs biasanya di antara hasil teratas.
- Manfaatkan [NixOS Options Search](https://search.nixos.org/options) untuk mencari kata kunci.
- Rujuk ke [bagian Configuration](https://nixos.org/manual/nixos/unstable/index.html#ch-configuration) di NixOS Manual untuk dokumentasi konfigurasi tingkat sistem.
- Cari kata kunci langsung di kode sumber [nixpkgs](https://github.com/NixOS/nixpkgs) di GitHub.

## Referensi

- [Overview of the NixOS Linux distribution](https://wiki.nixos.org/wiki/Overview_of_the_NixOS_Linux_distribution)
