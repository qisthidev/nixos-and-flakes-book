# Penjelasan Konfigurasi `flake.nix` {#flake-nix-configuration-explained}

Di atas, kami telah membuat file `flake.nix` untuk mengelola konfigurasi sistem, tetapi Anda mungkin masih belum jelas tentang strukturnya. Mari kita jelaskan konten file ini secara detail.

## 1. Flake Inputs

Pertama, mari kita lihat atribut `inputs`. Ini adalah attribute set yang mendefinisikan semua dependensi dari flake ini. Dependensi ini akan diteruskan sebagai argumen ke fungsi `outputs` setelah diambil:

```nix{2-5,7}
{
  inputs = {
    # Sumber paket resmi NixOS, menggunakan branch nixos-25.11 di sini
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  };

  outputs = { self, nixpkgs, ... }@inputs: {
    # Omit konfigurasi sebelumnya......
  };
}
```

Dependensi di `inputs` memiliki banyak tipe dan definisi. Bisa jadi flake lain, repositori Git biasa, atau path lokal. Bagian [Other Usage of Flakes - Flake Inputs](../other-usage-of-flakes/inputs.md) menjelaskan tipe umum dependensi dan definisinya secara detail.

Di sini kita hanya mendefinisikan dependensi bernama `nixpkgs`, yang merupakan cara paling umum untuk referensi dalam flake, yaitu `github:owner/name/reference`. `reference` di sini bisa berupa nama branch, commit-id, atau tag.

Setelah `nixpkgs` didefinisikan di `inputs`, Anda dapat menggunakannya dalam parameter fungsi `outputs` berikutnya, yang persis seperti yang dilakukan contoh kita.

## 2. Flake Outputs

Sekarang mari kita lihat `outputs`. Ini adalah fungsi yang mengambil dependensi dari `inputs` sebagai parameternya, dan nilai kembaliannya adalah attribute set, yang mewakili hasil build dari flake:

```nix{9-16}
{
  description = "A simple NixOS flake";

  inputs = {
    # Sumber paket resmi NixOS, di sini menggunakan branch nixos-25.11
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  };

  outputs = { self, nixpkgs, ... }@inputs: {
    # Host dengan hostname `my-nixos` akan menggunakan konfigurasi ini
    nixosConfigurations.my-nixos = nixpkgs.lib.nixosSystem {
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

Flakes dapat memiliki berbagai tujuan dan dapat memiliki berbagai tipe outputs. Bagian [Flake Outputs](../other-usage-of-flakes/outputs.md) memberikan pengenalan yang lebih detail. Di sini, kita hanya menggunakan tipe outputs `nixosConfigurations`, yang digunakan untuk mengkonfigurasi sistem NixOS.

Ketika kita menjalankan perintah `sudo nixos-rebuild switch`, ia mencari atribut `nixosConfigurations.my-nixos` (di mana `my-nixos` akan menjadi hostname sistem Anda saat ini) dalam attribute set yang dikembalikan oleh fungsi `outputs` dari `/etc/nixos/flake.nix` dan menggunakan definisi di sana untuk mengkonfigurasi sistem NixOS Anda.

Sebenarnya, kita juga dapat menyesuaikan lokasi flake dan nama konfigurasi NixOS alih-alih menggunakan default. Ini dapat dilakukan dengan menambahkan parameter `--flake` ke perintah `nixos-rebuild`. Berikut contohnya:

```nix
sudo nixos-rebuild switch --flake /path/to/your/flake#your-hostname
```

Penjelasan singkat tentang parameter `--flake /path/to/your/flake#your-hostname`:

1. `/path/to/your/flake` adalah lokasi dari flake target. Path default adalah `/etc/nixos/`.
2. `#` adalah separator, dan `your-hostname` adalah nama konfigurasi NixOS. `nixos-rebuild` akan default menggunakan hostname sistem Anda saat ini sebagai nama konfigurasi yang dicari.

Anda bahkan dapat langsung mereferensikan repositori GitHub remote sebagai sumber flake Anda, misalnya:

```nix
sudo nixos-rebuild switch --flake github:owner/repo#your-hostname
```

## 3. Parameter Khusus `self` dari Fungsi `outputs` {#special-parameter-self-of-outputs-function}

Meskipun kami belum menyebutkannya sebelumnya, semua kode contoh di bagian sebelumnya memiliki satu parameter khusus lagi dalam fungsi `outputs`, dan kami akan memperkenalkan tujuannya secara singkat di sini.

Deskripsinya di [nix flake - Nix Manual] adalah:

