# Nix Store dan Binary Cache

Di sini kami memberikan pengenalan singkat tentang Nix Store, Nix binary cache, dan konsep terkait, tanpa mendalami konfigurasi dan metode penggunaan spesifik, yang akan dibahas secara detail di bab-bab berikutnya.

## Nix Store

Nix Store adalah salah satu konsep inti dari Nix package manager. Ini adalah sistem file read-only yang digunakan untuk menyimpan semua file yang memerlukan immutability, termasuk hasil build paket perangkat lunak, metadata paket perangkat lunak, dan semua input build paket perangkat lunak.

Nix package manager menggunakan bahasa fungsional Nix untuk mendeskripsikan paket perangkat lunak dan dependensinya. Setiap paket perangkat lunak diperlakukan sebagai output dari fungsi murni, dan hasil build paket perangkat lunak disimpan di Nix Store.

Data di Nix Store memiliki format path tetap:

```
/nix/store/b6gvzjyb2pg0kjfwrjmg1vfhh54ad73z-firefox-33.1
|--------| |------------------------------| |----------|
store directory         digest                  name
```

Seperti yang terlihat, path di Nix Store dimulai dengan nilai hash (digest), diikuti dengan nama dan nomor versi paket perangkat lunak. Nilai hash ini dihitung berdasarkan semua informasi input paket perangkat lunak (parameter build, dependensi, versi dependensi, dll.), dan setiap perubahan dalam parameter build atau dependensi akan menghasilkan perubahan nilai hash, sehingga memastikan keunikan setiap path paket perangkat lunak. Selain itu, karena Nix Store adalah sistem file read-only, ini memastikan immutability paket perangkat lunak - sekali paket perangkat lunak dibangun, ia tidak akan berubah.

Karena path penyimpanan hasil build dihitung berdasarkan semua informasi input dari proses build, **informasi input yang sama akan menghasilkan path penyimpanan yang sama**. Desain ini juga dikenal sebagai _Input-addressed Model_.

### Bagaimana NixOS Menggunakan Nix Store

Konfigurasi deklaratif NixOS menghitung paket perangkat lunak mana yang perlu diinstal dan kemudian membuat soft-link path penyimpanan paket-paket ini di Nix Store ke `/run/current-system`, dan dengan memodifikasi variabel lingkungan seperti `PATH` untuk menunjuk ke folder yang sesuai di `/run/current-system`, instalasi paket perangkat lunak tercapai. Setiap kali deployment dilakukan, NixOS menghitung konfigurasi sistem baru, membersihkan symbolic link lama, dan membuat ulang symbolic link baru untuk memastikan bahwa lingkungan sistem sesuai dengan konfigurasi deklaratif.

home-manager bekerja dengan cara yang sama, membuat soft-link paket perangkat lunak yang dikonfigurasi oleh pengguna ke `/etc/profiles/per-user/your-username` dan memodifikasi variabel lingkungan seperti `PATH` untuk menunjuk ke path ini, sehingga menginstal paket perangkat lunak pengguna.

```bash
# Periksa dari mana bash di lingkungan berasal (diinstal menggunakan NixOS)
› which bash
╭───┬─────────┬─────────────────────────────────┬──────────╮
│ # │ command │              path               │   type   │
├───┼─────────┼─────────────────────────────────┼──────────┤
│ 0 │ bash    │ /run/current-system/sw/bin/bash │ external │
╰───┴─────────┴─────────────────────────────────┴──────────╯

› ls -al /run/current-system/sw/bin/bash
lrwxrwxrwx 15 root root 76 1970年 1月 1日 /run/current-system/sw/bin/bash -> /nix/store/1zslabm02hi75anb2w8zjrqwzgs0vrs3-bash-interactive-5.2p26/bin/bash

# Periksa dari mana cowsay di lingkungan berasal (diinstal menggunakan home-manager)
› which cowsay
╭───┬─────────┬────────────────────────────────────────┬──────────╮
│ # │ command │                  path                  │   type   │
├───┼─────────┼────────────────────────────────────────┼──────────┤
│ 0 │ cowsay  │ /etc/profiles/per-user/ryan/bin/cowsay │ external │
╰───┴─────────┴────────────────────────────────────────┴──────────╯

› ls -al /etc/profiles/per-user/ryan/bin/cowsay
lrwxrwxrwx 2 root root 72 1970年 1月 1日 /etc/profiles/per-user/ryan/bin/cowsay -> /nix/store/w2czyf82gxz4vy9kzsdhr88112bmc0c1-home-manager-path/bin/cowsay
```

Perintah `nix develop`, di sisi lain, langsung menambahkan path penyimpanan paket perangkat lunak ke variabel lingkungan seperti `PATH` dan `LD_LIBRARY_PATH`, memungkinkan lingkungan shell yang baru dibuat untuk langsung menggunakan paket perangkat lunak atau library ini.

