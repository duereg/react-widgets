'use strict';
var React      = require('react')
  , cx         = require('./util/cx')
  , dates      = require('./util/dates')
  , directions = require('./util/constants').directions
  , Btn        = require('./WidgetButton')
  , _          = require('./util/_'); //omit

var opposite = {
  LEFT:  directions.RIGHT,
  RIGHT: directions.LEFT
};


module.exports = React.createClass({

  displayName: 'CenturyView',

  mixins: [
    require('./mixins/WidgetMixin'),
    require('./mixins/PureRenderMixin'),
    require('./mixins/RtlChildContextMixin'),
    require('./mixins/DateFocusMixin')('century', 'decade')
  ],

  propTypes: {
    value:         React.PropTypes.instanceOf(Date),
    min:          React.PropTypes.instanceOf(Date),
    max:          React.PropTypes.instanceOf(Date),

    onChange:     React.PropTypes.func.isRequired
  },

  render: function(){
    var props = _.omit(this.props,  ['max', 'min', 'value', 'onChange'])
      , years = getCenturyDecades(this.props.value)
      , rows  = _.chunk(years, 4);

    return (
      React.createElement("table", React.__spread({},  props, 
        {tabIndex: this.props.disabled ? '-1' : "0", 
        role: "grid", 
        className: "rw-calendar-grid rw-nav-view", 
        "aria-activedescendant": this._id('_selected_item'), 
        onKeyUp: this._keyUp}), 
        React.createElement("tbody", null, 
           rows.map(this._row)
        )
      )
    )
  },

  _row: function(row, i){
    var id = this._id('_selected_item')

    return (
      React.createElement("tr", {key: 'row_' + i}, 
       row.map( function(date, i)  {
        var focused  = dates.eq(date,  this.state.focusedDate,  'decade')
          , selected = dates.eq(date, this.props.value,  'decade')
          , d        = inRangeDate(date, this.props.min, this.props.max);

        return !inRange(date, this.props.min, this.props.max)
          ? React.createElement("td", {key: i, className: "rw-empty-cell"}, " ")
          : (React.createElement("td", {key: i}, 
              React.createElement(Btn, {onClick: this.props.onChange.bind(null, d), 
                tabIndex: "-1", 
                id:  focused ? id : undefined, 
                "aria-selected": selected, 
                "aria-disabled": this.props.disabled, 
                disabled: this.props.disabled, 
                className: cx({
                  'rw-off-range':       !inCentury(date, this.props.value),
                  'rw-state-focus':     focused,
                  'rw-state-selected':  selected,
                 })}, 
                 label(date) 
              )
            ))
      }.bind(this))
    ))
  },


  move: function(date, direction){
    var min = this.props.min
      , max = this.props.max;

    if ( this.isRtl() && opposite[direction])
      direction =  opposite[direction]

    if ( direction === directions.LEFT)
      date = nextDate(date, -1, 'decade', min, max)

    else if ( direction === directions.RIGHT)
      date = nextDate(date, 1, 'decade', min, max)

    else if ( direction === directions.UP)
      date = nextDate(date, -4, 'decade', min, max)

    else if ( direction === directions.DOWN)
      date = nextDate(date, 4, 'decade', min, max)

    return date
  }

});

function label(date){
  return dates.format(dates.startOf(date, 'decade'),    dates.formats.YEAR)
    + ' - ' + dates.format(dates.endOf(date, 'decade'), dates.formats.YEAR)
}

function inRangeDate(decade, min, max){
  return dates.max( dates.min(decade, max), min)
}

function inRange(decade, min, max){
  return dates.gte(decade, dates.startOf(min, 'decade'), 'year')
      && dates.lte(decade, dates.endOf(max, 'decade'),  'year')
}

function inCentury(date, start){
  return dates.gte(date, dates.startOf(start, 'century'), 'year')
      && dates.lte(date, dates.endOf(start, 'century'),  'year')
}

function getCenturyDecades(_date){
  var days = [1,2,3,4,5,6,7,8,9,10,11,12]
    , date = dates.add(dates.startOf(_date, 'century'), -20, 'year')

  return days.map( function(i)  {return date = dates.add(date, 10, 'year');})
}


function nextDate(date, val, unit, min, max){
  var newDate = dates.add(date, val, unit)
  return dates.inRange(newDate, min, max, 'decade') ? newDate : date
}
