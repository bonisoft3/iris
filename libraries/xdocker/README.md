All include mechanisms for docker sucks. The
https://docs.docker.com/compose/multiple-compose-files/include/
is super verbose and does not work in bake. The
https://github.com/edrevo/dockerfile-plus is abandonware
and has no recursive includes. Only
https://hub.docker.com/r/devthefuture/dockerfile-x works, but
it requires serious gymnastics on relative/absolute paths. Essentially we
need to write "gradle.dockerfile" files using relative paths (like this one),
which make them safe for include, and we need another "Dockerfile" to include
those. Still, skaffold likes to parse the docker file directly
(https://github.com/GoogleContainerTools/skaffold/blob/bead9c88bdbc32bad7eadeba0ee684d9610ed149/pkg/skaffold/docker/parse.go#L362)
and will baffle on the includes if they are used in the FROM line. So, we
need to import scratch and then copy the full files from the included
dockerfile. Ultimately, this means that we can only use docker includes to
bring files to the main build if that is being consumed by skaffold, not for
any metadata. But in practice that suffices. Last, but not least, the top file
Dockerfile cannot really rely on targets, it will always build all the stages
and export the last one. So, if you need multiple targets in the same
directory, create a new Dockerfile.target for it.
