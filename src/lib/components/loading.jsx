'use strict';

var React = require('react');

var messages = {
    mandatory: (function() {
        var listing = [
                'Loading...',
                'Sorry won\'t be much longer...',
                'Wow... we are taking a bit longer than usual...',
                'Oops, looks like an error occured :|'
            ];
        return {
            length: listing.length,
            process: function(next) {
                return listing[next];
            }
        };
    })(),
    normal: (function() {
        var init = 'Loading...';
        
        return {
            length: 2,
            process: function(next, props) {
                return next === 0 ? init : props.message;
            }
        };
    })()
};

module.exports = React.createClass({
    getDefaultProps: function() {
        return { mandatory: true };
    },
    getInitialState: function() {
        return { next: 0 };
    },
    render: function() {
        var text = this.state.strategy.process(this.state.next, this.props);

        return <div className="application-section-message">{text}</div>;
    },
    componentWillMount: function() {
        var strategy = this.props.mandatory ? messages.mandatory : messages.normal;
        
        this.setState({ strategy: strategy })
    },
    componentDidMount: function() {
        this._update();
    },
    _update: function() {
        var that = this,
            next = that.state.next;
        setTimeout(function() {
            if (that.isMounted() && ++next < that.state.strategy.length) {
                that.setState({ next: next });
                that._update();
            }
        }, 3000);
    }
});
