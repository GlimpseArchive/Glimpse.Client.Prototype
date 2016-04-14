'use strict';

/*tslint:disable:no-var-requires */
const messageProcessor = require('../util/request-message-processor');
/*tslint:enable:no-var-requires */

import _ = require('lodash');
import React = require('react');

const getPayloads = (function() {
    const getItem = messageProcessor.getTypePayloadItem;

    const options = {
        'web-response': getItem,
        'web-request': getItem
    };

    return function(request) {
        return messageProcessor.getTypeStucture(request, options);
    };
})();

interface IRequestUrlProps {
    url: string;
}

class RequestUrl extends React.Component<IRequestUrlProps, {}> {
    public render() {
        return (
            <div>
                <div className='tab-section tab-section-execution-url'>
                    <div className='flex flex-row flex-inherit tab-section-header'>
                        <div className='tab-title col-10'>Url</div>
                    </div>
                    <div>{this.props.url}</div>
                </div>
            </div>
        );
    }
}

interface IRequestHeadersProps {
    headers: { [key: string]: string };
    title: string;
}

class RequestHeaders extends React.Component<IRequestHeadersProps, {}> {
    public render() {
        return (
            <div>
                <div className='tab-section tab-section-execution-headers'>
                    <div className='flex flex-row flex-inherit tab-section-header'>
                        <div className='tab-title col-10'>{this.props.title}</div>
                    </div>
                    <div className='tab-section-listing'>
                        {_.map(this.props.headers, function(value, key) {
                            return (<section className='flex flex-row'>
                                    <div className='col-2'>{key}</div>
                                    <div className='col-8'>{value}</div>
                                </section>);
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export interface IRequestProps {
    request;
}

export class Request extends React.Component<IRequestProps, {}> {
    public getInitialState() {
        return { checkedState: false };
    }

    public render() {
        const request = this.props.request;

        // get payloads 
        const payload = getPayloads(request);
        const webRequestPayload = payload.webRequest;
        const webResponsePayload = payload.webResponse;

        let content;
        if (webRequestPayload && webResponsePayload) {
            content = (
                <div className='tab-content'>
                    <div className='tab-section text-minor'>Web Request/Response</div>
                    <RequestUrl url={webRequestPayload.url} />
                    <RequestHeaders title='Request Headers' headers={webRequestPayload.headers} />
                    <RequestHeaders title='Response Headers' headers={webResponsePayload.headers} />
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }
}
