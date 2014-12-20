'use strict';
var React = require('react')
  , cx = require('./util/cx')
  , dates = require('./util/dates');

module.exports = React.createClass({

  displayName: 'DatePickerInput',


  propTypes: {
    format:       React.PropTypes.string,
    parse:        React.PropTypes.func.isRequired,

    value:        React.PropTypes.instanceOf(Date),
    onChange:     React.PropTypes.func.isRequired,
  },

  getDefaultProps: function(){
    return {
      textValue: ''
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      textValue: formatDate(
            nextProps.value
          , nextProps.editing && nextProps.editFormat 
              ? nextProps.editFormat 
              : nextProps.format)
    })
  },

  getInitialState: function(){
    var text = formatDate(
            this.props.value
          , this.props.editing && this.props.editFormat 
              ? this.props.editFormat 
              : this.props.format)

    this.lastValue = text
    return {
      textValue: text
    }
  },

  render: function(){
    var value = this.state.textValue

    return (
      React.createElement("input", React.__spread({},  
        this.props, 
        {type: "text", 
        className: cx({'rw-input': true }), 
        value: value, 
        "aria-disabled": this.props.disabled, 
        "aria-readonly": this.props.readOnly, 
        disabled: this.props.disabled, 
        readOnly: this.props.readOnly, 
        onChange: this._change, 
        onBlur: chain(this.props.blur, this._blur, this)}))
    )
  },

  _change: function(e){
    this.setState({ textValue: e.target.value });
  },

  _blur: function(e){
    var val = e.target.value 
    
    //console.log('blur', val, e.target, '\nlast', this.lastValue)

    if ( val === this.lastValue) return

    this.lastValue = val;
    this.props.onChange(this.props.parse(val), val);
    
  },

  focus: function(){
    this.getDOMNode().focus()
  }

});

function isValid(d) {
  return !isNaN(d.getTime());
}

function formatDate(date, format){
  var val = ''

  if ( (date instanceof Date) && isValid(date) )
    val = dates.format(date, format)

  return val;
}

function chain(a,b, thisArg){
  return function(){
    a && a.apply(thisArg, arguments)
    b && b.apply(thisArg, arguments)
  }
}