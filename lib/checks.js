

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
  }
}
