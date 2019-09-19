import { matIV } from './minMatrix.js'

onload = function() {
  var c = document.createElement('canvas');
  this.document.querySelector('body').appendChild(c);
  c.width = 500;
  c.height = 300;

  var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

  var v_shader = create_shader('vs');
  var f_shader = create_shader('fs');

  var prg = create_program(v_shader, f_shader);

  var attLocation = new Array();
  attLocation[0] = gl.getAttribLocation(prg, 'position');
  attLocation[1] = gl.getAttribLocation(prg, 'color');
  attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');

  var attStride = new Array(2);
  attStride[0] = 3;
  attStride[1] = 4;
  attStride[2] = 2;

  var position = [
    -1.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.1
  ];

  var color = [
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0
  ];

  var textureCoord = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];

  var index = [
    0, 1, 2,
    3, 2, 1
  ];

  var vPosition = create_vbo(position);
  var vColor = create_vbo(color);
  var vTextureCoord = create_vbo(textureCoord);
  var VBOList = [vPosition, vColor, vTextureCoord];
  var iIndex = create_ibo(index);

  set_attribute(VBOList, attLocation, attStride);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);

  var uniLocation = new Array();
  uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
  uniLocation[1] = gl.getUniformLocation(prg, 'texture');

  var m = new matIV();

  var mMatrix = m.identity(m.create());
  var vMatrix = m.identity(m.create());
  var pMatrix = m.identity(m.create());
  var tmpMatrix = m.identity(m.create());
  var mvpMatrix = m.identity(m.create());

  m.lookAt([0.0, 2.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
  m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
  m.multiply(pMatrix, vMatrix, tmpMatrix);

  gl.activeTexture(gl.TEXTURE0);
  var texture = null;
  create_texture('texture.png');

  var count = 0;

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  (function main_loop() {
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    count++;

    var rad = (count % 360) * Math.PI / 180;

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1f(uniLocation[1], 0);

    m.identity(mMatrix);
    m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
    m.multiply(tmpMatrix, mMatrix, mvpMatrix);

    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    setTimeout(main_loop, 1000 / 30);
  })();

  function create_shader(id) {
    var shader;
    var scriptElement = <HTMLScriptElement>document.getElementById(id);

    if (!scriptElement) {return;}

    switch (scriptElement.type) {
      case 'x-shader/x-vertex':
        shader = gl.createShader(gl.VERTEX_SHADER);
        break;
      case 'x-shader/x-fragment':
        shader = gl.createShader(gl.FRAGMENT_SHADER);
        break;
      default:
        return;
    }

    gl.shaderSource(shader, scriptElement.text);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      alert(gl.getShaderInfoLog(shader));
    }
  }

  function create_program(vs, fs) {
    var program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;
    } else {
      alert(gl.getProgramInfoLog(program));
    }
  }

  function create_vbo(data) {
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }

  function create_ibo(data) {
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  function set_attribute(vbo, attL, attS) {
    for (var i in vbo) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
      gl.enableVertexAttribArray(attL[i]);
      gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
    }
  }

  function create_texture(source) {
    var img = new Image();

    img.onload = function() {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
      texture = tex;
    }
    img.src = source;
  }

  function torus(row, column, irad, orad, color) {
    var pos = new Array(), nor = new Array(), col = new Array(), idx = new Array();
    for (var i = 0; i <= row; i++) {
      var r = Math.PI * 2 / row * i;
      var rr = Math.cos(r);
      var ry = Math.sin(r);
      for (var ii = 0; ii <= column; ii++) {
        var tr = Math.PI * 2 / column * ii;
        var tx = (rr * irad + orad) * Math.cos(tr);
        var ty = ry * irad;
        var tz = (rr * irad + orad) * Math.sin(tr);
        var rx = rr * Math.cos(tr);
        var rz = rr * Math.sin(tr);
        if (color) {
          var tc = color;
        } else {
          tc = hsva(360 / column * ii, 1, 1, 1);
        }
        pos.push(tx, ty, tz);
        nor.push(rx, ry, rz);
        col.push(tc[0], tc[1], tc[2], tc[3]);
      }
    }
    for (i = 0; i < row; i++) {
      for (ii = 0; ii < column; ii++) {
        r = (column + 1) * i + ii;
        idx.push(r, r + column + 1, r + 1);
        idx.push(r + column + 1, r + column + 2, r + 1);
      }
    }
    return {p : pos, n : nor, c : col, i : idx};
  }

  function sphere(row, column, rad, color){
    var pos = new Array(), nor = new Array(), col = new Array(), idx = new Array();
    for(var i = 0; i <= row; i++){
      var r = Math.PI / row * i;
      var ry = Math.cos(r);
      var rr = Math.sin(r);
      for(var ii = 0; ii <= column; ii++){
        var tr = Math.PI * 2 / column * ii;
        var tx = rr * rad * Math.cos(tr);
        var ty = ry * rad;
        var tz = rr * rad * Math.sin(tr);
        var rx = rr * Math.cos(tr);
        var rz = rr * Math.sin(tr);
        if(color){
          var tc = color;
        }else{
          tc = hsva(360 / row * i, 1, 1, 1);
        }
        pos.push(tx, ty, tz);
        nor.push(rx, ry, rz);
        col.push(tc[0], tc[1], tc[2], tc[3]);
      }
    }
    r = 0;
    for(i = 0; i < row; i++){
      for(ii = 0; ii < column; ii++){
        r = (column + 1) * i + ii;
        idx.push(r, r + 1, r + column + 2);
        idx.push(r, r + column + 2, r + column + 1);
      }
    }
    return {p : pos, n : nor, c : col, i : idx};
  }

  function hsva(h, s, v, a) {
    if (s > 1 || v > 1 || a > 1) { return; }
    var th = h % 360;
    var i = Math.floor(th / 60);
    var f = th / 60 - i;
    var m = v * (1 - s);
    var n = v * (1 - s * f);
    var k = v * (1 - s * (1 - f));
    var color = new Array();
    var r = new Array(v, n, m, m, k, v);
    var g = new Array(k, v, v, n, m, m);
    var b = new Array(m, m, k, v, v, n);
    color.push(r[i], g[i], b[i], a);
    return color;
  }
}
