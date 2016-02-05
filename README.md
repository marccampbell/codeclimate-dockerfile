# CodeClimate engine for Dockerfilelint

`Dockerfileint` is a Code Climate engine that analyzes all Dockerfiles and looks for common traps and mistakes:

## What we check
- `FROM` should be the first commmand in the Dockerfile
- The base image should have a tag specified
- The base image tag should not be "latest"
- `EXPOSE` should only list the container port
- `LABEL` should be key=value format
- `RUN` with apt-get install should include `--no-install-recommends`
- `RUN` with apt-get install should include `-y`
- `RUN` with apt-get install should include `rm -rf /var/lib/apt/lists/*`
- Only a single `CMD` is allowed
- Only valid Dockerfile commands are allowed
- All Dockerfile commands require parameters
- `USER` command should have exactly 1 parameter
- `sudo` usage in any command is not allowed
- `MAINTAINER` command should have exactly 1 parameter
- `ADD` command should have at least 2 paramters
- `ADD` source command(s) cannot be absolute or relative out of current build context
- `ADD` commands with wildcards or multiple src params should use a dest dir, not file

// TODO (ideas)
- Don't allow exposing the same port multiple times
- Support the `FROM <image>@<digest>` syntax
- Support checking that yum operations are cleaned up

## Run tests
Start unit tests with `npm test`
