# Lingkungan Development di NixOS

Reprodusibilitas NixOS membuatnya ideal untuk membangun lingkungan development. Namun, jika Anda terbiasa dengan distro lain, Anda mungkin mengalami masalah karena NixOS memiliki logikanya sendiri. Kami akan menjelaskan ini secara singkat di bawah ini.

Di bagian berikutnya, kami akan memperkenalkan cara kerja lingkungan development di NixOS.

## Membuat Lingkungan Shell Custom dengan `nix shell`

Cara termudah untuk membuat lingkungan development adalah menggunakan `nix shell`. `nix shell` akan membuat lingkungan shell dengan paket Nix yang ditentukan terinstal.

Berikut contohnya:

```shell
# hello tidak tersedia
› hello
hello: command not found

# Masuk ke lingkungan dengan paket 'hello' dan `cowsay`
› nix shell nixpkgs#hello nixpkgs#cowsay

# hello sekarang tersedia
› hello
Hello, world!

# cowsay juga tersedia
› cowsay "Hello, world!"
 _______
< hello >
 -------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
```

`nix shell` sangat berguna ketika Anda hanya ingin mencoba beberapa paket atau dengan cepat membuat lingkungan yang bersih.

## Membuat Lingkungan Development

`nix shell` sederhana dan mudah digunakan, tetapi tidak terlalu fleksibel, untuk lingkungan development yang lebih kompleks, kita perlu menggunakan `pkgs.mkShell` dan `nix develop`.

Kita dapat membuat lingkungan development menggunakan `pkgs.mkShell { ... }` dan membuka shell Bash interaktif dari lingkungan development ini menggunakan `nix develop`.
