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
- `FROM`
  - [x] This should be the first command in the Dockerfile
  - [x] Base image should specify a tag
  - [x] Base image should not use latest tag
  - [ ] Support the `FROM <image>@<digest>` syntax
  - [ ] Allow config to specify "allowed" base layers
- `EXPOSE`
  - [x] Only the container port should be listed
  - [ ] All ports should be exposed in a single cache layer (line)
  - [ ] The same port number should not be exposed multiple times
  - [ ] Exposed ports should be numeric and in the accepted range
- `LABEL`
  - [x] Format should be key=value
- `RUN`
  - [x] sudo is not included in the command
  - [x] apt-get [install | upgrade | remove] should include a -y flag
  - [x] apt-get install commands should include a `--no-install-recommends` flag
  - [x] apt-get install commands should be paired with a `rm -rf /var/lib/apt/lists/*` in the same layer
  - [ ] handle best practices for yum operations and cleanup
- `ADD`
  - [x] Command should have at least 2 parameters
  - [x] Source command(s) cannot be absolute or relative paths that exist outside of the current build context
  - [x] Commands with wildcards or multiple sources require that destination is a directory, not a file
- `CMD`
  - [x] Only a single `CMD` layer is allowed
  - [ ] Better handling of escaped quotes
  - [ ] Detect exec format with expected variable substitution
- `ENV`
  - [ ] Best practice of only usign a single `ENV` line to reduce cache layer count
- `USER`
  - [x] Should be followed by exactly 1 parameter
- `MAINTAINER`
  - [x] Should be followed by exactly 1 parameter (@ sign)
- Misc
  - [x] Only valid Dockerfile commands are present
  - [x] All commands should have at least 1 parameter
