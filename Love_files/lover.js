(function () {
    var canvas = $('#canvas');
    let wrap = $('#wrap');
    let min_height = window.innerHeight-20;
    let min_width = window.innerWidth;
    wrap.attr("style", `height:${min_height}px;width:${min_width}px`);
    
    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    var width = canvas.width();
    var height = canvas.height();

    canvas.attr("width", width);
    canvas.attr("height", height);
    let y = min_height - 680;
    let x = min_width/2 - 535;
    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(190, 26, 37)",
            scale: 2
        },
        branch: [
            [x+535, y+680, x+570, y+250, x+500, y+200, 30, 110, [
                [x+540, y+500, x+455, y+417, x+340, y+400, 13, 100, [
                    [x+450, y+435, x+434, y+430, x+394, y+395, 2, 40]
                ]],
                [x+550, y+445, x+600, y+356, x+680, y+345, 12, 100, [
                    [x+578, y+400, x+648, y+409, x+661, y+426, 3, 80]
                ]],
                [x+539, y+281, x+537, y+248, x+534, y+217, 3, 40],
                [x+546, y+397, x+413, y+247, x+328, y+244, 9, 80, [
                    [x+427, y+286, x+383, y+253, x+371, y+205, 2, 40],
                    [x+498, y+345, x+435, y+315, x+395, y+330, 4, 60]
                ]],
                [x+546, y+357, x+608, y+252, x+678, y+221, 6, 100, [
                    [x+590, y+293, x+646, y+277, x+648, y+271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: x+535, // 1080
            height: y+320, // 650
        },
        footer: {
            width: 1200,
            height: 5,
            speed: 10,
        }
    }

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;

    canvas.click(function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        if (seed.hover(x, y)) {
            hold = 0;
            canvas.unbind("click");
            canvas.unbind("mousemove");
            canvas.removeClass('hand');
            
        }
        let a = document.getElementById("media");
        console.log(a)
        a.play();
    }).mousemove(function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        canvas.toggleClass('hand', seed.hover(x, y));
    });

    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, height/400);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        tree.snapshot("p1", 0, 0, width, height);
        while (tree.move("p1", 150, 0)) {
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
        foot.draw();
        tree.snapshot("p2", 0, 0, width, height);

        // 会有闪烁不得意这样做, (＞﹏＜)
        canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
        canvas.css("background", "linear-gradient(top, rgb(230, 203, 235) 0%, #fab7c2 120%)");
        $await(Jscex.Async.sleep(300));
        canvas.css("background", "none");
    }));

    var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        while (true) {
            tree.ctx.clearRect(0, 0, width, height);
            tree.jump();
            foot.draw();
            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2020, 2, 22);
        together.setHours(23);
        together.setMinutes(59);
        together.setSeconds(59);
        together.setMilliseconds(0);
        console.log(together)
        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();

        $await(jumpAnimate());
    }));

    let get_device = function($window) {
        /**
         * 获取是否是手机的标识
         */
        console.log($window)
        let navigator_ = $window.navigator
        if(navigator_) var ua = navigator_['userAgent'] || navigator_['vendor'] || $window['opera'];
        let flag = (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        return flag;
    }
    if(get_device({"navigator":navigator})) {
        if(min_height > min_width) {
            let clock_box = $("#clock-box")
            clock_box.attr("style",`bottom:${min_height/2.2}px`)
            let code = $('#code')
            code.attr("style",`font-size:1.3em`)
        }
    }else{
        let clock_box = $("#clock-box")
        clock_box.attr("style",`bottom:${min_height/4}px`)
    }
    runAsync().start();
})();