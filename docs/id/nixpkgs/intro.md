# Penggunaan Lanjutan Nixpkgs

`callPackage`, `Overriding`, dan `Overlays` adalah teknik yang kadang-kadang digunakan saat menggunakan Nix untuk menyesuaikan metode build paket Nix.

Kita tahu bahwa banyak program memiliki sejumlah besar parameter build yang perlu dikonfigurasi, dan pengguna yang berbeda mungkin ingin menggunakan parameter build yang berbeda. Di sinilah `Overriding` dan `Overlays` berguna. Biar saya berikan beberapa contoh yang pernah saya temui:

1. [`fcitx5-rime.nix`](https://github.com/NixOS/nixpkgs/blob/e4246ae1e7f78b7087dce9c9da10d28d3725025f/pkgs/tools/inputmethods/fcitx5/fcitx5-rime.nix): Secara default, `fcitx5-rime` menggunakan `rime-data` sebagai nilai `rimeDataPkgs`, tetapi parameter ini dapat disesuaikan dengan `override`.
2. [`vscode/with-extensions.nix`](https://github.com/NixOS/nixpkgs/blob/nixos-23.05/pkgs/applications/editors/vscode/with-extensions.nix): Paket VS Code ini juga dapat disesuaikan dengan menimpa nilai `vscodeExtensions`, sehingga kita dapat menginstal beberapa plugin custom ke VS Code.
   - [`nix-vscode-extensions`](https://github.com/nix-community/nix-vscode-extensions): Ini adalah manajer plugin vscode yang diimplementasikan dengan menimpa `vscodeExtensions`.
3. [`firefox/common.nix`](https://github.com/NixOS/nixpkgs/blob/416ffcd08f1f16211130cd9571f74322e98ecef6/pkgs/applications/networking/browsers/firefox/common.nix): Firefox juga memiliki banyak parameter yang dapat disesuaikan.
4. ...

Singkatnya, `callPackage`, `Overriding` dan `Overlays` dapat digunakan untuk menyesuaikan parameter build paket Nix.
