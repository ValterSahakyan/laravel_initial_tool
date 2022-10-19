if (typeof Module == "undefined") {
    var sel = document.querySelector('script[src$="moledit.js"]');
    var src = sel.getAttribute("src");
    var scriptFolder = src.substring(0, src.lastIndexOf("/") + 1);
    var wasm_mode = sel.getAttribute("wasm") != "0";
    console.log("wasm=", wasm_mode);
    Module = {};
    if (wasm_mode) {
        Module.print = function (text) {
            console.log("stdout: " + text)
        };
        Module.printErr = function (text) {
            console.log("stderr: " + text)
        };
        Module.locateFile = function (path, prefix) {
            if (path.endsWith(".mem")) return scriptFolder + path;
            return prefix + path
        };
        Module.locationPrefix = scriptFolder
    } else {
        Module.memoryInitializerPrefixURL = scriptFolder;
        Module.locationPrefix = scriptFolder
    }
    Module.loadScript = function (path) {
        var script = document.createElement("script");
        script.src = path;
        document.getElementsByTagName("head")[0].appendChild(script)
    };
    Module.loadScript(Module["locationPrefix"] + (wasm_mode ? "libchem2.js" : "libchem.js"))
}
Module.delayedImportData = [];
Module.onLoadChemlibDone = false;
Module.Rings = [];

function onLoadChemlib() {
    console.log("onLoadChemlib", Module.delayedImportData.length);
    Module.onLoadChemlibDone = true;
    for (var i = 0; i < Module.delayedImportData.length; i++) {
        console.log(Module.delayedImportData[i].data);
        Module.delayedImportData[i].moledit.importFromString(Module.delayedImportData[i].data)
    }
    Module.delayedImportData = [];
    Module.Rings = [(new Chemical).makeRing(6, true), (new Chemical).makeRing(3, false), (new Chemical).makeRing(4, false), (new Chemical).makeRing(5, false), (new Chemical).makeRing(6, false), (new Chemical).makeRing(7, false)];
    if (typeof onLoadMoledit == "function") onLoadMoledit()
}

if (Module.chem && !Module.onLoadChemlibDone) onLoadChemlib();
var Elements = {
    "*": 0,
    H: 1,
    He: 2,
    Li: 3,
    Be: 4,
    B: 5,
    C: 6,
    N: 7,
    O: 8,
    F: 9,
    Ne: 10,
    Na: 11,
    Mg: 12,
    Al: 13,
    Si: 14,
    P: 15,
    S: 16,
    Cl: 17,
    Ar: 18,
    K: 19,
    Ca: 20,
    Sc: 21,
    Ti: 22,
    V: 23,
    Cr: 24,
    Mn: 25,
    Fe: 26,
    Co: 27,
    Ni: 28,
    Cu: 29,
    Zn: 30,
    Ga: 31,
    Ge: 32,
    As: 33,
    Se: 34,
    Br: 35,
    Kr: 36,
    Rb: 37,
    Sr: 38,
    Y: 39,
    Zr: 40,
    Nb: 41,
    Mo: 42,
    Tc: 43,
    Ru: 44,
    Rh: 45,
    Pd: 46,
    Ag: 47,
    Cd: 48,
    In: 49,
    Sn: 50,
    Sb: 51,
    Te: 52,
    I: 53,
    Xe: 54,
    Cs: 55,
    Ba: 56,
    La: 57,
    Ce: 58,
    Pr: 59,
    Nd: 60,
    Pm: 61,
    Sm: 62,
    Eu: 63,
    Gd: 64,
    Tb: 65,
    Dy: 66,
    Ho: 67,
    Er: 68,
    Tm: 69,
    Yb: 70,
    Lu: 71,
    Hf: 72,
    Ta: 73,
    W: 74,
    Re: 75,
    Os: 76,
    Ir: 77,
    Pt: 78,
    Au: 79,
    Hg: 80,
    Tl: 81,
    Pb: 82,
    Bi: 83,
    Po: 84,
    At: 85,
    Rn: 86,
    Fr: 87,
    Ra: 88,
    Ac: 89,
    Th: 90,
    Pa: 91,
    U: 92,
    Np: 93,
    Pu: 94,
    Am: 95,
    Cm: 96,
    Bk: 97,
    Cf: 98,
    Es: 99,
    Fm: 100,
    Md: 101,
    No: 102,
    Lr: 103
};
var ElementNames = [];
{
    for (var r = 120; r < 150; r++) Elements["R" + (r - 120)] = r;
    for (var el in Elements) ElementNames[Elements[el]] = el
}
var M_AR = 1 << 0, M_CE = 1 << 1, M_RNG = 1 << 5, M_WK = 1 << 31, M_EXPLICT_QFM = 1 << 12, M_APO = 1 << 7,
    M_CE2 = 1 << 10;
var E_BOEOTY_UP = 1, E_BOEOTY_AH = 4, E_BOEOTY_DW = 6;
var HYB_SP1 = 1, HYB_SP2 = 2, HYB_SP3 = 3;
var CHI_R = 1, CHI_S = 2;
var STEREO_LABEL = ["", "(S)", "(R)", "(RS)"];
var E_BOTY_NL = 0, E_BOTY_SI = 1, E_BOTY_DD = 2, E_BOTY_TR = 3, E_BOTY_AR = 4, E_BOTY_SD = 5, E_BOTY_SA = 6,
    E_BOTY_DA = 7, E_BOTY_AH = 8, E_BOTY_DS = 9;
var E_BOCYTY_AH = 0, E_BOCYTY_RN = 1, E_BOCYTY_CN = 2;
var ALS_NOOP = 0, ALS_HIAND = 1, ALS_OR = 2, ALS_LOAND = 3, ALS_NOT = 4;
var MINVOL = .01;
var ATOM_DISPLAY_RS = 1 << 0;
var MODE_NORMAL = 0, MODE_ZOOM = 1, MODE_ZROT = 2, MODE_RECT_SEL = 3, MODE_LASSO_SEL = 4, MODE_DRAG_ATOMS = 5,
    MODE_CHAIN = 6;
var ICON_SIZE = 24;
var TO_RAD = .017453292519943;
var TO_DEG = 57.29577951308232;

function cloneObject(obj) {
    var newObj;
    if (obj instanceof Array) {
        newObj = new Array(obj.length);
        for (var i = 0; i < obj.length; i++) {
            if (obj[i] && typeof obj[i] == "object") {
                newObj[i] = cloneObject(obj[i])
            } else newObj[i] = obj[i]
        }
    } else {
        newObj = {};
        for (var i in obj) {
            if (obj[i] && typeof obj[i] == "object") {
                newObj[i] = cloneObject(obj[i])
            } else newObj[i] = obj[i]
        }
    }
    return newObj
}

function countAtts(obj) {
    var count = 0;
    for (var prop in obj) if (obj.hasOwnProperty(prop)) count++;
    return count
}

Module.Array_map = function (ar, f) {
    var v = new Array(ar.length);
    for (var i = 0; i < ar.length; i++) v[i] = f(ar[i]);
    return v
};
Module.Array_forEach2 = function (ar, f) {
    for (var i = 0; i < ar.length; i++) f(ar[i])
};
Module.Array_fill = function (ar, initValue) {
    for (var i = 0; i < ar.length; i++) ar[i] = initValue
};
Module.Array_sub = function (ar, p, n) {
    var v = new Array(n);
    for (var i = 0; i < n; i++) v[i] = ar[i + p];
    return v
};
Module.Array_unique = function (ar) {
    var res = [];
    for (var i = 0; i < ar.length; i++) if (res.length == 0 || res[res.length - 1] != ar[i]) res.push(ar[i]);
    return res
};

function WMatrix() {
    this.mvm = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
}

WMatrix.prototype.translate = function (x, y, z) {
    this.mvm[12] += x * this.mvm[0] + y * this.mvm[4] + z * this.mvm[8];
    this.mvm[13] += x * this.mvm[1] + y * this.mvm[5] + z * this.mvm[9];
    this.mvm[14] += x * this.mvm[2] + y * this.mvm[6] + z * this.mvm[10];
    this.mvm[15] += x * this.mvm[3] + y * this.mvm[7] + z * this.mvm[11];
    return this
};
WMatrix.prototype.rotateZ = function (c, s) {
    var tmp;
    tmp = this.mvm[0];
    this.mvm[0] = tmp * c + this.mvm[4] * s;
    this.mvm[4] = -tmp * s + this.mvm[4] * c;
    tmp = this.mvm[1];
    this.mvm[1] = tmp * c + this.mvm[5] * s;
    this.mvm[5] = -tmp * s + this.mvm[5] * c;
    tmp = this.mvm[2];
    this.mvm[2] = tmp * c + this.mvm[6] * s;
    this.mvm[6] = -tmp * s + this.mvm[6] * c;
    tmp = this.mvm[3];
    this.mvm[3] = tmp * c + this.mvm[7] * s;
    this.mvm[7] = -tmp * s + this.mvm[7] * c;
    return this
};
WMatrix.prototype.rotateZAroundPoint = function (x, y, a) {
    return this.translate(x, y, 0).rotateZ(Math.cos(a), Math.sin(a)).translate(-x, -y, 0)
};
WMatrix.prototype.map = function (p) {
    var xx = p.x * this.mvm[0] + p.y * this.mvm[4] + this.mvm[12];
    var yy = p.x * this.mvm[1] + p.y * this.mvm[5] + this.mvm[13];
    return {x: xx, y: yy, z: 0}
};

function Chemical() {
    this.atoms = [];
    this.bonds = [];
    this.annotations = [];
    this.rings = [];
    this.minx = 0;
    this.maxx = 1.2 * 6;
    this.miny = 0;
    this.maxy = 1.2 * 6
}

Chemical.elementName = function (cd) {
    var p = ElementNames[cd];
    if (!p) p = "X";
    return p
};
Chemical.prototype.processChemical = function (keepTmp) {
    var tmpli = [];
    if (keepTmp) {
        for (var i = 0; i < this.atoms.length; i++) if (this.atoms[i].tmp != undefined) tmpli[i] = this.atoms[i].tmp
    }
    var mol = this.toMol();
    Module.chem.fromMol(mol);
    this.copyFromChem(Module.chem);
    if (keepTmp) {
        for (var i = 0; i < this.atoms.length; i++) if (tmpli[i] != undefined) this.atoms[i].tmp = tmpli[i]
    }
};

function bondKey(bo) {
    return Math.min(bo.fr, bo.to).toString() + "x" + Math.max(bo.fr, bo.to).toString()
}

Chemical.prototype.findShortestPath = function (node1, node2) {
    var dist = new Array;
    var atomsArr = new Array;
    var previous = new Array;
    var unvisited = this.atoms.length;
    for (var i = 0; i < this.atoms.length; i++) {
        dist[i] = Number.MAX_VALUE;
        previous[i] = -1;
        atomsArr[i] = i
    }
    dist[node1] = 0;
    while (unvisited > 0) {
        var u = Number.MAX_VALUE;
        var pos = -1;
        for (var i = 0; i < dist.length; i++) {
            if (atomsArr[i] != -1 && dist[i] < u) {
                u = dist[i];
                pos = i
            }
        }
        if (pos == -1) {
            break
        }
        atomsArr[pos] = -1;
        unvisited--;
        for (var i = 0; i < this.atoms[pos].bo.length; i++) {
            var alt = dist[pos] + 1;
            var currAt = this.atoms[pos].bo[i];
            if (alt < dist[currAt]) {
                dist[currAt] = alt;
                previous[currAt] = pos
            }
        }
    }
    var path = new Array;
    var target = node2;
    while (previous[target] != -1) {
        path.splice(0, 0, target);
        target = previous[target]
    }
    return path
};
Chemical.prototype.centerPoint = function () {
    return {x: (this.minx + this.maxx) / 2, y: (this.miny + this.maxy) / 2, z: 0}
};
Chemical.prototype.calcConnectivity = function () {
    for (var i = 0; i < this.atoms.length; i++) {
        this.atoms[i].bo = [];
        this.atoms[i].ty = [];
        this.atoms[i].conn = 0;
        this.atoms[i].nHyd = 0;
        if (typeof this.atoms[i].qfm == "undefined") this.atoms[i].qfm = 0;
        if (typeof this.atoms[i].ms == "undefined") this.atoms[i].ms = 0
    }
    for (var i = 0; i < this.bonds.length; i++) {
        var bo = this.bonds[i];
        if (typeof bo.ms == "undefined") bo.ms = 0;
        var ty = bo.ty;
        if (bo.ms & M_AR) ty |= 4;
        this.atoms[bo.fr].conn += bo.ty;
        this.atoms[bo.to].conn += bo.ty;
        ty |= bo.ms & M_RNG;
        this.atoms[bo.fr].bo.push(bo.to);
        this.atoms[bo.fr].ty.push(ty);
        this.atoms[bo.to].bo.push(bo.fr);
        this.atoms[bo.to].ty.push(ty);
        if (this.atoms[bo.fr].cd == 1) this.atoms[bo.to].nHyd++;
        if (this.atoms[bo.to].cd == 1) this.atoms[bo.fr].nHyd++
    }
    this.calcBox();
    for (var i = 0; i < this.atoms.length; i++) this.atoms[i].conn = Math.floor(this.atoms[i].conn)
};
Chemical.prototype.calcBox = function (env) {
    this.minx = this.miny = Number.MAX_VALUE;
    this.maxx = this.maxy = -Number.MAX_VALUE;
    this.nTermAtoms = 0;
    var bl = this.bondLength();
    for (var i = 0; i < this.atoms.length; i++) {
        var at = this.atoms[i];
        this.minx = Math.min(at.x, this.minx);
        this.miny = Math.min(at.y, this.miny);
        this.maxx = Math.max(at.x, this.maxx);
        this.maxy = Math.max(at.y, this.maxy);
        if (at.apo_pos) {
            this.minx = Math.min(at.apo_pos.x, this.minx);
            this.miny = Math.min(at.apo_pos.y, this.miny);
            this.maxx = Math.max(at.apo_pos.x, this.maxx);
            this.maxy = Math.max(at.apo_pos.y, this.maxy)
        }
        if (at.hasOwnProperty("atts") && at.atts.hasOwnProperty("D") && (at.atts.D == -1 || at.atts.D == at.bo.length)) {
            this.nTermAtoms++
        }
    }
    for (var i = 0; i < this.annotations.length; i++) {
        var t = this.annotations[i];
        this.minx = Math.min(t.x, this.minx);
        this.miny = Math.min(t.y, this.miny);
        this.maxx = Math.max(t.x + t.width, this.maxx);
        this.maxy = Math.min(t.y + 1.4, this.maxy)
    }
    this.minx -= bl;
    this.maxx += bl;
    this.miny -= bl;
    this.maxy += bl
};
Chemical.prototype.nbo_all = function (at) {
    return at.bo.length + this.H(at) - at.nHyd
};
Chemical.prototype.calc_qfm = function (at) {
    var q = at.conn - this.V(at);
    var s = 1;
    if (at.cd == 5) s = -1;
    if (at.cd == 15 && at.conn == 6) s = -1;
    return q >= 0 ? q * s : 0
};
Chemical.prototype.get_qfm = function (at) {
    return at.ms & M_EXPLICT_QFM ? at.qfm : this.calc_qfm(at)
};
Chemical.prototype.H = function (at) {
    if (at.cd == 1) return 0;
    if (at.hasOwnProperty("atts") && countAtts(at.atts)) return 0;
    var v = this.V(at);
    if (v == 0) return 0;
    var h = v - at.conn + at.qfm + at.nHyd;
    return h < 0 ? 0 : h
};
Chemical.prototype.V = function (at) {
    switch (at.cd) {
        case 8:
            return 2;
        case 7:
            return at.conn <= 4 ? 3 : 5;
        case 5:
            return at.conn <= 4 ? 3 : 5;
        case 6:
            return 4;
        case 34:
        case 16:
            return at.conn <= 3 ? 2 : at.conn <= 5 ? 4 : 6;
        case 33:
        case 15:
            return at.conn <= 4 ? 3 : at.conn <= 6 ? 5 : 6;
        case 14:
            return 4;
        case 17:
            return at.conn <= 2 ? 1 : at.conn <= 4 ? 3 : at.conn <= 6 ? 5 : 7;
        case 9:
            return 1;
        case 35:
            return at.conn <= 2 ? 1 : at.conn <= 4 ? 3 : at.conn <= 6 ? 5 : 7;
        case 53:
            return at.conn <= 2 ? 1 : at.conn <= 4 ? 3 : at.conn <= 6 ? 5 : 7;
        default:
            return at.conn
    }
};
Chemical.prototype.atomsInTheSameRing = function (at1, at2) {
    var minsz, rnum;
    minsz = Number.MAX_VALUE;
    rnum = -1;
    for (var i = 0; i < this.rings.length; i++) if (this.rings[i].indexOf(at1) != -1 && this.rings[i].indexOf(at2) != -1 && this.rings[i].length < minsz) {
        rnum = i;
        minsz = this.rings[i].length
    }
    return rnum
};

function cmp_pri_lex(a, b) {
    var i = 0;
    while (i < a.p.length && i < b.p.length) {
        if (a.p[i] != b.p[i]) return a.p[i] - b.p[i];
        i++
    }
    return a.p.length - b.p.length
}

function num_uniq_cip(p) {
    var i, num;
    if (p.length == 0) return 0;
    num = 1;
    for (i = 0; i < p.length - 1; i++) {
        if (cmp_pri_lex(p[i], p[i + 1]) != 0) num++
    }
    return num
}

