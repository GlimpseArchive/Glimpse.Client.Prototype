
'use strict';

/* tslint:disable:no-var-requires */
const appInsights = require('applicationinsights-js').AppInsights;
const glimpse = require('glimpse');
const metadataRepository = require('../shell/repository/metadata-repository');
const request = require('superagent');
/* tslint:enable:no-var-requires */

import moment = require('moment');
import * as uuid from 'node-uuid';

interface ITelemetryEvent {
    name: string;
    properties: { [key: string]: string; }; // map string->string
    measurements: { [key: string]: number; }; // map string->number
}

class TelemetryClient {

    private lastEventTime: moment.Moment;
    private sessionId: string;
    private telemetryConfig: Object;
    private isTelemetryEnabled = true;

    // we'll queue telemetry events until the telemetry config is downloaded and app insights is configured.  
    private eventQueue: ITelemetryEvent[] = [];

    constructor() {
        this.sessionId = uuid.v4();
        const self = this;
        metadataRepository.registerListener((metadata) => {

            if (!metadata.resources || !metadata.resources['telemetry-config']) {
                self.isTelemetryEnabled = false;
            }
            else {
                const uri = metadata.resources['telemetry-config'];
                // look up telemetry config
                request
                    .get(uri.template)
                    .accept('application/json')
                    .end(function (err, res) {
                        if (err) {
                            console.error('Glimpse telemetry config could not be obtained.');
                        }
                        else {
                            self.telemetryConfig = res.body;
                            self.configure(self.telemetryConfig);
                        }
                    });
            }
        });
    }

    /**
     * configure telemetry client
     */
    private configure(telemetryConfig) {
        this.isTelemetryEnabled = (telemetryConfig && telemetryConfig.enabled) ? telemetryConfig.enabled : false;
        if (!this.isTelemetryEnabled) {
            // shouldn't need this any longer
            this.eventQueue = undefined;
        }
        else {

            /* Call downloadAndSetup to download full ApplicationInsights script from CDN and initialize it with instrumentation key */
            appInsights.downloadAndSetup({
                instrumentationKey: telemetryConfig.instrumentationKey,
                endpointUrl: telemetryConfig.uri,
                emitLineDelimitedJson: true
            });

            // Add telemetry initializer to enable user tracking
            // TODO:  verify this works 
            appInsights.queue.push(function () {
                appInsights.context.addTelemetryInitializer(function (envelope) {
                    if (window.navigator && window.navigator.userAgent) {
                        envelope.tags['ai.user.userAgent'] = window.navigator.userAgent;
                    }
                });
            });

            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                appInsights.trackEvent(event.name, event.properties, event.measurements);
            }
        }
    }

    /**
     * send an event (if app insights is currently configured, or queue it for sending later if app insights is configured.
     */
    private queueOrSendEvent(name: string, properties: { [key: string]: string; }, measurements: { [key: string]: number; }) {
        if (this.isTelemetryEnabled) {
            if (!this.telemetryConfig ) {
               this.eventQueue.push({ name, properties, measurements});
            }
            else {
                appInsights.trackEvent(name, properties, measurements);
            }
        }
    }

    /**
     * returns the time in milliseconds since the lastEventtime, and updates lastEventTime. 
     */
    private markTimer() {
        const nextEventTime = moment();
        let elapsed = undefined;
        if (this.lastEventTime) {
            elapsed = nextEventTime.diff(this.lastEventTime);
        }
        this.lastEventTime = nextEventTime;
        return elapsed;
    }

    private getDefaultProperties(): { [key: string]: string; } {
        return { sessionId: this.sessionId };
    }

    public registerListeners() {

        glimpse.on('shell.ready', () => {
            // telemetry sent when client UI is first opened
            this.markTimer();
            const properties = this.getDefaultProperties();
            const measurements: { [key: string]: number; } = {};
            this.queueOrSendEvent('ShellReady', properties, measurements);
        });

        glimpse.on('shell.request.summary.selected', (payload) => {
            // telemetry sent when a request detail is selected
            const elapsedMillis = this.markTimer();
            const properties = this.getDefaultProperties();
            /*tslint:disable:no-string-literal */
            properties['requestId'] = payload.requestId;
            /*tslint:enable:no-string-literal */
            const measurements: { [key: string]: number; } = { viewTimeMilliseconds: elapsedMillis };
            this.queueOrSendEvent('RequestDetailSelected', properties, measurements);
        });

        glimpse.on('shell.request.detail.closed', () => {
            // telemetry sent when a request detail is closed
            const elapsedMillis = this.markTimer();
            const properties = this.getDefaultProperties();
            const measurements: { [key: string]: number; } = { viewTimeMilliseconds: elapsedMillis };
            this.queueOrSendEvent('RequestDetailClosed', properties, measurements);
        });

        glimpse.on('shell.request.detail.focus.changed', (payload) => {
            // telemetry sent when a tab changes in a request detail page
            const elapsedMillis = this.markTimer();
            const properties = this.getDefaultProperties();
            /*tslint:disable:no-string-literal */
            properties['tabName'] = payload.tab;
            /*tslint:enable:no-string-literal */
            const measurements: { [key: string]: number; } = { viewTimeMilliseconds: elapsedMillis };
            this.queueOrSendEvent('RequestDetailTabChanged', properties, measurements);
        });
    }
}

let telemetryClient = new TelemetryClient();
export default telemetryClient;
