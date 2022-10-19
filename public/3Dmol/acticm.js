{
    var sel = document.querySelector('script[src$="acticm.js"]');
    var src = sel.getAttribute("src");
    var ua = navigator.userAgent.toLowerCase();
    var wasm_mode = sel.getAttribute("wasm") != "0";
    var scriptFolder = src.substring(0, src.lastIndexOf("/") + 1);
    if (typeof Module == "undefined") {
        Module = {};
        if (wasm_mode) {
            Module.print = function (text) {};
            Module.printErr = function (text) {};
            Module.locateFile = function (path, prefix) {
                if (path.endsWith(".mem")) return scriptFolder + path;
                return prefix + path
            };
            Module.locationPrefix = scriptFolder
        } else {
            Module.memoryInitializerPrefixURL = scriptFolder;
            Module.locationPrefix = scriptFolder;
            Module.TOTAL_MEMORY = 4e8
        }
    }
    Module.cached_svg_images = {};
    Module.loadScript = function (path) {
        var script = document.createElement("script");
        script.src = path;
        document.getElementsByTagName("head")[0].appendChild(script)
    };
    Module.gapi_queue = [];
    var loadCss = function (path) {
        var script = document.createElement("link");
        script.rel = "stylesheet";
        script.type = "text/css";
        script.href = path;
        document.getElementsByTagName("head")[0].appendChild(script)
    };
    loadCss(Module["locationPrefix"] + "tabs.css");
    Module.loadScript(Module["locationPrefix"] + "tabs.js");
    Module.loadScript(Module["locationPrefix"] + "moledit.js");
    Module.loadScript(Module["locationPrefix"] + (wasm_mode ? "libicm2.js" : "libicm.js"))
}
var clientId = "106961626697-l2kr8bkd22e2kqdqef0b209csrvpd7sj.apps.googleusercontent.com";
var apiKey = "AIzaSyA9pOCYBPbSGuifacN1nxBYF3xBFDGVmO4";
var scopes = "https://www.googleapis.com/auth/drive";
{
    G_WIRE = 0;
    G_STICK = 1;
    G_BBALL = 2;
    G_SBALL = 3;
    G_DBALL = 4;
    G_SKIN = 5;
    G_ATLABEL = 6;
    G_TOLABEL = 7;
    G_APLABEL = 8;
    G_BLLABEL = 9;
    G_HB = 10;
    G_TZ = 11;
    G_CN = 12;
    G_GRAD = 13;
    G_KL = 14;
    G_SKINXS = 15;
    G_RELABEL = 16;
    G_RIBBON = 17;
    G_BASE = 18;
    G_SITE = 19;
    G_ALISEL = 20;
    G_GROB_SKIN = 21;
    MNGFTY = 22;
    M_WIRE = 1 << G_WIRE;
    M_STICK = 1 << G_STICK;
    M_BBALL = 1 << G_BBALL;
    M_SBALL = 1 << G_SBALL;
    M_ATLABEL = 1 << G_ATLABEL;
    M_TOLABEL = 1 << G_TOLABEL;
    M_APLABEL = 1 << G_APLABEL;
    M_BLLABEL = 1 << G_BLLABEL;
    M_VALABEL = M_TOLABEL | M_APLABEL | M_BLLABEL;
    M_DBALL = 1 << G_DBALL;
    M_SKIN = 1 << G_SKIN;
    M_TZ = 1 << G_TZ;
    M_CN = 1 << G_CN;
    M_HB = 1 << G_HB;
    M_GRAD = 1 << G_GRAD;
    M_SKINXS = 1 << G_SKINXS;
    M_KL = 1 << G_KL;
    M_GROB_SKIN = 1 << G_GROB_SKIN;
    M_RELABEL = 1 << G_RELABEL;
    M_RIBBON = 1 << G_RIBBON;
    M_BASE = 1 << G_BASE;
    M_SITE = 1 << G_SITE;
    M_ALISEL = 1 << G_ALISEL;
    DSTB_0 = 0;
    DSTB_PICK1 = 20;
    DSTB_PICK2 = 21;
    DSTB_PICK3 = 22;
    DSTB_PICK4 = 23;
    Module.bvNull = 0;
    Module.bvString = 1;
    Module.bvInt = 2;
    Module.bvReal = 3;
    Module.bvVVector = 4;
    Module.bvBitVector = 5;
    Module.bvChemical = 6;
    Module.bvReaction = 7;
    Module.bvSequence = 8;
    Module.bvRegex = 9;
    Module.bvBool = 10;
    Module.bvSVector = 11;
    Module.bvIVector = 12;
    Module.bvRVector = 13;
    Module.bvSparseIVector = 14;
    Module.bvSparseRVector = 15;
    Module.bvIMatrix = 16;
    Module.bvRMatrix = 17;
    Module.bvEnum = 18;
    Module.bvVariant = 19;
    Module.bvChar = 20;
    Module.bvVector = 21;
    Module.bvType = 22;
    Module.bvMolob = 23;
    Module.bvColor = 24;
    Module.bvNullVector = 25;
    Module.bvImage = 26;
    Module.bvXRVector = 27;
    Module.bvDate = 28;
    Module.bvDateVector = 29;
    Module.bvMap = 30;
    Module.bvWord = 31;
    Module.bvIcmMap = 32;
    Module.bvIcmPredModel = 33;
    Module.bvIcmGrob = 34;
    Module.bvBlob = 35;
    Module.bvRange = 36;
    Module.bvIcmSlat = 37;
    Module.M_LOCK_DS = 1 << 14;
    Module.M_LARRAY = 1 << 20;
    Module.M_IS_SELECTED_COL = 1 << 16;
    Module.M_SL_TABLE = 1 << 32 - 3;
    Module.BeeUnsortedOrder = 0;
    Module.BeeAscendingOrder = 1;
    Module.BeeDescendingOrder = 2;
    Module.DEF_CHEM_WIDTH = 200;
    Module.DEF_CHEM_HEIGHT = 200;
    Module.M_TAB_EXMG_COMPRESSED_VIEW = 1 << 0;
    Module.getStyleVal = function (elm, css) {
        return window.getComputedStyle(elm, null).getPropertyValue(css)
    }
}

function ActiveIcmJS(parentCont) {
    Module.print(window.navigator.userAgent);
    Module.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var that = this;
    Module.chem = new Module.Chemical("");
    this.lastProjectCookieKey = "icmjs_lastProject";
    this.layoutCookieKey = "icmjs_layout";
    this.authTokenKey = "icmjs_token";
    this.cookiesEnabled = true;
    this.msie = window.navigator.userAgent.indexOf("Trident") > 0;
    this.par = document.getElementById(parentCont);
    this.par.style.position = "relative";
    this.par.act_cont = this;
    this.cont = document.createElement("div");
    this.cont.style.position = "absolute";
    this.cont.style.left = "0";
    this.cont.style.top = "0";
    this.cont.style.width = "100%";
    this.cont.style.height = "100%";
    this.cont.style["z-index"] = "0";
    this.cont.id = parentCont + "_cont";
    this.par.appendChild(this.cont);
    this.modal_bg = document.createElement("div");
    this.modal_bg.className = "modalbg";
    this.modal_bg.style["z-index"] = 5;
    this.cont.appendChild(this.modal_bg);
    this.caption = document.createElement("div");
    this.caption.par = this;
    this.cont.appendChild(this.caption);
    this.req = null;
    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.style.position = "absolute";
    this.searchInput.style.display = "none";
    this.searchInput.style.width = "99%";
    this.searchInput.style.height = "30px";
    this.searchInput.placeholder = "PDB code, author, keyword...";
    this.searchInput.id = parentCont + "_searchInput";
    this.searchInput.autocomplete = "off";
    this.searchInput.oninput = this.searchInput.onpaste = function (e) {
        that.hideMenu();
        that.submitSearch(this.value)
    };
    this.searchInput.onkeydown = function (e) {
        if (that.searchPanel.style.display == "block") {
            if (e.keyCode == 40) {
                that.searchPanel.down();
                return false
            } else if (e.keyCode == 38) {
                that.searchPanel.up();
                return false
            } else if (e.keyCode == 13) {
                that.searchPanel.loadCurrent();
                return false
            } else if (e.keyCode == 27) {
                that.searchPanel.style.display = "none"
            }
        }
        return true
    };
    this.cont.appendChild(this.searchInput);
    this.searchPanel = document.createElement("ul");
    this.searchPanel.style.backgroundColor = "white";
    this.searchPanel.style.display = "none";
    this.searchPanel.style.position = "absolute";
    this.searchPanel.style.left = "0";
    this.searchPanel.style["z-index"] = "2";
    this.searchPanel.tabindex = "0";
    this.cont.appendChild(this.searchPanel);
    this.par.canvas = this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style["z-index"] = "0";
    this.canvas.style["touch-action"] = "none";
    this.canvas.style["ms-touch-action"] = "none";
    this.canvas.id = parentCont + "_canvas";
    this.cont.appendChild(this.canvas);
    this.currentProjectInfo = {};
    this.par.act = this.act = new Module.ActiveIcm(parentCont, 0, 0);
    this.canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        return false
    }, false);
    this.studentMode_ = false;
    this.layout = {mode: "ver", tab_splitter_ratio: .3, tab_vsplitter_ratio: .4, tab_vsplitter2_ratio: .25};
    var lay_cookie = docCookies.getItem(this.layoutCookieKey);
    if (lay_cookie.length) this.layout = JSON.parse(lay_cookie);
    Object.defineProperty(this, "version", {
        get: function () {
            return this.act.version
        }
    });
    Object.defineProperty(this, "projectFile", {
        get: function () {
            return this.act.projectFile
        }, set: function (v) {
            this.act.projectFile = v;
            this.setCurrentProjectInfo({id: v, type: "url"})
        }
    });
    Object.defineProperty(this, "projectSizeLimit", {
        get: function () {
            return this.act.projectSizeLimit
        }, set: function (v) {
            this.act.projectSizeLimit = v
        }
    });
    Object.defineProperty(this, "anaglyphStereo", {
        get: function () {
            return this.act.anaglyphStereo
        }, set: function (v) {
            this.act.anaglyphStereo = v
        }
    });
    Object.defineProperty(this, "nofSlides", {
        get: function () {
            return this.act.nofSlides
        }
    });
    Object.defineProperty(this, "nofActiveDownloads", {
        get: function () {
            return this.act.nofActiveDownloads
        }
    });
    Object.defineProperty(this, "currentSlide", {
        get: function () {
            return this.act.currentSlide
        }, set: function (v) {
            this.act.currentSlide = v
        }
    });
    Object.defineProperty(this, "rockView", {
        get: function () {
            return this.act.currentSlide
        }, set: function (v) {
            this.act.rockView = v
        }
    });
    Object.defineProperty(this, "onDisplayChange", {
        get: function () {
            return this.act.onDisplayChange
        }, set: function (v) {
            this.act.onDisplayChange = v
        }
    });
    Object.defineProperty(this, "onLoadProject", {
        get: function () {
            return this.act.onLoadProject
        }, set: function (v) {
            this.act.onLoadProject = v
        }
    });
    Object.defineProperty(this, "webglContext", {
        get: function () {
            return this.act.webglContext
        }
    });
    Object.defineProperty(this, "image", {
        get: function () {
            return this.act.image
        }
    });
    Object.defineProperty(this, "sequenceViewVisible", {
        get: function () {
            return this.seq_cont.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.seq_cont, v)
        }
    });
    Object.defineProperty(this, "sequenceContentsVisible", {
        get: function () {
            return this.seq.cont.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.seq.cont, v)
        }
    });
    Object.defineProperty(this, "tableViewVisible", {
        get: function () {
            return this.tabsPanel.mainDiv.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.tabsPanel.mainDiv, v)
        }
    });
    Object.defineProperty(this, "toolsViewVisible", {
        get: function () {
            return this.toolsPanel.mainDiv.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.toolsPanel.mainDiv, v)
        }
    });
    Object.defineProperty(this, "searchBarVisible", {
        get: function () {
            return this.searchInput.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.searchInput, v)
        }
    });
    Object.defineProperty(this, "titleBarVisible", {
        get: function () {
            return this.caption.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.caption, v)
        }
    });
    Object.defineProperty(this, "menuVisible", {
        get: function () {
            return this.menuButton.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.menuButton, v)
        }
    });
    Object.defineProperty(this, "gfVisible", {
        get: function () {
            return this.canvas.style.display != "none"
        }, set: function (v) {
            this.setElementVisible(this.canvas, v)
        }
    });
    Object.defineProperty(this, "studentMode", {
        get: function () {
            return this.studentMode_
        }, set: function (v) {
            this.studentMode_ = v;
            this.refresh();
            this.rebuildMenu()
        }
    });
    Object.defineProperty(this, "layoutMode", {
        get: function () {
            return this.layout.mode
        }, set: function (v) {
            if (v == "hor" || v == "ver") {
                this.layout.mode = v;
                this.updateLayout()
            }
        }
    });
    Object.defineProperty(this, "tab_splitter_ratio", {
        get: function () {
            return this.layout.tab_splitter_ratio
        }, set: function (v) {
            this.layout.tab_splitter_ratio = v
        }
    });
    Object.defineProperty(this, "tab_vsplitter_ratio", {
        get: function () {
            return this.layout.tab_vsplitter_ratio
        }, set: function (v) {
            this.layout.tab_vsplitter_ratio = v
        }
    });
    Object.defineProperty(this, "tab_vsplitter2_ratio", {
        get: function () {
            return this.layout.tab_vsplitter2_ratio
        }, set: function (v) {
            this.layout.tab_vsplitter2_ratio = v
        }
    });
    if (!this.webglContext) {
        var div = document.createElement("div");
        this.cont.appendChild(div);
        this.par.canvas = this.canvas = div;
        this.canvas.innerHTML = '<h1 style="margin:auto">Cannot initialize WebGL. Check your browser settings</h1>'
    }
    if (window.PointerEvent) {
        that.act.usePointers = Module.usePointers = true;
        this.canvas.addEventListener("pointerdown", function (ev) {
            that.act.pointerDown(ev);
            ev.preventDefault()
        }, false);
        this.canvas.addEventListener("pointerup", function (ev) {
            that.act.pointerUp(ev);
            ev.preventDefault()
        }, false);
        this.canvas.addEventListener("pointermove", function (ev) {
            that.act.pointerMove(ev);
            ev.preventDefault()
        }, false)
    }
    this.canvas.onmousedown = function () {
        that.hideMenu()
    };
    this.canvas.ontouchstart = function () {
        that.hideMenu()
    };
    this.seq_cont = document.createElement("div");
    this.seq_cont.style.position = "absolute";
    this.seq_cont.style.left = "0";
    this.seq_cont.style.width = "100%";
    this.seq_cont.style["z-index"] = "1";
    this.par.seq = this.seq = new SequenceView(this.seq_cont);
    this.seq.id = parentCont + "_seq";
    this.cont.appendChild(this.seq_cont);
    this.seq_cont.style.display = "none";
    this.seq_cont.style["z-index"] = "2";
    this.sequenceViewVisibleAuto = true;
    this.tab_splitter = document.createElement("div");
    this.tab_splitter.className = "hsplitter";
    this.tab_splitter.style.display = "none";
    this.tab_splitter.style["z-index"] = "3";
    this.cont.appendChild(this.tab_splitter);
    Module.makeDraggable(this.tab_splitter, this.tab_splitter, false, true, null, null, null, function (el) {
        var p = 1 - that.tab_splitter.offsetTop / that.cont.offsetHeight;
        that.tabsPanel.mainDiv.style.height = p * 100 + "%";
        that.tab_splitter_ratio = p;
        that.updateLayout();
        that.saveLayoutToCookies()
    });
    this.tab_vsplitter = document.createElement("div");
    this.tab_vsplitter.className = "vsplitter";
    this.tab_vsplitter.style.display = "none";
    this.tab_vsplitter.style["z-index"] = "3";
    this.tab_vsplitter.style["padding"] = "0px";
    this.cont.appendChild(this.tab_vsplitter);
    Module.makeDraggable(this.tab_vsplitter, this.tab_vsplitter, true, false, null, null, null, function (el) {
        var p = 1 - that.tab_vsplitter.offsetLeft / that.cont.offsetWidth;
        that.tab_vsplitter_ratio = p;
        that.updateLayout();
        that.saveLayoutToCookies()
    });
    this.tables = [];
    this.alignments = [];
    this.htmls = [];
    this.tableHeightPerc = 20;
    this.tabsPanel = new ActiveIcmTabView;
    this.tabsPanel.mainDiv.style.position = "absolute";
    this.tabsPanel.mainDiv.style.left = "0";
    this.tabsPanel.mainDiv.style.width = "100%";
    this.tabsPanel.mainDiv.style["z-index"] = "1";
    this.cont.appendChild(this.tabsPanel.mainDiv);
    this.tabsPanel.mainDiv.style.display = "none";
    this.tabsPanel.mainDiv.style.height = this.tableHeightPerc + "%";
    this.tableViewVisibleAuto = false;
    this.htmlViewVisibleAuto = false;
    this.toolsPanel = new ActiveIcmTabView;
    this.toolsPanel.mainDiv.style.position = "absolute";
    this.tabsPanel.mainDiv.style["z-index"] = "1";
    this.cont.appendChild(this.toolsPanel.mainDiv);
    this.toolsPanel.mainDiv.style.display = "none";
    this.tab_vsplitter2 = document.createElement("div");
    this.tab_vsplitter2.className = "vsplitter";
    this.tab_vsplitter2.style.display = "none";
    this.tab_vsplitter2.style["z-index"] = "3";
    this.tab_vsplitter2.style["padding"] = "0px";
    this.cont.appendChild(this.tab_vsplitter2);
    Module.makeDraggable(this.tab_vsplitter2, this.tab_vsplitter2, true, false, null, null, null, function (el) {
        var p = that.tab_vsplitter2.offsetLeft / that.cont.offsetWidth;
        that.tab_vsplitter2_ratio = p;
        that.updateLayout();
        that.saveLayoutToCookies()
    });
    this.cent = document.createElement("img");
    this.cent.src = Module.locationPrefix + "icons/center.png";
    this.cent.style.position = "absolute";
    this.cent.style.width = "50px";
    this.cent.style.height = "50px";
    this.cent.style["cursor"] = "pointer";
    this.cent.style["z-index"] = "1";
    this.cent.id = parentCont + "_cent";
    this.cent.title = "Center";
    this.cont.appendChild(this.cent);
    this.cent.onmousedown = function () {
        that.center()
    };

    this.left = document.createElement("img");
    this.left.src = Module.locationPrefix + "icons/left.png";
    this.left.style.position = "absolute";
    this.left.style.width = "40px";
    this.left.style.height = "40px";
    this.left.style.top = "350px";
    this.left.style.left = "5px";
    this.left.style["cursor"] = "pointer";
    this.left.style["z-index"] = "1";
    this.left.id = parentCont + "_left";
    this.left.title = "Left";
    this.cont.appendChild(this.left);

    this.right = document.createElement("img");
    this.right.src = Module.locationPrefix + "icons/right.png";
    this.right.style.position = "absolute";
    this.right.style.width = "40px";
    this.right.style.height = "40px";
    this.right.style.top = "350px";
    this.right.style.right = "5px";
    this.right.style["cursor"] = "pointer";
    this.right.style["z-index"] = "1";
    this.right.id = parentCont + "_right";
    this.right.title = "Right";
    this.cont.appendChild(this.right);

    this.progress = document.createElement("img");
    this.progress.src = Module.locationPrefix + "icons/ajax-loader.gif";
    this.progress.style.position = "absolute";
    this.progress.style["z-index"] = "1";
    this.progress.id = parentCont + "_progress";
    this.progress.style.display = "none";
    this.cont.appendChild(this.progress);
    this.progress_info = document.createElement("div");
    this.progress_info.style.display = "none";
    this.progress_info.innerHTML = "";
    this.progress_info.style.font = "17px Arial";
    this.progress_info.style.position = "absolute";
    this.progress_info.style["z-index"] = "1";
    this.cont.appendChild(this.progress_info);
    this.menuButton = document.createElement("img");
    this.menuButton.style.position = "absolute";
    this.menuButton.className = "menuButton";
    this.menuButton.src = Module.locationPrefix + "icons/menu.png";
    this.menuButton.style["z-index"] = "2";
    this.cont.appendChild(this.menuButton);
    this.menuButton.onclick = function () {
        that.menu.toggle()
    };
    this.menu = new ActiveIcmMenu(this, null);
    this.buildMenu();
    this.popupMenu = new ActiveIcmMenu(this, null);
    document.addEventListener("keydown", function (e) {
        if (e.keyCode == 27) {
            that.popupMenu.hide();
            if (that.ligeditTools) that.ligeditTools.clearTool()
        }
    }, false);
    {
        this.distToolBar = document.createElement("div");
        this.distToolBar.className = "toolbar";
        this.distToolBar.style.position = "absolute";
        this.distToolBar.style.display = "none";
        var img = Module.makeImage("pm_dist_measure_cancel.png", "Close measurement mode", "icon");
        img.setAttribute("on", false);
        this.distToolBar.appendChild(img);
        this.cont.appendChild(this.distToolBar);
        img.onclick = function () {
            that.RunCommandsLite("GRAPHICS.mode='Rotation'")
        }
    }
    this.torPlot = document.createElement("div");
    this.cont.appendChild(this.torPlot);
    this.torPlot.appendChild(document.createElement("canvas"));
    this.torPlot.style.display = "none";
    this.torPlot.style.position = "absolute";
    this.torPlot.style.backgroundColor = "#EFEFEF";
    this.torPlot.plot = new Module.IcmPlot(this.torPlot.children[0], {});
    this.tooltip = document.createElement("div");
    this.tooltip.style.display = "none";
    this.tooltip.style.padding = "5x";
    this.tooltip.style.border = "2px solid gray";
    this.tooltip.style.position = "absolute";
    this.tooltip.style.borderRadius = "5px";
    this.tooltip.style.backgroundColor = "#EFEFEF";
    this.tooltip.style["z-index"] = "3";
    this.tooltip.style.display = "none";
    this.cont.appendChild(this.tooltip);
    this.hidden_a = document.createElement("a");
    document.body.appendChild(this.hidden_a);
    this.hidden_a.style.display = "none";
    this.hidden_a.target = "_blank";
    this.hidden_fileSelector = document.createElement("input");
    document.body.appendChild(this.hidden_fileSelector);
    this.hidden_fileSelector.type = "file";
    this.hidden_fileSelector.accept = ".icb, .pdb, .mol";
    this.hidden_fileSelector.style.display = "none";
    this.hidden_canvas = document.createElement("canvas");
    document.body.appendChild(this.hidden_canvas);
    this.hidden_canvas.style.display = "none";
    this.act.par = this;
    this.seq.par = this;
    this.cent.par = this;
    this.act.onTorsionRotate = function (data) {
        that.onTorsionRotate(data)
    };
    window.addEventListener("resize", function () {
        that.updateLayout(true)
    });
    window.addEventListener("beforeunload", function (ev) {
        that.free()
    });
    this.act.onDisplayChange = function () {
        that.updateMenu()
    };
    this.updateLayout();
    this.loadRequestedModules()
}

