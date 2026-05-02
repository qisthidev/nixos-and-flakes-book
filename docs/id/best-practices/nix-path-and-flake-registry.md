# `NIX_PATH` dan Flake Registry

`NIX_PATH` adalah variabel lingkungan yang menentukan lokasi channel Nix dan path pencarian lainnya. Flake Registry adalah registri terpusat dari flake yang dapat digunakan tanpa menentukan URL lengkap.

## `NIX_PATH`

Saat menggunakan Flakes, disarankan untuk tidak menggunakan `NIX_PATH`, karena dapat menyebabkan ketidak-reprodusibil

itas. Sebaliknya, gunakan input flake untuk menentukan dependensi Anda.

Jika Anda masih perlu menggunakan `NIX_PATH`, Anda dapat mengaturnya di konfigurasi NixOS Anda:

```nix
{
  nix.nixPath = [
    "nixpkgs=/nix/var/nix/profiles/per-user/root/channels/nixos"
    "nixos-config=/etc/nixos/configuration.nix"
    "/nix/var/nix/profiles/per-user/root/channels"
  ];
}
```

## Flake Registry

Flake registry memungkinkan Anda menggunakan nama pendek untuk flake alih-alih URL lengkap:

```bash
# Alih-alih
nix shell github:nixos/nixpkgs/nixos-unstable#hello

# Anda dapat menggunakan
nix shell nixpkgs#hello
```

Anda dapat melihat registry saat ini dengan:

```bash
nix registry list
```
