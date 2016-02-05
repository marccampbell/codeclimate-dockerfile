var glob = require('glob'),
    exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    fileBuilder = require('./file-builder'),
    checks = require('./checks'),
    run_checks = require('./run_checks');

module.exports = DockerfileLint;

function DockerfileLint() { }

DockerfileLint.prototype.runEngine = function(){
  var analysisFiles = [],
      config = {
        include_paths: ["./"]
      },
      self = this;

  if (fs.existsSync('/config.json')) {
    var userConfig = JSON.parse(fs.readFileSync('/config.json'));

    config.include_paths = userConfig.include_paths;

    if (userConfig.config) {
      for (var prop in userConfig.config) {
        config[prop] = userConfig.config[prop];
      }
    }
  }

  analysisFiles = fileBuilder.withIncludes(config.include_paths);
  analysisFiles = fileBuilder.filterFiles(analysisFiles);

  analysisFiles.forEach(function(f, i, a){
    self.find(f);
  });
}

DockerfileLint.prototype.find = function(file, strings){
  // Only run this on a file that has the name "Dockerfile" in it
  if (!file.includes('Dockerfile')) {
    return;
  }

  var self = this;

  // Parse the file into an array of instructions
  var instructions = {};
  var fileContent = fs.readFileSync(file, 'UTF-8');
  var lines = fileContent.split(/\r?\n/) || [];
  var partialLine = '';
  var partialLineNum = 0;
  lines.forEach(function(line, lineNum) {
    // Trim whitespace from the line
    line = line.trim();

    // Ignore empty lines
    if (line === '') {
      return;
    }

    // Ignore comments
    if (line.startsWith('#')) {
      return;
    }

    // If the line ends in \, then it's a partial line
    if (line.slice(-1) === '\\') {
      partialLine = partialLine + line.slice(0, -1) + ' ';
      if (partialLineNum === 0) {
        partialLineNum = lineNum;
      }
      return;
    }

    // We want the errors to report the correct line number, so get the start of the
    // extended, multi-line instruction
    if (partialLineNum !== 0) {
      lineNum = partialLineNum;
    }

    // Append to any partial line, clearing the partial line for the next cycle
    var entireLine = partialLine + ' ' + line;
    instructions[lineNum] = entireLine.trim();
    partialLine = '';
    partialLineNum = 0;
  });

  var isFirstCommand = true;
  for (var lineNum in instructions) {
    self.lintLine(file.split('/code')[1], instructions[lineNum], lineNum, lines, isFirstCommand);
    isFirstCommand = false;
  };
}

DockerfileLint.prototype.lintLine = function(fileName, line, lineNumStart, lines, isFirstCommand) {
  var cmd = null,
      self = this;

  // All Dockerfile commands require parameters
  if (line.trim().match(/\S+/g).length === 1) {
    self.printIssue(fileName, lineNumStart, 'Missing parameters', 'Command \'' + line + '\' without parameters');
    return;
  }

	line = line.replace(/^\w+ /, function(command){
		var cmd = command.replace(/\s+/, '').toLowerCase();
    var args = line.toLowerCase().replace(cmd, '').trim();
    var cmdFound = false;
    // check that the first command is a FROM, this might get reported twice, if the FROM command does exist,
    // but is not the time (non blank, non commented) line
    if ((isFirstCommand && cmd !== 'from') || (!isFirstCommand && cmd === 'from')) {
      self.printIssue(fileName, lineNumStart, 'FROM after first command', 'FROM command should be the first line in a Dockerfile.');
    }

    // check for sudo usage in any command
    args.match(/\S+/g).forEach(function(arg) {
      if (arg.trim().toLowerCase() === 'sudo') {
        self.printIssue(fileName, lineNumStart, 'sudo usage', 'sudo usage is not allowed.  Commands will run as sudo.');
      }
    });

    var msgs = []
  	if (cmd === 'from') {
      msgs = checks.base_image_tag(args);
    } else if (cmd === 'expose') {
      msgs = checks.expose_container_port_only(args);
    } else if (cmd === 'label') {
      msgs = checks.label_format(args);
    } else if (cmd === 'run') {
      run_checks.aptget_commands(args).forEach(function(aptget_command) {
        var subcommand = run_checks.aptget_subcommand(aptget_command);
        if (["install", "remove", "upgrade"].indexOf(subcommand) > -1) {
          if (!run_checks.aptget_hasyes(aptget_command)) {
            self.printIssue(fileName, lineNumStart, 'apt-get without -y', 'apt-get install, remove and upgrade commands should include a -y flag');
          }
        }
        if (subcommand === 'install') {
          if (!run_checks.aptget_hasnorecommends(aptget_command)) {
            self.printIssue(fileName, lineNumStart, 'apt-get install without --no-install-recommends', 'apt-get install commands should include a --no-install-recommends flag');
          }
        }
      });
    } else if (cmd === 'cmd') {
      if (cmdFound === true) {
        self.printIssue(fileName, lineNumStart, 'Multiple CMD lines', 'Multiple CMDs found.  Only the last CMD will be used.');
      }
      cmdFound = true;
    } else if (cmd === 'env') {

    } else if (cmd === 'maintainer') {
      msgs = checks.valid_maintainer(args);
    } else if (cmd === 'add') {
      msgs = checks.is_valid_add(args);
    } else if (cmd === 'copy') {

    } else if (cmd === 'entrypoint') {

    } else if (cmd === 'volume') {

    } else if (cmd === 'user') {
      msgs = checks.valid_user(args);
    } else if (cmd === 'workdir') {

    } else if (cmd === 'onbuild') {

    } else if (cmd === 'stopsignal') {
      
    } else {
      self.printIssue(fileName, lineNumStart, 'Invalid command', 'Invalid command \'' + cmd + '\'');
    }

    if (msgs.length > 0) {
      msgs.forEach(function(msg) {
        self.printIssue(fileName, lineNumStart, msg.name, msg.message);
      });
    }
	});
}

DockerfileLint.prototype.printIssue = function(fileName, lineNum, name, message) {
// Prints properly structured Issue data to STDOUT according to Code Climate Engine specification.
  var issue = {
    "type": "issue",
    "check_name": name,
    "description": message,
    "categories": ["Bug Risk"],
    "location":{
      "path": fileName,
      "lines": {
        "begin": lineNum,
        "end": lineNum
      }
    }
  };

  var issueString = JSON.stringify(issue)+"\0";
  console.log(issueString);
}

DockerfileLint.prototype.debug = function(message) {
// Prints properly structured Issue data to STDOUT according to Code Climate Engine specification.
  var issue = {
    "type": "issue",
    "check_name": "debug",
    "description": message,
    "categories": ["Bug Risk"],
    "location":{
      "path": "Dockerfile",
      "lines": {
        "begin": 1,
        "end": 1
      }
    }
  };

  var issueString = JSON.stringify(issue)+"\0";
  console.log(issueString);
}
