{ pkgs ? import ./pkgs.nix {} }:

with pkgs;

let
  project = import ./. { inherit pkgs; };
in

mkShell {
  inputsFrom = lib.attrValues (import ./. { inherit pkgs; });

  shellHook = ''
    rm -f conductor-config.toml
    rm -f src/utils/conductor-config.toml
    ln -s ${project.hp-admin-conductor-config} conductor-config.toml
    ln -s ${project.hp-admin-conductor-config} src/utils/conductor-config.toml
    echo "Starting Conductor..."
    holochain -c conductor-config.toml &> conductor.log &
    echo $! > conductor.pid
    cleanup() {
      kill $(cat conductor.pid)
      rm -rf .holochain
    }
    trap cleanup EXIT
  '';
}
