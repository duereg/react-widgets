'use strict';
var React   = require('react')
  , ReplaceTransitionGroup  = require('./ReplaceTransitionGroup.jsx')
  , _ = require('./util/_')
  , $  =  require('./util/dom');


var SlideChildGroup = React.createClass({

  propTypes: {
    direction: React.PropTypes.oneOf(['left', 'right'])
  },

  componentWillEnter: function(done) {
    var node  = this.getDOMNode()
      , width = $.width(node)
      , direction = this.props.direction;

    width = direction === 'left' ? width : -width

    this.ORGINAL_POSITION = node.style.position;
    
    $.css(node, { position: 'absolute', left: width + 'px' , top: 0 })

    $.animate(node, { left: 0 }, this.props.duration, () => {

        $.css(node, { 
          position:  this.ORGINAL_POSITION, 
          overflow: 'hidden'
        });

        this.ORGINAL_POSITION = null
        done && done()
      })
  },

  componentWillLeave: function(done) {
    var node  = this.getDOMNode()
      , width = $.width(node)
      , direction = this.props.direction;

    width = direction === 'left' ? -width : width

    this.ORGINAL_POSITION = node.style.position

    $.css(node, { position: 'absolute', top: 0, left: 0})

    $.animate(node, { left: width + 'px' }, this.props.duration, () => {
        $.css(node, { 
          position: this.ORGINAL_POSITION, 
          overflow: 'hidden'
        });

        this.ORGINAL_POSITION = null
        done && done()
      })
  },

  render: function() {
    return React.Children.only(this.props.children);
  }

})


module.exports = React.createClass({

  propTypes: {
    direction: React.PropTypes.oneOf(['left', 'right']),
    duration:  React.PropTypes.number
  },

  getDefaultProps: function(){
    return {
      direction: 'left',
      duration: 250
    }
  },

  _wrapChild: function(child, ref) {
    return (<SlideChildGroup key={child.key} ref={ref} direction={this.props.direction} duration={this.props.duration}>{child}</SlideChildGroup>)
  },

  render: function() {
    var { style, children, ...props } = this.props

    style = _.merge(style, { position: 'relative', overflow: 'hidden' })

    return (
      <ReplaceTransitionGroup 
        {...props}
        ref='container' 
        childFactory={this._wrapChild}
        style={style}
        component={'div'}>
        { children }
      </ReplaceTransitionGroup>)
  },

  isTransitioning: function(){
    return this.isMounted() && this.refs.container.isTransitioning()
  }
});

