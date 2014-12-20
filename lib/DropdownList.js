'use strict';
var React            = require('react')
  , _                = require('./util/_')
  , $                = require('./util/dom')
  , cx               = require('./util/cx')
  , setter           = require('./util/stateSetter')
  , controlledInput  = require('./util/controlledInput')
  , CustomPropTypes  = require('./util/propTypes')
  , Popup            = require('./Popup')
  , List             = require('./List');

var propTypes = {
  //-- controlled props -----------
  value:          React.PropTypes.any,
  onChange:       React.PropTypes.func,
  open:           React.PropTypes.bool,
  onToggle:       React.PropTypes.func,
  //------------------------------------

  data:           React.PropTypes.array,
  valueField:     React.PropTypes.string,
  textField:      React.PropTypes.string,

  valueComponent: CustomPropTypes.elementType,
  itemComponent:  CustomPropTypes.elementType,

  onSelect:       React.PropTypes.func,
  
  busy:           React.PropTypes.bool,

  delay:          React.PropTypes.number,
  duration:       React.PropTypes.number, //popup

  disabled:       React.PropTypes.oneOfType([
                        React.PropTypes.bool,
                        React.PropTypes.oneOf(['disabled'])
                      ]),

  readOnly:       React.PropTypes.oneOfType([
                    React.PropTypes.bool,
                    React.PropTypes.oneOf(['readOnly'])
                  ]),

  messages:       React.PropTypes.shape({
    open:         React.PropTypes.string,
  })
};

