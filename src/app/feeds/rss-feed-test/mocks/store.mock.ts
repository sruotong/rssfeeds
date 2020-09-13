import { of, Subject, BehaviorSubject } from "rxjs";

export class storeMock {

    // a behaviorsubject variable initialed with 0 feeds and 2 channels
    // and it should be readonly
    // setup value by next() function
    readonly aStateObj$: BehaviorSubject<any> = new BehaviorSubject<any>({ Feeds: [], Channels: ['http://feeds.bbci.co.uk/news/rss.xml', 'https://www.smh.com.au/rss/feed.xml'] });
    constructor() { }

    select() {
        return this.aStateObj$;
    }
    // a mock function of Store's dispatch
    dispatch(action: any) {
        // a actions of in the dispatch function
        // to determine the action type and call the matched fake function.
        if (action.type === '[FEED] - ADD FEED') {
            this.addFeedActionMock();
        } else if (action.type === '[FEED] - DELETE FEED') {
            this.deleteFeedActionMock(action.link);
        } else if (action.type === '[FEED] - ADD CHANNEL') {
            this.addChannelActionMock(action.channel);
        } else if (action.type === '[FEED] - DELETE CHANNEL') {
            this.deleteChannelActionMock(action.channel);
        }
    }

    // Start fake action functions
    // use jasmine's spyOn function for testing if the correct actions been called.
    // for example,             
    // spyOn(store, 'dispatch').and.callThrough();
    // spyOn(store, 'addFeedActionMock');
    // expect(store.addFeedActionMock).toHaveBeenCalledTimes(0);
    addFeedActionMock() { }

    deleteFeedActionMock(link: string) { }

    addChannelActionMock(channel: string) { }

    deleteChannelActionMock(channel: string) { }
    // End fake action functioins
}
