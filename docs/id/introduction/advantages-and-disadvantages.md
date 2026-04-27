# Kelebihan & Kekurangan NixOS

## Kelebihan NixOS

- **Konfigurasi Deklaratif, OS as Code**
  - NixOS menggunakan konfigurasi deklaratif untuk mengelola seluruh lingkungan sistem. Konfigurasi ini dapat dikelola langsung dengan Git, memungkinkan sistem untuk dikembalikan ke keadaan historis apa pun selama file konfigurasi dipertahankan (asalkan keadaan yang diinginkan dideklarasikan dalam konfigurasi Nix).
  - Nix Flakes lebih meningkatkan reprodusibilitas dengan memanfaatkan file lock versi `flake.lock`, yang mencatat alamat sumber data, nilai hash, dan informasi relevan lainnya untuk semua dependensi. Desain ini sangat meningkatkan reprodusibilitas Nix dan memastikan hasil build yang konsisten. Ini mengambil inspirasi dari desain manajemen paket dalam bahasa pemrograman seperti Cargo dan npm.
- **Kemampuan Kustomisasi Sistem yang Sangat Nyaman**
  - Hanya dengan beberapa perubahan konfigurasi, berbagai komponen sistem dapat dengan mudah diganti. Nix merangkum semua operasi kompleks yang mendasari dalam paket Nix, menyediakan pengguna dengan seperangkat parameter deklaratif yang ringkas.
  - Modifikasi aman dan beralih antara lingkungan desktop yang berbeda (seperti GNOME, KDE, i3, dan sway) mudah, dengan hambatan minimal.
- **Kemampuan Rollback**
  - Dimungkinkan untuk rollback ke keadaan sistem sebelumnya, dan NixOS bahkan menyertakan semua versi lama dalam opsi boot secara default, memastikan kemampuan untuk dengan mudah mengembalikan perubahan. Akibatnya, Nix dianggap sebagai salah satu pendekatan manajemen paket yang paling stabil.
- **Tidak Ada Masalah Konflik Dependensi**
  - Setiap paket perangkat lunak di Nix memiliki hash unik, yang dimasukkan ke dalam jalur instalasinya, memungkinkan beberapa versi hidup berdampingan.
- **Komunitas aktif, dengan beragam proyek pihak ketiga**
  - Repositori paket resmi, nixpkgs, memiliki banyak kontributor, dan banyak orang membagikan konfigurasi Nix mereka. Menjelajahi ekosistem NixOS adalah pengalaman yang menarik, mirip dengan menemukan benua baru.

<figure>
  <img src="/nixos-bootloader.avif">
  <figcaption>
    <h4 align="center">
      Semua versi historis terdaftar dalam opsi boot NixOS. <br>
      Gambar dari
      <a href="https://discourse.nixos.org/t/how-to-make-uefis-grub2-menu-the-same-as-bioss-one/10074" target="_blank" rel="noopener noreferrer">
        NixOS Discourse - 10074
      </a>
    </h4>
  </figcaption>
</figure>

## Kekurangan NixOS

- **Kurva Pembelajaran yang Tinggi**:
  - Mencapai reprodusibilitas lengkap dan menghindari hambatan yang terkait dengan penggunaan yang tidak tepat memerlukan pembelajaran tentang seluruh desain Nix dan mengelola sistem secara deklaratif, daripada secara membabi buta menggunakan perintah seperti `nix-env -i` (mirip dengan `apt-get install`).
- **Dokumentasi yang Tidak Terorganisir**:
  - Saat ini, Nix Flakes tetap menjadi fitur eksperimental, dan ada dokumentasi terbatas yang secara khusus berfokus padanya. Sebagian besar dokumentasi komunitas Nix terutama mencakup `/etc/nixos/configuration.nix` klasik. Jika Anda ingin mulai belajar langsung dari Nix Flakes(`flake.nix`), Anda perlu merujuk pada sejumlah besar dokumentasi usang dan mengekstrak informasi yang relevan. Selain itu, beberapa fitur inti Nix, seperti `imports` dan Sistem Modul Nixpkgs, kurang dokumentasi resmi yang detail, memerlukan analisis kode sumber.
- **Peningkatan Penggunaan Ruang Disk**:
  - Untuk memastikan kemampuan rollback sistem kapan saja, Nix mempertahankan semua lingkungan historis secara default, menghasilkan peningkatan penggunaan ruang disk.
  - Meskipun penggunaan ruang tambahan ini mungkin bukan masalah di komputer desktop, ini dapat menjadi masalah di server cloud dengan sumber daya terbatas.
- **Pesan Error yang Tidak Jelas**:
  - Karena [algoritma penggabungan yang kompleks](https://discourse.nixos.org/t/best-resources-for-learning-about-the-nixos-module-system/1177/4) dari [sistem modul Nixpkgs](../other-usage-of-flakes/module-system.md), pesan error NixOS cukup buruk. Dalam banyak kasus, terlepas dari apakah Anda menambahkan `--show-trace`, itu hanya akan memberi tahu Anda bahwa ada error dalam kode (pesan error yang paling umum dan membingungkan adalah [Infinite recursion encountered](https://discourse.nixos.org/t/infinite-recursion-encountered-by-making-module-configurable/23508/2)), tetapi di mana tepatnya errornya? Sistem tipe mengatakan tidak tahu, jadi Anda harus menemukannya sendiri. Dalam pengalaman saya, **cara paling sederhana dan paling efektif untuk menangani pesan error yang tidak berarti ini adalah menggunakan "binary search" untuk secara bertahap mengembalikan kode**.
  - Masalah ini mungkin merupakan titik sakit terbesar NixOS saat ini.
- **Implementasi yang Lebih Kompleks di Bawahnya**:
  - Abstraksi deklaratif Nix memperkenalkan kompleksitas tambahan dalam kode yang mendasari dibandingkan dengan kode serupa dalam alat imperatif tradisional.
  - Kompleksitas ini meningkatkan kesulitan implementasi dan membuatnya lebih menantang untuk membuat modifikasi khusus di tingkat yang lebih rendah. Namun, beban ini terutama jatuh pada pengelola paket Nix, karena pengguna biasa memiliki eksposur terbatas pada kompleksitas yang mendasari, mengurangi beban mereka.

## Ringkasan

Secara keseluruhan, saya percaya bahwa NixOS cocok untuk pengembang dengan tingkat pengalaman penggunaan Linux dan pengetahuan pemrograman tertentu yang menginginkan kontrol lebih besar atas sistem mereka.

Saya tidak merekomendasikan pendatang baru tanpa pengalaman penggunaan Linux apa pun untuk langsung terjun ke NixOS, karena ini dapat menyebabkan perjalanan yang membuat frustrasi.

> Jika Anda memiliki lebih banyak pertanyaan tentang NixOS, Anda dapat merujuk pada bab terakhir buku ini, [FAQ](../faq/).
