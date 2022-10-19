function SequenceView(parentContainerId) {
    var par = typeof parentContainerId == "object" ? parentContainerId : document.getElementById(parentContainerId);
    this.cont = document.createElement("div");
    this.cont.id = "tabscontent";
    par.appendChild(this.cont);
    this.canvas = document.createElement("canvas");
    this.cont.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.charHeight = 20;
    this.ctx.font = this.charHeight + "px monospace";
    this.charWidth = this.ctx.measureText("A").width;
    this.canvas.style.cursor = "text";
    this.canvas.cont = this.cont;
    this.tooltip = document.createElement("div");
    this.tooltip.className = "tooltip";
    this.tooltip.style.display = "none";
    par.appendChild(this.tooltip);
    var handle_size = 24;
    this.selLeftHandle = Module.makeImage("sel_handle_left.png", null, null, handle_size);
    this.selLeftHandle.style.position = "absolute";
    this.selLeftHandle.style["z-index"] = "20";
    this.selLeftHandle.style.display = "none";
    this.selLeftHandle.left = true;
    this.selLeftHandle.handle_size = Math.round(handle_size * window.devicePixelRatio);
    this.cont.appendChild(this.selLeftHandle);
    this.selRightHandle = Module.makeImage("sel_handle_right.png", null, null, handle_size);
    this.selRightHandle.style.position = "absolute";
    this.selRightHandle.style["z-index"] = "20";
    this.selRightHandle.style.display = "none";
    this.selRightHandle.handle_size = Math.round(handle_size * window.devicePixelRatio);
    this.cont.appendChild(this.selRightHandle);
    this.chain = null;
    this.selStart = null;
    this.selEnd = null;
    var that = this;
    this.selLeftHandle.updatePos = this.selRightHandle.updatePos = function () {
        this.style.bottom = that.par.seq_cont.clientHeight + 5 + "px";
        var x = this.pos * that.charWidth + Math.floor(this.pos / 10) * that.charWidth - (this.left ? this.handle_size : 0);
        this.style.left = x - that.cont.scrollLeft + "px";
        this.style.display = "block"
    };

    function onHandleMove(x, y) {
        var p = that.getIndexPos(x + that.cont.scrollLeft + (this.left ? this.handle_size : 0));
        if (this.left && p < that.selRightHandle.pos || !this.left && p > that.selLeftHandle.pos) {
            this.pos = p;
            that.showTooltipAt({x: x + that.cont.scrollLeft, y: y}, this.pos, SequenceView.tooltip_yofs);
            return true
        }
        return false
    }

    Module.makeDraggable(this.selLeftHandle, this.selLeftHandle, true, false, that.charWidth, null, onHandleMove, function () {
        that.setSelectionFromHandles()
    });
    Module.makeDraggable(this.selRightHandle, this.selRightHandle, true, false, that.charWidth, null, onHandleMove, function (x, y) {
        that.setSelectionFromHandles()
    });
    this.cont.onscroll = function () {
        that.selLeftHandle.style.display = "none";
        that.selRightHandle.style.display = "none"
    };
    this.canvas.onmousedown = function (ev) {
        that.onMouseDown(ev)
    };
    this.canvas.onmousemove = function (ev) {
        that.onMouseMove(ev)
    };
    this.canvas.onmouseup = function (ev) {
        that.onMouseUp(ev)
    };
    this.canvas.ontouchstart = function (ev) {
        if (that.touchTimer != null) clearTimeout(that.touchTimer);
        this.posX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        that.touchTimer = setTimeout(function (ev) {
            that.showTooltipAt(that.getMousePos(ev), that.getIndex(ev), SequenceView.tooltip_yofs);
            that.onMouseDown(ev);
            ev.preventDefault()
        }, 1e3, ev)
    };
    this.canvas.ontouchmove = function (ev, allowScroll) {
        if (that.selStart != null) {
            that.onMouseMove(ev);
            ev.preventDefault()
        } else if (allowScroll) {
            var x = ev.touches ? ev.touches[0].clientX : ev.clientX;
            var l = this.cont.scrollLeft - (x - this.posX);
            this.cont.scrollLeft = Math.min(Math.max(0, l), this.cont.scrollWidth);
            this.posX = x
        }
    };
    this.canvas.ontouchend = this.canvas.ontouchcancel = function (ev) {
        if (that.touchTimer != null) {
            clearTimeout(that.touchTimer);
            that.touchTimer = null
        }
        if (that.selStart != null) {
            that.onMouseUp(ev);
            ev.preventDefault()
        }
        that.selStart = that.selEnd = null
    };
    this.canvas.onmouseleave = this.canvas.onmouseout = function (ev) {
        that.cancelTimeout();
        that.hideTooltip()
    };
    if (window.PointerEvent) {
        this.canvas.style["touch-action"] = "none";
        this.canvas.style["ms-touch-action"] = "none";
        this.canvas.addEventListener("pointerdown", function (ev) {
            ev.preventDefault();
            this.setPointerCapture(ev.pointerId);
            if (ev.pointerType == "touch") this.ontouchstart(ev); else that.onMouseDown(ev)
        }, false);
        this.canvas.addEventListener("pointerup", function (ev) {
            ev.preventDefault();
            this.releasePointerCapture(ev.pointerId);
            if (ev.pointerType == "touch") this.ontouchend(ev); else that.onMouseUp(ev)
        }, false);
        this.canvas.addEventListener("pointermove", function (ev) {
            ev.preventDefault();
            if (ev.pointerType == "touch") this.ontouchmove(ev, true); else that.onMouseMove(ev, false)
        }, false)
    }
    this.header = document.createElement("div");
    this.header.id = "tabsheader";
    par.appendChild(this.header);
    this.list = document.createElement("ul");
    this.header.appendChild(this.list)
}

