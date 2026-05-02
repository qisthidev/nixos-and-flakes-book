# Menyederhanakan Perintah Terkait NixOS

Untuk menyederhanakan perintah yang sering digunakan, Anda dapat membuat alias atau wrapper script.

## Menggunakan Aliases

Tambahkan alias ke konfigurasi shell Anda:

```nix
{
  programs.bash.shellAliases = {
    nrs = "sudo nixos-rebuild switch --flake .";
    nrb = "sudo nixos-rebuild boot --flake .";
    hms = "home-manager switch --flake .";
    nfu = "nix flake update";
  };
}
```

## Menggunakan `just` atau `make`

Anda juga dapat menggunakan task runner seperti `just` atau `make`:

```justfile
# justfile
switch:
    sudo nixos-rebuild switch --flake .

update:
    nix flake update
    sudo nixos-rebuild switch --flake .
```

Kemudian jalankan:

```bash
just switch
just update
```

## Menggunakan Nix Wrapper Scripts

Buat script wrapper dalam `flake.nix`:

```nix
{
  packages.x86_64-linux.deploy = pkgs.writeShellScriptBin "deploy" ''
    sudo nixos-rebuild switch --flake .
  '';
}
```

Gunakan dengan:

```bash
nix run .#deploy
```
