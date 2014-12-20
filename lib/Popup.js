'use strict';
var React  = require('react')
  , $ = require('./util/dom');


var PopupContent = React.createClass({displayName: "PopupContent",
  render: function(){
    var Content = React.Children.only(this.props.children)

    Content.props.className = (Content.props.className || '') + ' rw-popup rw-widget';

    return Content
  }
})


module.exports = React.createClass({displayName: "exports",

	propTypes: {
    duration:       React.PropTypes.number,
    onRequestClose: React.PropTypes.func.isRequired,
    onClosing:      React.PropTypes.func,
    onOpening:      React.PropTypes.func,
    onClose:        React.PropTypes.func,
    onOpen:         React.PropTypes.func
	},

  getDefaultProps: function(){
    return {
      duration:    200,
      open:        false,
      onClosing:   function(){},
      onOpening:   function(){},
      onClose:     function(){},
      onOpen:      function(){},
    }
  },

	componentDidMount: function(){
    !this.props.open && this.close(0)
	},

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      contentChanged: childKey(nextProps.children) !== childKey(this.props.children)
    })
  },

  componentDidUpdate: function(pvProps, pvState){
    var closing =  pvProps.open && !this.props.open
      , opening = !pvProps.open && this.props.open;

    if (opening)      this.open()
    else if (closing) this.close()
  },

	render: function(){
    var $__0=      this.props,className=$__0.className,open=$__0.open,props=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{className:1,open:1})

		return (
      React.createElement("div", React.__spread({},  props, {className:  (className ||'') + " rw-popup-container"}), 
        React.createElement(PopupContent, {ref: "content"}, 
           this.props.children
        )
      )
		)
	},

  dimensions: function(){
    var el = this.getDOMNode();

    el.style.display = 'block'
    el.style.height  = $.height(this.refs.content.getDOMNode()) + 'px'
  },

  open: function(){
    var self = this
      , anim = this.getDOMNode()
      , el   = this.refs.content.getDOMNode();

    this.ORGINAL_POSITION = $.css(el, 'position')

    this._isOpening = true
    this.dimensions()
    this.props.onOpening()

    el.style.position = 'absolute'

    $.animate(el
      , { top: 0 }
      , self.props.duration
      , function(){
          if ( !self._isOpening ) return
          el.style.position = self.ORGINAL_POSITION
          anim.style.overflow = 'visible'
          self.ORGINAL_POSITION = null
          self.props.onOpen()
        })
  },

  close: function(dur){
    var self = this
      , el   = this.refs.content.getDOMNode()
      , anim = this.getDOMNode();

    this.ORGINAL_POSITION = $.css(el, 'position')

    this._isOpening = false
    this.dimensions()
    this.props.onClosing()

    anim.style.overflow = 'hidden'
    el.style.position = 'absolute'

    $.animate(el
      , { top: '-100%' }
      , dur === undefined ? this.props.duration : dur
      , function() {
          if ( self._isOpening ) return
          el.style.position = self.ORGINAL_POSITION

          anim.style.display = 'none'
          self.ORGINAL_POSITION = null
          self.props.onClose()
        })
  }

})


function childKey(children){
  var nextChildMapping = React.Children.map(children, function(c)  {return c;} );
  for(var key in nextChildMapping) return key
}