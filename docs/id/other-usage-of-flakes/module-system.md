# Sistem Modul & Opsi Custom

Sistem modul Nix memungkinkan Anda membuat opsi konfigurasi custom yang dapat digunakan kembali.

## Membuat Modul Custom

Modul custom memungkinkan Anda mendefinisikan opsi konfigurasi Anda sendiri:

```nix
{ config, lib, pkgs, ... }:

with lib;

{
  options.services.myservice = {
    enable = mkEnableOption "my custom service";
    
    port = mkOption {
      type = types.int;
      default = 8080;
      description = "Port untuk my service";
    };
  };

  config = mkIf config.services.myservice.enable {
    # Konfigurasi untuk service Anda
  };
}
```

## Menggunakan Modul Custom

Impor modul custom Anda di `flake.nix`:

```nix
{
  nixosConfigurations.hostname = nixpkgs.lib.nixosSystem {
    modules = [
      ./configuration.nix
      ./modules/myservice.nix
    ];
  };
}
```

Kemudian gunakan di konfigurasi Anda:

```nix
{
  services.myservice = {
    enable = true;
    port = 9090;
  };
}
```

## Referensi

- [NixOS Manual - Module System](https://nixos.org/manual/nixos/stable/#sec-writing-modules)
- [Nixpkgs Manual - Module System](https://nixos.org/manual/nixpkgs/stable/#module-system)
