export default function stroll(node, property, max){

    var ractive = this,
        pointer = false,
        handler = {
            start: function(){
                // pointer = true
            },
            move: function(values){
                ractive.set(property, values.offset)

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
        handler
    );
    scroll.start();

    return {
        teardown: function(){
            if(scroll){
                scroll.stop()
            }
        }
    }
}



function scroller(listenOn, toScroll, max, handler){

    var min, offset, reference, pressed,
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

        offset = min = 0;
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

    function ypos(e) {
        // touch event
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientY;
        }

        // mouse event
        return e.clientY;
    }

    function scroll(y) {

        var delta = y-offset
        offset = (y > min) ? min : (y < -max) ? -max : y;
        handler.move({
            offset: offset,
            delta: delta
        })
    }

    function track() {
        var now, elapsed, delta, v;

        now = Date.now();
        elapsed = now - timestamp;
        timestamp = now;
        delta = offset - frame;
        frame = offset;

        v = 1000 * delta / (1 + elapsed);
        velocity = 0.8 * v + 0.2 * velocity;
    }

    function autoScroll() {
        var elapsed, delta;

        if (amplitude) {
            elapsed = Date.now() - timestamp;
            delta = -amplitude * Math.exp(-elapsed / timeConstant);
            if (delta > 0.5 || delta < -0.5) {
                scroll(target + delta);
                if (offset === min || offset === -max){
                    handler.end(target)
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
        reference = ypos(e);

        velocity = amplitude = 0;
        frame = offset;
        timestamp = Date.now();
        clearInterval(ticker);
        ticker = setInterval(track, 30);

        handler.start()

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function drag(e) {
        var y, delta;
        if (pressed) {
            y = ypos(e);
            delta = reference - y;
            if (delta > 2 || delta < -2) {
                reference = y;
                var mark = offset + delta
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
        if (velocity > 10 || velocity < -10) {
            amplitude = 0.8 * velocity;

            target = Math.round(offset + amplitude);
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
