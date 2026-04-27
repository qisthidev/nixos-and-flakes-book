# Tips Berguna Lainnya

## Menampilkan pesan error detail

Anda selalu dapat mencoba menambahkan `--show-trace --print-build-logs --verbose` ke perintah `nixos-rebuild` untuk mendapatkan pesan error detail jika Anda mengalami error selama deployment. misalnya

```bash
cd /etc/nixos
sudo nixos-rebuild switch --flake .#myhost --show-trace --print-build-logs --verbose

# Versi yang lebih ringkas
sudo nixos-rebuild switch --flake .#myhost --show-trace -L -v
```

## Mengelola Konfigurasi dengan Git

Konfigurasi NixOS, sebagai kumpulan file teks, sangat cocok untuk kontrol versi dengan Git. Ini memungkinkan rollback mudah ke versi sebelumnya jika terjadi masalah.

> CATATAN: Saat menggunakan Git, Nix mengabaikan semua file yang tidak dilacak oleh Git. Jika Anda mengalami error di Nix yang menyatakan bahwa file tertentu tidak ditemukan, mungkin karena Anda belum melakukan `git add` padanya.

Secara default, NixOS menempatkan konfigurasi di `/etc/nixos`, yang memerlukan izin root untuk modifikasi, membuatnya tidak nyaman untuk penggunaan sehari-hari. Untungnya, Flakes dapat membantu menyelesaikan masalah ini dengan memungkinkan Anda menempatkan flake di mana pun Anda suka.

Misalnya, Anda dapat menempatkan flake Anda di `~/nixos-config` dan membuat symbolic link di `/etc/nixos` sebagai berikut:

```shell
sudo mv /etc/nixos /etc/nixos.bak  # Backup konfigurasi asli
sudo ln -s ~/nixos-config /etc/nixos

# Deploy flake.nix yang terletak di lokasi default (/etc/nixos)
sudo nixos-rebuild switch
```

Dengan cara ini, Anda dapat menggunakan Git untuk mengelola konfigurasi di `~/nixos-config`. Konfigurasi dapat dimodifikasi dengan izin tingkat pengguna biasa dan tidak memerlukan kepemilikan root.

Pendekatan lain adalah menghapus `/etc/nixos` secara langsung dan menentukan path file konfigurasi setiap kali Anda men-deploy-nya:

```shell
sudo mv /etc/nixos /etc/nixos.bak
cd ~/nixos-config

# `--flake .#my-nixos` men-deploy flake.nix yang terletak di
# direktori saat ini, dan nama nixosConfiguration adalah `my-nixos`
sudo nixos-rebuild switch --flake .#my-nixos
```

Pilih metode yang paling sesuai untuk Anda. Setelah itu, rollback sistem menjadi sederhana. Cukup beralih ke commit sebelumnya dan deploy:

```shell
cd ~/nixos-config
# Beralih ke commit sebelumnya
git checkout HEAD^1
# Deploy flake.nix yang terletak di direktori saat ini,
# dengan nama nixosConfiguration `my-nixos`
sudo nixos-rebuild switch --flake .#my-nixos
```

Operasi Git yang lebih lanjut tidak dibahas di sini, tetapi secara umum, rollback dapat dilakukan langsung menggunakan Git. Hanya dalam kasus crash sistem total Anda perlu restart ke bootloader dan boot sistem dari versi histor

is sebelumnya.

## Melihat dan Menghapus Data Historis

Seperti disebutkan sebelumnya, setiap deployment NixOS membuat versi baru, dan semua versi ditambahkan ke opsi boot sistem. Selain restart komputer, Anda dapat melakukan query semua versi historis yang tersedia menggunakan perintah berikut:

```shell
nix profile history --profile /nix/var/nix/profiles/system
```

Untuk membersihkan versi historis dan membebaskan ruang penyimpanan, gunakan perintah berikut:

```shell
# Hapus semua versi historis yang lebih lama dari 7 hari
sudo nix profile wipe-history --older-than 7d --profile /nix/var/nix/profiles/system

# Menghapus history tidak akan garbage collect paket yang tidak digunakan, Anda perlu menjalankan perintah gc secara manual sebagai root:
sudo nix-collect-garbage --delete-old

# Karena issue berikut, Anda perlu menjalankan perintah gc sebagai per user untuk menghapus data historis home-manager:
# https://github.com/NixOS/nix/issues/8508
nix-collect-garbage --delete-old
```

## Mengapa beberapa paket diinstal?

Untuk mengetahui mengapa paket diinstal, Anda dapat menggunakan perintah berikut:

1. Masuk ke shell dengan `nix-tree` & `rg` tersedia:
   `nix shell nixpkgs#nix-tree nixpkgs#ripgrep`
2. ` nix-store --gc --print-roots | rg -v '/proc/' | rg -Po '(?<= -> ).*' | xargs -o nix-tree`
3. `/<package-name>` untuk menemukan paket yang ingin Anda periksa.
4. `w` untuk menunjukkan paket bergantung pada paket mana, dan rantai dependensi penuh.

## Mengurangi Penggunaan Disk

Konfigurasi berikut dapat ditambahkan ke konfigurasi NixOS Anda untuk membantu mengurangi penggunaan disk:

```nix
{ lib, pkgs, ... }:

{
  # ...

  # Batasi jumlah generasi yang disimpan
  boot.loader.systemd-boot.configurationLimit = 10;
  # boot.loader.grub.configurationLimit = 10;

  # Lakukan garbage collection mingguan untuk mempertahankan penggunaan disk rendah
  nix.gc = {
    automatic = true;
    dates = "weekly";
    options = "--delete-older-than 7d";
  };

  # Optimalkan penyimpanan
  # Anda juga dapat secara manual mengoptimalkan store via:
  #    nix-store --optimise
  # Rujuk ke link berikut untuk detail lebih lanjut:
  # https://nixos.org/manual/nix/stable/command-ref/conf-file.html#conf-auto-optimise-store
  nix.settings.auto-optimise-store = true;
}
```

Dengan menggabungkan konfigurasi ini, Anda dapat mengelola dan mengoptimalkan penggunaan disk sistem NixOS Anda dengan lebih baik.
