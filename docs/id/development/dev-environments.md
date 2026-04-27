# Lingkungan Development

Membuat lingkungan development yang dapat direproduksi adalah salah satu use case utama untuk Nix.

## Menggunakan `pkgs.mkShell`

Cara paling umum untuk membuat lingkungan development adalah dengan `pkgs.mkShell`:

```nix
{
  devShells.default = pkgs.mkShell {
    packages = with pkgs; [
      nodejs
      yarn
      python3
    ];
    
    shellHook = ''
      echo "Welcome to the development shell!"
    '';
  };
}
```

Masuk ke shell dengan:

```bash
nix develop
```

## Menambahkan Variabel Lingkungan

Anda dapat mengatur variabel lingkungan dalam shell development:

```nix
{
  devShells.default = pkgs.mkShell {
    packages = [ pkgs.nodejs ];
    
    DATABASE_URL = "postgresql://localhost/mydb";
    API_KEY = "secret";
  };
}
```

## Multiple Development Shells

Anda dapat mendefinisikan beberapa shell untuk use case berbeda:

```nix
{
  devShells = {
    default = pkgs.mkShell {
      packages = [ pkgs.nodejs ];
    };
    
    python = pkgs.mkShell {
      packages = [ pkgs.python3 ];
    };
  };
}
```

Gunakan dengan:

```bash
nix develop .#python
```

## Referensi

- [Nix Manual - Development Environments](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-develop.html)