ActiveIcmJS.prototype.saveLayoutToCookies = function () {
    docCookies.setItem(this.layoutCookieKey, JSON.stringify(this.layout), Infinity)
};
ActiveIcmJS.prototype.loadRequestedModules = function () {
    var that = this;
    if (this.act.requireAuth) {
        setTimeout(function () {
            var token = docCookies.getItem("icmjs_token");
            if (token.length) {
                that.act.authToken(token)
            } else {
                that.icmjsLogin()
            }
        }, 100)
    }
};
ActiveIcmJS.prototype.free = function () {
    this.freeTables();
    this.freeAlignments();
    this.torPlot.plot.delete();
    this.act.delete()
};
ActiveIcmJS.prototype.freeTables = function () {
    for (var i = 0; i < this.tables.length; i++) {
        this.tables[i].freeElements();
        this.tables[i].tab.delete()
    }
    this.tables = []
};
ActiveIcmJS.prototype.freeAlignments = function () {
    for (var i = 0; i < this.alignments.length; i++) this.alignments[i].ali.delete();
    this.alignments = []
};
ActiveIcmJS.prototype.freeHtmls = function () {
    for (var i = 0; i < this.htmls.length; i++) ;
    this.htmls = []
};
ActiveIcmJS.prototype.OpenProject = function (path, args) {
    this.act.OpenProject(path, args);
    this.setCurrentProjectInfo({id: path, type: "url"})
};
ActiveIcmJS.prototype.OpenProjectFromBinary = function (buffer, filename) {
    this.ShowProgressWheel(true, "Open File");
    var that = this;
    setTimeout(function () {
        that.act.RunCommands("delete all");
        that.act.OpenProjectFromBinary(buffer);
        that.setCurrentProjectInfo({id: filename ? filename : "buffer", type: "buffer", file: buffer})
    }, 100)
};
ActiveIcmJS.prototype.RunCommands = function (cmd) {
    this.act.RunCommands(cmd)
};
ActiveIcmJS.prototype.RunCommandsUndoStore = function (cmd) {
    this.act.RunCommandsUndoStore(cmd)
};
ActiveIcmJS.prototype.RunCommandsLite = function (cmd) {
    this.act.RunCommandsLite(cmd)
};
ActiveIcmJS.prototype.RunCommandsValue = function (cmd) {
    return this.act.RunCommandsValue(cmd)
};
ActiveIcmJS.prototype.CallScript = function (cmd, onload) {
    this.act.CallScript(cmd, onload)
};
ActiveIcmJS.prototype.GetShellVar = function (name) {
    return this.act.GetShellVar(name)
};
ActiveIcmJS.prototype.ToggleFullScreen = function (name) {
    return this.act.SetFullScreen(!this.act.IsFullScreen())
};
ActiveIcmJS.prototype.SetFullScreen = function (on) {
    this.par.act.SetFullScreen(on)
};
ActiveIcmJS.prototype.AddToGroup = function (name) {
    this.act.AddToGroup(name)
};
ActiveIcmJS.prototype.RemoveFromGroup = function (name) {
    this.act.RemoveFromGroup(name)
};
ActiveIcmJS.prototype.setElementVisible = function (element, on) {
    element.style.display = on ? "block" : "none";
    this.updateLayout()
};
ActiveIcmJS.prototype.saveImage = function (filename) {
    this.hidden_a.href = this.image;
    this.hidden_a.download = filename ? filename : "image.png";
    this.hidden_a.click()
};
ActiveIcmJS.prototype.exportToMesh = function (format) {
    var that = this;
    this.act.RunCommandsLite('write binary all "session.icb" delete');
    var buf = FS.readFile("session.icb");
    var arrbuf = buf.buffer;
    var blob = new Blob([arrbuf], {type: "application/octet-stream"});
    var formData = new FormData;
    formData.append("icb", blob);
    formData.append("fmt", format);
    var req = new XMLHttpRequest;
    req.open("POST", "https://molsoft.com/cgi-bin/smi2obj.cgi");
    req.onload = function (oEvent) {
        var str = this.responseText;
        var str_mt = "";
        that.hidden_a.href = window.URL.createObjectURL(new Blob([str], {type: "text/plain"}));
        that.hidden_a.download = "export." + format;
        that.hidden_a.click()
    };
    req.send(formData)
};
ActiveIcmJS.prototype.saveProject = function (url, filename) {
    this.act.RunCommandsLite('write binary all "session.icb" delete');
    var buf = FS.readFile("session.icb");
    var arrbuf = buf.buffer;
    var blob = new Blob([arrbuf], {type: "application/octet-stream"});
    var that = this;
    if (url) {
        var xhr = new XMLHttpRequest;
        var formData = new FormData;
        formData.append(typeof filename != "string" ? "session" : filename, blob);
        xhr.open("POST", url);
        xhr.onload = function () {
        };
        xhr.send(formData)
    } else {
        if (typeof filename != "string") {
            this.promptString("Save Session As", "Filename", that.projectFilename(), function (dlg) {
                that.hidden_a.href = window.URL.createObjectURL(blob);
                that.hidden_a.download = dlg.inputValue("Filename");
                that.hidden_a.click()
            })
        } else {
            that.hidden_a.href = window.URL.createObjectURL(blob);
            that.hidden_a.download = filename;
            that.hidden_a.click()
        }
    }
};
ActiveIcmJS.prototype.updateCaption = function () {
    var nofObj = this.act.nofObj;
    var nofTab = this.tables.length;
    var n_as_graph = this.act.nofAsGraph;
    var modules = "";
    if (this.act.loadedModules.length) {
        modules += "/";
        modules += this.act.loadedModules
    }
    var capt = "denovo sciences ";
    if (typeof gapi != "undefined" && gapi.auth2.getAuthInstance().isSignedIn.get()) {
        var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        capt += " - ";
        capt += profile.getEmail()
    } else {
        capt += " - "
    }
    capt += " [";
    var t = "";
    if (this.currentProjectInfo.type == "url" || this.currentProjectInfo.type == "buffer") {
        if (this.currentProjectInfo.id.length < 50) t = this.currentProjectInfo.id.substring(this.currentProjectInfo.id.lastIndexOf("/") + 1); else t = this.currentProjectInfo.type;
        if (t > 100) t = t.substring(0, 47) + ".."
    } else if (this.currentProjectInfo.type == "local") {
        t = this.currentProjectInfo.file.name
    } else if (this.currentProjectInfo.type == "googledrive") {
        t = this.currentProjectInfo.file.name;
        if (!this.canSaveCurrentFileToDriveDrive()) t += " rdonly"
    }
    capt += t;
    document.title = t;
    capt += "]";
    capt += " (";
    if (nofObj) capt += nofObj + " object" + (nofObj > 1 ? "s" : "");
    if (n_as_graph) capt += "," + n_as_graph + " selected atoms";
    if (nofTab) {
        if (nofObj) capt += ",";
        capt += nofTab + " table" + (nofTab > 1 ? "s" : "")
    }
    capt += ")";
    this.caption.innerHTML = ''
};
ActiveIcmJS.prototype.hideTooltip = function () {
    this.tooltip.style.display = "none"
};
ActiveIcmJS.prototype.showTooltipAt = function (txt, x, y) {
    this.tooltip.style.top = y - 20 + "px";
    this.tooltip.style.left = x + "px";
    this.tooltip.innerHTML = txt;
    this.tooltip.style.display = "block"
};
ActiveIcmJS.prototype.showPopupAt = function (x, y) {
    if (!this.popupMenu.items.length) return;
    this.popupMenu.menu.style.left = x + "px";
    this.popupMenu.menu.style.top = y + "px";
    var w = Math.min(this.cont.clientWidth, 250);
    this.popupMenu.menu.style.width = w + "px";
    this.popupMenu.show()
};
ActiveIcmJS.prototype.onCanvasClick = function () {
    this.hideMenu()
};
ActiveIcmJS.prototype.distPopupMenu = function (name, num, x, y) {
    var m;
    this.hideTooltip();
    this.popupMenu.clear();
    this.popupMenu.addItem(name, "");
    this.popupMenu.addSeparator();
    this.popupMenu.addItem("Select atoms", "as_graph = Atom(" + name + "," + num + ")");
    this.popupMenu.addItem("Delete", "delete " + name + " selection");
    this.popupMenu.buildMenu();
    this.showPopupAt(x + this.graphicsWindowLeft, y + this.graphicsWindowTop)
};
ActiveIcmJS.prototype.atomPopupMenu = function (atst, x, y) {
    var m;
    this.hideTooltip();
    this.popupMenu.clear();
    this.popupMenu.addItem(atst, "");
    this.popupMenu.addSeparator();
    m = this.popupMenu.addMenu("Toggle Selection");
    m.addItem("Atom", "as_graph = Nof(as_graph & %1) ? as_graph & ! %1 : as_graph | %1".replace(/%1/g, atst));
    m.addItem("Residue", "as_graph = Nof(as_graph & Res(%1)) ? as_graph & ! Res(%1) : as_graph | Res(%1)".replace(/%1/g, atst));
    m.addItem("Molecule", "as_graph = Nof(as_graph & Mol(%1)) ? as_graph & ! Mol(%1) : as_graph | Mol(%1)".replace(/%1/g, atst));
    this.popupMenu.addItem("Center on Atom", "center static margin=4. " + atst);
    this.popupMenu.buildMenu();
    this.showPopupAt(x + this.graphicsWindowLeft, y + this.graphicsWindowTop)
};
ActiveIcmJS.prototype.onTouchHoldMove = function (atst) {
};
ActiveIcmJS.prototype.onTorsionRotate = function (data) {
    if (data == null) {
        this.torPlot.style.display = "none"
    } else if (typeof data == "number") {
        var sel = [];
        for (var i = 0; i < 36; i++) sel[sel.length] = 0;
        sel[data] = 1;
        this.torPlot.plot.selection = sel;
        this.torPlot.plot.draw()
    } else {
        var toolsVisible = this.toolsPanel.mainDiv.style.display != "none";
        var w = this.par.clientWidth;
        var cap_h = this.caption.style.display == "none" ? 0 : this.caption.clientHeight;
        var search_h = this.searchInput.style.display == "none" ? 0 : this.searchInput.offsetHeight + 2;
        var tools_w = toolsVisible ? w * this.tab_vsplitter2_ratio + this.tab_vsplitter2.offsetWidth : 0;
        this.torPlot.style.display = "block";
        this.torPlot.style.top = cap_h + search_h + "px";
        this.torPlot.style.left = tools_w + "px";
        var ww = w / 6;
        var hh = ww * .75;
        this.torPlot.style.width = ww + "px";
        this.torPlot.style.height = hh + "px";
        this.torPlot.style.display = "block";
        var plotData = {};
        plotData.y = data.prof;
        plotData.x = [];
        var sel = [];
        for (var i = 0; i < data.prof.length; i++) {
            plotData.x[plotData.x.length] = i * 10;
            sel[sel.length] = 0
        }
        sel[data.tor] = 1;
        plotData.style = "splines";
        plotData.lineWidth = 2.5;
        plotData.size = 2.5;
        plotData.xStep = 60;
        plotData.yStep = 1;
        plotData.yRange = [0, 6];
        this.torPlot.plot.plotData = plotData;
        this.torPlot.plot.selection = sel;
        this.torPlot.plot.resizeCanvas(ww, hh);
        this.torPlot.plot.draw()
    }
};
ActiveIcmLigeditPanel = function (parAct) {
    var that = this;
    this.par = parAct;
    this.par.ligeditTools = this;
    this.html = document.createElement("div");
    this.info = document.createElement("span");
    this.html.appendChild(this.info);
    this.toolButtons = [];
    this.addHorSeparator();
    var tab = document.createElement("table");
    this.html.appendChild(tab);
    this.toolBar = document.createElement("tr");
    tab.appendChild(this.toolBar);
    this.addToolButton(Module.makeImage("pm_set_ligrec.png", "Setup Ligand/Receptor", "icon"), function () {
        that.setupLigandReceptor()
    });
    this.addSeparator(this.toolBar);
    this.addToolButton(Module.makeImage("pm_ligminimize.png", "Minimize Ligand in Grid", "icon"), 'processLigandICM a_LIG.I "minimize" Sarray()', "", {
        undo: true,
        progress: true,
        cond: "setupOk"
    });
    this.addToolButton(Module.makeImage("pm_docking.png", "Redock Ligand", "icon"), 'processLigandICM a_LIG.I "redock" Sarray()', "", {
        undo: true,
        progress: true,
        cond: "setupOk"
    });
    this.addSeparator(this.toolBar);
    this.addToolButton(Module.makeImage("pm_saveligand.png", "Save Current Ligand", "icon"), "processLigandSave", "", {cond: "setupOk"});
    this.addSeparator(this.toolBar);
    this.addToolButton(Module.makeImage("pm_undo.png", "Undo Last Operation", "icon"), 'processLigand a_LIG.I "undo" Sarray()', "", {cond: "setupOk"});
    this.addToolButton(Module.makeImage("pm_redo.png", "Redo Last Operation", "icon"), 'processLigand a_LIG.I "redo" Sarray()', "", {cond: "setupOk"});
    this.addSeparator(this.toolBar);
    this.addToolButton(Module.makeImage("pm_refresh.png", "Recalculate Binding Score", "icon"), "updateLigandScore a_LIG.I 0. 0. 0. yes", "", {cond: "setupOk"});
    this.addSeparator(this.toolBar);
    this.saveToDrive = this.addToolButton(Module.makeImage("pm_cloud.png", "Save To Cloud", "icon"), function () {
        that.par.saveGoogleDriveDialog(false)
    }, null, {cond: "setupOk"});
    tab = document.createElement("table");
    this.html.appendChild(tab);
    this.toolBar = document.createElement("tr");
    tab.appendChild(this.toolBar);
    this.addToolButton(Module.makeImage("pm_ligand_hbond.png", "Toggle Display Hydrogen Bonds", "icon"), "e3dDsiplayHbonds", "delete ligandhbonds", {cond: "setupOk"});
    this.addToolButton(Module.makeImage("pm_ligand_pocket.png", "Toggle Ligand Pocket View", "icon"), 'if ( !Exist( variable "g_recPocketSurface") ) makeLigandPocketSurface 3.5\ndisplay g_recPocketSurface wire', "delete g_recPocketSurface", {cond: "setupOk"});
    this.addToolButton(Module.makeImage("pm_surface.png", "Toggle Receptor Binding Pocket View", "icon"), 'dsPocket a_LIG.I "g_bindingPocket" yes no', "delete g_bindingPocket", {cond: "setupOk"});
    this.addToolButton(Module.makeImage("pm_energy_circle.png", "Toggle Atomic Energy Cirles", "icon"), 'processLigandICM a_LIG.I "atomenergies" Sarray(1)\nLIGAND.energyDisplayState = yes\ndisplay new', "LIGAND.energyDisplayState = no\ndisplay new", {cond: "setupOk"});
    this.addToolButton(Module.makeImage("pm_lig_strain.png", "Toggle Relaxed Ligand View", "icon"), 'processLigandICM a_LIG.I "ligstrain" Sarray()\ncolor xstick a_LIGSTRAIN.\n', ' GRAPHICS.varRingColorStyle = "energy"\nundisplay variable label a_LIG.\ndelete a_LIGSTRAIN.', {cond: "setupOk"});
    this.addToolButton(Module.makeImage("pm_lig_view2.png", "Toggle Ligand/Receptor Publication View", "icon"), "LIGAND.prettyView=yes\ndsLigandComplex a_CURREC. a_LIG.I yes\ne3dDsiplayHbonds", "LIGAND.prettyView=no\ne3dDefaultDisplay", {cond: "setupOk"});
    this.addSeparator(this.toolBar);
    this.addToolButton(Module.makeImage("pm_lig2D_diag.png", "2D Ligand Interaction Diagram", "icon"), "ligDiagInteraction2D a_LIG.I a_CURREC. Chemical() 4.5 0.8", "", {cond: "setupOk"});
    this.addSeparator(this.toolBar);
    this.addToolButton(Module.makeImage("pm_moledit24.png", "Open 2D Editor", "icon"), function () {
        that.toggleEditLigand2D()
    }, null, {cond: "setupOk"});
    this.addHorSeparator();
    this.atomTools = [];
    var tab2 = document.createElement("table");
    this.html.appendChild(tab2);
    this.toolsPanel = document.createElement("tr");
    tab2.appendChild(this.toolsPanel);
    this.addAtomEditToolButton("C", "Carbon");
    this.addAtomEditToolButton("N", "Nitrogen");
    this.addAtomEditToolButton("O", "Oxygen");
    this.addAtomEditToolButton("F", "Fluorine");
    this.addAtomEditToolButton("H", "Hydrogen");
    this.addAtomEditToolButton("P", "Phosphorus");
    this.addSeparator(this.toolsPanel);
    this.addAtomEditToolButton("-", "Negative Charge");
    this.addSeparator(this.toolsPanel);
    this.addAtomBondToolButton(Module.makeImage("pm_drag_new.png", "Drag Atom", "icon"), 16, false, 1, "Drag Atom");
    this.toolsPanel = document.createElement("tr");
    tab2.appendChild(this.toolsPanel);
    this.addAtomEditToolButton("S", "Sulfur");
    this.addAtomEditToolButton("Cl", "Chlorine");
    this.addAtomEditToolButton("Br", "Bromine");
    this.addAtomEditToolButton("I", "Iodine");
    this.addAtomEditToolButton("More..", "", "2");
    this.addSeparator(this.toolsPanel);
    this.addAtomEditToolButton("+", "Positive Charge");
    this.addSeparator(this.toolsPanel);
    this.addAtomBondToolButton(Module.makeImage("pm_tors_new.png", "Torsion Rotate", "icon"), 5, false, 1, "Torsion Rotate");
    this.toolsPanel = document.createElement("tr");
    tab2.appendChild(this.toolsPanel);
    this.addBondEditToolButton("1", "pm_sibo.png", "Single Bond");
    this.addBondEditToolButton("2", "pm_dbbo.png", "Double Bond");
    this.addBondEditToolButton("3", "pm_trbo.png", "Tripple Bond");
    this.addBondFormEditToolButton("pm_make_bond.png", "Bond Formation");
    this.addAtomBondToolButton(Module.makeToolButton("R/S", "Switch Stereo", "icon"), 'processLigandICM %1 "switchStereo" Sarray()', false, 1, "Switch Stereo");
    this.addAtomBondToolButton(Module.makeImage("pm_erase.png", "Erase Atom", "icon"), 'processLigand %1 "deleteatom" Sarray()', false, 1, "Erase Atoms");
    this.rgroups_div = document.createElement("div");
    this.html.appendChild(this.rgroups_div);
    this.rgroups = document.createElement("table");
    this.rgroups_div.appendChild(this.rgroups);
    this.rgroups.setAttribute("id", "table-icm");
    this.edit2d_div = document.createElement("div");
    this.html.appendChild(this.edit2d_div);
    this.edit2d_div.style.border = "1px solid gray";
    this.edit2d = new ChemicalView("", this.edit2d_div, 0, 0, "simpleToolbar", 2);
    this.edit2d_div.style.display = "none";
    this.edit2d3d_button = this.edit2d.addToolButton(this.edit2d.hToolBar, "lib/icons/pm_3d_new.png", "apply3D", "Apply changes to 3D", function (ev) {
        that.editLigand2Dto3D()
    });
    this.edit2d3d_button.div.style.display = "none";
    this.edit2d.onchange = function () {
        that.edit2d3d_button.div.style.display = "inline-block"
    };
    this.refreshEnableState()
};
ActiveIcmLigeditPanel.prototype.refreshEnableState = function () {
    for (var i = 0; i < this.toolButtons.length; i++) {
        var td = this.toolButtons[i];
        if (td.cond) {
            var on = this[td.cond]();
            if (!on) td.img.setAttribute("disabled", "true"); else td.img.removeAttribute("disabled")
        }
    }
    this.saveToDrive.style.display = this.par.canSaveCurrentFileToDriveDrive() ? "block" : "none"
};
ActiveIcmLigeditPanel.prototype.setupOk = function () {
    var lig = this.par.act.filteredObjects("isLigandObj");
    return lig.length > 0
};
ActiveIcmLigeditPanel.prototype.setupLigandReceptor = function () {
    var that = this;
    var dlg = new ActiveIcmDialog(this.par, "Setup Ligand/Receptor");
    dlg.addMolListInput("Ligand", "isHetExt");
    dlg.addLogicalInput("Auto Assign Formal Charges", "true");
    dlg.addMolListInput("Receptor", "hasAminoNucl");
    dlg.addNumberInput("Box Margin", "3.0", "1.0", "10.0", "1.0");
    dlg.addButtons([{
        text: "Ok", keep_bg: true, func: function (dlg) {
            that.par.ShowProgressWheel(true, "Setting Ligand and Receptor");
            setTimeout(function () {
                var lig_sel = dlg.inputValue("Ligand");
                var rec_sel = dlg.inputValue("Receptor");
                var marg = dlg.inputValue("Box Margin");
                var cmd = "set edit off\nLIGAND.info = '<no info>'\n";
                cmd += "e3dSetLigand {0} yes no 7.0 no\n".format(lig_sel);
                cmd += "LIGAND.box = Box( {0} {1} )\n".format(lig_sel, marg);
                cmd += "e3dSetReceptor {0} yes 1 yes no '' no yes yes yes\n".format(rec_sel);
                cmd += "if ( Nof( Select( a_LIG.// '_LIGCOV_' ) ) == 1 ) then; processLigandICM a_LIG.I 'minimize' Sarray(); endif\n";
                that.par.RunCommands(cmd);
                that.par.ShowProgressWheel(false)
            }, 100)
        }
    }, {text: "Cancel"}]);
    dlg.show()
};
ActiveIcmLigeditPanel.prototype.toggleEditLigand2D = function () {
    var that = this;
    if (this.edit2d_div.style.display == "none") {
        this.edit2d_div.style.display = "block";
        setTimeout(function () {
            that.par.RunCommands('processLigand a_LIG.I "edit2D" Sarray()')
        }, 100)
    } else {
        this.edit2d_div.style.display = "none"
    }
    this.updateLayout()
};
ActiveIcmLigeditPanel.prototype.editLigand2D = function (smi) {
    var that = this;
    if (this.edit2d3d_button.div.style.display != "none") {
        this.par.askQuestion("Warning", "The content of 2D editor has changed. Do you want to overwrite 2D changes with 3D changes?", function (dlg) {
            that.edit2d.importFromString(smi);
            that.edit2d3d_button.div.style.display = "none"
        })
    } else {
        this.edit2d.importFromString(smi);
        this.edit2d3d_button.div.style.display = "none"
    }
};
ActiveIcmLigeditPanel.prototype.editLigand2Dto3D = function () {
    var that = this;
    var mol = this.edit2d.getMolfile();
    if (this.par.act.SetShellVar("s_out", mol)) {
        this.edit2d3d_button.div.style.display = "none";
        this.par.ShowProgressWheel(true, "2D -> 3D");
        setTimeout(function () {
            that.par.RunCommands('processLigand a_LIG.I "edit2D" Sarray(1,s_out)\nprocessLigandICM a_LIG.I "minimize" Sarray()');
            that.par.ShowProgressWheel(false)
        })
    }
};
ActiveIcmLigeditPanel.prototype.setHeight = function (hh) {
};
ActiveIcmLigeditPanel.prototype.addHorSeparator = function () {
    var sep = document.createElement("div");
    sep.className = "hline";
    this.html.appendChild(sep)
};
ActiveIcmLigeditPanel.prototype.addSeparator = function (toolBar) {
    var td = document.createElement("td");
    td.style["border-right"] = "solid 2px grey";
    toolBar.appendChild(td)
};
ActiveIcmLigeditPanel.prototype.clearTool = function () {
    this.par.act.clickTool = null;
    var li = this.selectedModifies();
    for (var i = 0; i < li.length; i++) li[i].className = ""
};
ActiveIcmLigeditPanel.prototype.refreshEdit2D = function (width) {
    this.edit2d_div.style.width = width + "px";
    this.edit2d_div.style.height = width + "px";
    this.edit2d.updateLayout()
};
ActiveIcmLigeditPanel.prototype.selectedModifies = function () {
    var li = [];
    for (var i = 0; i < this.rgroups.children.length; i++) {
        var tr = this.rgroups.children[i];
        for (var j = 0; j < tr.children.length; j++) {
            if (tr.children[j].className == "currentCell") li[li.length] = tr.children[j]
        }
    }
    return li
};
ActiveIcmLigeditPanel.prototype.refreshModifiers = function (width) {
    var modlist = this.par.act.GetShellVar("LIGAND.modifiers");
    var ncol = 5;
    var nrow = Math.ceil(modlist.length / ncol);
    var ww = width / ncol - 4;
    var hh = ww;
    Module.clearChildren(this.rgroups);
    this.rgroups.style.width = width + "px";
    this.rgroups_div.style.width = width + "px";
    if (this.edit2d_div.style.display == "block") {
        this.rgroups_div.style.height = (hh + 2) * 4 + "px"
    } else {
        this.rgroups_div.style.height = nrow * (hh + 2) + "px"
    }
    this.rgroups_div.style["overflow"] = "auto";
    var that = this;
    var enabled = this.setupOk();
    for (var r = 0; r < nrow; r++) {
        var tr = document.createElement("tr");
        this.rgroups.appendChild(tr);
        tr.style.border = "1px solid black";
        for (var c = 0; c < ncol; c++) {
            var idx = r * ncol + c;
            if (idx >= modlist.length) break;
            var td = document.createElement("td");
            tr.appendChild(td);
            td.style.padding = "0px";
            var opt = "rdonly";
            if (!enabled) opt += ",disabled";
            opt += ",nobackground";
            td.chem = new ChemicalView(modlist[idx], td, ww, hh, opt, 2);
            td.smi = modlist[idx];
            if (enabled) {
                td.onclick = function () {
                    this.className = this.className == "" ? "currentCell" : "";
                    var li = that.selectedModifies();
                    if (li.length) {
                        var smi = "";
                        for (var j = 0; j < li.length; j++) {
                            if (smi.length) smi += ";;";
                            smi += li[j].smi
                        }
                        that.par.act.clickTool = {
                            type: "atom",
                            cmd: 'processLigandICM %1 "modifysmi" Split( "' + smi + '" ";;")',
                            nat: 1,
                            progress: true,
                            desc: "Modify Group",
                            clearTool: true
                        }
                    } else {
                        that.par.act.clickTool = null
                    }
                }
            }
        }
    }
};
ActiveIcmLigeditPanel.prototype.addBondEditToolButton = function (boty, icon, title) {
    var btn = this.addAtomBondToolButton(Module.makeToolButton(Module.makeImage(icon, title, "icon"), title, "icon"), 'processLigand %1 "makebondbond" {"' + boty + '" ""}', true, 2, title);
    btn.boty = boty;
    return btn
};
ActiveIcmLigeditPanel.prototype.addBondFormEditToolButton = function (icon, title) {
    var btn = this.addAtomBondToolButton(Module.makeToolButton(Module.makeImage(icon, title, "icon"), title, "icon"), 'processLigand %1 "makebond" {"1"}', false, 2, title);
    return btn
};
ActiveIcmLigeditPanel.prototype.popupMendTable = function () {
    var that = this;
    var el = this.par.act.elements;
    var dlg = new ActiveIcmDialog(this.par, "Elements");
    var tab = document.createElement("table");
    tab.className = "simpleTable";
    for (var i = 0; i < 7; i++) {
        var tr = document.createElement("tr");
        tab.appendChild(tr);
        for (var j = 0; j < 18; j++) {
            var td = document.createElement("td");
            tr.appendChild(td);
            td.style.width = "32px";
            td.style.height = "32px";
            td.style["text-align"] = "center"
        }
    }
    for (var i = 0; i < el.length; i++) {
        var td = tab.children[el[i].row].children[el[i].col];
        var btn = document.createElement("button");
        btn.appendChild(document.createTextNode(el[i].symbol));
        td.appendChild(btn);
        btn.style.width = "100%";
        btn.style.height = "100%";
        btn.style.backgroundColor = el[i].color;
        td.style.backgroundColor = el[i].color;
        btn.style.cursor = "pointer";
        btn.mend = el[i].symbol;
        btn.onclick = function () {
            that.par.act.clickTool = {
                type: "atom",
                cmd: 'processLigand %1 "editatom1" {"{0}" ""}'.format(this.mend),
                nat: 1,
                desc: ""
            };
            dlg.hide()
        }
    }
    dlg.addWidget("", tab);
    dlg.addButtons([{text: "Close"}]);
    dlg.show()
};
ActiveIcmLigeditPanel.prototype.addAtomEditToolButton = function (mend, element, colspan) {
    var btn;
    var that = this;
    if (mend == "More..") {
        btn = this.addAtomBondToolButton(Module.makeToolButton(mend, element, "icon"), function () {
            that.popupMendTable()
        }, false, 1, element)
    } else {
        btn = this.addAtomBondToolButton(Module.makeToolButton(mend, element, "icon"), mend == "-" || mend == "+" ? 'processLigand %1 "editatom2" { "", "' + mend + '" }' : 'processLigand %1 "editatom1" {"' + mend + '" ""}', false, 1, element);
        btn.mend = mend
    }
    if (colspan) {
        btn.td.colSpan = colspan;
        btn.style.width = "100%"
    }
    return btn
};
ActiveIcmLigeditPanel.prototype.addAtomBondToolButton = function (btn, onclick, isBond, atomsNeeded, comment) {
    var that = this;
    var td = document.createElement("td");
    this.toolsPanel.appendChild(td);
    td.appendChild(btn);
    td.style["text-align"] = "center";
    td.btn = btn;
    td.btn.setAttribute("on", "false");
    td.img = td.btn;
    if (typeof onclick == "string" || typeof onclick == "number") {
        this.atomTools[this.atomTools.length] = btn;
        td.btn.onclick = function () {
            for (var i = 0; i < that.atomTools.length; i++) {
                if (that.atomTools[i] != this) that.atomTools[i].setAttribute("on", "false")
            }
            this.setAttribute("on", this.getAttribute("on") == "true" ? "false" : "true");
            if (this.getAttribute("on") == "true") {
                if (typeof onclick == "string") {
                    that.par.act.clickTool = {
                        type: isBond ? "bond" : "atom",
                        cmd: onclick,
                        nat: atomsNeeded,
                        desc: comment
                    }
                } else {
                    that.par.act.SetShellVar("GRAPHICS.mode", onclick - 1)
                }
            } else {
                that.par.act.clickTool = null;
                that.par.act.SetShellVar("GRAPHICS.mode", 0)
            }
        }
    } else if (typeof onclick == "function") {
        td.onclick = onclick
    }
    btn.td = td;
    td.cond = "setupOk";
    this.toolButtons[this.toolButtons.length] = td;
    return btn
};
ActiveIcmLigeditPanel.prototype.addToolButton = function (img, onclick, onunclick, opt) {
    var that = this;
    var undo = false, forceRefresh = false, progress = false;
    var td = document.createElement("td");
    this.toolBar.appendChild(td);
    td.appendChild(img);
    td.style["text-align"] = "center";
    td.img = img;
    td.img.setAttribute("on", false);
    if (opt) {
        undo = opt.undo;
        forceRefresh = opt.forceRefresh;
        progress = opt.progress;
        td.cond = opt.cond
    }
    td.isToggle = false;
    if (onunclick) td.isToggle = true;
    td.forceRefresh = false;
    if (forceRefresh) td.forceRefresh = true;
    if (typeof onclick == "string") {
        td.onclick = function () {
            if (this.isToggle) {
                this.setAttribute("on", this.getAttribute("on") == "true" ? "false" : "true");
                if (this.getAttribute("on") == "true") that.par.RunCommands(onclick); else that.par.RunCommands(onunclick)
            } else {
                if (progress) that.par.ShowProgressWheel(true, img.title);
                if (this.forceRefresh) that.par.forceUpdate = true;
                setTimeout(function () {
                    if (undo) that.par.RunCommandsUndoStore(onclick); else that.par.RunCommands(onclick);
                    if (progress) that.par.ShowProgressWheel(false)
                }, 100)
            }
        }
    } else {
        td.onclick = onclick
    }
    this.toolButtons[this.toolButtons.length] = td;
    return td
};
ActiveIcmLigeditPanel.prototype.refresh = function () {
    this.info.innerHTML = this.par.act.GetShellVar("LIGAND.info")
};
ActiveIcmLigeditPanel.prototype.setWidth = function (ww) {
    this.refresh();
    this.html.style.display = "block";
    this.html.style.width = ww + "px";
    this.refreshModifiers(ww);
    this.refreshEdit2D(ww)
};
ActiveIcmLigeditPanel.prototype.updateLayout = function () {
    this.setWidth(this.html.clientWidth)
};
ActiveIcmHtml = function (html, parAct) {
    this.par = parAct;
    this.htmlName = html.name;
    this.html = document.createElement("div");
    this.html.innerHTML = html.html;
    this.html.cmdli = html.cmdli;
    this.html.setAttribute("id", html.id)
};
ActiveIcmHtml.prototype.setHeight = function (hh) {
};
ActiveIcmHtml.prototype.setWidth = function (ww) {
    this.html.style.display = "block";
    this.html.style.width = ww + "px"
};
ActiveIcmHtml.prototype.updateLayout = function () {
    this.setWidth(this.html.parentElement.clientWidth)
};
ActiveIcmAlignment = function (aliName, parAct) {
    var that = this;
    this.par = parAct;
    this.ali = new Module.IcmAlignment(aliName);
    this.ali.canvas.icmAliObj = this;
    this.aliName = aliName;
    this.html = this.ali.htmlElement();
    this.html.icmAlignment = this.ali;
    this.html.icmAlignmentObj = this;
    this.toolsPanel = this.html.children[2];
    {
        this.toolsButton = Module.makeImage("pm_config.png", "Toggle tools Panel");
        this.toolsButton.style.position = "absolute";
        this.toolsButton.style.cursor = "pointer";
        this.toolsButton.onclick = function () {
            that.showTools = !that.showTools
        };
        this.html.appendChild(this.toolsButton);
        this.toolsPanel.style.marginTop = "30px";
        this.toolsPanel.style.marginLeft = "10px";
        this.addCheckBox("Ruler", false, function () {
            that.ali.showRuler = this.checked
        }, true);
        this.addComboBox("By", ["global"].concat(this.ali.listSequences), this.ali.seqRuler, function () {
            that.ali.seqRuler = parseInt(this.value)
        });
        this.addCheckBox("Consensus", true, function () {
            that.ali.showConsensus = this.checked
        });
        this.addCheckBox("Prfile", false, function () {
            that.ali.showProfile = this.checked
        });
        this.addComboBox("Color By", this.ali.listColorSchemas, this.ali.colorScheme, function () {
            that.ali.colorScheme = parseInt(this.value)
        })
    }
    this.ali.canvas.onmousedown = function (ev) {
        that.mouseDown(ev)
    };
    this.ali.canvas.onmouseup = function (ev) {
        that.mouseUp(ev)
    };
    this.ali.canvas.onmousemove = function (ev) {
        that.mouseMove(ev)
    };
    this.ali.canvas.onmouseleave = this.ali.canvas.onmouseout = function (ev) {
        that.tooltip.style.display = "none"
    };
    this.pressPos = null;
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip";
    this.tooltip.style.display = "none";
    this.html.appendChild(this.tooltip);
    Object.defineProperty(this, "showTools", {
        get: function () {
            return this.toolsPanel.style.display != "none"
        }, set: function (v) {
            this.toolsPanel.style.display = v ? "block" : "none";
            this.updateLayout()
        }
    })
};
ActiveIcmAlignment.prototype.addComboBox = function (name, list, value, callback, nobr) {
    var lbl = document.createTextNode(name);
    this.toolsPanel.appendChild(lbl);
    var cb = document.createElement("select");
    for (var i = 0; i < list.length; i++) {
        cb.options[cb.options.length] = new Option(list[i], i)
    }
    cb.value = value;
    if (callback) cb.onchange = callback;
    this.toolsPanel.appendChild(cb);
    if (!nobr) this.toolsPanel.appendChild(document.createElement("br"))
};
ActiveIcmAlignment.prototype.addCheckBox = function (name, value, callback, nobr) {
    var chk = document.createElement("input");
    chk.setAttribute("type", "checkbox");
    this.toolsPanel.appendChild(chk);
    var lbl = document.createTextNode(name);
    if (value) chk.setAttribute("checked", true);
    if (callback) chk.onclick = callback;
    this.toolsPanel.appendChild(lbl);
    if (!nobr) this.toolsPanel.appendChild(document.createElement("br"))
};
ActiveIcmAlignment.prototype.setHeight = function (hh) {
};
ActiveIcmAlignment.prototype.setWidth = function (ww) {
    this.html.children[0].style.display = "block";
    var w = ww - this.html.children[0].clientWidth - 20;
    if (this.toolsPanel.style.display != "none") w -= this.toolsPanel.clientWidth;
    this.html.children[1].style.width = w + "px";
    this.html.style.width = ww + "px";
    this.toolsButton.style.top = "40px";
    this.toolsButton.style.left = ww - 20 + "px"
};
ActiveIcmAlignment.prototype.updateLayout = function () {
    this.setWidth(this.html.parentElement.clientWidth)
};
ActiveIcmAlignment.prototype.showTooltipAt = function (ev) {
    var pp = this.ali.getAliPos(ev);
    var info = this.ali.getInfoAtPos(pp);
    if (info) {
        var pos = {x: ev.clientX, y: ev.clientY};
        var rect2 = this.html.parentTab.getBoundingClientRect();
        this.tooltip.style.bottom = rect2.height - (pos.y - rect2.y) + "px";
        this.tooltip.style.left = pos.x - rect2.x + "px";
        this.tooltip.innerHTML = info;
        this.tooltip.style.display = "block"
    } else this.tooltip.style.display = "none"
};
ActiveIcmAlignment.prototype.updateSelection = function () {
    this.ali.update()
};
ActiveIcmAlignment.prototype.getMousePos = function (ev) {
    var rect = this.ali.canvas.getBoundingClientRect();
    return {
        x: (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left,
        y: (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top
    }
};
ActiveIcmAlignment.prototype.mouseDown = function (ev) {
    this.ali.clearSelection();
    this.pressPos = this.ali.getAliPos(ev);
    this.par.act.Redraw()
};
ActiveIcmAlignment.prototype.mouseMove = function (ev) {
    if (this.pressPos) {
        this.ali.selectFromTo(this.pressPos, this.ali.getAliPos(ev));
        this.par.act.Redraw()
    }
    this.showTooltipAt(ev)
};
ActiveIcmAlignment.prototype.mouseUp = function (ev) {
    if (this.pressPos) {
        this.par.updateMenu()
    }
    this.pressPos = null
};
ActiveIcmTableExtraPlotPanel = function (icmTable, plotNum) {
    this.icmTable = icmTable;
    this.plotNum = plotNum;
    this.html = document.createElement("div");
    this.canvas = document.createElement("canvas");
    this.html.appendChild(this.canvas);
    this.icmTable.tab.createPlot(this.plotNum, this.canvas);
    var that = this;
    this.canvas.onmousedown = function (ev) {
        that.icmTable.tab.plotMousePressEvent(that.plotNum, ev)
    };
    this.canvas.onmouseup = function (ev) {
        that.icmTable.tab.plotMouseReleaseEvent(that.plotNum, ev)
    };
    this.canvas.onmousemove = function (ev) {
        that.icmTable.tab.plotMouseMoveEvent(that.plotNum, ev)
    };
    this.canvas.onwheel = function (ev) {
        that.icmTable.tab.plotWheelEvent(that.plotNum, ev);
        ev.preventDefault()
    }
};
ActiveIcmTableExtraPlotPanel.prototype.setSize = function (ww, hh) {
    this.html.style.width = ww + "px";
    this.html.style.height = hh + "px";
    var dpr = window.devicePixelRatio || 1;
    this.canvas.width = ww * dpr;
    this.canvas.height = hh * dpr;
    if (dpr > 1) {
        this.canvas.style.width = ww + "px";
        this.canvas.style.height = hh + "px";
        this.canvas.getContext("2d").scale(dpr, dpr)
    }
    this.draw()
};
ActiveIcmTableExtraPlotPanel.prototype.title = function () {
    return this.icmTable.tab.plotTitle(this.plotNum)
};
ActiveIcmTableExtraPlotPanel.prototype.activated = function () {
    this.draw()
};
ActiveIcmTableExtraPlotPanel.prototype.draw = function () {
    this.icmTable.tab.drawPlot(this.plotNum)
};
ActiveIcmTableExtraPlotPanel.prototype.update = function () {
    this.icmTable.tab.updatePlot(this.plotNum)
};
ActiveIcmTableExtraPlotPanel.prototype.type = function () {
    return "plot"
};
ActiveIcmTableExtraClusterPanel = function (icmTable, clusterNum) {
    this.icmTable = icmTable;
    this.clusterNum = clusterNum;
    this.html = document.createElement("div");
    this.canvas = document.createElement("canvas");
    this.html.appendChild(this.canvas);
    this.html.style.overflow = "auto";
    this.icmTable.tab.createCluster(this.clusterNum, this.canvas);
    var that = this;
    this.canvas.onmousedown = function (ev) {
        that.icmTable.tab.clusterMousePressEvent(that.clusterNum, ev)
    };
    this.canvas.onmouseup = function (ev) {
        that.icmTable.tab.clusterMouseReleaseEvent(that.clusterNum, ev)
    };
    this.canvas.onmousemove = function (ev) {
        that.icmTable.tab.clusterMouseMoveEvent(that.clusterNum, ev)
    };
    this.canvas.onwheel = function (ev) {
    }
};
ActiveIcmTableExtraClusterPanel.prototype.setSize = function (ww, hh) {
    this.html.style.width = ww + "px";
    this.html.style.height = hh + "px";
    var dpr = window.devicePixelRatio || 1;
    this.draw(ww)
};
ActiveIcmTableExtraClusterPanel.prototype.title = function () {
    return this.icmTable.tab.plotTitle(this.clusterNum)
};
ActiveIcmTableExtraClusterPanel.prototype.activated = function () {
    this.draw(this.html.clientWidth)
};
ActiveIcmTableExtraClusterPanel.prototype.draw = function (ww) {
    this.icmTable.tab.drawCluster(this.clusterNum, ww)
};
ActiveIcmTableExtraClusterPanel.prototype.update = function () {
    this.icmTable.tab.updateCluster(this.clusterNum)
};
ActiveIcmTableExtraClusterPanel.prototype.type = function () {
    return "cluster"
};
ActiveIcmTable = function (tabName, parAct) {
    var that = this;
    this.par = parAct;
    this.tab = new Module.IcmTable(tabName);
    this.tabName = tabName;
    this.tableExtraRatio = .65;
    this.splitterW = 6;
    var divCont = document.createElement("div");
    divCont.style.display = "block";
    this.htmlTabViewport = document.createElement("div");
    this.htmlTabViewport.style.overflow = "auto";
    this.htmlTabViewport.gridWidth = 0;
    this.htmlTabViewport.onscroll = function (ev) {
        that.scrolled()
    };
    this.htmlTab = this.tab.htmlElement();
    this.htmlTab.style.overflow = "hidden";
    this.htmlTab.icmTable = this.tab;
    this.htmlTab.icmTableObj = this;
    this.htmlTab.viewport = this.htmlTabViewport;
    this.htmlTabViewport.appendChild(this.htmlTab);
    this.htmlTab.tabindex = "0";
    this.htmlTab.onkeydown = this.htmlTabViewport.onkeydown = divCont.onkeydown = function (ev) {
        that.keyPressEvent(ev)
    };
    divCont.appendChild(this.htmlTabViewport);
    this.htmlTabViewport.style.display = "block";
    this.htmlTabViewport.style.float = "left";
    this.tabToolsWidth = 24;
    this.tabTools = document.createElement("div");
    this.tabTools.className = "tabTools";
    this.tabTools.style.display = "block";
    this.tabTools.style.float = "left";
    this.tabTools.style.width = this.tabToolsWidth + "px";
    divCont.appendChild(this.tabTools);
    this.tabTools.appendChild(Module.makeImage("pm_edit_pen32.png", "Toggle Edit mode", "icon16")).onclick = function () {
        var on = this.className == "icon16";
        that.htmlTab.contentEditable = on ? "true" : "false";
        this.className = on ? "icon16_down" : "icon16"
    };
    this.tabTools.appendChild(Module.makeImage("pm_view_grid.png", "Toggle Gtrid/Table View", "icon16")).onclick = function () {
        var on = this.className == "icon16";
        that.tab.setDisplayStyle(on ? 1 : 0);
        this.className = on ? "icon16_down" : "icon16"
    };
    this.vsplit = document.createElement("div");
    this.vsplit.className = "vsplitter";
    this.vsplit.style.display = "block";
    this.vsplit.style.float = "left";
    Module.makeDraggable(this.vsplit, this.vsplit, true, false, null, null, null, function (el) {
        var p = that.vsplit.offsetLeft / that.html.offsetWidth;
        that.tableExtraRatio = p;
        that.setSize(that.html.clientWidth, undefined)
    });
    divCont.appendChild(this.vsplit);
    this.icmTableExtra = new ActiveIcmTabView;
    divCont.appendChild(this.icmTableExtra.mainDiv);
    this.html = divCont;
    this.html.icmTableObj = this;
    this.html.icmTable = this.tab;
    this.canvascells = [];
    this.fillTableFromElements();
    this.lastClickedColumn = -1;
    this.lastClickedColumn = -1;
    this.resizedColumn = -1;
    this.resizedRow = -1;
    this.createExtras()
};
ActiveIcmTable.prototype.editMode = function () {
    return this.htmlTab.contentEditable == "true"
};
ActiveIcmTable.prototype.freeElements = function (ev) {
    for (var i = 0; i < this.canvascells.length; i++) {
        if (this.canvascells[i].plot) {
            this.canvascells[i].plot.delete()
        }
        if (this.canvascells[i].icmchem) {
            this.canvascells[i].icmchem.delete()
        }
    }
};
ActiveIcmTable.prototype.scrolled = function () {
    this.redrawVisibleCanvases()
};
ActiveIcmTable.prototype.visibleRows = function () {
    if (this.html.style.display == "none") return [];
    var topY = this.htmlTabViewport.scrollTop;
    var bottomY = topY + this.htmlTabViewport.clientHeight;
    var vrows = [];
    for (var row = 1; row < this.htmlTab.children.length; row++) {
        var th = this.htmlTab.children[row].children[0];
        if (th.offsetTop > bottomY) break;
        var t = th.offsetTop;
        var b = th.offsetTop + th.clientHeight;
        if (b >= topY && b <= bottomY || t >= topY && t <= bottomY) vrows[vrows.length] = row
    }
    if (vrows.length == 0) return [];
    if (vrows.length == 1) return [vrows[0], vrows[0]];
    return [vrows[0], vrows[vrows.length - 1]]
};
ActiveIcmTable.prototype.redrawVisibleCanvases = function () {
    var rr = this.visibleRows();
    if (rr.length == 0) return;
    for (var row = rr[0]; row <= rr[1]; row++) {
        var r = this.htmlTab.children[row].children;
        for (var col = 1; col < r.length; col++) {
            var td = r[col];
            var w = td.clientWidth - this.columnPadding(col - 1);
            var h = td.clientHeight - this.rowPadding(row - 1);
            if (td.prop) h -= td.prop.clientHeight;
            var inline_obj = null;
            if (td.chem) inline_obj = td.chem; else if (td.plot) inline_obj = td.plot;
            if (inline_obj) {
                if (td.syncSel) inline_obj.isDirty = true;
                if (inline_obj.isDirty) {
                    if (w != inline_obj.canvas.width || h != inline_obj.canvas.height) {
                        inline_obj.resizeCanvas(w, h)
                    } else inline_obj.drawMolIfDirty()
                }
            }
        }
    }
};
ActiveIcmTable.prototype.activated = function () {
    this.redrawVisibleCanvases();
    if (this.extraPanelVisible()) {
        this.icmTableExtra.updateLayout()
    }
};
ActiveIcmTable.prototype.createExtras = function () {
    var plots = this.tab.plots;
    this.icmTableExtra.clearTabs();
    for (var i = 0; i < plots.length; i++) {
        var plotTab = new ActiveIcmTableExtraPlotPanel(this, i);
        this.icmTableExtra.addTab(plotTab.title(), plotTab)
    }
    var cl = this.tab.cluster;
    if (cl) {
        var clusterTab = new ActiveIcmTableExtraClusterPanel(this, cl.num);
        this.icmTableExtra.addTab("Tree", clusterTab)
    }
    var extraVisible = this.icmTableExtra.nofTabs() > 0;
    this.icmTableExtra.mainDiv.style.display = this.vsplit.style.display = extraVisible ? "block" : "none"
};
ActiveIcmTable.prototype.extraPanelVisible = function () {
    return this.icmTableExtra.mainDiv.style.display != "none"
};
ActiveIcmTable.prototype.setSize = function (ww, hh) {
    this.html.style.width = ww + "px";
    var tab_w = this.extraPanelVisible() ? ww * this.tableExtraRatio : ww;
    tab_w -= this.tabToolsWidth * 2;
    this.htmlTabViewport.gridWidth = tab_w;
    this.htmlTabViewport.style.width = tab_w + "px";
    if (hh) {
        this.html.style.height = hh + "px";
        this.htmlTabViewport.style.height = hh + "px"
    }
    this.tabTools.style.left = tab_w + "px";
    if (this.extraPanelVisible()) {
        this.vsplit.style.left = tab_w + this.splitterW + this.tabTools.clientWidth + "px";
        if (hh) this.icmTableExtra.mainDiv.style.height = hh + "px";
        this.icmTableExtra.updateLayout()
    }
    if (this.tab.displayStyle() == 1) this.update();
    this.redrawVisibleCanvases()
};
ActiveIcmTable.prototype.updateSelection = function () {
    var tbody = this.htmlTab.tbody;
    if (!tbody.length) return;
    var thead = tbody[0];
    var imgSrcBase = Module.locationPrefix + "icons/";
    var that = this;
    var isGrid = this.tab.displayStyle() == 1;
    if (!isGrid) {
        for (var c = 1; c < thead.length; c++) {
            var th = this.htmlTab.children[0].children[c];
            var imgSrc = "pm_empty.png";
            if (thead[c].mg & Module.M_IS_SELECTED_COL) {
                var o = thead[c].sortOrder;
                imgSrc = o == Module.BeeAscendingOrder ? "pm_sort_ascending.png" : o == Module.BeeDescendingOrder ? "pm_sort_descending.png" : "pm_sort_any.png";
                th.img.style.cursor = "pointer";
                th.img.style.display = "block"
            } else {
                th.img.onclick = function () {
                };
                th.img.style.cursor = "default";
                th.img.style.display = "none"
            }
            th.img.src = imgSrcBase + imgSrc;
            th.img.onclick = function (ev) {
                ev.preventDefault();
                that.columnSortClicked(ev, this)
            }
        }
    }
    for (var r = 1; r < tbody.length; r++) {
        var row = tbody[r];
        for (var c = 1; c < row.length; c++) {
            var sel = this.tab.rowIsSelected(row[c].row) || !isGrid && this.tab.columnIsSelected(row[c].col);
            this.htmlTab.children[r].children[c].style.backgroundColor = sel ? "#AAAAD2" : row[c].bgcolor ? row[c].bgcolor : "#FFF"
        }
    }
    this.redrawPlots()
};
ActiveIcmTable.prototype.redrawPlots = function () {
    for (var i = 0; i < this.icmTableExtra.nofTabs(); i++) {
        var ex = this.icmTableExtra.widgetAt(i);
        if (ex.type() == "plot") ex.draw(); else if (ex.type() == "cluster") ex.update()
    }
};
ActiveIcmTable.prototype.updatePlots = function () {
    for (var i = 0; i < this.icmTableExtra.nofTabs(); i++) this.icmTableExtra.widgetAt(i).update()
};
ActiveIcmTable.prototype.updateRotatedHeaders = function (refreshColWidth) {
    for (var i = 0; i < this.rot.length; i++) {
        var rr = this.rot[i];
        if (refreshColWidth) rr.w = this.columnHeader(rr.col).offsetWidth - this.columnPadding(rr.col);
        var trans = "translate(" + (-this.maxHeight / 2 + rr.w / 2) + "px," + 0 + "px) rotate(-90deg);";
        var rotateCss = "-webkit-transform: " + trans;
        rotateCss += "-moz-transform: " + trans;
        rotateCss += "-ms-transform: " + trans;
        rr.txt.style.position = "relative";
        rr.txt.style.height = rr.w + "px";
        rr.txt.style.width = this.maxHeight + "px";
        rr.txt.style.cssText += rotateCss;
        rr.txt2.style.bottom = rr.w / 2 - this.headerFontSize / 2 + "px"
    }
};
ActiveIcmTable.prototype.fillTableFromElements = function () {
    if (!this.htmlTab.tbody.length) return;
    this.canvascells = [];
    var thead = document.createElement("thead");
    var that = this;
    var headerClickCallback = function (ev) {
        return that.columnClicked(ev, this)
    };
    var headerMouseMoveCallback = function (ev) {
        return that.mouseMovedOverHeader(ev, this)
    };
    var headerMousePressCallback = function (ev) {
        return that.mousePressOverHeader(ev, this)
    };
    var headerMouseReleaseCallback = function (ev) {
        return that.mouseReleaseOverHeader(ev, this)
    };
    var headerPopupMenu = function (ev) {
        return that.columnPopupMenu(ev, this)
    };
    var cellKeyPessCallback = function (ev) {
        return that.keyPressEvent(ev, this)
    };
    var cellClickCallback = function (ev) {
        return that.cellClicked(ev, this)
    };
    var rowClickCallback = function (ev) {
        return that.rowClicked(ev, this)
    };
    var rowHeaderMouseMoveCallback = function (ev) {
        return that.mouseMovedOverRowHeader(ev, this)
    };
    var rowHeaderMousePressCallback = function (ev) {
        return that.mousePressedOverRowHeader(ev, this)
    };
    var rowHeaderMouseReleaseCallback = function (ev) {
        return that.mouseReleasedOverRowHeader(ev, this)
    };
    var rowHeaderPopupMenu = function (ev) {
        return that.rowPopupMenu(ev, this)
    };
    var totalWidth = 0;
    var maxHeight = 0;
    var th0;
    var rot = [];
    this.headerFontSize = 14;
    for (var j = 0; j < this.htmlTab.tbody[0].length; j++) {
        var th = document.createElement("th");
        var hdr = this.htmlTab.tbody[0][j];
        if (j == 0) {
            th0 = th;
            th.style.backgroundColor = "#EEE";
            th.style.width = "25px";
            totalWidth += 25
        } else {
            var txt = document.createElement("div");
            th.appendChild(txt);
            var compressedView = (this.tab.exmg & Module.M_TAB_EXMG_COMPRESSED_VIEW) != 0;
            var textAdded = false;
            if (hdr.colWidth) {
                var ctx = this.par.hidden_canvas.getContext("2d");
                ctx.font = this.headerFontSize + 2 + "px Arial";
                var textWidth = Math.ceil(ctx.measureText(hdr.textNode).width);
                if (compressedView && textWidth > hdr.colWidth) {
                    var hh = textWidth;
                    var ww = hdr.colWidth;
                    textAdded = true;
                    var txt2 = document.createElement("span");
                    txt.appendChild(txt2);
                    txt2.style.position = "absolute";
                    txt2.style.left = "2px";
                    txt2.style["white-space"] = "nowrap";
                    txt2.innerHTML = hdr.textNode;
                    rot[rot.length] = {th: th, txt: txt, w: ww, txt2: txt2, col: j - 1};
                    if (hh > maxHeight) maxHeight = hh
                }
                th.style.width = hdr.colWidth + "px";
                totalWidth += hdr.colWidth
            } else if (hdr.ty == Module.bvChemical) {
                th.style.width = Module.DEF_CHEM_WIDTH + "px";
                totalWidth += Module.DEF_CHEM_WIDTH
            }
            if (!textAdded && hdr.textNode.length) txt.innerHTML = hdr.textNode;
            th.num = hdr.num;
            th.lnum = j - 1;
            th.tab = hdr.tab;
            th.img = Module.makeImage("pm_sort_any.png", "Sort by Column");
            th.img.style.display = "none";
            th.img.num = hdr.num;
            th.appendChild(th.img);
            th.onclick = headerClickCallback;
            if (Module.usePointers) {
                th.onpointerdown = headerMousePressCallback;
                th.onpointerup = headerMouseReleaseCallback;
                th.onpointermove = headerMouseMoveCallback
            } else {
                th.onmousedown = headerMousePressCallback;
                th.onmouseup = headerMouseReleaseCallback;
                th.onmousemove = headerMouseMoveCallback
            }
            th.oncontextmenu = headerPopupMenu
        }
        thead.appendChild(th)
    }
    if (maxHeight) th0.style.height = maxHeight + "px";
    this.maxHeight = maxHeight;
    this.rot = rot;
    this.updateRotatedHeaders(false);
    this.htmlTab.appendChild(thead);
    this.htmlTab.style.width = totalWidth + "px";
    this.htmlTab.oninput = function (e) {
        that.currentCellChanged(e)
    };
    for (var i = 1; i < this.htmlTab.tbody.length; i++) {
        var tr = document.createElement("tr");
        if (this.htmlTab.tbody[i].doubleClickAction) {
            tr.doubleClickAction = this.htmlTab.tbody[i].doubleClickAction;
            tr.ondblclick = function () {
                if (!that.editMode()) that.par.RunCommands(this.doubleClickAction)
            }
        }
        for (var j = 0; j < this.htmlTab.tbody[i].length; j++) {
            var el = this.htmlTab.tbody[i][j];
            var td = document.createElement(j == 0 ? "th" : "td");
            if (j == 0) {
                if (el.height) td.style.height = el.height;
                td.num = el.num;
                td.lnum = i - 1;
                td.tab = el.tab;
                td.onclick = rowClickCallback;
                if (Module.usePointers) {
                    td.onpointermove = rowHeaderMouseMoveCallback;
                    td.onpointerup = rowHeaderMouseReleaseCallback;
                    td.onpointerdown = rowHeaderMousePressCallback
                } else {
                    td.onmousemove = rowHeaderMouseMoveCallback;
                    td.onmouseup = rowHeaderMouseReleaseCallback;
                    td.onmousedown = rowHeaderMousePressCallback
                }
                td.oncontextmenu = rowHeaderPopupMenu
            } else td.el = el;
            var hdr = this.htmlTab.tbody[0][j];
            if (j > 0 && hdr.mg & (Module.M_LOCK_DS | Module.M_LARRAY)) {
                var chk = document.createElement("input");
                chk.setAttribute("type", "checkbox");
                if (el.checked) chk.setAttribute("checked", el.checked);
                td.appendChild(chk);
                if (el.lockAction) {
                    chk.lockAction = el.lockAction;
                    chk.lockObjectTag = el.lockObjectTag;
                    chk.onchange = function () {
                        that.par.RunCommands(this.lockAction);
                        if (this.lockObjectTag) this.checked = that.par.act.IsDisplayed(this.lockObjectTag); else that.updatePlots()
                    }
                }
            } else if (el.plot) {
                var canvas = document.createElement("canvas");
                td.appendChild(canvas);
                td.plot = new Module.IcmPlot(canvas, el.plot);
                td.row = el.row;
                td.col = el.col;
                this.canvascells[this.canvascells.length] = td
            } else if (j > 0 && hdr.ty == Module.bvChemical) {
                td.row = el.row;
                td.col = el.col;
                if (el.mol2) {
                    var canvas = document.createElement("canvas");
                    td.appendChild(canvas);
                    var chemview = new Module.IcmChemicalView(canvas, el.mol2);
                    td.chem = chemview;
                    td.icmchem = td.chem;
                    td.row = el.row;
                    td.col = el.col;
                    if (el.syncSel) {
                        canvas.onmousedown = function (ev) {
                            td.icmchem.mousePressEvent(ev)
                        };
                        canvas.onmouseup = function (ev) {
                            td.icmchem.mouseReleaseEvent(ev)
                        };
                        canvas.onmousemove = function (ev) {
                            td.icmchem.mouseMoveEvent(ev)
                        };
                        canvas.onwheel = function (ev) {
                            td.icmchem.wheelEvent(ev);
                            ev.preventDefault()
                        }
                    }
                } else {
                    td.chem = new ChemicalView(el.mol, td, hdr.colWidth ? hdr.colWidth : Module.DEF_CHEM_WIDTH, Module.DEF_CHEM_HEIGHT, "rdonly,noredraw", 5)
                }
                if (el.syncSel) td.syncSel = true;
                if (el.cursorAction) td.cursorAction = el.cursorAction;
                if (el.prop && el.prop.length) {
                    var propDiv = document.createElement("table");
                    propDiv.className = "simpleTable";
                    propDiv.style.width = "100%";
                    td.appendChild(propDiv);
                    var props = [[], [], []];
                    for (var k = 0; k < el.prop.length; k++) {
                        if (el.prop[k][0].startsWith("Left_")) {
                            el.prop[k][0] = el.prop[k][0].substr(5);
                            props[0][props[0].length] = el.prop[k]
                        } else if (el.prop[k][0].endsWith("_Left")) {
                            el.prop[k][0] = el.prop[k][0].substr(0, el.prop[k][0].length - 5);
                            props[0][props[0].length] = el.prop[k]
                        } else if (el.prop[k][0].startsWith("Right_")) {
                            el.prop[k][0] = el.prop[k][0].substr(6);
                            props[1][props[1].length] = el.prop[k]
                        } else if (el.prop[k][0].endsWith("_Right")) {
                            el.prop[k][0] = el.prop[k][0].substr(0, el.prop[k][0].length - 6);
                            props[1][props[1].length] = el.prop[k]
                        } else {
                            props[2][props[2].length] = el.prop[k]
                        }
                    }
                    var nr = Math.max(props[0].length, props[1].length) + props[2].length;
                    for (var kk = 0; kk < nr; kk++) {
                        var row = propDiv.appendChild(document.createElement("tr"))
                    }
                    var span = props[1].length > 0 ? 2 : 1;
                    for (var kk = 0; kk < props.length; kk++) {
                        var rr = kk < 2 ? 0 : Math.max(props[0].length, props[1].length);
                        for (var k = 0; k < props[kk].length; k++) {
                            var row = propDiv.children[rr + k];
                            row.appendChild(document.createElement("td"));
                            if (kk <= 1 || props[kk][k][0] != "NAME_") {
                                row.appendChild(document.createElement("td"));
                                var n = row.children.length;
                                row.children[n - 2].innerHTML = props[kk][k][0];
                                row.children[n - 1].innerHTML = props[kk][k][1];
                                row.children[n - 1].style.backgroundColor = props[kk][k][2];
                                if (n == 2) {
                                    row.children[n - 2].style.width = "1%";
                                    row.children[n - 1].style.width = "99%"
                                } else {
                                    row.children[n - 1].style.width = "48%";
                                    row.children[n - 2].style.width = "1%";
                                    row.children[n - 3].style.width = "48%";
                                    row.children[n - 4].style.width = "1%"
                                }
                                if (kk == 2) {
                                    row.children[0].colSpan = span;
                                    row.children[1].colSpan = span
                                }
                            } else {
                                row.children[0].colSpan = 2 * span;
                                row.children[0].style["text-align"] = "center";
                                row.children[0].appendChild(document.createTextNode(props[kk][k][1]))
                            }
                        }
                    }
                    td.prop = propDiv
                }
                this.canvascells[this.canvascells.length] = td
            } else {
                td.row = el.row;
                td.col = el.col;
                if (el.innerHTML) td.innerHTML = el.innerHTML
            }
            if (el.bgcolor) td.style.backgroundColor = el.bgcolor;
            if (j > 0) td.onclick = cellClickCallback;
            tr.appendChild(td)
        }
        this.htmlTab.appendChild(tr)
    }
    this.icmTableExtra.updateLayout()
};
ActiveIcmTable.prototype.refreshCanvasSizes = function (col, row) {
    for (var i = 0; i < this.canvascells.length; i++) {
        if ((typeof col == "undefined" || this.canvascells[i].col == col) && (typeof row == "undefined" || this.canvascells[i].row == row)) {
            if (this.canvascells[i].chem) this.canvascells[i].chem.isDirty = true; else if (this.canvascells[i].plot) this.canvascells[i].plot.isDirty = true
        }
    }
    this.redrawVisibleCanvases()
};
ActiveIcmTable.prototype.update = function () {
    this.tab.update();
    this.fillTableFromElements();
    this.redrawVisibleCanvases();
    this.updateSelection()
};
ActiveIcmTable.prototype.updateIfNeeded = function () {
    if (this.tab.needsUpdate) {
        this.tab.update();
        this.fillTableFromElements()
    }
    this.redrawVisibleCanvases();
    this.updateSelection()
};
ActiveIcmTable.prototype.columnSortClicked = function (ev, img) {
    var col = img.num;
    var cmd = "sort ";
    ev.preventDefault();
    if (this.tab.calcSortOrder(col) == 1) cmd += "reverse ";
    cmd += this.tab.columnInfo(col).name;
    this.tab.runCommands(cmd);
    return true
};
ActiveIcmTable.prototype.findTopLeft = function () {
    var curleft = curtop = 0;
    var obj = this.htmlTab;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft;
        curtop = obj.offsetTop;
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop
        }
    }
    curleft -= this.htmlTab.viewport.scrollLeft;
    curtop -= this.htmlTab.viewport.scrollTop;
    return [curleft, curtop]
};
ActiveIcmTable.prototype.isOnBorderRight = function (th, ev) {
    return ev.clientX > this.findTopLeft()[0] + th.offsetLeft + th.offsetWidth - 4
};
ActiveIcmTable.prototype.isOnBorderBottom = function (th, ev) {
    return ev.clientY > this.findTopLeft()[1] + th.offsetTop + th.offsetHeight - 4
};
ActiveIcmTable.prototype.isOnBorderLeft = function (th, ev) {
    return ev.clientX < this.findTopLeft()[0] + th.offsetLeft + 4
};
ActiveIcmTable.prototype.isOnBorderTop = function (th, ev) {
    return ev.clientY < this.findTopLeft()[1] + th.offsetTop + 4
};
ActiveIcmTable.prototype.rowPopupMenu = function (ev, td) {
    ev.preventDefault();
    var that = this;
    this.par.popupMenu.clear();
    this.par.popupMenu.addItem("Delete Row", function () {
        that.tab.runCommands("delete {0}[{1}]".format(that.tabName, td.num + 1))
    });
    this.par.popupMenu.buildMenu();
    this.par.showPopupAt(ev.clientX, ev.clientY);
    return true
};
ActiveIcmTable.prototype.columnPopupMenu = function (ev, th) {
    ev.preventDefault();
    var that = this;
    this.par.popupMenu.clear();
    var info = this.tab.columnInfo(th.num);
    if (info.ty == 40 && info.ptty == 1) {
        this.par.popupMenu.addItem("Orient Optimally", function () {
            that.tab.runCommands("make flat rotate " + info.name)
        })
    }
    this.par.popupMenu.buildMenu();
    this.par.showPopupAt(ev.clientX, ev.clientY);
    return true
};
ActiveIcmTable.prototype.mousePressOverHeader = function (ev, th) {
    this.resizedColumn = -1;
    this.colResizeStartX = -1;
    if (ev.target == th) {
        if (this.isOnBorderRight(th, ev)) {
            this.resizedColumn = th.lnum
        } else if (this.isOnBorderLeft(th, ev) && th.lnum > 0) {
            this.resizedColumn = th.lnum - 1
        }
    }
    if (this.resizedColumn != -1) {
        th.setPointerCapture(ev.pointerId);
        this.colResizeStartX = ev.pageX;
        this.colResizeWidth = this.columnHeader(this.resizedColumn).offsetWidth - this.columnPadding(this.resizedColumn);
        this.colResizeHeadWidth = this.htmlTab.children[0].offsetWidth
    }
    return this.resizedColumn != -1
};
ActiveIcmTable.prototype.mousePressedOverRowHeader = function (ev, th) {
    this.resizedRow = -1;
    this.rowResizeStartY = -1;
    if (ev.target == th) {
        if (this.isOnBorderBottom(th, ev)) this.resizedRow = th.num; else if (this.isOnBorderTop(th, ev) && th.num > 0) this.resizedRow = th.num - 1
    }
    if (this.resizedRow != -1) {
        th.setPointerCapture(ev.pointerId);
        this.rowResizeStartY = ev.pageY;
        this.rowResizeHeight = this.rowHeader(this.resizedRow).offsetHeight - this.rowPadding(this.resizedRow);
        this.rowResizeHeadHeight = this.htmlTab.offsetHeight
    }
    return this.resizedRow != -1
};
ActiveIcmTable.prototype.mouseReleaseOverHeader = function (ev, th) {
    var resizedColumn = this.resizedColumn;
    this.resizedColumn = -1;
    this.colResizeStartX = -1;
    th.style.cursor = "default";
    if (ev.pointerId) th.releasePointerCapture(ev.pointerId);
    if (ev.target.sortIndicator) return true;
    if (ev.button == 2) {
        return true
    }
    if (resizedColumn == -1) {
        var col = th.num;
        var sel = !this.tab.columnIsSelected(col);
        if (!ev.shiftKey) {
            this.tab.selectColumns(col, col, sel, ev.metaKey || ev.ctrlKey);
            this.lastClickedColumn = sel ? col : -1
        } else {
            var cc = this.lastClickedColumn == -1 ? col : this.lastClickedColumn;
            this.tab.selectColumns(Math.min(cc, col), Math.max(cc, col), true, true)
        }
    } else {
        if (this.tab.displayStyle() == 1) {
            this.update()
        } else {
            this.refreshCanvasSizes(this.columnHeader(resizedColumn).num)
        }
        this.updateRotatedHeaders(true)
    }
    return true
};
ActiveIcmTable.prototype.mouseReleasedOverRowHeader = function (ev, th) {
    var resizedRow = this.resizedRow;
    this.resizedRow = -1;
    this.rowResizeStartY = -1;
    th.style.cursor = "default";
    if (ev.pointerId) th.releasePointerCapture(ev.pointerId);
    if (ev.button == 2) return true;
    if (resizedRow == -1) {
        var row = th.num;
        var sel = !this.tab.rowIsSelected(row);
        if (!ev.shiftKey) {
            this.tab.selectRows(row, row, sel, ev.metaKey || ev.ctrlKey);
            this.lastClickedRow = sel ? row : -1
        } else {
            var rr = this.lastClickedRow == -1 ? row : this.lastClickedRow;
            this.tab.selectRows(Math.min(rr, row), Math.max(rr, row), true, true)
        }
    } else {
        if (this.tab.displayStyle() == 1) {
            this.update()
        } else {
            if (ev.metaKey || ev.ctrlKey) this.resizeRowElements(-1, undefined);
            this.refreshCanvasSizes(undefined, ev.metaKey || ev.ctrlKey ? undefined : this.rowHeader(resizedRow).num)
        }
    }
    return true
};
ActiveIcmTable.prototype.columnPadding = function (col) {
    var th = this.columnHeader(col);
    return parseInt(Module.getStyleVal(th, "padding-left")) + parseInt(Module.getStyleVal(th, "padding-right"))
};
ActiveIcmTable.prototype.rowPadding = function (row) {
    var th = this.rowHeader(row);
    return parseInt(Module.getStyleVal(th, "padding-top")) + parseInt(Module.getStyleVal(th, "padding-bottom"))
};
ActiveIcmTable.prototype.columnHeader = function (col) {
    return this.htmlTab.children[0].children[col + 1]
};
ActiveIcmTable.prototype.mouseMovedOverHeader = function (ev, th) {
    th.style.cursor = ev.target == th && (this.resizedColumn != -1 || this.isOnBorderRight(th, ev) || this.isOnBorderLeft(th, ev)) ? "ew-resize" : "default";
    if (this.resizedColumn != -1) {
        var thead = this.htmlTab.children[0];
        var th = this.columnHeader(this.resizedColumn);
        th.style.cursor = "ew-resize";
        var diff = ev.pageX - this.colResizeStartX;
        th.style.width = this.colResizeWidth + diff + "px";
        this.tab.resizeColumn(th.num, this.colResizeWidth + diff);
        thead.style.width = this.colResizeHeadWidth + diff + "px";
        this.updateRotatedHeaders(true)
    }
};
ActiveIcmTable.prototype.resizeRowElements = function (row, height) {
    var visibleRows = this.visibleRows();
    var from, to;
    if (row != -1) {
        from = to = row
    } else {
        from = 0;
        to = this.htmlTab.children.length - 2
    }
    var postMode = row == -1;
    for (row = from; row <= to; row++) {
        var th = this.rowHeader(row);
        var hh = height;
        if (th.heightToSet) hh = th.heightToSet;
        if (!hh) continue;
        var r = this.htmlTab.children[row + 1].children;
        for (var col = 0; col < r.length; col++) {
            var td = r[col];
            var inline_obj = null;
            if (td.chem) inline_obj = td.chem; else if (td.plot) inline_obj = td.plot;
            if (inline_obj) {
                var h = Math.max(hh - this.rowPadding(row), 10);
                if (visibleRows.length == 2 && row + 1 >= visibleRows[0] && row + 1 <= visibleRows[1]) {
                    inline_obj.resizeCanvas(undefined, h)
                } else {
                    inline_obj.canvas.height = undefined;
                    inline_obj.isDirty = true
                }
            }
        }
        if (postMode) {
            th.style.height = hh + "px"
        }
    }
    if (postMode) {
        if (this.htmlTab.heightToSet) this.htmlTab.style.height = this.rowResizeHeadHeight + this.htmlTab.heightToSet + "px";
        this.htmlTab.heightToSet = undefined
    }
};
ActiveIcmTable.prototype.mouseMovedOverRowHeader = function (ev, th) {
    th.style.cursor = ev.target == th && (this.resizedRow != -1 || this.isOnBorderTop(th, ev) || this.isOnBorderBottom(th, ev)) ? "ns-resize" : "default";
    if (this.resizedRow != -1) {
        var th = this.rowHeader(this.resizedRow);
        th.style.cursor = "ns-resize";
        var diff = ev.pageY - this.rowResizeStartY;
        var numResized = 1;
        var totalUnsetDiff = 0;
        if (ev.metaKey || ev.ctrlKey) {
            numResized = this.htmlTab.children.length - 1;
            for (var i = 0; i < numResized; i++) {
                th = this.rowHeader(i);
                if (i == this.resizedRow) {
                    this.resizeRowElements(th.lnum, this.rowResizeHeight + diff);
                    th.style.height = this.rowResizeHeight + diff + "px"
                } else {
                    th.heightToSet = this.rowResizeHeight + diff;
                    totalUnsetDiff += diff
                }
            }
        } else {
            this.resizeRowElements(th.lnum, this.rowResizeHeight + diff);
            th.style.height = this.rowResizeHeight + diff + "px"
        }
        this.tab.resizeRow(ev.metaKey || ev.ctrlKey ? -1 : th.num, this.rowResizeHeight + diff);
        this.htmlTab.style.height = this.rowResizeHeadHeight + diff + "px";
        if (totalUnsetDiff) this.htmlTab.heightToSet = diff * numResized
    }
};
ActiveIcmTable.prototype.rowHeader = function (row) {
    return this.htmlTab.children[row + 1].children[0]
};
ActiveIcmTable.prototype.rowClicked = function (ev, th) {
};
ActiveIcmTable.prototype.columnClicked = function (ev, th) {
};
ActiveIcmTable.prototype.cellClicked = function (ev, td) {
    if (this.currentCell != td) {
        if (this.currentCell) {
            this.currentCell.className = "";
            if (this.editMode() && this.currentCell.modified) {
                this.commitCurrentChanges()
            }
        }
        this.currentCell = td;
        if (this.editMode()) {
            this.currentCell.valueBeforeEdit = this.tab.elementAt(this.currentCell.row, this.currentCell.col);
        }
        td.className = "currentCell";
        if (!this.editMode() && td.cursorAction) this.par.RunCommands(td.cursorAction)
    }
    if (ev.target.type == "checkbox") return true;
    this.tab.clearSelection();
    return true
};
ActiveIcmTable.prototype.commitCurrentChanges = function () {
    if (this.currentCell) {
        var ok = this.tab.setElementAt(this.currentCell.row, this.currentCell.col, this.currentCell.innerHTML);
        if (!ok) this.currentCell.innerHTML = this.currentCell.el.innerHTML;
        this.currentCell.modified = false
    }
};
ActiveIcmTable.prototype.cancelCurrentChanges = function () {
    if (this.currentCell) {
        this.currentCell.innerHTML = this.currentCell.valueBeforeEdit;
        this.currentCell.modified = false
    }
};
ActiveIcmTable.prototype.currentCellChanged = function (ev) {
    if (this.currentCell) this.currentCell.modified = true
};
ActiveIcmTable.prototype.keyPressEvent = function (ev) {
    var code = ev.charCode ? ev.charCode : ev.keyCode;
    var key = String.fromCharCode(code);
    if (this.currentCell && this.editMode()) {
        if (code == 27) {
            this.cancelCurrentChanges()
        } else if (code == 13) {
            this.commitCurrentChanges()
        }
    }
};
ActiveIcmJS.prototype.refreshLite = function () {
    this.seq.refreshTabs();
    if (this.sequenceViewVisibleAuto) this.sequenceViewVisible = this.seq.nofTabs() > 1 || this.seq.nofChainsOf(SequenceView.E_AMINO) > 0 || this.seq.nofChainsOf(SequenceView.E_NUCL) > 0;
    for (var i = 0; i < this.alignments.length; i++) {
        this.alignments[i].updateSelection()
    }
    for (var i = 0; i < this.tables.length; i++) {
        this.tables[i].updateIfNeeded()
    }
    this.updateMenu();
    if (this.ligeditTools) this.ligeditTools.refreshEnableState()
};
ActiveIcmJS.prototype.forceRefresh = function () {
    this.forceUpdate = true;
    this.refresh()
};
ActiveIcmJS.prototype.refresh = function () {
    var that = this;
    this.refreshLite();
    if (this.tableViewVisibleAuto) {
        if (this.forceUpdate || this.par.act.tables.length != this.tables.length || this.par.act.alignments.length != this.alignments.length || this.par.act.htmls.length != this.htmls.length) {
            this.forceUpdate = false;
            this.tabsPanel.clearTabs();
            this.toolsPanel.clearTabs();
            this.freeTables();
            for (var i = 0; i < this.par.act.tables.length; i++) this.tables[this.tables.length] = new ActiveIcmTable(this.par.act.tables[i], this);
            for (var i = 0; i < this.tables.length; i++) {
                var t = this.tabsPanel.addTab(this.tables[i].tabName, this.tables[i], Module.makeImage("pm_table.png"));
                t.tabName = this.tables[i].tabName;
                t.oncontextmenu = function (ev) {
                    ev.preventDefault();
                    var tab = this;
                    that.popupMenu.clear();
                    that.popupMenu.addItem("Delete", function () {
                        that.RunCommands("delete " + tab.tabName)
                    });
                    that.popupMenu.buildMenu();
                    that.showPopupAt(ev.clientX, ev.clientY)
                }
            }
            this.freeAlignments();
            for (var i = 0; i < this.par.act.alignments.length; i++) this.alignments[this.alignments.length] = new ActiveIcmAlignment(this.par.act.alignments[i], this);
            for (var i = 0; i < this.alignments.length; i++) {
                this.tabsPanel.addTab(this.alignments[i].aliName, this.alignments[i], Module.makeImage("pm_alignment.png"))
            }
            if (this.htmlViewVisibleAuto) {
                this.freeHtmls();
                for (var i = 0; i < this.par.act.htmls.length; i++) this.htmls[this.htmls.length] = new ActiveIcmHtml(this.par.act.htmls[i], this);
                for (var i = 0; i < this.htmls.length; i++) {
                    this.tabsPanel.addTab(this.htmls[i].htmlName, this.htmls[i], Module.makeImage("pm_html.png"))
                }
            }
            if (this.act.loadedModules.indexOf("ligedit") != -1) {
                this.toolsPanel.addTab("LigEdit", new ActiveIcmLigeditPanel(this), Module.makeImage("pm_ligedit.png"))
            }
        }
        this.tabsPanel.mainDiv.style.display = this.tabsPanel.nofTabs() > 0 ? "block" : "none";
        this.toolsPanel.mainDiv.style.display = this.toolsPanel.nofTabs() > 0 ? "block" : "none";
        this.canvas.style.display = this.act.needsGraphics ? "block" : "none";
        this.updateLayout();
        if (!this.gfVisible) this.rebuildMenu();
        if (this.htmls.length) {
            this.layoutMode = "hor"
        }
    }
};
ActiveIcmJS.prototype.updateLayout = function (liteMode) {
    this.updateCaption();
    var icongf = this.canvas.style.display != "none";
    this.cent.style.display = icongf ? "block" : "none";
    if (!icongf || this.tabsPanel.mainDiv.style.display == "none") {
        if (!icongf) this.searchInput.style.display = "none";
        this.tab_splitter.style.display = "none";
        this.tab_vsplitter.style.display = "none"
    } else {
        this.tab_splitter.style.display = this.layoutMode == "hor" ? "none" : "block";
        this.tab_vsplitter.style.display = this.layoutMode == "ver" ? "none" : "block"
    }
    var cap_h = this.caption.style.display == "none" ? 0 : this.caption.clientHeight;
    var seq_h = this.seq_cont.style.display == "none" ? 0 : this.seq_cont.offsetHeight;
    var tab_h = this.tabsPanel.mainDiv.style.display == "none" || this.layoutMode != "ver" ? 0 : this.cont.offsetHeight * this.tab_splitter_ratio;
    var split_h = this.tabsPanel.mainDiv.style.display == "none" ? 0 : this.tab_splitter.offsetHeight;
    var split_w = this.tabsPanel.mainDiv.style.display == "none" ? 0 : this.tab_vsplitter.offsetWidth;
    var search_h = this.searchInput.style.display == "none" ? 0 : this.searchInput.offsetHeight + 2;
    var toolsVisible = this.toolsPanel.mainDiv.style.display != "none";
    this.graphicsWindowTop = cap_h + search_h;
    var tools_w = 0;
    var tools_h = 0;
    var tools_split_w = 0;
    var h = this.par.clientHeight;
    var w = this.par.clientWidth;
    var tab_w = this.tabsPanel.mainDiv.style.display == "none" || this.layoutMode != "hor" ? 0 : w * this.tab_vsplitter_ratio;
    var hh = icongf ? h - cap_h - seq_h - tab_h - search_h - split_h : 0;
    if (!icongf) {
        tab_h = h - cap_h - seq_h - search_h - split_h;
        tab_w = w
    }
    this.tab_vsplitter2.style.display = toolsVisible ? "block" : "none";
    if (toolsVisible) {
        tools_split_w = this.tab_vsplitter2.offsetWidth;
        tools_w = w * this.tab_vsplitter2_ratio + tools_split_w;
        this.graphicsWindowLeft = tools_w + tools_split_w;
        tools_h = h - cap_h;
        if (icongf) tools_h -= tab_h
    }
    var menu_h = this.menuButton.style.display == "none" ? 0 : search_h ? search_h : 40;
    if (menu_h) {
        this.menuButton.style.top = cap_h + 5 + "px";
        this.menuButton.style.width = menu_h + "px";
        this.menuButton.style.height = menu_h + "px";
        this.menuButton.style.left = w - menu_h - 5 + "px"
    }
    this.menu.menu.style.top = cap_h + search_h + "px";
    var gr_mode = liteMode ? DSTB_0 : this.act.GetShellVar("GRAPHICS.mode");
    if (gr_mode == DSTB_PICK2 || gr_mode == DSTB_PICK3 || gr_mode == DSTB_PICK4) {
        this.distToolBar.style.display = "block";
        this.distToolBar.style.top = cap_h + search_h + "px";
        this.distToolBar.style.left = tools_w + "px"
    } else {
        this.distToolBar.style.display = "none"
    }
    this.searchInput.style.left = tools_w + tools_split_w + "px";
    this.searchInput.style.top = cap_h + "px";
    this.searchInput.style.width = w - tab_w - tools_w - (this.layoutMode == "ver" ? cap_h : 0) + "px";
    var canvas_h = hh;
    var canvas_w = w - tab_w - tools_w - tools_split_w;
    if (icongf) {
        this.canvas.style.left = tools_w + tools_split_w + "px";
        this.canvas.style.top = search_h + cap_h + "px";
        this.canvas.style.height = canvas_h + "px";
        this.canvas.style.width = canvas_w + "px"
    }
    this.seq_cont.style.left = tools_w + tools_split_w + "px";
    this.seq_cont.style.top = h - seq_h - tab_h - split_h + "px";
    this.seq_cont.style.width = w - tab_w - tools_w + "px";
    this.tab_splitter.style.top = h - tab_h - split_h + "px";
    this.tab_vsplitter.style.left = w - tab_w + "px";
    this.tab_vsplitter.style.top = cap_h + "px";
    this.tab_vsplitter.style.height = h - cap_h + "px";
    this.tab_vsplitter2.style.left = tools_w + "px";
    this.tab_vsplitter2.style.top = cap_h + "px";
    this.tab_vsplitter2.style.height = tools_h + "px";
    if (this.layoutMode == "ver") {
        this.tabsPanel.mainDiv.style.top = h - tab_h + "px";
        this.tabsPanel.mainDiv.style.left = 0 + "px";
        this.tabsPanel.mainDiv.style.height = tab_h + "px";
        this.tabsPanel.mainDiv.style.width = w + "px"
    } else {
        this.tabsPanel.mainDiv.style.top = search_h + cap_h + "px";
        this.tabsPanel.mainDiv.style.left = w - tab_w + "px";
        this.tabsPanel.mainDiv.style.width = tab_w + "px";
        this.tabsPanel.mainDiv.style.height = h - search_h - cap_h + "px"
    }
    if (toolsVisible) {
        this.toolsPanel.mainDiv.style.top = cap_h + "px";
        this.toolsPanel.mainDiv.style.left = "0px";
        this.toolsPanel.mainDiv.style.height = tools_h + "px";
        this.toolsPanel.mainDiv.style.width = tools_w + "px"
    }
    this.cent.style.left = tools_w + canvas_w / 2 - 16 + "px";
    this.cent.style.top = this.par.offsetHeight - tab_h - seq_h - 80 + "px";
    this.progress.style.left = this.par.offsetWidth / 2 - 16 + "px";
    this.progress.style.top = this.par.offsetHeight / 2 - 16 + "px";
    this.progress_info.style.left = this.par.offsetWidth / 2 - 64 + "px";
    this.progress_info.style.top = this.par.offsetHeight / 2 + 32 + "px";
    if (icongf) this.act.Resize(this.canvas.clientWidth, hh);
    this.tabsPanel.updateLayout();
    if (toolsVisible) this.toolsPanel.updateLayout();
    if (!liteMode) this.updateMenu();
    if (this.menu.isVisible()) this.menu.updateGeometry()
};
ActiveIcmJS.prototype.submitSearch = function (input) {
    var that = this;
    if (this.req != null) {
        this.req.abort()
    }
    if (input.length == 0) {
        that.searchPanel.style.display = "none";
        return
    }
    this.req = new XMLHttpRequest;
    this.req.onload = function () {
        var lines = this.responseText.split("\n");
        while (that.searchPanel.firstChild) that.searchPanel.removeChild(that.searchPanel.firstChild);
        that.searchPanel.style.top = that.searchInput.offsetHeight + "px";
        that.searchPanel.style.left = that.searchInput.offsetLeft + "px";
        that.searchPanel.style.width = that.searchInput.offsetWidth + "px";
        that.searchPanel.style["overflow-y"] = "scroll";
        that.searchPanel.style.display = "block";
        that.searchPanel.currentRow = 0;
        that.searchPanel.items = [];
        that.searchPanel.highlight_color = "rgb(135, 206, 255)";
        var pattern = new RegExp("\\b(" + input + ")", "ig");
        that.searchPanel.updateCurrentRow = function () {
            for (var i = 0; i < this.items.length; i++) {
                if (i == this.currentRow) {
                    this.items[i].style.backgroundColor = this.highlight_color;
                    this.items[i].scrollIntoView(false)
                } else this.items[i].style.backgroundColor = "white"
            }
        };
        that.searchPanel.down = function () {
            if (this.currentRow < this.items.length - 1) {
                this.currentRow++;
                this.updateCurrentRow()
            }
        };
        that.searchPanel.up = function () {
            if (this.currentRow > 0) {
                this.currentRow--;
                this.updateCurrentRow()
            }
        };
        that.searchPanel.loadCurrent = function () {
            if (this.currentRow >= 0 && this.currentRow < this.items.length) {
                that.searchPanel.style.display = "none";
                that.searchPanel.blur();
                if (this.items[this.currentRow].pdbcode.length == 4) that.projectFile = this.items[this.currentRow].pdbcode; else if (that.searchInput.value.length == 4) that.projectFile = that.searchInput.value
            }
        };
        for (var i = 1; i < lines.length; i++) {
            var p = document.createElement("li");
            that.searchPanel.items[that.searchPanel.items.length] = p;
            var row = lines[i].split("\t");
            p.row = i - 1;
            p.pdbcode = row[0];
            p.style.cssText = "text-align:left; font-size:17px; margin:5px;";
            var html = lines[i].replace(pattern, "<b>$1</b>");
            p.innerHTML = html;
            p.style.cursor = "pointer";
            that.searchPanel.appendChild(p);
            p.onmouseover = function (ev) {
                that.searchPanel.currentRow = this.row;
                that.searchPanel.updateCurrentRow()
            };
            p.onclick = function (ev) {
                that.searchPanel.loadCurrent()
            }
        }
        that.searchPanel.style.height = Math.ceil(Math.min(that.searchPanel.clientHeight, that.cont.clientHeight * .75)) + "px";
        that.searchPanel.updateCurrentRow()
    };
    this.req.open("GET", window.location.protocol + "//molsoft.com/cgi-bin/q3.cgi?maxHits=100&kwd=" + encodeURIComponent(input + "*") + "&where=pdb");
    this.req.send()
};
ActiveIcmJS.prototype.center = function () {
    this.act.RunCommandsLite("center static Nof(as_graph) == 0 ? : as_graph")
};
ActiveIcmJS.prototype.test = function () {
    var d = new ActiveIcmDialog(this, "Test");
    var tabs = new ActiveIcmTabView;
    var tab1 = document.createElement("div");
    tab1.innerHTML = "tab1";
    var tab2 = document.createElement("div");
    tab2.innerHTML = "tab2";
    tabs.addTabHtml("tab 1", tab1);
    tabs.addTabHtml("tab 2", tab2);
    d.addElement(tabs.mainDiv, "center");
    d.addButtons([{text: "Ok"}]);
    d.show()
};

