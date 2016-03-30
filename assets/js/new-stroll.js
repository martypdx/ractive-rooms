export default function stroll(node, position, max, min){

    var ractive = this,
        pointer = false,
        handler;


    handler = {
        start: function(){
            // pointer = true
        },
        move: function(values){
            var setter = {};
            setter[position.x] = values.offset.x;
            setter[position.y] = values.offset.y;
            ractive.set(setter)

            // console.log(values.offset, values.delta)

            // if(pointer) { return }

            // if(Math.abs(values.delta) < 2) {
            //     ractive.fire('stop')
            // }
        },
        release: function(){
            // pointer = false
            // ractive.fire('start')
        },
        end: function(){
            // ractive.fire('stop')
        }
    }

    var scroll = scroller(
        document,
        node,
        max,
        min || { x: 0, y: 0 },
        handler
    );
    console.log( 'start' );
    scroll.start();

    return {
        teardown: function(){
            if(scroll){
                scroll.stop()
            }
        }
    }
}



function scroller(listenOn, toScroll, max, min, handler){

    var offset, reference, pressed,
        velocity, frame, timestamp, ticker,
        amplitude, target, timeConstant;

    return {
        start: start,
        stop: stop
    }

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
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            var e = e.targetTouches[0];
        }

        return {
            x: e.clientX,
            y: e.clientY
        };
    }

    function scroll(pos) {

        offset = {
            x: (pos.x > min.x) ? min.x : (pos.x < -max.x) ? -max.x : pos.x,
            y: (pos.y > min.y) ? min.y : (pos.y < -max.y) ? -max.y : pos.y
        };

        handler.move({
            offset: offset
        })
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

                if (xlimit && ylimit){
                    handler.end(target);
                    return
                }
                requestAnimationFrame(autoScroll);
            } else {
                scroll(target);
                handler.end(target)
            }
        }
    }

    function tap(e) {
        pressed = true;
        reference = pos(e);
        console.log( reference );

        velocity = { x: 0, y: 0 };
        amplitude = { x: 0, y: 0 };
        frame = { x: offset.x, y: offset.y };

        timestamp = Date.now();
        clearInterval(ticker);
        ticker = setInterval(track, 30);

        handler.start()

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

        handler.release()

        clearInterval(ticker);
        if (velocity.x > 10 || velocity.x < -10  || velocity.y > 10 || velocity.y < -10) {

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
            handler.end(offset)
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

}
