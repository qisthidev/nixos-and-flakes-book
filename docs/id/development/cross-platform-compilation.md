# Kompilasi Lintas Platform

Nix mendukung cross-compilation untuk berbagai arsitektur target.

## Mengatur Cross-Compilation

Tentukan sistem target dalam `flake.nix`:

```nix
{
  packages.x86_64-linux.riscv64-binary = 
    let
      pkgs = import nixpkgs {
        system = "x86_64-linux";
        crossSystem = {
          config = "riscv64-unknown-linux-gnu";
        };
      };
    in
      pkgs.callPackage ./package.nix {};
}
```

## Cross-Compile untuk Arsitektur Berbeda

```nix
{
  nixosConfigurations.riscv64-machine = nixpkgs.lib.nixosSystem {
    system = "x86_64-linux";
    modules = [{
      nixpkgs.crossSystem = {
        config = "riscv64-unknown-linux-gnu";
      };
    }];
  };
}
```

## Referensi

- [Nixpkgs Manual - Cross-Compilation](https://nixos.org/manual/nixpkgs/stable/#chap-cross)
