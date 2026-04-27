# Dasar-dasar Packaging

Packaging perangkat lunak untuk Nix melibatkan penulisan Nix expression yang mendeskripsikan cara membangun paket.

## Struktur Dasar Paket

Paket Nix dasar terlihat seperti ini:

```nix
{ lib, stdenv, fetchurl }:

stdenv.mkDerivation rec {
  pname = "hello";
  version = "2.12";

  src = fetchurl {
    url = "mirror://gnu/hello/${pname}-${version}.tar.gz";
    sha256 = "sha256-abc123...";
  };

  meta = with lib; {
    description = "A program that produces a familiar, friendly greeting";
    homepage = "https://www.gnu.org/software/hello/";
    license = licenses.gpl3Plus;
    platforms = platforms.all;
  };
}
```

## Build Phases

Nix memiliki beberapa build phase:

1. `unpackPhase` - Ekstrak source code
2. `patchPhase` - Terapkan patch
3. `configurePhase` - Jalankan skrip konfigurasi
4. `buildPhase` - Kompilasi perangkat lunak
5. `installPhase` - Instal binary
6. `fixupPhase` - Perbaikan pasca-install

## Override Build Phases

Anda dapat override phase apa pun:

```nix
stdenv.mkDerivation {
  pname = "my-package";
  version = "1.0";
  
  src = ./.;
  
  buildPhase = ''
    make build
  '';
  
  installPhase = ''
    mkdir -p $out/bin
    cp my-app $out/bin/
  '';
}
```

## Referensi

- [Nixpkgs Manual - Stdenv](https://nixos.org/manual/nixpkgs/stable/#chap-stdenv)
- [Nix Pills - Packaging](https://nixos.org/guides/nix-pills/)
