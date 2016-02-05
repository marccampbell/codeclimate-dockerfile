var expect = require('chai').expect
var checks = require('../lib/checks.js')

describe("checks", function(){
  describe("#expose_container_port_only(args)", function(){
    it("validates expose command for no host port", function(){
      expect(checks.expose_container_port_only("8000")).to.be.empty;
      expect(checks.expose_container_port_only("8000:8000")).to.have.length(1);
      expect(checks.expose_container_port_only("8000 8001")).to.be.empty;
      expect(checks.expose_container_port_only("8000 8001:8000")).to.have.length(1);
    });
  });

  describe("#label_format(args)", function(){
    it("validates label command in key=value format", function(){
      expect(checks.label_format("key=value")).to.be.empty;
      expect(checks.label_format("key=value key=value")).to.be.empty;
      expect(checks.label_format("key")).to.have.length(1);
      expect(checks.label_format("key value")).to.have.length(2);
    });
  });

  describe("#base_image_tag(args)", function(){
    it("validates base image command", function(){
      expect(checks.base_image_tag("ubuntu:14.04")).to.be.empty;
      expect(checks.base_image_tag("ubuntu:latest")).to.have.length(1);
      expect(checks.base_image_tag("ubuntu")).to.have.length(1);
    });
  });

  describe("#valid_user(args)", function(){
    it("validates user command has exactly one parameter", function(){
      expect(checks.valid_user("root")).to.be.empty;
      expect(checks.valid_user("root wheel")).to.have.length(1);
    });
  });

  describe("#valid_maintainer(args)", function(){
    it("validates maintainer command has exactly one maintainer", function(){
      expect(checks.valid_maintainer("user <test@gmail.com>")).to.be.empty;
      expect(checks.valid_maintainer("user without email")).to.have.length(1);
      expect(checks.valid_maintainer("user <test@gmail.com> user2 <test@gmail.com>")).to.have.length(1);
    });
  });

  describe("#param_count_min(args, min_count)", function() {
    it("validates that a argument line, split on whitespace, contains at least min_count elements", function(){
      expect(checks.param_count_min("one", 1)).to.equal(true);
      expect(checks.param_count_min("one", 2)).to.equal(false);
      expect(checks.param_count_min("one two three", 1)).to.equal(true);
      expect(checks.param_count_min("one two three", 4)).to.equal(false);
    })
  });

  describe("#is_dir_in_context(dir)", function() {
    it("validates that a directory is relative (to the docker context)", function(){
      expect(checks.is_dir_in_context("/etc")).to.equal(false);
      expect(checks.is_dir_in_context("../home")).to.equal(false);
      expect(checks.is_dir_in_context("./test")).to.equal(true);
      expect(checks.is_dir_in_context("test")).to.equal(true);
    })
  });

  describe("#is_valid_add(args)", function() {
    it("validates add command is valid", function(){
      expect(checks.is_valid_add("./ test/")).to.be.empty;
      expect(checks.is_valid_add("./ test")).to.be.empty;
      expect(checks.is_valid_add("test? test")).to.have.length(1);
      expect(checks.is_valid_add("test/test* test")).to.have.length(1);
      expect(checks.is_valid_add("/text test/")).to.have.length(1);
      expect(checks.is_valid_add("test test2 test/")).to.be.empty;
      expect(checks.is_valid_add("test test2 test")).to.have.length(1);
    })
  });
});
