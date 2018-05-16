(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('ractive')) :
    typeof define === 'function' && define.amd ? define(['ractive'], factory) :
    factory(global.Ractive);
}(this, function (Ractive) { 'use strict';

    Ractive = 'default' in Ractive ? Ractive['default'] : Ractive;

    function stroll(node, position, max, min) {

        var ractive = this,
            pointer = false,
            handler;

        handler = {
            start: function start() {
                // pointer = true
            },
            move: function move(values) {
                var setter = {};
                setter[position.x] = values.offset.x;
                setter[position.y] = values.offset.y;
                ractive.set(setter);

                // console.log(values.offset, values.delta)

                // if(pointer) { return }

                // if(Math.abs(values.delta) < 2) {
                //     ractive.fire('stop')
                // }
            },
            release: function release() {
                // pointer = false
                // ractive.fire('start')
            },
            end: function end() {
                // ractive.fire('stop')
            }
        };

        var scroll = scroller(document, node, max, min || { x: 0, y: 0 }, handler);
        console.log('start');
        scroll.start();

        return {
            teardown: function teardown() {
                if (scroll) {
                    scroll.stop();
                }
            }
        };
    }

    function scroller(listenOn, toScroll, max, min, handler) {

        var offset, reference, pressed, velocity, frame, timestamp, ticker, amplitude, target, timeConstant;

        return {
            start: start,
            stop: stop
        };

        function start() {
            if (typeof window.ontouchstart !== 'undefined') {
                listenOn.addEventListener('touchstart', tap);
                listenOn.addEventListener('touchmove', drag);
                listenOn.addEventListener('touchend', release);
            }
            listenOn.addEventListener('mousedown', tap);
            listenOn.addEventListener('mousemove', drag);
            listenOn.addEventListener('mouseup', release);

            offset = {
                x: min.x,
                y: min.y
            };
            velocity = {
                x: 0,
                y: 0
            };
            pressed = false;
            timeConstant = 325; // ms
        };

        function stop() {

            if (typeof window.ontouchstart !== 'undefined') {
                listenOn.removeEventListener('touchstart', tap);
                listenOn.removeEventListener('touchmove', drag);
                listenOn.removeEventListener('touchend', release);
            }
            listenOn.removeEventListener('mousedown', tap);
            listenOn.removeEventListener('mousemove', drag);
            listenOn.removeEventListener('mouseup', release);
        }

        function pos(e) {
            // touch event
            if (e.targetTouches && e.targetTouches.length >= 1) {
                var e = e.targetTouches[0];
            }

            return {
                x: e.clientX,
                y: e.clientY
            };
        }

        function scroll(pos) {

            offset = {
                x: pos.x > min.x ? min.x : pos.x < -max.x ? -max.x : pos.x,
                y: pos.y > min.y ? min.y : pos.y < -max.y ? -max.y : pos.y
            };

            handler.move({
                offset: offset
            });
        }

        function track() {
            var now, elapsed, dx, dy, delta, vx, vy;

            now = Date.now();
            elapsed = now - timestamp;
            timestamp = now;

            delta = {
                x: offset.x - frame.x,
                y: offset.y - frame.y
            };

            frame = {
                x: offset.x,
                y: offset.y
            };

            vx = 1000 * delta.x / (1 + elapsed);
            vy = 1000 * delta.y / (1 + elapsed);

            velocity = {
                x: 0.8 * vx + 0.2 * velocity.x,
                y: 0.8 * vy + 0.2 * velocity.y
            };
        }

        function autoScroll() {
            var elapsed, delta, amp, xlimit, ylimit;

            if (amplitude) {
                elapsed = Date.now() - timestamp;
                amp = Math.exp(-elapsed / timeConstant);
                delta = {
                    x: -amplitude.x * amp,
                    y: -amplitude.y * amp
                };

                if (delta.x > 0.5 || delta.x < -0.5 || delta.y > 0.5 || delta.y < -0.5) {
                    xlimit = offset.x === min.x || offset.x === -max.x;
                    ylimit = offset.y === min.y || offset.y === -max.y;

                    scroll({
                        x: xlimit ? target.x : target.x + delta.x,
                        y: ylimit ? target.y : target.y + delta.y
                    });

                    if (xlimit && ylimit) {
                        handler.end(target);
                        return;
                    }
                    requestAnimationFrame(autoScroll);
                } else {
                    scroll(target);
                    handler.end(target);
                }
            }
        }

        function tap(e) {
            pressed = true;
            reference = pos(e);
            console.log(reference);

            velocity = { x: 0, y: 0 };
            amplitude = { x: 0, y: 0 };
            frame = { x: offset.x, y: offset.y };

            timestamp = Date.now();
            clearInterval(ticker);
            ticker = setInterval(track, 30);

            handler.start();

            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        function drag(e) {
            var point, delta;
            if (pressed) {
                point = pos(e);
                delta = {
                    x: reference.x - point.x,
                    y: reference.y - point.y
                };
                if (delta.x > 2 || delta.x < -2 || delta.y > 2 || delta.y < -2) {
                    reference = point;
                    var mark = {
                        x: offset.x + delta.x,
                        y: offset.y + delta.y
                    };
                    scroll(mark);
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        function release(e) {
            pressed = false;

            handler.release();

            clearInterval(ticker);
            if (velocity.x > 10 || velocity.x < -10 || velocity.y > 10 || velocity.y < -10) {

                amplitude = {
                    x: 0.8 * velocity.x,
                    y: 0.8 * velocity.y
                };

                target = {
                    x: Math.round(offset.x + amplitude.x),
                    y: Math.round(offset.y + amplitude.y)
                };

                timestamp = Date.now();
                requestAnimationFrame(autoScroll);
            } else {
                handler.end(offset);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    var __options__ = {
    	template: {v:3,t:[{p:[1,1,0],t:7,e:"h1",f:["ractive-3D CSS!"]}," ",{p:[3,1,26],t:7,e:"div",o:{n:"stroll",a:[{x:"strollX",y:"strollZ"},{x:200,y:3000},{x:2000,y:0}]},f:[{p:[5,1,123],t:7,e:"space",f:[{p:[6,2,132],t:7,e:"floor",a:{width:"3000",depth:"3000","class":"blue",y:"-1"},f:[{p:[7,3,188],t:7,e:"div",a:{style:"position: absolute;\n\t\t\t\t\ttop: 0; bottom: 0; left: 0; right: 0;","x-decorator":"stroll:\n\t\t\t \t{ x: \"strollX\", y: \"strollZ\" },\n\t\t\t \t{ x: 200, y: 3000 },\n\t\t\t \t{ x: 2000, y: 0 }"},f:[]}]}," ",{t:4,f:[{p:[17,2,410],t:7,e:"room",a:{x:[{t:2,r:"x",p:[17,11,419]}],z:[{t:2,r:"z",p:[17,21,429]}],height:[{t:2,r:"height",p:[17,36,444]}]}}],r:"rooms",p:[16,2,398]}," ",{t:4,f:[{p:[21,3,480],t:7,e:"wall",a:{x:[{t:2,r:"x",p:[21,12,489]}],z:[{t:2,r:"z",p:[21,22,499]}],y:"0",height:"300",length:"200","class":"girl"},f:[{p:[24,4,565],t:7,e:"img",a:{src:[{t:2,r:"image",p:[24,14,575]}]}}]}],r:"girls",p:[20,2,467]}]}]}]},
    	css:"p{color:#00f}img{transition:transform .3s ease-in-out}img:hover{transform:translate3d(-10px,0,200px)}",
    };
    var component={};
    var __prop__;
    var __export__;
    // Returns a random integer between min (included) and max (included)
    function getRandom(min, max) {
    	return Math.floor(Math.random() * (max + 1 - min)) + min;
    }

    var count = getRandom(3, 10);
    var rooms = new Array(count);
    for (var i = 0; i < count; i++) {
    	rooms[i] = {
    		x: getRandom(100, 2500),
    		z: getRandom(100, 2500),
    		height: getRandom(50, 500)
    	};
    };

    var girls = [{ x: 1200, z: 500, image: 'images/happy-girl.png' }, { x: 1700, z: 1700, image: 'images/mad-girl.png' }, { x: 2100, z: 600, image: 'images/in-a-band-girl.png' }, { x: 790, z: 1100, image: 'images/kick-it-girl.png' }];

    component.exports = {
    	noCssTransform: true,
    	data: {
    		x: -2000, y: 0, z: 0,
    		rotateX: -15, rotateY: 0, rotateZ: 0,
    		rooms: rooms,
    		girls: girls
    	},
    	computed: {
    		strollZ: {
    			get: '-${z}',
    			set: function set(z) {
    				this.set('z', -z);
    			}
    		},
    		strollX: {
    			get: '-${x}',
    			set: function set(x) {
    				this.set('x', -x);
    			}
    		}
    	}
    };



    if ( typeof component.exports === "object" ) {
    	for ( __prop__ in component.exports ) {
    		if ( component.exports.hasOwnProperty(__prop__) ) {
    			__options__[__prop__] = component.exports[__prop__];
    		}
    	}
    }

    __export__ = Ractive.extend( __options__ );

    var C0 = __export__;

    var __options__$1 = {
    	template: {v:3,t:[{p:[1,1,0],t:7,e:"div",a:{"class":["plane floor ",{t:2,x:{r:["class"],s:"_0||\"grey\""},p:[1,26,25]}],style:["height:",{t:2,r:"depth",p:[2,17,60]},"px; width: ",{t:2,r:"width",p:[3,12,84]},"px; -webkit-transform: rotateX(90deg) translate3d(",{t:2,r:"x",p:[4,51,147]},"px, ",{t:2,x:{r:["z"],s:"-_0"},p:[4,60,156]},"px, ",{t:2,r:"y",p:[4,70,166]},"px);"]},f:[{t:16,p:[5,2,179]}]}]},
    	css:".floor{-webkit-transform-origin-y:100%}",
    };
    var component$1={};
    var __prop__$1;
    var __export__$1;
    component$1.exports = {
    	data: {
    		depth: 100,
    		width: 100,
    		x: 0, y: 0, z: 0
    	}
    };



    if ( typeof component$1.exports === "object" ) {
    	for ( __prop__$1 in component$1.exports ) {
    		if ( component$1.exports.hasOwnProperty(__prop__$1) ) {
    			__options__$1[__prop__$1] = component$1.exports[__prop__$1];
    		}
    	}
    }

    __export__$1 = Ractive.extend( __options__$1 );

    var C1 = __export__$1;

    var __options__$2 = {
    	template: {v:3,t:[{p:[1,1,0],t:7,e:"div",a:{"class":"plane room",style:["-webkit-transform: translate3d(",{t:2,r:"x",p:[1,63,62]},"px, ",{t:2,x:{r:["y"],s:"-_0"},p:[1,72,71]},"px, ",{t:2,x:{r:["z"],s:"-_0"},p:[1,82,81]},"px);"]},f:[{p:[2,2,95],t:7,e:"floor",a:{depth:[{t:2,r:"depth",p:[2,16,109]}],width:[{t:2,r:"width",p:[2,34,127]}]}}," ",{p:[3,2,141],t:7,e:"wall",a:{length:[{t:2,r:"width",p:[3,16,155]}],height:[{t:2,r:"height",p:[3,35,174]}]}}," ",{p:[4,2,189],t:7,e:"wall",a:{length:[{t:2,r:"width",p:[4,16,203]}],height:[{t:2,r:"height",p:[4,35,222]}],z:[{t:2,r:"depth",p:[4,50,237]}]}}," ",{p:[5,2,251],t:7,e:"side-wall",a:{length:[{t:2,r:"depth",p:[5,21,270]}],height:[{t:2,r:"height",p:[5,40,289]}]}}," ",{p:[6,2,304],t:7,e:"side-wall",a:{length:[{t:2,r:"depth",p:[6,21,323]}],height:[{t:2,r:"height",p:[6,40,342]}],x:[{t:2,r:"width",p:[6,55,357]}]}}]}]},
    };
    var component$2={};
    var __prop__$2;
    var __export__$2;
    component$2.exports = {
    	data: {
    		height: 30,
    		depth: 200,
    		width: 200,
    		x: 0, y: 0, z: 0
    	}
    };



    if ( typeof component$2.exports === "object" ) {
    	for ( __prop__$2 in component$2.exports ) {
    		if ( component$2.exports.hasOwnProperty(__prop__$2) ) {
    			__options__$2[__prop__$2] = component$2.exports[__prop__$2];
    		}
    	}
    }

    __export__$2 = Ractive.extend( __options__$2 );

    var C2 = __export__$2;

    var __options__$3 = {
    	template: {v:3,t:[{p:[1,1,0],t:7,e:"div",a:{"class":["plane side-wall ",{t:2,x:{r:["class"],s:"_0||\"grey\""},p:[1,29,28]}],style:["height:",{t:2,r:"height",p:[2,17,63]},"px; width: ",{t:2,r:"length",p:[3,12,88]},"px; -webkit-transform: rotateY(90deg) translate3d(",{t:2,r:"z",p:[4,51,152]},"px, ",{t:2,x:{r:["y"],s:"-_0"},p:[4,60,161]},"px, ",{t:2,r:"x",p:[4,70,171]},"px);"]},f:[]}]},
    	css:".side-wall{-webkit-transform-origin-x:0}",
    };
    var component$3={};
    var __prop__$3;
    var __export__$3;
    component$3.exports = {
    	data: {
    		height: 100,
    		length: 100,
    		x: 0, y: 0, z: 0
    	}
    };



    if ( typeof component$3.exports === "object" ) {
    	for ( __prop__$3 in component$3.exports ) {
    		if ( component$3.exports.hasOwnProperty(__prop__$3) ) {
    			__options__$3[__prop__$3] = component$3.exports[__prop__$3];
    		}
    	}
    }

    __export__$3 = Ractive.extend( __options__$3 );

    var C3 = __export__$3;

    var __options__$4 = {
    	template: {v:3,t:[{p:[1,1,0],t:7,e:"div",a:{"class":"space",style:""},f:[{p:[2,2,31],t:7,e:"div",a:{"class":"user-view",style:["-webkit-transform: rotateX(",{t:2,r:"rotateX",p:[4,13,95]},"deg) rotateY(",{t:2,r:"rotateY",p:[5,13,123]},"deg) rotateZ(",{t:2,r:"rotateZ",p:[6,13,151]},"deg) translate3d(",{t:2,r:"x",p:[7,17,183]},"px, ",{t:2,r:"y",p:[7,26,192]},"px, ",{t:2,r:"z",p:[7,35,201]},"px)"]},f:[{t:16,p:[9,3,219]}]}]}]},
    	css:".space{position:absolute;bottom:20px;top:45px;right:20px;left:20px;-webkit-perspective:850;overflow:visible}.plane,.user-view{bottom:0;-webkit-transform-style:preserve-3d}.controls,.user-view{top:0;position:absolute}.controls{height:45px}.user-view{right:0;left:0}.plane{position:absolute;box-sizing:border-box}.grey{background:#d3d3d3;border:1px solid #a9a9a9}.blue{background:#b0c4de;border:1px solid #4682b4}.green{background:#90ee90;border:1px solid green}.pink{background:#ffb6c1;border:1px solid pink}",
    };
    var component$4={};
    var __prop__$4;
    var __export__$4;
    component$4.exports = {
    	noCssTransform: true
    };



    if ( typeof component$4.exports === "object" ) {
    	for ( __prop__$4 in component$4.exports ) {
    		if ( component$4.exports.hasOwnProperty(__prop__$4) ) {
    			__options__$4[__prop__$4] = component$4.exports[__prop__$4];
    		}
    	}
    }

    __export__$4 = Ractive.extend( __options__$4 );

    var C4 = __export__$4;

    var __options__$5 = {
    	template: {v:3,t:[{p:[1,1,0],t:7,e:"div",a:{"class":["plane wall ",{t:2,x:{r:["class"],s:"_0||\"grey\""},p:[1,24,23]}],style:["height:",{t:2,r:"height",p:[2,17,58]},"px; width: ",{t:2,r:"length",p:[3,12,83]},"px; -webkit-transform: translate3d(",{t:2,r:"x",p:[4,36,132]},"px, ",{t:2,x:{r:["y"],s:"-_0"},p:[4,45,141]},"px, ",{t:2,x:{r:["z"],s:"-_0"},p:[4,55,151]},"px);"]},f:[{t:16,p:[4,67,163]}]}]},
    	css:".wall{-webkit-transform-origin-y:100%;-webkit-transform-origin-x:0}",
    };
    var component$5={};
    var __prop__$5;
    var __export__$5;
    component$5.exports = {
    	data: {
    		height: 100,
    		length: 100,
    		x: 0, y: 0, z: 0
    	}
    };



    if ( typeof component$5.exports === "object" ) {
    	for ( __prop__$5 in component$5.exports ) {
    		if ( component$5.exports.hasOwnProperty(__prop__$5) ) {
    			__options__$5[__prop__$5] = component$5.exports[__prop__$5];
    		}
    	}
    }

    __export__$5 = Ractive.extend( __options__$5 );

    var C5 = __export__$5;

    Ractive.components['app'] = C0;
    Ractive.components['floor'] = C1;
    Ractive.components['room'] = C2;
    Ractive.components['side-wall'] = C3;
    Ractive.components['space'] = C4;
    Ractive.components['wall'] = C5;

    Ractive.decorators.stroll = stroll;

    window.ractive = new C0({
        el: document.body
    });

}));