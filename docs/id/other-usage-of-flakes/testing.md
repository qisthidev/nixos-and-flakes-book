# Testing

NixOS menyediakan framework testing yang powerful untuk menguji konfigurasi sistem Anda.

## NixOS Tests

NixOS tests memungkinkan Anda membuat VM untuk menguji konfigurasi:

```nix
{
  nixosTests.mytest = nixpkgs.lib.nixosTest {
    name = "my-test";
    
    nodes.machine = { config, pkgs, ... }: {
      services.nginx.enable = true;
    };
    
    testScript = ''
      machine.wait_for_unit("nginx.service")
      machine.succeed("curl http://localhost")
    '';
  };
}
```

Jalankan test dengan:

```bash
nix build .#nixosTests.mytest
```

## Integration Tests

Anda juga dapat membuat integration tests yang lebih kompleks dengan beberapa VM:

```nix
{
  nixosTests.integration = nixpkgs.lib.nixosTest {
    name = "integration-test";
    
    nodes = {
      server = { ... }: {
        services.postgresql.enable = true;
      };
      
      client = { ... }: {
        # Konfigurasi client
      };
    };
    
    testScript = ''
      server.wait_for_unit("postgresql.service")
      client.succeed("psql -h server -c 'SELECT 1'")
    '';
  };
}
```

## Referensi

- [NixOS Manual - Testing](https://nixos.org/manual/nixos/stable/#sec-nixos-tests)
