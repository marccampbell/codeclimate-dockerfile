

var commands = module.exports = {
  expose_container_port_only: function(args) {
    var ports = args.split(' ');
    var result = [];
    ports.forEach(function(port) {
      if (port.split(':').length > 1) {
        result.push({name: 'EXPOSE with host port', message: 'EXPOSE should only specify a container port, not a host port'});
      }
    });

    return result;
  },

  label_format: function(args) {
    var labels = args.split(' ');
    var result = [];
    labels.forEach(function(label) {
      if (label.split('=').length !== 2) {
        result.push({name: 'LABEL not in key=value format', message: 'LABEL command should contain one or more key=value pairs'});
      }
    });

    return result;
  },

  base_image_tag: function(args) {
    // scratch is a special base layer for Docker, it means there is no base layer
    if (args === 'scratch') {
      return [];
    }
    var baseImage = args.split(':');
    var result = [];
    if (baseImage.length === 1) {
      result.push({name: 'Base image without tag', message: 'Base images should have a declared tag'});
    } else if (baseImage[1] === 'latest') {
      result.push({name: 'latest tag for base image', message: 'Base images should use a pinned tag, not latest'});
    }

    return result;
  },

  valid_user: function(args) {
    var result = [];
    if (args.trim().split(' ').length != 1) {
      result.push({name: 'USER with more than 1 parameter', message: 'USER command should only include a single username'});
    }

    return result;
  },

  valid_maintainer: function(args) {
    var result = [];
    var emails = args.match(/@/g) || [];
    if (emails.length === 0) {
      result.push({name: 'MAINTAINER without email', message: 'MAINTAINER should include an email address'});
    } else if (emails.length > 1) {
      result.push({name: 'MAINTAINER with more than 1 email address', message: 'MAINTAINER command should only include a single author'});
    }

    return result;
  },

  param_count_min: function(args, min_count) {
    return args.split(' ').length >= min_count;
  },

  is_dir_in_context: function(dir) {
    return (!dir.startsWith('..') && !dir.startsWith('/'));
  },

  is_valid_add: function(args) {
    var result = [];
    if (!commands.param_count_min(args, 2)) {
      result.push({name: 'ADD requires at least 2 arguments', message: 'ADD command found with less than 2 arguments.'});
    }

    var hasWildcard = false;
    var sources = args.match(/\S+/g);
    var dest = sources.pop();
    sources.forEach(function(source) {
      if (source.includes('*') || source.includes('?')) {
        hasWildcard = true;
      }
      if (!commands.is_dir_in_context(source)) {
        result.push({name: 'ADD source locations must be relative', message: 'ADD source locations must be local to the Docker build context.'});
      }
    });

    // if there are > 1 source or any source contains a wildcard, then dest must be a dir
    if ((sources.length > 1) || hasWildcard) {
      if (args.slice(-1)[0] !== '/') {
        result.push({name: 'ADD dest must be dir because of source args', message: 'When ADD source includes wildcards or multiple locations, dest must be a directory'});
      }
    }

    return result;
  }
}
