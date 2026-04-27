# CLI Baru

Nix Flakes memperkenalkan interface command-line baru yang lebih konsisten dan powerful.

## Perintah Umum

### `nix build`

Membangun sebuah paket:

```bash
nix build .#my-package
nix build github:nixos/nixpkgs#hello
```

### `nix run`

Menjalankan sebuah paket:

```bash
nix run nixpkgs#hello
nix run .#my-app
```

### `nix develop`

Masuk ke lingkungan development:

```bash
nix develop
nix develop .#my-shell
```

### `nix flake`

Operasi flake:

```bash
nix flake show      # Menampilkan output flake
nix flake update    # Memperbarui flake.lock
nix flake check     # Memeriksa flake
nix flake init      # Inisialisasi flake baru
```

### `nix search`

Mencari paket:

```bash
nix search nixpkgs hello
```

### `nix shell`

Membuat shell sementara dengan paket:

```bash
nix shell nixpkgs#hello nixpkgs#cowsay
```

## Referensi

- [New Nix Commands](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix.html)
