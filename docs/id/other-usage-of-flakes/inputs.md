# Flake Inputs

Input flake mendefinisikan dependensi dari flake Anda. Mereka dapat berupa flake lain, repositori Git, atau path lokal.

## Jenis-jenis Input

### Input GitHub

```nix
inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
```

### Input Git

```nix
inputs.my-repo.url = "git+https://github.com/user/repo?ref=main";
```

### Input Lokal

```nix
inputs.my-local.url = "path:./my-flake";
```

### Input dengan `follows`

Kata kunci `follows` digunakan untuk berbagi dependensi:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    home-manager = {
      url = "github:nix-community/home-manager/release-25.11";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
}
```

Ini memastikan `home-manager` menggunakan nixpkgs yang sama dengan flake Anda.

## Referensi

- [Nix Flakes - Input Schemas](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html#flake-inputs)
