
var commands = module.exports = {
  apt_get: function(args) {
    var result = [];
    if (args.startsWith('[')) {
      // Shell form RUN command
    } else {
      // Exec form RUN command
      var aptGetFound = false,
          aptGetSubcommand = '',
          dashYFound = false,
          noInstallRecommendsFound = false,
          rmListsFound = false;
      var commands = args.split('&&');
      commands.forEach(function(command) {
        command = command.trim();
        // Treat apt-get as a special command and split it apart
        if (command.startsWith('apt-get')) {
          var commandParts = command.split(' ');
          commandParts.forEach(function(commandPart, i) {
            if (i === 1 && aptGetFound === true) {
              aptGetSubcommand = commandPart;
            }
            if (commandPart === 'apt-get') {
              aptGetFound = true;
            } else if (commandPart === '-y') {
              dashYFound = true;
            } else if (commandPart === '--no-install-recommends') {
              noInstallRecommendsFound = true;
            }
          });
        } else if (command.startsWith('rm')) {
          var commandParts = command.split(' ');
          var isAptLists = '',
              hasRfFlags = '';
          commandParts.forEach(function(commandPart) {
            if (commandPart.includes('-') && commandPart.includes('r') && commandPart.includes('f')) {
              hasRfFlags = true;
            } else if (commandPart === '/var/lib/apt/lists/*') {
              isAptLists = true;
            }
          });

          if (isAptLists && hasRfFlags) {
            rmListsFound = true;
          }
        }
      });
      if (aptGetFound) {
        if (aptGetSubcommand === 'install') {
          if (!noInstallRecommendsFound) {
            var msg = 'apt-get ' + aptGetSubcommand + ' should include --no-install-recommends to minimize space';
            result.push({name: 'apt-get install without --no-install-recommends', message: msg});
          }
          if (!dashYFound) {
            var msg = 'apt-get ' + aptGetSubcommand + ' should include -y to run unattended';
            result.push({name: 'apt-get install without -y', message: msg});
          }
          if (!rmListsFound) {
            var msg = 'apt-get ' + aptGetSubcommand + ' should be paired with rm -rf /var/lib/apt/lists/*';
            result.push({name: 'apt-get install without cleaning up', message: msg});
          }
        }
      }
    }

    return result;
  }
}
