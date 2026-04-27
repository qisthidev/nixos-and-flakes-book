# Mempercepat Debugging Dotfiles

Saat men-debug konfigurasi dotfiles, sering kali Anda tidak perlu membangun kembali seluruh sistem. Untuk mempercepat proses debugging, Anda dapat menggunakan `home-manager` command secara langsung.

## Menggunakan home-manager standalone

Jika Anda ingin men-debug konfigurasi home-manager tanpa membangun kembali seluruh sistem, Anda dapat menggunakan mode standalone home-manager:

```bash
# Install home-manager
nix run home-manager/release-25.11 -- init

# Apply the configuration
home-manager switch --flake .
```

## Debugging cepat dengan `nix build`

Anda juga dapat menggunakan `nix build` untuk memeriksa apakah konfigurasi Anda valid tanpa benar-benar menerapkannya:

```bash
nix build .#homeConfigurations.your-username.activationPackage
```

Ini hanya membangun paket aktivasi tanpa menginstalnya, yang jauh lebih cepat untuk debugging.
