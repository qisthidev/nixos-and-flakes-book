# Debugging

Debugging adalah keterampilan penting saat bekerja dengan NixOS dan Flakes. Bagian ini mencakup beberapa teknik debugging yang berguna.

## Menggunakan `nix repl`

`nix repl` adalah alat yang sangat berguna untuk berinteraksi dengan Nix secara interaktif. Anda dapat menggunakannya untuk mengevaluasi ekspresi Nix, menguji fungsi, dan mengeksplorasi atribut paket.

```bash
nix repl -f '<nixpkgs>'
```

## Menggunakan `nix-tree`

`nix-tree` memvisualisasikan dependensi pohon paket Nix dengan cara interaktif yang ramah pengguna.

```bash
nix run nixpkgs#nix-tree -- /run/current-system
```

## Menggunakan `nix why-depends`

```bash
nix why-depends /run/current-system /nix/store/xxx
```

Ini menunjukkan mengapa sebuah path di Nix store adalah dependensi dari path lain.

## Referensi

- [Nix Manual - Debugging](https://nixos.org/manual/nix/stable/command-ref/nix-shell.html)