ActiveIcmJS.prototype.icmjsLogin = function () {
    var that = this;
    if (!this.icmjsLoginDialog) this.icmjsLoginDialog = new ActiveIcmDialog(this, "IcmJS login"); else this.icmjsLoginDialog.clear();
    var dlg = this.icmjsLoginDialog;
    var user = dlg.addTextInput("user", "", false, "username");
    var pass = dlg.addTextInput("password", "", true, "current-password");
    dlg.addButtons([{
        text: "Ok", func: function () {
            that.act.authUserPassword(dlg.inputValue("user"), dlg.inputValue("password"))
        }
    }, {
        text: "Cancel", func: function () {
        }
    }]);
    dlg.show();
    user.focus();
    user.select()
};

ActiveIcmJS.prototype.askQuestion = function (caption, question, onyes) {
    var that = this;
    if (!this.confirmDialog) this.confirmDialog = new ActiveIcmDialog(this, caption); else this.confirmDialog.clear();
    this.confirmDialog.addText(question);
    this.confirmDialog.addButtons([{text: "Ok", func: onyes}, {text: "Cancel"}]);
    this.confirmDialog.setCaption(caption);
    this.confirmDialog.show()
};
ActiveIcmJS.prototype.promptString = function (caption, label, value, ondone) {
    var that = this;
    if (!this.promptStringDialog) this.promptStringDialog = new ActiveIcmDialog(this, caption); else this.promptStringDialog.clear();
    var txt = this.promptStringDialog.addTextInput(label, value);
    this.promptStringDialog.addButtons([{text: "Ok", func: ondone}, {text: "Cancel"}]);
    this.promptStringDialog.setCaption(caption);
    this.promptStringDialog.show();
    txt.select()
};
ActiveIcmJS.prototype.selectNeib = function () {
    var that = this;
    if (!this.selectNeibByDialog) {
        this.selectNeibByDialog = new ActiveIcmDialog(this, "Neighbors");
        this.selectNeibByDialog.addNumberInput("Radius", "5.0", "0.0", "50.0", "1.0");
        this.selectNeibByDialog.addLogicalInput("Whole Residues", "true");
        this.selectNeibByDialog.addButtons([{
            text: "Ok", func: function (dlg) {
                that.RunCommandsLite("selectNeighours Real(" + dlg["Radius"].value + ") " + (dlg["Whole Residues"].checked ? "yes" : "no"))
            }
        }, {text: "Cancel"}])
    }
    this.selectNeibByDialog.show(true)
};
ActiveIcmJS.prototype.colorBy = function () {
    var that = this;
    if (!this.colorByDialog) {
        this.colorByDialog = new ActiveIcmDialog(this, "Color By");
        this.colorByDialog.palette = ["#FF0000", "#FF6400", "#FF9600", "#FFFF00", "#64FF00", "#00FF00", "#32FFFF", "#0096FF", "#3200FF", "#C800FF", "#000000", "#323232", "#6E6E6E", "#C8C8C8", "#FFFFFF", "#FFC8C8", "#FFFF96", "#C8FFC8", "#C8FFFF", "#C3C3FF"];
        this.colorByDialog.selectedColor = 10;
        this.colorByDialog.cells = [];
        this.colorByDialog.repr = [];
        this.colorByDialog.currentRGBString = function () {
            var rgb = this.currentRGB();
            return "{" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "}"
        };
        this.colorByDialog.currentRGB = function () {
            return [parseInt(this.palette[this.selectedColor].substring(1, 3), 16), parseInt(this.palette[this.selectedColor].substring(3, 5), 16), parseInt(this.palette[this.selectedColor].substring(5, 7), 16)]
        };
        this.colorByDialog.reprString = function () {
            var str = "";
            for (var i = 0; i < this.repr.length; i++) if (this.repr[i].img.getAttribute("on") == "true") {
                if (str.length) str += ",";
                str += "'" + this.repr[i].what + "'"
            }
            if (!str.length) return "Sarray()";
            return "{" + str + "}"
        };
        this.colorByDialog.updateRepr = function () {
            var gfall = that.act.getDisplayMask;
            for (var i = 0; i < this.repr.length; i++) {
                var on = (gfall & this.repr[i].gf) != 0;
                this.repr[i].img.setAttribute("on", on);
                this.repr[i].style.display = on ? "table-cell" : "none"
            }
        };
        this.colorByDialog.updateCurrent = function () {
            for (var i = 0; i < this.cells.length; i++) this.cells[i].style.border = "4px solid #f1f1f1";
            this.cells[this.selectedColor].style.border = "4px solid black"
        };
        {
            var repr = document.createElement("table");
            repr.style.width = "100%";
            var row = document.createElement("tr");
            repr.appendChild(row);
            this.colorByDialog.reprRow = row;
            {
                var td = document.createElement("td");
                td.innerHTML = "Representations:";
                row.appendChild(td)
            }
            this.colorByDialog.addRepr = function (what, gf, img) {
                var td = document.createElement("td");
                row.appendChild(td);
                td.what = what;
                td.gf = gf;
                td.appendChild(img);
                td.style["text-align"] = "center";
                td.img = img;
                td.img.setAttribute("on", false);
                td.onclick = function () {
                    this.img.setAttribute("on", this.img.getAttribute("on") != "true")
                };
                this.repr[this.repr.length] = td;
                return td
            };
            this.colorByDialog.addRepr("wire", M_WIRE, Module.makeImage("pm_r_wire_new.png", "Toggle wire coloring", "icon"));
            this.colorByDialog.addRepr("cpk", M_BBALL, Module.makeImage("pm_r_cpk_new.png", "Toggle CPK  coloring", "icon"));
            this.colorByDialog.addRepr("xstick", M_SBALL, Module.makeImage("pm_r_stick_new.png", "Toggle ball&stick coloring", "icon"));
            this.colorByDialog.addRepr("ribbon", M_RIBBON, Module.makeImage("pm_r_ribbon_new.png", "Toggle ribbon coloring", "icon"));
            this.colorByDialog.addRepr("skin", M_GROB_SKIN, Module.makeImage("pm_skin.png", "Toggle skin coloring", "icon"));
            this.colorByDialog.addElement(repr, "center")
        }
        {
            var clr = document.createElement("table");
            var row;
            for (var i = 0; i < this.colorByDialog.palette.length; i++) {
                if (i % 4 == 0) {
                    row = document.createElement("tr");
                    clr.appendChild(row)
                }
                var td = document.createElement("td");
                row.appendChild(td);
                td.style.backgroundColor = this.colorByDialog.palette[i];
                td.style.width = "50px";
                td.style.height = "50px";
                td.color = i;
                td.onclick = function () {
                    that.colorByDialog.selectedColor = this.color;
                    that.colorByDialog.updateCurrent()
                };
                this.colorByDialog.cells[this.colorByDialog.cells.length] = td
            }
            this.colorByDialog.updateCurrent();
            this.colorByDialog.addElement(clr, "center")
        }
        this.colorByDialog.addButtons([{
            text: "Ok", func: function (dlg) {
                that.RunCommandsLite("colorBackgroundOrSelection " + dlg.currentRGBString() + " " + dlg.reprString())
            }
        }, {text: "Cancel"}])
    }
    var n_as_graph = this.act.nofAsGraph;
    this.colorByDialog.reprRow.style.display = n_as_graph == 0 ? "none" : "block";
    this.colorByDialog.setCaption(n_as_graph == 0 ? "Color Background" : "Color Representations");
    this.colorByDialog.updateRepr();
    this.colorByDialog.show()
};

