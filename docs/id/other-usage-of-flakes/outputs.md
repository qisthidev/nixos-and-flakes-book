# Flake Outputs

Output flake mendefinisikan apa yang dihasilkan flake Anda. Mereka dapat berupa konfigurasi NixOS, paket, lingkungan development, dan lainnya.

## Jenis-jenis Output Umum

### `nixosConfigurations`

Digunakan untuk konfigurasi sistem NixOS:

```nix
{
  outputs = { nixpkgs, ... }: {
    nixosConfigurations.hostname = nixpkgs.lib.nixosSystem {
      modules = [ ./configuration.nix ];
    };
  };
}
```

### `packages`

Paket yang dapat dibangun dan diinstal:

```nix
{
  outputs = { nixpkgs, ... }: {
    packages.x86_64-linux.my-package = nixpkgs.legacyPackages.x86_64-linux.callPackage ./package.nix {};
  };
}
```

### `devShells`

Lingkungan development:

```nix
{
  outputs = { nixpkgs, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      packages = [ nixpkgs.legacyPackages.x86_64-linux.hello ];
    };
  };
}
```

### `homeConfigurations`

Konfigurasi Home Manager:

```nix
{
  outputs = { nixpkgs, home-manager, ... }: {
    homeConfigurations.username = home-manager.lib.homeManagerConfiguration {
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      modules = [ ./home.nix ];
    };
  };
}
```

## Referensi

- [Flake Output Schemas](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html#flake-outputs)
