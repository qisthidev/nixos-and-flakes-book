![](/nixos-and-flakes-book.webp)

# Pengenalan Nix & NixOS

Nix adalah package manager deklaratif yang memungkinkan pengguna mendeklarasikan keadaan sistem yang diinginkan dalam file konfigurasi (konfigurasi deklaratif), dan ia bertanggung jawab untuk mencapai keadaan tersebut.

> Sederhananya, "konfigurasi deklaratif" berarti pengguna hanya perlu mendeklarasikan hasil yang diinginkan. Misalnya, jika Anda mendeklarasikan bahwa Anda ingin mengganti window manager i3 dengan sway, Nix akan membantu Anda mencapai tujuan tersebut. Anda tidak perlu khawatir tentang detail yang mendasari, seperti paket apa yang diperlukan sway untuk instalasi, paket terkait i3 mana yang perlu dihapus instalasi, atau penyesuaian yang diperlukan untuk konfigurasi sistem dan variabel lingkungan untuk sway. Nix secara otomatis menangani detail ini untuk pengguna (asalkan paket Nix yang terkait dengan sway dan i3 dirancang dengan benar).

NixOS, distribusi Linux yang dibangun di atas package manager Nix, dapat digambarkan sebagai "OS as Code." Ia menggunakan file konfigurasi Nix deklaratif untuk menggambarkan seluruh keadaan sistem operasi.

Sistem operasi terdiri dari berbagai paket perangkat lunak, file konfigurasi, dan data teks/biner, yang semuanya mewakili keadaan sistem saat ini. Konfigurasi deklaratif hanya dapat mengelola bagian statis dari keadaan ini. Data dinamis, seperti data PostgreSQL, MySQL, atau MongoDB, tidak dapat dikelola secara efektif melalui konfigurasi deklaratif (tidak layak untuk menghapus semua data PostgreSQL baru yang tidak dideklarasikan dalam konfigurasi selama setiap deployment). Oleh karena itu, **NixOS terutama berfokus pada pengelolaan bagian statis dari keadaan sistem secara deklaratif**. Data dinamis, bersama dengan konten di direktori home pengguna, tetap tidak terpengaruh oleh NixOS ketika rollback ke generasi sebelumnya.

Meskipun kita tidak dapat mencapai reprodusibilitas sistem yang lengkap, direktori `/home`, sebagai direktori pengguna yang penting, berisi banyak file konfigurasi yang diperlukan - [Dotfiles](https://wiki.archlinux.org/title/Dotfiles). Sebuah proyek komunitas signifikan yang disebut [home-manager](https://github.com/nix-community/home-manager) dirancang untuk mengelola paket tingkat pengguna dan file konfigurasi dalam direktori home pengguna.

Karena fitur Nix, seperti deklaratif dan dapat direproduksi, Nix tidak terbatas pada pengelolaan lingkungan desktop tetapi juga digunakan secara luas untuk mengelola lingkungan pengembangan, lingkungan kompilasi, mesin virtual cloud, dan konstruksi image container. [NixOps](https://github.com/NixOS/nixops) (proyek resmi Nix) dan [colmena](https://github.com/zhaofengli/colmena) (proyek komunitas) adalah kedua alat operasional berdasarkan Nix.

## Mengapa NixOS?

Saya pertama kali belajar tentang package manager Nix beberapa tahun yang lalu. Ia menggunakan bahasa Nix untuk menggambarkan konfigurasi sistem. NixOS, distribusi Linux yang dibangun di atasnya, memungkinkan untuk rollback sistem ke keadaan sebelumnya (meskipun hanya keadaan yang dideklarasikan dalam file konfigurasi Nix yang dapat di-rollback). Meskipun terdengar mengesankan, saya merasa merepotkan untuk mempelajari bahasa baru dan menulis kode untuk menginstal paket, jadi saya tidak mengejarnya pada waktu itu.

Namun, saya baru-baru ini mengalami banyak masalah lingkungan saat menggunakan EndeavourOS, dan menyelesaikannya menghabiskan banyak energi saya, membuat saya kelelahan. Setelah pertimbangan yang cermat, saya menyadari bahwa kurangnya mekanisme kontrol versi dan rollback di EndeavourOS mencegah saya mengembalikan sistem ketika masalah muncul.

Saat itulah saya memutuskan untuk beralih ke NixOS.

Yang menyenangkan, NixOS telah melampaui harapan saya. Aspek yang paling menakjubkan adalah bahwa saya sekarang dapat mengembalikan seluruh lingkungan i3 saya dan semua paket yang umum saya gunakan pada host NixOS baru hanya dengan satu perintah `sudo nixos-rebuild switch --flake .`. Ini benar-benar fantastis!

Kemampuan rollback dan reprodusibilitas NixOS telah menanamkan banyak kepercayaan diri pada saya—saya tidak lagi takut merusak sistem. Saya bahkan telah berani bereksperimen dengan hal-hal baru di NixOS, seperti kompositor hyprland. Sebelumnya, di EndeavourOS, saya tidak akan berani mengutak-atik kompositor novel semacam itu, karena setiap kerusakan sistem akan memerlukan troubleshooting manual yang signifikan menggunakan berbagai solusi sementara.

Saat saya semakin terlibat dengan NixOS dan Nix, saya menemukan bahwa ini juga sangat cocok untuk mengelola konfigurasi beberapa host secara sinkron. Saat ini [nix-config](https://github.com/ryan4yin/nix-config) pribadi saya mengelola konfigurasi banyak host secara sinkron:

- Komputer desktop
  - 1 Macbook Pro 2022 (M2 aarch64).
  - 1 Macbook Pro 2024 (M4Pro aarch64).
  - 1 PC desktop NixOS (amd64).
- Server
  - 10+ mesin virtual NixOS (amd64).
  - Beberapa development board untuk aarch64 dan riscv64.

Lingkungan pengembangan dari tiga komputer desktop dikelola oleh Home Manager, konfigurasi utama sepenuhnya dibagikan, dan konfigurasi yang dimodifikasi pada host mana pun dapat disinkronkan dengan mulus ke host lain melalui Git.

Nix hampir sepenuhnya melindungi saya dari perbedaan antara OS dan arsitektur di bagian bawah dari tiga mesin, dan pengalamannya sangat lancar!
