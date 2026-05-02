# Pengembangan Kernel

NixOS memudahkan untuk membangun dan menguji kernel Linux custom.

## Membangun Kernel Custom

```nix
{ pkgs, ... }:

{
  boot.kernelPackages = pkgs.linuxPackagesFor (pkgs.linux_latest.override {
    argsOverride = {
      src = pkgs.fetchurl {
        url = "https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.1.tar.xz";
        sha256 = "sha256-...";
      };
      version = "6.1.0";
      modDirVersion = "6.1.0";
    };
  });
}
```

## Mengkonfigurasi Kernel

Buat file konfigurasi kernel custom:

```nix
{
  boot.kernelPatches = [{
    name = "custom-config";
    patch = null;
    extraConfig = ''
      DEBUG_KERNEL y
      DEBUG_INFO y
    '';
  }];
}
```

## Referensi

- [NixOS Manual - Kernel](https://nixos.org/manual/nixos/stable/index.html#sec-kernel-config)
