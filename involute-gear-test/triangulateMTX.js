"use strict";
/* ===============================================================================
 * triangulateMTX.ts
 * TypeScript implementation of Mei-Tipper-Xu algorithm for polygon triangulation
 * (c) Lingdong Huang 2020 (MIT License)
 * =============================================================================== */
var triangulateMTX;
(function (triangulateMTX) {
    function triangulate(vertices, params = {
        sliverThreshold: Math.PI / 4,
        greedyHeuristic: true,
        preTriangulated: null,
        optimizeMaxIter: 9999,
    }) {
        // Mei-Tipper-Xu algorithm for ear-clipping
        // "Ear-clipping Based Algorithms of Generating High-quality Polygon Triangulation"
        // https://arxiv.org/pdf/1212.6038.pdf
        // Paper: "A basic and an improved ear-clipping based algorithm for triangulating 
        // simple polygons and polygons with holes are presented. In the basic version, the 
        // ear with smallest interior angle is always selected to be cut in order to create fewer 
        // sliver triangles. To reduce sliver triangles in further, a bound of angle is set to de-
        // termine whether a newly formed triangle has sharp angles, and edge swapping is 
        // adopted when the triangle is sharp."
        function cross(u, v) {
            return u[0] * v[1] - v[0] * u[1];
        }
        function dot(u, v) {
            return u[0] * v[0] + u[1] * v[1];
        }
        function norm(u) {
            return Math.sqrt(u[0] * u[0] + u[1] * u[1]);
        }
        function vertexAngle(a, b, c) {
            let [u, v] = [
                [a[0] - b[0], a[1] - b[1]],
                [c[0] - b[0], c[1] - b[1]],
            ];
            let dt = dot(u, v);
            let cs = dt / (norm(u) * norm(v));
            return Math.acos(cs);
        }
        function basic(pts) {
            // Paper: "Basic Algorithm: The ear clipping triangulation algorithm consists of 
            // searching an ear and then cutting it off from current polygon."
            if (pts.length <= 3) {
                return [[0, 1, 2]];
            }
            let head = null;
            let tail = null;
            for (var i = 0; i < pts.length; i++) {
                let v = {
                    id: i,
                    xy: pts[i],
                    prev: null,
                    next: null,
                    isEar: false,
                    isConvex: false,
                    angle: 0,
                };
                if (head == null) {
                    head = v;
                    tail = v;
                }
                else {
                    v.prev = tail;
                    tail.next = v;
                }
                tail = v;
            }
            head.prev = tail;
            tail.next = head;
            function pointInTriangle(p, a, b, c) {
                // on edge counts, but on vertex doesn't count
                function pointInPlane(p, a, b) {
                    return cross([p[0] - a[0], p[1] - a[1]], [b[0] - a[0], b[1] - a[1]]) <= 0;
                }
                return pointInPlane(p, a, b) && pointInPlane(p, b, c) && pointInPlane(p, c, a)
                    //   && !(p==a) && !(p==b) && !(p==c)
                    && !(p[0] == a[0] && p[1] == a[1]) && !(p[0] == b[0] && p[1] == b[1]) && !(p[0] == c[0] && p[1] == c[1]);
            }
            function updateConvexStatus(it) {
                // Paper: "Compute the interior angles on each vertex of P. 
                // If the interior angle on a vertex is less than 180°, 
                // the vertex is convex; Otherwise, reflex. "
                // Computed with cross product in this implementation for efficiency
                let [a, b, c] = [it.prev.xy, it.xy, it.next.xy];
                let [u, v] = [
                    [b[0] - a[0], b[1] - a[1]],
                    [c[0] - b[0], c[1] - b[1]],
                ];
                let cr = cross(u, v);
                it.isConvex = cr > 0;
            }
            function updateEarStatus(it) {
                // Paper: "Three consecutive vertices vi-1, vi, vi+1 of P do form an ear if
                // 1. vi is a convex vertex;
                // 2. the closure C(vi-1, vi, vi+1) of the triangle △(vi-1, vi, vi+1) 
                // does not contain any reflex vertex of P (except possibly vi-1, vi+1). "
                let [a, b, c] = [it.prev.xy, it.xy, it.next.xy];
                if (it.isConvex) {
                    it.isEar = true;
                    let jt = head;
                    do {
                        if (jt.isConvex) {
                            jt = jt.next;
                            continue;
                        }
                        if (jt.next == it || jt.prev == it || jt == it) {
                            jt = jt.next;
                            continue;
                        }
                        if (pointInTriangle(jt.xy, a, b, c)) {
                            it.isEar = false;
                            break;
                        }
                        jt = jt.next;
                    } while (jt != head);
                }
                else {
                    it.isEar = false;
                }
                if (it.isEar) {
                    it.angle = vertexAngle(a, b, c);
                }
            }
            let it = head;
            do {
                updateConvexStatus(it);
                it = it.next;
            } while (it != head);
            it = head;
            do {
                updateEarStatus(it);
                it = it.next;
            } while (it != head);
            let ears = [];
            for (let n = 0; n < pts.length - 2; n++) {
                // Paper: "Select the ear tip vi which has smallest angle to create a triangle 
                // △(vi-1, vi, vi+1), and then delete the ear tip vi , update the connection 
                // relationship, angle and ear tip status for vi-1 and vi+1."
                let minEar = null;
                it = head;
                do {
                    if (it.isEar && (minEar == null || it.angle < minEar.angle)) {
                        minEar = it;
                        if (!params.greedyHeuristic) {
                            break;
                        }
                    }
                    it = it.next;
                } while (it != head);
                if (minEar == null) { // noooo!!!
                    if (n == pts.length - 3) { // phew
                        minEar = head;
                    }
                    else {
                        let rest = [];
                        it = head;
                        do {
                            rest.push(it.xy);
                            it = it.next;
                        } while (it != head);
                        console.warn(`Triangulation failure! Possibly degenerate polygon. Done ${ears.length}/${pts.length - 2}, rest:\n`, JSON.stringify(rest));
                        return ears;
                    }
                }
                ears.push([minEar.prev.id, minEar.id, minEar.next.id]);
                minEar.prev.next = minEar.next;
                minEar.next.prev = minEar.prev;
                if (minEar == head) {
                    head = minEar.next;
                }
                if (minEar == tail) {
                    tail = minEar.prev;
                }
                updateConvexStatus(minEar.prev);
                updateConvexStatus(minEar.next);
                updateEarStatus(minEar.prev);
                updateEarStatus(minEar.next);
                // update all vertices (shouldn't be necessary, thus commented out)
                // it = head; do { updateConvexStatus(it); it = it.next; } while(it != head);
                // it = head; do { updateEarStatus(it);    it = it.next; } while(it != head);
            }
            return ears;
        }
        function improve(pts, tris) {
            // Paper: "Improved Algorithm: The basic algorithm tries to avoid creating sliver 
            // triangles. However, in some situations, sliver triangles still appear in triangulations. 
            // Thus, edge swapping is adopted to avoid sliver triangles."
            // In this implementation the optimization is iteratively applied after the basic 
            // triangulation has finished, instead of only for each newly created ear as the paper suggests.
            function findTriangleWithEdge(i, j) {
                for (let k = 0; k < tris.length; k++) {
                    if (tris[k][0] == i && tris[k][1] == j) {
                        return [k, tris[k][2]];
                    }
                    if (tris[k][1] == i && tris[k][2] == j) {
                        return [k, tris[k][0]];
                    }
                    if (tris[k][2] == i && tris[k][0] == j) {
                        return [k, tris[k][1]];
                    }
                }
                return [-1, -1];
            }
            function interiorAngles(a, b, c) {
                return [
                    vertexAngle(c, a, b),
                    vertexAngle(a, b, c),
                    vertexAngle(b, c, a),
                ];
            }
            for (let i = 0; i < tris.length; i++) {
                let [a, b, c] = [
                    tris[i][0],
                    tris[i][1],
                    tris[i][2]
                ];
                let [pa, pb, pc] = [
                    pts[a], pts[b], pts[c]
                ];
                let [aa, ab, ac] = interiorAngles(pa, pb, pc);
                if (isNaN(aa) || isNaN(ab) || isNaN(ac)) { // ew!
                    console.warn(`Possible degeneracy encountered during triangulation optimization, aborting...`);
                    return false;
                }
                let am = Math.min(aa, ab, ac);
                if (am > params.sliverThreshold) {
                    continue;
                }
                // Paper: "If a new triangle needs to optimize, firstly find out its biggest 
                // interior angle and its opposite edge (the longest edge), and then search 
                // between all the generated triangles to see whether there exists a triangle 
                // that shares the longest edge with the new created triangle."
                let [k, d] = [-1, -1];
                let t0;
                let t1;
                //     /\c
                //    / i\
                //  b/____\a
                //   \  k /
                //    \  /
                //     \/d
                if (aa >= ab && aa >= ac) {
                    [k, d] = findTriangleWithEdge(c, b);
                    if (k == -1) {
                        continue;
                    }
                    t0 = [a, b, d];
                    t1 = [d, c, a];
                }
                else if (ab >= aa && ab >= ac) {
                    [k, d] = findTriangleWithEdge(a, c);
                    if (k == -1) {
                        continue;
                    }
                    t0 = [b, c, d];
                    t1 = [d, a, b];
                }
                else if (ac >= aa && ac >= ab) {
                    [k, d] = findTriangleWithEdge(b, a);
                    if (k == -1) {
                        continue;
                    }
                    t0 = [c, a, d];
                    t1 = [d, b, c];
                }
                // Paper: "If there is one, the two triangles can form a quadrilateral. And then swapping
                // the diagonal of the quadrilateral to see whether the minimum angle of the original
                // pair of triangles is smaller than the minimum one of the new pair of triangles after
                // swapping, if does, which means the new pair of triangles has better quality than
                // the original one, swapping needs to be done; if not, the original triangles must be
                // kept without swapping"
                // Actually we also need to check if the quadrilateral is convex
                let c0 = cross([pts[t0[1]][0] - pts[t0[0]][0], pts[t0[1]][1] - pts[t0[0]][1]], [pts[t0[2]][0] - pts[t0[1]][0], pts[t0[2]][1] - pts[t0[1]][1]]);
                let c1 = cross([pts[t1[1]][0] - pts[t1[0]][0], pts[t1[1]][1] - pts[t1[0]][1]], [pts[t1[2]][0] - pts[t1[1]][0], pts[t1[2]][1] - pts[t1[1]][1]]);
                if (c0 <= 0 || c1 <= 0) {
                    continue;
                }
                let s0 = Math.min(am, ...interiorAngles(pts[tris[k][0]], pts[tris[k][1]], pts[tris[k][2]]));
                let s1 = Math.min(...interiorAngles(pts[t0[0]], pts[t0[1]], pts[t0[2]]), ...interiorAngles(pts[t1[0]], pts[t1[1]], pts[t1[2]]));
                if (s1 < 0) {
                    continue;
                }
                if (s1 > s0) {
                    tris[k] = t0;
                    tris[i] = t1;
                    return true;
                }
            }
            return false;
        }
        let tris;
        if (params.preTriangulated == null) {
            tris = basic(vertices);
        }
        else { // chunk 3
            tris = params.preTriangulated.reduce((a, _, i, g) => !(i % 3) ? a.concat([g.slice(i, i + 3)]) : a, []);
        }
        for (let i = 0; i < params.optimizeMaxIter; i++) {
            if (!improve(vertices, tris)) {
                break;
            }
        }
        let flat = [];
        tris.map((x) => { flat.push(...x); });
        return flat;
    }
    triangulateMTX.triangulate = triangulate;
    function bridge(outer, holes) {
        // Held's algorithm for bridging holes
        // "FIST: Fast Industrial-Strength Triangulation of Polygons"
        // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.49.3013&rep=rep1&type=pdf
        function leftMost(pts) {
            let xmin = Infinity;
            let amin = -1;
            for (let i = 0; i < pts.length; i++) {
                if (pts[i][0] < xmin) {
                    amin = i;
                    xmin = pts[i][0];
                }
            }
            return amin;
        }
        function dist2(a, b) {
            return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
        }
        function segmentIntersect(p0, p1, q0, q1) {
            function det(a, b, d, e, i) {
                return a * e * i - b * d * i;
            }
            let d0x = p1[0] - p0[0];
            let d0y = p1[1] - p0[1];
            let d1x = q1[0] - q0[0];
            let d1y = q1[1] - q0[1];
            let vc = d0x * d1y - d0y * d1x;
            let vcn = vc * vc;
            if (vcn == 0) {
                return null;
            }
            var q0_p0 = [q0[0] - p0[0], q0[1] - p0[1]];
            var t = det(q0_p0[0], q0_p0[1], d1x, d1y, vc) / vcn;
            var s = det(q0_p0[0], q0_p0[1], d0x, d0y, vc) / vcn;
            if (t < 0 || t > 1 || s < 0 || s > 1) {
                return null;
            }
            return [t, s];
        }
        // Paper: "Our approach tries to find one bridge in sub-quadratic time. For every island loop we
        // determine its left-most vertex. (...) Then we sort the islands according to their left-most vertices.
        // Starting with the left-most island, all islands are linked with the current outer boundry."
        let holesSorter = holes.map((x) => ([x, leftMost(x)]));
        holesSorter.sort((a, b) => (a[0][a[1]][0] - b[0][b[1]][0]));
        for (let i = 0; i < holesSorter.length; i++) {
            // Paper: "Let v be the left-most vertex of an island that is to be linked with the current outer
            // boundary. All vertices of the outer boundry that are left of v are sorted according to
            // increasing distance from v."
            let [hole, leftIndex] = holesSorter[i];
            let left = hole[leftIndex];
            let bankSorter = outer.map((x, i) => ([i, (x[0] > left[0]) ? Infinity : dist2(left, x)]));
            bankSorter.sort((a, b) => (a[1] - b[1]));
            for (let j = 0; j < bankSorter.length; j++) {
                // Paper: "Starting with the closest vertex, v', we test wheter [v,v'] forms a bridge (diagonal)
                // between the outer boundary and the island loop."
                let bankIndex = bankSorter[j][0];
                let bank = outer[bankIndex];
                let ok = true;
                for (let k = 0; k < outer.length; k++) {
                    if (k == bankIndex || (k + 1) % outer.length == bankIndex) {
                        continue;
                    }
                    if (segmentIntersect(left, bank, outer[k], outer[(k + 1) % outer.length]) != null) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    let wind = hole.slice(leftIndex).concat(hole.slice(0, leftIndex)).concat([hole[leftIndex]]);
                    outer.splice(bankIndex, 0, bank, ...wind);
                    break;
                }
            }
        }
        return outer;
    }
    triangulateMTX.bridge = bridge;
    function area(vertices) {
        let n = vertices.length;
        let a = 0;
        for (let i = 0; i < n; i++) {
            a += (vertices[i][0] + vertices[(i + 1) % n][0]) * (vertices[i][1] - vertices[(i + 1) % n][1]);
        }
        return a / 2;
    }
    function makeCCW(vertices) {
        if (area(vertices) < 0) {
            return vertices.reverse();
        }
        return vertices;
    }
    triangulateMTX.makeCCW = makeCCW;
    function makeCW(vertices) {
        if (area(vertices) < 0) {
            return vertices;
        }
        return vertices.reverse();
    }
    triangulateMTX.makeCW = makeCW;
    function visualizeSVG(vertices, tris) {
        let [xmin, xmax, ymin, ymax] = [Infinity, -Infinity, Infinity, -Infinity];
        for (let i = 0; i < vertices.length; i++) {
            xmin = Math.min(xmin, vertices[i][0]);
            xmax = Math.max(xmax, vertices[i][0]);
            ymin = Math.min(ymin, vertices[i][1]);
            ymax = Math.max(ymax, vertices[i][1]);
        }
        let [w, h] = [xmax - xmin, ymax - ymin];
        let [vw, vh] = (w < h) ? [600 * w / h, 600] : [600, 600 * h / w];
        let svg = `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" 
                width="${vw}" height="${vh}" viewBox="${xmin - 2} ${ymin - 2} ${w + 4} ${h + 4}">`;
        svg += `<path d="M${vertices.map(x => x[0] + " " + x[1]).join(" L")}z" fill="gainsboro" stroke="black" stroke-width="3" 
                      vector-effect="non-scaling-stroke"/>`;
        if (tris != null) {
            svg += `<g fill="none" stroke="black" stroke-width="1">`;
            for (let i = 0; i < tris.length; i += 3) {
                let [a, b, c] = [
                    vertices[tris[i]],
                    vertices[tris[i + 1]],
                    vertices[tris[i + 2]]
                ];
                svg += `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} z" 
                              vector-effect="non-scaling-stroke"/>`;
            }
            svg += `</g>`;
        }
        svg += `</svg>`;
        return svg;
    }
    triangulateMTX.visualizeSVG = visualizeSVG;
})(triangulateMTX || (triangulateMTX = {}));
// @ts-ignore
if (typeof module != "undefined") {
    module.exports = triangulateMTX;
}
