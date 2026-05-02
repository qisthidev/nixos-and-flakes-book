# Host Server Binary Cache Nix Anda Sendiri

## Pengenalan

Nix binary cache adalah implementasi dari Nix Store yang menyimpan data di server remote daripada lokal, memfasilitasi berbagi binary cache di beberapa mesin.

Server binary cache Nix resmi hanya menyediakan biner yang dibangun dengan parameter standar. Jika Anda telah menyesuaikan parameter build atau menggunakan paket di luar Nixpkgs, Nix tidak akan menemukan binary cache yang sesuai, mengakibatkan build lokal.

Mengandalkan Nix Store lokal Anda `/nix/store` saja bisa merepotkan, karena Anda perlu membangun kembali semua paket custom Anda di setiap mesin, yang bisa memakan waktu dan intensif memori. Situasi ini diperburuk pada platform dengan performa lebih rendah seperti Raspberry Pi.

Dokumen ini akan menunjukkan cara mengatur server binary cache Nix Anda sendiri menggunakan layanan S3 (seperti MinIO) untuk berbagi hasil build di seluruh mesin dan mengatasi masalah yang disebutkan di atas.

## Prasyarat

1. Sebuah host NixOS
2. Server MinIO yang di-deploy
   1. Jika tidak, Anda dapat mengikuti [panduan deployment resmi MinIO](https://min.io/docs/minio/linux/operations/installation.html).
3. Server MinIO memerlukan sertifikat digital TLS yang valid, yang bisa publik atau privat. Contoh ini akan menggunakan `https://minio.homelab.local` dengan sertifikat privat.
4. Instal `minio-client`

## Menghasilkan Password

```bash
nix run nixpkgs#pwgen -- -c -n -y -s -B 32 1
# => oenu1Yuch3rohz2ahveid0koo4giecho
```

## Mengatur MinIO Client

Instal klien command-line MinIO `mc`.

```nix
{ pkgs, ... }:
{
  environment.systemPackages = with pkgs; [
    minio-client # Alternatif untuk perintah ls, cp, mkdir, diff, dan rsync untuk sistem file dan object storage
  ];
}
```

Buat `~/.mc/config.json` dengan konten berikut (ganti parameter kunci dengan milik Anda sendiri):

```json
{
  "version": "10",
  "aliases": {
    "s3": {
      "url": "https://s3.homelab.local",
      "accessKey": "minio",
      "secretKey": "oenu1Yuch3rohz2ahveid0koo4giecho",
      "api": "s3v4",
      "path": "auto"
    }
  }
}
```

Karena Nix akan berinteraksi langsung dengan bucket S3, kita perlu mengkonfigurasi kredensial S3 untuk semua mesin yang memerlukan akses ke binary cache Nix.

Buat `~/.aws/credentials` dengan konten berikut (ganti `<nixbuildersecret>` dengan password yang dihasilkan oleh perintah `pwgen`).

```conf
[nixbuilder]
aws_access_key_id=nixbuilder
aws_secret_access_key=<nixbuildersecret>
```

## Mengatur S3 Bucket sebagai Binary Cache

Buat bucket `nix-cache` menggunakan klien minio:

```bash
mc mb s3/nix-cache
```

Buat pengguna `nixbuilder` untuk MinIO dan tetapkan password:

```bash
mc admin user add s3 nixbuilder <PASSWORD>
```

Buat file bernama `nix-cache-write.json` di direktori kerja saat ini dengan konten berikut:

```json
{
  "Id": "AuthenticatedWrite",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AuthenticatedWrite",
      "Action": [
        "s3:AbortMultipartUpload",
        "s3:GetBucketLocation",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListBucketMultipartUploads",
        "s3:ListMultipartUploadParts",
        "s3:PutObject"
      ],
      "Effect": "Allow",
      "Resource": ["arn:aws:s3:::nix-cache", "arn:aws:s3:::nix-cache/*"],
      "Principal": "nixbuilder"
    }
  ]
}
```

Sekarang, buat policy untuk mengupload file ke S3 menggunakan file `nix-cache-write.json`:

```bash
mc admin policy create s3 nix-cache-write nix-cache-write.json
```

Hubungkan policy S3 yang baru saja kita buat dengan pengguna `nixbuilder`:

```bash
mc admin policy attach s3 nix-cache-write -user nixbuilder
```

Izinkan pengguna anonim untuk mengunduh file tanpa autentikasi, jadi semua server Nix dapat menarik data langsung dari cache S3 ini:

```bash
mc anonymous set download s3/nix-cache
```

Akhirnya, tambahkan file `nix-cache-info` ke direktori root bucket S3, karena Nix memerlukan file ini untuk merekam beberapa informasi terkait binary cache:

```bash
cat > nix-cache-info <<EOF
StoreDir: /nix/store
WantMassQuery: 1
Priority: 40
EOF
# Salin `nix-cache-info` ke bucket S3
mc cp ./nix-cache-info s3/nix-cache/nix-cache-info
```

## Menghasilkan Pasangan Kunci Tanda Tangan

Seperti disebutkan sebelumnya, binary cache Nix menggunakan mekanisme tanda tangan kunci publik untuk memverifikasi asal dan integritas data, jadi kita perlu menghasilkan pasangan kunci untuk mesin build Nix kita untuk menandatangani binary cache. Nama kunci bersifat arbitrer, tetapi developer NixOS sangat merekomendasikan menggunakan domain cache diikuti dengan integer, jadi jika kunci perlu dicabut atau dihasilkan kembali, Anda dapat meningkatkan integer di akhir.

```bash
nix key generate-secret --key-name s3.homelab.local-1 > ~/.config/nix/secret.key
nix key convert-secret-to-public < ~/.config/nix/secret.key > ~/.config/nix/public.key
cat ~/.config/nix/public.key
# => s3.homelab.local-1:m0J/oDlLEuG6ezc6MzmpLCN2MYjssO3NMIlr9JdxkTs=
```

## Menggunakan S3 Binary Cache di `flake.nix`

Tambahkan berikut ke `configuration.nix` Anda atau modul NixOS custom apa pun:

```nix
{
  nix = {
    settings = {
      # Substituter akan ditambahkan ke substituter default saat mengambil paket.
      extra-substituters = [
        "https://s3.homelab.local/nix-cache/"
      ];
      extra-trusted-public-keys = [
        "s3.homelab.local-1:m0J/oDlLEuG6ezc6MzmpLCN2MYjssO3NMIlr9JdxkTs="
      ];
    };
  };
}
```

Rebuild sistem untuk mulai menggunakan binary cache S3 yang baru dibuat:

```bash
sudo nixos-rebuild switch --upgrade --flake .#<HOST>
```

## Mendorong Store Paths ke Binary Cache

Tandatangani beberapa path di store lokal.

```bash
nix store sign --recursive --key-file ~/.config/nix/secret.key /run/current-system
```

Salin path ini ke cache:

```bash
nix copy --to 's3://nix-cache?profile=nixbuilder&endpoint=s3.homelab.local' /run/current-system
```

## Menambahkan Policy Expiration Object Otomatis

```bash
mc ilm rule add s3/nix-cache --expire-days "DAYS"
# Misalnya: mc ilm rule add s3/nix-cache --expire-days "7"
```

Ini akan mengatur policy expiration untuk objek di bucket S3, memastikan bahwa mereka secara otomatis dihapus setelah jumlah hari yang ditentukan.

Ini berguna untuk menjaga ukuran cache tetap terkelola dan memastikan bahwa biner yang sudah usang tidak disimpan tanpa batas waktu.

## Referensi

- [Blog post by Jeff on Nix binary caches](https://jcollie.github.io/nixos/2022/04/27/nixos-binary-cache-2022.html)
- [Binary cache in the NixOS wiki](https://wiki.nixos.org/wiki/Binary_Cache)
- [Serving a Nox store via S3 in the NixOS manual](https://nixos.org/manual/nix/stable/package-management/s3-substituter.html)
- [Serving a Nix store via HTTP in the NixOS manual](https://nixos.org/manual/nix/stable/package-management/binary-cache-substituter.html)
