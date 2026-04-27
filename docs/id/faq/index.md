# Pertanyaan yang Sering Diajukan

## Apa perbedaan antara kemampuan rollback NixOS dan rollback snapshot sistem btrfs/zfs?

Perbedaannya terletak pada sifat snapshot. Snapshot sistem yang dibuat dengan btrfs/zfs tidak mengandung 'pengetahuan' tentang cara membangun snapshot ini dari awal, ini **tidak dapat diinterpretasikan**, dan kontennya sangat berkorelasi dengan lingkungan hardware saat ini, membuatnya sulit untuk direproduksi di mesin lain.

Di sisi lain, konfigurasi NixOS adalah sebuah "pengetahuan" yang dapat membangun OS yang identik dari awal. Ini **dapat dijelaskan** dan dapat dibangun secara otomatis hanya dengan beberapa perintah sederhana. Konfigurasi NixOS berfungsi sebagai dokumentasi dari semua perubahan yang dilakukan pada OS Anda dan juga digunakan untuk membangun OS itu sendiri secara otomatis.

File konfigurasi NixOS seperti **source code** dari sebuah program. Selama source code utuh, mudah untuk memodifikasi, mereview, atau membangun ulang program yang identik. Sebaliknya, snapshot sistem seperti program biner yang dikompilasi yang berasal dari source code, membuatnya jauh lebih sulit untuk memodifikasi atau mereview mereka. Selain itu, snapshot berukuran besar, membuat berbagi atau migrasi mereka lebih mahal dibandingkan dengan source code.

Namun, ini tidak berarti bahwa NixOS menghilangkan kebutuhan untuk snapshot sistem. Seperti disebutkan di Bab 1 buku ini, NixOS hanya dapat menjamin reprodusibilitas untuk segala sesuatu yang dideklarasikan dalam konfigurasi deklaratif. Aspek sistem lainnya yang tidak dicakup oleh konfigurasi deklaratif, seperti data dinamis di MySQL/PostgreSQL, file yang diupload pengguna, log sistem, video, musik, dan gambar di direktori home pengguna, masih memerlukan snapshot sistem atau cara backup lainnya.

## Bagaimana perbandingan Nix dengan alat manajemen sistem tradisional seperti Ansible?