Chemical.prototype.reassign_priorities = function (p, pp) {
    var start, end, i, j, k, iSym;
    start = 0;
    end = p.length - 1;
    iSym = 0;
    for (i = start; i <= end;) {
        pp++;
        j = i;
        while (j <= end && cmp_pri_lex(p[i], p[j]) == 0) j++;
        if (j > end) j = end; else j--;
        for (k = i; k <= j; k++) {
            p[k].set(pp)
        }
        i = j = j + 1
    }
};
Chemical.prototype.mapAtom = function (func) {
    var res = [];
    for (var i = 0; i < this.atoms.length; i++) {
        var item = func(this.atoms[i], i);
        if (item != null) res.push(item)
    }
    return res
};
Chemical.prototype.bondLength = function () {
    return this.bonds.length > 0 ? vectorLength(vesub(this.atoms[this.bonds[0].fr], this.atoms[this.bonds[0].to])) : 1.4
};
Chemical.prototype.moveAtoms = function (atli, txli, vect) {
    for (var i = 0; i < atli.length; i++) vecpy(this.atoms[atli[i]], veadd(this.atoms[atli[i]], vect));
    for (var i = 0; i < txli.length; i++) vecpy(this.annotations[txli[i]], veadd(this.annotations[txli[i]], vect))
};
Chemical.prototype.updateAtomSelection = function (poly, addMode) {
    for (var i = 0; i < this.atoms.length; i++) {
        var at = this.atoms[i];
        if (testPolyInclusion(at, poly)) at.ms |= M_CE; else {
            if (!addMode) at.ms &= ~M_CE
        }
    }
    for (var i = 0; i < this.bonds.length; i++) {
        var bo = this.bonds[i];
        var at = vemulby(veadd(this.atoms[bo.fr], this.atoms[bo.to]), .5);
        if (testPolyInclusion(at, poly)) bo.ms |= M_CE; else {
            if (!addMode) bo.ms &= ~M_CE
        }
    }
};
Chemical.prototype.rotateAtomsVector = function (atli, centPoint, vect, gravitateTo) {
    if (gravitateTo != -1 && atli.length == 1) {
        vecpy(this.atoms[atli[0]], this.atoms[gravitateTo]);
        return
    }
    if (atli.length == 0) return;
    var v = vector(centPoint, this.atoms[atli[0]]);
    if (atli.length == 1 && vectorLength(v) != this.bondLength()) {
        v = vectorSetLength(v, this.bondLength());
        vecpy(this.atoms[atli[0]], veadd(centPoint, v))
    }
    var a = Math.acos(scmul(v, vect) / (vectorLength(v) * vectorLength(vect)));
    a = Math.round(a * TO_DEG / 12) * 12 * TO_RAD;
    this.rotateAtomsAround(atli, centPoint, a * vemulZSign(v, vect))
};
Chemical.prototype.rotateAtomsAround = function (atli, centPoint, angle) {
    var m = (new WMatrix).rotateZAroundPoint(centPoint.x, centPoint.y, angle);
    for (var i = 0; i < atli.length; i++) {
        var p = m.map(this.atoms[atli[i]]);
        this.atoms[atli[i]].x = p.x;
        this.atoms[atli[i]].y = p.y
    }
    this.calcBox()
};
Chemical.prototype.setBondLength = function (bl) {
    if (!this.bonds.length) return;
    var bl2 = vectorLength(vector(this.atoms[this.bonds[0].fr], this.atoms[this.bonds[0].to]));
    if (Math.abs(1 - bl / bl2) < .1) return;
    var kf = bl / bl2;
    Module.Array_forEach2(this.atoms, function (at) {
        vecpy(at, vemulby(at, kf))
    });
    this.calcBox()
};
Chemical.prototype.expHydrogenToImp = function () {
    var hyd = [];
    for (var i = 0; i < this.atoms.length; i++) {
        if (typeof this.atoms[i].atts == "undefined") this.atoms[i].atts = {};
        if (typeof this.atoms[i].atts.H == "undefined") this.atoms[i].atts.H = 0;
        if (this.atoms[i].cd == 1) hyd.push(i)
    }
    for (var i = 0; i < this.bonds.length; i++) {
        var bo = this.bonds[i];
        if (this.atoms[bo.fr].cd == 1) this.atoms[bo.to].atts.H++;
        if (this.atoms[bo.to].cd == 1) this.atoms[bo.fr].atts.H++
    }
    this.removeAtoms(hyd);
    return this
};
Chemical.prototype.apoFromSelection = function (ms) {
    var apo = [];
    var that = this;
    Module.Array_forEach2(this.atoms, function (at) {
        at.ms &= ~M_WK
    });
    Module.Array_forEach2(this.bonds, function (bo) {
        if (bo.ms & M_CE) {
            that.atoms[bo.fr].ms |= M_WK;
            that.atoms[bo.to].ms |= M_WK
        }
    });
    for (var i = 0; i < this.bonds.length; i++) {
        var bo = this.bonds[i];
        if (this.atoms[bo.fr].ms & (M_CE | M_WK) && !(this.atoms[bo.to].ms & (M_CE | M_WK))) apo.push(bo.fr); else if (!(this.atoms[bo.fr].ms & (M_CE | M_WK)) && this.atoms[bo.to].ms & (M_CE | M_WK)) apo.push(bo.to)
    }
    return Module.Array_unique(apo.sort(function (a, b) {
        return a - b
    }))
};
Chemical.prototype.makeAtom = function (cd) {
    this.atoms.push({x: 0, y: 0, z: 0, cd: cd, ms: 0});
    this.processChemical();
    return this
};
Chemical.prototype.makeBond = function (angle, ty) {
    var bl = 1.2;
    this.atoms = [];
    this.bonds = [];
    this.atoms.push({x: 0, y: 0, z: 0, cd: 6, ms: 0});
    this.atoms.push({x: bl, y: 1.2 * Math.tan(angle * TO_RAD), z: 0, cd: 6, ms: 0});
    this.bonds.push({fr: 0, to: 1, ty: ty, ms: 0});
    this.processChemical();
    return this
};
Chemical.prototype.makeMacroCycle = function (size) {
    var bl = this.bonds.length ? vectorLength(vector(this.atoms[this.bonds[0].fr], this.atoms[this.bonds[0].to])) : 1.2;
    this.atoms = [];
    this.bonds = [];
    var angle = 60 * TO_RAD;
    var t = 0;
    var v = {x: bl, y: 0, z: 0};
    var p = {x: 0, y: 0, z: 0};
    var size = 32;
    if (size % 2 == 0) sz = (size - 2) / 2; else sz = (size - 3) / 2;
    var pattern = [];
    for (var i = 0; i < sz - 1; i++) pattern.push(i % 2 ? -1 : 1);
    pattern.push(pattern[pattern.length - 1]);
    pattern.push(0);
    pattern.push(pattern[pattern.length - 2]);
    pattern.push(pattern[pattern.length - 1]);
    for (var i = 0; i < sz - 3; i++) pattern.push(-pattern[pattern.length - 1]);
    for (var i = 0; i < size; i++) {
        var a = {x: p.x, y: p.y, z: p.z, cd: 6, ms: 0, bo: [], ty: []};
        this.atoms[this.atoms.length] = a;
        if (i) {
            this.bonds[this.bonds.length] = {fr: i - 1, to: i, ty: 1, ms: 0}
        }
        var m = (new WMatrix).rotateZAroundPoint(0, 0, angle * pattern[i % pattern.length]);
        vecpy(v, m.map(v));
        p = veadd(p, v)
    }
    this.processChemical();
    return this
};
Chemical.prototype.makeRing = function (size, aro) {
    var bl = this.bonds.length ? vectorLength(vector(this.atoms[this.bonds[0].fr], this.atoms[this.bonds[0].to])) : 1.2;
    var sina2 = Math.sin(Math.PI / size);
    var r = bl / (2 * sina2);
    this.atoms = [];
    this.bonds = [];
    var t = 0;
    for (var i = 0; i < size; i++) {
        var a = {
            x: r * Math.sin(i * 2 * Math.PI / size),
            y: r * Math.cos(i * 2 * Math.PI / size),
            z: 0,
            cd: 6,
            ms: 0,
            bo: [],
            ty: []
        };
        this.atoms[this.atoms.length] = a;
        if (i) {
            this.bonds[this.bonds.length] = {fr: i - 1, to: i, ty: aro ? t + 1 : 1, ms: 0};
            t = 1 - t
        }
    }
    this.bonds.push({fr: 0, to: this.bonds.length, ty: aro ? t + 1 : 1, ms: 0});
    this.processChemical();
    return this
};
Chemical.prototype.atProp = function (at, prop, def) {
    return typeof at.atts != "undefined" && typeof at.atts[prop] != "undefined" && at.atts[prop] ? at.atts[prop] + 1 : 0
};
Chemical.prototype.toMol = function () {
    var molFile;
    var tt = new Date;
    var hasChiral = 0;
    var qfm_map = [7, 6, 6, 0, 3, 2, 1];
    var isReaction = false;
    molFile = sprintf("%s  MOLSOFT %02d%02d%02d%02d%02d2D\n\n", "\n", tt.getMonth() + 1, tt.getDate(), tt.getFullYear() % 100, tt.getHours(), tt.getMinutes());
    molFile += sprintf("%3d%3d%3d  0%3d%3d  0  0  0  0999 V2000%s", this.atoms.length, this.bonds.length, 0, hasChiral, this.annotations.length, "\n");
    for (var i = 0; i < this.atoms.length; i++) {
        var a = this.atoms[i];
        var p = Chemical.elementName(a.cd);
        if (p.length == 1) p += " ";
        molFile += sprintf("%10.4f%10.4f%10.4f %-3s%2d%3d%3d%3d%s", a.x, a.y, 0, p, a.wtdf ? a.wtdf : 0, 0, a.peo ? a.peo : 0, this.atProp(a, "H", 0), "\n")
    }
    for (var i = 0; i < this.bonds.length; i++) {
        var b = this.bonds[i];
        var eo = b.eo ? b.eo : 0;
        molFile += sprintf("%3d%3d%3d%3d%s", b.fr + 1, b.to + 1, b.ty, eo, "\n")
    }
    var annot2text = function (t) {
        var txt = t.text.replace("\n", " ");
        if (t.width) txt += sprintf("\x3c!--%s=%.2f--\x3e", "width", t.width);
        if (t.height) txt += sprintf("\x3c!--%s=%.2f--\x3e", "height", t.height);
        return txt
    };
    for (var i = 0; i < this.annotations.length; i++) {
        var t = this.annotations[i];
        if (t.text == "_ARROW_") isReaction = true;
        molFile += sprintf("%10.4f%10.4f%s", t.x, t.y, "\n");
        molFile += annot2text(t);
        molFile += "\n"
    }
    var qfm = "";
    var nqfm = 0;
    for (var i = 0; i < this.atoms.length; i++) if (this.atoms[i].ms & M_EXPLICT_QFM && (q = this.get_qfm(this.atoms[i]))) {
        qfm += sprintf(" %3d %3d", i + 1, q);
        nqfm++
    }
    if (nqfm) molFile += sprintf("M  CHG%3d%s\n", nqfm, qfm);
    for (var i = 0; i < this.atoms.length; i++) {
        var a = this.atoms[i];
        if (this.atoms[i].hasOwnProperty("atts")) {
            var p = "";
            for (var prop in a.atts) if (a.atts.hasOwnProperty(prop)) {
                if (p.length) p += ";";
                p += prop + a.atts[prop]
            }
            if (p.length) molFile += sprintf("M  ZLS %d [%s;%s]\n", i + 1, Chemical.elementName(a.cd), p)
        }
        if (a.oc) molFile += sprintf("M  ZZO %d %f\n", i + 1, a.oc);
        if (typeof a.lbl == "string") molFile += sprintf("M  ZZC %d %s\n", i + 1, a.lbl);
        if (a.hasOwnProperty("atts") && a.atts.hasOwnProperty("D") && a.atts.D != 0) molFile += sprintf("M  SUB%3d %3d %3d\n", 1, i + 1, a.atts.D == -1 ? a.bo.length : a.atts.D)
    }
    molFile += "M  END\n";
    if (!isReaction) return molFile; else {
        Module.chem.fromMol(molFile);
        return Module.chem.toMol(false)
    }
};
Chemical.prototype.parseMol = function (molFile) {
    this.atoms = [];
    this.bonds = [];
    this.annotations = [];
    if (Module.chem.fromMol(molFile)) {
        this.copyFromChem(Module.chem)
    }
    this.setBondLength(1.2);
    return this
};
Chemical.prototype.getInChi = function () {
    var mol = this.toMol();
    if (!Module.chem) return "";
    Module.chem.fromMol(mol);
    return Module.chem.toInCHI()
};
Chemical.prototype.getIUPAC = function () {
    var mol = this.toMol();
    if (!Module.chem) return "";
    Module.chem.fromMol(mol);
    return Module.chem.iupacName()
};
Chemical.prototype.getSmiles = function (kekule) {
    var mol = this.toMol();
    if (Module.chem) {
        Module.chem.fromMol(mol);
        return Module.chem.toSmiles(kekule)
    } else {
        var req = getXMLObject(false);
        req.open("GET", sprintf("http://molsoft.com/cgi-bin/conv2d3d.cgi?mol=%s&toSmiles=1%s", encodeURIComponent(mol), typeof kekule != "undefined" && kekule ? "&kekule=1" : ""), false);
        req.send();
        return req.responseText
    }
};
Chemical.prototype.toSmiles = function (onDone, kekule) {
    var mol = this.toMol();
    if (Module.chem) {
        Module.chem.fromMol(mol);
        onDone(Module.chem.toSmiles(kekule))
    } else {
        var req = getXMLObject(true);
        var that = this;
        req.onload = function (e) {
            onDone(req.responseText)
        };
        req.open("GET", sprintf("http://molsoft.com/cgi-bin/conv2d3d.cgi?mol=%s&toSmiles=1%s", encodeURIComponent(mol), typeof kekule != "undefined" && kekule ? "&kekule=1" : ""));
        req.send()
    }
};
Chemical.prototype.copyFromChem = function (obj) {
    this.atoms = obj.atoms;
    this.bonds = obj.bonds;
    this.rings = obj.rings;
    this.annotations = obj.annotations;
    this.calcBox()
};
Chemical.prototype.parseSmiles = function (smi, onfinish) {
    if (Module.chem) {
        Module.chem.fromSmiles(smi);
        this.copyFromChem(Module.chem);
        if (typeof onfinish == "function") onfinish()
    } else {
        var req = getXMLObject(true);
        var that = this;
        req.onload = function (e) {
            that.parseMol(req.responseText);
            if (typeof onfinish == "function") onfinish()
        };
        req.open("GET", sprintf("http://molsoft.com/cgi-bin/conv2d3d.cgi?smi=%s&2D=1", encodeURIComponent(smi)));
        req.send()
    }
};
Chemical.prototype.assignCoordinates = function (onfinish) {
    if (Module.chem) {
        Module.chem.fromSmiles(this.getSmiles(true));
        this.parseMol(Module.chem.toMol(false));
        if (typeof onfinish == "function") onfinish()
    } else {
        var req = getXMLObject(true);
        var that = this;
        var mol = this.toMol();
        req.onload = function (e) {
            that.parseMol(req.responseText);
            if (typeof onfinish == "function") onfinish()
        };
        req.open("GET", sprintf("http://molsoft.com/cgi-bin/conv2d3d.cgi?mol=%s&2D=1", encodeURIComponent(mol)));
        req.send()
    }
};
Chemical.prototype.parseString = function (str, onfinish) {
    if (str.indexOf("M  END") != -1) {
        this.parseMol(str);
        if (typeof onfinish == "function") onfinish()
    } else {
        this.parseSmiles(str, onfinish)
    }
};
Chemical.prototype.removeAtoms = function (atli, txli) {
    var atmap = new Array(this.atoms.length);
    for (var i = 0; i < atli.length; i++) atmap[atli[i]] = -1;
    var n = 0;
    for (var i = 0; i < atmap.length; i++) if (atmap[i] != -1) atmap[i] = n++;
    for (var i = 0; i < this.bonds.length;) {
        if (atmap[this.bonds[i].fr] == -1 || atmap[this.bonds[i].to] == -1) {
            this.bonds.splice(i, 1)
        } else {
            this.bonds[i].fr = atmap[this.bonds[i].fr];
            this.bonds[i].to = atmap[this.bonds[i].to];
            i++
        }
    }
    atli.sort(function (a, b) {
        return a - b
    });
    for (var i = atli.length - 1; i >= 0; i--) this.atoms.splice(atli[i], 1);
    if (txli) {
        for (var i = txli.length - 1; i >= 0; i--) this.annotations.splice(txli[i], 1)
    }
    this.processChemical()
};
Chemical.prototype.removeBonds = function (boli) {
    boli.sort(function (a, b) {
        return a - b
    });
    for (var i = boli.length - 1; i >= 0; i--) this.bonds.splice(boli[i], 1);
    this.processChemical()
};
Chemical.prototype.findClosestBond = function (p) {
    var bo = -1;
    for (var i = 0; i < this.bonds.length; i++) {
        var mid = vemulby(veadd(this.atoms[this.bonds[i].fr], this.atoms[this.bonds[i].to]), .5);
        if (vectorLength(vector(mid, p)) <= .5) {
            bo = i;
            break
        }
    }
    return bo
};
Chemical.prototype.findClosestAtom = function (p) {
    var at = -1;
    for (var i = 0; i < this.atoms.length; i++) {
        if (vectorLength(vector(this.atoms[i], p)) <= .5) {
            at = i;
            break
        }
    }
    return at
};
Chemical.prototype.findClosestText = function (p) {
    var txt = -1;
    for (var i = 0; i < this.annotations.length; i++) {
        var t = this.annotations[i];
        if (p.x >= t.x && p.x <= t.x + t.width && p.y <= t.y && p.y >= t.y - t.height) {
            txt = i;
            break
        }
    }
    return txt
};
Chemical.prototype.nofAtomSelection = function (ms) {
    var n = 0;
    if (!ms) ms = M_CE;
    for (var i = 0; i < this.atoms.length; i++) if (this.atoms[i].ms & ms) n++;
    return n
};
Chemical.prototype.setAtomSelection = function (msin, ms, on) {
    for (var i = 0; i < this.atoms.length; i++) if (msin == 0 || this.atoms[i].ms & msin) {
        if (on) this.atoms[i].ms |= ms; else this.atoms[i].ms &= ~ms
    }
};
Chemical.prototype.setBondSelection = function (msin, ms, on) {
    for (var i = 0; i < this.bonds.length; i++) if (msin == 0 || this.bonds[i].ms & msin) {
        if (on) this.bonds[i].ms |= ms; else this.bonds[i].ms &= ~ms
    }
};
Chemical.prototype.getSelectedAtoms = function (ms) {
    var res = [];
    for (var i = 0; i < this.atoms.length; i++) if (this.atoms[i].ms & ms) res.push(i);
    return res
};
Chemical.prototype.findClosestAtomLong = function (p) {
    if (this.atoms.length == 0) return -1;
    var tmp = 0;
    var d = vectorLength(vector(this.atoms[0], p));
    var d2;
    for (var i = 1; i < this.atoms.length; i++) {
        if ((d2 = vectorLength(vector(this.atoms[i], p))) < d) {
            d = d2;
            tmp = i
        }
    }
    return tmp
};
Chemical.prototype.hasCollisions = function (atnum) {
    for (var j = 0; j < this.atoms.length; j++) if (j != atnum && vectorLength(vector(this.atoms[atnum], this.atoms[j])) <= .2) return true;
    return false
};
Chemical.prototype.gravitateCollisions = function () {
    var atli = [];
    var m = new Array(this.atoms.length);
    Module.Array_fill(m, -1);
    for (var i = 0; i < this.atoms.length; i++) {
        for (var j = i + 1; j < this.atoms.length; j++) {
            if (vectorLength(vector(this.atoms[i], this.atoms[j])) <= .2) {
                m[j] = i;
                atli.push(j)
            }
        }
    }
    if (atli.length > 0) {
        atli.sort(function (a, b) {
            return a - b
        });
        var mm = [];
        var j = 0;
        for (var i = 0; i < this.atoms.length; i++) if (m[i] == -1) mm[i] = j++;
        for (var i = 0; i < this.bonds.length; i++) {
            if (m[this.bonds[i].fr] != -1) {
                if (m[this.bonds[i].to] != -1) {
                    this.bonds.splice(i, 1);
                    i--
                } else {
                    this.bonds[i].fr = mm[m[this.bonds[i].fr]];
                    this.bonds[i].to = mm[this.bonds[i].to]
                }
            } else if (m[this.bonds[i].to] != -1) {
                this.bonds[i].to = mm[m[this.bonds[i].to]];
                this.bonds[i].fr = mm[this.bonds[i].fr]
            } else {
                this.bonds[i].to = mm[this.bonds[i].to];
                this.bonds[i].fr = mm[this.bonds[i].fr]
            }
        }
        for (var i = atli.length - 1; i >= 0; i--) this.atoms.splice(atli[i], 1);
        this.processChemical();
        return true
    }
    return false
};
Chemical.prototype.bondToggle = function (bonum, ty) {
    var bo = this.bonds[bonum];
    var eo = bo.eo;
    bo.eo = 0;
    if (ty == 4) {
        bo.ty = 1;
        if (eo == 0) bo.eo = E_BOEOTY_UP; else if (eo == E_BOEOTY_UP) bo.eo = E_BOEOTY_DW; else if (eo == E_BOEOTY_DW) bo.eo = E_BOEOTY_AH; else if (eo == E_BOEOTY_AH) bo.eo = E_BOEOTY_UP;
        var at1 = this.atoms[bo.fr];
        var at2 = this.atoms[bo.to];
        if (at1.bo.length == 1 && at2.bo.length > 1) {
            var t = bo.fr;
            bo.fr = bo.to;
            bo.to = t
        } else if (!at1.eo && at2.eo) {
            var t = bo.fr;
            bo.fr = bo.to;
            bo.to = t
        }
    } else if ((ty == -1 || ty == 1) && !eo) {
        var maxorder = 2;
        if (!(this.atoms[bo.fr].ms & M_RNG) && !(this.atoms[bo.to].ms & M_RNG) && this.atoms[bo.fr].bo.length <= 2 && this.atoms[bo.to].bo.length <= 2) maxorder = 3;
        bo.ty = bo.ty % maxorder + 1
    } else bo.ty = ty;
    this.processChemical()
};
Chemical.prototype.isotopeAtom = function (atnum) {
    var at = this.atoms[atnum];
    var wtdf = (at.wtdf ? at.wtdf : 0) + 3;
    wtdf = (wtdf + 1) % 7 - 3;
    at.wtdf = wtdf;
    this.processChemical()
};
Chemical.prototype.chargeAtom = function (atnum) {
    var at = this.atoms[atnum];
    var h = this.H(at);
    var v = this.V(at);
    var h = v - at.conn + at.nHyd;
    if (h < 0) h = 0;
    var nstate = 3 + h;
    if (typeof at.tmp == "undefined") at.tmp = 0; else at.tmp = (at.tmp + 1) % nstate;
    switch (at.tmp) {
        case 0:
            at.ms |= M_EXPLICT_QFM;
            at.qfm = at.tmp + 1;
            break;
        case 1:
            at.ms |= M_EXPLICT_QFM;
            at.qfm = 0;
            break;
        case 2:
            at.ms &= ~M_EXPLICT_QFM;
            at.qfm = this.calc_qfm(at);
            break;
        case 3:
        case 4:
            at.ms |= M_EXPLICT_QFM;
            var q = at.tmp - 1;
            if (q > this.V(at) - at.conn) {
                at.tmp += q - this.V(at) + at.conn - 1;
                q = this.V(at) - at.conn
            }
            at.qfm = -q;
            break
    }
    this.processChemical(true)
};
Chemical.prototype.changeAtom = function (atnum, cd, atts) {
    var at = this.atoms[atnum];
    if (cd != -1) at.cd = cd;
    at.atts = atts;
    delete at.lbl;
    this.processChemical()
};
Chemical.prototype.neibVector2 = function (at, mul) {
    var v1 = vector(at, this.atoms[at.bo[0]]);
    var v2 = vector(at, this.atoms[at.bo[1]]);
    return vectorSetLength(vemulby(veadd(v1, v2), mul), vectorLength(v1))
};
Chemical.prototype.ringCenter = function (rnum) {
    var v = {x: 0, y: 0, z: 0};
    for (var i = 0; i < this.rings[rnum].length; i++) {
        v = veadd(v, this.atoms[this.rings[rnum][i]])
    }
    return vemulby(v, 1 / this.rings[rnum].length)
};
Chemical.prototype.bondOrtho = function (atnum1, atnum2, ty, len) {
    var at1 = this.atoms[atnum1];
    var at2 = atnum2 != -1 ? this.atoms[atnum2] : at1.apo_pos;
    if (at1.bo.length == 1 && at2.bo.length == 1 || ty == 3) {
        var v = vectorSetLength(vector(at1, at2), len);
        return {x: -v.y, y: v.x, z: 0}
    } else {
        var rnum = this.atomsInTheSameRing(atnum1, atnum2);
        if (rnum != -1) {
            if (this.rings[rnum].length <= 7) {
                var v = vector(at1, at2);
                var rv = vector(vemulby(veadd(at1, at2), .5), this.ringCenter(rnum));
                return vectorSetLength(rv, len)
            } else {
                var v = vector(at1, at2);
                var rv = {x: -v.y, y: v.x, z: 0};
                var mid = vemulby(veadd(at1, at2), .5);
                rv = vectorSetLength(rv, len);
                if (vectorLength(veadd(mid, rv)) < vectorLength(veadd(mid, vemulby(rv, -1)))) return rv; else return vemulby(rv, -1)
            }
        }
        var atnum3 = -1;
        if (at1.bo.length > 1 || at1.apo_pos) {
            for (var i = 0; i < at1.bo.length; i++) if (at1.bo[i] != atnum2 && this.atomsInTheSameRing(at1.bo[i], atnum2) != -1) {
                atnum3 = at1.bo[i];
                break
            }
            if (atnum3 == -1) for (var i = 0; i < at1.bo.length; i++) if (at1.bo[i] != atnum2) {
                atnum3 = at1.bo[i];
                break
            }
        } else {
            for (var i = 0; i < at2.bo.length; i++) if (at2.bo[i] != atnum1 && this.atomsInTheSameRing(at2.bo[i], atnum1) != -1) {
                atnum3 = at2.bo[i];
                break
            }
            if (atnum3 == -1) for (var i = 0; i < at2.bo.length; i++) if (at2.bo[i] != atnum1) {
                atnum3 = at2.bo[i];
                break
            }
        }
        var at3 = atnum3 != -1 ? this.atoms[atnum3] : at1.apo_pos;
        var v1 = vector(at1, at2);
        var v2 = vector(at2, at3);
        var v3 = vemul(v1, v2);
        var v;
        if (vectorLength(v3) < .01) v = {x: -v1.y, y: v1.x, z: 0}; else v = vemul(v3, v1);
        return vectorSetLength(v, len)
    }
};
Chemical.prototype.placeFragment = function (pos, frag) {
    var that = this;
    frag = cloneObject(frag);
    var d = vesub(pos, frag.centerPoint());
    var n = this.atoms.length;
    Module.Array_forEach2(frag.atoms, function (x) {
        vecpy(x, veadd(x, d));
        that.atoms.push(x)
    });
    Module.Array_forEach2(frag.bonds, function (x) {
        that.bonds.push({fr: x.fr + n, to: x.to + n, ty: x.ty, ms: 0})
    });
    this.processChemical()
};
Chemical.prototype.connectToBond = function (bonum, frag) {
    var that = this;
    var bo = this.bonds[bonum];
    var tobonum = 0;
    var aro = frag.atoms.length == 6 && frag.atoms[0].ms & M_AR;
    frag = cloneObject(frag);
    if (aro) {
        for (var i = 0; i < frag.bonds.length; i++) if (frag.bonds[i].ty == bo.ty) {
            tobonum = i;
            break
        }
        if (bo.ms & M_AR && frag.bonds[tobonum].ty == 1) {
            var t = 0;
            for (var i = 1; i <= 5; i++) {
                frag.bonds[(tobonum + i) % frag.bonds.length].ty = t + 1;
                t = 1 - t
            }
        }
    }
    var tobo = frag.bonds[tobonum];
    var v1 = vemulby(this.bondOrtho(bo.fr, bo.to, 1, 1), -1);
    var p1 = vemulby(veadd(this.atoms[bo.fr], this.atoms[bo.to]), .5);
    var v2 = frag.bondOrtho(tobo.fr, tobo.to, 1, 1);
    var p2 = vemulby(veadd(frag.atoms[tobo.fr], frag.atoms[tobo.to]), .5);
    var angle = Math.acos(Math.max(-1, Math.min(1, scmul(v1, v2) / (vectorLength(v1) * vectorLength(v2))))) * vemulZSign(v2, v1);
    var d = vesub(p1, p2);
    var mt = (new WMatrix).rotateZAroundPoint(p1.x, p1.y, angle);
    var n = this.atoms.length;
    Module.Array_forEach2(frag.atoms, function (x) {
        vecpy(x, mt.map(veadd(x, d)));
        that.atoms.push(cloneObject(x))
    });
    Module.Array_forEach2(frag.bonds, function (x) {
        that.bonds.push({fr: x.fr + n, to: x.to + n, ty: x.ty, ms: 0})
    });
    if (!this.gravitateCollisions()) this.processChemical()
};
Chemical.prototype.chainTo = function (atnum, ty, mouseLast, mouseCurrent) {
    var that = this;
    var at = this.atoms[atnum];
    var mouseVec = vector(at, mouseCurrent);
    var toat = null;
    var newpos;
    if (at.bo.length == 0) {
        var v = {x: 1.2, y: 0, z: 0};
        var a = Math.acos(scmul(v, mouseVec) / (vectorLength(v) * vectorLength(mouseVec))) * vemulZSign(v, mouseVec);
        a = Math.round(a * TO_DEG / 12) * 12 * TO_RAD;
        v.x = 1.2 * Math.cos(a);
        v.y = 1.2 * Math.sin(a);
        newpos = veadd(at, v)
    } else {
        var at2 = this.atoms[at.bo[0]];
        var v = vector(at2, at);
        newpos = veadd(at, v);
        newpos = (new WMatrix).rotateZAroundPoint(at.x, at.y, -vemulZSign(v, vector(mouseCurrent, at2)) * Math.PI / 3).map(newpos)
    }
    var newat = {x: newpos.x, y: newpos.y, z: 0, cd: 6, bo: [], ty: []};
    this.atoms.push(newat);
    this.bonds.push({fr: atnum, to: this.atoms.length - 1, ty: ty, ms: 0});
    this.processChemical();
    return this.atoms.length - 1
};
Chemical.prototype.connectTo = function (atnum, ty, frag, toatnum) {
    var that = this;
    var at = this.atoms[atnum];
    var newpos = null;
    if (at.atts && at.atts.D) delete at.atts.D;
    if (ty == 3 && at.bo.length != 1) return [];
    var toat = null;
    if (frag != null) {
        frag = cloneObject(frag);
        toat = frag.atoms[toatnum];
        if (at.bo.length == 2 && toat.bo.length == 2) {
            newpos = veadd(toat, frag.neibVector2(toat, -1));
            toat = {x: newpos.x, y: newpos.y, z: 0, cd: 6, bo: [], ty: []};
            frag.atoms.push(toat);
            frag.bonds.push({fr: toatnum, to: frag.atoms.length - 1, ty: 1, ms: 0});
            toatnum = frag.atoms.length - 1;
            frag.calcConnectivity();
            toat = frag.atoms[toatnum]
        }
        var dir;
        switch (at.bo.length) {
            case 0:
                dir = {x: 1.2, y: 0, z: 0};
                break;
            case 1:
                dir = vector(at, this.atoms[at.bo[0]]);
                break;
            case 2:
                dir = this.neibVector2(at, -1);
                break;
            default:
                return []
        }
        var v;
        switch (toat.bo.length) {
            case 0:
                v = {x: 1.2, y: 0, z: 0};
                break;
            case 1:
                v = vector(toat, frag.atoms[toat.bo[0]]);
                break;
            case 2:
                v = frag.neibVector2(toat, -1);
                break;
            default:
                return []
        }
        var angle = Math.acos(scmul(v, dir) / (vectorLength(v) * vectorLength(dir))) * vemulZSign(v, dir);
        var atli = [];
        var d = vesub(at, toat);
        var mt = (new WMatrix).rotateZAroundPoint(at.x, at.y, angle);
        var n = this.atoms.length;
        var m = [], i = 0;
        Module.Array_forEach2(frag.atoms, function (x) {
            vecpy(x, mt.map(veadd(x, d)));
            if (x != toat) {
                m[i] = n;
                atli.push(n++);
                that.atoms.push(cloneObject(x))
            } else m[i] = atnum;
            i++
        });
        Module.Array_forEach2(frag.bonds, function (x) {
            that.bonds.push({fr: m[x.fr], to: m[x.to], ty: x.ty, ms: 0})
        });
        this.processChemical();
        return atli
    }
    switch (at.bo.length) {
        case 0: {
            newpos = veadd(at, {x: 1.2, y: 0, z: 0})
        }
            break;
        case 1: {
            var at2 = this.atoms[at.bo[0]];
            var v = vector(at2, at);
            if (ty == 3 || ty == 2 && at.ty[0] == 2) {
                newpos = veadd(at, v)
            } else {
                if (at2.bo.length == 2) {
                    var i = at2.bo[0] == atnum ? at2.bo[1] : at2.bo[0];
                    newpos = veadd(at, vector(this.atoms[i], at2))
                } else {
                    newpos = veadd(at, v);
                    newpos = (new WMatrix).rotateZAroundPoint(at.x, at.y, Math.PI / 3).map(newpos)
                }
            }
        }
            break;
        case 2: {
            var v1 = vector(at, this.atoms[at.bo[0]]);
            var v2 = vector(at, this.atoms[at.bo[1]]);
            var v = vemul(v1, v2);
            if (vectorLength(v) > .01) newpos = veadd(at, vectorSetLength(vemulby(veadd(v1, v2), -1), vectorLength(v1))); else newpos = veadd(at, vectorSetLength({
                x: -v1.y,
                y: v1.x,
                z: 0
            }, vectorLength(v1)))
        }
            break;
        case 3: {
            var v1 = vector(at, this.atoms[at.bo[0]]);
            var v2 = vector(at, this.atoms[at.bo[1]]);
            var v = angleBetween(v1, v2);
            if (Math.abs(v - 180) <= .01) {
                newpos = veadd(at, vemulby(vector(at, this.atoms[at.bo[2]]), -1));
                break
            }
            v2 = vector(at, this.atoms[at.bo[2]]);
            v = angleBetween(v1, v2);
            if (Math.abs(v - 180) <= .01) {
                newpos = veadd(at, vemulby(vector(at, this.atoms[at.bo[1]]), -1));
                break
            }
            v1 = vector(at, this.atoms[at.bo[1]]);
            v = angleBetween(v1, v2);
            if (Math.abs(v - 180) <= .01) {
                newpos = veadd(at, vemulby(vector(at, this.atoms[at.bo[0]]), -1));
                break
            }
        }
        default: {
            var maxAngle = 0;
            var ii = -1, jj = -1;
            for (var i = 0; i < at.bo.length; i++) {
                var v1 = vector(at, this.atoms[at.bo[i]]);
                for (var j = 0; j < at.bo.length; j++) if (i != j) {
                    var v2 = vector(at, this.atoms[at.bo[j]]);
                    var a = Math.acos(scmul(v1, v2) / (vectorLength(v1) * vectorLength(v2)));
                    var ok = true;
                    for (var k = 0; k < at.bo.length; k++) if (k != i && k != j) {
                        var vv = vector(at, this.atoms[at.bo[k]]);
                        var a1 = Math.acos(scmul(v1, vv) / (vectorLength(v1) * vectorLength(vv)));
                        var a2 = Math.acos(scmul(v2, vv) / (vectorLength(v2) * vectorLength(vv)));
                        if (Math.abs(a1 + a2 - a) <= .001) {
                            ok = false;
                            break
                        }
                    }
                    if (!ok) continue;
                    if (a > maxAngle) {
                        maxAngle = a;
                        ii = i;
                        jj = j
                    }
                }
            }
            if (ii != -1 && jj != -1) {
                var v1 = vector(at, this.atoms[at.bo[ii]]);
                var v2 = vector(at, this.atoms[at.bo[jj]]);
                newpos = veadd(at, vectorSetLength(veadd(v1, v2), vectorLength(v1)))
            }
        }
            break
    }
    if (newpos != null) {
        var newat = {x: newpos.x, y: newpos.y, z: 0, cd: 6, bo: [], ty: []};
        this.atoms.push(newat);
        var eo = 0;
        if (ty == 4) {
            ty = 1;
            eo = E_BOEOTY_UP
        }
        this.bonds.push({fr: atnum, to: this.atoms.length - 1, ty: ty, ms: 0, eo: eo});
        this.processChemical();
        return [this.atoms.length - 1]
    }
    return []
};

