# Topik Lanjutan

Setelah Anda familiar dengan NixOS, Anda dapat menjelajahi topik lanjutan dan mendalami ekosistem Nix. Berikut adalah beberapa sumber daya dan proyek komunitas yang dapat membantu Anda memperluas pengetahuan:

## Komunitas

- [Nix Official - Community](https://nixos.org/community/): Berisi informasi tentang komunitas Nix, forum, chat realtime, meetup, RFC, arsitektur tim resmi, dll.
- [Nix Channel Status](https://status.nixos.org/): Status build dari setiap channel Nix.
- [nix-community/NUR](https://github.com/nix-community/NUR): Meskipun Nixpkgs berisi sejumlah besar paket, beberapa paket tidak termasuk dalam Nixpkgs karena alasan seperti kecepatan review dan perjanjian lisensi. NUR adalah repositori paket Nix terdesentralisasi di mana siapa pun dapat membuat repositori Nix mereka sendiri dan menambahkannya ke NUR agar orang lain dapat menggunakannya. Jika Anda ingin menggunakan paket yang tidak ada di Nixpkgs, Anda dapat mencoba menemukannya di sini. Jika Anda ingin berbagi paket Nix Anda sendiri dengan orang lain, Anda dapat membuat dan berbagi repositori Nix Anda sendiri sesuai dengan README NUR.

## Dokumentasi dan Video

- [Eelco Dolstra - The Purely Functional Software Deployment Model - 2006](https://edolstra.github.io/pubs/phd-thesis.pdf): Disertasi PhD seminal Eelco Dolstra tentang Nix package manager,
- [Nix Reference Manual](https://nixos.org/manual/nix/stable/package-management/profiles.html): Panduan komprehensif untuk Nix package manager, mencakup desain dan penggunaannya dari command line.
- [nixpkgs Manual](https://nixos.org/manual/nixpkgs/unstable/): Manual untuk nixpkgs, yang memperkenalkan parameternya, menjelaskan cara menggunakan, memodifikasi, dan mengemas paket Nix.
- [NixOS Manual](https://nixos.org/manual/nixos/unstable/): Manual pengguna untuk NixOS, menyediakan instruksi konfigurasi untuk komponen tingkat sistem seperti Wayland/X11 dan GPU.
- [nix-pills](https://nixos.org/guides/nix-pills): "Nix Pills" adalah serangkaian panduan yang memberikan penjelasan mendalam tentang membangun paket perangkat lunak dengan Nix. Ini menawarkan penjelasan yang jelas dan dapat dipahami.
- [nixos-in-production](https://github.com/Gabriella439/nixos-in-production): Ini adalah buku work-in-progress yang dihosting di LeanPub tentang memperkenalkan dan memelihara NixOS di lingkungan produksi.

Dan ada banyak video resmi di channel [NixOS Foundation](https://www.youtube.com/@NixOS-Foundation) dan [NixCon](https://www.youtube.com/@NixCon) di YouTube. Berikut adalah beberapa video yang sangat direkomendasikan:

- [Summer of Nix 2022 — Public Lecture Series](https://www.youtube.com/playlist?list=PLt4-_lkyRrOMWyp5G-m_d1wtTcbBaOxZk): Serangkaian ceramah publik yang diselenggarakan oleh NixOS Foundation, dipresentasikan oleh anggota inti komunitas Nix seperti Eelco Dolstra dan Armijn Hemel. Kontennya mencakup sejarah pengembangan Nix, sejarah NixOS, dan masa depan Nix, di antara topik lainnya.
- [Summer of Nix 2023 — Nix Developer Dialogues](https://www.youtube.com/playlist?list=PLt4-_lkyRrOPcBuz_tjm6ZQb-6rJjU3cf): Serangkaian dialog antara anggota inti komunitas Nix pada tahun 2023. Kontennya mencakup evolusi dan tantangan arsitektur Nixpkgs, eksplorasi sistem modul Nix, diskusi tentang ekosistem Nix, aplikasi AI di Nixpkgs, dan aplikasi Nix di bidang komersial dan ekonomi open source.

## Teknik Lanjutan dan Proyek Komunitas

Setelah Anda nyaman dengan Flakes, Anda dapat menjelajahi teknik yang lebih lanjut dan proyek komunitas. Berikut adalah beberapa yang populer untuk dicoba:

- [flake-parts](https://github.com/hercules-ci/flake-parts): Menyederhanakan penulisan dan pemeliharaan konfigurasi menggunakan sistem modul Module.
- [flake-utils-plus](https://github.com/gytis-ivaskevicius/flake-utils-plus): Paket pihak ketiga yang meningkatkan konfigurasi Flake dan menyediakan fitur powerful tambahan.

Ada banyak proyek komunitas berharga lainnya yang layak dijelajahi. Berikut adalah beberapa contoh:

- [nix-output-monitor](https://github.com/maralorn/nix-output-monitor): Menampilkan dengan indah progress build paket Nix, dengan informasi tambahan seperti waktu build dan log build.
- [agenix](https://github.com/ryantm/agenix): Alat untuk manajemen secrets.
- [colmena](https://github.com/zhaofengli/colmena): Alat untuk deployment NixOS.
- [nixos-generators](https://github.com/nix-community/nixos-generators): Alat untuk menghasilkan ISO/qcow2/... dari konfigurasi NixOS.
- [lanzaboote](https://github.com/nix-community/lanzaboote): Mengaktifkan secure boot untuk NixOS.
- [impermanence](https://github.com/nix-community/impermanence): Membantu membuat NixOS stateless dan meningkatkan reprodusibilitas sistem.
- [devbox](https://github.com/jetpack-io/devbox): Lingkungan dev yang ringan dan dapat diulang tanpa masalah container, secara internal didukung oleh nix, mirip dengan earthly.
- [nixpak](https://github.com/nixpak/nixpak): Alat untuk sandbox semua jenis aplikasi yang dikemas Nix, termasuk yang grafis.
- [nixpacks](https://github.com/railwayapp/nixpacks): Nixpacks mengambil direktori sumber dan menghasilkan image yang compliant dengan OCI yang dapat di-deploy di mana saja, mirip dengan buildpacks.
- ...

Proyek-proyek ini menawarkan fungsionalitas dan alat tambahan yang dapat meningkatkan pengalaman NixOS Anda.

Untuk informasi lebih lanjut, lihat [awesome-nix](https://github.com/nix-community/awesome-nix).
