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
});
