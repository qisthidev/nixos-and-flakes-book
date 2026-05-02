# Remote Deployment

NixOS dapat di-deploy ke mesin remote menggunakan berbagai alat. Bagian ini mencakup beberapa opsi umum.

## Menggunakan `nixos-rebuild`

Cara termudah untuk men-deploy ke mesin remote adalah menggunakan `nixos-rebuild` dengan opsi `--target-host`:

```bash
nixos-rebuild switch --flake .#hostname --target-host user@remote-host --build-host localhost
```

## Menggunakan `colmena`

[colmena](https://github.com/zhaofengli/colmena) adalah alat deployment yang dirancang khusus untuk mengelola beberapa host NixOS:

```nix
{
  meta = {
    nixpkgs = import <nixpkgs> {};
  };

  web-server = { config, pkgs, ... }: {
    deployment.targetHost = "web.example.com";
    deployment.targetUser = "admin";
  };
}
```

Deploy dengan:

```bash
colmena apply
```

## Menggunakan `deploy-rs`

[deploy-rs](https://github.com/serokell/deploy-rs) adalah alat deployment lain yang populer:

```nix
{
  nodes.hostname = {
    hostname = "example.com";
    profiles.system = {
      user = "root";
      path = deploy-rs.lib.x86_64-linux.activate.nixos self.nixosConfigurations.hostname;
    };
  };
}
```