> Input khusus bernama `self` merujuk pada outputs dan source tree dari flake ini.

Ini berarti `self` adalah nilai kembali dari fungsi `outputs` flake saat ini dan juga path ke folder kode sumber (source tree) flake saat ini.

Kita tidak menggunakan parameter `self` di sini, tetapi dalam beberapa contoh yang lebih kompleks (atau konfigurasi yang mungkin Anda temukan online) nanti, Anda akan melihat penggunaan `self`.

> Catatan: Anda mungkin menemukan beberapa kode di mana orang menggunakan `self.outputs` untuk mereferensikan outputs dari flake saat ini, yang memang mungkin. Namun, Nix Manual tidak memberikan penjelasan apa pun untuk ini, dan ini dianggap sebagai detail implementasi internal dari flakes. Tidak disarankan untuk menggunakan ini dalam kode Anda sendiri!

## 4. Pengenalan Sederhana Fungsi `nixpkgs.lib.nixosSystem` {#simple-introduction-to-nixpkgs-lib-nixos-system}

**Sebuah Flake dapat bergantung pada Flakes lain untuk memanfaatkan fitur yang mereka sediakan.**

Secara default, sebuah flake mencari file `flake.nix` di direktori root dari setiap dependensinya (yaitu setiap item di `inputs`) dan secara lazy mengevaluasi fungsi `outputs` mereka. Kemudian meneruskan attribute set yang dikembalikan oleh fungsi-fungsi ini sebagai argumen ke fungsi `outputs` sendiri, memungkinkan kita untuk menggunakan fitur yang disediakan oleh flakes lain di dalam flake kita saat ini.

Lebih tepatnya, evaluasi fungsi `outputs` untuk setiap dependensi bersifat lazy. Ini berarti fungsi `outputs` flake hanya dievaluasi ketika benar-benar digunakan, sehingga menghindari perhitungan yang tidak perlu dan meningkatkan efisiensi.

Deskripsi di atas mungkin sedikit membingungkan, jadi mari kita lihat prosesnya dengan contoh `flake.nix` yang digunakan di bagian ini. `flake.nix` kita mendeklarasikan dependensi `inputs.nixpkgs`, sehingga [nixpkgs/flake.nix] akan dievaluasi ketika kita menjalankan perintah `sudo nixos-rebuild switch`.

Dari kode sumber repositori Nixpkgs, kita dapat melihat bahwa definisi output flake-nya mencakup atribut `lib`, dan dalam contoh kita, kita menggunakan fungsi `nixosSystem` atribut `lib` untuk mengkonfigurasi sistem NixOS kita:

```nix{8-13}
{
  inputs = {
    # Sumber paket resmi NixOS, di sini menggunakan branch nixos-25.11
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  };

  outputs = { self, nixpkgs, ... }@inputs: {
    nixosConfigurations.my-nixos = nixpkgs.lib.nixosSystem {
      # system = "x86_64-linux";
      modules = [
        ./configuration.nix
      ];
    };
  };
}
```

Attribute set yang mengikuti `nixpkgs.lib.nixosSystem` adalah argumen tunggal fungsi, memegang semua parameter konfigurasi; di sini kita hanya menyediakan dua:

- `system`: Alias lama untuk `nixpkgs.hostPlatform` yang menentukan platform tempat mesin berjalan.
  Karena `hardware-configuration.nix` yang dihasilkan (diimpor oleh `configuration.nix`) sudah mendefinisikan nilai ini, Anda biasanya dapat mengabaikannya di sini.
- `modules`: Ini adalah daftar modul, di mana konfigurasi sistem NixOS aktual didefinisikan. File konfigurasi `/etc/nixos/configuration.nix` itu sendiri adalah Nixpkgs Module, jadi dapat langsung ditambahkan ke daftar `modules` untuk digunakan.

Memahami dasar-dasar ini sudah cukup untuk pemula. Mengeksplorasi fungsi `nixpkgs.lib.nixosSystem` secara detail memerlukan pemahaman tentang sistem modul Nixpkgs. Pembaca yang telah menyelesaikan bagian [Modularizing NixOS Configuration](./modularize-the-configuration.md) dapat kembali ke [nixpkgs/flake.nix] untuk menemukan definisi `nixpkgs.lib.nixosSystem`, melacak kode sumbernya, dan mempelajari implementasinya.

[nix flake - Nix Manual]:
  https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake#flake-inputs
[nixpkgs/flake.nix]: https://github.com/NixOS/nixpkgs/tree/nixos-25.11/flake.nix
