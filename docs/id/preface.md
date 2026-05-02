# Kata Pengantar

## Kesulitan Pemula NixOS - Dokumentasi dan Flakes

NixOS adalah distribusi Linux yang sangat khas yang dibangun di atas package manager Nix, dengan filosofi desain yang membedakannya dari distribusi tradisional seperti Ubuntu, CentOS, Arch Linux dan lainnya.

Salah satu keunggulan utama NixOS dibandingkan distribusi lain terletak pada reprodusibilitas dan konfigurasi deklaratifnya, yang memungkinkan pengguna mereplikasi lingkungan sistem yang konsisten di berbagai mesin.

Meskipun NixOS sangat powerful, kekuatannya juga disertai dengan peningkatan kompleksitas sistem. Hal ini membuatnya lebih menantang bagi pendatang baru. Salah satu tantangan utama adalah bahwa pengetahuan yang dikumpulkan dari distribusi Linux lain tidak mudah ditransfer ke NixOS. Tantangan lainnya adalah dokumentasi resmi dan komunitas sering tersebar dan usang. Masalah-masalah ini telah mengganggu banyak pemula NixOS.

Seseorang dapat mengamati masalah ini dengan fitur eksperimental dari package manager Nix yang disebut Flakes. Terinspirasi oleh package manager seperti npm dan Cargo, Flakes menggunakan `flake.nix` untuk mencatat semua dependensi eksternal dan `flake.lock` untuk mengunci versinya. Ini secara signifikan meningkatkan reprodusibilitas dan komposabilitas dari package manager Nix dan konfigurasi NixOS.

Keunggulan Flakes telah membuatnya sangat populer di dalam komunitas: menurut survei resmi, lebih dari setengah dari repositori Nix baru yang dibuat di GitHub sekarang menggunakan Flakes.

Namun, untuk menjaga stabilitas, dokumentasi resmi hampir tidak mencakup konten terkait Flakes. Hal ini membuat banyak pengguna Nix/NixOS merasa bingung. Mereka melihat semua orang menggunakan Flakes dan ingin mempelajarinya juga, tetapi tidak menemukan tempat untuk memulai, sering kali harus menyatukan informasi yang tersebar, mencari melalui kode sumber Nixpkgs, atau meminta bantuan dari pengguna yang lebih berpengalaman.

## Asal Usul Buku Ini

Buku ini berasal dari catatan saya yang tersebar ketika saya pertama kali mulai dengan NixOS.

Pada bulan April tahun ini (2023), ketika saya mengenal NixOS, saya jatuh cinta dengan filosofi desainnya. Atas rekomendasi seorang teman, saya belajar tentang fitur eksperimental Flakes dari Nix. Setelah membandingkan Flakes dengan metode konfigurasi NixOS tradisional, saya menyadari bahwa hanya NixOS yang diaktifkan dengan Flakes yang memenuhi harapan saya. Akibatnya, saya sepenuhnya mengabaikan pendekatan konfigurasi Nix tradisional dan langsung belajar mengonfigurasi sistem NixOS saya menggunakan Flakes selama langkah awal saya.

Sepanjang proses pembelajaran saya, saya menemukan bahwa ada sangat sedikit sumber Flakes yang ramah pemula. Sebagian besar dokumentasi berfokus pada pendekatan konfigurasi Nix tradisional, memaksa saya untuk mengekstrak informasi yang saya butuhkan dari berbagai sumber seperti NixOS Wiki, Zero to Nix, Nixpkgs Manual, dan kode sumber Nixpkgs sambil mengabaikan konten yang tidak terkait dengan Flakes. Perjalanan pembelajaran ini cukup berbelit-belit dan menyakitkan. Untuk mencegah tersandung di masa depan, saya dengan tekun mendokumentasikan banyak catatan yang tersebar saat saya maju.

Dengan beberapa pengalaman di bawah ikat pinggang saya, pada awal Mei tahun ini, saya mengalihkan PC utama saya ke NixOS. Setelah mengatur dan menyempurnakan catatan pemula NixOS saya, saya menerbitkannya di blog saya[^1] dan membagikannya di komunitas Tionghoa NixOS. Komunitas Tionghoa merespons dengan positif, dan berdasarkan saran mereka, saya menerjemahkan artikel tersebut ke dalam bahasa Inggris dan membagikannya di Reddit, menerima umpan balik yang kuat[^2].

Sambutan positif dari dokumen yang dibagikan ini mendorong saya dan mendorong saya untuk terus memperbaikinya. Melalui pembaruan berkelanjutan, konten dokumen ini berkembang menjadi lebih dari 20.000 kata. Beberapa pembaca menyarankan bahwa pengalaman membaca dapat ditingkatkan, mengarahkan saya ke saran mereka[^3]. Akibatnya, saya memigrasikan konten artikel ke repositori GitHub, membuat situs dokumentasi khusus, dan menyesuaikan presentasi agar lebih selaras dengan panduan pemula daripada buku catatan pribadi.

Dan begitu, sebuah buku open-source bilingual lahir, yang saya beri nama "<NixOS & Flakes Book>" dengan judul Tionghoa "NixOS & Flakes 新手指南" ("Panduan Pemula NixOS & Flakes").