function ActiveIcmMenu(act, parentMenu) {
    var that = this;
    this.act = act;
    this.parentMenu = parentMenu;
    this.menu = document.createElement("ul");
    this.menu.className = "pmenu";
    this.menu.style["z-index"] = "3";
    this.menu.style.position = "absolute";
    this.act.cont.appendChild(this.menu);
    this.menu.style.display = "none";
    this.items = [];
    this.userItems = [];
    this.act.menuTimeout = null;
    this.menuStyleMobile = false;
    if (parentMenu && this.menuStyleMobile) {
        var item = {title: "..", parentMenu: parentMenu};
        this.items[this.items.length] = item
    }
}

ActiveIcmMenu.prototype.addSeparator = function () {
    if (this.items.length) {
        this.items[this.items.length - 1].bottomSeparator = true
    }
};
ActiveIcmMenu.prototype.addCheckableItem = function (text, isOn, setOn, img) {
    var item = {title: text, submenu: null, checkable: true, isOn: isOn, setOn: setOn, par: this};
    if (img) item.img = img; else item.isCheckbox = true;
    this.items[this.items.length] = item;
    return item
};
ActiveIcmMenu.prototype.addItem = function (text, data, img) {
    var item = {title: text, img: img, submenu: null, data: data, par: this};
    this.items[this.items.length] = item;
    return item
};
ActiveIcmMenu.prototype.findMenuItem = function (text) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].title == text) return this.items[i]
    }
};
ActiveIcmMenu.prototype.hideMenuItem = function (text) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].title == text) {
            this.items[i].hidden = true;
            this.buildMenu();
            break
        }
    }
};
ActiveIcmMenu.prototype.addUserMenuItem = function (text, func, img) {
    this.userItems[this.userItems.length] = {text: text, func: func, img: img};
    this.buildUserItems()
};
ActiveIcmMenu.prototype.buildUserItems = function () {
    var menus_to_build = [];
    for (var i = 0; i < this.userItems.length; i++) {
        var t = this.userItems[i].text.split("/");
        var m = this.act.menu;
        for (var j = 0; j < t.length - 1; j++) {
            var submenu = m.findMenuItem(t[j]);
            if (!submenu) m = m.addMenu(t[j]); else m = submenu.submenu
        }
        m.addItem(t[t.length - 1], this.userItems[i].func, this.userItems[i].img);
        m.buildMenu()
    }
};
ActiveIcmMenu.prototype.addMenuItem = function (text, isFlat) {
    var item = {title: text, submenu: new ActiveIcmMenu(this.act, this), flat: isFlat};
    this.items[this.items.length] = item;
    return item
};
ActiveIcmMenu.prototype.addMenu = function (text, isFlat) {
    return this.addMenuItem(text, isFlat).submenu
};
ActiveIcmMenu.prototype.clear = function () {
    this.items = [];
    this.clearMenu()
};
ActiveIcmMenu.prototype.clearMenu = function () {
    while (this.menu.firstChild) this.menu.removeChild(this.menu.firstChild)
};
ActiveIcmMenu.prototype.buildMenu = function () {
    this.clearMenu();
    var that = this;
    var item;
    var hasImgColumn = false;
    for (var i = 0; i < this.items.length; i++) if (!this.items[i].submenu && this.items[i].img) {
        hasImgColumn = true;
        break
    }
    for (var i = 0; i < this.items.length; i++) {
        item = this.items[i];
        if (item.hidden) continue;
        var li = document.createElement("li");
        item.li = li;
        if (item.bottomSeparator) li.style["border-bottom"] = "1px solid #555";
        this.menu.appendChild(li);
        li.className = "pmenu";
        var t = document.createElement("table");
        t.style.width = "100%";
        li.appendChild(t);
        var tr = document.createElement("tr");
        t.appendChild(tr);
        if (hasImgColumn) {
            var td = document.createElement("td");
            tr.appendChild(td);
            td.className = "pmenu";
            if (item.img) {
                item.img.style.width = "24px";
                td.appendChild(item.img)
            } else {
                td.style.width = "24px"
            }
        }
        var td = document.createElement("td");
        td.style.width = "100%";
        tr.appendChild(td);
        td.className = "pmenu";
        li.td = td;
        li.item = item;
        if (!item.submenu || !item.flat) {
            td.innerHTML = item.title;
            td.item = item;
            td.li = li;
            li.highlight = true;
            if (typeof item.data == "string") {
                li.onclick = function () {
                    if (this.getAttribute("disabled") == "true") return;
                    that.act.RunCommands(this.item.data);
                    that.act.hideMenu()
                }
            } else if (typeof item.data == "function") {
                li.onclick = function () {
                    if (this.getAttribute("disabled") == "true") return;
                    this.item.data();
                    that.act.hideMenu()
                }
            }
            if (item.parentMenu) {
                li.onclick = function () {
                    that.act.replaceCurrentMenu(this.item.parentMenu, this)
                }
            }
            if (item.submenu && item.submenu.items.length) {
                var td = document.createElement("td");
                tr.appendChild(td);
                var img = Module.makeImage("submenu_arrow.png");
                td.appendChild(img);
                item.submenu.buildMenu();
                li.onclick = function () {
                    that.act.replaceCurrentMenu(this.item.submenu, this)
                }
            }
            if (item.img) {
                var td = document.createElement("td");
                tr.appendChild(td);
                td.appendChild(item.img);
                item.img.style.cursor = "pointer"
            }
            if (item.img2) {
                var td = document.createElement("td");
                tr.appendChild(td);
                td.appendChild(item.img2);
                item.img2.style.cursor = "pointer"
            }
            if (item.checkable) {
                var td = document.createElement("td");
                tr.appendChild(td);
                var img = Module.makeImage("pm_check.png");
                td.appendChild(img);
                img.item = item;
                img.style.display = item.isOn() ? "block" : "none";
                li.onclick = function () {
                    this.item.setOn(!this.item.isOn())
                }
            }
        } else {
            td.className = "pmenu pmenu_complex";
            td.innerHTML = item.title;
            if (typeof item.data == "function") {
                li.highlight = true;
                li.onclick = function () {
                    if (this.getAttribute("disabled") == "true") return;
                    this.item.data();
                    that.act.hideMenu()
                }
            }
            for (var j = 0; j < item.submenu.items.length; j++) {
                var td = document.createElement("td");
                tr.appendChild(td);
                var it = item.submenu.items[j];
                var img = it.img;
                var gf = it.data;
                td.item = it;
                if (img) {
                    img.gf = gf;
                    img.setAttribute("on", false);
                    img.item = it;
                    img.chain = item.submenu.chain;
                    img.style.cursor = "pointer";
                    if (typeof img.gf == "number") {
                        img.onclick = function () {
                            if (this.getAttribute("disabled") == "true") return;
                            var cmd = "toggleDisplay a_NONE. '" + this.item.title + "' " + (this.getAttribute("on") == "true" ? "no" : "yes");
                            that.act.RunCommandsLite(cmd)
                        }
                    } else if (typeof img.gf == "string") {
                        img.onclick = function () {
                            if (this.getAttribute("disabled") == "true") return;
                            that.act.hideMenu();
                            that.act.RunCommandsLite(this.gf)
                        }
                    } else if (typeof img.gf == "function") {
                        img.onclick = function () {
                            if (this.getAttribute("disabled") == "true") return;
                            if (this.gf(this.item)) that.act.hideMenu()
                        }
                    }
                    if (it.checkable) {
                        td.onclick = function () {
                            if (this.getAttribute("disabled") == "true") return;
                            this.item.setOn(!this.item.isOn());
                            that.act.hideMenu()
                        }
                    }
                    td.appendChild(img)
                }
            }
        }
        li.onmouseover = function () {
            if (this.highlight) {
                this.style.backgroundColor = "#555";
                this.td.style.color = "white"
            }
            if (!that.menuStyleMobile) {
                var it = this.item;
                var row = this;
                if (that.act.menuTimeout) clearTimeout(that.act.menuTimeout);
                that.act.menuTimeout = null;
                that.hideSubmenus(it.submenu);
                if (it.submenu && it.submenu.items.length && !it.submenu.isVisible() && !it.flat) {
                    that.act.menuTimeout = setTimeout(function () {
                        that.act.replaceCurrentMenu(it.submenu, row, true)
                    }, 200)
                }
            }
        };
        li.onmouseleave = li.onmouseout = function () {
            if (this.highlight) {
                this.style.backgroundColor = that.menu.style.backgroundColor;
                this.td.style.color = "black"
            }
        }
    }
};
ActiveIcmMenu.prototype.updateGeometry = function (elem) {
    var w = Math.min(this.act.cont.clientWidth, 250);
    if (this.menuStyleMobile || !this.parentMenu) {
        var cap_h = this.act.caption.style.display == "none" ? 0 : this.act.caption.clientHeight;
        this.menu.style.top = this.act.menuButton.clientHeight + cap_h + "px";
        this.menu.style.width = w + "px";
        this.menu.style.left = this.act.cont.clientWidth - w + "px"
    } else {
        this.menu.style.top = this.parentMenu.menu.offsetTop + elem.offsetTop + "px";
        this.menu.style.left = this.parentMenu.menu.offsetLeft - this.parentMenu.menu.clientWidth + "px";
        this.menu.style.width = this.parentMenu.menu.clientWidth + "px"
    }
};
ActiveIcmJS.prototype.hideMenu = function () {
    this.menu.hide(true);
    this.popupMenu.hide(true)
};
ActiveIcmMenu.prototype.toggle = function () {
    this.updateGeometry();
    if (this.isVisible()) this.hide(true); else this.show()
};
ActiveIcmMenu.prototype.isVisible = function () {
    return this.menu.style.display != "none"
};
ActiveIcmMenu.prototype.hideSubmenus = function (exclude) {
    for (var i = 0; i < this.items.length; i++) if (this.items[i].submenu && this.items[i].submenu != exclude) this.items[i].submenu.hide(true)
};
ActiveIcmMenu.prototype.hide = function (recursive) {
    this.menu.style.display = "none";
    if (recursive) this.hideSubmenus()
};
ActiveIcmMenu.prototype.show = function () {
    this.menu.style.display = "block";
    this.menu.focus()
};
ActiveIcmJS.prototype.replaceCurrentMenu = function (menu, elem, fromTimeout) {
    if (!menu.menuStyleMobile) {
        if (!menu.isVisible()) {
            menu.updateGeometry(elem);
            menu.show()
        } else {
            if (!fromTimeout && !this.menuTimeout) menu.hide(true)
        }
    } else {
        if (menu != this.menu) {
            this.menu.hide();
            this.menu = menu;
            this.menu.updateGeometry();
            this.menu.show()
        }
    }
};
ActiveIcmMenu.prototype.updateMenu = function (gfall, n_as_graph, disable) {
    function setRemoveAttr(elem, attr, on) {
        if (on) elem.setAttribute(attr, true); else elem.removeAttribute(attr)
    }

    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        var item_disabled = disable;
        if (item.img && typeof item.img.gf == "number") {
            if (item.img.chain) {
            } else {
                item.img.setAttribute("on", (item.img.gf & gfall) != 0);
                setRemoveAttr(item.img, "disabled", item_disabled)
            }
        }
        if (item.requiresSelection || item_disabled) {
            if (item.img) setRemoveAttr(item.img, "disabled", item_disabled); else if (item.li) {
                item_disabled = item_disabled || n_as_graph == 0;
                setRemoveAttr(item.li, "disabled", item_disabled)
            }
        }
        if (item.img && item.checkable) {
            if (item.isCheckbox) item.img.style.display = item.img.item.isOn() ? "block" : "none"; else item.img.style.border = "2px solid " + (item.img.item.isOn() ? "black" : "grey")
        }
        if (item.submenu) {
            item.submenu.updateMenu(gfall, n_as_graph, item_disabled)
        }
    }
};
ActiveIcmJS.prototype.rebuildMenu = function () {
    this.buildMenu();
    this.updateMenu()
};
ActiveIcmJS.prototype.updateMenu = function () {
    var gfall = this.act.getDisplayMask;
    this.buildSlidesMenu();
    this.buildChainsInfoMenu();
    this.menu.buildMenu();
    this.menu.updateMenu(gfall, this.act.nofAsGraph, false)
};
ActiveIcmJS.prototype.buildChainsInfoMenu = function () {
    if (!this.chains_menu) return;
    var that = this;
    var obli = this.act.objects;
    var objinfo = this.act.currentObjectInfo;
    var chains = objinfo.chains;
    Module.reorderChains(chains);
    this.chains_menu.items.length = 0;
    var numChains = Module.numberOfChains(chains);
    var cuob;
    for (var i = 0; i < obli.length; i++) if (obli[i].name == objinfo.name) cuob = obli[i];
    var obname = "<b>" + objinfo.name + "</b> <i>(" + chains.length + " chains)</i>";
    var ob_menu_item = this.chains_menu.addMenuItem(obname);
    {
        ob_menu_item.img = Module.makeDisplayedPixmap(cuob ? cuob.gf : 0, "#162252");
        ob_menu_item.img.gf = cuob ? cuob.gf : 0;
        ob_menu_item.img.obst = cuob ? cuob.obst : "";
        ob_menu_item.img.onclick = function () {
            if (this.gf) that.act.RunCommandsLite("undisplay store " + this.obst); else that.act.RunCommandsLite("cool " + this.obst)
        }
    }
    {
        ob_menu_item.img2 = Module.makeSelectedPixmap(cuob ? cuob.sel : 0);
        ob_menu_item.img2.sel = cuob ? cuob.sel : 0;
        ob_menu_item.img2.obst = cuob ? cuob.obst : "";
        ob_menu_item.img2.onclick = function () {
            if (this.sel) that.act.RunCommandsLite("as_graph = as_graph & ! Atom(" + this.obst + ")"); else that.act.RunCommandsLite("as_graph = as_graph | Atom(" + this.obst + ")")
        }
    }
    var ob_menu = ob_menu_item.submenu;
    if (obli.length > 1) {
        for (var i = 0; i < obli.length; i++) {
            ob_menu.addCheckableItem(obli[i].name, function () {
                return this.title == objinfo.name
            }, function (on) {
                if (on) that.act.RunCommands("delete field name='_WASDISPAYED_' a_*.*");
                that.act.RunCommands("set object a_" + this.title + ".");
                this.par.hide()
            })
        }
    }
    this.chains_menu.addSeparator();
    for (var i = 0; i < chains.length; i++) {
        var chain = chains[i];
        var chain_info = SequenceView.RESO[chain.type];
        var chain_info2 = "";
        if (chain.reli) chain_info2 += chain.reli.length + " res";
        var name;
        if (this.studentMode && numChains == 1) name = "<b>" + chain_info + "</b>" + (chain_info2.length ? "<i>(" + chain_info2 + ")</i>" : ""); else name = "<b>" + chain.name + "</b> <i>(" + chain_info + "," + chain_info2 + ")</i>";
        var m = this.chains_menu.addMenu(name, true);
        m.chain = chain;
        if (!false) {
            m.addItem("display", function (item) {
                var chain = item.par.chain;
                if (chain.gf) that.act.RunCommandsLite("undisplay store " + chain.mlst); else that.act.RunCommandsLite("cool " + chain.mlst)
            }, Module.makeDisplayedPixmap(chain.gf != 0, chain.kr))
        }
        m.addItem("select", function (item) {
            var chain = item.par.chain;
            if (chain.sel) that.act.RunCommandsLite("as_graph = as_graph & ! Atom(" + chain.mlst + ")"); else that.act.RunCommandsLite("as_graph = as_graph | Atom(" + chain.mlst + ")")
        }, Module.makeSelectedPixmap(chain.sel))
    }
};
ActiveIcmJS.prototype.buildSlidesMenu = function () {
    var that = this;
    this.slides_menu.items.length = this.slides_menu.menuStyleMobile ? 1 : 0;
    if (!this.studentMode) {
        this.slides_menu.addItem("Store Current View...", function () {
            that.promptString("Save slide", "Name", "Slide", function (dlg) {
                that.RunCommands('add slide display="-layout" name="' + dlg.inputValue("Name") + '"')
            })
        });
        this.slides_menu.addSeparator()
    }
    var slides = this.act.slides;
    var cur = this.act.currentSlide;
    for (var i = 0; i < slides.length; i++) {
        var it = this.slides_menu.addMenuItem(i == cur ? "<b>" + slides[i] + "</b>" : slides[i], true);
        if (!this.studentMode) {
            var jt = it.submenu.addItem("delete", function () {
                var slidenum = this.slide_number;
                that.askQuestion("Warning", "Are you sure you want to delete slide '" + this.slide_name + "'", function (dlg) {
                    that.RunCommands("delete slideshow[" + slidenum + "]")
                })
            }, Module.makeImage("pm_delete.png", "Delete slide", "icon"));
            jt.img.slide_number = i + 1;
            jt.img.slide_name = slides[i];
            jt = it.submenu.addItem("rename", function () {
                var slidenum = this.slide_number;
                that.promptString("Rename Slide", "Name", this.slide_name, function (dlg) {
                    that.RunCommands("rename slide slideshow.slides " + slidenum + ' "' + dlg.inputValue("Name") + '"')
                })
            }, Module.makeImage("pm_pen.png", "Rename slide", "icon"));
            jt.img.slide_number = i + 1;
            jt.img.slide_name = slides[i]
        }
        it.slide_number = i + 1;
        it.data = function () {
            that.RunCommands("delete field name='_WASDISPAYED_' a_*.*");
            that.RunCommands("display slide=slideshow.slides smooth=1000 index=" + this.slide_number)
        }
    }
};

