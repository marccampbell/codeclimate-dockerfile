

var commands = module.exports = {
  expose_container_port_only: function(args) {
    var ports = args.match(/\S+/g);
    var result = [];
    ports.forEach(function(port) {
      if (port.split(':').length > 1) {
        result.push({name: 'EXPOSE with host port', categories: ['Compatibility'], message: 'EXPOSE should only specify a container port, not a host port'});
      }
    });

    return result;
  },

  expose_port_valid: function(port) {
    return /^[0-9]+$/.test(port);
  },

  label_format: function(args) {
    var labels = args.match(/\S+/g);
    var result = [];
    labels.forEach(function(label) {
      if (label.split('=').length !== 2) {
        result.push({name: 'LABEL not in key=value format', categories: ['Bug Risk'], message: 'LABEL command should contain one or more key=value pairs'});
      }
    });

    return result;
  },

  base_image_tag: function(args) {
    // scratch is a special base layer for Docker, it means there is no base layer
    if (args === 'scratch') {
      return [];
    }
    var baseImage;
    if (args.includes('@')) {
      baseImage = args.split('@');
    } else {
      baseImage = args.split(':');
    }
    var result = [];
    if (baseImage.length === 1) {
      result.push({name: 'Base image without tag', categories: ['Clarity'], message: 'Base images should have a declared tag'});
    } else if (baseImage[1] === 'latest') {
      result.push({name: 'latest tag for base image', categories: ['Clarity'], message: 'Base images should use a pinned tag, not latest'});
    }

    return result;
  },

  valid_user: function(args) {
    var result = [];
    if (args.trim().match(/\S+/g).length != 1) {
      result.push({name: 'USER with more than 1 parameter', categories: ['Bug Risk'], message: 'USER command should only include a single username'});
    }

    return result;
  },

  valid_maintainer: function(args) {
    var result = [];
    var emails = args.match(/@/g) || [];
    if (emails.length === 0) {
      result.push({name: 'MAINTAINER without email', categories: ['Bug Risk'], message: 'MAINTAINER should include an email address'});
    } else if (emails.length > 1) {
      result.push({name: 'MAINTAINER with more than 1 email address', categories: ['Bug Risk'], message: 'MAINTAINER command should only include a single author'});
    }

    return result;
  },

  param_count_min: function(args, min_count) {
    return args.match(/\S+/g).length >= min_count;
  },

  is_dir_in_context: function(dir) {
    return (!dir.startsWith('..') && !dir.startsWith('/'));
  },

  is_valid_add: function(args) {
    var result = [];
    if (!commands.param_count_min(args, 2)) {
      result.push({name: 'ADD requires at least 2 arguments', categories: ['Bug Risk'], message: 'ADD command found with less than 2 arguments.'});
    }

    var hasWildcard = false;
    var sources = args.match(/\S+/g);
    var dest = sources.pop();
    sources.forEach(function(source) {
      if (source.includes('*') || source.includes('?')) {
        hasWildcard = true;
      }
      if (!commands.is_dir_in_context(source)) {
        result.push({name: 'ADD source locations must be relative', categories: ['Bug Risk'], message: 'ADD source locations must be local to the Docker build context.'});
      }
    });

    // if there are > 1 source or any source contains a wildcard, then dest must be a dir
    if ((sources.length > 1) || hasWildcard) {
      if (args.slice(-1)[0] !== '/') {
        result.push({name: 'ADD dest must be dir because of source args', categories: ['Bug Risk'], message: 'When ADD source includes wildcards or multiple locations, dest must be a directory'});
      }
    }

    return result;
  },

  is_valid_workdir: function(args) {
    var result = [];
    // If it's wrapped in quotes, it's ok.
    if (commands.is_wrapped_in_quotes(args)) {
      return result;
    }

    // Now there just cannot be a space
    if (args.match(/\S+/g).length > 1) {
      result.push({name: 'WORKDIR requires exactly 1 argument', categories: ['Bug Risk'], message: 'WORKDIR cannot include spaces unless wrapped in quotes.'});
    }

    return result;
  },

  is_wrapped_in_quotes: function(args) {
    if (args.startsWith('\'') && args.endsWith('\'')) {
      return true;
    }
    if (args.startsWith('"') && args.endsWith('"')) {
      return true;
    }

    return false;
  },

  is_valid_env: function(args) {
    // Dockerfile syntax is either a=b c=d (no internal spaces) or a b c d (for spaces)
    var p = args.match(/\S+/g);
    // if there is not a = in the first element, we shoud assume it's the second format above
    if (!p[0].includes('=')) {
      return [];
    } else {
      var result = [];
      var vars = args.match(/\S+/g);
      vars.forEach(function(v) {
        if (!v.includes('=')) {
          result.push({name: 'ENV should be in key=value format', categories: ['Bug Risk'], message: 'ENV should contain key=value'});
        }
        if (v.match(/\S+/g).length > 1) {
          result.push({name: 'ENV should not contain whitespace', categories: ['Bug Risk'], message: 'Unquoted ENV should not contain whitespace'});
        }
      });

      return result;
    }
  }
}