function ChemicalView(chemString, parentContainer, width, height, options, margin) {
    var that = this;
    this.circleDegreeAsDrawn_ = 0;
    this.lonePairDisplay_ = 0;
    this.showOccupancy_ = false;
    Object.defineProperty(this, "circleDegreeAsDrawn", {
        get: function () {
            return this.circleDegreeAsDrawn_
        }, set: function (v) {
            this.circleDegreeAsDrawn_ = v;
            this.chem.calcBox();
            this.drawMol(true)
        }
    });
    Object.defineProperty(this, "showOccupancy", {
        get: function () {
            return this.showOccupancy_
        }, set: function (v) {
            this.showOccupancy_ = v;
            this.drawMol(false)
        }
    });
    Object.defineProperty(this, "lonePairDisplay", {
        get: function () {
            return this.lonePairDisplay_
        }, set: function (v) {
            this.lonePairDisplay_ = v;
            this.drawMol(false)
        }
    });
    var par = typeof parentContainer == "string" ? document.getElementById(parentContainer) : parentContainer;
    this.atomColors = {
        S: "#b2b200",
        O: "#ff0000",
        N: "#004dff",
        H: "#707070",
        F: "#66cd00",
        Cl: "#66cd00",
        Br: "#66cd00",
        I: "#66cd00"
    };
    this.atomColorsLight = {
        S: "yellow",
        O: "#FF66FF",
        N: "cyan",
        H: "#fafafa",
        F: "#66cd00",
        Cl: "#a6fd80",
        Br: "GreenYellow",
        I: "#a6fd80"
    };
    this.readOnly = false;
    this.dpr = window.devicePixelRatio || 1;
    if (!width) width = par.clientWidth - 88;
    if (!height) height = par.clientHeight - 76;
    this.margin = 16;
    if (margin) this.margin = margin;
    this.par = par;
    var noredraw = typeof options == "string" && options.indexOf("noredraw") != -1;
    if (noredraw) this.isDirty = true;
    if (typeof options == "string" && options.indexOf("rdonly") != -1) {
        this.readOnly = true;
        this.canvas = document.createElement("canvas");
        if (!noredraw) {
            this.canvas.width = width * this.dpr;
            this.canvas.height = height * this.dpr;
            this.canvas.style.width = width + "px";
            this.canvas.style.height = height + "px"
        }
        par.appendChild(this.canvas)
    } else {
        pm_eraser = "data:image/gif;base64,R0lGODlhEAAQAPAAAAAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIjjI+pywkPG3BsorfsmXpTfH1dMHKl6EARGF5su42xKjf2jRQAOw==";
        pm_sel_lasso = "data:image/gif;base64,R0lGODlhGAAYAPECAAAAANDQ0P///wAAACH5BAEAAAMALAAAAAAYABgAAAJvnG+hiu2pgFzvBTkxq+cCGn1cMjlRwHmoJVbXysKN6pbmOy+2ueta+oF5AKNOa6BCLWSIl25AJO2akwuy9arKQpjqRyJICpc+5UcQ1qZWETR6WDQG3GnmGkA/xq/zt754cma1J/USRkhiNki4wVcAADs=";
        pm_search = "data:image/gif;base64,R0lGODlhIAAgAPcAAFULDVwYGWUbHWwZGm0fIXMeIX4nK3IqK34uMHoyNHteTnZoU3Z6V3l9W31+ZZIoKJMvMYMxM44yNIM6O4s7PZUxMpg3N5M3OZs3OZQ8PJk7PKM6PKk5OpM+QZo/QaE9Qq4+QItFR5NCRJ1BRJNHSZ9HSZZJSpxLTJxPUZtSUpxaVJZbXJ9aWaJDRqRGSKxHTaVJS6pLTLVER7NITahQTatOUbROUrhPVKdTUK1UVaVcU61dV6tVWKVcW6hdWbVTVrlRVrZWWblVWb1ZXI1hWIFvWIttXZllV5BmXZhnXYxxXI14X6ZgXLRiXKtwX71eYZtkYpVsZJ1rZIB6ZpZ3ZaRpYa1pYa1maK5oabNmZL5jY7NpYrpsZL9naqZ/Zqd/ab1+baN1daR4d6p2eKV6ebB8fcJRU8NVWMFbXsNeYcRhZMRnacpnasNqbMN4bsRucchvcsRxdMpzdsR6ccZ3est3ecR8fIaIYoWMboqPaJiKbJOTa5eZdJ2ddKWAZKuMarWBabqCaa2SbrCDc7CLcaycdK6cerOWd7qXdraZcruYdbuceqCjcaqsd6KiebCieLKofL2pfa2xfbOzfsOGccGKdMmMesWTd8qSd8aXesSafMOifsmjfLN/gcZ7gM1+gKyQjq+Vk6ysgLepgbK0gryzhLW4g76+gb29j7eop7qvrrCzs82HjM2MjdCFh8uagcabnMOrjMOzhs22hsG5htW2icukpcCxsc+8vdK1ttW5ur7BhsbGh8fIhsHEjsvCicXLicnOidPTj8jGksXKkcvMlNfOltPWldHTnNfbm9nbmuHcmN7inuLlm+bonN7hpOPjoufposTHx8jLy9rAwc3S0tDV1dvd3efX2Onb29/g4OTk5Ovg4Ozs7PPz8/j3+Pf5+fv+/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAOIAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAgACAAAAj+AMUJHEiwoMGBQw4qXChuSBqHadSkYagwyMM0GDGiefgEY8KFHNhslJjx4ps4dOywasWKTRohDGGg2bimTRc6nlZ+YhOnzZuXT4QMgblwxJmIdep8ojPs2as5UKEugvbqZJyFETqYkfikaxVRw3zt8uWLGLE+xWQJWRtDIQURMujEeUM3Fi08VZj00MtkCh9jQNb+UBiBBAc5a4dweXbooaZFizRpEZKkGCYgQQYfRGBiA5shoJH5GhJolJUgQXwYygRED7QfsBemaIFGyI1YybKAQfRDCOwgQPxc8mGqVmyFKUbcaKLpGSEgvNb6DrL2RikbVJgFqtFCIYkOMxz+KVP2Y8ulzKhhw1a0hYekaLNeKJyQYYaDPr6ANMk03bf6TU3kkMckpHzgnQgbZGHEMZTkIIsNP9hgQw6wvUDLDIAwU4QKbR10AAkYDGHDHsvEUEgTLrjQQootKGKFDswUkmKHB6VggRAxpLALJyMUEkgLLXywQyReuDALLy3AAIMLIyh0ggczxBDDEs3g0MIRjwgCyR8pfJBIMiqoCGSTB5nQQQtSltCIM5zAQIOUNOggjDNetFACkC2QaVAHGXyw5Al78AIMMMEUGgwjpwgzCBZ5ljCCngXRh0EOKS7QgBJQQBGFEUQowMAdMHjw6KgKHSACBDngeUIOJTjqQw+5V7Awgge00vooBQqJIEEMI+D5aAseKElrB7XSqoEGFyhkggRMjlpssRpA0EEKUJARiioLiYCCBs9aIC0K1V47TTXXaLPNNt1k28MDGZgARRigpCKNNdece243+OLrzTULhXDBKuTWi26++nbjzcHegBMOQxOEcU3BCEcMjsLgcEONLZ0YsNAAtxh88DcThwNONrrAUsYKIRRAAEUCAaBLON5gkwssY6wwQQECsLwQCQkUEIDOQAdNUUAAOw==";
        pm_sel_rect = "data:image/gif;base64,R0lGODlhGAAYAPECAAAAAKCgpP///wAAACH5BAEAAAMALAAAAAAYABgAAAJejI85yxwAo4yh2ZcyqNbt7nEgBi5keY4fuqpil8Kt/F6zXTcxPh6leQNCcqGMYTM0yCYUiOCxUTqMSozgmZT+BsfrFRp0ebHEHmAc/lm/abN1t4W+2zwM/SKCb2GMAgA7";
        pm_cent = "data:image/gif;base64,R0lGODlhEAAQAPAAAAAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIujA+Zx7b8IIpABlov0k3n7zxg9SmjFyoOWqrseokw2aFzFsO6y0F4WEtFgsRAAQA7";
        pm_undo = "data:image/gif;base64,R0lGODlhEAAQAPYAAAAAAAcDBwgAAA4GBhYBBRsCAhQTEhYTEhoXFR4dGyANDignJC8sIysqJzc0JTMyKTw5LDMzMzo5Mj08OEM/L0E7N0pGNFRPOEhFQExJRFNQS2ZHS2lKTmBSTGZXUHFqRmFgWW9gW3BvZnBqaXl4b3p5cIZ9dJOKXIaEe4mHfberdJORhpaUiZuajqGfk6Wjl6ilmaqonK2rnrOwo7i2qby5rL67rs7BhOrbl+3enPblmPTkncjFt8rHucvIus/Nvv/vpv3utf/zvdXSw9jVxdrYyNvZywAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEcALAAAAAAQABAAAAe/gEeCg4SFhoJGPzU9P0SHgh4TApMdM46FRpIvMS8pABEmP4UTBSYwMTU0MBgCLoo+PCMECjM1NT8+PywAFTUOFBAOAQEPEiU+REU+GwIoCSpBQTk3Jww1PkVHRhwCJTQNOEJBOxApPT1G2hwAID8pH0A6FygtQ0OCRQYAIkczCycWSKAyku4IggANWBwhQoOBBhQ97glCYGBACBeCfqBYISOiIA0ZJnhoQWPQEB4+CgrqQUMGDR+EVJr8Ye+RzUAAOw==";
        pm_undo_disabled = "data:image/gif;base64,R0lGODlhEAAQAPUAAEBAQEFBQUJCQkRERElJSUpKSkxMTE5OTlNTU1VVVVZWVlhYWFlZWVxcXF5eXl9fX2JiYmRkZGdnZ2hoaGpqamtra21tbXBwcHJycnR0dHZ2dnd3d3t7e3x8fH9/f4KCgoODg4iIiImJiYyMjI+Pj5GRkZKSkpOTk5SUlJWVlZeXl5qampycnJ2dnZ+fn6KioqOjo6ampqioqKqqqqurq6ysrK2trbCwsLW1tba2tri4uAAAAAAAAAAAAAAAAAAAACH5BAEAADsALAAAAAAQABAAAAafwJ1wSCwahbMYCxabHYWWh2BKQTmLM6lp+xEwPLHiY/DZslamiICkhMEyAgJqxYoxRYLHivF4MAQDfB4wMzYxah8HKDg4NiwgCiuEOzMUAhwrCjY6ODcMH242OzaWFjEgGJ0RH2xXMwQCGTuZHxEeJis2ojuwCiKUmauTQgQEAxgkQjEfIChNQhQQDxYkK0MzoUQwK3MwRLtESTNXT0dBADs=";
        pm_redo = "data:image/gif;base64,R0lGODlhEAAQAPYAAAAAAAYCBwgAAA0FBRcCBhsCAh8MDRYTEhwZFx4dGyooHCgnJC8sIyopJjYzJTMyKTw5KzMzMzo5MkE9LEM/L0E7N0A/OkpGNFVPOEhFQEtIQ1RSSmdITGxMUGdZUm5fWnFqRmZlXXJsanl3b3l4b358cYV8c5SKWoWEeraqc42LgZKQhZaUiZuZjaKglKSilqimmqyqnrOwo7Wzpri2qby5rL27rc3AhOrbl+zdnPfmmcjFt8vIus/Nvv/vpvzttP/zvdLPwNXSw9jVxdrYyNvZywAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEYALAAAAAAQABAAAAe+gEaCg4SFhEM9PDY9RIaDQzIbApMWHo5BJREAKC4wLwIWhUEuAhkwNDYxMCYFoYM2FQAsiUE2NjIGBCI8iigCHDxEQzwlEg8BAQ4QFBMkAh2NRDs2Cic3OT8/KQkhAB2CRDw7KBM6P0A4CzMiAAeNRkJCLSUYOj4gKj0sDQMIgkVEbMAYceHEAhlGXIQYcMCfoCA8UGxgQGOIkRktQkjQsEHQsBgrUAQRxINGjBk8CBURJ+RQjx4WC71zRHNQIAA7";
        pm_redo_disabled = "data:image/gif;base64,R0lGODlhEAAQAPUAAEBAQEFBQUJCQkNDQ0RERElJSUpKSk1NTU5OTlNTU1RUVFZWVlhYWFlZWVxcXF5eXl9fX2JiYmRkZGdnZ2lpaWtra25ubnFxcXJycnR0dHd3d3t7e319fX9/f4GBgYSEhIWFhYeHh4mJiYyMjI+Pj5CQkJKSkpOTk5SUlJeXl5mZmZqampycnJ2dnZ6enqKioqOjo6ampqenp6ioqKqqqqurq6ysrK2trbGxsbW1tbi4uAAAAAAAAAAAAAAAAAAAACH5BAEAADsALAAAAAAQABAAAAaewJ1wSCwSaTJYS0YzDmmpSWAasThlnAbAQyqRAo+i7BsprVqpEocQIbYeAFFS1mqtCgRNsuUJUJhIHA8NUw0Phxt+Nzs0MCsKHi03OTklCBh+Qo0wHg84OTo0CSuJBU07TCQcE58aHjIiCQQIQjc0KyUbER6jOySYBbRCSR4UCitNKyIYDRMTmjApIB6njikrMEcwMKeaSd1Di07jREEAOw==";
        pm_rs = "data:image/gif;base64,R0lGODlhEAAQAPAAAAAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIrhB+pe71vVHwS1GRhy4FX13lYhojjZ20hupnYSkHhFHcjQtF3nbs3GGsFCgA7";
        pm_rs2 = "data:image/gif;base64,R0lGODlhEAAQAPAAADw8PAAAACH5BAEAAAEAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAQABAAAAImhB+pe71vVHwSVFodTm3uiXwWNwadWSJdiXlbxr7ny7i0Xc/tWQAAOw==";
        pm_benzene = "data:image/gif;base64,R0lGODlhFgAWAPYAADExMT4+PkREREVFRUZGRkhISElJSU1NTU5OTk9PT1ZWVlhYWFlZWV1dXV5eXl9eXl9fX25ubm9vb3Nzc3R0dHZ2dnd3d3t7e3x8fICAgIGBgYaGhoeHh4mJiYqKiYqKiouKipKSkZSUlJWVlZmYmJ2dnJ6enaKioaOioqSjo6enpqenp6iop6moqKqpqbOzsrS0s7u7usDAv8HBwMXFxMbFxcrJycvKyszLy9PS0dPT0tTT0tTT09TU09XU09bV1dfW1uvq6QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAEIAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAWABYAAAfRgEKCg4SFhoeEODiIjEI8GAYGGDyNg0AyHQQLKioLBCAyP4wjEAAQJYQlD6YjhT4sCQkdNKJCGhQ0QT80HbErPoIxARs5hS4SACEkgjwbATHBADeIMQkECidCNwDQQjHSQhYpiBsv2tzRi7KV293f6h3s6N4A8JU289/TChvy7uAUsh3qAOPcv2mHql3L1i7YMEqEXExItsyRs24/YMmiAUSQhgm5gNAAoSDBimKEQpQ6lWpVgxCMgMwAoYmTpw4zIFbiccFAAQzAKhlSJLTooUAAOw==";
        pm_r3 = "data:image/gif;base64,R0lGODlhFgAWAPUAACQkJCUlJTExMTw8PEREREVFRUhISExMTE5OTk9PT1FRUVJRUVJSUlVVVVZWVldXV2tra2xra2xsbG1tbG5ubXNzc3R0dHt6ent7e4GBgYKCgoqKiYuLipiYmJmYmJmZmZqamqCfn6GgoKampqmpqKqqqbu6ur++vsDAv8HBwMLBwcPDw8XFxMfGxsfHxsjHx8jIx9HR0NLR0dTT0tXU09fW1QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADYAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAWABYAAAaCQJtwSCwajSvacUlcBRwvJhMlwBgw0iMVNYpYSFkilSWcIBKysG08RG0WnTCb2Ck44lMB2ZiBw5ZzRjIHCCZaekw1IQMRRoFGNSIDE46IRzIIhYd7RX0dnEWPNnUPeICWNisccHKWEwsIaa0rIxMVYGo2J1UFF7lDKwBQv02yxMdCQQA7";
        pm_r4 = "data:image/gif;base64,R0lGODlhFgAWAPQAABwcHB0dHR8fHyAgIDExMVlZWXt7e35+fra2tre3t7u7ur++vsTEw8XFxMrJycvKys7NzQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABEAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAWABYAAAVnYCSOZGmeaAopbOu+LSQqAWHfeE4Aykwkj6BwOEwQehEF4ZEqPY4+ZnP0RCql00g1mhVtk8uuFgrGTr9XsYOc7qLDbjY8+zY362J83EpoiBlsAwWDhIWGBQFICwcGjY6PkAYHC2IpIQA7";
        pm_r5 = "data:image/gif;base64,R0lGODlhFgAWAPUAADExMUBAQEFAQEJCQkNCQkREREZGRkhISElJSU5OTk9PT1NTU1ZWVVdWVlhYWFlZWVxbW15eXl9eXl9fX2BgYGVlZWZmZmxsbHt7e3x8fH9/f4CAgIODg4SDg4WEhIuKipOTk5mYmJ2dnJ6enaenpqiop6+urrCvr7Szs7S0tLW0tLu7usDAv8HBwMXFxMbFxcnJyMvKyszLy9DPztHQz9PT0tTT09XV1NbV1dfW1gAAAAAAAAAAAAAAAAAAAAAAACH5BAEAADoAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAWABYAAAabQJ1wSCwaj8hkcrVSIm0UAIBicw5hH0NHBuMYPjBniiAREUWTQQr5mihOOCPulJi8ih6AZp1EaQAdQiQPFS1WQi0VDyUXCIdFCBcgCzOPQjMLIDogDHGHOAyaOjIIJI8lCDJDGQ+PDxhFFR5WHhVGLAB3SS8AhkYcE0oTGkgoCSjFCnxHJgMhz9DPAydKOBADAwbZ2gYPnpbg4EEAOw==";
        pm_r6 = "data:image/gif;base64,R0lGODlhFgAWAPUAADExMT4+PkZGRkhISElJSU5OTk9PT1hYWFlZWV1dXV5eXl9eXl9fX3t7e3x8fIaGhoeHh4mJiYqKiouKipSUlJWVlZ2dnJ6enaenpqenp6iop7u7usDAv8HBwMXFxMbFxcrJycvKyszLy9PS0dPT0tTT0tTT09TU09XU09bV1dfW1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACsAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAWABYAAAaVwJVwSCwaj0SRCMlcmRwEgsPUHKo4EcEBgzkIJpwUs8IAMCxES5lRKaI0BkPEIy6mPJE4BiXcBB4jVU4PARt9ACGCQiEAhisbiIorjI6QiYqUh5eCmY+RiiCNmpKdlqSinptVpX98VSaEjilwcnRGKh4TeoFEFGULaEMWC2ZtSCodE1pcXhEddVUjDVEO0JIrIqrXikEAOw==";
        pm_r7 = "data:image/gif;base64,R0lGODlhFgAWAPYAACIiIjExMTs7Oz09PT4+PkREREVFRUZGRkdHR0lJSU5OTk9PT1NTU1RUVFVVVVZWVVZWVlhYWFlZWVpaWltbW1xbW15eXl9fX2BgYGJiYmVlZWZmZmhoaGxsbHJycnp6ent6ent7e3x8fH19fYKCgoODg4WFhYaGhomJiYqJiYuKiouLioyMjI2MjI+Pj5KSkZOTkpSTk5SUlJWVlZmYmJ6enaKioqWlpaenpqenp6ioqKqpqa2tra+vrrGxsLOzs7e3trq5ubu7ury7u729vMDAv8XFxMbFxcfHxsrJycvKys3MzNDQz9TT0tTT09TU09XU09bV1NfW1gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFMAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAWABYAAAe2gFOCg4SFhoeESUOIjFNOIgkBGC+Ng1I+BgYSOEklDAUXRYwzFwQ0NYRMNCYBID2GRQAoSYxHEgWGFSaVU1IPLYUGNLxTEiCELwxMxD0FR4MYu8RTFyiCQwG00zoET1MzD97TRAY/TwQ409AdxdbqxdISwNMa0lNLBjbEHB6FJRq8iCzQUQgJASCVWjw41GNBEEYvJDhB9ECEjosYL+JY4IKRFAYCQooUeaxSEyZOnjxxwnJioUAAOw==";
        pm_import = "data:image/gif;base64,R0lGODlhEAAQAPcAAEyXPU6ZP0uSRU6bQlCbQVGbQ1CcQFCdQlCbRFieTVqfTVGQVlSTV2W3TmKmV2OmV2e5UW2/V2uyX22yYW/BWnXGYnnIZX/ObIHRcIjVd4fZeYrZeojce4zafFV+sFaAsleCtFeDtVyDs1iEt1iFuFmHuVqIu1qJvFuLvVuLvlyNwF6Qw1+SxV+SxmCUyGCVyGGWymKYy2KZzGOazmObz2Sd0Wih1G6o426o5G6p5G+p5HOs5Xyz5YKtioKvjo7dgKHbjKLcjafblqfbl5PiiJXjiKrlm6zlna3qn7Huo7rzrIW76ZDF65rO7aPU77HP8K/Q8LHQ8LLR8LPS8rfV8b3a9MLd9cfj9srl99/s/+Hv/+Pu/ubv/ufv/ujx/unx/+jy/uvy/ury/+zz/u3z/uv2/+31/+70/u/1/u72/+73//D1//D2/vH2//H3//L3/vP3/vL3//P3//P4/vP4//T4/vT4//X4//X5//b5//b6//f6//f7//j7//n7//r7//j8//n8//r8//v8//v+//7//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAIYAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAQABAAAAjlAA0ZEvEBBAkTKFSocOECxowaNgR6GESI0CCKFi9erCFxEI6PN3bwWMKkiZNBMzpGWRllCpUqVq5gQSnRT5w4de7UqQMHTp04g2BIjBMmDBk1cdgojUPGjwuJarYYpXMnKRs1avyskNhjwJY4W7rEWaNUzaCthhgMGWBWZ5w7d5DeQWFIwJEkEwYYGBAgQIIBg8yicKCkCIcfGy5YoNAgyABAdwCdIExEQ4cMFyowBjIA7iATdY0gkRBgL4ABf++MARRC4IK1WcYU5VK06B0QEn0MyFImcGC5hD5I9ED8A/Hjxz8EBAA7";
        pm_export = "data:image/gif;base64,R0lGODlhEAAQAPcAAEyXPU6ZP0uSRU6bQlCbQVGbQ1CcQFCdQlCbRFieTVqfTVGQVlSTV2W3TmKmV2OmV2e5UW2/V2uyX22yYW/BWnXGYnnIZX/ObIHRcIjVd4fZeYrZeojce4zafFV+sFaAsleCtFeDtVyDs1iEt1iFuFmHuVqIu1qJvFuLvVuLvlyNwF6Qw1+SxV+SxmCUyGCVyGGWymKYy2KZzGOazmObz2Sd0Wih1G6o426o5G6p5G+p5HOs5Xyz5YKtioKvjouzk4y0k47dgKHbjKLcjafblqfbl5PiiJXjiKrlm6zlna3qn7Huo7rzrIW76ZDF65rO7aPU77HP8K/Q8LHQ8LLR8LPS8rfV8b3a9Mnc3M/f3MLd9cfj9srl99vp/9/s/+Dt/+Hv/+Pu/ubv/ufv/ujx/unx/+jy/uvy/ury/+zz/u3z/un0/+v2/+z0/+31/+70/u/1/u72/+73/+z4//D1//D2/vH2//H3//L3/vP3/vL3//P3//P4/vP4//T4/vT4//X4//X5//b5//T6//b6//f6//f7//j7//n7//r7//j8//n8//r8//v8//v+//7//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAJEAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAQABAAAAjkACNFEvEBxAgTKFSscOEixowaNgR6aIQIUaOLGDHWkNhox42PO3g0cfIESqMZHKVQWVnFyhUtW7g0isGxDaCbN/346dOn0QuJfci0GVqnaB08bRq5kNhmjNA+gJAWhQNoaSQPbcKMwTOgRyM8RZOukAhIaKMDRBjc7APHEIoBCQYEOHAAwYQlSQRkadT27RAIFCxg6NCBwxEmD4AYcjtgSIMIFTBk4KDhcGJAjUzAPQAggGcJSpAIwAIoaQiJabp4STOAyAIyacyQMfRB4hwvYFj7aDSUZ6PaVz14+PBBeHHhxgMCADs=";
        pm_new = "data:image/gif;base64,R0lGODlhEAAQAPEAAE1NTcTExAAAAAAAACH5BAEAAAIALAAAAAAQABAAAAIslI95wA26ggyAQlFnfipLzyEeNVli6TDJWJpRq61wfM6uwaKyHeJpegkKLwUAOw==";
        pm_about = "data:image/gif;base64,R0lGODlhGAAYAPcAABISWRISWhUUXRYUYiMidiopeysqez08d0lIckxLdVNTfFNTfacXG8IOEsYPFOMTF6RmXZFvZLt8fHWLf46Cdx8hgywrgDQzhzs4lD47lSY0qkA+mUE+mkZEiFlZgFZVk3l5nEpToUtHsUtHtlNPs1NQuVVSuGZipnZ0om1run58tkFP2FxsxmVhz2ZizmxoyXRuyXVzwGdj2G1p22dp5XZw7Xh163x27IJ/0oJ88oR/822Zh1qOsXe2pm69vH3juFWMw2KM0GeJ13+D5YuLi4yMjI2NjY6Ojo+Pj5CQkJGRkZOTk5SUlJWVlZaWlpeXl5iYmJmZmZqampubm56enp+fn46ikqGhno2No5+fqZCPvoKir4CssaCgoKGhoaKioqOjo6SkpKWlpaWlpqampqenpqenp6qppampp6ioqKqqq6urq66sq6urrKysrK2tra6urq+vr7yhoK+vsKKhv7CwsLGxsbOzs7S0tLW1tbS0tra2tre3t7u6tLi4uLm5ubm5urq6uru7u768u729vby8vr6+vr+/v4Lpt4SDzJGWzaCfxKaoyLi4wYWC5JGN64aB846J9pmV95qW95aS+J6a+be14K+r8rSw97269LWx+Lm2+JnK18DAwMHBwcLCwsLCw8TExMXFxcbGxsfHx8jIx8zMx8fHyMjIyMnJycrKycnKysrKysvLy8/MyczMzc3Nzc7Ozs/Pz8PD0MzL0svL3tDQ0NDQ0dPT0dHR0tLS0tPT09fX09DQ1NLS1tTU1tbW1tjY1NjY1tHQ29nZ2NnZ2dra2tvb29jY3dzc3MTD48fH5s7O4cXD69Ta5dXU69LQ79jX7t7d6MbE8N3d8+Hh4eLi4ubm5ufn5uLi6e/v6uzs7O3t7eTl/+3w8vb28/f39/r79Pn69/78/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAOUALAAAAAAYABgAAAj+AMsJHEiwoMGDBI08mUKFypQnRhAaNEKFTJo4GOOwQfMliUSBU8jEucPHjyE/g7agyEJmisSQc/gMAjUKlSpXPU4wmtPy4BORfjydiqVLGC86OC4p8zNnjMuEX+Lw8aRq165ZWl7kqKRpGSg/ab5EHDglzR1DqhqB+MChxAwdkzQxU2WIT5qn5YhQieMnFKwFAQq0laEjk7RktkL5ifOFiMAkX87CsqUggIUQiqiNE8etGrBWhu6A8VjuCZo7nmD9UlCBRw8IEpxtxnYMlqc7ZJ4IfJJmKixjMID8iPCgwQQhj7IlgxUKDxooIHunTqZtGicKDhjsQLTCEWJPdp+8JiGD+ve1b+S8ybHiI4gNaMhs2yVtJDJaYNW4gSPXzRGNSJtEAwxdjI2lF1+h2GIMMrWkMIILN1CyyTOJLSYWWWYZEgoWBxCAAQku1DBJM7+cYggedxFERFR8GJKAAAZgIEIilgxjSyvgFVjQT3PogcAAF6RACzG7wHJKJ3zwpJtBP7XRgQaMmFLKKaF4UhdP0CH0kwos9OHHl37ccUccPX1UxBVoXDRSHGmQQYVjHw2k0BR0PgFRnHhKFBAAOw==";
        pm_chain = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjExR/NCNwAAANZJREFUOE+tzj8OAUEUx/F3BJ2STica3XY6F6Cj0WgoJE4hcQidCziGRhQKlQgiIpSS8Z0xu9k/T2O85JPs/N4vsyPGmL9SwxBqGEINQ6hhCDsbtLSlhuniifqXvbR9YaoV0nz3hjEe9lzo+GIFJyzyhRjTxB2RP0f+3Mv0kg+REnZY2+9M6fPDwouYGq6YJFm64AKRFQ5o+HMZ9iWdfNfvqzhi7s75ggtFZjijjwuGWi/G2Ev3WKoFixnghZG2z2PspVt1GbMlLf/GXaotQqhhCDX8nZE354EyLDZ4KlUAAAAASUVORK5CYII=";
        pm_moledit24 = "data:image/gif;base64,R0lGODlhGAAYAPQAAAAAAAwMDBoaGiIiIigoKDMzM0JCQkxMTFlZWWZmZnBwcP+ZAP/MMwAA/4GBgY+Pj5mZmaurq7y8vP+ZmczMzN/f3//MzP//zO/v7/f39wAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABoALAAAAAAYABgAAAWSoCaOZGmeYmUYFepqmAIgSKBgbwkJBiVSBsEjJyoQIplSZDAgApKnDMCpiUxN19fUesq6tl4iCVxqaMw5AM7UaJcSiZIhMCRlzGhRwmKJk5YFEiKCJgkMe30lGA4BNDZregySCRN+JSosb5KSC5ZihpudYiOgnJ5EpQyioxoJF6CrrK6vsawHs6ejB7e5rL6/IyEAOw==";
        pm_r_arrow = "data:image/gif;base64,R0lGODlhBAAIAPAAADw8PAAAACH5BAEAAAEAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAEAAgAAAIJjB9goNy81EIFADs=";
        pm_l_arrow = "data:image/gif;base64,R0lGODlhBAAIAPAAADw8PAAAACH5BAEAAAEAIf4RQ3JlYXRlZCB3aXRoIEdJTVAALAAAAAAEAAgAAAIJjAMHidvp0JkFADs=";
        pm_bo = ["data:image/gif;base64,R0lGODlhEAAQAPAAAAAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIZjI+pyw2dHjxyhjox1M4azoCLqJCRh6ZHAQA7", "data:image/gif;base64,R0lGODlhEAAQAPAAAAAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIdjI+pCrvtEoxnGoswrtJp3z0hM5bBBlKcerGuUQAAOw==", "data:image/gif;base64,R0lGODlhEAAQAPAAAAAAAAAAACH5BAEAAAEALAAAAAAQABAAAAIgjI+pCrsdoItGOohv3Y9blFGd+B1h6XFMOpGt+6pxXAAAOw==", "data:image/gif;base64,R0lGODlhEAAQAPUAADQ0Mzg4Nzo6OT8/PkBAQEFBQUJCQUJCQkNDQ0REREZGRkpKSktLS05OT1BQUVFRUlRUVVhYWVhYWl1dX15eX2NjZWRkZm1tcHBwc3l5fYKCh4yMkYyMko6OlZWVnKCgqLCwuba2wLe3wL+/ycfH0tHR3QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACYALAAAAAAQABAAAAZfQJNwSDRZIKSi0uRxGBqg5bDEMCCeSSnjiuhCpBPutWFZdhTdLsOzHAnSCEZpKTJYEYqJ1CThCjp7GlZ2I3sfbwYRInscVgEae0IOCQYfkSYYBg4clxkAF5dCFxmhQkEAOw=="];
        pm_cross = new Image;
        pm_cross.src = "data:image/gif;base64,R0lGODlhDAAMAPYAAGdoZGdpZWttaGpsaWxtaGxuaWxtam5wbIOFgIOEgYSGgYWHgYaHg4aIg4eIg4eJg4aJhIeKhIiKhYiKhomKh4mMhoqNh4uNh4yOh4qLiIuNiYuNioyNioyPio2Pio2PjI6PjY+PjY+Qio+Ri46QjY+QjY+SjI+SjY+SjpCRjZCQjpCRjpCSjpGSj5KTj5KVj5OVj5KTkJOWkJSXkZSXkpWXkpWWlJeZk5iZlJialZmal5qdlpqdl5mamJucmJuemJufmZycmZydmZ+fnKKjoaanpbG0rLS3r7i7s7m8tLq9tb3AuL3Bub/Du8HEvMPGvsPHv8TIwMXJwcrOxsvOxs3RyQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFYALAAAAAAMAAwAAAd0gEUHNlaFhggGRAZRMimGVi8PSANCJlQ0jlYyHEsTQFYpL1U0ICAmTxwghiAvVEA7TyYcj1YbQFFROxm0VjE3T000KrQpEU04OEoRw4UxD0oiDxEbRwsmVj0IRxcPhRMTRgw4AkYXDI8TEUYBQwYbvCoAQIEAOw==";
        rotateAroundImage = new Image;
        rotateAroundImage.src = "data:image/gif;base64,R0lGODlhEAAQAPAAAMDAwAAAACH5BAAAAAAALAAAAAAQABAAAAImhI9pceGvHHiUoZpkmzbf1SkgJZbmiWbYqYVhw7jvClfxy5FLmhQAOw==";
        this.toolButtons = [];
        this.activeTool = null;
        this.atomDislayMask = 0;
        this.android = navigator.userAgent.match(/Android/i);
        this.iOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);
        var hToolBar, vToolBar, row, cell;
        var tab = document.createElement("table");
        tab.style.backgroundColor = "#efefef";
        tab.style.width = "1%";
        var tbo = document.createElement("tbody");
        this.toolBars = [];
        var toolFunc = function (ev) {
            that.toolButtonClicked(this)
        };
        var simpleToolBarMode = typeof options == "string" && options.indexOf("simpleToolbar") != -1;
        row = document.createElement("tr");
        var hToolBar = document.createElement("td");
        this.hToolBar = hToolBar;
        this.toolBars.push(hToolBar);
        this.bUndo = this.addToolButton(hToolBar, pm_undo_disabled, "undo", "Undo", function (ev) {
            that.undo()
        });
        this.bRedo = null;
        if (!simpleToolBarMode) this.bRedo = this.addToolButton(hToolBar, pm_redo_disabled, "undo", "Redo", function (ev) {
            that.redo()
        });
        this.addToolButton(hToolBar, pm_cent, "center", "Center", function (ev) {
            that.drawMol(true)
        });
        if (!simpleToolBarMode) this.addToolButton(hToolBar, pm_rs2, "rs", "Toggle R/S labels", function (ev) {
            that.atomDislayMask ^= ATOM_DISPLAY_RS;
            that.drawMol()
        });
        this.addToolButton(hToolBar, pm_new, "new", "Clear", function (ev) {
            that.clearMol()
        });
        this.addToolButton(hToolBar, pm_import, "import", "Import", function (ev) {
            that.importMol()
        });
        this.addToolButton(hToolBar, pm_export, "export", "Export", function (ev) {
            that.exportMol()
        });
        if (!simpleToolBarMode) {
            this.addToolButton(hToolBar, pm_about, "about", "About", function (ev) {
                that.about()
            });
            this.addToolButton(hToolBar, pm_moledit24, "depict", "2D Cleanup/Depiction", function (ev) {
                that.assignCoordinates()
            });
            this.addToolButton(hToolBar, Module.locationPrefix + "/icons/pm_full_screen2.png", "full", "Toggle Fullscreen", function (ev) {
                Module.toggleFullscreen(that, that.par)
            })
        }
        this.searchInput = null;
        this.search_panel = null;
        this.req = null;
        this.offsetSearchWidth = width;
        if (true) {
            this.searchTool = this.addSearch(hToolBar, pm_search, "search", "Chemical Dictionary Search", function (ev) {
                that.search_panel.style.display = that.search_panel.style.display == "none" ? "block" : "none";
                if (that.search_panel.style.display == "block") that.searchInput.focus();
                if (that.search_panel.style.display == "none") {
                    that.searchInput.value = null;
                    while (that.dropDown.firstChild) {
                        that.dropDown.removeChild(that.dropDown.firstChild)
                    }
                }
            });
            {
                var searchWidth = 340;
                that.search_panel = document.createElement("div");
                that.search_panel.style.cssText = "position:absolute; top:33px; left:-220px; width:" + searchWidth + "px; height:35px; background-color:#efefef;";
                that.searchInput = document.createElement("input");
                that.searchInput.type = "text";
                that.searchInput.style.padding = "4px";
                that.searchInput.style.width = "87%";
                that.searchInput.placeholder = "Enter molecule name here...";
                that.search_panel.appendChild(that.searchInput);
                this.inputText = "";
                this.dropDown = document.createElement("div");
                this.dropDown.style.cssText = "position:absolute; top:35px; width:" + (searchWidth - 6) + "px; height:" + that.dropSize * 25 + "px; right:0px; border-style:solid; border-color:#efefef; overflow:auto; background-color:white;";
                that.searchInput.onkeyup = function (e) {
                    var c = String.fromCharCode(e.keyCode);
                    var re = /\w|[\b]/;
                    if (re.test(c)) {
                        that.parseSearch(this.value + "*")
                    }
                    that.inputText = this.value;
                    if (that.inputText.length == 0) that.dropDown.style.height = "0px"
                };
                if ((that.searchInput.value == "" || that.searchInput.value == null) && that.dropDown.parentNode) {
                    that.search_panel.removeChild(that.dropDown)
                } else {
                    that.search_panel.appendChild(that.dropDown)
                }
                that.search_panel.style.display = "none";
                this.searchTool.search_panel = that.search_panel;
                this.searchTool.div.appendChild(that.search_panel)
            }
        }
        hToolBar.align = "center";
        hToolBar.style.textAlign = "center";
        row.appendChild(hToolBar);
        tbo.appendChild(row);
        row = document.createElement("tr");
        var vToolBarCss = "width: 36px; border-spacing: 2px; border-collapse: separate;";
        cell = document.createElement("td");
        {
            var tab2 = document.createElement("table");
            tab2.style.cssText = vToolBarCss;
            vToolBar = document.createElement("tbody");
            this.toolBars.push(vToolBar);
            this.addEditToolAtom(vToolBar, "C", "Carbon", toolFunc);
            this.addEditToolAtom(vToolBar, "N", "Nitrogen", toolFunc);
            this.addEditToolAtom(vToolBar, "O", "Oxygen", toolFunc);
            this.addEditToolAtom(vToolBar, "F", "Fluorine", toolFunc);
            this.addEditToolAtom(vToolBar, "P", "Phosphorus", toolFunc);
            this.addEditToolAtom(vToolBar, "S", "Sulfur", toolFunc);
            this.addEditToolAtom(vToolBar, "H", "Hydrogen", toolFunc);
            var panel = null, input = null;
            this.customElement = this.addEditToolAtom(vToolBar, "[..]", "Custom Element", function (ev) {
                if (typeof ev.target.toolType != "undefined") {
                    that.toolButtonClicked(null);
                    panel.style.display = panel.style.display == "none" ? "block" : "none";
                    if (panel.style.display == "block") input.focus()
                }
            });
            {
                panel = document.createElement("div");
                panel.style.position = "absolute";
                panel.style.top = "0px";
                panel.style.left = "32px";
                panel.style.width = "250px";
                var optTable = document.createElement("table");
                optTable.style.cssText = "width: 100%; border-spacing: 2px; border-collapse: separate; border:2px solid gray; border-radius:5px; background-color:#efefef";
                var optTableBody = document.createElement("tbody");
                optTable.appendChild(optTableBody);

                function addRow(e1, e2, e3) {
                    var row = document.createElement("tr");
                    var cell = document.createElement("td");
                    cell.style.textAlign = "left";
                    if (typeof e1 == "string") cell.innerHTML = e1; else cell.appendChild(e1);
                    row.appendChild(cell);
                    var cell = document.createElement("td");
                    cell.style.textAlign = "left";
                    cell.appendChild(e2);
                    row.appendChild(cell);
                    if (e3 != null) {
                        var cell2 = document.createElement("td");
                        cell2.style.textAlign = "right";
                        cell2.appendChild(e3);
                        row.appendChild(cell2)
                    } else cell.colSpan = 2;
                    optTableBody.appendChild(row)
                }

                function addOption(sm, label, list) {
                    var opt = document.createElement("select");
                    for (var i = 0; i < list.length; i++) {
                        var optn = document.createElement("option");
                        optn.text = list[i];
                        optn.value = list[i];
                        opt.options.add(optn)
                    }
                    addRow(label, opt, null);
                    opt.sm = sm;
                    return opt
                }

                input = document.createElement("input");
                input.type = "text";
                input.style.width = "130px";
                input.placeholder = "Element(H,Br,Si)";
                var button = document.createElement("input");
                button.type = "button";
                button.value = "OK";
                button.onclick = function (ev) {
                    that.customAtomSelected(that.customElement)
                };
                input.onkeydown = function (ev) {
                    if (ev.keyCode == 13) that.customAtomSelected(that.customElement)
                };
                addRow(input, button, pm_cross);
                pm_cross.style.cssText = "border:2px solid gray; border-radius:5px; padding:2px";
                pm_cross.onmouseover = function (ev) {
                    this.style.borderColor = "black"
                };
                pm_cross.onmouseout = function (ev) {
                    this.style.borderColor = "gray"
                };
                pm_cross.onclick = function (ev) {
                    that.toolButtonClicked(null)
                };
                panel.input = input;
                panel.H = addOption("H", "Hydrogen Count", ["any", "0", "1", "2", "3"]);
                panel.D = addOption("D", "Heavy Count", ["any", "1", "2", "3"]);
                panel.R = addOption("R", "Ring Count", ["any", "0", "1", "2", "3"]);
                panel.H.onchange = panel.D.onchange = panel.R.onchange = function () {
                    var atsm = panel.input.value;
                    var val = "";
                    if (this.selectedIndex != 0) val = this.sm + this.options[this.selectedIndex].value;
                    var rx = new RegExp(this.sm + "[0-9]");
                    if (atsm.match(rx)) {
                        atsm = atsm.replace(rx, val)
                    } else {
                        if (!atsm.length) atsm = sprintf("[%s]", val); else if (atsm.match(/\[(.*)\]/)) atsm = atsm.replace(/\[(.*)\]/, "[$1;" + val + "]"); else atsm = sprintf("[%s;%s]", atsm, val)
                    }
                    atsm = atsm.replace(/;+/, ";");
                    panel.input.value = atsm
                };
                panel.getSearchAtts = function () {
                    var res = {};
                    if (this.H.selectedIndex) res.H = parseInt(this.H.options[this.H.selectedIndex].value);
                    if (this.D.selectedIndex) res.D = parseInt(this.D.options[this.D.selectedIndex].value);
                    if (this.R.selectedIndex) res.R = parseInt(this.R.options[this.R.selectedIndex].value);
                    return res
                };
                panel.appendChild(optTable);
                panel.style.display = "none";
                this.customElement.panel = panel;
                this.customElement.div.appendChild(panel)
            }
            {
                var impexp = document.createElement("div");
                impexp.style.position = "absolute";
                impexp.style.top = 0;
                impexp.style.left = 0;
                impexp.style.width = width + "px";
                impexp.style.height = height + "px";
                var text = document.createElement("textarea");
                text.rows = 20;
                text.style.width = "100%";
                impexp.appendChild(text);
                var about = document.createElement("div");
                about.style.cssText = sprintf("vertical-align: middle; text-align:center; width:%dpx; height:%dpx; border:2px solid gray; border-radius:5px; background-color:#efefef", width, height / 2);
                about.innerHTML = sprintf('<p></p><p><h3>Web Molecular Editor v1.5.2</h3></p><p style="font-size:smaller;">Authors: Eugene Raush, Max Totrov, Ruben Abagyan.</p><p style="font-size:smaller;">&copy; Copyright %d, MolSoft L.L.C.</p>', (new Date).getFullYear());
                impexp.about = about;
                var hlay = document.createElement("div");
                hlay.style.width = "100%";
                hlay.style.textAlign = "center";
                impexp.appendChild(hlay);
                var ok = document.createElement("input");
                ok.type = "button";
                ok.value = "OK";
                hlay.appendChild(ok);
                var cancel = document.createElement("input");
                cancel.type = "button";
                cancel.value = "Cancel";
                hlay.appendChild(cancel);
                var kekuleLabel = document.createElement("label");
                kekuleLabel.textContent = "Kekule";
                var kekule = document.createElement("input");
                kekule.type = "checkbox";
                kekule.value = "Kekule";
                kekuleLabel.appendChild(kekule);
                hlay.appendChild(kekuleLabel);
                impexp.style.display = "none";
                impexp.ok = ok;
                impexp.cancel = cancel;
                impexp.kekule = kekuleLabel;
                impexp.text = text;
                impexp.hlay = hlay;
                this.impexp = impexp;
                this.impexp.cancel.onclick = function (ev) {
                    that.impexp.style.display = "none"
                }
            }
            if (simpleToolBarMode) {
                var m = this.addEditToolGeneral(vToolBar, pm_bo[0], "bond", "bond tool", toolFunc, "left");
                this.addEditToolGeneralMenu(m, pm_bo[0], "bond_1", "single bond", toolFunc);
                this.addEditToolGeneralMenu(m, pm_bo[1], "bond_2", "double bond", toolFunc);
                this.addEditToolGeneralMenu(m, pm_bo[2], "bond_3", "tripple bond", toolFunc);
                this.addEditToolGeneralMenu(m, pm_bo[3], "bond_4", "Up/Down bond", toolFunc)
            } else {
                this.addEditToolBond(vToolBar, 1, "Single", toolFunc);
                this.addEditToolBond(vToolBar, 2, "Double", toolFunc);
                this.addEditToolBond(vToolBar, 3, "Tripple", toolFunc);
                this.addEditToolBond(vToolBar, 4, "Up/Down Toggle", toolFunc);
                this.addEditToolGeneral(vToolBar, "&rArr;", "text_arrow", "add arrow", toolFunc)
            }
            tab2.appendChild(vToolBar);
            cell.appendChild(tab2);
            cell.vAlign = "top";
            cell.style.verticalAlign = "top"
        }
        row.appendChild(cell);
        cell = document.createElement("td");
        var beforeCanvasDiv = document.createElement("div");
        beforeCanvasDiv.style.position = "relative";
        this.canvas = document.createElement("canvas");
        this.canvas.style.backgroundColor = "#ffffff";
        this.canvas.style.display = "inherit";
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.onselectstart = function () {
            return false
        };
        cell.appendChild(beforeCanvasDiv);
        cell.appendChild(this.canvas);
        row.appendChild(cell);
        cell = document.createElement("td");
        {
            var tab3 = document.createElement("table");
            tab3.style.cssText = vToolBarCss;
            vToolBar2 = document.createElement("tbody");
            this.toolBars.push(vToolBar);
            {
                var m = this.addEditToolGeneral(vToolBar2, pm_sel_rect, "rect", "Rectangular Selection", toolFunc, "right");
                this.addEditToolGeneralMenu(m, pm_sel_rect, "rect", "Rectangular Selection", toolFunc);
                this.addEditToolGeneralMenu(m, pm_sel_lasso, "lasso", "Lasso Selection", toolFunc)
            }
            this.addEditToolGeneral(vToolBar2, pm_eraser, "eraser", "Eraser Tool", toolFunc);
            this.addEditToolGeneral(vToolBar2, "-/+", "qfm", "charge", toolFunc);
            this.addEditToolGeneral(vToolBar2, "<sup>13</sup>C", "wtdf", "isotope", toolFunc);
            this.addEditToolGeneral(vToolBar2, "<b>T</b>", "text", "add text", toolFunc);
            this.addEditToolGeneral(vToolBar2, pm_benzene, "frag_0", "benzene", toolFunc);
            this.addEditToolGeneral(vToolBar2, pm_r5, "frag_3", "cyclopentane", toolFunc);
            if (simpleToolBarMode) {
                var m = this.addEditToolGeneral(vToolBar2, pm_r4, "frag_2", "cyclobutane", toolFunc, "right");
                this.addEditToolGeneralMenu(m, pm_r3, "frag_1", "cyclopropane", toolFunc);
                this.addEditToolGeneralMenu(m, pm_r4, "frag_2", "cyclobutane", toolFunc);
                this.addEditToolGeneralMenu(m, pm_r6, "frag_4", "cyclohexane", toolFunc);
                this.addEditToolGeneralMenu(m, pm_r7, "frag_5", "cycloheptane", toolFunc)
            } else {
                this.addEditToolGeneral(vToolBar2, pm_r3, "frag_1", "cyclopropane", toolFunc);
                this.addEditToolGeneral(vToolBar2, pm_r4, "frag_2", "cyclobutane", toolFunc);
                this.addEditToolGeneral(vToolBar2, pm_r6, "frag_4", "cyclohexane", toolFunc);
                this.addEditToolGeneral(vToolBar2, pm_r7, "frag_5", "cycloheptane", toolFunc)
            }
            this.addEditToolGeneral(vToolBar2, pm_chain, "chain", "Chain", toolFunc);
            tab3.appendChild(vToolBar2);
            cell.appendChild(tab3);
            cell.vAlign = "top";
            cell.style.verticalAlign = "top"
        }
        row.appendChild(cell);
        tbo.appendChild(row);
        {
            var r = document.createElement("tr");
            var c = document.createElement("td");
            this.hStatusBar = document.createElement("div");
            c.colSpan = row.cells.length;
            c.appendChild(this.hStatusBar);
            r.appendChild(c);
            tbo.appendChild(r);
            this.hStatusBar.style.height = "20px"
        }
        hToolBar.colSpan = row.cells.length;
        tab.appendChild(tbo);
        par.style.position = "relative";
        par.appendChild(tab);
        beforeCanvasDiv.appendChild(this.impexp);
        if (this.iOS || this.android) {
            this.canvas.addEventListener("touchstart", function (ev) {
                that.onMouseDown(ev, true)
            }, false);
            this.canvas.addEventListener("touchend", function (ev) {
                that.onMouseUp(ev)
            }, false);
            this.canvas.addEventListener("touchmove", function (ev) {
                that.onMouseMove(ev, true)
            }, true);
            document.body.addEventListener("touchcancel", function (ev) {
                that.onMouseUp(ev)
            }, false)
        } else {
            this.canvas.addEventListener("mousedown", function (ev) {
                that.onMouseDown(ev, false)
            }, false);
            this.canvas.addEventListener("mouseup", function (ev) {
                that.onMouseUp(ev)
            }, false);
            this.canvas.addEventListener("mousemove", function (ev) {
                that.onMouseMove(ev, false)
            }, false);
            this.canvas.addEventListener("dblclick", function (ev) {
                that.onMouseDoubleClick(ev, false)
            }, false)
        }
        this.canvas.addEventListener("keydown", function (ev) {
            that.onKeyPress(ev)
        }, false);
        this.canvas.setAttribute("tabindex", "0");
        this.canvas.focus();
        window.addEventListener("resize", function () {
            that.updateLayout()
        })
    }
    this.bgDark = false;
    this.disabled = false;
    this.nobackground = false;
    this.optsubpixel = false;
    this.thinbondline = false;
    if (typeof options == "string") {
        if (options.indexOf("bgdark") != -1) this.bgDark = true;
        if (options.indexOf("disabled") != -1) this.disabled = true;
        if (options.indexOf("nobackground") != -1) this.nobackground = true;
        if (options.indexOf("optsubpixel") != -1) this.optsubpixel = true;
        if (options.indexOf("thinbondline") != -1) this.thinbondline = true
    }
    this.undoStack = [];
    this.redoStack = [];
    this.chem = new Chemical;
    this.chemIsReady = true;
    this.ctx = null;
    this.dragAtoms = [];
    this.dragText = [];
    this.lastPos = null;
    this.lastPosArr = [];
    this.endPos = null;
    this.lassoPath = [];
    this.h_atom = -1;
    this.h_bond = -1;
    this.h_text = -1;
    this.rotateAroundPoint = null;
    this.connectToAtom = -1;
    this.button = -1;
    this.updateZoom = true;
    this.mode = 0;
    this.onchange = null;
    this.kfc = 40;
    this.dx = this.dy = 0;
    this.ctx = this.canvas.getContext("2d");
    if (typeof chemString == "object") {
        this.chem.copyFromChem(chemString);
        if (!noredraw) that.drawMol()
    } else if (chemString != "") {
        if (!Module.chem) {
            console.log(chemString);
            Module.delayedImportData[Module.delayedImportData.length] = {moledit: this, data: chemString};
            console.log(Module.delayedImportData.length)
        } else {
            this.chemIsReady = false;
            this.chem.parseString(chemString, function () {
                that.chemIsReady = true;
                if (!noredraw) that.drawMol()
            })
        }
    } else {
        if (!noredraw) this.drawMol()
    }
    return this
}

