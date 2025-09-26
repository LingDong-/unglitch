var squiggy = (() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/squiggy.ts
  var squiggy_exports = {};
  __export(squiggy_exports, {
    __balltrack: () => balltrack,
    __convex_hull: () => convex_hull,
    __field_disturb: () => field_disturb,
    __stampdrag_cust: () => stampdrag_cust,
    __stampdrag_ident: () => stampdrag_ident,
    __unmess: () => unmess,
    custom_brush: () => custom_brush,
    preprocess: () => preprocess,
    stamp_brush: () => stamp_brush,
    tape_brush: () => tape_brush
  });

  // src/unmess.ts
  var HOLE_NONE = 0;
  var HOLE_AGGRESSIVE = 1;
  var HOLE_NONZERO = 2;
  var HOLE_EVENODD = 3;
  function disturb(poly, epsilon = 1e-4) {
    for (let j = 0; j < poly.length; j++) {
      poly[j][0] += (Math.random() * 2 - 1) * epsilon;
      poly[j][1] += (Math.random() * 2 - 1) * epsilon;
    }
  }
  function seg_isect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y, is_ray = false) {
    let d0x = p1x - p0x;
    let d0y = p1y - p0y;
    let d1x = q1x - q0x;
    let d1y = q1y - q0y;
    let vc = d0x * d1y - d0y * d1x;
    if (vc == 0) {
      return null;
    }
    let vcn = vc * vc;
    let q0x_p0x = q0x - p0x;
    let q0y_p0y = q0y - p0y;
    let vc_vcn = vc / vcn;
    let t = (q0x_p0x * d1y - q0y_p0y * d1x) * vc_vcn;
    let s = (q0x_p0x * d0y - q0y_p0y * d0x) * vc_vcn;
    if (0 <= t && (is_ray || t < 1) && 0 <= s && s < 1) {
      let ret = {t, s, side: null, other: null, xy: null};
      ret.xy = [p1x * t + p0x * (1 - t), p1y * t + p0y * (1 - t)];
      ret.side = pt_in_pl(p0x, p0y, p1x, p1y, q0x, q0y) < 0 ? 1 : -1;
      return ret;
    }
    return null;
  }
  function pt_in_pl(x, y, x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let e = (x - x0) * dy - (y - y0) * dx;
    return e;
  }
  function build_vertices(poly) {
    let out = [];
    let n = poly.length;
    for (let i = 0; i < n; i++) {
      let p = {xy: poly[i], isects: [], isects_map: {}};
      let i1 = (i + 1 + n) % n;
      let a = poly[i];
      let b = poly[i1];
      for (let j = 0; j < n; j++) {
        let j1 = (j + 1 + n) % n;
        if (i == j || i == j1 || i1 == j || i1 == j1) {
          continue;
        }
        let c = poly[j];
        let d = poly[j1];
        let xx;
        if (out[j]) {
          let ox = out[j].isects_map[i];
          if (ox) {
            xx = {
              t: ox.s,
              s: ox.t,
              xy: ox.xy,
              other: null,
              side: pt_in_pl(...a, ...b, ...c) < 0 ? 1 : -1
            };
          }
        } else {
          xx = seg_isect(...a, ...b, ...c, ...d);
        }
        if (xx) {
          xx.other = j;
          p.isects.push(xx);
          p.isects_map[j] = xx;
        }
      }
      p.isects.sort((a2, b2) => a2.t - b2.t);
      out.push(p);
    }
    return out;
  }
  function mirror_isects(verts) {
    let imap = {};
    let n = verts.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < verts[i].isects.length; j++) {
        let id = pair_key(i, j);
        let k = verts[i].isects[j].other;
        let z = verts[k].isects.findIndex((x) => x.other == i);
        imap[id] = [k, z];
      }
    }
    return imap;
  }
  function poly_area(poly) {
    var n = poly.length;
    var a = 0;
    for (var p = n - 1, q = 0; q < n; p = q++) {
      a += poly[p][0] * poly[q][1] - poly[q][0] * poly[p][1];
    }
    return a * 0.5;
  }
  function check_concavity(poly, idx) {
    let n = poly.length;
    let a = poly[(idx - 1 + n) % n];
    let b = poly[idx];
    let c = poly[(idx + 1) % n];
    let cw = pt_in_pl(...a, ...b, ...c) < 0 ? 1 : -1;
    return cw;
  }
  function ray_isect_poly(x0, y0, x1, y1, poly) {
    let n = poly.length;
    let isects = [];
    for (let i = 0; i < poly.length; i++) {
      let a = poly[i];
      let b = poly[(i + 1) % n];
      let xx = seg_isect(x0, y0, x1, y1, ...a, ...b, true);
      if (xx) {
        isects.push(xx);
      }
    }
    isects.sort((a, b) => a.t - b.t);
    return isects;
  }
  function poly_is_hole(hole, poly, verify_winding = true, eps = 1e-4) {
    let ar = poly_area(hole);
    hole = ar > 0 ? hole.slice().reverse() : hole.slice();
    let i;
    for (i = 0; i < hole.length; i++) {
      if (check_concavity(hole, i) < 0) {
        break;
      }
    }
    if (i >= hole.length) {
      return false;
    }
    let a = hole[(i - 1 + hole.length) % hole.length];
    let b = hole[i];
    let c = hole[(i + 1) % hole.length];
    let m = [a[0] * 0.5 + c[0] * 0.5, a[1] * 0.5 + c[1] * 0.5];
    let dx = m[0] - b[0];
    let dy = m[1] - b[1];
    let l = Math.sqrt(dx * dx + dy * dy);
    let ux = b[0] + dx / l * eps;
    let uy = b[1] + dy / l * eps;
    let isects = ray_isect_poly(ux, uy, m[0], m[1], poly);
    let ok = isects.length % 2 == 0;
    if (verify_winding && ok) {
      let wind = 0;
      for (let j = 0; j < isects.length; j++) {
        wind += isects[j].side;
      }
      ok = ok && wind == 0;
    }
    return ok;
  }
  function pair_key(i, j) {
    return i + "," + j;
  }
  function quad_key(i, j, k, z) {
    return i + "," + j + "," + k + "," + z;
  }
  function unmess(poly, args = {}) {
    var _a, _b, _c;
    (_a = args.disturb) != null ? _a : args.disturb = 1e-4;
    (_b = args.epsilon) != null ? _b : args.epsilon = 1e-4;
    (_c = args.hole_policy) != null ? _c : args.hole_policy = HOLE_AGGRESSIVE;
    if (poly.length <= 3) {
      return [poly];
    }
    if (args.disturb) {
      disturb(poly, args.disturb);
    }
    let verts = build_vertices(poly);
    let isect_mir = mirror_isects(verts);
    let n = poly.length;
    let used = {};
    let used_isects = {};
    let used_edges = {};
    function trace_outline(i0, j0, dir, is_outline, force_no_backturn = false) {
      let local_used = {};
      let local_used_isects = {};
      let local_used_edges = {};
      let zero = null;
      let out2 = [];
      function trace_from(i02, j02, dir2, prev) {
        if (zero == null) {
          zero = [i02, j02];
        } else if (i02 == zero[0] && j02 == zero[1]) {
          return true;
        } else if (zero[1] != -1 && j02 != -1) {
          let q = verts[i02].isects[j02];
          if (q) {
            let k = q.other;
            let z = verts[k].isects.findIndex((x) => x.other == i02);
            if (k == zero[0] && z == zero[1]) {
              return true;
            }
          }
        }
        if (args.hole_policy != HOLE_AGGRESSIVE && prev) {
          let edge_id = quad_key(...prev, i02, j02);
          if (used_edges[edge_id]) {
            return false;
          }
          local_used_edges[edge_id] = true;
        }
        let p = verts[i02];
        let i1 = (i02 + dir2 + n) % n;
        if (j02 == -1) {
          if (args.hole_policy != HOLE_EVENODD && (!is_outline && (used[i02] || local_used[i02]))) {
            return false;
          }
          local_used[i02] = true;
          out2.push(p.xy);
          if (dir2 < 0) {
            return trace_from(i1, verts[i1].isects.length - 1, dir2, [i02, j02]);
          } else if (!verts[i02].isects.length) {
            return trace_from(i1, -1, dir2, [i02, j02]);
          } else {
            return trace_from(i02, 0, dir2, [i02, j02]);
          }
        } else if (j02 >= p.isects.length) {
          return trace_from(i1, -1, dir2, [i02, j02]);
        } else {
          let id = pair_key(i02, j02);
          if (args.hole_policy == HOLE_AGGRESSIVE && !is_outline && (used_isects[id] || local_used_isects[id])) {
            return false;
          }
          local_used_isects[id] = true;
          out2.push(p.isects[j02].xy);
          let q = p.isects[j02];
          let [k, z] = isect_mir[id];
          local_used_isects[pair_key(k, z)] = true;
          let params;
          if (q.side * dir2 < 0) {
            params = [k, z - 1, -1];
          } else {
            params = [k, z + 1, 1];
          }
          if ((args.hole_policy == HOLE_AGGRESSIVE || force_no_backturn) && !is_outline && params[2] != dir2) {
            return false;
          }
          return trace_from(...params, [i02, j02]);
        }
      }
      let success = trace_from(i0, j0, dir, null);
      if (!success || out2.length < 3) {
        return null;
      }
      return {
        poly: out2,
        used: local_used,
        used_isects: local_used_isects,
        used_edges: local_used_edges
      };
    }
    let xmin = Infinity;
    let amin = 0;
    for (let i = 0; i < n; i++) {
      if (poly[i][0] < xmin) {
        xmin = poly[i][0];
        amin = i;
      }
    }
    let cw = check_concavity(poly, amin);
    let out = [];
    let ret = trace_outline(amin, -1, cw, true);
    if (!ret) {
      return [];
    }
    used = ret.used;
    used_isects = ret.used_isects;
    out.push(ret.poly);
    if (args.hole_policy != HOLE_NONE) {
      let hole_starts = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < verts[i].isects.length; j++) {
          let id = pair_key(i, j);
          let kz = pair_key(...isect_mir[id]);
          if (args.hole_policy != HOLE_AGGRESSIVE || !used_isects[id] && !used_isects[kz]) {
            hole_starts.push([i, j]);
          }
        }
      }
      for (let i = 0; i < hole_starts.length; i++) {
        let [k, z] = hole_starts[i];
        let ret2 = trace_outline(k, z, cw, false);
        if (ret2) {
          let ok = poly_is_hole(ret2.poly, poly, args.hole_policy != HOLE_EVENODD, args.epsilon);
          if (ok) {
            out.push(ret2.poly);
            Object.assign(used, ret2.used);
            Object.assign(used_isects, ret2.used_isects);
            Object.assign(used_edges, ret2.used_edges);
          }
        }
      }
      if (args.hole_policy == HOLE_EVENODD) {
        for (let i = 0; i < hole_starts.length; i++) {
          let [k, z] = hole_starts[i];
          let ret2 = trace_outline(k, z, -cw, false, true);
          if (ret2) {
            let ok = poly_is_hole(ret2.poly, poly, false, args.epsilon);
            if (ok) {
              out.push(ret2.poly);
              Object.assign(used, ret2.used);
              Object.assign(used_isects, ret2.used_isects);
              Object.assign(used_edges, ret2.used_edges);
            }
          }
        }
      }
    }
    return out;
  }

  // src/common.ts
  function lowest_y(plist) {
    let mi = 0;
    let mv = Infinity;
    for (let i = 0; i < plist.length; i++) {
      if (plist[i][1] < mv) {
        mv = plist[i][1];
        mi = i;
      }
    }
    return mi;
  }
  function highest_y(plist) {
    let mi = 0;
    let mv = -Infinity;
    for (let i = 0; i < plist.length; i++) {
      if (plist[i][1] > mv) {
        mv = plist[i][1];
        mi = i;
      }
    }
    return mi;
  }
  function cwise(p1x, p1y, p2x, p2y, p3x, p3y) {
    return (p2x - p1x) * (p3y - p1y) - (p2y - p1y) * (p3x - p1x);
  }
  function cwise_crossdot(p1x, p1y, p2x, p2y, p3x, p3y) {
    let dx0 = p2x - p1x;
    let dy0 = p2y - p1y;
    let dx1 = p3x - p1x;
    let dy1 = p3y - p1y;
    let dx2 = p3x - p2x;
    let dy2 = p3y - p2y;
    let d0 = Math.hypot(dx0, dy0);
    let d1 = Math.hypot(dx1, dy1);
    let d2 = Math.hypot(dx2, dy2);
    let cross = dx0 * dy1 - dy0 * dx1;
    let dot = Math.abs((dx0 * dx2 + dy0 * dy2) / (d0 * d2) - 1);
    return [cross, dot];
  }
  function convex_hull(plist) {
    let N = plist.length;
    let points = plist.slice();
    let p = points.splice(lowest_y(plist), 1)[0];
    let keyfunc = (q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
    points.sort((a, b) => keyfunc(a) - keyfunc(b));
    points.unshift(p);
    let stack = [];
    stack.push(points[0]);
    stack.push(points[1]);
    for (let i = 2; i < points.length; i++) {
      while (stack.length >= 2 && cwise(stack[stack.length - 2][0], stack[stack.length - 2][1], stack[stack.length - 1][0], stack[stack.length - 1][1], points[i][0], points[i][1]) <= 0) {
        stack.pop();
      }
      stack.push(points[i]);
    }
    return stack;
  }
  function rot_poly(poly, th) {
    let qoly = [];
    let costh = Math.cos(th);
    let sinth = Math.sin(th);
    for (let i = 0; i < poly.length; i++) {
      let [x0, y0] = poly[i];
      let x = x0 * costh - y0 * sinth;
      let y = x0 * sinth + y0 * costh;
      qoly.push([x, y]);
    }
    return qoly;
  }
  function interp_angles(a0, a1, step, dir = 0, suggest = 0) {
    a0 = (a0 + Math.PI * 2) % (Math.PI * 2);
    a1 = (a1 + Math.PI * 2) % (Math.PI * 2);
    function make_interval(a02, a12) {
      let o = [];
      if (a02 < a12) {
        for (let a = a02 + step; a < a12; a += step) {
          o.push(a);
        }
      } else {
        for (let a = a02 - step; a > a12; a -= step) {
          o.push(a);
        }
      }
      return o;
    }
    if (dir == void 0 || dir == 0) {
      var methods = [
        [Math.abs(a1 - a0), () => make_interval(a0, a1)],
        [Math.abs(a1 + Math.PI * 2 - a0), () => make_interval(a0, a1 + Math.PI * 2)],
        [Math.abs(a1 - Math.PI * 2 - a0), () => make_interval(a0, a1 - Math.PI * 2)]
      ];
      methods.sort((x, y) => x[0] - y[0]);
      if (Math.abs(methods[0][0] - Math.PI) < 0.1 && suggest) {
        return interp_angles(a0, a1, step, suggest);
      }
      return methods[0][1]();
    } else {
      if (dir < 0) {
        while (a1 > a0) {
          a1 -= Math.PI * 2;
        }
      } else {
        while (a1 < a0) {
          a1 += Math.PI * 2;
        }
      }
      return make_interval(a0, a1);
    }
  }
  function bisect_angles(a0, a1, dir = 0, max = 7) {
    a0 = (a0 + Math.PI * 2) % (Math.PI * 2);
    a1 = (a1 + Math.PI * 2) % (Math.PI * 2);
    function bisect(a02, a12) {
      return [(a02 + a12) / 2, Math.abs((a12 - a02) / 2)];
    }
    if (dir == void 0 || dir == 0) {
      var methods = [
        [Math.abs(a1 - a0), () => bisect(a0, a1)],
        [Math.abs(a1 + Math.PI * 2 - a0), () => bisect(a0, a1 + Math.PI * 2)],
        [Math.abs(a1 - Math.PI * 2 - a0), () => bisect(a0, a1 - Math.PI * 2)]
      ];
      methods.sort((x, y) => x[0] - y[0]);
      return methods[0][1]();
    } else {
      if (dir < 0) {
        while (a1 > a0) {
          a1 -= Math.PI * 2;
        }
      } else {
        while (a1 < a0) {
          a1 += Math.PI * 2;
        }
      }
      if (dir && Math.abs(a0 - a1) > max) {
        return bisect_angles(a0, a1, 0);
      }
      return bisect(a0, a1);
    }
  }

  // src/balltrack.ts
  function seg_isect2(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y) {
    let d0x = p1x - p0x;
    let d0y = p1y - p0y;
    let d1x = q1x - q0x;
    let d1y = q1y - q0y;
    let vc = d0x * d1y - d0y * d1x;
    if (vc == 0) {
      return false;
    }
    let vcn = vc * vc;
    let q0x_p0x = q0x - p0x;
    let q0y_p0y = q0y - p0y;
    let vc_vcn = vc / vcn;
    let t = (q0x_p0x * d1y - q0y_p0y * d1x) * vc_vcn;
    let s = (q0x_p0x * d0y - q0y_p0y * d0x) * vc_vcn;
    if (0 <= t && t <= 1 && 0 <= s && s <= 1) {
      return true;
    }
    return false;
  }
  function balltrack(polyline, widths, join = "round", cap = "round", join_resolution = 2, miter_limit = 2) {
    let EPS = 1e-3;
    let EPS2 = 1e-3;
    if (!polyline.length) {
      return [];
    }
    if (polyline.length < 2) {
      let p = polyline[0].slice();
      p[0] += EPS;
      polyline = polyline.concat([p]);
    }
    let angs = [];
    let lens = [];
    for (let i = 0; i < polyline.length - 1; i++) {
      let a = polyline[i];
      let b = polyline[i + 1];
      let dx = b[0] - a[0];
      let dy = b[1] - a[1];
      let l = Math.sqrt(dx * dx + dy * dy);
      let w0 = widths[i];
      let w1 = widths[i + 1];
      let dw = w0 - w1;
      if (Math.abs(dw) > l - EPS) {
        if (w0 < w1) {
          widths[i + 1] = w1 = w0 + l - EPS;
        } else {
          widths[i + 1] = w1 = w0 - l + EPS;
        }
        dw = w0 - w1;
      }
      let a0 = Math.atan2(dy, dx);
      let ang = Math.acos(dw / l);
      angs.push([a0 + ang, a0 - ang]);
      lens.push(l);
    }
    let l0 = [];
    let l1 = [];
    for (let i = 0; i < polyline.length - 1; i++) {
      let a = polyline[i];
      let b = polyline[i + 1];
      let w0 = widths[i];
      let w1 = widths[i + 1];
      let [a0, a1] = angs[i];
      l0.push([a[0] + Math.cos(a0) * w0, a[1] + Math.sin(a0) * w0]);
      l1.push([a[0] + Math.cos(a1) * w0, a[1] + Math.sin(a1) * w0]);
      l0.push([b[0] + Math.cos(a0) * w1, b[1] + Math.sin(a0) * w1]);
      l1.push([b[0] + Math.cos(a1) * w1, b[1] + Math.sin(a1) * w1]);
    }
    let j0 = [[]];
    let j1 = [[]];
    for (let i = 1; i < polyline.length - 1; i++) {
      let a = polyline[i - 1];
      let b = polyline[i];
      let c = polyline[i + 1];
      let [cross, dot] = cwise_crossdot(...a, ...b, ...c);
      let subtle = dot < EPS2;
      let major = subtle ? 0 : cross > 0 ? 1 : -1;
      let do0 = true;
      let do1 = true;
      {
        let p0 = l1[(i - 1) * 2];
        let p1 = l1[(i - 1) * 2 + 1];
        let p2 = l1[i * 2];
        let p3 = l1[i * 2 + 1];
        if (seg_isect2(...p0, ...p1, ...p2, ...p3)) {
          do0 = false;
        }
      }
      {
        let p0 = l0[(i - 1) * 2];
        let p1 = l0[(i - 1) * 2 + 1];
        let p2 = l0[i * 2];
        let p3 = l0[i * 2 + 1];
        if (seg_isect2(...p0, ...p1, ...p2, ...p3)) {
          do1 = false;
        }
      }
      if (join != "bevel" && (do1 || do0)) {
        if (join != "miter") {
          let step = Math.asin(join_resolution / 2 / widths[i]) * 2;
          if (isNaN(step)) {
            j1.push([]);
            j0.push([]);
            continue;
          }
          if (do0) {
            let a0 = angs[i - 1][1];
            let a1 = angs[i][1];
            let jj = [];
            let aa = interp_angles(a0, a1, step, major == 1 ? 1 : 0, 1);
            aa.forEach((a2) => {
              let dx = Math.cos(a2) * widths[i];
              let dy = Math.sin(a2) * widths[i];
              jj.push([b[0] + dx, b[1] + dy]);
            });
            j1.push(jj);
            if (!do1)
              j0.push([]);
          }
          if (do1) {
            let a0 = angs[i - 1][0];
            let a1 = angs[i][0];
            let jj = [];
            let aa = interp_angles(a0, a1, step, major == -1 ? -1 : 0, -1);
            aa.forEach((a2) => {
              let dx = Math.cos(a2) * widths[i];
              let dy = Math.sin(a2) * widths[i];
              jj.push([b[0] + dx, b[1] + dy]);
            });
            j0.push(jj);
            if (!do0)
              j1.push([]);
          }
        } else {
          if (do0) {
            let a0 = angs[i - 1][1];
            let a1 = angs[i][1];
            let [aa, ab] = bisect_angles(a0, a1, major == 1 ? 1 : 0);
            let w = Math.abs(widths[i] / Math.cos(ab));
            w = Math.min(widths[i] * miter_limit, w);
            let jj = [[b[0] + w * Math.cos(aa), b[1] + w * Math.sin(aa)]];
            j1.push(jj);
            if (!do1)
              j0.push([]);
          }
          if (do1) {
            let a0 = angs[i - 1][0];
            let a1 = angs[i][0];
            let [aa, ab] = bisect_angles(a0, a1, major == -1 ? -1 : 0);
            let w = Math.abs(widths[i] / Math.cos(ab));
            w = Math.min(widths[i] * miter_limit, w);
            let jj = [[b[0] + w * Math.cos(aa), b[1] + w * Math.sin(aa)]];
            j0.push(jj);
            if (!do0)
              j1.push([]);
          }
        }
      } else {
        j0.push([]);
        j1.push([]);
      }
    }
    let ll0 = [];
    let ll1 = [];
    for (let i = 0; i < l0.length / 2; i++) {
      ll0.push(...j0[i]);
      ll1.push(...j1[i]);
      ll0.push(l0[i * 2]);
      ll0.push(l0[i * 2 + 1]);
      ll1.push(l1[i * 2]);
      ll1.push(l1[i * 2 + 1]);
    }
    l0 = ll0;
    l1 = ll1;
    if (cap == "round") {
      {
        let jj = [];
        let a = polyline[0];
        let b = polyline[1];
        let [a0, a1] = angs[0];
        let step = Math.asin(join_resolution / 2 / widths[0]) * 2;
        let aa = interp_angles(a0, a1, step, 1);
        if (!isNaN(step)) {
          aa.forEach((z) => {
            let x = a[0] + widths[0] * Math.cos(z);
            let y = a[1] + widths[0] * Math.sin(z);
            jj.push([x, y]);
          });
        }
        l1 = jj.concat(l1);
      }
      {
        let jj = [];
        let a = polyline[polyline.length - 2];
        let b = polyline[polyline.length - 1];
        let [a1, a0] = angs[polyline.length - 2];
        let step = Math.asin(join_resolution / 2 / widths[0]) * 2;
        let aa = interp_angles(a0, a1, step, 1);
        if (!isNaN(step)) {
          aa.forEach((z) => {
            let x = b[0] + widths[widths.length - 1] * Math.cos(z);
            let y = b[1] + widths[widths.length - 1] * Math.sin(z);
            jj.push([x, y]);
          });
        }
        l1.push(...jj);
      }
    }
    l0.reverse();
    let ret = l1.concat(l0);
    return ret;
  }

  // src/stampdrag.ts
  function stampdrag_ident(polyline, polygon, epsilon = 0.1) {
    let aug = [];
    for (let i = 0; i < polygon.length; i++) {
      let a = polygon[i];
      let b = polygon[(i + 1) % polygon.length];
      let c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      let dx = b[0] - a[0];
      let dy = b[1] - a[1];
      let l = Math.hypot(dx, dy);
      let ax = dy / l;
      let ay = -dx / l;
      aug.push(polygon[i]);
      aug.push([c[0] + ax * epsilon, c[1] + ay * epsilon]);
    }
    polygon = aug;
    let states = [];
    for (let i = 0; i < polyline.length - 1; i++) {
      let [x0, y0] = polyline[i];
      let [x1, y1] = polyline[i + 1];
      let ang = Math.atan2(y1 - y0, x1 - x0);
      let p0 = rot_poly(polygon, -ang);
      let p1 = rot_poly(polygon, -ang);
      let i0 = lowest_y(p0);
      let j0 = highest_y(p0);
      let i1 = lowest_y(p1);
      let j1 = highest_y(p1);
      let dir = 0;
      if (i > 0) {
        dir = cwise(...polyline[i - 1], x0, y0, x1, y1);
        dir /= Math.abs(dir);
      }
      states.push([i0, j0, i1, j1, dir]);
    }
    let out = [];
    for (let i = 1; i < polyline.length - 1; i++) {
      let i0 = states[i - 1][2];
      let o0 = states[i][0];
      let dir = states[i][4];
      let n = polygon.length;
      if (dir >= 0) {
        while (o0 < i0) {
          o0 += n;
        }
        for (let j = i0; j <= o0; j++) {
          let [x, y] = polygon[j % n];
          out.push([x + polyline[i][0], y + polyline[i][1]]);
        }
      } else {
        let [x, y] = polygon[i0];
        out.push([x + polyline[i][0], y + polyline[i][1]]);
        let [x1, y1] = polygon[o0];
        out.push([x1 + polyline[i][0], y1 + polyline[i][1]]);
      }
    }
    {
      let i0 = states[states.length - 1][2];
      let o0 = states[states.length - 1][3];
      while (o0 < i0) {
        o0 += polygon.length;
      }
      for (let j = i0; j <= o0; j++) {
        let [x, y] = polygon[j % polygon.length];
        out.push([x + polyline[polyline.length - 1][0], y + polyline[polyline.length - 1][1]]);
      }
    }
    for (let i = polyline.length - 2; i > 0; i--) {
      let i0 = states[i][1];
      let o0 = states[i - 1][3];
      let dir = states[i][4];
      let n = polygon.length;
      if (dir <= 0) {
        while (o0 < i0) {
          o0 += n;
        }
        for (let j = i0; j <= o0; j++) {
          let [x, y] = polygon[(j + n) % n];
          out.push([x + polyline[i][0], y + polyline[i][1]]);
        }
      } else {
        let [x, y] = polygon[i0];
        out.push([x + polyline[i][0], y + polyline[i][1]]);
        let [x1, y1] = polygon[o0];
        out.push([x1 + polyline[i][0], y1 + polyline[i][1]]);
      }
    }
    {
      let i0 = states[0][1];
      let o0 = states[0][0];
      while (o0 < i0) {
        o0 += polygon.length;
      }
      for (let j = i0; j <= o0; j++) {
        let [x, y] = polygon[j % polygon.length];
        out.push([x + polyline[0][0], y + polyline[0][1]]);
      }
    }
    return out;
  }
  function stampdrag_cust(polyline, polygons) {
    if (polyline.length == 1) {
      return polygons[0].map((x) => [x[0] + polyline[0][0], x[1] + polyline[0][1]]);
    }
    function convex_union(poly0, poly1, z) {
      let dmin = Infinity;
      let imin = null;
      for (let i = 0; i < poly0.length; i++) {
        if (poly0[i][2] != z) {
          continue;
        }
        for (let j = 0; j < poly1.length; j++) {
          let [x0, y0] = poly0[i];
          let [x1, y1] = poly1[j];
          let dx = x0 - x1;
          let dy = y0 - y1;
          let d2 = dx * dx + dy * dy;
          if (d2 < dmin) {
            dmin = d2;
            imin = [i, j];
          }
        }
      }
      if (!imin) {
        for (let i = 0; i < poly0.length; i++) {
          for (let j = 0; j < poly1.length; j++) {
            let [x0, y0] = poly0[i];
            let [x1, y1] = poly1[j];
            let dx = x0 - x1;
            let dy = y0 - y1;
            let d2 = dx * dx + dy * dy;
            if (d2 < dmin) {
              dmin = d2;
              imin = [i, j];
            }
          }
        }
      }
      let u = poly0.slice(0, imin[0]).concat(poly1.slice(imin[1])).concat(poly1.slice(0, imin[1])).concat(poly0.slice(imin[0]));
      return u;
    }
    let curr = null;
    for (let i = 0; i < polyline.length - 1; i++) {
      let poly0 = polygons[i];
      let poly1 = polygons[i + 1];
      let p0 = [];
      let p1 = [];
      let [x0, y0] = polyline[i];
      let [x1, y1] = polyline[i + 1];
      for (let j = 0; j < poly0.length; j++) {
        p0.push([poly0[j][0] + x0, poly0[j][1] + y0, i]);
      }
      for (let j = 0; j < poly1.length; j++) {
        p1.push([poly1[j][0] + x1, poly1[j][1] + y1, i + 1]);
      }
      let hull = convex_hull(p0.concat(p1));
      if (!curr) {
        curr = hull;
      } else {
        curr = convex_union(curr, hull, i);
      }
    }
    let o = curr.map((x) => [x[0], x[1]]);
    return o;
  }

  // src/fielddisturb.ts
  function field_disturb(points, resolution) {
    let xmin = Infinity;
    let ymin = Infinity;
    let xmax = -Infinity;
    let ymax = -Infinity;
    for (let i = 0; i < points.length; i++) {
      let [x, y] = points[i];
      xmin = Math.min(xmin, x);
      ymin = Math.min(ymin, y);
      xmax = Math.max(xmax, x);
      ymax = Math.max(ymax, y);
    }
    if (xmax <= xmin) {
      xmax = xmin + 1;
    }
    if (ymax <= ymin) {
      ymax = ymin + 1;
    }
    let m = Math.max(1, Math.round((xmax - xmin) / resolution));
    let n = Math.max(1, Math.round((ymax - ymin) / resolution));
    let tp = [];
    for (let i = 0; i < points.length; i++) {
      let [x, y] = points[i];
      tp.push([
        (x - xmin) / (xmax - xmin) * m + 1,
        (y - ymin) / (ymax - ymin) * n + 1
      ]);
    }
    let w = m + 2;
    let out = [];
    let M = new Array((m + 2) * (n + 2)).fill(0);
    for (let i = 0; i < tp.length; i++) {
      let [x, y] = tp[i];
      let ix = ~~x;
      let iy = ~~y;
      let fx = x - ix;
      let fy = y - iy;
      if (!M[iy * w + ix]) {
        M[iy * w + ix]++;
        let ffx = fx;
        let ffy = fy;
        if (0.25 > ffx || ffx > 0.75) {
          ffx = Math.random() * 0.5 + 0.25;
        }
        if (0.25 > ffy || ffy > 0.75) {
          ffy = Math.random() * 0.5 + 0.25;
        }
        out.push([ix + ffx, iy + ffy]);
        continue;
      }
      let cs = [
        [ix - 1, iy],
        [ix, iy - 1],
        [ix + 1, iy],
        [ix, iy + 1],
        [ix - 1, iy - 1],
        [ix - 1, iy + 1],
        [ix + 1, iy - 1],
        [ix + 1, iy + 1],
        [ix - 2, iy],
        [ix + 2, iy],
        [ix, iy - 2],
        [ix, iy + 2]
      ];
      let zmin = Infinity;
      let amin = null;
      let ok = false;
      for (let j = 0; j < cs.length; j++) {
        let iix = ~~cs[j][0];
        let iiy = ~~cs[j][1];
        let idx = iiy * w + iix;
        if (!M[idx]) {
          M[idx]++;
          out.push([cs[j][0] + Math.random() * 0.5 + 0.25, cs[j][1] + Math.random() * 0.5 + 0.25]);
          ok = true;
          break;
        }
        if (M[idx] < zmin) {
          zmin = M[idx];
          amin = [cs[j], idx];
        }
      }
      if (ok)
        continue;
      M[amin[1]]++;
      out.push([amin[0][0] + Math.random(), amin[0][1] + Math.random()]);
    }
    for (let i = 0; i < out.length; i++) {
      out[i][0] += (Math.random() - 0.5) * 0.01;
      out[i][1] += (Math.random() - 0.5) * 0.01;
    }
    return out.map((x) => [
      (x[0] - 1) / m * (xmax - xmin) + xmin,
      (x[1] - 1) / n * (ymax - ymin) + ymin
    ]);
  }

  // src/preproc.ts
  function catmull_rom(positions, resolution, alpha) {
    const EPSILON = 1e-3;
    function get_t(t, p0, p1, alpha2) {
      let a = 0;
      for (let i = 0; i < p0.length; i++) {
        a += Math.pow(p1[i] - p0[i], 2);
      }
      let b = Math.pow(a, alpha2 * 0.5);
      return b + t;
    }
    function cr_spline(p0, p1, p2, p3, resolution2, alpha2) {
      let points = [];
      if (p0[0] == p1[0] && p0[1] == p1[1]) {
        p0[0] += EPSILON;
      }
      if (p1[0] == p2[0] && p1[1] == p2[1]) {
        p1[0] += EPSILON;
      }
      if (p2[0] == p3[0] && p2[1] == p3[1]) {
        p2[0] += EPSILON;
      }
      let t0 = 0;
      let t1 = get_t(t0, p0, p1, alpha2);
      let t2 = get_t(t1, p1, p2, alpha2);
      let t3 = get_t(t2, p2, p3, alpha2);
      for (let t = t1; t < t2; t += (t2 - t1) / resolution2) {
        let f0 = (t1 - t) / (t1 - t0);
        let f1 = (t - t0) / (t1 - t0);
        let a1 = [];
        for (let i = 0; i < p0.length; i++) {
          a1.push(p0[i] * f0 + p1[i] * f1);
        }
        let f2 = (t2 - t) / (t2 - t1);
        let f3 = (t - t1) / (t2 - t1);
        let a2 = [];
        for (let i = 0; i < p1.length; i++) {
          a2.push(p1[i] * f2 + p2[i] * f3);
        }
        let f4 = (t3 - t) / (t3 - t2);
        let f5 = (t - t2) / (t3 - t2);
        let a3 = [];
        for (let i = 0; i < p1.length; i++) {
          a3.push(p2[i] * f4 + p3[i] * f5);
        }
        let f6 = (t2 - t) / (t2 - t0);
        let f7 = (t - t0) / (t2 - t0);
        let b1 = [];
        for (let i = 0; i < a1.length; i++) {
          b1.push(a1[i] * f6 + a2[i] * f7);
        }
        let f8 = (t3 - t) / (t3 - t1);
        let f9 = (t - t1) / (t3 - t1);
        let b2 = [];
        for (let i = 0; i < a2.length; i++) {
          b2.push(a2[i] * f8 + a3[i] * f9);
        }
        let c = [];
        for (let i = 0; i < b1.length; i++) {
          c.push(b1[i] * f2 + b2[i] * f3);
        }
        points.push(c);
      }
      points.push(p2.slice());
      return points;
    }
    let curve = [];
    for (let i = 0; i < positions.length - 1; i++) {
      let p0 = positions[Math.max(i - 1, 0)].slice();
      let p1 = positions[i].slice();
      let p2 = positions[i + 1].slice();
      let p3 = positions[Math.min(i + 2, positions.length - 1)].slice();
      let pts = cr_spline(p0, p1, p2, p3, resolution, alpha);
      curve.push(...pts);
    }
    return curve;
  }
  function isect_circ_line(cx, cy, r, x0, y0, x1, y1) {
    let dx = x1 - x0;
    let dy = y1 - y0;
    let fx = x0 - cx;
    let fy = y0 - cy;
    let a = dx * dx + dy * dy;
    let b = 2 * (fx * dx + fy * dy);
    let c = fx * fx + fy * fy - r * r;
    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return null;
    }
    discriminant = Math.sqrt(discriminant);
    let t0 = (-b - discriminant) / (2 * a);
    if (0 <= t0 && t0 <= 1) {
      return t0;
    }
    let t = (-b + discriminant) / (2 * a);
    if (t > 1 || t < 0) {
      return null;
    }
    return t;
  }
  function resample(polyline, step) {
    if (polyline.length <= 2) {
      return polyline.slice();
    }
    polyline = polyline.slice();
    let out = [polyline[0].slice()];
    let next = null;
    let i = 0;
    while (i < polyline.length - 1) {
      let a = polyline[i];
      let b = polyline[i + 1];
      let dx = b[0] - a[0];
      let dy = b[1] - a[1];
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d == 0) {
        i++;
        continue;
      }
      let n = ~~(d / step);
      let rest = n * step / d;
      let rpx = a[0] * (1 - rest) + b[0] * rest;
      let rpy = a[1] * (1 - rest) + b[1] * rest;
      for (let j = 1; j <= n; j++) {
        let t = j / n;
        let x = a[0] * (1 - t) + rpx * t;
        let y = a[1] * (1 - t) + rpy * t;
        let xy = [x, y];
        for (let k = 2; k < a.length; k++) {
          xy.push(a[k] * (1 - t) + (a[k] * (1 - rest) + b[k] * rest) * t);
        }
        out.push(xy);
      }
      next = null;
      for (let j = i + 2; j < polyline.length; j++) {
        let b2 = polyline[j - 1];
        let c = polyline[j];
        if (b2[0] == c[0] && b2[1] == c[1]) {
          continue;
        }
        let t = isect_circ_line(rpx, rpy, step, b2[0], b2[1], c[0], c[1]);
        if (t == null) {
          continue;
        }
        let q = [
          b2[0] * (1 - t) + c[0] * t,
          b2[1] * (1 - t) + c[1] * t
        ];
        for (let k = 2; k < b2.length; k++) {
          q.push(b2[k] * (1 - t) + c[k] * t);
        }
        out.push(q);
        polyline[j - 1] = q;
        next = j - 1;
        break;
      }
      if (next == null) {
        break;
      }
      i = next;
    }
    if (out.length > 1) {
      let lx = out[out.length - 1][0];
      let ly = out[out.length - 1][1];
      let mx = polyline[polyline.length - 1][0];
      let my = polyline[polyline.length - 1][1];
      let d = Math.sqrt((mx - lx) ** 2 + (my - ly) ** 2);
      if (d < step * 0.5) {
        out.pop();
      }
    }
    out.push(polyline[polyline.length - 1].slice());
    return out;
  }
  function gauss_blur(polyline, axis = 2, k = 6) {
    let n = k * 2 + 1;
    let s = 1 / 3;
    let c = 1 / (Math.sqrt(2 * Math.PI) * s);
    let yy = 0;
    let w = [];
    for (let i = 0; i < n; i++) {
      let x = i / (n - 1) * 2 - 1;
      let y = c * Math.exp(-Math.pow(x / s, 2) / 2);
      yy += y;
      w.push(y);
    }
    for (let i = 0; i < n; i++) {
      w[i] /= yy;
    }
    let q = [];
    for (let i = 0; i < polyline.length; i++) {
      let z = 0;
      for (let j = -k; j < k; j++) {
        let a = polyline[Math.min(Math.max(i + j, 0), polyline.length - 1)];
        z += a[axis] * w[j + k];
      }
      q.push(polyline[i].map((a, j) => j == axis ? z : a));
    }
    return q;
  }
  function pt_seg_dist(p, p0, p1) {
    let x = p[0];
    let y = p[1];
    let x1 = p0[0];
    let y1 = p0[1];
    let x2 = p1[0];
    let y2 = p1[1];
    let A = x - x1;
    let B = y - y1;
    let C = x2 - x1;
    let D = y2 - y1;
    let dot = A * C + B * D;
    let len_sq = C * C + D * D;
    let param = -1;
    if (len_sq != 0) {
      param = dot / len_sq;
    }
    let xx;
    let yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    let dx = x - xx;
    let dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function approx_poly_dp(polyline, epsilon) {
    if (polyline.length <= 2) {
      return polyline;
    }
    let dmax = 0;
    let argmax = -1;
    for (let i = 1; i < polyline.length - 1; i++) {
      let d = pt_seg_dist(polyline[i], polyline[0], polyline[polyline.length - 1]);
      if (d > dmax) {
        dmax = d;
        argmax = i;
      }
    }
    let ret = [];
    if (dmax > epsilon) {
      let L = approx_poly_dp(polyline.slice(0, argmax + 1), epsilon);
      let R = approx_poly_dp(polyline.slice(argmax, polyline.length), epsilon);
      ret = ret.concat(L.slice(0, L.length - 1)).concat(R);
    } else {
      ret.push(polyline[0].slice());
      ret.push(polyline[polyline.length - 1].slice());
    }
    return ret;
  }
  function preprocess(polyline, passes) {
    var _a, _b, _c, _d, _e, _f;
    for (let i = 0; i < passes.length; i++) {
      let pass = passes[i];
      if (pass.type == "catmull-rom") {
        polyline = catmull_rom(polyline, (_a = pass.resolution) != null ? _a : 20, (_b = pass.alpha) != null ? _b : 0.5);
      } else if (pass.type == "resample") {
        polyline = resample(polyline, (_c = pass.step) != null ? _c : 3);
      } else if (pass.type == "gauss-blur") {
        polyline = gauss_blur(polyline, (_d = pass.axis) != null ? _d : 2, (_e = pass.k) != null ? _e : 6);
      } else if (pass.type == "approx") {
        polyline = approx_poly_dp(polyline, (_f = pass.epsilon) != null ? _f : 1);
      }
    }
    return polyline;
  }

  // src/squiggy.ts
  function get_cum_dist(polyline) {
    let ds = [0];
    let d = 0;
    for (let i = 1; i < polyline.length; i++) {
      let a = polyline[i - 1];
      let b = polyline[i];
      let dx = a[0] - b[0];
      let dy = a[1] - b[1];
      d += Math.sqrt(dx * dx + dy * dy);
      ds.push(d);
    }
    return ds;
  }
  function tape_brush(func, args0) {
    if (!args0)
      args0 = {};
    return function(polyline, args) {
      var _a, _b, _c, _d, _e, _f;
      if (args.preprocess) {
        polyline = preprocess(polyline, args.preprocess);
      }
      let widths = [];
      let xys = polyline.map((x) => [x[0], x[1]]);
      let ds = get_cum_dist(xys);
      for (let i = 0; i < xys.length; i++) {
        let r;
        let r0 = null;
        let r1 = null;
        let [x, y] = xys[i];
        if (xys[i + 1]) {
          r0 = Math.atan2(xys[i + 1][1] - y, xys[i + 1][0] - x);
        }
        if (xys[i - 1]) {
          r1 = Math.atan2(y - xys[i - 1][1], x - xys[i - 1][0]);
        }
        if (r0 == null) {
          r0 = r1;
        }
        if (r1 == null) {
          r1 = r0;
        }
        r = bisect_angles(r0, r1)[0];
        let ret = func({
          i,
          d: ds[i],
          z: polyline[i][2],
          v: (_a = polyline[i][3]) != null ? _a : i ? ds[i] - ds[i - 1] : ds[1],
          t: ds[i] / ds[ds.length - 1],
          x,
          y,
          r
        });
        ret.w = (_b = ret.w) != null ? _b : 1;
        ret.w = Math.max(1e-3, ret.w);
        widths.push(ret.w);
      }
      let o = balltrack(xys, widths, (_c = args0.join) != null ? _c : "round", (_d = args0.cap) != null ? _d : "round", (_e = args0.join_resolution) != null ? _e : 4, (_f = args0.miter_limit) != null ? _f : 2);
      if (args.out_intermediate) {
        args.out_intermediate[0] = o;
      }
      if (!args.clean) {
        return [o];
      }
      return unmess(o);
    };
  }
  function stamp_brush(polygon, args0) {
    if (!args0)
      args0 = {};
    if (args0.scale) {
      polygon = polygon.map((x) => [x[0] * args0.scale, x[1] * args0.scale]);
    }
    return function(polyline, args) {
      if (args.preprocess) {
        polyline = preprocess(polyline, args.preprocess);
      }
      if (!polyline.length) {
        return [];
      }
      let xys = polyline.map((x) => [x[0], x[1]]);
      let o = stampdrag_ident(xys, polygon);
      if (args.out_intermediate) {
        args.out_intermediate[0] = o;
      }
      if (!args.clean) {
        return [o];
      }
      return unmess(o);
    };
  }
  function custom_brush(func) {
    return function(polyline, args) {
      var _a, _b, _c, _d;
      if (args.preprocess) {
        polyline = preprocess(polyline, args.preprocess);
      }
      if (!polyline.length) {
        return [];
      }
      let polygons = [];
      let xys = polyline.map((x) => [x[0], x[1]]);
      let ds = get_cum_dist(xys);
      for (let i = 0; i < xys.length; i++) {
        let r;
        let r0 = null;
        let r1 = null;
        let [x, y] = xys[i];
        if (xys[i + 1]) {
          r0 = Math.atan2(xys[i + 1][1] - y, xys[i + 1][0] - x);
        }
        if (xys[i - 1]) {
          r1 = Math.atan2(y - xys[i - 1][1], x - xys[i - 1][0]);
        }
        if (r0 == null) {
          r0 = r1;
        }
        if (r1 == null) {
          r1 = r0;
        }
        r = bisect_angles(r0, r1)[0];
        let ret = func({
          i,
          d: ds[i],
          z: polyline[i][2],
          v: (_a = polyline[i][3]) != null ? _a : i ? ds[i] - ds[i - 1] : ds[1],
          t: ds[i] / ds[ds.length - 1],
          x,
          y,
          r
        });
        ret.w = (_b = ret.w) != null ? _b : 1;
        ret.h = (_c = ret.h) != null ? _c : ret.w;
        ret.r = (_d = ret.r) != null ? _d : 0;
        ret.w = Math.max(1e-4, ret.w);
        ret.h = Math.max(1e-4, ret.h);
        let p = ret.p.map((x2) => [x2[0] * ret.w, x2[1] * ret.h]);
        p = rot_poly(p, ret.r);
        polygons.push(p);
      }
      let o = stampdrag_cust(xys, polygons);
      if (args.out_intermediate) {
        args.out_intermediate[0] = polygons.map((y, i) => y.map((x) => [x[0] + polyline[i][0], x[1] + polyline[i][1]]));
        args.out_intermediate[1] = o;
      }
      if (!args.clean) {
        return [o];
      }
      field_disturb(o, 0.1);
      return unmess(o, {hole_policy: HOLE_NONZERO});
    };
  }
  return squiggy_exports;
})();
;(typeof module == 'object')?(module.exports=squiggy):0;