SequenceView.E_AMINO = 0;
SequenceView.E_HETATM = 1;
SequenceView.E_NUCL = 2;
SequenceView.E_SUGAR = 3;
SequenceView.E_LIPID = 4;
SequenceView.E_NTER = 5;
SequenceView.E_CTER = 6;
SequenceView.E_NA5TER = 7;
SequenceView.E_NA3TER = 8;
SequenceView.E_RADICAL = 9;
SequenceView.E_METAL = 10;
SequenceView.E_WATER = 11;
SequenceView.E_TREE = 12;
SequenceView.E_UNKRETY = 13;
SequenceView.RESO = ["amino", "ligand", "nucl", "sugar", "lipid", "nter", "cter", "na5ter", "na3ter", "radical", "metal", "water", "tree", "unknown", ""];
SequenceView.tooltip_yofs = 40;
SequenceView.prototype.addTab = function (chain, isSingle) {
    var that = this;
    var tab = document.createElement("li");
    tab.chain = chain;
    var index = this.list.childNodes.length;
    this.list.appendChild(tab);
    this.timer = this.touchTimer = null;
    var tabName = document.createElement("a");
    var chain_info = SequenceView.RESO[chain.type];
    if (this.par.studentMode && isSingle) {
        tabName.innerHTML = "<b>" + chain_info + "</b>"
    } else {
        tabName.innerHTML = "<b>" + chain.name + " </b><i>(" + chain_info + ")</i>"
    }
    tabName.style["padding"] = "4px";
    tab.appendChild(tabName);
    tabName.onclick = function () {
        that.setTab(index)
    };
    {
        var tabDisplayed = document.createElement("a");
        tabDisplayed.style["padding"] = "4px";
        var tabImg = Module.makeDisplayedPixmap(chain.gf != 0, chain.kr);
        tabDisplayed.appendChild(tabImg);
        tabDisplayed.onclick = function () {
            that.toggleDisplayed(index)
        };
        tab.appendChild(tabDisplayed)
    }
    if (!false) {
        var tabSelected = document.createElement("a");
        tabSelected.style["padding"] = "4px";
        var tabImg = Module.makeSelectedPixmap(chain.sel);
        tabSelected.appendChild(tabImg);
        tabSelected.onclick = function () {
            that.toggleSelected(index)
        };
        tab.appendChild(tabSelected)
    }
};
Module.makeSelectedPixmap = function (isSelected) {
    var canvas = document.createElement("canvas");
    canvas.width = 14;
    canvas.height = 14;
    canvas.style.border = "1px solid #007c00";
    if (isSelected) {
        var ctx = canvas.getContext("2d");
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00d77e";
        ctx.beginPath();
        ctx.moveTo(8, 1);
        ctx.lineTo(13, 6);
        ctx.moveTo(13, 1);
        ctx.lineTo(8, 6);
        ctx.moveTo(0, 8);
        ctx.lineTo(6, 13);
        ctx.moveTo(6, 8);
        ctx.lineTo(1, 13);
        ctx.stroke()
    }
    canvas.title = "Toggle selection";
    return canvas
};
Module.makeDisplayedPixmap = function (isDisplayed, color) {
    var canvas = document.createElement("canvas");
    canvas.width = 14;
    canvas.height = 14;
    canvas.style.border = "1px solid black";
    var ctx = canvas.getContext("2d");
    if (isDisplayed) {
        if (color == "#FFFFFF") color = "grey";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 14, 14);
        ctx.fillStyle = "white";
        ctx.fillRect(5, 5, 4, 4);
        ctx.strokeStyle = "black";
        ctx.strokeRect(5, 5, 4, 4)
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 14, 14)
    }
    canvas.title = "Toggle display";
    return canvas
};
SequenceView.prototype.getMousePos = function (ev) {
    var rect = this.canvas.getBoundingClientRect();
    return {
        x: (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left,
        y: (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top
    }
};
SequenceView.prototype.getIndex = function (ev) {
    return this.getIndexPos(this.getMousePos(ev).x)
};
SequenceView.prototype.getIndexPos = function (p) {
    var index = Math.round(p / this.charWidth);
    index -= Math.floor(index / 11);
    if (index < 0) index = 0;
    if (index >= this.chain.reli.length) index = this.chain.reli.length - 1;
    return index
};
SequenceView.prototype.cancelTimeout = function () {
    if (this.timer != null) clearTimeout(this.timer);
    this.timer = null
};
SequenceView.prototype.hideTooltip = function () {
    this.tooltip.style.display = "none"
};
SequenceView.prototype.showTooltipAt = function (pos, index, yofs) {
    this.tooltip.style.bottom = this.par.seq_cont.clientHeight + 5 + (yofs ? yofs : 0) + "px";
    this.tooltip.style.left = pos.x - this.cont.scrollLeft + "px";
    this.tooltip.innerHTML = this.chain.reli[index].ch + this.chain.reli[index].nu;
    this.tooltip.style.display = "block"
};
SequenceView.prototype.onMouseDown = function (ev) {
    console.log("onMouseDown", ev);
    if (!this.currentChainHasSequence()) return;
    var index = this.getIndex(ev);
    this.selStart = index
};
SequenceView.prototype.onMouseMove = function (ev) {
    var that = this;
    var yofs = ev.touches || ev.pointerType == "touch" ? SequenceView.tooltip_yofs : 0;
    if (this.selStart == null && !ev.touches && ev.pointerType != "touch") {
        this.cancelTimeout();
        if (this.currentChainHasSequence()) if (this.tooltip.style.display == "none") {
            this.timer = setTimeout(function () {
                that.showTooltipAt(that.getMousePos(ev), that.getIndex(ev))
            }, 1e3)
        } else that.showTooltipAt(that.getMousePos(ev), that.getIndex(ev));
        return
    }
    this.selEnd = this.getIndex(ev);
    that.showTooltipAt(that.getMousePos(ev), this.selEnd > this.selStart ? this.selEnd - 1 : this.selEnd, yofs);
    this.drawBody()
};
SequenceView.prototype.onMouseUp = function (ev) {
    if (!this.currentChainHasSequence()) return;
    if (this.selStart != null && this.selEnd != null && this.selStart != this.selEnd) {
        var fr = Math.min(this.selStart, this.selEnd) + 1;
        var to = Math.max(this.selStart, this.selEnd);
        this.par.act.RunCommandsLite("as_graph = Atom(" + this.chain.mlst + "/ [" + fr + ":" + to + "])")
    } else {
        this.par.act.RunCommandsLite("as_graph = a_NONE.//")
    }
    this.hideTooltip();
    this.refreshTabs();
    this.updateSelectionHandles(this.selStart, this.selEnd);
    this.selStart = this.selEnd = null
};
Module.reorderChains = function (chains) {
    if (chains.length > 1 && chains[0].type != SequenceView.E_AMINO && chains[0].type != SequenceView.E_NUCL) {
        for (var i = 1; i < chains.length; i++) {
            if (chains[i].type == SequenceView.E_AMINO || chains[i].type == SequenceView.E_NUCL) {
                var ch = chains[0];
                chains[0] = chains[i];
                chains[i] = ch;
                break
            }
        }
    }
};
Module.numberOfChains = function (chains) {
    var chainsByChainCount = {};
    for (var i = 0; i < chains.length; i++) {
        if (typeof chainsByChainCount[chains[i].chain] == "undefined") chainsByChainCount[chains[i].chain] = 0;
        chainsByChainCount[chains[i].chain]++
    }
    return Object.keys(chainsByChainCount).length
};
SequenceView.prototype.refreshTabs = function () {
    var curTab = this.currentTab();
    var chains = this.par.act.currentObjectInfo.chains;
    Module.reorderChains(chains);
    this.clearTabs();
    var numChains = Module.numberOfChains(chains);
    for (var i = 0; i < chains.length; i++) {
        this.addTab(chains[i], numChains == 1)
    }
    if (this.nofTabs()) this.setTab(curTab);
    this.hideSelectionHandles()
};
SequenceView.prototype.currentChainHasSequence = function () {
    return this.chain.type == SequenceView.E_AMINO || this.chain.type == SequenceView.E_NUCL
};
SequenceView.prototype.drawBody = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "white";
    this.canvas.height = this.charHeight;
    if (this.currentChainHasSequence()) {
        var new_width = this.charWidth * this.chain.reli.length;
        if (new_width != this.canvas.width) this.canvas.width = new_width;
        var x = 0;
        var selStart = null, selEnd = null;
        for (var i = 0; i < this.chain.reli.length; i++) {
            if (this.chain.reli[i].sel) {
                if (selStart == null) selStart = i;
                selEnd = i + 1
            } else {
                if (selStart != null) break
            }
        }
        for (var i = 0; i < this.chain.reli.length; i++) {
            this.ctx.font = this.charHeight + "px monospace";
            this.ctx.strokeStyle = this.chain.reli[i].kr;
            this.ctx.fillStyle = this.chain.reli[i].kr;
            this.ctx.lineWidth = 1;
            this.ctx.fillText(this.chain.reli[i].ch, x, this.charHeight - 4);
            if (this.chain.reli[i].under) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.charHeight - 2);
                this.ctx.lineTo(x + this.charWidth, this.charHeight - 2);
                this.ctx.closePath();
                this.ctx.stroke()
            }
            if (this.chain.reli[i].sel || this.selStart != null && this.selEnd != null && i >= Math.min(this.selStart, this.selEnd) && i < Math.max(this.selStart, this.selEnd)) {
                this.ctx.fillStyle = "rgba(0,0,225,0.4)";
                this.ctx.fillRect(x, 0, this.charWidth, this.charHeight)
            }
            x += this.charWidth;
            if ((i + 1) % 10 == 0) x += this.charWidth
        }
    } else if (this.chain.type == SequenceView.E_HETATM || this.chain.type == SequenceView.E_METAL) {
        this.canvas.width = this.charWidth * this.chain.nalr.length;
        this.ctx.fillStyle = "black";
        this.ctx.strokeStyle = "black";
        this.ctx.font = this.charHeight + "px monospace";
        this.ctx.fillText(this.chain.nalr, 0, this.charHeight - 4)
    }
};
SequenceView.prototype.hideSelectionHandles = function () {
    this.selLeftHandle.style.display = "none";
    this.selRightHandle.style.display = "none"
};
SequenceView.prototype.updateSelectionHandles = function (start, end) {
    if (start != null && end != null && start != end) {
        this.selLeftHandle.pos = start;
        this.selRightHandle.pos = end;
        this.selLeftHandle.updatePos();
        this.selRightHandle.updatePos()
    } else {
        this.hideSelectionHandles()
    }
};
SequenceView.prototype.setSelectionFromHandles = function () {
    console.log("setSelectionFromHandles");
    this.selStart = this.selLeftHandle.pos;
    this.selEnd = this.selRightHandle.pos;
    this.onMouseUp(null)
};
SequenceView.prototype.toggleDisplayed = function (tabIndex) {
    var li = this.list.childNodes;
    if (tabIndex < 0 || tabIndex >= li.length) return;
    var chain = li[tabIndex].chain;
    if (chain.gf) this.par.act.RunCommandsLite("undisplay store " + chain.mlst); else this.par.act.RunCommandsLite("cool " + chain.mlst)
};
SequenceView.prototype.toggleSelected = function (tabIndex) {
    var li = this.list.childNodes;
    if (tabIndex < 0 || tabIndex >= li.length) return;
    var chain = li[tabIndex].chain;
    if (chain.sel) this.par.act.RunCommandsLite("as_graph = as_graph & ! Atom(" + chain.mlst + ")"); else this.par.act.RunCommandsLite("as_graph = as_graph | Atom(" + chain.mlst + ")")
};
SequenceView.prototype.setTab = function (tabIndex) {
    var li = this.list.childNodes;
    if (tabIndex < 0 || tabIndex >= li.length) tabIndex = 0;
    for (var i = 0; i < li.length; i++) li[i].removeAttribute("id");
    li[tabIndex].id = "selected";
    this.chain = li[tabIndex].chain;
    this.drawBody()
};
SequenceView.prototype.nofTabs = function () {
    return this.list.childNodes.length
};
SequenceView.prototype.nofChainsOf = function (type) {
    var n = 0;
    for (var i = 0; i < this.list.childNodes.length; i++) if (this.list.childNodes[i].chain.type == type) n++;
    return n
};
SequenceView.prototype.currentTab = function () {
    var li = this.list.childNodes;
    for (var i = 0; i < li.length; i++) if (li[i].hasAttribute("id")) return i;
    return 0
};
SequenceView.prototype.clearTabs = function () {
    while (this.list.firstChild) this.list.removeChild(this.list.firstChild)
};