ChemicalView.prototype.showStatus = function (msg) {
    this.hStatusBar.innerHTML = msg
};
ChemicalView.prototype.clearStatus = function () {
    this.hStatusBar.innerHTML = ""
};
ChemicalView.prototype.exportToMesh = function (format) {
    var that = this;
    var formData = new FormData;
    formData.append("smi", this.getSmiles());
    formData.append("fmt", format);
    var req = new XMLHttpRequest;
    req.open("POST", "https://molsoft.com/cgi-bin/smi2obj.cgi");
    req.onload = function (oEvent) {
        var str = this.responseText;
        var a = document.createElement("a"), url = URL.createObjectURL(new Blob([str], {type: "text/plain"}));
        a.href = url;
        a.download = "export." + format;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url)
        }, 0)
    };
    req.send(formData)
};
ChemicalView.prototype.outOfBounds = function () {
    for (var i = 0; i < this.chem.atoms.length; i++) {
        var p = this.wtos(this.chem.atoms[i]);
        if (p.x < 0 || p.x > this.canvasWidth() || p.y < 0 || p.y > this.canvasHeight()) return true
    }
    return false
};
ChemicalView.prototype.setOccupancy = function (ms, oc) {
    for (var i = 0; i < this.chem.atoms.length; i++) {
        if (!ms || this.chem.atoms[i].ms & ms) this.chem.atoms[i].oc = oc
    }
    this.drawMol()
};
ChemicalView.prototype.setDegreeAsDrawn = function (ms, on) {
    for (var i = 0; i < this.chem.atoms.length; i++) {
        if (!ms || this.chem.atoms[i].ms & ms) {
            if (typeof this.chem.atoms[i].atts == "undefined") {
                if (on) {
                    this.chem.atoms[i].atts = {};
                    this.chem.atoms[i].atts.D = -1
                }
            } else {
                if (on) this.chem.atoms[i].atts.D = -1; else delete this.chem.atoms[i].atts.D
            }
        }
    }
    this.chem.calcBox();
    this.drawMol(true)
};
ChemicalView.prototype.setOrangeSelection = function (on) {
    this.chem.setAtomSelection(M_CE, M_CE2, on);
    this.chem.setAtomSelection(M_CE, M_CE, false);
    this.chem.setBondSelection(M_CE, M_CE, false);
    this.drawMol()
};
ChemicalView.prototype.updateLayout = function () {
    var width = this.par.clientWidth - 88;
    var height = this.par.clientHeight - 76;
    this.resizeCanvas(width, height)
};
ChemicalView.prototype.resizeCanvas = function (width, height, noredraw) {
    if (width) {
        this.canvas.width = width * this.dpr;
        this.canvas.style.width = width + "px"
    }
    if (height) {
        this.canvas.height = height * this.dpr;
        this.canvas.style.height = height + "px"
    }
    if (noredraw) this.isDirty = true; else this.drawMol(true)
};
ChemicalView.prototype.toolButtonCss = function (size) {
    return sprintf("text-align:center; width: %dpx; height: %dpx; cursor:default; border:2px solid gray; border-radius:5px;vertical-align: middle", size, size)
};
ChemicalView.prototype.assignOverOut = function (cell) {
    var that = this;
    cell.onmouseover = function (ev) {
        that.showStatus(cell.alt)
    };
    cell.onmouseout = function (ev) {
        that.clearStatus()
    }
};
ChemicalView.prototype.addToolButtonMenu = function (toolBar, imgsrc, alt) {
    var tmpDiv = document.createElement("div");
    tmpDiv.style.cssText = ";position:relative; display:inline-block;";
    var img = new Image;
    img.src = imgsrc;
    img.title = alt;
    var menu = document.createElement("ul");
    menu.style.cssText = "list-style: none; padding: 0; margin: 0 auto; display:clock; position:absolute; left:-100px;";
    for (var i = 0; i < 5; i++) {
        var item = document.createElement("li");
        item.style.cssText = "float: left;margin: 0;padding: 0;";
        item.innerHTML = "item " + i;
        menu.appendChild(item)
    }
    img.onclick = function (ev) {
    };
    this.assignOverOut(img);
    img.style.cssText = this.toolButtonCss(22) + ";padding: 4px; margin: 1px;";
    img.toolType = ty;
    tmpDiv.appendChild(img);
    toolBar.appendChild(tmpDiv);
    img.div = tmpDiv;
    img.alt = alt;
    this.assignOverOut(img);
    tmpDiv.appendChild(menu);
    return img
};

