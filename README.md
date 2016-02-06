# CodeClimate engine for Dockerfilelint

`Dockerfileint` is a Code Climate engine that analyzes all Dockerfiles and looks for common traps, mistakes and helps enforce best practices:

## Testing
Start unit tests with `npm test`

## Running

Install the CodeClimate CLI:
```shell
curl -L https://github.com/codeclimate/codeclimate/archive/master.tar.gz | tar xvz
cd codeclimate-* && sudo make install
```

Build this container:
```shell
sudo docker build -t codeclimate/codeclimate-dockerfilelint .
```

Enable this engine in your `.codeclimate.yml` file:
```yml
engines:
  dockerfilelint:
    enabled: true
```

Run the linter in a project that contains files with "Dockerfile" in the title
```shell
sudo codeclimate analyze --dev
```

## Checks performed
### `FROM`
- [x] This should be the first command in the Dockerfile
- [x] Base image should specify a tag
- [x] Base image should not use latest tag
- [x] Support `FROM scratch` without a tag
- [x] Support the `FROM <image>@<digest>` syntax
- [ ] Allow config to specify "allowed" base layers

### `MAINTAINER`
- [x] Should be followed by exactly 1 parameter (@ sign)

### `RUN`
- [x] sudo is not included in the command
- [x] apt-get [install | upgrade | remove] should include a -y flag
- [x] apt-get install commands should include a `--no-install-recommends` flag
- [x] apt-get install commands should be paired with a `rm -rf /var/lib/apt/lists/*` in the same layer
- [ ] Avoid running `apt-get upgrade` or `apt-get dist-upgrade`
- [ ] Never run `apt-get update` without `apt-get install` on the same line
- [ ] handle best practices for yum operations and cleanup

### `CMD`
- [x] Only a single `CMD` layer is allowed
- [ ] Better handling of escaped quotes
- [ ] Detect exec format with expected variable substitution

### `LABEL`
- [x] Format should be key=value

### `EXPOSE`
- [x] Only the container port should be listed
- [ ] All ports should be exposed in a single cache layer (line)
- [ ] The same port number should not be exposed multiple times
- [ ] Exposed ports should be numeric and in the accepted range

### `ENV`
- [x] Format of `ENV`
- [ ] Best practice of only using a single `ENV` line to reduce cache layer count

### `ADD`
- [x] Command should have at least 2 parameters
- [x] Source command(s) cannot be absolute or relative paths that exist outside of the current build context
- [x] Commands with wildcards or multiple sources require that destination is a directory, not a file
- [ ] If an `ADD` command could be a `COPY`, then `COPY` is preferred
- [ ] Using `ADD` to fetch remote files is discouraged because they cannot be removed from the layer

### `COPY`
- [ ] Implement checking (similar to ADD)
- [ ] Do not `COPY` multiple files on a single command to best use cache

### `ENTRYPOINT`
- [ ] Support

### `VOLUME`
- [ ] Format
- [ ] Any build steps after VOLUME is declare should not change VOLUME contents
- [ ] If JSON format, double quotes are required

### `USER`
- [x] Should be followed by exactly 1 parameter

### `WORKDIR`
- [x] Validate that it has exactly 1 parameter
- [x] `WORKDIR` can only expand variables previously set in `ENV` commands

### `ARG`
- [ ] Support
- [ ] Prevent redefining the built in ARGs (proxy)

### `ONBUILD`
- [ ] Support

### `STOPSIGNAL`
- [ ] Validate input
- [ ] Only present one time

### Misc
- [x] Only valid Dockerfile commands are present
- [x] All commands should have at least 1 parameter
- [x] Check that commands are written as upper case commands
