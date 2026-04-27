# Modularisasi Konfigurasi NixOS Anda

Pada titik ini, kerangka seluruh sistem telah dikonfigurasi. Struktur konfigurasi saat ini di `/etc/nixos` seharusnya sebagai berikut:

```
$ tree
.
├── flake.lock
├── flake.nix
├── home.nix
└── configuration.nix
```

Fungsi dari keempat file ini adalah:

- `flake.lock`: File lock versi yang dihasilkan secara otomatis yang merekam semua sumber input, nilai hash, dan nomor versi dari seluruh flake untuk memastikan reprodusibilitas.
- `flake.nix`: File entry yang akan dikenali dan di-deploy ketika menjalankan `sudo nixos-rebuild switch`. Lihat [Flakes - NixOS Wiki](https://wiki.nixos.org/wiki/Flakes) untuk semua opsi flake.nix.
- `configuration.nix`: Diimpor sebagai modul Nix di flake.nix, semua konfigurasi tingkat sistem saat ini ditulis di sini. Lihat [Configuration - NixOS Manual](https://nixos.org/manual/nixos/unstable/index.html#ch-configuration) untuk semua opsi configuration.nix.
- `home.nix`: Diimpor oleh Home-Manager sebagai konfigurasi pengguna `ryan` di flake.nix, berisi semua konfigurasi `ryan` dan mengelola folder home `ryan`. Lihat [Appendix A. Configuration Options - Home-Manager](https://nix-community.github.io/home-manager/options.xhtml) untuk semua opsi home.nix.

Dengan memodifikasi file-file ini, Anda dapat secara deklaratif mengubah status sistem dan direktori home.

Namun, seiring pertumbuhan konfigurasi, hanya mengandalkan `configuration.nix` dan `home.nix` dapat menyebabkan file yang membengkak dan sulit dipelihara. Solusi yang lebih baik adalah menggunakan sistem modul Nix untuk membagi konfigurasi menjadi beberapa modul Nix dan menulisnya secara terklasifikasi.

Bahasa Nix menyediakan [fungsi import](https://nix.dev/tutorials/nix-language.html#import) dengan aturan khusus:

> Jika parameter `import` adalah path folder, ia akan mengembalikan hasil eksekusi file `default.nix` di folder tersebut.

Sistem modul Nixpkgs menyediakan parameter serupa, `imports`, yang menerima daftar file `.nix` dan **menggabungkan** semua konfigurasi yang didefinisikan dalam file-file ini ke dalam modul Nix saat ini.

Perhatikan bahwa `imports` tidak akan sekedar menimpa konfigurasi duplikat tetapi menanganinya dengan lebih wajar. Misalnya, jika `program.packages = [...]` didefinisikan dalam beberapa modul, maka `imports` akan menggabungkan semua `program.packages` yang didefinisikan dalam semua modul Nix menjadi satu daftar. Set atribut juga dapat digabungkan dengan benar. Perilaku spesifik dapat Anda eksplorasi sendiri.

> Saya hanya menemukan deskripsi `imports` di [Nixpkgs-Unstable Official Manual - evalModules Parameters](https://nixos.org/manual/nixpkgs/unstable/#module-system-lib-evalModules-parameters): `A list of modules. These are merged together to form the final configuration.` Sedikit ambigu...

Dengan bantuan `imports`, kita dapat membagi `home.nix` dan `configuration.nix` menjadi beberapa modul Nix yang didefinisikan dalam file `.nix` yang berbeda. Mari kita lihat contoh modul `packages.nix`:

```nix
{
  config,
  pkgs,
  ...
}: {
  imports = [
    (import ./special-fonts-1.nix {inherit config pkgs;}) # (1)
    ./special-fonts-2.nix # (2)
  ];

  fontconfig.enable = true;
}
```

Modul ini memuat dua modul lain dalam bagian imports, yaitu `special-fonts-1.nix` dan `special-fonts-2.nix`. Kedua file tersebut adalah modul itu sendiri dan terlihat mirip dengan ini.

```nix
{ config, pkgs, ...}: {
  # Configuration stuff ...
}
```

Kedua pernyataan import di atas setara dalam parameter yang mereka terima:

- Pernyataan `(1)` mengimpor fungsi dalam `special-fonts-1.nix` dan memanggilnya dengan meneruskan `{config = config; pkgs = pkgs}`. Pada dasarnya menggunakan nilai kembalian dari panggilan (sebuah _attribute set_ konfigurasi parsial lainnya) di dalam daftar `imports`.

- Pernyataan `(2)` mendefinisikan path ke sebuah modul, yang fungsinya akan di-load Nix _secara otomatis_ saat merakit konfigurasi `config`. Ini akan meneruskan semua argumen yang cocok dari fungsi dalam `packages.nix` ke fungsi yang di-load di `special-fonts-2.nix` yang menghasilkan `import ./special-fonts-2.nix {config = config; pkgs = pkgs}`.

Berikut adalah contoh starter yang bagus untuk modularisasi konfigurasi, sangat direkomendasikan:

- [Misterio77/nix-starter-configs](https://github.com/Misterio77/nix-starter-configs)

Contoh yang lebih rumit, [ryan4yin/nix-config/i3-kickstarter](https://github.com/ryan4yin/nix-config/tree/i3-kickstarter) adalah konfigurasi sistem NixOS saya sebelumnya dengan window manager i3. Strukturnya adalah sebagai berikut:

```shell
├── flake.lock
├── flake.nix
├── home
│   ├── default.nix         # di sini kita mengimpor semua submodul dengan imports = [...]
│   ├── fcitx5              # konfigurasi metode input fcitx5
│   │   ├── default.nix
│   │   └── rime-data-flypy
│   ├── i3                  # konfigurasi window manager i3
│   │   ├── config
│   │   ├── default.nix
│   │   ├── i3blocks.conf
│   │   ├── keybindings
│   │   └── scripts
│   ├── programs
│   │   ├── browsers.nix
│   │   ├── common.nix
│   │   ├── default.nix   # di sini kita mengimpor semua modul dalam folder programs dengan imports = [...]
│   │   ├── git.nix
│   │   ├── media.nix
│   │   ├── vscode.nix
│   │   └── xdg.nix
│   ├── rofi              # konfigurasi rofi launcher
│   │   ├── configs
│   │   │   ├── arc_dark_colors.rasi
│   │   │   ├── arc_dark_transparent_colors.rasi
│   │   │   ├── power-profiles.rasi
│   │   │   ├── powermenu.rasi
│   │   │   ├── rofidmenu.rasi
│   │   │   └── rofikeyhint.rasi
│   │   └── default.nix
│   └── shell             # konfigurasi terkait shell/terminal
│       ├── common.nix
│       ├── default.nix
│       ├── nushell
│       │   ├── config.nu
│       │   ├── default.nix
│       │   └── env.nu
│       ├── starship.nix
│       └── terminals.nix
├── hosts
│   ├── msi-rtx4090      # konfigurasi mesin utama saya
│   │   ├── default.nix  # Ini adalah configuration.nix lama, tetapi sebagian besar konten telah dipecah ke modul.
│   │   └── hardware-configuration.nix  # konfigurasi terkait hardware & disk, dihasilkan otomatis oleh nixos
│   └── my-nixos       # konfigurasi mesin test saya
│       ├── default.nix
│       └── hardware-configuration.nix
├── modules          # beberapa modul NixOS umum yang dapat digunakan kembali
│   ├── i3.nix
│   └── system.nix
└── wallpaper.jpg    # wallpaper
```

Tidak perlu mengikuti struktur di atas, Anda dapat mengatur konfigurasi Anda dengan cara apa pun yang Anda suka. Kuncinya adalah menggunakan `imports` untuk mengimpor semua submodul ke dalam modul utama.

## `lib.mkOverride`, `lib.mkDefault`, dan `lib.mkForce`

Di Nix, beberapa orang menggunakan `lib.mkDefault` dan `lib.mkForce` untuk mendefinisikan nilai. Fungsi-fungsi ini dirancang untuk menetapkan nilai default atau memaksa nilai opsi.

Anda dapat mengeksplorasi kode sumber `lib.mkDefault` dan `lib.mkForce` dengan menjalankan `nix repl -f '<nixpkgs>'` dan kemudian memasukkan `:e lib.mkDefault`. Untuk mempelajari lebih lanjut tentang `nix repl`, ketik `:?` untuk informasi bantuan.

Berikut kode sumbernya:

```nix
  # ......

  mkOverride = priority: content: {
    _type = "override";
    inherit priority content;
  };

  mkOptionDefault = mkOverride 1500; # priority of option defaults
  mkDefault = mkOverride 1000; # used in config sections of non-user modules to set a default
  defaultOverridePriority = 100;
  mkImageMediaOverride = mkOverride 60; # image media profiles can be derived by inclusion into host config, hence needing to override host config, but do allow user to mkForce
  mkForce = mkOverride 50;
  mkVMOverride = mkOverride 10; # used by 'nixos-rebuild build-vm'

  # ......
```

Singkatnya, `lib.mkDefault` digunakan untuk menetapkan nilai default opsi dengan prioritas 1000 secara internal, dan `lib.mkForce` digunakan untuk memaksa nilai opsi dengan prioritas 50 secara internal. Jika Anda menetapkan nilai opsi secara langsung, itu akan diatur dengan prioritas default 100 (didefinisikan oleh `defaultoverridepriority`), yang lebih tinggi dari `lib.mkDefault` sehingga nilai default akan ditimpa.

Semakin rendah nilai `priority`, semakin tinggi prioritas sebenarnya. Akibatnya, `lib.mkForce` memiliki prioritas lebih tinggi daripada `lib.mkDefault`. Jika Anda mendefinisikan beberapa nilai dengan prioritas yang sama, Nix akan memunculkan error.

Menggunakan fungsi-fungsi ini dapat sangat membantu untuk modularisasi konfigurasi. Anda dapat menetapkan nilai default dalam modul tingkat rendah (modul dasar) dan memaksa nilai dalam modul tingkat tinggi.

Misalnya, dalam konfigurasi saya di [ryan4yin/nix-config/blob/c515ea9/modules/nixos/core-server.nix](https://github.com/ryan4yin/nix-config/blob/c515ea9/modules/nixos/core-server.nix#L32), saya mendefinisikan nilai default seperti ini:

```nix{6}
{ lib, pkgs, ... }:

{
  # ......

  nixpkgs.config.allowUnfree = lib.mkDefault false;

  # ......
}
```

Kemudian, untuk mesin desktop saya, saya menimpa nilai di [ryan4yin/nix-config/blob/c515ea9/modules/nixos/core-desktop.nix](https://github.com/ryan4yin/nix-config/blob/c515ea9/modules/nixos/core-desktop.nix#L18) seperti ini:

```nix{10}
{ lib, pkgs, ... }:

{
  # import the base module
  imports = [
    ./core-server.nix
  ];

  # override the default value defined in the base module
  nixpkgs.config.allowUnfree = lib.mkForce true;

  # ......
}
```

## `lib.mkOrder`, `lib.mkBefore`, dan `lib.mkAfter`

Selain `lib.mkDefault` dan `lib.mkForce`, ada juga `lib.mkBefore` dan `lib.mkAfter`, yang digunakan untuk mengatur urutan penggabungan **opsi tipe list**. Fungsi-fungsi ini lebih lanjut berkontribusi pada modularisasi konfigurasi.

> Saya belum menemukan dokumentasi resmi untuk opsi tipe list, tetapi saya cukup memahami bahwa mereka adalah tipe yang hasil penggabungannya terkait dengan urutan penggabungan. Menurut pemahaman ini, baik tipe `list` maupun `string` adalah opsi tipe list, dan fungsi-fungsi ini memang dapat digunakan pada kedua tipe tersebut dalam praktiknya.

Seperti disebutkan sebelumnya, ketika Anda mendefinisikan beberapa nilai dengan **prioritas override** yang sama, Nix akan memunculkan error. Namun, dengan menggunakan `lib.mkOrder`, `lib.mkBefore`, atau `lib.mkAfter`, Anda dapat mendefinisikan beberapa nilai dengan prioritas override yang sama, dan mereka akan digabungkan dalam urutan yang Anda tentukan.

Untuk memeriksa kode sumber `lib.mkBefore`, Anda dapat menjalankan `nix repl -f '<nixpkgs>'` dan kemudian memasukkan `:e lib.mkBefore`. Untuk mempelajari lebih lanjut tentang `nix repl`, ketik `:?` untuk informasi bantuan:

```nix
  # ......

  mkOrder = priority: content:
    { _type = "order";
      inherit priority content;
    };

  mkBefore = mkOrder 500;
  defaultOrderPriority = 1000;
  mkAfter = mkOrder 1500;

  # ......
```

Oleh karena itu, `lib.mkBefore` adalah singkatan untuk `lib.mkOrder 500`, dan `lib.mkAfter` adalah singkatan untuk `lib.mkOrder 1500`.

Untuk menguji penggunaan `lib.mkBefore` dan `lib.mkAfter`, mari kita buat proyek Flake sederhana:

```nix{8-36}
# flake.nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  outputs = {nixpkgs, ...}: {
    nixosConfigurations = {
      "my-nixos" = nixpkgs.lib.nixosSystem {
        modules = [
          ({lib, ...}: {
            programs.bash.shellInit = lib.mkBefore ''
              echo 'insert before default'
            '';
            programs.zsh.shellInit = lib.mkBefore "echo 'insert before default';";
            nix.settings.substituters = lib.mkBefore [
              "https://nix-community.cachix.org"
            ];
          })

          ({lib, ...}: {
            programs.bash.shellInit = lib.mkAfter ''
              echo 'insert after default'
            '';
            programs.zsh.shellInit = lib.mkAfter "echo 'insert after default';";
            nix.settings.substituters = lib.mkAfter [
              "https://ryan4yin.cachix.org"
            ];
          })

          ({lib, ...}: {
            programs.bash.shellInit = ''
              echo 'this is default'
            '';
            programs.zsh.shellInit = "echo 'this is default';";
            nix.settings.substituters = [
              "https://nix-community.cachix.org"
            ];
          })
        ];
      };
    };
  };
}
```

Flake di atas berisi penggunaan `lib.mkBefore` dan `lib.mkAfter` pada string multiline, string single-line, dan list. Mari kita uji hasilnya:

```bash
# Contoh 1: penggabungan string multiline
› echo $(nix eval .#nixosConfigurations.my-nixos.config.programs.bash.shellInit)
trace: warning: system.stateVersion is not set, defaulting to 25.11. Read why this matters on https://nixos.org/manual/nixos/stable/options.html#opt-system.stateVersio
n.
"echo 'insert before default'

echo 'this is default'

if [ -z \"$__NIXOS_SET_ENVIRONMENT_DONE\" ]; then
 . /nix/store/60882lm9znqdmbssxqsd5bgnb7gybaf2-set-environment
fi



echo 'insert after default'
"

# contoh 2: penggabungan string single-line
› echo $(nix eval .#nixosConfigurations.my-nixos.config.programs.zsh.shellInit)
"echo 'insert before default';
echo 'this is default';
echo 'insert after default';"

# Contoh 3: penggabungan list
› nix eval .#nixosConfigurations.my-nixos.config.nix.settings.substituters
[ "https://nix-community.cachix.org" "https://nix-community.cachix.org" "https://cache.nixos.org/" "https://ryan4yin.cachix.org" ]

```

Seperti yang Anda lihat, `lib.mkBefore` dan `lib.mkAfter` dapat mendefinisikan urutan penggabungan string multiline, string single-line, dan list. Urutan penggabungan sama dengan urutan definisi.

> Untuk pengenalan yang lebih mendalam tentang sistem modul, lihat [Module System & Custom Options](../other-usage-of-flakes/module-system.md).

## Referensi

- [Nix modules: Improving Nix's discoverability and usability](https://cfp.nixcon.org/nixcon2020/talk/K89WJY/)
- [Module System - Nixpkgs](https://github.com/NixOS/nixpkgs/blob/nixos-25.11/doc/module-system/module-system.chapter.md)