function imgFromSrc(imgSrc, alt) {
    var img = new Image;
    img.src = imgSrc;
    img.alt = alt;
    return img
}

ChemicalView.prototype.addEditToolGeneralMenu = function (menu, imgSrc, ty, alt, func) {
    var item = document.createElement("li");
    item.style.cssText = sprintf("float: %s;margin: 1px;padding: 2px; border:2px solid gray; border-radius:5px;", menu.menuFloat);
    if (imgSrc.indexOf("data:image/gif") == 0) item.innerHTML = sprintf("<img width=%d height=%d src='", ICON_SIZE - 4, ICON_SIZE - 4) + imgSrc + "' />"; else item.innerHTML = imgSrc;
    menu.appendChild(item);
    menu.items[menu.items.length] = {img: imgFromSrc(imgSrc, alt), toolType: ty};
    var ww = (ICON_SIZE + 10) * menu.childNodes.length;
    menu.style.width = sprintf("%dpx", ww);
    menu.style[menu.menuFloat == "left" ? "right" : "left"] = sprintf("%dpx", -ww - 10);
    var that = this;
    item.onclick = function () {
        that.menuItemSelected(menu, this)
    };
    this.updateMenuImage(menu)
};
ChemicalView.prototype.menuItemSelected = function (menu, item) {
    for (var i = 0; i < menu.childNodes.length; i++) if (menu.childNodes[i] == item) {
        menu.current = i;
        break
    }
    this.updateMenuImage(menu);
    menu.cell.menu.clickedItem = item
};
ChemicalView.prototype.updateMenuImage = function (menu) {
    if (menu.current >= menu.childNodes.length) return;
    if (menu.items[menu.current].img != menu.cell.childNodes[2]) menu.cell.replaceChild(menu.items[menu.current].img, menu.cell.childNodes[2]);
    menu.cell.toolType = menu.items[menu.current].toolType
};
ChemicalView.prototype.addEditToolGeneral = function (toolBar, imgSrc, ty, alt, func, isMenu) {
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var img = null;
    var result = cell;
    if (imgSrc.indexOf("data:image/gif") == 0) {
        img = imgFromSrc(imgSrc, alt)
    } else cell.innerHTML = imgSrc;
    if (typeof isMenu == "undefined") {
        cell.onclick = func;
        cell.toolType = ty
    } else {
        img = new Image;
        var menuDiv = document.createElement("div");
        menuDiv.style.cssText = "position:relative;";
        var menu = document.createElement("ul");
        menu.style.cssText = "list-style: none; padding: 0; margin: 0 auto; display:block; position:absolute; top: -6px;  background-color: white";
        cell.appendChild(menuDiv);
        cell.appendChild(imgFromSrc(isMenu == "left" ? pm_l_arrow : pm_r_arrow, ""));
        menuDiv.appendChild(menu);
        menuDiv.style.display = "none";
        menuDiv.menu = menu;
        cell.menu = menuDiv;
        menu.menuFloat = isMenu;
        cell.toolType = ty;
        cell.onclick = func;
        menu.current = 0;
        menu.clickedItem = null;
        menu.items = [];
        result = menu;
        menu.cell = cell
    }
    this.toolButtons.push(cell);
    cell.alt = alt;
    cell.style.cssText = this.toolButtonCss(ICON_SIZE);
    if (img != null) cell.appendChild(img);
    this.assignOverOut(cell);
    row.appendChild(cell);
    toolBar.appendChild(row);
    return result
};
ChemicalView.prototype.addEditToolBond = function (toolBar, ty, alt, func) {
    var row = document.createElement("tr");
    row.style.height = ICON_SIZE;
    var cell = document.createElement("td");
    var img = new Image;
    img.src = pm_bo[ty - 1];
    img.title = alt;
    cell.onclick = func;
    cell.toolType = "bond_" + ty;
    cell.alt = alt;
    cell.style.cssText = this.toolButtonCss(ICON_SIZE);
    cell.onclick = func;
    cell.appendChild(img);
    this.assignOverOut(cell);
    row.appendChild(cell);
    toolBar.appendChild(row);
    this.toolButtons.push(cell);
    return cell
};
ChemicalView.prototype.addEditToolAtom = function (toolBar, text, alt, func) {
    return this.addEditTool(toolBar, "atom", text, alt, func)
};
ChemicalView.prototype.addEditTool = function (toolBar, type, text, alt, func) {
    var row = document.createElement("tr");
    row.style.height = ICON_SIZE;
    var td = document.createElement("td");
    var cell = document.createElement("div");
    cell.innerHTML = text;
    td.toolType = type;
    cell.toolType = td.toolType;
    td.cd = text;
    var color = this.atomColors[text];
    if (typeof color == "undefined") color = "#000000";
    td.style.cssText = this.toolButtonCss(ICON_SIZE);
    cell.style.cssText = ";position:relative;vertical-align: middle;";
    cell.style.textAlign = "center";
    td.onclick = func;
    td.alt = alt;
    this.assignOverOut(td);
    td.div = cell;
    td.appendChild(cell);
    row.appendChild(td);
    toolBar.appendChild(row);
    this.toolButtons.push(td);
    return td
};
ChemicalView.prototype.setToolButtonVisible = function (ty, on) {
    var b = this.findToolButton(ty);
    if (b) b.style.display = on ? "block" : "none"
};
ChemicalView.prototype.findToolButton = function (ty) {
    for (var i = 0; i < this.toolButtons.length; i++) {
        if (this.toolButtons[i].toolType == ty) return this.toolButtons[i]
    }
    return null
};
ChemicalView.prototype.addToolButton = function (toolBar, imgsrc, ty, alt, func) {
    var tmpDiv = document.createElement("div");
    tmpDiv.style.cssText = ";position:relative; display:inline-block;";
    var img = new Image;
    img.src = imgsrc;
    img.title = alt;
    img.onclick = func;
    this.assignOverOut(img);
    img.style.cssText = this.toolButtonCss(22) + ";padding: 4px; margin: 1px;";
    img.toolType = ty;
    tmpDiv.appendChild(img);
    toolBar.appendChild(tmpDiv);
    img.div = tmpDiv;
    img.alt = alt;
    this.assignOverOut(img);
    return img
};
ChemicalView.prototype.addSearch = function (toolBar, imgsrc, ty, alt, func) {
    var tmpDiv = document.createElement("div");
    tmpDiv.style.cssText = ";position:relative; display:inline-block;";
    var img = new Image;
    img.src = imgsrc;
    img.title = alt;
    img.onclick = func;
    this.assignOverOut(img);
    img.style.cssText = "text-align:center; width: 22px; height: 22px; cursor:default; border:2px solid gray; border-radius:5px;vertical-align: middle; padding: 4px; margin: 1px;";
    img.toolType = ty;
    tmpDiv.appendChild(img);
    toolBar.appendChild(tmpDiv);
    img.div = tmpDiv;
    return img
};
ChemicalView.prototype.customAtomSelected = function (button) {
    var match;
    var str = this.customElement.panel.input.value;
    var atomName = null;
    var re = /([^\[\];]+);?/g;
    var reR = /R[0-9]/;
    var sm = false;
    while (match = re.exec(str)) {
        sm = true;
        if (match[1] in Elements && !match[1].match(reR)) atomName = match[1]
    }
    if (sm) {
    } else {
        if (str in Elements) atomName = str
    }
    this.toolButtonClicked(button);
    this.activeTool.cd = atomName
};
ChemicalView.prototype.toolButtonClicked = function (button) {
    this.customElement.panel.style.display = "none";
    if (this.activeTool == button) {
        this.activeTool = null;
        if (button && typeof button.menu != "undefined") {
            if (button.menu.clickedItem != null) {
                this.activeTool = button
            }
            button.menu.style.display = "none";
            button.menu.clickedItem = null
        }
    } else {
        this.activeTool = button;
        if (button) this.activeTool.firstUse = true;
        if (button && typeof button.menu != "undefined") button.menu.style.display = "block"
    }
    for (var i = 0; i < this.toolButtons.length; i++) {
        var b = this.toolButtons[i];
        b.style.borderStyle = b == this.activeTool ? "inset" : "solid";
        b.style.borderColor = b == this.activeTool ? "white" : "gray";
        b.style.backgroundColor = b == this.activeTool ? "#D1D1D1" : "transparent";
        if (typeof b.menu != "undefined" && b != this.activeTool) b.menu.style.display = "none"
    }
};
ChemicalView.prototype.isEmpty = function () {
    return this.chem.atoms.length == 0
};
ChemicalView.prototype.changed = function () {
    if (this.readOnly) return;
    this.bUndo.src = this.undoStack.length > 0 ? pm_undo : pm_undo_disabled;
    if (this.bRedu != null) this.bRedo.src = this.redoStack.length > 0 ? pm_redo : pm_redo_disabled;
    if (this.onchange != null) {
        if (typeof this.onchange == "function") this.onchange(); else if (typeof this.onchange == "string") eval(this.onchange)
    }
};
ChemicalView.prototype.undoPush = function () {
    this.undoStack.push(cloneObject(this.chem))
};
ChemicalView.prototype.parseSearch = function (input) {
    if (this.req != null) {
        this.req.abort()
    }
    this.req = getXMLObject(true);
    var molidNum;
    var that = this;
    var row = -1;
    var liArr = [];
    var tmp = input.replace("*", "");
    var color = "rgb(135, 206, 255)";
    var clearList = function () {
        while (that.dropDown.firstChild) {
            that.dropDown.removeChild(that.dropDown.firstChild)
        }
        that.dropDown.style.height = "0px"
    };

    function getPosition(element) {
        var xPosition = 0;
        var yPosition = 0;
        while (element) {
            xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
            yPosition += element.offsetTop - element.scrollTop + element.clientTop;
            element = element.offsetParent
        }
        return {x: xPosition, y: yPosition}
    }

    var onLoadFunc = function (searchType) {
        return function (e) {
            var a = eval("(" + this.responseText + ")");
            if (searchType != "pubchem") {
                a.molecule_name[a.molecule_name.length] = sprintf("Search '%s' in Pubchem", tmp);
                a.molid[a.molid.length] = 0;
                a.synonym[a.synonym.length] = ""
            }
            var ofs = 0;
            liArr = [];
            clearList();
            for (var i = 0; i < a.molecule_name.length; i++) {
                liArr[ofs + i] = document.createElement("p");
                liArr[ofs + i].innerHTML = a.molecule_name[i];
                that.dropDown.appendChild(liArr[ofs + i]);
                liArr[ofs + i].style.cssText = "text-align:left; font-size:17px; margin:5px;";
                liArr[ofs + i].onmouseover = function (ev) {
                    for (var i = 0; i < liArr.length; i++) {
                        if (liArr[i].style.backgroundColor == color) {
                            liArr[i].style.backgroundColor = "#fff"
                        }
                    }
                    this.style.backgroundColor = color;
                    this.style.cursor = "pointer";
                    row = liArr.indexOf(this)
                };
                liArr[ofs + i].onmouseout = function (ev) {
                    this.style.backgroundColor = "#fff"
                };
                var loadHit = function (molidNum) {
                    if (molidNum != 0) {
                        that.loadMolById(molidNum, searchType);
                        that.search_panel.style.display = "none";
                        that.searchInput.value = null;
                        clearList()
                    } else {
                        var req = getXMLObject(true);
                        req.onload = onLoadFunc("pubchem");
                        req.open("GET", sprintf("https://molsoft.com/cgi-bin/dictsearch.cgi?kwd=%s&format=json&where=pubchem", encodeURIComponent(tmp)));
                        req.send()
                    }
                };
                liArr[ofs + i].onclick = function (ev) {
                    loadHit(a.molid[liArr.indexOf(this)])
                };
                that.search_panel.onkeydown = function (e) {
                    var tmpRow;
                    if (that.inputText.length > 0 && e.keyCode == 40 && that.dropDown.firstChild && row < that.dropSize - 1) {
                        if (row == that.dropSize - 1) return false;
                        row++;
                        tmpRow = row;
                        liArr[row].style.backgroundColor = color;
                        if (tmpRow >= 1) {
                            liArr[tmpRow - 1].style.backgroundColor = "#fff"
                        }
                        var rowPos = getPosition(liArr[row]);
                        var rowY = rowPos.y;
                        if (rowPos.y == rowY) {
                            liArr[row].scrollIntoView(false)
                        }
                        return false
                    }
                    if (that.inputText.length > 0 && e.keyCode == 38 && that.dropDown.firstChild && row <= that.dropSize && row >= 0) {
                        if (row == 0) return false;
                        row--;
                        tmpRow = row;
                        liArr[row].style.backgroundColor = color;
                        if (tmpRow >= 0) {
                            liArr[tmpRow + 1].style.backgroundColor = "#fff"
                        }
                        liArr[row].scrollIntoView(false);
                        return false
                    }
                    if (e.keyCode == 13) {
                        loadHit(a.molid[liArr.indexOf(liArr[row])])
                    }
                    return true
                };
                if (liArr.length > 9) {
                    that.dropDown.style.height = (getPosition(liArr[1]).y - getPosition(liArr[0]).y) * 10 + "px"
                }
                if (liArr.length <= 9) {
                    that.dropDown.style.height = liArr.length * 26 + "px"
                }
                that.dropSize = liArr.length;
                var n = liArr[ofs + i].innerHTML;
                var patt = new RegExp("(\\b" + tmp + ")", "gi");
                var blahblah = new RegExp(tmp, "gi").exec(a.synonym[a.molecule_name.indexOf(liArr[ofs + i].innerHTML)]);
                if (n.match(patt)) {
                    liArr[ofs + i].innerHTML = n.replace(patt, function (match) {
                        return "<b><u>" + match + "</u></b>"
                    })
                } else {
                    var synRow = a.molecule_name[i];
                    var tmpHold = a.synonym[i].substring(a.synonym[i].indexOf(blahblah));
                    var re = /[A-z]+/;
                    var tmpStr = re.exec(tmpHold);
                    liArr[ofs + i].innerHTML = liArr[ofs + i].innerHTML + "    -     " + tmpStr;
                    liArr[ofs + i].innerHTML = liArr[ofs + i].innerHTML.replace(patt, function (match) {
                        return "<b><u>" + match + "</u></b>"
                    })
                }
            }
            if (liArr.length == 0) {
                that.dropDown.style.height = "0px"
            }
            that.req = null
        }
    };
    this.req.onload = onLoadFunc("hmdb");
    this.req.open("GET", sprintf("https://www.molsoft.com/cloud/dictSearch?nm=%s", encodeURIComponent(tmp)));
    this.req.send()
};
ChemicalView.prototype.loadMolById = function (id, searchType) {
    this.req = getXMLObject(true);
    var that = this;
    this.req.onload = function (e) {
        that.importFromString(that.req.responseText)
    };
    this.req.open("GET", sprintf("https://www.molsoft.com/cloud/getMol?id=%s&type=%s", encodeURIComponent(id), searchType == "pubchem" ? "pubchem" : ""));
    this.req.send()
};
ChemicalView.prototype.getInChi = function () {
    return this.chem.getInChi()
};
ChemicalView.prototype.getSmiles = function (kekule) {
    return this.chem.getSmiles(kekule)
};
ChemicalView.prototype.getIUPAC = function (kekule) {
    return this.chem.getIUPAC()
};
ChemicalView.prototype.getMolfile = function () {
    return this.chem.toMol()
};
ChemicalView.prototype.importFromString = function (str) {
    this.undoPush();
    this.h_atom = this.h_bond = this.h_text = -1;
    if (Module.chem.fromString(str)) {
        this.chem.copyFromChem(Module.chem);
        this.drawMol(true);
        this.changed()
    }
};
ChemicalView.prototype.exactMatch = function (pattern, opt) {
    return this.match(pattern, "exact", opt)
};
ChemicalView.prototype.match = function (pattern, all, opt) {
    if (!Module.chem) throw"'libchem.js' is not loaded";
    Module.chem.fromMol(this.chem.toMol());
    if (all == "exact") nmatch = Module.chem.exactMatch(pattern, opt ? opt : ""); else nmatch = Module.chem.match(pattern, typeof all == "undefined" ? false : all);
    var atli = Module.chem.atoms;
    for (var i = 0; i < atli.length; i++) {
        if (atli[i].ms & M_CE) this.chem.atoms[i].ms |= M_CE; else this.chem.atoms[i].ms &= ~M_CE
    }
    var boli = Module.chem.bonds;
    for (var i = 0; i < boli.length; i++) {
        if (boli[i].ms & M_CE) this.chem.bonds[i].ms |= M_CE; else this.chem.bonds[i].ms &= ~M_CE
    }
    this.drawMol();
    return nmatch
};
ChemicalView.prototype.formula = function () {
    if (!Module.chem) throw"'libchem.js' is not loaded";
    Module.chem.fromMol(this.chem.toMol());
    return Module.chem.formula()
};
ChemicalView.prototype.weight = function () {
    if (!Module.chem) throw"'libchem.js' is not loaded";
    Module.chem.fromMol(this.chem.toMol());
    return Module.chem.weight()
};
ChemicalView.prototype.clearMol = function () {
    this.undoPush();
    this.chem = new Chemical;
    this.drawMol(true);
    this.changed();
    this.toolButtonClicked(this.activeTool)
};
ChemicalView.prototype.assignCoordinates = function () {
    this.undoPush();
    var that = this;
    this.chem.assignCoordinates(function () {
        that.drawMol(true);
        that.changed()
    })
};
ChemicalView.prototype.importMol = function () {
    var that = this;
    this.impexp.style.display = "block";
    this.impexp.text.value = "";
    this.impexp.text.placeholder = "Paste MOL,SMILES or InChi file here";
    this.impexp.text.focus();
    this.impexp.ok.onclick = function (ev) {
        that.impexp.style.display = "none";
        that.importFromString(that.impexp.text.value)
    };
    if (this.impexp.about.parentNode == this.impexp) {
        this.impexp.removeChild(this.impexp.about);
        this.impexp.insertBefore(this.impexp.text, this.impexp.hlay)
    }
    if (this.impexp.cancel.parentNode != this.impexp.hlay) this.impexp.hlay.appendChild(this.impexp.cancel);
    this.impexp.kekule.style.display = "none";
    this.impexp.cancel.value = "Cancel";
    this.impexp.cancel.onclick = function (ev) {
        that.impexp.style.display = "none"
    }
};
ChemicalView.prototype.exportMol = function () {
    var that = this;
    this.impexp.style.display = "block";
    this.impexp.text.placeholder = "";
    this.impexp.text.value = this.chem.toMol();
    if (this.impexp.about.parentNode == this.impexp) {
        this.impexp.removeChild(this.impexp.about);
        this.impexp.insertBefore(this.impexp.text, this.impexp.hlay)
    }
    if (this.impexp.cancel.parentNode != this.impexp.hlay) this.impexp.hlay.appendChild(this.impexp.cancel);
    this.impexp.ok.onclick = function (ev) {
        that.impexp.style.display = "none"
    };
    this.impexp.cancel.value = "Show SMILES";
    this.impexp.kekule.style.display = "none";
    this.impexp.kekule.children[0].onclick = function (ev) {
        that.chem.toSmiles(function (smi) {
            that.impexp.text.value = smi
        }, that.impexp.kekule.children[0].checked)
    };
    this.impexp.cancel.onclick = function (ev) {
        if (that.impexp.cancel.value == "Show SMILES") {
            that.chem.toSmiles(function (smi) {
                that.impexp.text.value = smi
            }, that.impexp.kekule.children[0].checked);
            that.impexp.cancel.value = "Show MOL";
            that.impexp.kekule.style.display = "block"
        } else {
            that.impexp.text.value = that.chem.toMol();
            that.impexp.cancel.value = "Show SMILES";
            that.impexp.kekule.style.display = "none"
        }
    }
};
ChemicalView.prototype.about = function () {
    var that = this;
    this.impexp.style.display = "block";
    this.impexp.kekule.style.display = "none";
    this.impexp.ok.onclick = function (ev) {
        that.impexp.style.display = "none"
    };
    if (this.impexp.text.parentNode == this.impexp) {
        this.impexp.removeChild(this.impexp.text);
        this.impexp.insertBefore(this.impexp.about, this.impexp.hlay)
    }
    if (this.impexp.cancel.parentNode == this.impexp.hlay) this.impexp.hlay.removeChild(this.impexp.cancel)
};
ChemicalView.prototype.undo = function () {
    if (this.undoStack.length > 0) {
        this.redoStack.push(cloneObject(this.chem));
        this.chem = this.undoStack.pop();
        this.h_atom = this.h_bond = this.h_text = -1;
        this.drawMol();
        this.changed()
    }
};
ChemicalView.prototype.undoSimple = function () {
    if (this.undoStack.length > 0) {
        this.chem = this.undoStack.pop();
        this.h_atom = this.h_bond = this.h_text = -1
    }
};
ChemicalView.prototype.redo = function () {
    if (this.redoStack.length > 0) {
        this.undoStack.push(cloneObject(this.chem));
        this.chem = this.redoStack.pop();
        this.drawMol();
        this.changed()
    }
};
ChemicalView.prototype.getMolfile = function () {
    return this.chem.toMol()
};
ChemicalView.prototype.getSearchMolfile = function () {
    return this.chem.toMol()
};
ChemicalView.prototype.wtos = function (p) {
    return {x: p.x * this.kfc + this.dx, y: -p.y * this.kfc + this.dy, z: 0}
};
ChemicalView.prototype.stow = function (p) {
    return {x: (p.x - this.dx) / this.kfc, y: (this.dy - p.y) / this.kfc, z: 0}
};
ChemicalView.prototype.stowd = function (p) {
    return {x: p.x / this.kfc, y: -p.y / this.kfc, z: 0}
};