function updateSigninStatus(isSignedIn) {
    for (var i = 0; i < Module.gapi_queue.length; i++) {
        Module.gapi_queue[i].act.googleAuthorize(Module.gapi_queue[i].func)
    }
    if (isSignedIn) Module.gapi_queue = [];
    Module.act.rebuildMenu();
    Module.act.updateCaption()
}

function handleGapiClientLoad() {
    gapi.load("client:auth2", function () {
        gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            scope: scopes
        }).then(function () {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
        }, function (error) {
            alert(error.detials);
        })
    })
}

ActiveIcmJS.prototype.googleAuthorize = function (onsuccess) {
    var that = this;
    if (typeof gapi == "undefined") {
        Module.act = that;
        Module.loadScript("https://apis.google.com/js/api.js?onload=handleGapiClientLoad");
        Module.gapi_queue[Module.gapi_queue.length] = {act: this, func: onsuccess};
        return
    }
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        onsuccess();
        return
    }
    if (!Module.gapi_queue.length) Module.gapi_queue[Module.gapi_queue.length] = {act: this, func: onsuccess};
    var authButton = new ActiveIcmDialog(that, "Authorization");
    authButton.addText('<p></p><center><p><h3>Google Authorization</h3></p><p style="font-size:smaller;">Click on the button below to proceed with Google authorization.</p></center>');
    authButton.addButtons([{
        text: "Authorize...", func: function () {
            gapi.auth2.getAuthInstance().signIn()
        }
    }]);
    authButton.show()
};
ActiveIcmJS.prototype.generateMultipartRequestBody = function (metadata, callback) {
    var boundary = "-------314159265358979323846";
    var delimiter = "\r\n--" + boundary + "\r\n";
    var close_delim = "\r\n--" + boundary + "--";
    this.act.RunCommandsLite('write binary all "session.icb" delete');
    var fileName = "session.icb";
    var buf = FS.readFile("session.icb");
    var arrbuf = buf.buffer;
    var fileData = new Blob([arrbuf], {type: "application/octet-stream", fileName: fileName});
    var reader = new FileReader;
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
        var contentType = fileData.type || "application/octet-stream";
        var base64Data = btoa(reader.result);
        var multipartRequestBody = delimiter + "Content-Type: application/json\r\n\r\n" + JSON.stringify(metadata) + delimiter + "Content-Type: " + contentType + "\r\n" + "Content-Transfer-Encoding: base64\r\n" + "\r\n" + base64Data + close_delim;
        callback(boundary, multipartRequestBody)
    }
};
ActiveIcmJS.prototype.projectFilename = function () {
    var filename = this.currentProjectInfo.file && this.currentProjectInfo.file.name ? this.currentProjectInfo.file.name : this.act.currentObjectInfo.name + ".icb";
    if (!filename) filename = "session.icb";
    return filename
};
ActiveIcmJS.prototype.saveGoogleDriveDialog = function (saveAs) {
    var that = this;
    var fileid = null;
    if (!saveAs && this.currentProjectInfo.type == "googledrive" && this.canSaveCurrentFileToDriveDrive()) {
        fileid = this.currentProjectInfo.file.id
    }
    var metadata = {mimeType: "application/x-molsoft-icb"};
    var saveFile = function () {
        that.generateMultipartRequestBody(metadata, function (boundary, multipartRequestBody) {
            var request = gapi.client.request({
                path: "/upload/drive/v3/files" + (fileid ? "/" + fileid : ""),
                method: fileid ? "PATCH" : "POST",
                params: {uploadType: "multipart"},
                headers: {"Content-Type": 'multipart/mixed; boundary="' + boundary + '"'},
                body: multipartRequestBody
            });
            request.execute(function (file) {
                that.setCurrentProjectInfo({id: file.id, type: "googledrive", file: file});
                Module.print("saved to drive " + file.name + " " + file.id);
                if (that.ligeditTools) that.ligeditTools.refreshEnableState()
            })
        })
    };
    if (!fileid) {
        var filename = this.projectFilename();
        this.promptString("Save to drive", "Filename", filename, function (dlg) {
            metadata.name = dlg.inputValue("Filename");
            that.googleAuthorize(saveFile)
        })
    } else {
        this.googleAuthorize(saveFile)
    }
};
ActiveIcmJS.prototype.openByProjectInfo = function (projInfo) {
    var that = this;
    if (!projInfo.type || !projInfo.id) return false;
    if (projInfo.type == "url") {
        this.projectFile = projInfo.id
    } else if (projInfo.type == "buffer") {
        this.OpenProjectFromBinary(projInfo.file, projInfo.id)
    } else if (projInfo.type == "googledrive") {
        this.googleAuthorize(function () {
            gapi.client.drive.files.get({fileId: projInfo.id}).then(function (success) {
                that.openFileFromGoogleDrive(success.result)
            }, function (fail) {
                that.message("Error", fail.result.error.message)
            })
        })
    } else return false;
    return true
};
Module.parse_query_string = function (query) {
    var q = {};
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        var key = decodeURIComponent(pair[0]);
        var val = pair.length > 1 ? decodeURIComponent(pair[1]) : true;
        q[key] = val
    }
    return q
};
ActiveIcmJS.prototype.openLastOrDefault = function (def) {
    var that = this;
    var q = Module.parse_query_string(window.location.search.substring(1));
    var lastProject = null;
    if (q["ids"]) lastProject = {
        type: "googledrive",
        id: q["ids"],
        source: "url"
    }; else if (docCookies.getItem(this.lastProjectCookieKey).length) lastProject = JSON.parse(docCookies.getItem(this.lastProjectCookieKey));
    Module.print("lastProject=", lastProject);
    if (!this.cookiesEnabled || !lastProject) this.projectFile = def; else {
        if (!this.openByProjectInfo(lastProject)) {
            this.projectFile = def
        }
    }
};
ActiveIcmJS.prototype.reopenProject = function () {
    this.openByProjectInfo(this.currentProjectInfo)
};
ActiveIcmJS.prototype.canReopenProject = function () {
    return this.currentProjectInfo.type == "url" || this.currentProjectInfo.type == "buffer" || this.currentProjectInfo.type == "googledrive"
};
ActiveIcmJS.prototype.canSaveCurrentFileToDriveDrive = function () {
    if (this.currentProjectInfo.type != "googledrive") return false;
    if (typeof this.currentProjectInfo.file.permissions == "undefined") return false;
    var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    var p = this.currentProjectInfo.file.permissions;
    for (var i = 0; i < p.length; i++) {
        if (p[i].role == "writer" || p[i].role == "owner") {
            if (p[i].type == "user" || p[i].type == "group") {
                if (p[i].emailAddress == profile.getEmail()) return true
            } else if (p[i].type == "domain") {
            } else if (p[i].type == "anyone") {
                return true
            }
        }
    }
    return false
};
ActiveIcmJS.prototype.setCurrentProjectInfo = function (info) {
    var that = this;
    this.currentProjectInfo = info;
    var info2 = null;
    if (info.type == "googledrive") {
        info2 = {type: info.type, id: info.file.id, source: info.source};
        gapi.client.drive.files.get({fileId: info.file.id, fields: "permissions"}).then(function (success) {
            info.file.permissions = success.result.permissions;
            that.updateCaption();
            // that.buildSaveMenu()
        }, function (fail) {
        })
    } else if (info.type == "url") {
        info2 = {type: info.type, id: info.id}
    }
    if (this.cookiesEnabled) {
        if (info2 && info2.source != "url") {
            docCookies.setItem(this.lastProjectCookieKey, JSON.stringify(info2), Infinity)
        }
    }
    this.updateCaption();
    // this.buildSaveMenu()
};
ActiveIcmJS.prototype.openCustomFileDialog = function (listFiles, loadFile) {
    var that = this;

    function addRow() {
        var tr = document.createElement("tr");
        tr.className = "googledrive";
        that.customFileDialog.fileList.appendChild(tr);
        return tr
    }

    function addCell(tag, row, value, imgSrc, width) {
        var th = document.createElement(tag);
        th.className = "googledrive";
        row.appendChild(th);
        if (imgSrc) {
            var img = document.createElement("img");
            img.src = imgSrc;
            img.style.padding = "5px";
            th.appendChild(img)
        }
        if (value && value.length) th.appendChild(document.createTextNode(value));
        if (width) th.style.width = width;
        return th
    }

    function selectRow(tr) {
        for (var i = 0; i < that.customFileDialog.files.length; i++) {
            that.customFileDialog.files[i].tr.removeAttribute("selected")
        }
        tr.setAttribute("selected", true);
        that.customFileDialog.selectedIndex = tr.index
    }

    function loadCurrect(dlg) {
        var dlg = that.customFileDialog;
        if (dlg.selectedIndex != -1) {
            if (loadFile) loadFile(dlg.files[dlg.selectedIndex]); else that.projectFile = dlg.files[dlg.selectedIndex].url
        }
    }

    if (!that.customFileDialog) {
        that.customFileDialog = new ActiveIcmDialog(that, "Open File");
        var fileListCont = document.createElement("div");
        fileListCont.className = "filelistcont";
        that.customFileDialog.filecont = fileListCont;
        var fileList = document.createElement("table");
        fileList.className = "googledrive";
        fileListCont.appendChild(fileList);
        var img = that.customFileDialog.loader = Module.makeImage("ajax-loader.gif");
        fileListCont.appendChild(img);
        img.style.display = "none";
        img.style.position = "absolute";
        fileListCont.style.width = Math.min(that.par.clientWidth, 800) + "px";
        fileListCont.style.height = Math.min(that.par.clientHeight, 400) + "px";
        that.customFileDialog.addElement(fileListCont, "center");
        that.customFileDialog.fileList = fileList;
        that.customFileDialog.addButtons([{
            text: "Ok", func: function (dlg) {
                loadCurrect()
            }
        }, {text: "Cancel"}])
    }
    Module.clearChildren(that.customFileDialog.fileList);
    that.customFileDialog.files = [];
    that.customFileDialog.selectedIndex = -1;
    var tr = addRow();
    addCell("th", tr, "Name");
    addCell("th", tr, "Description");
    var items = listFiles();
    for (var i = 0; i < items.length; i++) {
        var tr = addRow();
        var fileInfo = document.createElement("li");
        addCell("td", tr, items[i].name, null, "30%");
        addCell("td", tr, items[i].descr, null, "70%");
        tr.index = i;
        tr.onclick = function () {
            selectRow(this)
        };
        tr.ondblclick = function () {
            selectRow(this);
            loadCurrect();
            that.customFileDialog.hide()
        };
        that.customFileDialog.files[that.customFileDialog.files.length] = items[i];
        items[i].tr = tr
    }
    if (that.customFileDialog.files.length) selectRow(that.customFileDialog.files[0].tr);
    that.customFileDialog.loader.style.display = "none";
    that.customFileDialog.show()
};
ActiveIcmJS.prototype.ShowProgressWheel = function (on, info) {
    var ww = this.par.clientWidth;
    var hh = this.par.clientHeight;
    this.modal_bg.style.width = ww + "px";
    this.modal_bg.style.height = hh + "px";
    this.modal_bg.style.display = on ? "block" : "none";
    this.progress.style.display = on ? "block" : "none";
    this.progress_info.style.display = on ? "block" : "none";
    this.progress_info.innerHTML = info ? info : "";
    var ofs = 0;
    if (info) ofs = info.length * 4.5;
    this.progress_info.style.left = this.par.offsetWidth / 2 - ofs + "px"
};
ActiveIcmJS.prototype.openFileFromGoogleDrive = function (file, deleteAll) {
    var that = this;
    this.ShowProgressWheel(true, "Loading file");
    var that = this;
    var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    var xhr = new XMLHttpRequest;
    xhr.open("GET", "https://www.googleapis.com/drive/v3/files/" + file.id + "?alt=media");
    xhr.responseType = "arraybuffer";
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
    xhr.onload = function () {
        if (deleteAll) that.act.RunCommands("delete all");
        that.act.OpenProjectFromBinary(this.response);
        if (!file.name.endsWith(".icb")) that.act.RunCommands("cool a_");
        that.ShowProgressWheel(false);
        that.setCurrentProjectInfo({id: file.id, type: "googledrive", file: file});
        that.rebuildMenu()
    };
    xhr.onerror = function (e) {
        Module.printErr("error downloading " + file.id, xhr);
        that.message("Error Downloading " + file.id, "");
        that.ShowProgressWheel(false)
    };
    xhr.send()
};
ActiveIcmJS.prototype.openGoogleDriveDialog = function () {
    var that = this;
    var molOnly = "Show Molecular Files Only";
    var deleteAll = "Delete existing objects";
    var listFiles = function () {
        that.googleDriveDialog.loader.style.left = that.googleDriveDialog.filecont.clientWidth / 2 + "px";
        that.googleDriveDialog.loader.style.top = that.googleDriveDialog.filecont.clientHeight / 2 + "px";
        that.googleDriveDialog.loader.style.display = "block";
        var qry = {
            pageSize: 1e3,
            orderBy: "modifiedByMeTime",
            supportsAllDrives: true,
            fields: "nextPageToken, files(id,name,iconLink,owners,modifiedTime,permissions)"
        };
        if (that.googleDriveDialog[molOnly].checked) qry.q = "name contains '.icb'";
        gapi.client.drive.files.list(qry).then(function (response) {
            var files = response.result.files;
            Module.print("listFiles request done item = " + files.length);
            Module.clearChildren(that.googleDriveDialog.fileList);
            that.googleDriveDialog.files = [];
            that.googleDriveDialog.selectedIndex = -1;

            function addRow() {
                var tr = document.createElement("tr");
                tr.className = "googledrive";
                that.googleDriveDialog.fileList.appendChild(tr);
                return tr
            }

            function addCell(tag, row, value, imgSrc, width) {
                var th = document.createElement(tag);
                th.className = "googledrive";
                row.appendChild(th);
                if (imgSrc) {
                    var img = document.createElement("img");
                    img.src = imgSrc;
                    img.style.padding = "5px";
                    th.appendChild(img)
                }
                if (value.length) th.appendChild(document.createTextNode(value));
                if (width) th.style.width = width;
                return th
            }

            function selectRow(tr) {
                for (var i = 0; i < that.googleDriveDialog.files.length; i++) {
                    that.googleDriveDialog.files[i].tr.removeAttribute("selected")
                }
                tr.setAttribute("selected", true);
                that.googleDriveDialog.selectedIndex = tr.index
            }

            var tr = addRow();
            addCell("th", tr, "");
            addCell("th", tr, "Name");
            addCell("th", tr, "Owner");
            addCell("th", tr, "Last Modified");
            for (var i = 0; i < files.length; i++) {
                var tr = addRow();
                var fileInfo = document.createElement("li");
                addCell("td", tr, "", files[i].iconLink);
                addCell("td", tr, files[i].name, null, "80%");
                addCell("td", tr, files[i].owners[0].displayName);
                addCell("td", tr, files[i].modifiedTime);
                tr.index = i;
                tr.onclick = function () {
                    selectRow(this)
                };
                that.googleDriveDialog.files[that.googleDriveDialog.files.length] = files[i];
                files[i].tr = tr
            }
            if (that.googleDriveDialog.files.length) selectRow(that.googleDriveDialog.files[0].tr);
            that.googleDriveDialog.loader.style.display = "none"
        })
    };
    if (!that.googleDriveDialog) {
        that.googleDriveDialog = new ActiveIcmDialog(that, "Open File");
        var fileListCont = document.createElement("div");
        fileListCont.className = "filelistcont";
        that.googleDriveDialog.filecont = fileListCont;
        var fileList = document.createElement("table");
        fileList.className = "googledrive";
        fileListCont.appendChild(fileList);
        var img = that.googleDriveDialog.loader = Module.makeImage("ajax-loader.gif");
        fileListCont.appendChild(img);
        img.style.display = "none";
        img.style.position = "absolute";
        fileListCont.style.width = Math.min(that.par.clientWidth, 800) + "px";
        fileListCont.style.height = Math.min(that.par.clientHeight, 400) + "px";
        that.googleDriveDialog.addElement(fileListCont, "center");
        that.googleDriveDialog.fileList = fileList;
        that.googleDriveDialog.addLogicalInput(molOnly, "true").onclick = listFiles;
        that.googleDriveDialog.addLogicalInput(deleteAll, "true");
        that.googleDriveDialog.addButtons([{
            text: "Ok", func: function (dlg) {
                that.openFileFromGoogleDrive(dlg.files[dlg.selectedIndex], dlg[molOnly].checked)
            }
        }, {text: "Cancel"}])
    }
    this.googleAuthorize(listFiles);
    that.googleDriveDialog.show()
};
ActiveIcmJS.prototype.clearProject = function () {
    this.setCurrentProjectInfo({});
    this.act.RunCommands("delete all")
};
// ActiveIcmJS.prototype.buildSaveMenu = function () {
//     var that = this;
//     var m = this.saveMenu;
//     m.clear();
//     m.addItem("Local...", function () {
//         that.saveProject(null, null)
//     }, Module.makeImage("download_file.png"));
//     m.addItem("Google Drive As...", function () {
//         that.saveGoogleDriveDialog(true)
//     }, Module.makeImage("logo-drive.png"));
//     if (this.canSaveCurrentFileToDriveDrive()) m.addItem("Google Drive " + this.currentProjectInfo.file.name, function () {
//         that.saveGoogleDriveDialog(false)
//     }, Module.makeImage("logo-drive.png"));
//     this.saveMenu.buildMenu()
// };
ActiveIcmJS.prototype.buildMenu = function () {
    var m, m2;
    var that = this;
    this.menu.clear();
    var icongf = this.gfVisible;
    this.chains_menu = null;

    if (icongf) {
        this.chains_menu = this.menu.addMenu(false ? "Select Chains" : "Display/Select Chains");
        this.menu.addSeparator();
        m = this.menu.addMenu("Display", true);
        m.addItem("wire", M_WIRE, Module.makeImage("pm_r_wire_new.png", "Toggle wire for selection", "icon"));
        m.addItem("cpk", M_BBALL, Module.makeImage("pm_r_cpk_new.png", "Toggle CPK for selection", "icon"));
        m.addItem("xstick", M_SBALL, Module.makeImage("pm_r_stick_new.png", "Toggle Ball&Stick for selection", "icon"));
        m.addItem("ribbon", M_RIBBON, Module.makeImage("pm_r_ribbon_new.png", "Toggle Ribbon for selection", "icon"));
        m.addItem("skin", M_GROB_SKIN, Module.makeImage("pm_skin.png", "Toggle Skin for selection", "icon"));
        m = this.menu.addMenu("Labels", true);
        m.addItem("atom label", M_ATLABEL, Module.makeImage("pm_atomlabel.png", "Toggle Atom Labels for selection", "icon"));
        m.addItem("residue label", M_RELABEL, Module.makeImage("pm_reslabel.png", "Toggle Residue Labels for selection", "icon"));
        m.addItem("site", M_SITE, Module.makeImage("pm_sitelabel.png", "Toggle Sites for selection", "icon"));
        m.addItem("hbond", M_HB, Module.makeImage("pm_hbond.png", "Toggle hydrogen bonds for selection", "icon"));
        m = this.menu.addMenu("Misc", true);
        m.addItem("unsel", "as_graph = ! a_*.*//", Module.makeImage("pm_unsel.png", "Clear Selection", "icon")).requiresSelection = true;
        m.addItem("neib", function () {
            that.selectNeib();
            return true
        }, Module.makeImage("pm_neighbours.png", "Select Neighbors From Selection", "icon")).requiresSelection = true;
        if (!Module.iOS) {
            m.addItem("fullscreen", function () {
                that.hideMenu();
                Module.toggleFullscreen(that, that.par)
            }, Module.makeImage("pm_full_screen2.png", "Toggle Fullscreen", "icon"))
        }
        m.addItem("mkimg", function () {
            that.saveImage();
            return true
        }, Module.makeImage("pm_camera.png", "Capture Image", "icon"));
        m.addCheckableItem("fog", function () {
            return that.act.fog
        }, function (on) {
            that.act.fog = on;
            that.updateMenu();
            return true
        }, Module.makeImage("pm_fog.png", "Toggle Fog", "icon"));
        m.addSeparator();
        m = this.menu.addMenu("Measure", true);
        m.addItem("distance", "GRAPHICS.mode='Pick2'", Module.makeImage("pm_dist_measure.png", "Measure Distance", "icon"));
        m.addItem("angle", "GRAPHICS.mode='Pick3'", Module.makeImage("pm_angle_measure.png", "Measure Planar Angle", "icon"));
        m.addItem("torsion", "GRAPHICS.mode='Pick4'", Module.makeImage("pm_tors_measure.png", "Measure Torsion Angle", "icon"));
        m.addItem("delete", "delete distpairs angle_list torsion_list", Module.makeImage("pm_cancel.png", "Delete all Measurements", "icon"));
        this.menu.addSeparator();
        var item = this.menu.addMenuItem("Color by");
        m = item.submenu;
        m.addItem("Atom Type", "colorBy 'atom'");
        m.addItem("Atom Type (Hetero)", "colorBy 'atomhet'");
        m.addItem("Chain", "colorBy 'chain'");
        m.addItem("NtoC", "colorBy 'NtoC'");
        m.addItem("Secondary structure", "colorBy 'sstruct'");
        m.addItem("Bfactor", "colorBy 'bfactor'");
        m.addItem("Alignment", "colorBy 'alignment'");
        m.addSeparator();
        m.addItem("Custom...", function () {
            that.colorBy();
            return true
        }).requiresSelection = true;
        m.addSeparator();
        m.addItem("Background...", function () {
            that.colorBy();
            return true
        });
        this.buildChainsInfoMenu();
        this.menu.addSeparator();
        this.slides_menu = this.menu.addMenu("Slides");
        this.buildSlidesMenu();
        this.menu.addSeparator()
    }
    // m = this.menu.addMenu("Open");
    // m.addItem("Local...", function () {
    //     that.hidden_fileSelector.onchange = function () {
    //         that.progress.style.display = "block";
    //         var file = that.hidden_fileSelector.files[0];
    //         var reader = new FileReader;
    //         reader.onloadend = function () {
    //             that.setCurrentProjectInfo({id: file.downloadUrl, type: "local", file: file});
    //             if (that.studentMode) that.act.RunCommands("delete all");
    //             that.act.OpenProjectFromBinary(reader.result);
    //             that.progress.style.display = "none"
    //         };
    //         reader.readAsArrayBuffer(file)
    //     };
    //     that.hidden_fileSelector.click()
    // }, Module.makeImage("open_file.png"));
    // m.addSeparator();
    // m.addItem("Google Drive...", function () {
    //     that.openGoogleDriveDialog()
    // }, Module.makeImage("logo-drive.png"));
    // if (typeof gapi != "undefined") console.log("signed=", gapi.auth2.getAuthInstance().isSignedIn.get());
    // if (typeof gapi != "undefined" && gapi.auth2.getAuthInstance().isSignedIn.get()) {
    //     m.addItem("Sign out from Google Account", function () {
    //         that.hideMenu();
    //         gapi.auth2.getAuthInstance().signOut()
    //     }, Module.makeImage(gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getImageUrl()))
    // } else {
    //     m.addItem("Sign in to Google Account", function () {
    //         that.hideMenu();
    //         that.googleAuthorize(function () {
    //         })
    //     })
    // }
    // this.saveMenu = this.menu.addMenu("Save");
    // this.buildSaveMenu();
    this.menu.addItem("Reload Project", function () {
        that.reopenProject()
    });
    if (!this.studentMode) this.menu.addItem("Clear Project", function () {
        that.clearProject()
    });
    this.menu.addSeparator();
    m = this.menu.addMenu("View");
    // m.addCheckableItem("Search Bar", function () {
    //     return that.searchBarVisible
    // }, function (on) {
    //     that.searchBarVisible = on
    // });
    m.addCheckableItem("Chains Display/Select", function () {
        return that.sequenceViewVisible
    }, function (on) {
        that.sequenceViewVisibleAuto = that.sequenceViewVisible = on
    });
    m.addCheckableItem("Sequence View", function () {
        return that.sequenceContentsVisible
    }, function (on) {
        that.sequenceContentsVisible = on
    });
    var m2 = m.addMenu("Layout");
    m2.addCheckableItem("Horizontal", function () {
        return that.layoutMode == "hor"
    }, function (on) {
        that.layoutMode = "hor";
        that.hideMenu();
        that.saveLayoutToCookies()
    });
    m2.addCheckableItem("Vertical", function () {
        return that.layoutMode == "ver"
    }, function (on) {
        that.layoutMode = "ver";
        that.hideMenu();
        that.saveLayoutToCookies()
    });
    this.menu.addSeparator();
    // var mod_avail = ["ligedit"];
    // for (var i = 0; i < mod_avail.length; i++) {
    //     var item = m.addCheckableItem(mod_avail[i], function () {
    //         return that.act.loadedModules.indexOf(this.mod_name) != -1
    //     }, function (on) {
    //         if (on) {
    //             that.act.loadModule(this.mod_name);
    //             that.RunCommandsLite("display hydrogen")
    //         }
    //         that.hideMenu()
    //     });
    //     item.mod_name = mod_avail[i]
    // }
    this.menu.addSeparator();
    this.menu.buildMenu();
    this.menu.buildUserItems()
};
ActiveIcmPlot = function (parentElement, params, mouseEvents) {
    var that = this;
    this.div = parentElement;
    this.canvas = document.createElement("canvas");
    this.div.appendChild(this.canvas);
    var dpr = window.devicePixelRatio || 1;
    var ww = this.div.clientWidth;
    var hh = this.div.clientHeight;
    this.canvas.width = ww * dpr;
    this.canvas.height = hh * dpr;
    if (dpr > 1) {
        this.canvas.style.width = ww + "px";
        this.canvas.style.height = hh + "px";
        this.canvas.getContext("2d").scale(dpr, dpr)
    }
    this.plot = new Module.IcmPlot(this.canvas, params);
    if (mouseEvents) {
        this.canvas.onmousedown = function (ev) {
            that.plot.mousePressEvent(ev)
        };
        this.canvas.onmouseup = function (ev) {
            that.plot.mouseReleaseEvent(ev)
        };
        this.canvas.onmousemove = function (ev) {
            that.plot.mouseMoveEvent(ev)
        };
        this.canvas.onwheel = function (ev) {
            that.plot.wheelEvent(ev)
        };
        this.canvas.oncontextmenu = function (ev) {
            ev.preventDefault()
        }
    }
    this.plot.draw()
};