var DropdownList = React.createClass({

  displayName: 'DropdownList',

  mixins: [
    require('./mixins/WidgetMixin'),
    require('./mixins/PureRenderMixin'),
    require('./mixins/TextSearchMixin'),
    require('./mixins/DataHelpersMixin'),
    require('./mixins/RtlParentContextMixin'),
    require('./mixins/DataIndexStateMixin')('focusedIndex'),
    require('./mixins/DataIndexStateMixin')('selectedIndex')
  ],

  propTypes: propTypes,

	getInitialState: function(){
    var initialIdx = this._dataIndexOf(this.props.data, this.props.value);

		return {
      selectedIndex: initialIdx,
      focusedIndex:  initialIdx === -1 ? 0 : initialIdx,
		}
	},

  getDefaultProps: function(){
    return {
      delay: 500,
      value: '',
      open: false,
      data: [],
      messages: {
        open: 'open dropdown'
      }
    }
  },

  componentWillReceiveProps: function(props){
    if ( _.isShallowEqual(props.value, this.props.value) )
      return

    var idx = this._dataIndexOf(props.data, props.value);

    this.setSelectedIndex(idx)
    this.setFocusedIndex(idx === -1 ? 0 : idx)
  },

	render: function(){
		var $__0=   _.omit(this.props, Object.keys(propTypes)),className=$__0.className,props=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{className:1})
      , ValueComponent = this.props.valueComponent
      , valueItem = this._dataItem( this._data(), this.props.value )
      , optID = this._id('_option');

		return (
			React.createElement("div", React.__spread({},  props, 
        {ref: "element", 
        onKeyDown: this._maybeHandle(this._keyDown), 
        onClick: this._maybeHandle(this.toggle), 
        onFocus: this._maybeHandle(this._focus.bind(null, true), true), 
        onBlur: this._focus.bind(null, false), 
        "aria-expanded":  this.props.open, 
        "aria-haspopup": true, 
        "aria-busy": !!this.props.busy, 
        "aria-activedescendent":  this.props.open ? optID : undefined, 
        "aria-disabled":  this.props.disabled, 
        "aria-readonly":  this.props.readOnly, 
        tabIndex: this.props.disabled ? '-1' : "0", 
        className: cx(className, {
          'rw-dropdownlist':   true,
          'rw-widget':          true,
          'rw-state-disabled':  this.props.disabled,
          'rw-state-readonly':  this.props.readOnly,
          'rw-state-focus':     this.state.focused,
          'rw-open':            this.props.open,
          'rw-rtl':             this.isRtl()
        })}), 

				React.createElement("span", {className: "rw-dropdownlist-picker rw-select rw-btn"}, 
					React.createElement("i", {className: "rw-i rw-i-caret-down" + (this.props.busy ? ' rw-loading' : "")}, 
            React.createElement("span", {className: "rw-sr"},  this.props.messages.open)
          )
				), 
        React.createElement("div", {className: "rw-input"}, 
           this.props.valueComponent
              ? React.createElement(ValueComponent, {item: valueItem})
              : this._dataText(valueItem)
          
        ), 
        React.createElement(Popup, {open: this.props.open, onRequestClose: this.close, duration: this.props.duration}, 
          React.createElement("div", null, 
            React.createElement(List, {ref: "list", 
              optID: optID, 
              "aria-hidden":  !this.props.open, 
              style: { maxHeight: 200, height: 'auto'}, 
              data: this.props.data, 
              initialVisibleItems: this.props.initialBufferSize, 
              itemHeight: 18, 
              selectedIndex: this.state.selectedIndex, 
              focusedIndex: this.state.focusedIndex, 
              textField: this.props.textField, 
              valueField: this.props.valueField, 
              listItem: this.props.itemComponent, 
              onSelect: this._maybeHandle(this._onSelect)})
          )
        )
			)
		)
	},

  setWidth: function() {
    var width = $.width(this.getDOMNode())
      , changed = width !== this.state.width;

    if ( changed )
      this.setState({ width: width })
  },

  _focus: function(focused){
    var self = this;

    clearTimeout(self.timer)
    self.timer = setTimeout(function(){

      if(focused) self.getDOMNode().focus()
      else        self.close()

      if( focused !== self.state.focused)
        self.setState({ focused: focused })

    }, 0)
  },

  _onSelect: function(data, idx, elem){
    this.close()
    this.notify('onSelect', data)
    this.change(data)
  },

  _keyDown: function(e){
    var self = this
      , key = e.key
      , alt = e.altKey
      , isOpen = this.props.open;

    if ( key === 'End' ) {
      if ( isOpen) this.setFocusedIndex(this._data().length - 1)
      else change(this._data().length - 1)
      e.preventDefault()
    }
    else if ( key === 'Home' ) {
      if ( isOpen) this.setFocusedIndex(0)
      else change(0)
      e.preventDefault()
    }
    else if ( key === 'Escape' && isOpen ) {
      this.close()
    }
    else if ( (key === 'Enter' || key === ' ') && isOpen ) {
      change(this.state.focusedIndex, true)
    }
    else if ( key === 'ArrowDown' ) {
      if ( alt )         this.open()
      else if ( isOpen ) this.setFocusedIndex(this.nextFocusedIndex())
      else               change(this.nextSelectedIndex())
      e.preventDefault()
    }
    else if ( key === 'ArrowUp' ) {
      if ( alt )         this.close()
      else if ( isOpen ) this.setFocusedIndex(this.prevFocusedIndex())
      else               change(this.prevSelectedIndex())
      e.preventDefault()
    }
    else
      this.search(
          String.fromCharCode(e.keyCode)
        , this._locate)

    function change(idx, fromList){
      var item = self._data()[idx];

      if (idx === -1 || self._data().length === 0)
        return

      if(fromList) 
        self.notify('onSelect', item)

      
      self.change(item)
    }
  },

  change: function(data){
    if ( !_.isShallowEqual(data, this.props.value) ) {
      this.notify('onChange', data)
      this.close()
    }
  },

  _locate: function(word){
    var key = this.props.open ? 'focusedIndex' : 'selectedIndex'
      , idx = this.findNextWordIndex(word, this.state[key])
      , setIndex = setter(key).bind(this);

    if ( idx !== -1)
      setIndex(idx)
  },

  _data: function(){
    return this.props.data
  },

  open: function(){
    this.notify('onToggle', true)
  },

  close: function(){
    this.notify('onToggle', false)
  },

  toggle: function(e){
    this.props.open
      ? this.close()
      : this.open()
  }

})


module.exports = controlledInput.createControlledClass(
    DropdownList, { open: 'onToggle', value: 'onChange' });

module.exports.BaseDropdownList = DropdownList