function vector(at1, at2) {
    return {
        x: at2.x - at1.x,
        y: at2.y - at1.y,
        z: typeof at2.z == "undefined" || typeof at1.z == "undefined" ? 0 : at2.z - at1.z
    }
}

function vectorLength(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function vectorSetLength(v, l) {
    var k = l / vectorLength(v);
    return {x: v.x * k, y: v.y * k, z: v.z * k}
}

function vecpy(a, b) {
    a.x = b.x;
    a.y = b.y;
    a.z = b.z
}

function veadd(a, b) {
    return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z}
}

function vesub(a, b) {
    return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z}
}

function vemul(a, b) {
    return {x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x}
}

function vemulZSign(a, b) {
    var v = a.x * b.y - a.y * b.x;
    return v < 0 ? -1 : 1
}

function scmul(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z
}

function vemulby(a, k) {
    return {x: a.x * k, y: a.y * k, z: a.z * k}
}

function xyz(at) {
    return {x: at.x, y: at.y, z: at.z}
}

function testPolyInclusion(p, poly) {
    var np = poly.length;
    var c = false;
    var i = 0;
    var j = np - 1;
    for (var k = 0; k < np; k++) {
        if (poly[i].y <= p.y) {
            if (p.y < poly[j].y && (p.x - poly[i].x) * (poly[j].y - poly[i].y) < (poly[j].x - poly[i].x) * (p.y - poly[i].y)) c = !c
        } else {
            if (p.y >= poly[j].y && (p.x - poly[i].x) * (poly[j].y - poly[i].y) > (poly[j].x - poly[i].x) * (p.y - poly[i].y)) c = !c
        }
        j = i;
        i++
    }
    return c
}

function angleBetween(a, b) {
    return TO_DEG * Math.acos(scmul(a, b) / (vectorLength(a) * vectorLength(b)))
}

