//YUI.add('event-fastclick', function(Y) {

  var
    FASTCLICK = "fastclick",
    
    isTouch = "ontouchstart" in Y.config.win && !Y.UA.chrome,
    
    EVT_START = isTouch ? "touchstart" : "mousedown",
    EVT_MOVE = isTouch ? "touchmove" : "mousemove",
    EVT_END = isTouch ? "touchend" : "mouseup",
    
    THRESHOLD = 10, // pixel radius
    
    _START_EVENT = "_fcse",
    
    _FASTCLICK_START_HANDLE = "_fcsh",
    _FASTCLICK_MOVE_HANDLE  = "_fcmh",
    _FASTCLICK_END_HANDLE   = "_fceh";
  
  Y.Event.define("fastclick", {

    on: function (node, subscriber, notifier, filter) {
      
      subscriber[_FASTCLICK_START_HANDLE] = filter ?
        node.delegate(EVT_START, this._onstart, filter, this, subscriber, notifier)
        :
        node.on(EVT_START,       this._onstart,         this, subscriber, notifier);
    },

    detach: function (node, subscriber, notifier) {
      var startHandle = subscriber[_MOVE_START_HANDLE];

      if (startHandle) {
          startHandle.detach();
          subscriber[_MOVE_START_HANDLE] = null;
      }
    },

    delegate: function () {
        this.on.apply(this, arguments);
    },

    detachDelegate: function () {
        this.detach.apply(this, arguments);
    },
    
    processArgs: function(argArray, fromDelegate){
      
      var standardLength = fromDelegate ? 4 : 3;
      var extra = {};
      
      if (argArray.length > standardLength) {
        extra = argArray[standardLength];
        argArray.splice(standardLength);
      }
      
      return extra;
    },
    
    _onstart: function(evt, subscriber, notifier){
      
      var
        config = subscriber._extra,
        touchClass = config.touchClass;
        preventDefault = config.preventDefault;
        
      if (isTouch && evt.touches.length != 1) {
        return;
      }
      
      if (preventDefault) {
        evt.preventDefault();
      }
      
      if (touchClass) {
        evt.currentTarget.addClass(touchClass);
      }
      
      subscriber[_START_EVENT] = evt;
      
      subscriber[_FASTCLICK_MOVE_HANDLE] = Y.one('body').on(EVT_MOVE,
        this._onmove,
        this,
        subscriber, notifier
      );
      
      subscriber[_FASTCLICK_END_HANDLE]  = Y.one('body').on(EVT_END,
        this._onend,
        this,
        subscriber, notifier
      );
    },
    
    _onmove: function(evt, subscriber, notifier){
      
      var
        start = subscriber[_START_EVENT],
        deltaX,
        deltaY;
      
      if (isTouch) {
        start = start.touches[0];
        evt = evt.touches[0];
      }
      
      deltaX = evt.pageX-start.pageX,
      deltaY = evt.pageY-start.pageY
      
      if (deltaX*deltaX + deltaY*deltaY > THRESHOLD*THRESHOLD) {
        this._cancel(subscriber);
      }
    },
  
    _onend: function(evt, subscriber, notifier){
      evt = subscriber[_START_EVENT];
      evt.type = FASTCLICK;
      notifier.fire(evt);
      this._cancel(subscriber);
    },
    
    _cancel: function(subscriber){
      var touchClass = subscriber._extra.touchClass;
      
      if (touchClass) {
        subscriber[_START_EVENT].currentTarget.removeClass(touchClass);
      }
      subscriber[_START_EVENT] = null;
      subscriber[_FASTCLICK_MOVE_HANDLE].detach();
      subscriber[_FASTCLICK_END_HANDLE].detach();
    }
  
  });

//}, '0.1' ,{requires:['event-synthetic']});