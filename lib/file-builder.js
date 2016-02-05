var glob = require('glob'),
    fs = require('fs');

// Returns file paths based on the include_paths values in config file
function withIncludes(include_paths) {
  return buildFiles(include_paths);
}

// Returns all the file paths in the main directory that match the given pattern
function buildFiles(paths) {
  var files = [];

  paths.forEach(function(path, i, a) {
    var pattern = "/code/" + path + "**"
    files.push.apply(files, glob.sync(pattern, {}));
  });
  return files;
}

// Filters the directory paths out
function filterFiles(paths) {
  return paths.filter(function(file) {
    return !fs.lstatSync(file).isDirectory();
  });
  return analysisFiles;
}

module.exports = {
  withIncludes: withIncludes,
  filterFiles: filterFiles
};

