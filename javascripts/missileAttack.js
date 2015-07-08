var MissileAttack = MissileAttack || (function missleAttackClosure () {
    return {
        dWrapper : false,
        dScore : false,
        wrapperWidth : 0,
        wrapperHeight : 0,
        missileSpeed : 0.01,
        patriotStep: 20,
        missileRate : 1,
        missileId: 0,
        patriotId : 0,
        missiles : [],
        patriots : [],
        explosions : [],
        isPlaying : false,
        shootMissile : function shootMissile() {
            var missileId = this.missileId++,
                dElement = document.createElement("DIV"),
                missile = {
                    id: missileId,
                    fromX: (Math.random() * this.wrapperWidth * 0.9) + this.wrapperWidthPadding,
                    toX: (Math.random() * this.wrapperWidth * 0.9) + this.wrapperWidthPadding,
                    y: 0
                };
            this.missiles.push(missile);
            dElement.className = "missile";
            dElement.id = "missile-"+missileId;
            this.dWrapper.appendChild(dElement);
            missile.elm = dElement;
            missile.elm.style.top = 0;
            missile.elm.style.left = missile.fromX +"px";
        },
        removeMissile: function removeMissile (missle) {
            this.dWrapper.removeChild(missle.elm);
            this.missiles.splice(this.missiles.indexOf(missle),1);
        },
        shootPatriot : function shootPatriot (ev) {
            if (this.isPlaying) {
                var distanceX = ev.layerX,
                    distanceY = this.wrapperHeight - ev.layerY,
                    angle = Math.atan2(distanceY,distanceX);
                var patriotId = this.patriotId++,
                    dElement = document.createElement("DIV"),
                    patriot = {
                        id: patriotId,
                        x: 0,
                        toX: ev.layerX,
                        toY: ev.layerY,
                        y: this.wrapperHeight,
                        stepY: -this.patriotStep * Math.sin(angle),
                        stepX: this.patriotStep * Math.cos(angle)
                    };
                this.patriots.push(patriot);
                dElement.className = "patriot";
                dElement.id = "patriot-"+patriotId;
                this.dWrapper.appendChild(dElement);
                patriot.elm = dElement;
                patriot.elm.style.top = patriot.y +"px";
                patriot.elm.style.left = "0px";
            }
        },
        explode : function explode (x, y) {
            var dElement = document.createElement("DIV"),
                explosion = {
                    x: x,
                    y: y,
                    t: 10
                };
            this.explosions.push(explosion);
            dElement.className = "explosion";
            this.dWrapper.appendChild(dElement);
            explosion.elm = dElement;
            explosion.elm.style.top = explosion.y +"px";
            explosion.elm.style.left = explosion.x +"px";
        },
        isIntersects : function isIntersects (dElm1, dElm2) {
            return !(
                ((dElm1.offsetTop + dElm1.clientHeight) < (dElm2.offsetTop)) ||
                (dElm1.offsetTop > (dElm2.offsetTop + dElm2.clientHeight)) ||
                ((dElm1.offsetLeft + dElm1.clientWidth) < dElm2.offsetLeft) ||
                (dElm1.offsetLeft > (dElm2.offsetLeft + dElm2.clientWidth))
            );
        },
        onIdle : function onIdle () {
            try {
                var that = this;
                if (this.isPlaying) {
                    this.patriots.forEach(function perPatriot (patriot,index) {
                        patriot.y += patriot.stepY;
                        patriot.x += patriot.stepX;
                        patriot.elm.style.top = patriot.y+"px";
                        patriot.elm.style.left = patriot.x+"px";
                        if (patriot.y <= patriot.toY) {
                           if (that.dWrapper.removeChild(patriot.elm)) {
                               that.patriots.splice(index,1);
                               that.explode(patriot.x,patriot.y);
                           } else {
                               alert ("problem");
                           }
                        }
                    });
                    this.explosions.forEach(function perExplosion(explosion,index) {
                        if (--explosion.t == 0) {
                            that.dWrapper.removeChild(explosion.elm);
                            that.patriots.splice(index,1);
                        }
                    });
                    this.missiles.forEach(function perMissile (missile) {
                        missile.y += that.missileSpeed*that.wrapperHeight;
                        missile.x = missile.fromX + (missile.y/that.wrapperHeight)*(missile.toX-missile.fromX);
                        missile.elm.style.top = missile.y+"px";
                        missile.elm.style.left = missile.x+"px";
                        that.explosions.forEach(function perExplosion(explosion) {
                            if (that.isIntersects(missile.elm,explosion.elm)) {
                                that.dScore.value = +that.dScore.value + 1;
                                that.removeMissile.call(that,missile);
                            }
                        });
                        if (missile.y > that.wrapperHeight) {
                            that.removeMissile.call(that,missile);
                        }
                    });
                    if (Math.random()*this.missileRate > 0.97) {
                        this.shootMissile();
                    }
                }
            }
            catch (err) {
                this.isPlaying = false;
                console.log(err);
            }
        },
        startGame : function startGame () {
            var that = this;
            this.dWrapper.className += " playing";
            window.setTimeout(function () {
                that.isPlaying = true;
            },1000);

        },
        init : function init (wrapperName) {
            var that = this;
            this.initCSS();
            window.setInterval(this.onIdle.bind(this), 50);
            this.dWrapper = document.getElementById(wrapperName);
            this.dWrapper.className += "missileAttack";
            this.dWrapper.onclick = this.shootPatriot.bind(that);
            window.setTimeout(function () {
                that.wrapperHeight = that.dWrapper.offsetHeight;
                that.wrapperWidth = that.dWrapper.offsetWidth;
                that.wrapperWidthPadding = that.wrapperWidth*0.05;
            },100);
            this.dScore = document.createElement("input");
            this.dScore.setAttribute("type","number");
            this.dScore.setAttribute("readonly","readonly");
            this.dScore.value = 0;
            this.dScore.className = "score";
            this.dWrapper.appendChild(this.dScore);

            var dElement = document.createElement("button");
            dElement.className = "btnPlay";
            dElement.innerHTML = "<span>PLAY!</span>";
            dElement.onclick = this.startGame.bind(this);
            this.dWrapper.appendChild(dElement);
        },
        initCSS : function initCSS () {
            var cssId = 'missleAttackCSS';  // you could encode the css path itself to generate id..
            if (!document.getElementById(cssId)) {
                var link  = document.createElement('link');
                link.id   = cssId;
                link.rel  = 'stylesheet';
                link.type = 'text/css';
                link.href = 'stylesheets/missileAttack.min.css';
                link.media = 'all';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        }
    };
})();