ChemicalView.prototype.bondRect = function (bo) {
    var at1 = this.chem.atoms[bo.fr];
    var at2 = this.chem.atoms[bo.to];
    var dir = vectorSetLength(vector(at1, at2), .2);
    var v = vectorSetLength(vector(at1, at2), .2);
    v = {x: -v.y, y: v.x, z: 0};
    return [veadd(veadd(at1, v), dir), veadd(veadd(at2, v), vemulby(dir, -1)), veadd(veadd(at2, vemulby(v, -1)), vemulby(dir, -1)), veadd(veadd(at1, vemulby(v, -1)), dir)]
};
ChemicalView.prototype.atomRect = function (at, fontSize) {
    this.ctx.font = "bold " + fontSize + "px Arial";
    var p = this.wtos(at);
    var h = this.chem.H(at) - at.nHyd;
    var lbl = this.atomLabel(at);
    if (lbl.length == "") lbl = "C";
    var hw = this.ctx.measureText(lbl).width + 2;
    var hh = fontSize;
    if (at.cd != 6 && h > 0) hw += this.ctx.measureText("H").width + 2 + (h > 1 ? fontSize / 4 : 0);
    if (at.cd != 6 && h > 1) hh += fontSize / 4;
    return {x: p.x - hw / 2, y: p.y - fontSize / 2, w: hw, h: hh}
};
ChemicalView.prototype.bondOrtho = function (atnum1, atnum2, ty, len) {
    return this.chem.bondOrtho(atnum1, atnum2, ty, len)
};
ChemicalView.prototype.subpxOpt = function (r) {
    var lw = this.ctx.lineWidth;
    if (!lw || lw <= 0) return r;
    var dr = Math.round(r * 2);
    return (dr + Math.round(lw)) % 2 === 0 ? dr / 2 : (dr + 1) / 2
};
ChemicalView.prototype.subpxOptLine = function (p1, p2) {
    if (Math.round(p1.x * 2) == Math.round(p2.x * 2)) {
        p1.x = p2.x = this.subpxOpt(p1.x)
    }
    if (Math.round(p1.y * 2) == Math.round(p2.y * 2)) {
        p1.y = p2.y = this.subpxOpt(p1.y)
    }
};
ChemicalView.prototype.moveTo = function (p) {
    var p1 = this.wtos(p);
    this.ctx.moveTo(p1.x, p1.y)
};
ChemicalView.prototype.lineTo = function (p) {
    var p1 = this.wtos(p);
    this.ctx.lineTo(p1.x, p1.y)
};
ChemicalView.prototype.drawLine = function (fr, to) {
    var p1 = this.wtos(fr);
    var p2 = this.wtos(to);
    if (this.optsubpixel) this.subpxOptLine(p1, p2);
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y)
};
ChemicalView.prototype.getMousePos = function (ev, isTouch, par) {
    var rect = par ? par.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    return {
        x: (isTouch ? ev.touches[0].clientX : ev.clientX) - rect.left,
        y: (isTouch ? ev.touches[0].clientY : ev.clientY) - rect.top,
        z: 0
    }
};
ChemicalView.prototype.getMousePosArr = function (ev) {
    var rect = this.canvas.getBoundingClientRect();
    var res = [];
    for (var i = 0; i < ev.targetTouches.length; i++) {
        res.push({x: ev.touches[i].clientX - rect.left, y: ev.touches[i].clientY - rect.top, z: 0})
    }
    return res
};
ChemicalView.prototype.onKeyPress = function (ev) {
    var code = ev.charCode ? ev.charCode : ev.keyCode;
    if (this.activeText) {
        if (code == 27) this.commitOrCancelActiveText(true);
        return
    }
    var key = String.fromCharCode(code);
    if (code == 46 || code == 8) {
        var sel = this.chem.getSelectedAtoms(M_CE);
        if (sel.length == 0 && this.h_atom != -1) sel = [this.h_atom];
        var seltxt = [];
        if (this.h_text != -1) seltxt = [this.h_text];
        if (sel.length || seltxt.length) {
            this.undoPush();
            this.chem.removeAtoms(sel, seltxt);
            this.changed();
            this.drawMol()
        }
    } else if (this.h_atom != -1) {
        if (key in Elements) {
            this.undoPush();
            this.chem.changeAtom(this.h_atom, Elements[key], {});
            this.changed();
            this.drawMol()
        }
    } else if (this.h_bond != -1) {
        var ty = -1, eo = 0;
        var bo = this.chem.bonds[this.h_bond];
        switch (code) {
            case 189:
                ty = 1;
                eo = 0;
                break;
            case 187:
                ty = 2;
                eo = 0;
                break;
            case 51:
                if (!(bo.ms & M_RNG)) {
                    ty = 3;
                    eo = 0
                }
                break;
            case 85:
                if (bo.ty == 1) {
                    ty = 1;
                    eo = E_BOEOTY_UP
                }
                break;
            case 68:
                if (bo.ty == 1) {
                    ty = 1;
                    eo = E_BOEOTY_DW
                }
                break
        }
        if (ty != -1) {
            this.undoPush();
            bo.ty = ty;
            bo.eo = eo;
            this.chem.processChemical();
            this.changed();
            this.drawMol()
        }
    }
};
ChemicalView.prototype.onMouseUp = function (ev) {
    this.clearStatus();
    if (this.dragAtoms.length > 0) {
        this.chem.gravitateCollisions();
        this.changed()
    } else if (this.mode == MODE_CHAIN) {
        this.chem.gravitateCollisions();
        if (this.chem.atoms.length == 1 || this.newCount == 0 && this.chem.atoms[this.connectToAtom].bo.length == 0) {
            this.chem.removeAtoms([this.chem.atoms.length - 1]);
            this.h_atom = this.h_bond = -1;
            this.connectToAtom = -1
        }
    } else if (this.mode == MODE_RECT_SEL || this.mode == MODE_LASSO_SEL) {
        if (this.onselect) this.onselect(this.chem)
    }
    this.mode = MODE_NORMAL;
    this.endPos = this.lastPos = null;
    this.lastPosArr = [];
    this.lassoPath = [];
    this.dragAtoms = [];
    this.dragText = [];
    this.connectToAtom = -1;
    this.button = -1;
    this.drawMol()
};
ChemicalView.prototype.canSelect = function (ev) {
    return this.h_atom == -1 && this.h_bond == -1 && this.h_text == -1 && (!this.activeTool || !this.activeTool.firstUse || this.activeTool.toolType != "lasso" && this.activeTool.toolType.substr(0, 4) != "text" && this.activeTool.toolType.substr(0, 4) != "frag" && this.activeTool.toolType.substr(0, 4) != "bond") && (!this.activeTool || this.activeTool.toolType != "atom") && (!this.activeTool || this.activeTool.toolType != "chain")
};
ChemicalView.prototype.getDragAtoms = function () {
    if (this.h_atom == -1) return [];
    if (this.chem.atoms[this.h_atom].ms & M_CE) {
        var res = [this.h_atom];
        for (var i = 0; i < this.chem.atoms.length; i++) if (i != this.h_atom && this.chem.atoms[i].ms & M_CE) res.push(i);
        return res
    } else return [this.h_atom]
};
ChemicalView.prototype.commitOrCancelActiveText = function (cancel) {
    if (this.activeText) {
        if (!cancel && this.activeText.value.length) {
            if (this.activeText.h_text == -1) {
                var rect = this.activeText.getBoundingClientRect();
                var text = {
                    x: this.activeText.pos.x,
                    y: this.activeText.pos.y,
                    text: this.activeText.value,
                    width: (rect.right - rect.left) / this.kfc,
                    height: (rect.bottom - rect.top) / this.kfc
                };
                this.chem.annotations.push(text)
            } else {
                this.chem.annotations[this.activeText.h_text].text = this.activeText.value
            }
            this.changed();
            this.drawMol()
        }
        this.par.removeChild(this.activeText);
        this.activeText = null
    }
};
ChemicalView.prototype.editCreateTextAt = function (ev, isTouch) {
    var pp, p2, txt;
    if (this.h_text == -1) {
        p2 = this.getMousePos(ev, isTouch, this.par);
        var p = this.getMousePos(ev, isTouch, this.canvas);
        pp = this.stow(p);
        txt = ""
    } else {
        var tt = this.chem.annotations[this.h_text];
        pp = {x: tt.x, y: tt.y, z: 0};
        p2 = this.wtos(pp);
        var r1 = this.par.getBoundingClientRect();
        var r2 = this.canvas.getBoundingClientRect();
        p2.x += r2.left - r1.left;
        p2.y += r2.top - r1.top;
        txt = tt.text
    }
    var t = document.createElement("textarea");
    t.setAttribute("rows", 4);
    t.setAttribute("cols", 15);
    t.style.display = "block";
    t.style.position = "absolute";
    t.style.top = p2.y + "px";
    t.style.left = p2.x + "px";
    t.value = txt;
    this.par.appendChild(t);
    t.pos = pp;
    t.h_text = this.h_text;
    this.activeText = t
};
ChemicalView.prototype.onMouseDoubleClick = function (ev, isTouch) {
    var p = this.getMousePos(ev, isTouch);
    this.h_text = this.chem.findClosestText(this.stow(p));
    if (this.h_text != -1 && !this.chem.annotations[this.h_text].isArrow) {
        this.editCreateTextAt(ev, isTouch)
    }
};
ChemicalView.prototype.onMouseDown = function (ev, isTouch) {
    var that = this;
    this.canvas.focus();
    if (isTouch && ev.targetTouches.length > 1) {
        this.lastPosArr = this.getMousePosArr(ev);
        return
    }
    this.button = 0;
    if (typeof ev.button != "undefined") this.button = ev.button;
    var p = this.getMousePos(ev, isTouch);
    this.newCount = 0;
    this.mode = MODE_NORMAL;
    switch (this.button) {
        case 2:
            break;
        case 1: {
            this.lastPos = this.endPos = p
        }
            break;
        case 0: {
            this.commitOrCancelActiveText();
            this.h_atom = this.chem.findClosestAtom(this.stow(p));
            this.h_bond = -1;
            if (this.h_atom == -1) this.h_bond = this.chem.findClosestBond(this.stow(p));
            if (this.h_atom == -1 && this.h_bond == -1) this.h_text = this.chem.findClosestText(this.stow(p));
            if (this.h_atom == -1 && this.h_bond == -1 && this.h_text == -1 && p.x <= this.canvasWidth() * .05) {
                this.lastPos = this.endPos = p;
                this.mode = MODE_ZOOM;
                return
            }
            if (this.canSelect()) {
                this.mode = MODE_RECT_SEL;
                this.h_atom = -1;
                this.lastPos = this.endPos = p;
                return
            }
            if (this.activeTool && this.activeTool.toolType == "lasso") {
                this.mode = MODE_LASSO_SEL;
                this.h_atom = -1;
                this.lastPos = p;
                this.lassoPath = [];
                return
            }
            if (this.activeTool && this.activeTool.toolType == "chain") {
                this.mode = MODE_CHAIN;
                this.lastPos = p
            }
            if (this.h_atom != -1) {
                var at = this.chem.atoms[this.h_atom];
                if (this.activeTool && !(at.ms & M_CE) && this.activeTool.toolType == "atom") {
                    this.undoPush();
                    var atts = {};
                    if (typeof this.activeTool.panel != "undefined") atts = this.activeTool.panel.getSearchAtts();
                    this.chem.changeAtom(this.h_atom, this.activeTool.cd == null ? -1 : Elements[this.activeTool.cd], atts);
                    this.changed()
                } else if (this.activeTool && !(at.ms & M_CE) && this.activeTool.toolType == "qfm") {
                    this.undoPush();
                    this.chem.chargeAtom(this.h_atom);
                    this.changed()
                } else if (this.activeTool && !(at.ms & M_CE) && this.activeTool.toolType == "wtdf") {
                    this.undoPush();
                    this.chem.isotopeAtom(this.h_atom);
                    this.changed()
                } else if (this.activeTool && !(at.ms & M_CE) && this.activeTool.toolType.substr(0, 4) == "bond") {
                    this.undoPush();
                    this.lastPos = p;
                    this.connectToAtom = this.h_atom;
                    this.dragAtoms = this.chem.connectTo(this.h_atom, parseInt(this.activeTool.toolType.substr(5, 1)), null, -1);
                    this.updateZoom = this.outOfBounds()
                } else if (this.activeTool && this.activeTool.toolType == "chain") {
                    this.undoPush();
                    this.lastPos = p;
                    this.h_atom = this.chem.findClosestAtomLong(this.stow(p));
                    this.connectToAtom = this.h_atom
                } else if (this.activeTool && !(at.ms & M_CE) && this.activeTool.toolType.substr(0, 4) == "frag") {
                    this.undoPush();
                    this.lastPos = p;
                    this.connectToAtom = this.h_atom;
                    this.dragAtoms = this.chem.connectTo(this.h_atom, 1, Module.Rings[parseInt(this.activeTool.toolType.substr(5, 1))], 0);
                    this.updateZoom = this.outOfBounds()
                } else if (this.activeTool && this.activeTool.toolType == "eraser") {
                    this.undoPush();
                    this.chem.removeAtoms(this.getDragAtoms());
                    this.h_bond = this.h_atom = this.h_text = -1;
                    this.changed()
                } else {
                    this.undoPush();
                    this.lastPos = p;
                    this.mode = MODE_DRAG_ATOMS;
                    this.dragAtoms = this.getDragAtoms()
                }
                this.drawMol()
            } else {
                if (this.h_bond != -1) {
                    if (this.activeTool && this.activeTool.toolType.substr(0, 4) == "bond") {
                        this.undoPush();
                        this.chem.bondToggle(this.h_bond, parseInt(this.activeTool.toolType.substr(5, 1)));
                        this.changed()
                    } else if (this.activeTool && this.activeTool.toolType.substr(0, 4) == "frag") {
                        this.undoPush();
                        this.chem.connectToBond(this.h_bond, Module.Rings[parseInt(this.activeTool.toolType.substr(5, 1))]);
                        this.updateZoom = this.outOfBounds();
                        this.changed()
                    } else if (this.activeTool && this.activeTool.toolType == "eraser") {
                        this.undoPush();
                        this.chem.removeBonds([this.h_bond]);
                        this.h_bond = this.h_atom = -1;
                        this.changed()
                    } else {
                        this.undoPush();
                        this.lastPos = p;
                        this.dragAtoms = [];
                        if (this.chem.bonds[this.h_bond].ms & M_CE) {
                            Module.Array_forEach2(this.chem.bonds, function (bo) {
                                if (bo.ms & M_CE) that.dragAtoms.push(bo.fr);
                                if (bo.ms & M_CE) that.dragAtoms.push(bo.to)
                            });
                            this.mode = MODE_DRAG_ATOMS;
                            this.dragAtoms = Module.Array_unique(this.dragAtoms.sort(function (a, b) {
                                return a - b
                            }))
                        } else {
                            this.dragAtoms = [this.chem.bonds[this.h_bond].fr, this.chem.bonds[this.h_bond].to];
                            this.mode = MODE_DRAG_ATOMS
                        }
                    }
                    this.drawMol()
                } else if (this.h_text != -1) {
                    this.undoPush();
                    if (this.activeTool && this.activeTool.toolType == "eraser") {
                        this.chem.removeAtoms([], [this.h_text]);
                        this.h_bond = this.h_atom = this.h_text = -1;
                        this.changed()
                    } else {
                        this.undoPush();
                        this.lastPos = p;
                        this.dragText = [this.h_text];
                        this.mode = MODE_DRAG_ATOMS
                    }
                    this.drawMol()
                } else {
                    if (this.activeTool && this.activeTool.toolType.substr(0, 4) == "text") {
                        this.undoPush();
                        if (updateZoom) this.updateKfc(ch, this.margin);
                        var pp = this.stow(p);
                        if (this.activeTool.toolType == "text_arrow") {
                            var arrow = {x: pp.x, y: pp.y, text: "_ARROW_", isArrow: true};
                            this.chem.annotations.push(arrow);
                            this.changed();
                            this.drawMol()
                        } else {
                            this.editCreateTextAt(ev, isTouch)
                        }
                    } else if (this.activeTool.firstUse || this.activeTool.toolType == "atom" || this.activeTool.toolType == "chain") {
                        var updateZoom = this.chem.atoms.length == 0 && this.dx == 0 && this.dy == 0;
                        var ch = null;
                        if (this.activeTool.toolType.substr(0, 4) == "frag") {
                            ch = Module.Rings[parseInt(this.activeTool.toolType.substr(5, 1))]
                        } else if (this.activeTool.toolType.substr(0, 4) == "bond") {
                            ch = (new Chemical).makeBond(0, parseInt(this.activeTool.toolType.substr(5, 1)))
                        } else if (this.activeTool.toolType == "atom" && this.activeTool.cd != null) {
                            ch = (new Chemical).makeAtom(Elements[this.activeTool.cd])
                        } else if (this.activeTool.toolType == "chain") {
                            ch = (new Chemical).makeAtom(6)
                        }
                        if (ch != null) {
                            this.undoPush();
                            if (updateZoom) this.updateKfc(ch, this.margin);
                            this.chem.placeFragment(this.stow(p), ch);
                            if (this.activeTool.toolType == "chain") this.connectToAtom = this.chem.atoms.length - 1;
                            this.changed();
                            this.drawMol()
                        }
                    }
                }
            }
            if (this.activeTool != null) this.activeTool.firstUse = false
        }
            break
    }
};
ChemicalView.prototype.onMouseMove = function (ev, isTouch) {
    var that = this;
    if (this.activeText) return;
    if (isTouch) ev.preventDefault();
    if (isTouch && ev.targetTouches.length > 1) {
        var p = this.getMousePosArr(ev);
        if (p.length == this.lastPosArr.length) this.multiTouch(this.lastPosArr, p);
        this.lastPosArr = p;
        return
    }
    var p = this.getMousePos(ev, isTouch);
    var h_at = this.chem.findClosestAtom(this.stow(p));
    var manhatanD = 0;
    if (this.lastPos != null) manhatanD = Math.max(Math.abs(p.y - this.lastPos.y), Math.abs(p.x - this.lastPos.x));
    if (this.button == 1) {
        if (manhatanD > 1) {
            this.dx += p.x - this.lastPos.x;
            this.dy += p.y - this.lastPos.y;
            this.updateZoom = false;
            this.drawMol()
        }
        this.lastPos = p;
        return
    }
    if (this.mode == MODE_ZOOM && Math.abs(p.y - this.lastPos.y) > 5) {
        var p1 = this.wtos(this.chem.centerPoint());
        this.kfc *= p.y < this.lastPos.y ? 1.02 : .98;
        var p2 = this.wtos(this.chem.centerPoint());
        this.dx += p1.x - p2.x;
        this.dy += p1.y - p2.y;
        this.lastPos = p;
        this.updateZoom = false;
        this.drawMol();
        return
    }
    if (this.mode == MODE_DRAG_ATOMS) {
        if (manhatanD <= 4) return;
        if (this.rotateAroundPoint == null) this.chem.moveAtoms(this.dragAtoms, this.dragText, this.stowd(vesub(p, this.lastPos))); else {
            var vect = vector(this.rotateAroundPoint, this.stow(p));
            if (vectorLength(vect) < .001) return;
            this.chem.rotateAtomsVector(this.dragAtoms, this.rotateAroundPoint, vect, -1)
        }
        this.lastPos = p;
        this.drawMol();
        return
    }
    if (this.mode == MODE_RECT_SEL) {
        if (manhatanD <= 4) return;
        this.endPos = p;
        this.lassoPath = [{
            x: Math.min(this.lastPos.x, this.endPos.x),
            y: Math.max(this.lastPos.y, this.endPos.y)
        }, {
            x: Math.max(this.lastPos.x, this.endPos.x),
            y: Math.max(this.lastPos.y, this.endPos.y)
        }, {
            x: Math.max(this.lastPos.x, this.endPos.x),
            y: Math.min(this.lastPos.y, this.endPos.y)
        }, {x: Math.min(this.lastPos.x, this.endPos.x), y: Math.min(this.lastPos.y, this.endPos.y)}];
        this.chem.updateAtomSelection(Module.Array_map(this.lassoPath, function (x) {
            return that.stow(x)
        }), ev.ctrlKey);
        this.drawMol();
        return
    }
    if (this.mode == MODE_CHAIN) {
        if (manhatanD <= 4) return;
        this.endPos = p;
        this.atomHold = -1;
        if (this.connectToAtom == -1) return;
        var connectTo = this.connectToAtom;
        var nbo = this.chem.atoms[connectTo].bo.length;
        var neiBo = nbo ? this.chem.atoms[connectTo].bo[0] : -1;
        var canDrawCheck = this.canDraw == null ? true : false;
        var mouseDir = vector(this.stow(this.lastPos), this.stow(p));
        var bondDir = neiBo != -1 ? vector(this.chem.atoms[neiBo], this.chem.atoms[connectTo]) : mouseDir;
        var angle = Math.acos(scmul(mouseDir, bondDir) / (vectorLength(bondDir) * vectorLength(mouseDir)));
        var closest = this.chem.findClosestAtomLong(this.stow(p));
        var d0 = vectorLength(vector(this.stow(p), this.chem.atoms[neiBo == -1 ? connectTo : neiBo]));
        var d1 = vectorLength(vector(this.stow(p), this.chem.atoms[connectTo]));
        if (this.chem.atoms.length > 1 && this.newCount == 0) {
            var v1;
            var v2 = vector(this.chem.atoms[connectTo], this.stow(p));
            for (var i = 0; i < this.chem.atoms[connectTo].bo.length; i++) {
                v1 = vector(this.chem.atoms[connectTo], this.chem.atoms[this.chem.atoms[connectTo].bo[i]]);
                if (angleBetween(v1, v2) < 60) return
            }
        }
        this.showStatus("Press <b>Alt</b> and move mouse to other atom to close the loop");
        if (d1 > 1.2 && d0 > 1.2 && !this.chem.hasCollisions(connectTo) && canDrawCheck) {
            if (this.newCount == 0) this.atomHold = this.connectToAtom;
            if (ev.altKey) {
                if (h_at != -1 && h_at != connectTo) {
                    var newat = cloneObject(this.chem.atoms[h_at]);
                    this.chem.atoms.push(newat);
                    this.chem.bonds.push({fr: connectTo, to: this.chem.atoms.length - 1, ty: 1, ms: 0});
                    this.connectToAtom = this.chem.atoms.length - 1;
                    this.chem.processChemical();
                    this.newCount++;
                    this.lastPos = p
                }
            } else {
                this.connectToAtom = this.chem.chainTo(connectTo, 1, this.stow(this.lastPos), this.stow(p));
                this.newCount++;
                this.lastPos = p
            }
        } else if (d0 > .6 && d0 < 1.2 && neiBo != -1 && nbo == 1) {
            var close;
            if (vectorLength(vector(this.chem.atoms[closest], this.stow(p))) <= 1.2 && this.chem.findShortestPath(this.connectToAtom, closest).length < 2) {
                close = closest
            } else {
                close = -1
            }
            if (close != -1 && this.newCount > 0) {
                for (var i = 0; i < this.chem.atoms.length - close; i++) {
                    this.chem.removeAtoms([this.connectToAtom]);
                    this.h_atom = this.h_bond = -1;
                    this.connectToAtom--;
                    this.newCount--;
                    if (this.chem.atoms.length == 0) this.connectToAtom = -1
                }
                if (this.chem.atoms.length > 0 && this.newCount == 0 && this.chem.atoms[this.connectToAtom].bo.length >= 1) {
                    this.connectToAtom = this.atomHold
                }
            }
        } else if (angle > Math.PI / 2 && d0 < .6 && neiBo != -1 && nbo == 1 && this.newCount > 0) {
            this.chem.removeAtoms([this.connectToAtom]);
            this.h_atom = this.h_bond = -1;
            this.connectToAtom = neiBo;
            this.newCount--;
            if (this.chem.atoms.length == 0) this.connectToAtom = -1;
            this.lastPos = p
        }
        this.drawMol();
        return
    }
    if (this.mode == MODE_LASSO_SEL && this.h_atom == -1 && this.activeTool && this.activeTool.toolType == "lasso" && this.lastPos != null) {
        if (!this.lassoPath.length || vectorLength(vector(p, this.lassoPath[this.lassoPath.length - 1])) > 8) {
            this.lassoPath.push(p);
            this.chem.updateAtomSelection(Module.Array_map(this.lassoPath, function (x) {
                return that.stow(x)
            }), ev.ctrlKey);
            this.drawMol()
        }
        return
    }
    if (this.dragAtoms.length > 0 && this.connectToAtom != -1 && manhatanD > 5) {
        if (this.activeTool) {
            var vect = vector(this.chem.atoms[this.connectToAtom], this.stow(p));
            if (vectorLength(vect) < .001) return;
            this.h_atom = this.chem.findClosestAtom(this.stow(p));
            if (this.h_atom == this.connectToAtom) this.h_atom = -1;
            this.chem.rotateAtomsVector(this.dragAtoms, this.chem.atoms[this.connectToAtom], vect, this.h_atom)
        }
        this.lastPos = p;
        this.drawMol();
        return
    }
    var redraw = false;
    if (h_at != this.h_atom) {
        this.h_atom = h_at;
        redraw = true
    }
    this.rotateAroundPoint = null;
    if (this.h_atom != -1 && this.chem.atoms[this.h_atom].ms & M_CE) {
        var apo = this.chem.apoFromSelection(M_CE);
        if (apo.length == 1) this.rotateAroundPoint = {
            x: this.chem.atoms[apo[0]].x,
            y: this.chem.atoms[apo[0]].y,
            z: 0
        }; else if (apo.length == 0) this.rotateAroundPoint = this.chem.centerPoint()
    }
    if (h_at == -1) {
        var bo = this.chem.findClosestBond(this.stow(p));
        if (bo != this.h_bond) {
            this.h_bond = bo;
            redraw = true
        }
    } else {
        if (this.h_bond != -1) redraw = true;
        this.h_bond = -1
    }
    if (this.h_atom == -1 && this.h_bond == -1) {
        var h_txt = this.chem.findClosestText(this.stow(p));
        if (h_txt != this.h_text) {
            this.h_text = h_txt;
            redraw = true
        }
    }
    if (this.h_atom != -1) {
        this.showStatus("<b>Hint</b>: to change atom type press 'C','N','O',etc.. ")
    } else if (this.h_bond != -1) {
        this.showStatus("<b>Hint</b>: to change bond type press '-','=','#','u','d'")
    } else this.clearStatus();
    if (redraw) this.drawMol()
};
ChemicalView.prototype.multiTouch = function (pp1, pp2) {
    if (pp1.length != pp2.length || pp1.length < 2) return;
    var d = vemulby(veadd(vesub(pp2[0], pp1[0]), vesub(pp2[1], pp1[1])), .5);
    if (false) {
        var d1 = vectorLength(vesub(pp1[0], pp2[0]));
        var d2 = vectorLength(vesub(pp1[1], pp2[1]));
        var pc = null;
        var p1, p2;
        if (d1 < d2) {
            pc = vemulby(veadd(pp1[0], pp2[0]), .5);
            p1 = pp1[1];
            p2 = pp2[1]
        } else {
            pc = vemulby(veadd(pp1[1], pp2[1]), .5);
            p1 = pp1[0];
            p2 = pp2[0]
        }
        if (pc != null) {
            var v1 = vesub(p1, pc);
            var v2 = vesub(p2, pc);
            var angle = Math.acos(scmul(v1, v2) / (vectorLength(v1) * vectorLength(v2))) * vemulZSign(v2, v1);
            if (Math.abs(angle) > .001) {
                var atli = [];
                for (var i = 0; i < this.chem.atoms.length; i++) atli.push(i);
                this.chem.rotateAtomsAround(atli, this.stow(pc), angle)
            }
        }
    }
    d1 = vectorLength(vesub(pp1[0], pp1[1]));
    d2 = vectorLength(vesub(pp2[0], pp2[1]));
    var pc1 = vemulby(veadd(pp1[0], pp1[1]), .5);
    var wpc1 = this.stow(pc1);
    this.kfc *= d2 / d1;
    var pc2 = this.wtos(wpc1);
    this.dx += pc1.x - pc2.x + d.x;
    this.dy += pc1.y - pc2.y + d.y;
    this.drawMol(false)
};
ChemicalView.prototype.atomIsTerminated = function (at) {
    if (!this.hasOwnProperty("circleDegreeAsDrawn_") || !this.circleDegreeAsDrawn_) return false;
    return at.hasOwnProperty("atts") && at.atts.hasOwnProperty("D") && (at.atts.D == -1 || at.atts.D == at.bo.length)
};
ChemicalView.prototype.atomLabel = function (at) {
    var lbl = "";
    var q = this.chem.get_qfm(at);
    var stereo = this.atomDislayMask & ATOM_DISPLAY_RS && at.eo;
    var l = at.bo.length == 2 && at.ty[0] == 2 && at.ty[1] == 2;
    if (at.cd != 6 || at.bo.length == 0 || q || stereo || l || at.wtdf || at.hasOwnProperty("atts") && countAtts(at.atts) && !(countAtts(at.atts) == 1 && this.atomIsTerminated(at))) {
        lbl = Chemical.elementName(at.cd);
        if (at.wtdf) {
            var wt = Math.floor(Module.Chemical.elementWeight(at.cd) + at.wtdf + .5);
            lbl = wt + lbl
        }
        if (q) {
            lbl += (Math.abs(q) == 1 ? "" : q.toString()) + (q < 0 ? "-" : "+")
        }
        if (stereo) lbl += STEREO_LABEL[at.eo];
        if (at.hasOwnProperty("atts")) {
            for (var x in at.atts) if (at.atts.hasOwnProperty(x)) {
                if (x == "D" && this.circleDegreeAsDrawn_ && this.atomIsTerminated(at)) continue;
                lbl += ";";
                lbl += x;
                lbl += at.atts[x]
            }
        }
    }
    return lbl
};
ChemicalView.prototype.canvasWidth = function () {
    return this.canvas.width / this.dpr
};
ChemicalView.prototype.canvasHeight = function () {
    return this.canvas.height / this.dpr
};
ChemicalView.prototype.updateKfc = function (chem, margin) {
    if (chem.maxx - chem.minx != 0 && chem.maxy - chem.miny != 0) this.kfc = Math.min(60 / this.dpr, (this.canvasWidth() - margin * 2) / (chem.maxx - chem.minx), (this.canvasHeight() - margin * 2) / (chem.maxy - chem.miny)); else this.kfc = 60 / this.dpr;
    var sw = (chem.maxx - chem.minx) * this.kfc;
    var sh = (chem.maxy - chem.miny) * this.kfc;
    this.dx = -chem.minx * this.kfc + (this.canvasWidth() - sw) / 2;
    this.dy = chem.maxy * this.kfc + (this.canvasHeight() - sh) / 2;
    this.updateZoom = false
};
ChemicalView.prototype.drawMolIfDirty = function (updateZoom) {
    if (this.isDirty) {
        this.isDirty = false;
        this.drawMol(updateZoom)
    }
};
ChemicalView.prototype.drawMol = function (updateZoom) {
    if (typeof updateZoom != "undefined") this.updateZoom = updateZoom;
    if (!this.chemIsReady) return;
    this.isDirty = false;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.nobackground) ; else {
        if (this.android) {
            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvasWidth(), this.canvasHeight())
        } else {
            this.ctx.clearRect(0, 0, this.canvasWidth(), this.canvasHeight())
        }
    }
    this.ctx.lineWidth = 1.5;
    if (this.updateZoom) this.updateKfc(this.chem, this.margin);
    var bl = this.chem.bondLength();
    var fontSize = bl * this.kfc * .5;
    fontSize = Math.max(Math.min(fontSize, 16), 3);
    if (!this.readOnly) {
        var h = 15;
        var copyText = sprintf("MolEdit © %d MolSoft", (new Date).getFullYear());
        this.ctx.font = sprintf("bold %dpx Arial", h);
        this.ctx.fillStyle = "#DDDDDD";
        var w = this.ctx.measureText(copyText).width;
        this.ctx.fillText(copyText, this.canvasWidth() - w - 5, this.canvasHeight() - 5)
    }
    if (this.mode == MODE_CHAIN && this.chem.atoms[this.connectToAtom] != null && this.chem.atoms[this.connectToAtom].bo[0] >= 0) {
        var diff = this.chem.atoms.length - this.newCount;
        var dX = .25 * vector(this.wtos(this.chem.atoms[this.chem.atoms[this.connectToAtom].bo[0]]), this.wtos(this.chem.atoms[this.connectToAtom])).x;
        var dY = .25 * vector(this.wtos(this.chem.atoms[this.chem.atoms[this.connectToAtom].bo[0]]), this.wtos(this.chem.atoms[this.connectToAtom])).y;
        this.ctx.fillStyle = "#000000";
        this.ctx.fillText(this.chem.atoms.length - diff, this.wtos(this.chem.atoms[this.connectToAtom]).x + dX, this.wtos(this.chem.atoms[this.connectToAtom]).y + dY)
    }
    ends = [];
    var ra = bl * 1.1;
    var sel_ra = this.kfc * bl * .15;
    var sel_color = "#b2ffb2";
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.lineWidth = sel_ra * 2;
    this.ctx.strokeStyle = sel_color;
    for (var i = 0; i < this.chem.bonds.length; i++) {
        var bo = this.chem.bonds[i];
        var fr = xyz(this.chem.atoms[bo.fr]);
        var to = xyz(this.chem.atoms[bo.to]);
        if (bo.ms & M_CE) this.drawLine(fr, to)
    }
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.restore();
    for (var i = 0; i < this.chem.atoms.length; i++) {
        var at = this.chem.atoms[i];
        var r = this.atomRect(at, fontSize);
        if (at.ms & M_CE) {
            this.ctx.fillStyle = sel_color;
            this.ctx.beginPath();
            var pp = this.wtos(at);
            this.ctx.arc(pp.x, pp.y, sel_ra, 0, 2 * Math.PI);
            this.ctx.fill()
        }
        if (this.showOccupancy_ && (!at.hasOwnProperty("oc") || at.oc)) {
            this.ctx.fillStyle = "rgba(52,152,219,0.3)";
            this.ctx.beginPath();
            var p = this.wtos(at);
            var ra2 = .3 * this.kfc * (at.hasOwnProperty("oc") ? at.oc : 1);
            if (ra2 > 25) ra2 = 25;
            this.ctx.arc(p.x, p.y, ra2, 0, 2 * Math.PI);
            this.ctx.fill()
        }
        if (this.circleDegreeAsDrawn_ && this.atomIsTerminated(at)) {
            var npt = 120;
            var p2 = {x: 0, y: ra};
            var a = 2 * Math.PI / npt;
            var xx1 = at.x + p2.x;
            var yy1 = at.y + p2.y;
            this.ctx.strokeStyle = "#ff1a1a";
            this.ctx.beginPath();
            this.ctx.lineWidth = this.circleDegreeAsDrawn_;
            var startpt = {x: xx1, y: yy1};
            var endpt = {x: xx1, y: yy1};
            for (var k = 0; k < npt; k++) {
                var xx2 = Math.cos(a) * p2.x - Math.sin(a) * p2.y;
                var yy2 = Math.sin(a) * p2.x + Math.cos(a) * p2.y;
                p2.x = xx2;
                p2.y = yy2;
                xx2 += at.x;
                yy2 += at.y;
                var exclude = false;
                for (var j = 0; j < this.chem.atoms.length; j++) if (i != j) {
                    var atj = this.chem.atoms[j];
                    var di = Math.sqrt((xx2 - atj.x) * (xx2 - atj.x) + (yy2 - atj.y) * (yy2 - atj.y));
                    if (di < ra * 1.025) {
                        exclude = true;
                        break
                    }
                }
                if (!exclude) {
                    this.drawLine({x: xx1, y: yy1, z: 0}, {x: xx2, y: yy2, z: 0});
                    endpt = {x: xx2, y: yy2}
                } else {
                    if (startpt.x != endpt.x && startpt.y != endpt.y) {
                        ends.push(startpt);
                        ends.push(endpt)
                    }
                    startpt = {x: xx2, y: yy2};
                    endpt = {x: xx2, y: yy2}
                }
                xx1 = xx2;
                yy1 = yy2
            }
            if (startpt.x != endpt.x && startpt.y != endpt.y) {
                ends.push(startpt);
                ends.push(endpt)
            }
            this.ctx.stroke();
            this.ctx.lineWidth = 1.5
        }
        var lbl;
        if ((lbl = this.atomLabel(at)).length) {
            this.ctx.save();
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            var nImpHyd = this.chem.H(at) - at.nHyd;
            var w = this.ctx.measureText(lbl).width;
            var p1 = {x: r.x + w / 2, y: r.y + fontSize / 2};
            w -= (lbl.length - 1) * 3;
            var color;
            if (!this.bgDark) color = this.atomColors[Chemical.elementName(at.cd)]; else color = this.atomColorsLight[Chemical.elementName(at.cd)];
            if (typeof color == "undefined") {
                !this.bgDark ? color = "#000000" : color = "#ffffff"
            }
            this.ctx.font = "bold " + fontSize + "px Arial";
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            this.ctx.fillText(lbl, p1.x, p1.y);
            if (nImpHyd > 0 && at.cd != 6) {
                this.ctx.fillText("H", p1.x + w, p1.y);
                w += this.ctx.measureText("H").width;
                if (nImpHyd > 1) {
                    this.ctx.font = "bold " + Math.floor(fontSize * .75) + "px Arial";
                    this.ctx.fillText(nImpHyd.toString(), p1.x + w - 2, p1.y + Math.floor(fontSize * .3))
                }
            }
            if (this.lonePairDisplay_) {
                var dot = String.fromCharCode(183);
                var ww = this.ctx.measureText(dot).width;
                var n_lone_pair = this.lonePairDisplay_ == 1 ? at.hba_h : at.lone_pairs;
                for (var k = 0; k < n_lone_pair; k++) {
                    var v = {x: -1, y: 0, z: 0};
                    var kk = k;
                    var b = true;
                    if (at.bo.length == 1) {
                        v = vector(this.wtos(this.chem.atoms[at.bo[0]]), this.wtos(at));
                        if (n_lone_pair == 2) kk = k + 1
                    } else if (at.bo.length == 2) {
                        if (n_lone_pair == 2) {
                            v = vector(this.wtos(this.chem.atoms[at.bo[k]]), this.wtos(at));
                            b = false
                        } else {
                            v = veadd(vector(this.wtos(at), this.wtos(this.chem.atoms[at.bo[0]])), vector(this.wtos(at), this.wtos(this.chem.atoms[at.bo[1]])));
                            v = vemulby(v, -1)
                        }
                    } else if (at.bo.length == 3) {
                        v = vector(this.wtos(this.chem.atoms[at.bo[0]]), this.wtos(at))
                    }
                    if (b) {
                        if (kk == 1) v = {x: -v.y, y: v.x, z: 0}; else if (kk == 2) v = {
                            x: v.y,
                            y: -v.x,
                            z: 0
                        }; else if (kk == 3) v = {x: -v.x, y: -v.y, z: 0}
                    }
                    v = vectorSetLength(v, Math.sqrt(r.w * r.w + r.h * r.h) / 2);
                    var mid = {x: r.x + r.w / 2, y: r.y + r.h / 2, z: 0};
                    var p = veadd(mid, v);
                    var v1 = {x: -v.y, y: v.x, z: 0};
                    v1 = vectorSetLength(v1, ww / 2);
                    var v2 = {x: v.y, y: -v.x, z: 0};
                    v2 = vectorSetLength(v2, ww / 2);
                    var p1 = veadd(p, v1);
                    var p2 = veadd(p, v2);
                    this.ctx.fillText(dot, p1.x, p1.y);
                    this.ctx.fillText(dot, p2.x, p2.y)
                }
            }
            this.ctx.restore()
        }
        if (this.h_atom == i) {
            this.ctx.strokeStyle = "#ff0000";
            this.ctx.strokeRect(r.x, r.y, r.w, r.h)
        }
    }
    if (ends.length) {
        this.ctx.strokeStyle = "#ff1a1a";
        this.ctx.lineWidth = this.circleDegreeAsDrawn_;
        var idx = [];
        for (var i = 0; i < ends.length; i++) for (var j = i + 1; j < ends.length; j++) {
            var di = Math.sqrt((ends[i].x - ends[j].x) * (ends[i].x - ends[j].x) + (ends[i].y - ends[j].y) * (ends[i].y - ends[j].y));
            if (di < .05) {
                idx.push(i);
                idx.push(j)
            }
        }
        if (idx.length) {
            idx = idx.sort(function (a, b) {
                return b - a
            });
            ends.splice(idx[0], 1);
            for (var i = 1; i < idx.length; i++) {
                if (idx[i] != idx[i - 1]) ends.splice(idx[i], 1)
            }
        }
        this.ctx.beginPath();
        for (var i = 0; i < ends.length; i++) {
            for (var j = i + 1; j < ends.length; j++) {
                var di = Math.sqrt((ends[i].x - ends[j].x) * (ends[i].x - ends[j].x) + (ends[i].y - ends[j].y) * (ends[i].y - ends[j].y));
                if (di <= bl * .1) {
                    this.drawLine(ends[i], ends[j])
                }
            }
        }
        this.ctx.stroke();
        this.ctx.lineWidth = 1.5
    }
    if (this.rotateAroundPoint != null) {
        var p = this.wtos(this.rotateAroundPoint);
        this.ctx.drawImage(rotateAroundImage, p.x - rotateAroundImage.width / 2, p.y - rotateAroundImage.height / 2)
    }
    for (var i = 0; i < this.chem.bonds.length; i++) {
        var bo = this.chem.bonds[i];
        if (false) {
            var p1 = this.wtos(vemulby(veadd(this.chem.atoms[bo.fr], this.chem.atoms[bo.to]), .5));
            this.ctx.fillStyle = "#b2ffb2";
            this.ctx.beginPath();
            this.ctx.arc(p1.x, p1.y, .1 * this.kfc, 0, 2 * Math.PI);
            this.ctx.fill()
        }
    }
    if (this.bgDark) {
        this.ctx.strokeStyle = "#CACACA";
        this.ctx.fillStyle = "#CACACA"
    } else {
        if (this.disabled) this.ctx.strokeStyle = "#D3D3D3"; else this.ctx.strokeStyle = "#1a1a1a";
        this.ctx.fillStyle = "#000000"
    }
    if (this.thinbondline) {
        this.ctx.save();
        this.ctx.lineWidth = 1
    }
    this.ctx.beginPath();
    for (var i = 0; i < this.chem.bonds.length; i++) {
        var bo = this.chem.bonds[i];
        var fr = xyz(this.chem.atoms[bo.fr]);
        var to = xyz(this.chem.atoms[bo.to]);
        var dir;
        if (this.atomLabel(this.chem.atoms[bo.fr]).length) {
            var r = this.atomRect(this.chem.atoms[bo.fr], fontSize);
            var ofs = (r.w + r.w + 2) / (4 * this.kfc);
            dir = vectorSetLength(vector(fr, to), ofs);
            fr = veadd(fr, dir)
        }
        if (this.atomLabel(this.chem.atoms[bo.to]).length) {
            var r = this.atomRect(this.chem.atoms[bo.to], fontSize);
            var ofs = (r.w + r.w + 2) / (4 * this.kfc);
            dir = vectorSetLength(vector(to, fr), ofs);
            to = veadd(to, dir)
        }
        switch (bo.ty) {
            case 2: {
                var v = this.bondOrtho(bo.fr, bo.to, bo.ty, .25);
                if (this.chem.atoms[bo.fr].hyb == HYB_SP1 || this.chem.atoms[bo.to].hyb == HYB_SP1 || this.chem.atoms[bo.fr].bo.length == 1 || this.chem.atoms[bo.to].bo.length == 1) {
                    this.drawLine(veadd(fr, vemulby(v, -.5)), veadd(to, vemulby(v, -.5)));
                    this.drawLine(veadd(fr, vemulby(v, .5)), veadd(to, vemulby(v, .5)))
                } else {
                    this.drawLine(fr, to);
                    var shift = vectorSetLength(vector(fr, to), .2);
                    this.drawLine(veadd(veadd(fr, v), shift), veadd(veadd(to, v), vemulby(shift, -1)))
                }
            }
                break;
            case 3: {
                this.drawLine(fr, to);
                var v = this.bondOrtho(bo.fr, bo.to, bo.ty, .15);
                var shift = vectorSetLength(vector(fr, to), .2);
                this.drawLine(veadd(veadd(fr, v), shift), veadd(veadd(to, v), vemulby(shift, -1)));
                v = vemulby(v, -1);
                this.drawLine(veadd(veadd(fr, v), shift), veadd(veadd(to, v), vemulby(shift, -1)))
            }
                break;
            default: {
                if (bo.eo == E_BOEOTY_UP) {
                    this.ctx.closePath();
                    this.ctx.stroke();
                    var v = this.bondOrtho(bo.fr, bo.to, 3, .2);
                    this.ctx.beginPath();
                    this.moveTo(fr);
                    this.lineTo(veadd(to, v));
                    this.lineTo(veadd(to, vemulby(v, -1)));
                    this.lineTo(fr);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.beginPath()
                } else if (bo.eo == E_BOEOTY_DW) {
                    var bov = vector(fr, to);
                    var len = vectorLength(bov);
                    var nsteps = Math.round(this.kfc / 17.5 * (5 * (len / 1.2)));
                    var step = len / nsteps;
                    var vstep = vectorSetLength(vector(to, fr), step);
                    var v = this.bondOrtho(bo.fr, bo.to, 3, .2);
                    var pp = xyz(to);
                    for (var k = 0; k < nsteps; k++) {
                        var aa = vemulby(v, 1 - k / nsteps);
                        this.drawLine(veadd(pp, vemulby(aa, .9)), veadd(pp, vemulby(aa, -.9)));
                        pp = veadd(pp, vstep)
                    }
                } else if (bo.eo == E_BOEOTY_AH) {
                    this.ctx.closePath();
                    this.ctx.stroke();
                    var bov = vector(fr, to);
                    var len = vectorLength(bov);
                    var nsteps = 2 * Math.round(this.kfc / 17.5 * (5 * (len / 1.2)));
                    var step = len / nsteps;
                    var vstep = vectorSetLength(vector(to, fr), step);
                    var v = this.bondOrtho(bo.fr, bo.to, 3, .2);
                    var pp = xyz(to);
                    this.ctx.beginPath();
                    this.moveTo(pp);
                    for (var k = 0; k < nsteps; k++) {
                        var aa = vemulby(v, 1 - k / nsteps);
                        this.lineTo(veadd(pp, vemulby(aa, k % 2 == 0 ? .9 : -.9)));
                        pp = veadd(pp, vstep)
                    }
                    this.ctx.stroke();
                    this.ctx.beginPath()
                } else this.drawLine(fr, to)
            }
                break
        }
    }
    this.ctx.closePath();
    this.ctx.stroke();
    if (this.thinbondline) {
        this.ctx.restore()
    }
    for (var i = 0; i < this.chem.atoms.length; i++) {
        var at = this.chem.atoms[i];
        if (at.apo_pos) {
            var fr = xyz(at);
            var fr2 = fr;
            var to = xyz(at.apo_pos);
            if (this.atomLabel(at).length) {
                var r = this.atomRect(at, fontSize);
                var ofs = (r.w + r.w + 2) / (4 * this.kfc);
                dir = vectorSetLength(vector(fr, to), ofs);
                fr = veadd(fr, dir)
            }
            var vv = this.chem.bondOrtho(i, -1, 1, .03);
            var p1 = veadd(at.apo_pos, vemulby(vector(at.apo_pos, at), .2));
            this.ctx.beginPath();
            this.drawLine(fr, to);
            this.drawLine(to, xyz(veadd(p1, vv)));
            this.drawLine(to, xyz(veadd(p1, vemulby(vv, -1))));
            this.ctx.stroke();
            dir = vesub(to, fr2);
            dir = vectorSetLength(dir, vectorLength(dir) * 1.2);
            p1 = this.wtos(veadd(fr2, dir));
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "center";
            this.ctx.font = "" + fontSize + "px Arial";
            this.ctx.strokeText("*", p1.x, p1.y)
        }
    }
    var wrapText = function (context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(/\s+/);
        var line = "";
        var h = lineHeight;
        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + " ";
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + " ";
                y += lineHeight;
                h += lineHeight
            } else {
                line = testLine
            }
        }
        context.fillText(line, x, y);
        return h
    };
    for (var i = 0; i < this.chem.annotations.length; i++) {
        var t = this.chem.annotations[i];
        var p = this.wtos(t);
        var r = {x: 0, y: 0, w: 0, h: 0};
        drawArrowhead = function (ctx, fr, to) {
            ctx.beginPath();
            var dir = vector(fr, to);
            var dir90 = vectorSetLength({x: -dir.y, y: dir.x, z: 0}, vectorLength(dir) / 4);
            console.log(dir, dir90);
            ctx.moveTo(to.x, to.y);
            ctx.lineTo(to.x - dir.x + dir90.x, to.y - dir.y + dir90.y);
            ctx.lineTo(to.x - dir.x - dir90.x, to.y - dir.y - dir90.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke()
        };
        if (t.isArrow || t.text.match(/_ARROW[0-9]_/)) {
            if (t.text == "_ARROW_") {
                t.width = this.chem.bondLength() * 1.25;
                t.height = this.chem.bondLength() * .4;
                this.ctx.beginPath();
                var bl = this.chem.bondLength() * this.kfc;
                this.ctx.moveTo(p.x, p.y);
                r.x = p.x;
                r.y = p.y - bl * .2;
                p.y -= bl * .1;
                this.ctx.lineTo(p.x, p.y);
                p.x += bl;
                this.ctx.lineTo(p.x, p.y);
                p.y -= bl * .1;
                this.ctx.lineTo(p.x, p.y);
                p.x += bl * .25;
                p.y += bl * .2;
                this.ctx.lineTo(p.x, p.y);
                p.x -= bl * .25;
                p.y += bl * .2;
                this.ctx.lineTo(p.x, p.y);
                p.y -= bl * .1;
                this.ctx.lineTo(p.x, p.y);
                p.x -= bl;
                this.ctx.lineTo(p.x, p.y);
                p.y -= bl * .1;
                this.ctx.lineTo(p.x, p.y);
                r.w = bl * 1.25;
                r.h = bl * .4;
                this.ctx.strokeStyle = "#000000";
                this.ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
                this.ctx.stroke();
                this.ctx.fill()
            } else if (t.text == "_ARROW1_") {
                t.width = this.chem.bondLength() * .5;
                t.height = this.chem.bondLength() * .5;
                var r = t.width * this.kfc / 2;
                this.ctx.beginPath();
                var ct = {x: p.x + r, y: p.y + r, z: 0};
                this.ctx.ellipse(ct.x, ct.y, r, r, 0, 0, Math.PI * 1.5);
                this.ctx.strokeStyle = "#000000";
                this.ctx.stroke();
                this.ctx.fillStyle = "#000000";
                drawArrowhead(this.ctx, {x: ct.x, y: ct.y - r, z: 0}, {x: ct.x + r / 2, y: ct.y - r, z: 0})
            }
        } else {
            this.ctx.textBaseline = "top";
            this.ctx.font = "" + fontSize + "px Arial";
            r.x = p.x;
            r.y = p.y;
            if (t.width) {
                var w = this.kfc * t.width;
                r.h = wrapText(this.ctx, t.text, p.x, p.y, w, fontSize);
                r.w = w
            } else {
                this.ctx.fillText(t.text, p.x, p.y);
                r.h = fontSize;
                r.w = this.ctx.measureText(t.text).width
            }
        }
        if (this.h_text == i) {
            this.ctx.strokeStyle = "#ff0000";
            this.ctx.strokeRect(r.x, r.y, r.w, r.h)
        }
    }
    if (this.h_bond != -1) {
        this.ctx.beginPath();
        var bo = this.chem.bonds[this.h_bond];
        var poly = this.bondRect(bo);
        for (var k = 0; k < poly.length; k++) {
            this.drawLine(poly[k], poly[(k + 1) % poly.length])
        }
        this.ctx.strokeStyle = "#ff0000";
        this.ctx.stroke()
    }
    if (this.lassoPath.length > 0) {
        this.ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
        this.ctx.strokeStyle = "#000000";
        this.ctx.beginPath();
        for (var i = 0; i < this.lassoPath.length; i++) {
            if (!i) this.ctx.moveTo(this.lassoPath[i].x, this.lassoPath[i].y);
            this.ctx.lineTo(this.lassoPath[(i + 1) % this.lassoPath.length].x, this.lassoPath[(i + 1) % this.lassoPath.length].y)
        }
        this.ctx.closePath();
        this.ctx.fill()
    }
};