Misalnya, dalam repositori kode sumber untuk buku ini, [ryan4yin/nixos-and-flakes-book](https://github.com/ryan4yin/nixos-and-flakes-book), setelah menjalankan perintah `nix develop`, kita dapat memeriksa isi variabel lingkungan `PATH`:

```bash
› nix develop
node v22.18.0

› env | egrep '^PATH'
PATH=/nix/store/v0sf67x7sw6pg277amhgf3j84m60wrqn-pre-commit-4.2.0/bin:/nix/store/yva1rk7v7s31dpwkwxcphpqkn5l3bp1f-nodejs-22.18.0-dev/bin:/nix/store/vrqcpwq576gar2i430lj91v37b7k8jw2-nodejs-22.18.0/bin:/nix/store/qzw56f9vai5jg9dm3wbm45r6cc6b65d8-pnpm-10.15.0/bin:/nix/store/n8b4js8xkj12d1jjjqm86p9lwmyhh2rf-yarn-1.22.22/bin:/nix/store/bjhv861k4ri85l1vyrnr954ncsdbw3ri-prettier-3.5.3/bin:/nix/store/m6zld27lmw422ca5zywhkq8kmlaf8inh-git-2.50.1/bin:/nix/store/gz3wn2d2xbl758jsln65za95mdc9yial-typos-1.32.0/bin:/nix/store/bx0wnjpp6mgr6bmh5q1mz9c1ach34lbn-nixfmt-0.6.0-bin/bin:/nix/store/zf4jj08zh07zg1j2s64g8sfjbzfq70lm-pandoc-cli-3.6/bin:/nix/store/g7i75czfbw9sy5f8v7rjbama6lr3ya3s-patchelf-0.15.0/bin:/nix/store/kaj8d1zcn149m40s9h0xi0khakibiphz-gcc-wrapper-14.3.0/bin:/nix/store/8adzgnxs3s0pbj22qhk9zjxi1fqmz3xv-gcc-14.3.0/bin:/nix/store/p2ixvjsas4qw58dcwk01d22skwq4fyka-glibc-2.40-66-bin/bin:/nix/store/rry6qingvsrqmc7ll7jgaqpybcbdgf5v-coreutils-9.7/bin:/nix/store/87zpmcmwvn48z4lbrfba74b312h22s6c-binutils-wrapper-2.44/bin:/nix/store/ap35np2bkwaba3rxs3qlxpma57n2awyb-binutils-2.44/bin:/nix/store/rry6qingvsrqmc7ll7jgaqpybcbdgf5v-coreutils-9.7/bin:/nix/store/392hs9nhm6wfw4imjllbvb1wil1n39qx-findutils-4.10.0/bin:/nix/store/xw0mf3shymq3k7zlncf09rm8917sdi4h-diffutils-3.12/bin:/nix/store/4rpiqv9yr2pw5094v4wc33ijkqjpm9sa-gnused-4.9/bin:/nix/store/l2wvwyg680h0v2la18hz3yiznxy2naqw-gnugrep-3.11/bin:/nix/store/c1z5j28ndxljf1ihqzag57bwpfpzms0g-gawk-5.3.2/bin:/nix/store/w60s4xh1pjg6dwbw7j0b4xzlpp88q5qg-gnutar-1.35/bin:/nix/store/xd9m9jkvrs8pbxvmkzkwviql33rd090j-gzip-1.14/bin:/nix/store/w1pxx760yidi7n9vbi5bhpii9xxl5vdj-bzip2-1.0.8-bin/bin:/nix/store/xk0d14zpm0njxzdm182dd722aqhav2cc-gnumake-4.4.1/bin:/nix/store/cfqbabpc7xwg8akbcchqbq3cai6qq2vs-bash-5.2p37/bin:/nix/store/gj54zvf7vxll1mzzmqhqi1p4jiws3mfb-patch-2.7.6/bin:/nix/store/22rpb6790f346c55iqi6s9drr5qgmyjf-xz-5.8.1-bin/bin:/nix/store/xlmpcglsq8l09qh03rf0virz0331pjdc-file-5.45/bin:/home/ryan/.local/bin:/run/wrappers/bin:/etc/profiles/per-user/ryan/bin:/nix/var/nix/profiles/default/bin:/run/current-system/sw/bin:/home/ryan/go/bin:/home/ryan/.cargo/bin:/home/ryan/.npm/bin:/home/ryan/.local/bin:/home/ryan/go/bin:/home/ryan/.cargo/bin:/home/ryan/.npm/bin
```

Jelas, `nix develop` telah menambahkan path penyimpanan banyak paket perangkat lunak langsung ke variabel lingkungan `PATH`.

## Nix Store Garbage Collection

Nix Store adalah sistem penyimpanan terpusat di mana semua input dan output build paket perangkat lunak disimpan. Seiring penggunaan sistem, jumlah paket perangkat lunak di Nix Store akan meningkat, dan ruang disk yang ditempati akan semakin besar.

Untuk mencegah Nix Store tumbuh tanpa batas, Nix package manager menyediakan mekanisme garbage collection untuk Nix Store lokal, untuk membersihkan data lama dan mengklaim kembali ruang penyimpanan.

Menurut [Chapter 11. The Garbage Collector - nix pills](https://nixos.org/guides/nix-pills/garbage-collector), perintah `nix-store --gc` melakukan garbage collection dengan secara rekursif melintasi semua symbolic link di direktori `/nix/var/nix/gcroots/` untuk menemukan semua paket yang direferensikan dan menghapus yang tidak lagi direferensikan. Perintah `nix-collect-garbage --delete-old` melangkah lebih jauh dengan terlebih dahulu menghapus semua [profiles](https://nixos.org/manual/nix/stable/command-ref/files/profiles) lama dan kemudian menjalankan perintah `nix-store --gc` untuk membersihkan paket yang tidak lagi direferensikan.

Penting untuk dicatat bahwa hasil build dari perintah seperti `nix build` dan `nix develop` tidak secara otomatis ditambahkan ke `/nix/var/nix/gcroots/`, jadi hasil build ini mungkin dibersihkan oleh mekanisme garbage collection. Anda dapat menggunakan `nix-instantiate` dengan `keep-outputs = true` dan cara lain untuk menghindari ini, tetapi saya saat ini lebih suka menyiapkan server binary cache Anda sendiri dan mengkonfigurasi waktu cache yang lebih lama (misalnya satu tahun), kemudian push data ke server cache. Dengan cara ini, Anda dapat berbagi hasil build antar mesin dan menghindari hasil build lokal dibersihkan oleh mekanisme garbage collection lokal, mencapai dua tujuan dalam satu.

## Binary Cache

Desain Nix dan Nix Store memastikan immutability paket perangkat lunak, memungkinkan hasil build dibagikan langsung antar beberapa mesin. Selama mesin-mesin ini menggunakan informasi input yang sama untuk membangun paket, mereka akan mendapatkan path output yang sama, dan Nix dapat menggunakan kembali hasil build dari mesin lain alih-alih membangun ulang paket, sehingga mempercepat instalasi paket perangkat lunak.

Nix binary cache dirancang berdasarkan fitur ini; ini adalah implementasi dari Nix Store yang menyimpan data di server remote alih-alih lokal. Saat diperlukan, Nix package manager mengunduh hasil build yang sesuai dari server remote ke `/nix/store` lokal, menghindari proses build lokal yang memakan waktu.

Nix menyediakan server binary cache resmi di <https://cache.nixos.org>, yang menyimpan cache hasil build untuk sebagian besar paket di nixpkgs untuk arsitektur CPU umum. Saat Anda menjalankan perintah Nix build di mesin lokal Anda, Nix pertama-tama mencoba menemukan binary cache yang sesuai di server cache. Jika ditemukan, ia akan langsung mengunduh file cache, melewati kompilasi lokal yang memakan waktu dan sangat mempercepat proses build.

## Nix Binary Cache Trust Model

**Input-addressed Model** hanya menjamin bahwa input yang sama akan menghasilkan path output yang sama, tetapi tidak memastikan keunikan konten output. Ini berarti bahwa bahkan dengan informasi input yang sama, beberapa build dari paket perangkat lunak yang sama mungkin menghasilkan konten output yang berbeda.

Meskipun Nix telah mengambil langkah-langkah seperti menonaktifkan akses jaringan di lingkungan build dan menggunakan timestamp tetap untuk meminimalkan ketidakpastian, masih ada beberapa faktor yang tidak terkontrol yang dapat mempengaruhi proses build dan menghasilkan konten output yang berbeda. Perbedaan dalam konten output ini biasanya tidak mempengaruhi fungsionalitas paket perangkat lunak tetapi memang menimbulkan tantangan untuk berbagi binary cache yang aman - ketidakpastian dalam konten output membuat sulit untuk menentukan apakah binary cache yang diunduh dari server cache memang dibangun dengan informasi input yang dideklarasikan, dan apakah itu mengandung konten berbahaya.

Untuk mengatasi ini, Nix package manager menggunakan mekanisme penandatanganan kunci publik-privat untuk memverifikasi sumber dan integritas binary cache. Ini menempatkan tanggung jawab keamanan pada pengguna. Jika Anda ingin menggunakan server cache non-resmi untuk mempercepat proses build, Anda harus menambahkan kunci publik server tersebut ke `trusted-public-keys` dan menanggung risiko keamanan yang terkait - server cache mungkin menyediakan data cache yang mencakup konten berbahaya.

### Content-addressed Model

[RFC062 - content-addressed store paths](https://github.com/NixOS/rfcs/blob/master/rfcs/0062-content-addressed-paths.md) adalah upaya oleh komunitas untuk meningkatkan konsistensi hasil build. Ini mengusulkan cara baru untuk menghitung path penyimpanan berdasarkan hasil build (outputs) daripada informasi input (inputs). Desain ini memastikan konsistensi dalam hasil build - jika hasil build berbeda, path penyimpanan juga akan berbeda, sehingga menghindari ketidakpastian dalam konten output yang melekat pada model input-addressed.

Namun, pendekatan ini masih dalam tahap eksperimental dan belum diadopsi secara luas.

## Referensi

- [Nix Store - Nix Manual](https://nixos.org/manual/nix/stable/store/)