function ActiveIcmTabView(parentContainerId) {
    this.mainDiv = document.createElement("div");
    this.buttons = [];
    this.pages = [];
    this.widgets = [];
    this.activeTab = -1;
    this.buttonsDiv = document.createElement("div");
    this.buttonsDiv.className = "tabsheader2";
    this.mainDiv.appendChild(this.buttonsDiv);
    this.contentDiv = document.createElement("div");
    this.contentDiv.className = "tabscontent2";
    this.contentDiv.style["overflow"] = "none";
    this.mainDiv.appendChild(this.contentDiv)
}

ActiveIcmTabView.prototype.updateLayout = function () {
    var hh = this.mainDiv.offsetHeight - this.buttonsDiv.offsetHeight - 10;
    this.contentDiv.style.height = hh + "px";
    for (var i = 0; i < this.pages.length; i++) {
        if (this.widgets[i]) {
            if (typeof this.widgets[i].setSize == "function") {
                this.widgets[i].setSize(this.contentDiv.clientWidth - 10, hh)
            } else {
                this.widgets[i].setWidth(this.contentDiv.clientWidth - 10);
                this.widgets[i].setHeight(hh)
            }
        } else this.pages[i].style.width = this.contentDiv.clientWidth + "px";
        this.pages[i].style.display = i == this.activeTab ? "block" : "none"
    }
};
ActiveIcmTabView.prototype.addTab = function (name, widget, img) {
    return this.addTabHtml(name, widget.html, img, widget)
};
ActiveIcmTabView.prototype.addTabHtml = function (name, element, img, widget) {
    var that = this;
    var button = document.createElement("button");
    button.onclick = function () {
        that.activateTab(this)
    };
    button.innerHTML = name;
    if (img) button.appendChild(img);
    button.title = name;
    button.className = "tabsheader2";
    this.buttons.push(button);
    this.buttonsDiv.appendChild(button);
    this.pages.push(element);
    this.widgets.push(widget);
    this.contentDiv.appendChild(element);
    element.parentTab = this.contentDiv;
    this.activateTabSimple(this.pages.length - 1);
    return button
};
ActiveIcmTabView.prototype.nofTabs = function () {
    return this.buttons.length
};
ActiveIcmTabView.prototype.widgetAt = function (pos) {
    return this.widgets[pos]
};
ActiveIcmTabView.prototype.activeWidget = function () {
    return this.activeTab != -1 ? this.widgetAt(this.activeTab) : null
};
ActiveIcmTabView.prototype.clearTabs = function () {
    Module.clearChildren(this.buttonsDiv);
    Module.clearChildren(this.contentDiv);
    this.buttons = [];
    this.pages = [];
    this.widgets = []
};
ActiveIcmTabView.prototype.activateTab = function (button) {
    this.activateTabSimple(button);
    if (typeof this.widgets[this.activeTab].activated == "function") this.widgets[this.activeTab].activated()
};
ActiveIcmTabView.prototype.activateTabSimple = function (button) {
    var num = -1;
    if (typeof button == "number") num = button; else if (typeof button == "string") {
        for (var i = 0; i < this.buttons.length; i++) if (this.buttons[i].title == button) {
            num = i;
            break
        }
    } else {
        for (var i = 0; i < this.buttons.length; i++) if (this.buttons[i] == button) {
            num = i;
            break
        }
    }
    this.activeTab = num;
    if (num == -1) return;
    for (var i = 0; i < this.pages.length; i++) {
        var on = i == num;
        this.pages[i].style.display = on ? "block" : "none";
        this.buttons[i].setAttribute("selected", on)
    }
};
