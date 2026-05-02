# Memperbarui Sistem

Dengan Flakes, memperbarui sistem sangatlah mudah. Cukup jalankan perintah berikut di `/etc/nixos` atau lokasi lain di mana Anda menyimpan konfigurasi:

> **CATATAN**: Direktori `/etc/nixos` dimiliki oleh dan hanya dapat ditulis oleh `root`. Oleh karena itu, jika flake Anda berada di direktori ini, Anda perlu menggunakan `sudo` untuk memperbarui file konfigurasi apa pun.

```shell
# Perbarui flake.lock
nix flake update

# Atau perbarui hanya input tertentu, misalnya home-manager:
nix flake update home-manager

# Terapkan pembaruan
sudo nixos-rebuild switch --flake .
```

Kadang-kadang, Anda mungkin menemukan kesalahan "sha256 mismatch" saat menjalankan `nixos-rebuild switch`. Kesalahan ini dapat diselesaikan dengan memperbarui `flake.lock` menggunakan `nix flake update`.
