(function(root, undefined){
    if(root.MomentumScroller) { 
        if( root.console && root.console.log ) {
            console.log("MomentumScroller is already defined on the global object");
        }
        return;
    }

    var MomentumScroller = function(args) {
        var argList, i, that;

        that = this;

        // Assign arguments into the object
        argList = ["target", "friction", "smoothing"];
        for(i = 0; i < argList.length; i++) {
            if(typeof args[argList[i]] !== "undefined") {
                this[argList[i]] = args[argList[i]];
            }
        }

        // Calculate the FPS
        if(typeof args.fps !== "undefined") {
            this.delay = 1/args.fps;
        } else {
            this.delay = 1/30;
        }

        // Flag indicating whether a drag is in progress
        this.dragging = false;

        // List of last n move events
        this.lastMoves = [];

        // Bind mousedown event
        root.onmousedown = function(event) {
            event.preventDefault();
            that.dragging = true;
        };

        // Bind mouseup event
        root.onmouseup = function(event) {
            var sum, avg, i;

            // Disable dragging flag
            that.dragging = false;

            // Get the average velocity for last n moves
            for(sum = i = 0; i < that.lastMoves.length; i++) {
                sum += that.lastMoves[i];
            }

            avg = sum / that.lastMoves.length;

            // Begin the momentum scroll
            that.momentumScroll(avg);

            // Reset the lastMoves array
            that.lastMoves = [0]
        };

        // Bind the mouse move function
        root.onmousemove = function(event) {
            var dx, $window;
            if(that.dragging) {
                dx = event.clientX - that.prevMouseX;

                // Save the last n moves for smoothing
                that.lastMoves.push(dx);
                if(that.lastMoves.length === that.smoothing) {
                    that.lastMoves.shift();
                }
                $window = $(window);
                $window.scrollLeft($window.scrollLeft() - dx);
            }

            that.prevMouseX = event.clientX;
        };
    };


    MomentumScroller.prototype.momentumScroll = function(velocity) {
        var that = this, prevScrollLeft = 0, $window;

        // Reduce velocity by the friction coefficient
        velocity *= this.friction;

        // If velocity is less than 1 or we have started a drag operation, then
        // stop animating
        if(Math.abs(velocity) < 1 || this.dragging) {
            return;
        }

        // Otherwise, go ahead with the animation step
        $window = $(window);

        // Keep track of previous scroll position
        prevScrollLeft = $window.scrollLeft();

        // Adjust the scroll position
        $window.scrollLeft($window.scrollLeft() - velocity);

        // If scroll has actually changed, we didn't hit the edge so keep
        // going
        if($window.scrollLeft() !== prevScrollLeft) {
            setTimeout(function(){
                that.momentumScroll(velocity);
            }, this.delay);
        }
    };

    // Export to the root object
    root.MomentumScroller = MomentumScroller;

})(window);