Konten buku open-source ini berkembang langkah demi langkah saat saya menggunakan NixOS dan berinteraksi dengan pembaca. Rasa pencapaian dari umpan balik positif pembaca telah menjadi motivasi terbesar saya untuk pembaruan. Umpan balik beberapa pembaca sangat membantu dalam "evolusinya". Awalnya, saya hanya ingin berbagi pengalaman saya dengan NixOS dengan cara yang agak santai, tetapi secara tak terduga berubah menjadi buku open-source. Pembacanya di luar negeri bahkan melampaui pembaca di negara saya sendiri, dan mendapatkan banyak bintang - hasil yang tidak pernah saya antisipasi.

Saya berterima kasih kepada semua teman yang telah berkontribusi pada buku ini dan menawarkan saran, dan saya menghargai semua dukungan dan dorongan dari pembaca. Tanpa kalian semua, konten buku ini mungkin tetap terbatas pada blog pribadi saya, dan tidak akan mencapai bentuknya saat ini.

## Fitur-Fitur Buku Ini

1. Fokus pada NixOS dan Flakes, mengabaikan pendekatan konfigurasi Nix tradisional.
2. Ramah pemula, dengan penjelasan dari perspektif pendatang baru NixOS yang memiliki pengalaman dengan penggunaan Linux dan pemrograman.
3. Pembelajaran bertahap, progresif.
4. Sebagian besar bab dalam buku ini menyediakan tautan referensi di akhir, memudahkan pembaca untuk mendalami topik dan mengevaluasi kredibilitas konten.
5. Konten koheren, terorganisir dengan baik, dan terstruktur. Pembaca dapat membaca buku secara bertahap atau dengan cepat menemukan informasi yang mereka butuhkan.

## Donasi

Jika Anda merasa buku ini bermanfaat, pertimbangkan untuk memberikan donasi untuk mendukung pengembangannya.

- GitHub: <https://github.com/sponsors/ryan4yin>
- Patreon: <https://patreon.com/ryan4yin>
- Buy me a coffee: <https://buymeacoffee.com/ryan4yin>
- 爱发电: <https://afdian.com/a/ryan4yin>
- Ethereum: `0xB74Aa43C280cDc8d8236952400bF6427E4390855`

## Umpan Balik dan Diskusi

Saya bukan ahli NixOS, dan saya hanya menggunakan NixOS kurang dari 9 bulan hingga sekarang (2024-02), jadi pasti ada beberapa kesalahpahaman atau kasus kompleks dalam buku ini. Jika ada yang menemukan sesuatu yang salah atau memiliki pertanyaan / saran, beri tahu saya dengan membuka issue atau bergabung dalam diskusi di [GitHub Discussions](https://github.com/ryan4yin/nixos-and-flakes-book/discussions). Saya senang untuk terus meningkatkan konten buku ini.

Alasan mengapa saya menulis buku kecil ini hanya karena tidak ada orang di komunitas yang melakukannya untuk saya, yang merupakan pemula pada waktu itu, jadi saya memilih untuk melakukannya sendiri. Meskipun saya tahu saya bisa membuat kesalahan, ini jauh lebih baik daripada tidak melakukan apa-apa.

Harapan saya adalah bahwa buku ini dapat membantu lebih banyak orang, memungkinkan mereka merasakan kegembiraan NixOS. Semoga Anda menyukainya!

## Umpan Balik dan Diskusi Historis tentang Buku Ini

Umpan balik bahasa Inggris dan diskusi terkait:

- [[2023-05-11] NixOS & Nix Flakes - A Guide for Beginners - Reddit](https://www.reddit.com/r/NixOS/comments/13dxw9d/nixos_nix_flakes_a_guide_for_beginners/)
- [[2023-06-22] Updates: NixOS & Nix Flakes - A Guide for Beginners - Reddit](https://www.reddit.com/r/NixOS/comments/14fvz1q/updates_nixos_nix_flakes_a_guide_for_beginners/)
- [[2023-06-24] An unofficial NixOS & Flakes book for beginners - Discourse](https://discourse.nixos.org/t/an-unofficial-nixos-flakes-book-for-beginners/29561)
- [[2023-07-06] This isn't an issue but it has to be said: - Discussions](https://github.com/ryan4yin/nixos-and-flakes-book/discussions/43)

Umpan balik dan diskusi bahasa Tionghoa:

- [[2023-05-09] NixOS 与 Nix Flakes 新手入门 - v2ex 社区](https://www.v2ex.com/t/938569#reply45)
- [[2023-06-24] NixOS 与 Flakes | 一份非官方的新手指南 - v2ex 社区](https://www.v2ex.com/t/951190#reply9)
- [[2023-06-24] NixOS 与 Flakes | 一份非官方的新手指南 - 0xffff 社区](https://0xffff.one/d/1547-nixos-yu-flakes-yi-fen-fei-guan)

[^1]:
    [NixOS & Nix Flakes - A Guide for Beginners - This Cute World](https://thiscute.world/en/posts/nixos-and-flake-basics/)

[^2]:
    [NixOS & Nix Flakes - A Guide for Beginners - Reddit](https://www.reddit.com/r/NixOS/comments/13dxw9d/nixos_nix_flakes_a_guide_for_beginners/)

[^3]:
    [Updates: NixOS & Nix Flakes - A Guide for Beginners - Reddit](https://www.reddit.com/r/NixOS/comments/14fvz1q/comment/jp4xhj3/?context=3)