Nix tidak hanya digunakan untuk mengelola lingkungan desktop tetapi juga banyak digunakan untuk manajemen batch server cloud. [NixOps](https://github.com/NixOS/nixops) resmi dari komunitas NixOS dan [colmena](https://github.com/zhaofengli/colmena) yang dikembangkan oleh komunitas adalah alat yang dirancang khusus untuk use case ini.

Jika dibandingkan dengan alat tradisional yang banyak digunakan seperti Ansible, Nix memiliki keunggulan utama berikut:

1. Salah satu masalah terbesar dengan Ansible ini adalah bahwa setiap deployment didasarkan pada perubahan inkremental pada state sistem saat ini. State sistem saat ini, seperti snapshot yang disebutkan di atas, tidak dapat diinterpretasikan dan sulit untuk direproduksi. NixOS mendeklarasikan target state sistem melalui file konfigurasinya, sehingga hasil deployment independen dari state sistem saat ini, dan deployment berulang tidak akan menyebabkan masalah apa pun.
2. Nix Flakes menggunakan file lock versi `flake.lock` untuk mengunci nilai hash, nomor versi, sumber data dan informasi lain dari semua dependensi, yang sangat meningkatkan reprodusibilitas sistem. Alat tradisional seperti Ansible tidak memiliki fitur ini, jadi mereka tidak sangat dapat direproduksi.
   1. Inilah mengapa Docker sangat populer - ia menyediakan, dengan sebagian kecil biaya, **lingkungan sistem yang dapat direproduksi pada berbagai mesin** yang tidak dimiliki alat Ops tradisional seperti Ansible.
3. Nix menyediakan tingkat kemudahan kustomisasi sistem yang tinggi dengan melindungi detail implementasi yang mendasarinya dengan lapisan abstraksi deklaratif sehingga pengguna hanya perlu peduli dengan kebutuhan inti mereka. Alat seperti Ansible memiliki abstraksi yang jauh lebih lemah.
   1. Jika Anda pernah menggunakan alat konfigurasi deklaratif seperti terraform/kubernetes, ini seharusnya mudah dipahami. Semakin kompleks kebutuhannya, semakin besar manfaat dari konfigurasi deklaratif.

## Apa keunggulan Nix dibandingkan dengan teknologi container Docker?

Nix dan teknologi container seperti Docker memang memiliki use case yang tumpang tindih, seperti:

1. Banyak orang menggunakan Nix untuk mengelola lingkungan development dan build, seperti yang dibahas dalam buku ini. Di sisi lain, teknologi seperti [Dev Containers](https://github.com/devcontainers/spec), yang membangun lingkungan development berdasarkan container, juga populer.
2. Bidang DevOps/SRE saat ini didominasi oleh teknologi container berdasarkan Dockerfile. Distribusi yang umum digunakan seperti Ubuntu/Debian sering digunakan di dalam container, dan ada juga opsi mature yang tersedia untuk mesin host. Dalam konteks ini, keunggulan signifikan apa yang ditawarkan beralih ke NixOS?

Mengenai poin pertama "mengelola lingkungan development dan build," Nix menyediakan pengalaman lingkungan development yang sangat mirip dengan bekerja langsung di mesin host. Ini menawarkan beberapa keunggulan dibandingkan Dev Containers, seperti yang diuraikan di bawah ini:

1. Nix tidak menggunakan namespace untuk isolasi filesystem dan network, memungkinkan interaksi mudah dengan filesystem mesin host (termasuk /dev untuk perangkat eksternal) dan lingkungan network dalam lingkungan development yang dibuat Nix. Sebaliknya, container memerlukan berbagai mapping untuk memungkinkan komunikasi antara container dan filesystem mesin host, yang terkadang dapat menyebabkan masalah izin file.
2. Karena tidak adanya isolasi yang kuat, lingkungan development Nix tidak memiliki masalah dalam mendukung aplikasi GUI. Menjalankan program GUI dalam lingkungan ini sama seamless-nya dengan menjalankannya di lingkungan sistem.

Dengan kata lain, Nix menyediakan pengalaman development yang paling dekat dengan mesin host, tanpa isolasi yang kuat. Developer dapat menggunakan alat development dan debugging yang familiar di lingkungan ini, dan pengalaman development masa lalu mereka dapat dimigrasikan dengan seamless. Di sisi lain, jika Dev Containers digunakan, developer mungkin mengalami berbagai masalah terkait komunikasi filesystem, lingkungan network, izin pengguna, dan ketidakmampuan untuk menggunakan alat debugging GUI karena isolasi yang kuat.

Jika kita memutuskan untuk menggunakan Nix untuk mengelola semua lingkungan development, maka membangun container Docker berdasarkan Nix akan memberikan tingkat konsistensi tertinggi. Selain itu, mengadopsi arsitektur teknologi yang terpadu untuk semua lingkungan secara signifikan mengurangi biaya pemeliharaan infrastruktur. Ini menjawab poin kedua yang disebutkan sebelumnya: ketika mengelola lingkungan development dengan Nix sebagai prasyarat, menggunakan NixOS untuk image base container dan server cloud menawarkan keunggulan yang jelas.

## error: collision between `...` and `...`

Error ini terjadi ketika Anda menginstal dua paket yang bergantung pada library yang sama tetapi dengan versi yang berbeda dalam profile yang sama (modul home atau modul nixos).

Misalnya, jika Anda memiliki konfigurasi berikut:

```nix
{
   # sebagai modul nixos
   # environment.systemPackages = with pkgs; [
   #
   # atau sebagai modul home manager
   home.packages = with pkgs; [
     lldb

     (python311.withPackages (ps:
       with ps; [
         ipython
         pandas
         requests
         pyquery
         pyyaml
       ]
     ))
   ];
}
```

ini akan menyebabkan error berikut:

```bash
error: builder for '/nix/store/n3scj3s7v9jsb6y3v0fhndw35a9hdbs6-home-manager-path.drv' failed with exit code 25;
       last 1 log lines:
       > error: collision between `/nix/store/kvq0gvz6jwggarrcn9a8ramsfhyh1h9d-lldb-14.0.6/lib/python3.11/site-packages/six.py'
and `/nix/store/370s8inz4fc9k9lqk4qzj5vyr60q166w-python3-3.11.6-env/lib/python3.11/site-packages/six.py'
       For full logs, run 'nix log /nix/store/n3scj3s7v9jsb6y3v0fhndw35a9hdbs6-home-manager-path.drv'.
```

Berikut adalah beberapa solusi:

1. Pisahkan kedua paket ke dalam dua **profile** berbeda. Misalnya, Anda dapat menginstal `lldb` melalui `environment.systemPackages` dan `python311` melalui `home.packages`.
2. Versi Python3 yang berbeda diperlakukan sebagai paket yang berbeda, jadi Anda dapat mengubah versi Python3 custom Anda menjadi `python310` untuk menghindari konflik.
3. Gunakan `override` untuk menimpa versi library yang digunakan oleh paket agar konsisten dengan versi yang digunakan oleh paket lain.

```nix
{
  # sebagai modul nixos
  # environment.systemPackages = with pkgs; [
  #
  # atau sebagai modul home manager
  home.packages = let
    custom-python3 = (pkgs.python311.withPackages (ps:
      with ps; [
        ipython
        pandas
        requests
        pyquery
        pyyaml
      ]
    ));
  in
    with pkgs; [
      # override versi python3
      # CATATAN: Ini akan memicu rebuild lldb, memakan waktu
      (lldb.override {
        python3 = custom-python3;
      })

      custom-python3
  ];
}
```
