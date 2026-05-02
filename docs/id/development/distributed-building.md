# Distributed Building

Nix mendukung distributed building, memungkinkan Anda mengoffload build ke mesin remote.

## Mengkonfigurasi Remote Builders

Tambahkan ke `configuration.nix`:

```nix
{
  nix.buildMachines = [{
    hostName = "builder.example.com";
    sshUser = "nix";
    sshKey = "/root/.ssh/id_builder";
    system = "x86_64-linux";
    maxJobs = 8;
    speedFactor = 2;
    supportedFeatures = [ "kvm" "big-parallel" ];
  }];
  
  nix.distributedBuilds = true;
}
```

## SSH Configuration

Pastikan SSH key dikonfigurasi dengan benar:

```bash
ssh-keygen -t ed25519 -f /root/.ssh/id_builder
ssh-copy-id -i /root/.ssh/id_builder.pub nix@builder.example.com
```

## Referensi

- [NixOS Manual - Distributed Builds](https://nixos.org/manual/nix/stable/advanced-topics/distributed-builds.html)
