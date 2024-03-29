function e(n, e, t) {
  return (
    n(
      (t = {
        path: e,
        exports: {},
        require: function (n, e) {
          return (function () {
            throw new Error(
              "Dynamic requires are not currently supported by @rollup/plugin-commonjs"
            );
          })(null == e && t.path);
        },
      }),
      t.exports
    ),
    t.exports
  );
}

var t = e(function (n) {
  !(function () {
    var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
      t = {
        rotl: function (n, e) {
          return (n << e) | (n >>> (32 - e));
        },
        rotr: function (n, e) {
          return (n << (32 - e)) | (n >>> e);
        },
        endian: function (n) {
          if (n.constructor == Number)
            return (16711935 & t.rotl(n, 8)) | (4278255360 & t.rotl(n, 24));

          for (var e = 0; e < n.length; e++) n[e] = t.endian(n[e]);

          return n;
        },
        randomBytes: function (n) {
          for (var e = []; n > 0; n--) e.push(Math.floor(256 * Math.random()));

          return e;
        },
        bytesToWords: function (n) {
          for (var e = [], t = 0, r = 0; t < n.length; t++, r += 8)
            e[r >>> 5] |= n[t] << (24 - (r % 32));

          return e;
        },
        wordsToBytes: function (n) {
          for (var e = [], t = 0; t < 32 * n.length; t += 8)
            e.push((n[t >>> 5] >>> (24 - (t % 32))) & 255);

          return e;
        },
        bytesToHex: function (n) {
          for (var e = [], t = 0; t < n.length; t++)
            e.push((n[t] >>> 4).toString(16)), e.push((15 & n[t]).toString(16));

          return e.join("");
        },
        hexToBytes: function (n) {
          for (var e = [], t = 0; t < n.length; t += 2)
            e.push(parseInt(n.substr(t, 2), 16));

          return e;
        },
        bytesToBase64: function (n) {
          for (var t = [], r = 0; r < n.length; r += 3)
            for (
              var o = (n[r] << 16) | (n[r + 1] << 8) | n[r + 2], i = 0;
              i < 4;
              i++
            )
              8 * r + 6 * i <= 8 * n.length
                ? t.push(e.charAt((o >>> (6 * (3 - i))) & 63))
                : t.push("=");

          return t.join("");
        },
        base64ToBytes: function (n) {
          n = n.replace(/[^A-Z0-9+\/]/gi, "");

          for (var t = [], r = 0, o = 0; r < n.length; o = ++r % 4)
            0 != o &&
              t.push(
                ((e.indexOf(n.charAt(r - 1)) & (Math.pow(2, -2 * o + 8) - 1)) <<
                  (2 * o)) |
                  (e.indexOf(n.charAt(r)) >>> (6 - 2 * o))
              );

          return t;
        },
      };
    n.exports = t;
  })();
});
var r = {
  utf8: {
    stringToBytes: function (n) {
      return r.bin.stringToBytes(unescape(encodeURIComponent(n)));
    },
    bytesToString: function (n) {
      return decodeURIComponent(escape(r.bin.bytesToString(n)));
    },
  },
  bin: {
    stringToBytes: function (n) {
      for (var e = [], t = 0; t < n.length; t++) e.push(255 & n.charCodeAt(t));

      return e;
    },
    bytesToString: function (n) {
      for (var e = [], t = 0; t < n.length; t++)
        e.push(String.fromCharCode(n[t]));

      return e.join("");
    },
  },
};
var o = r;
var i = e(function (n) {
  var e, r, i, s;
  (e = t),
    (r = o.utf8),
    (i = o.bin),
    ((s = function (n, t) {
      var o = e.wordsToBytes(
        (function (n) {
          n.constructor == String
            ? (n = r.stringToBytes(n))
            : "undefined" != typeof Buffer &&
              "function" == typeof Buffer.isBuffer &&
              Buffer.isBuffer(n)
            ? (n = Array.prototype.slice.call(n, 0))
            : Array.isArray(n) || (n = n.toString());
          var t = e.bytesToWords(n),
            o = 8 * n.length,
            i = [],
            s = 1732584193,
            a = -271733879,
            u = -1732584194,
            c = 271733878,
            f = -1009589776;
          (t[o >> 5] |= 128 << (24 - (o % 32))),
            (t[15 + (((o + 64) >>> 9) << 4)] = o);

          for (var l = 0; l < t.length; l += 16) {
            for (var p = s, d = a, h = u, g = c, y = f, b = 0; b < 80; b++) {
              if (b < 16) i[b] = t[l + b];
              else {
                var v = i[b - 3] ^ i[b - 8] ^ i[b - 14] ^ i[b - 16];
                i[b] = (v << 1) | (v >>> 31);
              }
              var T =
                ((s << 5) | (s >>> 27)) +
                f +
                (i[b] >>> 0) +
                (b < 20
                  ? 1518500249 + ((a & u) | (~a & c))
                  : b < 40
                  ? 1859775393 + (a ^ u ^ c)
                  : b < 60
                  ? ((a & u) | (a & c) | (u & c)) - 1894007588
                  : (a ^ u ^ c) - 899497514);
              (f = c), (c = u), (u = (a << 30) | (a >>> 2)), (a = s), (s = T);
            }

            (s += p), (a += d), (u += h), (c += g), (f += y);
          }

          return [s, a, u, c, f];
        })(n)
      );
      return t && t.asBytes
        ? o
        : t && t.asString
        ? i.bytesToString(o)
        : e.bytesToHex(o);
    })._blocksize = 16),
    (s._digestsize = 20),
    (n.exports = s);
});

async function initLB() {
  const n = await fetch("/stonehold/lbcfg.json"),
    e = await n.json();
  Object.assign(s, e, {
    initialized: !0,
  }),
    a.forEach(({ name: n, score: e }) => u(n, e)),
    a.splice(0),
    console.debug("Leaderboard initialized");
}

initLB();

const s = {
  initialized: !1,
};
const a = [];

export async function reportScore(n, e) {
  if (!s.initialized)
    return (
      console.debug(
        "not yet initialized, saving score to send after initialization",
        {
          name: n,
          score: e,
        }
      ),
      void a.push({
        name: n,
        score: e,
      })
    );
  console.debug("reporting score", {
    name: n,
    score: e,
  });

  const t = (function (n, e) {
      return i(n + e + s.secret);
    })(n, e),
    r = s.leaderboard,
    o = s.username,
    u = s.password,
    c = new Headers();

  c.append("Authorization", "Basic" + btoa(o + ":" + u)),
    c.append("Content-Type", "application/json");
  const f = JSON.stringify({
      name: n,
      score: e,
      checksum: t,
    }),
    l = await fetch(r, {
      method: "POST",
      headers: c,
      body: f,
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
    });
  return await l.json();
}
