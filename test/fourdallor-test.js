// ## fourdollar.js test



var assert = require('assert');
var $4 = require('../fourdollar');
$4.assert();
var fs = require('fs');
var path = require('path');
var process = require('process');

describe('fourdollar', function () {
  describe('#makePromise()', function () {
    var _readFile = $4.makePromise(fs.readFile);

    it('fs.readFile를 Promise로 변경할 수 있다', function () {
      return _readFile(path.resolve(__dirname, '../resource/dmp01.txt'))
      .then(function (data) {
        assert.ok(data);
      }).catch(assert.ifError);
    });


    it('catch도 올바르게 수행된다.', function () {
      return _readFile('sdlkfjsdlkfj.txt')
      .then(function (data) {
        assert.ok(false);
      }).catch(function (e) {
        assert.ok(e);
      });
    });


    it('then 인수도 전달받는다.', function () {
      return _readFile(path.resolve(__dirname, '../resource/dmp01.txt'), {encoding: 'utf-8'})
      .then(function (data) {
        assert.equal(data, 'Hello World!!\n');
      }).catch(assert.ifError);
    });


    it('catch error 인수도 전달받는다.', function () {
      return _readFile('sdlfhsldfjlsd.txt')
      .catch(assert.ok);
    });


    it('error 인수가 없는 비동기도 잘 동작한다.', function () {
      var _exists = $4.makePromise(fs.exists, false);
      return _exists('dsaldjfljds.txt')
      .then(function (exists) {
        assert.equal(exists, false);
      });
    });
  });


  describe('#extend()', function () {
    it('객체를 확장할 수 있다.', function () {
      var objA = {hello: 'hello', world: 'world'};
      var objB = {foo: 'foo', bar: 'bar'};
      var extendedObj = $4.extend(objA, objB);
      assert.equal(extendedObj.foo, 'foo');
      assert.equal(extendedObj.bar, 'bar');
      assert.equal(objA.foo, 'foo');
      assert.equal(objA.bar, 'bar');
    });
  });


  describe('assert#createSpy()', function () {
    it('실행되지 않았을 때 상태는 초기값과 같아야 한다.', function () {
      var naverCall = $4.createSpy();
      assert.deepEqual(naverCall.wasCalled, false);
      assert.deepEqual(naverCall.count, 0);
    });

    it('실행되었을 때 올바른 값을 가져야 한다.', function () {
      var mustCall = $4.createSpy();
      mustCall();
      assert.deepEqual(mustCall.wasCalled, true);
      assert.deepEqual(mustCall.count, 1);
    });
  });


  $4.node();
  describe('node#mergeBuffers()', function () {
    var buf1 = new Buffer('foo');
    var buf2 = new Buffer('bar');
    var buf3 = new Buffer('!!');

    it('버퍼들을 하나로 합친다.', function () {
      var merge = $4.mergeBuffers(buf1, buf2, buf3);
      assert.equal(merge.toString(), 'foobar!!');
    });

    it('정말로 버퍼이다.', function () {
      var merge = $4.mergeBuffers(buf1, buf2, buf3);
      assert.ok(merge instanceof Buffer);
    });
  });


  // node#resolveHome()은 여기서 테스트 하지 않는다.
  // describe('node.resolveHome():', function () {
  //   var homeDir = process.env.HOME || process.env.USERPROFILE;
  //
  //   it('홈디렉토리가 기준이다.', function () {
  //     expect($4.resolveHome()).toEqual(homeDir);
  //   });
  //
  //   it('홈디렉토리로 시작하는 path.resolve와 같아야 한다.', function () {
  //     expect($4.resolveHome('foo', 'bar'))
  //       .toEqual(path.resolve(homeDir, 'foo', 'bar'));
  //   });
  // });


  describe('node#_constructDir()', function () {
    var _exists = $4.makePromise(fs.exists, false);
    var _rmdir = $4.makePromise(fs.rmdir);

    before(function () {
      return _exists(path.resolve(__dirname, '../tmp/foo/bar'))
      .then(function (exists) {
        if(exists) {
          return _rmdir(path.resolve(__dirname, '../tmp/foo/bar'));
        }
      }).then(function () {
        return _exists(path.resolve(__dirname, '../tmp/foo'));
      }).then(function (exists) {
        if(exists) {
          return _rmdir(path.resolve(__dirname, '../tmp/foo'));
        }
      });
    });

    it('최상위 부터 순차적으로 디렉토리를 만들수 있다.', function () {
      return $4._constructDir(path.resolve(__dirname, '../tmp/foo/bar'))
      .then(function () {
        return _exists(path.resolve(__dirname, '../tmp/foo/bar'));
      }).then(function (exists) {
        assert.ok(exists);
      });
    });
  });


  describe('node#_getRemoteData()', function () {
    var catchCallback = $4.createSpy();

    before(function () {
      return $4._getRemoteData('www.naver.com')
      .catch(catchCallback);
    });

    it('원격지에서 data를 가져올 수 있다.', function () {
      return $4._getRemoteData('https://raw.githubusercontent.com/bynaki/fourdollar.js/v0.1/resource/dmp01.txt')
      .then(function (data) {
        assert.equal(data.toString(), 'Hello World!!\n');
      });
    });

    it('http:, https: 만 허용된다.', function () {
      assert.ok(catchCallback.wasCalled);
    });
  });


  describe('node#_download()', function () {
    var uri = 'https://raw.githubusercontent.com/bynaki/fourdollar.js/v0.1/resource/ironman.jpg';
    var filename = path.resolve(__dirname, '../tmp/ironman.jpg');
    var _exists = $4.makePromise(fs.exists, false);
    var _unlink = $4.makePromise(fs.unlink);

    before(function () {
      return _exists(filename)
      .then(function (exists) {
        if(exists) {
          return _unlink(filename);
        }
      });
    })

    it('원격지의 파일을 다운로드한다.', function () {
      return $4._download(uri, filename)
      .then(function () {
        return _exists(filename);
      }).then(function (exists) {
        assert.deepEqual(exists, true);
      });
    });


    it('http:, https: 만 허용된다.', function () {
      var catchCallback = $4.createSpy();
      return $4._download('www.naver.com', filename)
      .catch(catchCallback)
      .then(function () {
        assert.ok(catchCallback.wasCalled);
      });
    });
  });


  describe('node#_download2()', function () {
    var uri = 'https://raw.githubusercontent.com/bynaki/fourdollar.js/v0.1/resource/ironman.jpg';
    var filename = path.resolve(__dirname, '../tmp/ironman.jpg');
    var _exists = $4.makePromise(fs.exists, false);
    var _unlink = $4.makePromise(fs.unlink);

    before(function () {
      return _exists(filename)
      .then(function (exists) {
        if(exists) {
          return _unlink(filename);
        }
      });
    })

    it('원격지의 파일을 다운로드한다.', function () {
      return $4._download2(uri, filename)
      .then(function () {
        return _exists(filename);
      }).then(function (exists) {
        assert.deepEqual(exists, true);
      });
    });


    it('http:, https: 만 허용된다.', function () {
      var catchCallback = $4.createSpy();
      return $4._download2('www.naver.com', filename)
      .catch(catchCallback)
      .then(function () {
        assert.ok(catchCallback.wasCalled);
      });
    });
  });

});
