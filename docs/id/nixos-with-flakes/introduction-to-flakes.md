# Pengenalan Flakes

Fitur eksperimental flakes adalah perkembangan besar untuk Nix, ini memperkenalkan kebijakan untuk mengelola dependensi antara ekspresi Nix, ini meningkatkan reprodusibilitas, komposabilitas dan kegunaan dalam ekosistem Nix. Meskipun masih merupakan fitur eksperimental, flakes telah banyak digunakan oleh komunitas Nix.[^1]

Flakes adalah salah satu perubahan paling signifikan yang pernah dilihat oleh proyek nix.[^2]

Sederhananya, jika Anda pernah bekerja dengan beberapa JavaScript/Go/Rust/Python, Anda harus familiar dengan file seperti `package.json`/`go.mod`/`Cargo.toml`/`pyproject.toml`. Dalam bahasa pemrograman ini, file-file ini digunakan untuk menggambarkan dependensi antara paket perangkat lunak dan cara membangun proyek.

Demikian pula, package manager dalam bahasa pemrograman ini juga menggunakan file seperti `package-lock.json`/`go.sum`/`Cargo.lock`/`poetry.lock` untuk mengunci versi dependensi, memastikan reprodusibilitas proyek.

Flakes meminjam ide dari package manager ini untuk meningkatkan reprodusibilitas, komposabilitas, dan kegunaan ekosistem Nix.

Flakes memperkenalkan `flake.nix`, mirip dengan `package.json`, untuk menggambarkan dependensi antara paket Nix dan cara membangun proyek. Selain itu, ini menyediakan `flake.lock`, mirip dengan `package-lock.json`, untuk mengunci versi dependensi, memastikan reprodusibilitas proyek.

Di sisi lain, fitur eksperimental Flakes tidak merusak desain asli Nix di tingkat pengguna. Dua file baru `flake.nix`/`flake.lock` yang diperkenalkan oleh Flakes hanyalah wrapper untuk konfigurasi Nix lainnya. Dalam bab-bab berikut, kita akan melihat bahwa fitur Flakes menyediakan cara baru dan lebih nyaman untuk mengelola dependensi antara ekspresi Nix berdasarkan desain asli Nix.

## Peringatan tentang Flakes <Badge type="danger" text="caution" />

Manfaat Flakes jelas, dan seluruh komunitas NixOS telah merangkulnya dengan sepenuh hati. Saat ini, lebih dari setengah pengguna menggunakan Flakes[^3], memberikan jaminan bahwa Flakes tidak akan dihentikan.

:warning: Namun, penting untuk dicatat bahwa **Flakes masih merupakan fitur eksperimental**. Beberapa masalah tetap ada, dan ada kemungkinan memperkenalkan breaking changes selama proses stabilisasi. Tingkat breaking changes ini masih tidak pasti.

Secara keseluruhan, saya sangat merekomendasikan semua orang untuk menggunakan Flakes, terutama karena buku ini berkisar pada NixOS dan Flakes. Namun, penting untuk siap menghadapi masalah potensial yang mungkin timbul karena breaking changes yang akan datang.

## Kapan Flakes Akan Distabilkan?

Saya menyelidiki beberapa detail mengenai Flakes:

- [[RFC 0136] A Plan to Stabilize Flakes and the New CLI Incrementally](https://github.com/NixOS/rfcs/pull/136): Rencana untuk secara bertahap menstabilkan Flakes dan CLI baru, digabungkan.
- [CLI stabilization effort](https://github.com/NixOS/nix/issues/7701): Issue yang melacak kemajuan upaya stabilisasi New CLI.
- [Why Are Flakes Still Experimental? - NixOS Discourse](https://discourse.nixos.org/t/why-are-flakes-still-experimental/29317): Posting yang membahas mengapa Flakes masih dianggap eksperimental.
- [Flakes Are Such an Obviously Good Thing - Graham Christensen](https://grahamc.com/blog/flakes-are-an-obviously-good-thing/): Artikel yang menekankan keunggulan Flakes sambil menyarankan area untuk perbaikan dalam desain dan proses pengembangannya.
- [ teaching Nix 3 CLI and Flakes #281 - nix.dev](https://github.com/NixOS/nix.dev/issues/281): Issue tentang "Teaching Nix 3 CLI and Flakes" di nix.dev, dan kesimpulannya adalah bahwa kita tidak boleh mempromosikan fitur yang tidak stabil di nix.dev.

Setelah meninjau sumber daya ini, tampaknya Flakes mungkin (atau mungkin tidak...) distabilkan dalam dua tahun, mungkin disertai dengan beberapa breaking changes.

## CLI Baru dan CLI Klasik

Nix memperkenalkan dua fitur eksperimental, `nix-command` dan `flakes`, pada tahun 2020. Fitur-fitur ini menghadirkan antarmuka command-line baru (disebut sebagai New CLI), definisi struktur paket Nix standar (dikenal sebagai fitur Flakes), dan fitur seperti `flake.lock`, mirip dengan file lock versi di cargo/npm. Meskipun eksperimental hingga 1 Februari 2024, fitur-fitur ini telah diadopsi secara luas dalam komunitas Nix karena peningkatan signifikan kemampuan Nix mereka.

Nix New CLI saat ini (fitur eksperimental `nix-command`) digabungkan erat dengan fitur eksperimental Flakes. Meskipun ada upaya berkelanjutan untuk secara eksplisit memisahkan mereka, menggunakan Flakes pada dasarnya memerlukan penggunaan New CLI. Dalam buku ini, yang berfungsi sebagai panduan pemula untuk NixOS dan Flakes, perlu memperkenalkan perbedaan antara New CLI, yang Flakes bergantung padanya, dan CLI lama.

Di sini, kita mencantumkan CLI Nix lama dan konsep terkait yang tidak lagi diperlukan saat menggunakan New CLI dan Flakes (`nix-command` dan `flakes`). Saat meneliti, Anda dapat menggantinya dengan perintah New CLI yang sesuai (kecuali untuk `nix-collect-garbage`, karena saat ini tidak ada alternatif untuk perintah ini):

1. `nix-channel`: `nix-channel` mengelola versi input seperti nixpkgs melalui channel stable/unstable, mirip dengan daftar paket yang digunakan oleh alat manajemen paket lain seperti apt/yum/pacman. Ini adalah yang secara tradisional menyediakan `<nixpkgs>` dalam bahasa Nix.
   1. Dalam Flakes, fungsionalitas `nix-channel` digantikan oleh Flake Registry (`nix registry`) untuk menyediakan "beberapa versi nixpkgs global yang tidak ditentukan" untuk penggunaan CLI interaktif (misalnya `nix run nixpkgs#hello`). Saat menggunakan `flake.nix`, versi input dikelola dalam flake itu sendiri.
   2. Flakes menggunakan bagian `inputs` di `flake.nix` untuk mengelola versi nixpkgs dan input lainnya di setiap Flake alih-alih menggunakan state global.
2. `nix-env`: `nix-env` adalah alat command-line inti untuk Nix klasik yang digunakan untuk mengelola paket perangkat lunak di lingkungan pengguna.

   1. Ini menginstal paket dari sumber data yang ditambahkan oleh `nix-channel`, menyebabkan versi paket yang diinstal dipengaruhi oleh channel. Paket yang diinstal dengan `nix-env` tidak secara otomatis dicatat dalam konfigurasi deklaratif Nix dan sepenuhnya independen dari kontrolnya, membuatnya menantang untuk direproduksi di mesin lain. Meng-upgrade paket yang diinstal oleh `nix-env` lambat dan mungkin menghasilkan hasil yang tidak terduga karena nama atribut di mana paket ditemukan di nixpkgs tidak disimpan.

      Oleh karena itu, tidak disarankan menggunakan perintah ini secara langsung.

   2. Perintah yang sesuai dalam New CLI adalah `nix profile`. Secara pribadi, saya tidak merekomendasikannya untuk pemula.

3. `nix-shell`: `nix-shell` menciptakan lingkungan shell sementara, yang berguna untuk pengembangan dan pengujian.
   1. New CLI: Alat ini dibagi menjadi tiga sub-perintah: `nix develop`, `nix shell`, dan `nix run`. Kami akan membahas tiga perintah ini secara detail dalam bab "[Development](../development/intro.md)".
4. `nix-build`: `nix-build` membangun paket Nix dan menempatkan hasil build di `/nix/store`, tetapi tidak mencatatnya dalam konfigurasi deklaratif Nix.
   1. New CLI: `nix-build` digantikan oleh `nix build`.
5. `nix-collect-garbage`: Perintah garbage collection yang digunakan untuk membersihkan Store Objects yang tidak digunakan di `/nix/store`.
   1. Ada perintah serupa di New CLI, `nix store gc --debug`, tetapi tidak membersihkan generasi profil, jadi saat ini tidak ada alternatif untuk perintah ini.
6. Dan perintah lain yang kurang umum digunakan tidak terdaftar di sini.
   1. Anda dapat merujuk pada daftar perbandingan perintah yang detail di [Try to explain nix commands](https://qiita.com/Sumi-Sumi/items/6de9ee7aab10bc0dbead?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en).

[^1]: [Flakes - NixOS Wiki](https://wiki.nixos.org/wiki/Flakes)

[^2]:
    [Flakes are such an obviously good thing](https://grahamc.com/blog/flakes-are-an-obviously-good-thing/)

[^3]:
    [Draft: 1 year roadmap - NixOS Foundation](https://web.archive.org/web/20250317120825/https://nixos-foundation.notion.site/1-year-roadmap-0dc5c2ec265a477ea65c549cd5e568a9)
