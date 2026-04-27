# Memulai dengan Home Manager

Seperti yang saya sebutkan sebelumnya, NixOS hanya dapat mengelola konfigurasi tingkat sistem. Untuk mengelola konfigurasi tingkat pengguna di direktori Home, kita perlu menginstal Home Manager.

Menurut [Home Manager Manual](https://nix-community.github.io/home-manager/index.xhtml) resmi, untuk menginstal Home Manager sebagai modul NixOS, pertama kita perlu membuat `/etc/nixos/home.nix`. Berikut adalah contoh isinya:

```nix
{ config, pkgs, ... }:

{
  # TODO silakan ubah username & direktori home Anda sendiri
  home.username = "ryan";
  home.homeDirectory = "/home/ryan";

  # Impor file dari direktori konfigurasi saat ini ke Nix store,
  # dan buat symbolic link yang mengarah ke file store tersebut di direktori Home.

  # home.file.".config/i3/wallpaper.jpg".source = ./wallpaper.jpg;

  # Impor direktori scripts ke Nix store,
  # dan secara rekursif generate symbolic link di direktori Home yang mengarah ke file di store.
  # home.file.".config/i3/scripts" = {
  #   source = ./scripts;
  #   recursive = true;   # link recursively
  #   executable = true;  # make all files executable
  # };

  # encode the file content in nix configuration file directly
  # home.file.".xxx".text = ''
  #     xxx
  # '';

  # set cursor size and dpi for 4k monitor
  xresources.properties = {
    "Xcursor.size" = 16;
    "Xft.dpi" = 172;
  };

  # Paket yang harus diinstal ke profil pengguna.
  home.packages = with pkgs; [
    # berikut adalah beberapa command line tools yang sering saya gunakan
    # silakan tambahkan milik Anda sendiri atau hapus beberapa di antaranya

    neofetch
    nnn # terminal file manager

    # archives
    zip
    xz
    unzip
    p7zip

    # utils
    ripgrep # recursively searches directories for a regex pattern
    jq # A lightweight and flexible command-line JSON processor
    yq-go # yaml processor https://github.com/mikefarah/yq
    eza # A modern replacement for 'ls'
    fzf # A command-line fuzzy finder

    # networking tools
    mtr # A network diagnostic tool
    iperf3
    dnsutils  # `dig` + `nslookup`
    ldns # replacement of `dig`, it provide the command `drill`
    aria2 # A lightweight multi-protocol & multi-source command-line download utility
    socat # replacement of openbsd-netcat
    nmap # A utility for network discovery and security auditing
    ipcalc  # it is a calculator for the IPv4/v6 addresses

    # misc
    cowsay
    file
    which
    tree
    gnused
    gnutar
    gawk
    zstd
    gnupg

    # nix related
    #
    # it provides the command `nom` works just like `nix`
    # with more details log output
    nix-output-monitor

    # productivity
    hugo # static site generator
    glow # markdown previewer in terminal

    btop  # replacement of htop/nmon
    iotop # io monitoring
    iftop # network monitoring

    # system call monitoring
    strace # system call monitoring
    ltrace # library call monitoring
    lsof # list open files

    # system tools
    sysstat
    lm_sensors # for `sensors` command
    ethtool
    pciutils # lspci
    usbutils # lsusb
  ];

  # konfigurasi dasar git, silakan ubah ke milik Anda sendiri
  programs.git = {
    enable = true;
    userName = "Ryan Yin";
    userEmail = "xiaoyin_c@qq.com";
  };

  # starship - an customizable prompt for any shell
  programs.starship = {
    enable = true;
    # custom settings
    settings = {
      add_newline = false;
      aws.disabled = true;
      gcloud.disabled = true;
      line_break.disabled = true;
    };
  };

  # alacritty - a cross-platform, GPU-accelerated terminal emulator
  programs.alacritty = {
    enable = true;
    # custom settings
    settings = {
      env.TERM = "xterm-256color";
      font = {
        size = 12;
        draw_bold_text_with_bright_colors = true;
      };
      scrolling.multiplier = 5;
      selection.save_to_clipboard = true;
    };
  };

  programs.bash = {
    enable = true;
    enableCompletion = true;
    # TODO tambahkan bashrc custom Anda di sini
    bashrcExtra = ''
      export PATH="$PATH:$HOME/bin:$HOME/.local/bin:$HOME/go/bin"
    '';

    # set some aliases, feel free to add more or remove some
    shellAliases = {
      k = "kubectl";
      urldecode = "python3 -c 'import sys, urllib.parse as ul; print(ul.unquote_plus(sys.stdin.read()))'";
      urlencode = "python3 -c 'import sys, urllib.parse as ul; print(ul.quote_plus(sys.stdin.read()))'";
    };
  };

  # Nilai ini menentukan rilis Home Manager yang
  # konfigurasi Anda kompatibel dengannya. Ini membantu menghindari kerusakan
  # ketika rilis Home Manager baru memperkenalkan perubahan yang tidak kompatibel dengan versi sebelumnya.
  #
  # Anda dapat memperbarui Home Manager tanpa mengubah nilai ini. Lihat
  # catatan rilis Home Manager untuk daftar perubahan versi state
  # di setiap rilis.
  home.stateVersion = "25.11";
}
```

Setelah menambahkan `/etc/nixos/home.nix`, Anda perlu mengimpor file konfigurasi baru ini di `/etc/nixos/flake.nix` untuk memanfaatkannya, gunakan perintah berikut untuk menghasilkan contoh di folder saat ini sebagai referensi:

```shell
nix flake new example -t github:nix-community/home-manager#nixos
```

Setelah menyesuaikan parameter, isi `/etc/nixos/flake.nix` adalah sebagai berikut:

```nix
{
  description = "NixOS configuration";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
    # home-manager, digunakan untuk mengelola konfigurasi pengguna
    home-manager = {
      url = "github:nix-community/home-manager/release-25.11";
      # Kata kunci `follows` dalam inputs digunakan untuk inheritance.
      # Di sini, `inputs.nixpkgs` dari home-manager dijaga konsisten dengan
      # `inputs.nixpkgs` dari flake saat ini,
      # untuk menghindari masalah yang disebabkan oleh versi nixpkgs yang berbeda.
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ nixpkgs, home-manager, ... }: {
    nixosConfigurations = {
      # TODO silakan ubah hostname ke milik Anda sendiri
      my-nixos = nixpkgs.lib.nixosSystem {
        modules = [
          ./configuration.nix

          # jadikan home-manager sebagai modul nixos
          # sehingga konfigurasi home-manager akan di-deploy otomatis saat menjalankan `nixos-rebuild switch`
          home-manager.nixosModules.home-manager
          {
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;

            # TODO ganti ryan dengan username Anda sendiri
            home-manager.users.ryan = import ./home.nix;

            # Secara opsional, gunakan home-manager.extraSpecialArgs untuk meneruskan argumen ke home.nix
          }
        ];
      };
    };
  };
}
```

Kemudian jalankan `sudo nixos-rebuild switch` untuk menerapkan konfigurasi, dan home-manager akan diinstal secara otomatis.

> Jika hostname sistem Anda bukan `my-nixos`, Anda perlu memodifikasi nama `nixosConfigurations` di `flake.nix`, atau gunakan `--flake /etc/nixos#my-nixos` untuk menentukan nama konfigurasi.

Setelah instalasi, semua paket dan konfigurasi tingkat pengguna dapat dikelola melalui `/etc/nixos/home.nix`. Saat menjalankan `sudo nixos-rebuild switch`, konfigurasi home-manager akan diterapkan secara otomatis. (**Tidak perlu menjalankan `home-manager switch` secara manual**!)

Untuk menemukan opsi yang dapat kita gunakan di `home.nix`, rujuk ke dokumen berikut:

- [Home Manager - Appendix A. Configuration Options](https://nix-community.github.io/home-manager/options.xhtml): Daftar semua opsi, disarankan untuk mencari kata kunci di dalamnya.
  - [Home Manager Option Search](https://home-manager-options.extranix.com/) adalah alat pencarian opsi lain dengan UI yang lebih baik.
- [home-manager](https://github.com/nix-community/home-manager): Beberapa opsi tidak terdaftar dalam dokumentasi resmi, atau dokumentasinya tidak cukup jelas, Anda dapat langsung mencari dan membaca kode sumber yang sesuai dalam repositori home-manager ini.

## Home Manager vs NixOS

Ada banyak paket perangkat lunak atau konfigurasi yang dapat diatur menggunakan NixOS Modules (`configuration.nix`) atau Home Manager (`home.nix`), yang menimbulkan dilema pilihan: **Apa perbedaan antara menempatkan paket perangkat lunak atau file konfigurasi di NixOS Modules versus Home Manager, dan bagaimana seharusnya membuat keputusan?**

Pertama, mari kita lihat perbedaannya: Paket perangkat lunak dan file konfigurasi yang diinstal melalui NixOS Modules bersifat global untuk seluruh sistem. Konfigurasi global biasanya disimpan di `/etc`, dan perangkat lunak yang diinstal di seluruh sistem dapat diakses di lingkungan pengguna mana pun.

Di sisi lain, konfigurasi dan perangkat lunak yang diinstal melalui Home Manager akan di-link ke direktori Home pengguna masing-masing. Perangkat lunak yang diinstal hanya tersedia di lingkungan pengguna yang sesuai, dan menjadi tidak dapat digunakan saat beralih ke pengguna lain.

Berdasarkan karakteristik ini, penggunaan umum yang direkomendasikan adalah:

- NixOS Modules: Instal komponen inti sistem dan paket perangkat lunak atau konfigurasi lain yang diperlukan oleh semua pengguna.
  - Misalnya, jika Anda ingin paket perangkat lunak terus bekerja saat Anda beralih ke pengguna root, atau jika Anda ingin konfigurasi berlaku di seluruh sistem, Anda harus menginstalnya menggunakan NixOS Modules.
- Home Manager: Gunakan Home Manager untuk semua konfigurasi dan perangkat lunak lainnya.

Manfaat dari pendekatan ini adalah:

1. Perangkat lunak dan layanan latar belakang yang diinstal di tingkat sistem sering kali berjalan dengan hak istimewa root. Menghindari instalasi perangkat lunak yang tidak perlu di tingkat sistem dapat mengurangi risiko keamanan sistem.
2. Banyak konfigurasi di Home Manager bersifat universal untuk NixOS, macOS, dan distribusi Linux lainnya. Memilih Home Manager untuk menginstal perangkat lunak dan mengkonfigurasi sistem dapat meningkatkan portabilitas konfigurasi.
3. Jika Anda memerlukan dukungan multi-pengguna, perangkat lunak dan konfigurasi yang diinstal melalui Home Manager dapat lebih baik mengisolasi lingkungan pengguna yang berbeda, mencegah konflik konfigurasi dan versi perangkat lunak antar pengguna.

## Bagaimana cara menggunakan paket yang diinstal oleh Home Manager dengan akses istimewa?

Hal pertama yang terlintas adalah beralih ke `root`, tetapi kemudian paket apa pun yang diinstal oleh pengguna saat ini melalui `home.nix` akan tidak tersedia. mari kita ambil `kubectl` sebagai contoh (sudah di-instal sebelumnya melalui `home.nix`):

```sh
# 1. kubectl tersedia
› kubectl | head
kubectl controls the Kubernetes cluster manager.

 Find more information at: https://kubernetes.io/docs/reference/kubectl/
......

# 2. beralih pengguna ke `root`
› sudo su

# 3. kubectl tidak lagi tersedia
> kubectl
Error: nu::shell::external_command

  × External command failed
   ╭─[entry #1:1:1]
 1 │ kubectl
   · ───┬───
   ·    ╰── executable was not found
   ╰────
  help: No such file or directory (os error 2)


/home/ryan/nix-config> exit
```

Solusinya adalah menggunakan `sudo` untuk menjalankan perintah, yang untuk sementara memberikan pengguna saat ini kemampuan untuk menjalankan perintah sebagai pengguna istimewa (`root`):

```sh
› sudo kubectl
kubectl controls the Kubernetes cluster manager.
...
```