function ActiveIcmDialog(act, caption) {
    this.act = act;
    this.rows = [];
    this.inputs = {};
    this.dragstart = null;
    this.caption = document.createElement("div");
    this.caption.className = "dialog_header";
    this.caption.innerHTML = caption;
    this.caption.style.cursor = "default";
    this.caption.par = this;
    this.div = document.createElement("div");
    this.div.className = "dialog";
    this.div.style["z-index"] = "6";
    this.div.style.position = "absolute";
    this.act.cont.appendChild(this.div);
    this.div.style.display = "none";
    this.layout = document.createElement("table");
    this.layout.className = "dialog_layout";
    this.div.appendChild(this.caption);
    this.div.appendChild(this.layout);
    this.makeDraggable()
}

ActiveIcmDialog.prototype.makeDraggable = function () {
    Module.makeDraggable(this.caption, this.caption.par.div, true, true)
};
Module.makeDraggable = function (element, elementToMove, allowX, allowY, gridX, gridY, onmove_callback, onrelease_callback) {
    var dragging = null;

    function mousedown(ev) {
        var e = ev;
        if (!ev.pointerId) e = window.event || ev;
        dragging = {
            mouseX: e.touches ? e.touches[0].clientX : e.clientX,
            mouseY: e.touches ? e.touches[0].clientY : e.clientY,
            startX: parseInt(elementToMove.style.left),
            startY: parseInt(elementToMove.style.top)
        };
        if (typeof ev.pointerId !== "undefined") element.setPointerCapture(ev.pointerId); else if (element.setCapture) element.setCapture()
    }

    var mouseup = function (ev) {
        dragging = null;
        if (ev.pointerId) element.releasePointerCapture(ev.pointerId);
        if (onrelease_callback) onrelease_callback.call(elementToMove)
    };

    function mousemove(ev) {
        if (!dragging) return;
        var e = ev;
        if (!ev.pointerId) e = window.event || ev;
        var xx = e.touches ? e.touches[0].clientX : e.clientX;
        var yy = e.touches ? e.touches[0].clientY : e.clientY;
        if (gridX) xx = Math.round(xx / gridX) * gridX;
        if (gridY) yy = Math.round(yy / gridY) * gridY;
        var top = Math.max(0, dragging.startY + (yy - dragging.mouseY));
        var left = Math.max(0, dragging.startX + (xx - dragging.mouseX));
        if (!onmove_callback || onmove_callback.call(elementToMove, left, top)) {
            if (allowY) elementToMove.style.top = top + "px";
            if (allowX) elementToMove.style.left = left + "px"
        }
        e.preventDefault();
        return false
    }

    if (Module.usePointers) {
        element.onpointerdown = mousedown;
        element.onpointerup = mouseup;
        element.onpointermove = mousemove
    } else {
        element.addEventListener("mousedown", mousedown);
        element.addEventListener("touchstart", mousedown, false);
        element.addEventListener("losecapture", mouseup);
        element.addEventListener("mouseup", mouseup);
        document.addEventListener("mouseup", function () {
            dragging = null
        }, true);
        element.addEventListener("touchend", function () {
            dragging = null;
            if (onrelease_callback) onrelease_callback.call(elementToMove)
        }, true);
        element.addEventListener("touchcancel", function () {
            dragging = null
        }, false);
        var dragTarget = element.setCapture ? element : document;
        dragTarget.addEventListener("mousemove", mousemove, true);
        dragTarget.addEventListener("touchmove", mousemove, false)
    }
};
ActiveIcmDialog.prototype.initFromString = function (desc) {
    desc = "SYNT #1 seq_Sequence (*) [BEGINFRAME:Sources,REQUIRED] ms1_3D_template ((isAmino)) [REQUIRED]\nSYNT #3 ali_Alignment (align@automatic|*) [ENDFRAME,REQUIRED]\nSYNT #4 l_Sample_loops (yes) [BEGINFRAME:Options]\nSYNT #5 l_New_chain_in_existing_model (no) [ENDFRAME,OPTN:(isIcmObj)]\nSYNT #6 os1_Model_object ((isIcmObj)) [VISIBLE:$5]\n";
    var li = desc.split("\n");
    for (var i = 0; i < li.length; i++) {
        var re_field = /([A-Za-z0-9]+)_(\w+)(:[A-Za-z0-9]+)?/;
        var re_empty = /\s+/;
        var re_def = /\(.*\)/;
        var re_opt = /\[.*\]/;
        var line = li[i].split(re_empty);
        for (var j = 0; j < line.length; j++) {
            var field, def, opt;
            field = def = opt = null;
            if (m = re_field.exec(line[j])) {
                field = m;
                if (j + 1 < line.length) {
                    j++;
                    if (m = re_def.exec(line[j])) {
                        def = m
                    }
                }
                if (j + 1 < line.length) {
                    j++;
                    if (m = re_opt.exec(line[j])) {
                        opt = m
                    }
                }
            }
        }
    }
};
ActiveIcmDialog.prototype.setCaption = function (caption) {
    this.caption.innerHTML = caption
};
Module.clearChildren = function (elem) {
    while (elem.firstChild) elem.removeChild(elem.firstChild)
};
ActiveIcmDialog.prototype.clear = function () {
    Module.clearChildren(this.layout);
    this.rows = [];
    this.inputs = {}
};
ActiveIcmDialog.prototype.addRow = function () {
    var tr = document.createElement("tr");
    this.rows[this.rows.length] = tr;
    this.layout.appendChild(tr);
    return tr
};
ActiveIcmDialog.prototype.addCell = function (align) {
    var nof_cols = this.rows.length ? this.rows[this.rows.length - 1].childNodes.length : 0;
    var tr = this.addRow();
    var td = document.createElement("td");
    td.className = "dialog_layout";
    if (nof_cols) td.colSpan = nof_cols;
    if (align) td.style["text-align"] = align;
    tr.appendChild(td);
    return td
};
ActiveIcmDialog.prototype.addText = function (text) {
    var p = document.createElement("p");
    p.innerHTML = text;
    this.addCell().appendChild(p)
};
ActiveIcmDialog.prototype.addTextInput = function (label, text, password, autocomplete) {
    var inp = this.addInput(label, text, password ? "password" : "text");
    if (autocomplete) inp.autocomplete = autocomplete;
    return inp
};
ActiveIcmDialog.prototype.addLogicalInput = function (label, value) {
    var inp = this.addInput(label, value, "checkbox");
    inp.checked = value;
    return inp
};
ActiveIcmDialog.prototype.addMolListInput = function (label, filter) {
    var inp = this.addInput(label, null, "select");
    var mlli = this.act.act.filteredMolecules(filter);
    for (var i = 0; i < mlli.length; i++) {
        var mol = document.createElement("option");
        mol.text = mlli[i].mlst;
        inp.add(mol)
    }
    return inp
};
ActiveIcmDialog.prototype.addObjListInput = function (label, filter) {
    var inp = this.addInput(label, null, "select");
    var mlli = this.act.act.filteredObjects(filter);
    for (var i = 0; i < mlli.length; i++) {
        var mol = document.createElement("option");
        mol.text = mlli[i].obst;
        inp.add(mol)
    }
    return inp
};
ActiveIcmDialog.prototype.addNumberInput = function (label, value, min, max, step) {
    var inp = this.addInput(label, value, "number");
    inp.min = min;
    inp.max = max;
    inp.step = step;
    return inp
};
ActiveIcmDialog.prototype.addInput = function (label, value, type) {
    var nof_cols = this.rows.length ? this.rows[this.rows.length - 1].childNodes.length : 0;
    var tr = this.addRow();
    var td = document.createElement("td");
    tr.appendChild(td);
    td.className = "dialog_layout";
    td.appendChild(document.createTextNode(label));
    td = document.createElement("td");
    tr.appendChild(td);
    td.className = "dialog_layout";
    var inp = type == "select" ? document.createElement("select") : document.createElement("input");
    this[label] = inp;
    if (type != "select") {
        inp.type = type;
        inp.value = value
    }
    td.appendChild(inp);
    this.inputs[label] = inp;
    return inp
};
ActiveIcmDialog.prototype.addWidget = function (label, widget) {
    var nof_cols = this.rows.length ? this.rows[this.rows.length - 1].childNodes.length : 0;
    var tr = this.addRow();
    var td = document.createElement("td");
    tr.appendChild(td);
    td.className = "dialog_layout";
    if (label.length) {
        td.appendChild(document.createTextNode(label));
        if (nof_cols == 2) td.colSpan = "2";
        tr = this.addRow();
        td = document.createElement("td");
        tr.appendChild(td);
        td.className = "dialog_layout"
    }
    td.appendChild(widget);
    return td
};
ActiveIcmDialog.prototype.inputValue = function (label) {
    return this.inputs[label].value
};
ActiveIcmDialog.prototype.addElement = function (element, align) {
    var td = this.addCell(align);
    td.appendChild(element);
    return td
};
ActiveIcmDialog.prototype.addButtons = function (buttons) {
    var that = this;
    var td = this.addCell("center");
    for (var i = 0; i < buttons.length; i++) {
        var btn = document.createElement("button");
        btn.appendChild(document.createTextNode(buttons[i].text));
        if (buttons[i].func) btn.func = buttons[i].func;
        if (buttons[i].keep_bg) btn.keep_bg = buttons[i].keep_bg;
        td.appendChild(btn);
        btn.onclick = function () {
            if (this.func) {
                this.func(that);
                that.hide(this.keep_bg)
            } else {
                that.hide()
            }
        }
    }
};
ActiveIcmDialog.prototype.show = function (nonModal) {
    var ww = this.act.par.clientWidth;
    var hh = this.act.par.clientHeight;
    if (!nonModal) {
        this.act.modal_bg.style.width = ww + "px";
        this.act.modal_bg.style.height = hh + "px";
        this.act.modal_bg.style.display = "block"
    }
    this.div.style.display = "block";
    var w = this.div.clientWidth;
    var h = this.div.clientHeight;
    this.div.style.left = (ww - w) / 2 + "px";
    this.div.style.top = (hh - h) / 2 + "px"
};
ActiveIcmDialog.prototype.hide = function (keep_bg) {
    this.div.style.display = "none";
    if (keep_bg) ; else this.act.modal_bg.style.display = "none"
};
Module.renderHtmlCanvas = function (ctx, html, x, y, w, h) {
    if (html in Module.cached_svg_images) {
        ctx.drawImage(Module.cached_svg_images[html], x, y);
        return
    }
    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + ' " height="' + h + '">' + '<foreignObject width="100%" height="100%">' + '<span xmlns="http://www.w3.org/1999/xhtml">' + html + "</span>" + "</foreignObject>" + "</svg>";
    var DOMURL = window.URL;
    var img = new Image;
    var svg = new Blob([data], {type: "image/svg+xml"});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function () {
        ctx.drawImage(img, x, y);
        Module.cached_svg_images[html] = img;
        DOMURL.revokeObjectURL(url)
    };
    img.src = url
};
var docCookies = {
    getItem: function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1)
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length)
            }
        }
        return ""
    }, setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true
    }, removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) {
            return false
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true
    }, hasItem: function (sKey) {
        if (!sKey) {
            return false
        }
        return new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie)
    }, keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx])
        }
        return aKeys
    }
};
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != "undefined" ? args[number] : match
        })
    }
}