function getXMLObject(crossDomain) {
    if (crossDomain) {
        return /MSIE/.test(navigator.userAgent) ? new XDomainRequest : new XMLHttpRequest
    }
    var xmlHttp = false;
    try {
        xmlHttp = new ActiveXObject("Msxml2.XMLHTTP")
    } catch (e) {
        try {
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP")
        } catch (e2) {
            xmlHttp = false
        }
    }
    if (!xmlHttp && typeof XMLHttpRequest != "undefined") {
        xmlHttp = new XMLHttpRequest
    }
    return xmlHttp
}

(function (ctx) {
    var sprintf = function () {
        if (!sprintf.cache.hasOwnProperty(arguments[0])) {
            sprintf.cache[arguments[0]] = sprintf.parse(arguments[0])
        }
        return sprintf.format.call(null, sprintf.cache[arguments[0]], arguments)
    };
    sprintf.format = function (parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad,
            pad_character, pad_length;
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if (node_type === "string") {
                output.push(parse_tree[i])
            } else if (node_type === "array") {
                match = parse_tree[i];
                if (match[2]) {
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw sprintf('[sprintf] property "%s" does not exist', match[2][k])
                        }
                        arg = arg[match[2][k]]
                    }
                } else if (match[1]) {
                    arg = argv[match[1]]
                } else {
                    arg = argv[cursor++]
                }
                if (/[^s]/.test(match[8]) && get_type(arg) != "number") {
                    throw sprintf("[sprintf] expecting number but found %s", get_type(arg))
                }
                switch (match[8]) {
                    case"b":
                        arg = arg.toString(2);
                        break;
                    case"c":
                        arg = String.fromCharCode(arg);
                        break;
                    case"d":
                        arg = parseInt(arg, 10);
                        break;
                    case"e":
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                        break;
                    case"f":
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                        break;
                    case"o":
                        arg = arg.toString(8);
                        break;
                    case"s":
                        arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;
                        break;
                    case"u":
                        arg = arg >>> 0;
                        break;
                    case"x":
                        arg = arg.toString(16);
                        break;
                    case"X":
                        arg = arg.toString(16).toUpperCase();
                        break
                }
                arg = /[def]/.test(match[8]) && match[3] && arg >= 0 ? "+" + arg : arg;
                pad_character = match[4] ? match[4] == "0" ? "0" : match[4].charAt(1) : " ";
                pad_length = match[6] - String(arg).length;
                pad = match[6] ? str_repeat(pad_character, pad_length) : "";
                output.push(match[5] ? arg + pad : pad + arg)
            }
        }
        return output.join("")
    };
    sprintf.cache = {};
    sprintf.parse = function (fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
        while (_fmt) {
            if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                parse_tree.push(match[0])
            } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                parse_tree.push("%")
            } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1]);
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                            if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            } else {
                                throw"[sprintf] huh?"
                            }
                        }
                    } else {
                        throw"[sprintf] huh?"
                    }
                    match[2] = field_list
                } else {
                    arg_names |= 2
                }
                if (arg_names === 3) {
                    throw"[sprintf] mixing positional and named placeholders is not (yet) supported"
                }
                parse_tree.push(match)
            } else {
                throw"[sprintf] huh?"
            }
            _fmt = _fmt.substring(match[0].length)
        }
        return parse_tree
    };
    var vsprintf = function (fmt, argv, _argv) {
        _argv = argv.slice(0);
        _argv.splice(0, 0, fmt);
        return sprintf.apply(null, _argv)
    };

    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
    }

    function str_repeat(input, multiplier) {
        for (var output = []; multiplier > 0; output[--multiplier] = input) {
        }
        return output.join("")
    }

    ctx.sprintf = sprintf;
    ctx.vsprintf = vsprintf
})(typeof exports != "undefined" ? exports : window);
Module.toggleFullscreen = function (that, element) {
    if (!document.fullscreenEnabled && !document.mozFullScreenEnabled && !document.webkitFullscreenEnabled && !document.msFullscreenEnabled) {
        alert("fullscreen mode (currently) not possible");
        return
    }
    that.lastFullscreenElement = element;

    function getFullscreenElement() {
        return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement
    }

    function resizeElement() {
        if (!getFullscreenElement() && that.lastFullscreenElement) {
            var element = that.lastFullscreenElement;
            element.style.width = element.dataset.normalWidth;
            element.style.height = element.dataset.normalHeight;
            document.removeEventListener("fullscreenchange", resizeElement);
            document.removeEventListener("mozfullscreenchange", resizeElement);
            document.removeEventListener("webkitfullscreenchange", resizeElement);
            document.removeEventListener("MSFullscreenChange", resizeElement);
            that.updateLayout()
        }
    }

    if (!getFullscreenElement()) {
        element.dataset.normalWidth = element.style.width;
        element.dataset.normalHeight = element.style.height;
        element.style.width = screen.width + "px";
        element.style.height = screen.height + "px";
        if (element.requestFullscreen) {
            element.requestFullscreen()
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen()
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen()
        }
        document.addEventListener("fullscreenchange", resizeElement);
        document.addEventListener("mozfullscreenchange", resizeElement);
        document.addEventListener("webkitfullscreenchange", resizeElement);
        document.addEventListener("MSFullscreenChange", resizeElement);
        that.updateLayout();
        setTimeout(function () {
            that.updateLayout()
        }, 100)
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen()
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
};
Module.makeImage = function (name, tooltip, className, w, h) {
    var img = document.createElement("img");
    if (name.startsWith("http://") || name.startsWith("https://")) img.src = name; else img.src = Module.locationPrefix + "icons/" + name;
    if (tooltip) img.title = tooltip;
    if (className) img.className = className;
    if (w) img.style.width = Math.round(w * window.devicePixelRatio) + "px";
    if (h) img.style.height = Math.round(h * window.devicePixelRatio) + "px";
    return img
};
Module.makeToolButton = function (name, tooltip, className) {
    var btn = document.createElement("button");
    if (typeof name == "string") btn.innerHTML = name; else btn.appendChild(name);
    if (tooltip) btn.title = tooltip;
    if (className) btn.className = className;
    return btn
};
