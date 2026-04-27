# Menambahkan Server Binary Cache

Kami telah memperkenalkan konsep Nix Store dan binary cache. Di sini, kita akan melihat cara menambahkan beberapa server cache untuk mempercepat unduhan paket.

## Mengapa Menambahkan Server Cache {#why-add-cache-servers}

Nix menyediakan server cache resmi, [https://cache.nixos.org](https://cache.nixos.org), yang menyimpan cache hasil build untuk sebagian besar paket yang umum digunakan. Namun, ini mungkin tidak memenuhi semua kebutuhan pengguna. Dalam kasus berikut, kita perlu menambahkan server cache tambahan:

1. Tambahkan server cache untuk beberapa proyek pihak ketiga, seperti server cache nix-community [https://nix-community.cachix.org](https://nix-community.cachix.org), yang dapat secara signifikan meningkatkan kecepatan build proyek pihak ketiga ini.
2. Tambahkan situs mirror server cache yang paling dekat dengan pengguna untuk mempercepat unduhan.
3. Tambahkan server cache yang dibangun sendiri untuk mempercepat proses build proyek pribadi.

## Cara Menambahkan Server Cache {#how-to-add-custom-cache-servers}

Di Nix, Anda dapat mengkonfigurasi server cache menggunakan opsi berikut:

1. [substituters](https://nixos.org/manual/nix/stable/command-ref/conf-file#conf-substituters): Ini adalah daftar string, dan setiap string adalah alamat dari server cache. Nix akan mencoba menemukan cache dari server ini dalam urutan yang ditentukan dalam daftar.
2. [trusted-public-keys](https://nixos.org/manual/nix/stable/command-ref/conf-file#conf-trusted-public-keys): Untuk mencegah serangan berbahaya, opsi [require-sigs](https://nixos.org/manual/nix/stable/command-ref/conf-file#conf-require-sigs) diaktifkan secara default. Hanya cache dengan tanda tangan yang dapat diverifikasi oleh kunci publik apa pun di `trusted-public-keys` akan digunakan oleh Nix. Oleh karena itu, Anda perlu menambahkan kunci publik yang sesuai dengan `substituters` di `trusted-public-keys`.
   1. Data mirror cache disinkronkan langsung dari server cache resmi. Oleh karena itu, kunci publik mereka sama dengan server cache resmi, dan Anda dapat menggunakan kunci publik server cache resmi tanpa konfigurasi tambahan.
   2. Mekanisme verifikasi kunci publik berbasis kepercayaan ini sepenuhnya mentransfer tanggung jawab keamanan kepada pengguna. Jika pengguna ingin menggunakan server cache pihak ketiga untuk mempercepat proses build library tertentu, mereka harus menanggung risiko keamanan yang sesuai dan memutuskan apakah akan menambahkan kunci publik server cache tersebut ke `trusted-public-keys`. Untuk sepenuhnya menyelesaikan masalah kepercayaan ini, Nix telah memperkenalkan fitur eksperimental [ca-derivations](https://wiki.nixos.org/wiki/Ca-derivations), yang tidak bergantung pada `trusted-public-keys` untuk verifikasi tanda tangan. Pengguna yang tertarik dapat mengeksplorasinya lebih lanjut.

Anda dapat mengkonfigurasi parameter `substituters` dan `trusted-public-keys` dengan cara berikut:

1. Konfigurasikan di `/etc/nix/nix.conf`, konfigurasi global yang mempengaruhi semua pengguna.
   1. Anda dapat menggunakan `nix.settings.substituters` dan `nix.settings.trusted-public-keys` di Modul NixOS apa pun untuk secara deklaratif menghasilkan `/etc/nix/nix.conf`.
2. Konfigurasikan di `flake.nix` dari proyek flake menggunakan `nixConfig.substituters`. Konfigurasi ini hanya mempengaruhi flake saat ini.
3. Atur sementara melalui parameter `--option` dari perintah `nix`, dan konfigurasi ini hanya berlaku untuk perintah saat ini.

Di antara ketiga metode ini, kecuali konfigurasi global pertama, dua lainnya adalah konfigurasi sementara. Jika beberapa metode digunakan secara bersamaan, konfigurasi kemudian akan langsung menimpa konfigurasi sebelumnya.

Namun, ada risiko keamanan dalam mengatur `substituters` secara sementara, seperti yang dijelaskan sebelumnya mengenai kekurangan mekanisme verifikasi keamanan berdasarkan `trusted-public-keys`. Untuk mengatur `substituters` melalui metode kedua dan ketiga, Anda perlu memenuhi salah satu kondisi berikut:

1. Pengguna saat ini termasuk dalam daftar parameter [`trusted-users`](https://nixos.org/manual/nix/stable/command-ref/conf-file#conf-trusted-users) di `/etc/nix/nix.conf`.
2. `substituters` yang ditentukan sementara melalui `--option substituters "http://xxx"` termasuk dalam daftar parameter [`trusted-substituters`](https://nixos.org/manual/nix/stable/command-ref/conf-file#conf-trusted-substituters) di `/etc/nix/nix.conf`.

Berdasarkan informasi di atas, berikut adalah contoh dari tiga metode konfigurasi yang disebutkan sebelumnya.

Pertama, secara deklaratif konfigurasikan `substituters` dan `trusted-public-keys` tingkat sistem menggunakan `nix.settings` di `/etc/nixos/configuration.nix` atau Modul NixOS apa pun:

```nix{7-27}
{
  lib,
  ...
}: {

  # ...
  nix.settings = {
    # berikan hak kepada pengguna dalam daftar ini untuk menentukan substituters tambahan melalui:
    #    1. `nixConfig.substituters` di `flake.nix`
    #    2. argumen command line `--options substituters http://xxx`
    trusted-users = ["ryan"];

    substituters = [
      # mirror cache yang terletak di China
      # status: https://mirror.sjtu.edu.cn/
      "https://mirror.sjtu.edu.cn/nix-channels/store"
      # status: https://mirrors.ustc.edu.cn/status/
      # "https://mirrors.ustc.edu.cn/nix-channels/store"

      "https://cache.nixos.org"
    ];

    trusted-public-keys = [
      # kunci publik default dari cache.nixos.org, sudah built-in, tidak perlu ditambahkan di sini
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
    ];
  };

}
```

Metode kedua adalah mengkonfigurasi `substituters` dan `trusted-public-keys` menggunakan `nixConfig` di `flake.nix`:

> Seperti disebutkan sebelumnya, penting untuk mengkonfigurasi `nix.settings.trusted-users` dalam konfigurasi ini. Jika tidak, `substituters` yang kita atur di sini tidak akan berlaku.

```nix{5-23,42-46}
{
  description = "NixOS configuration of Ryan Yin";

  # nixConfig di sini hanya mempengaruhi flake itu sendiri, bukan konfigurasi sistem!
  nixConfig = {
    # timpa substituters default
    substituters = [
      # mirror cache yang terletak di China
      # status: https://mirror.sjtu.edu.cn/
      "https://mirror.sjtu.edu.cn/nix-channels/store"
      # status: https://mirrors.ustc.edu.cn/status/
      # "https://mirrors.ustc.edu.cn/nix-channels/store"

      "https://cache.nixos.org"

      # server cache nix community
      "https://nix-community.cachix.org"
    ];
    trusted-public-keys = [
      # kunci publik server cache nix community
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";

    # menghilangkan beberapa konfigurasi...
  };

  outputs = inputs@{
      self,
      nixpkgs,
      ...
  }: {
    nixosConfigurations = {
      my-nixos = nixpkgs.lib.nixosSystem {
        modules = [
          ./hardware-configuration.nix
          ./configuration.nix

          {
            # berikan hak kepada pengguna dalam daftar ini untuk menentukan substituters tambahan melalui:
            #    1. `nixConfig.substituters` di `flake.nix`
            nix.settings.trusted-users = [ "ryan" ];
          }
          # menghilangkan beberapa konfigurasi...
       ];
      };
    };
  };
}
```

Akhirnya, metode ketiga melibatkan penggunaan perintah berikut untuk sementara menentukan `substituters` dan `trusted-public-keys` selama deployment:

```bash
sudo nixos-rebuild switch --option substituters "https://nix-community.cachix.org" --option trusted-public-keys "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
```

Pilih salah satu dari tiga metode di atas untuk konfigurasi dan deployment. Setelah deployment berhasil, semua paket berikutnya akan mencari cache dari sumber mirror domestik terlebih dahulu.

> Jika hostname sistem Anda bukan `my-nixos`, Anda perlu memodifikasi nama `nixosConfigurations` di `flake.nix` atau gunakan `--flake /etc/nixos#my-nixos` untuk menentukan nama konfigurasi.

### Prefix `extra-` untuk Parameter Opsi Nix

Seperti disebutkan sebelumnya, `substituters` yang dikonfigurasi dengan tiga metode akan saling menimpa, tetapi situasi ideal seharusnya:

1. Pada tingkat sistem di `/etc/nix/nix.conf`, konfigurasikan hanya `substituters` dan `trusted-public-keys` yang paling umum, seperti server cache resmi dan sumber mirror domestik.
2. Di `flake.nix` setiap proyek flake, konfigurasikan `substituters` dan `trusted-public-keys` khusus untuk proyek tersebut, seperti server cache non-resmi seperti nix-community.
3. Saat membangun proyek flake, nix harus **menggabungkan** `substituters` dan `trusted-public-keys` yang dikonfigurasi di `flake.nix` dan `/etc/nix/nix.conf`.

Nix menyediakan [prefix `extra-`](https://nixos.org/manual/nix/stable/command-ref/conf-file.html?highlight=extra#file-format) untuk mencapai fungsionalitas **penggabungan** ini.

Menurut dokumentasi resmi, jika nilai parameter `xxx` adalah daftar, nilai `extra-xxx` akan ditambahkan ke akhir parameter `xxx`:

Dengan kata lain, Anda dapat menggunakannya seperti ini:

```nix{7,13,36-58}
{
  description = "NixOS configuration of Ryan Yin";

  # nixConfig di sini hanya mempengaruhi flake itu sendiri, bukan konfigurasi sistem!
  nixConfig = {
    # akan ditambahkan ke substituters tingkat sistem
    extra-substituters = [
      # server cache nix community
      "https://nix-community.cachix.org"
    ];

    # akan ditambahkan ke trusted-public-keys tingkat sistem
    extra-trusted-public-keys = [
      # kunci publik server cache nix community
      "nix-community.cachix.org-1:mB9FSh9qf2dCimDSUo8Zy7bkq5CX+/rkCWyvRCYg3Fs="
    ];
  };

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";

    # menghilangkan beberapa konfigurasi...
  };

  outputs = inputs@{
      self,
      nixpkgs,
      ...
  }: {
    nixosConfigurations = {
      my-nixos = nixpkgs.lib.nixosSystem {
        modules = [
          ./hardware-configuration.nix
          ./configuration.nix

          {
            # berikan hak kepada pengguna dalam daftar ini untuk menentukan substituters tambahan melalui:
            #    1. `nixConfig.substituters` di `flake.nix`
            nix.settings.trusted-users = [ "ryan" ];

            # substituters & trusted-public-keys tingkat sistem
            nix.settings = {
              substituters = [
                # mirror cache yang terletak di China
                # status: https://mirror.sjtu.edu.cn/
                "https://mirror.sjtu.edu.cn/nix-channels/store"
                # status: https://mirrors.ustc.edu.cn/status/
                # "https://mirrors.ustc.edu.cn/nix-channels/store"

                "https://cache.nixos.org"
              ];

              trusted-public-keys = [
                # kunci publik default dari cache.nixos.org, sudah built-in, tidak perlu ditambahkan di sini
                "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
              ];
            };
          }
          # menghilangkan beberapa konfigurasi...
       ];
      };
    };
  };
}
```

## Mempercepat Unduhan Paket melalui Server Proxy {#accelerate-package-downloads-via-a-proxy-server}

> Direferensikan dari Issue: [roaming laptop: network proxy configuration - NixOS/nixpkgs](https://github.com/NixOS/nixpkgs/issues/27535#issuecomment-1178444327)
> Meskipun disebutkan sebelumnya bahwa proxy transparan yang berjalan di router atau mesin lokal Anda dapat sepenuhnya menyelesaikan masalah unduhan paket yang lambat di NixOS, konfigurasinya agak rumit dan sering memerlukan perangkat keras tambahan.

Beberapa pengguna mungkin lebih suka langsung mempercepat unduhan paket dengan menggunakan proxy HTTP/Socks5 yang berjalan di mesin mereka. Berikut cara mengaturnya. Menggunakan metode seperti `export HTTPS_PROXY=http://127.0.0.1:7890` di Terminal tidak akan berhasil karena pekerjaan sebenarnya dilakukan oleh proses latar belakang yang disebut `nix-daemon`, bukan oleh perintah yang langsung dijalankan di Terminal.

Jika Anda hanya perlu menggunakan proxy sementara, Anda dapat mengatur variabel lingkungan proxy dengan perintah berikut:

```bash
sudo mkdir -p /run/systemd/system/nix-daemon.service.d/
sudo tee /run/systemd/system/nix-daemon.service.d/override.conf <<EOF
[Service]
Environment="https_proxy=socks5h://localhost:7891"
EOF
sudo systemctl daemon-reload
sudo systemctl restart nix-daemon
```

Setelah men-deploy konfigurasi ini, Anda dapat memeriksa apakah variabel lingkungan telah diatur dengan menjalankan `sudo cat /proc/$(pidof nix-daemon)/environ | tr '\0' '\n'`.

Pengaturan di `/run/systemd/system/nix-daemon.service.d/override.conf` akan secara otomatis dihapus saat sistem restart, atau Anda dapat menghapusnya secara manual dan restart layanan nix-daemon untuk mengembalikan pengaturan asli.

Jika Anda ingin mengatur proxy secara permanen, disarankan untuk menyimpan perintah di atas sebagai skrip shell dan menjalankannya setiap kali sistem dimulai. Atau, Anda dapat menggunakan proxy transparan atau TUN dan solusi proxy global lainnya.

> Ada juga orang di komunitas yang secara permanen mengatur proxy untuk nix-daemon dengan cara deklaratif menggunakan `systemd.services.nix-daemon.environment`. Namun, jika proxy mengalami masalah, akan sangat merepotkan. Nix-daemon tidak akan berfungsi dengan baik, dan sebagian besar perintah Nix tidak akan berjalan dengan benar. Selain itu, konfigurasi systemd itu sendiri diatur untuk perlindungan read-only, membuatnya sulit untuk memodifikasi atau menghapus pengaturan proxy. Jadi, tidak disarankan menggunakan metode ini.

> Saat menggunakan beberapa proxy komersial atau publik, Anda mungkin mengalami error HTTP 403 saat mengunduh dari GitHub (seperti yang dijelaskan di [nixos-and-flakes-book/issues/74](https://github.com/ryan4yin/nixos-and-flakes-book/issues/74)). Dalam kasus seperti itu, Anda dapat mencoba mengubah server proxy atau mengatur [access-tokens](https://github.com/NixOS/nix/issues/6536) untuk menyelesaikan masalah.
