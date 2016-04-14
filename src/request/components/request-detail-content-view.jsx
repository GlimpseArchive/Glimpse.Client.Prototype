'use strict';

var React = require('react');
var EmitterMixin = require('lib/components/emitter-mixin');
var Loading = require('lib/components/loading');
var NavigationItem = require('./request-detail-content-navigation-item-view');
var PanelItem = require('./request-detail-content-panel-item-view');

module.exports = React.createClass({
    mixins: [ EmitterMixin ],
    componentDidMount: function () {
        this.addListener('shell.request.detail.focus.changed', this._detailTabChanged);
    },
    getInitialState: function () {
        return {
            active: null
        };
    },
    render: function () {
        var request = this.props.request;
        var tabs = this.props.tabs;
        if (request && tabs) {
            var active = this.state.active;
            var navigation = [];
            var panel = null;
    
            for (var key in tabs) {
                var tab = tabs[key];
                var isActive = active == key || (!active && navigation.length == 0);
    
                navigation.push(<NavigationItem key={key} tab={tab} isActive={isActive} />);
                if (isActive) {
                    panel = <PanelItem key={key} request={request} tab={tab} isActive={isActive} />;
                }
            }
    
            return (
                <div className="request-detail-group-item">
                    <div className="nav-bar nav-bar-center">
                        <ul className="nav nav-tabs">
                            {navigation}
                        </ul>
                    </div> 
                    {panel}
                </div>
            );
        }
        else {
            return <Loading />;
        }
    },
    _detailTabChanged: function (payload) {
        this.setState({ active: payload.tab });
    }
});
