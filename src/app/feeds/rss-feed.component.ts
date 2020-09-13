import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import FeedState from './store/feeds.state';
import { Store } from '@ngrx/store';
import { FeedItem } from '../models/feed-item.model';
import { RssFeedService } from './rss-feed.service';
import * as moment from 'moment';
import { FEED_STATUS } from './rss-feed.constants';
import { addChannel, deleteChannel } from './store/feeds.actions';

@Component({
    selector: 'app-rssfeed',
    templateUrl: './rss-feed.component.html',
    styleUrls: ['./rss-feed.component.css']
})
export class RssFeedComponent implements OnInit, OnDestroy {
    // a subscription property for later unsubscribe when component destroyed
    feedStateSubscription: Subscription;

    // start properties from states
    // channels for a list of the rss sites' url
    channels: Array<string>;
    // feeds for a list of the latest feeds
    feeds: Array<FeedItem>;
    // feed logs for a list of the feeds activities
    feedLogs: Array<FeedItem>;
    // end properties from states

    // 'display component with'
    // this component display play with three different types;
    // @opt CHANNEL_LIST, display the channel list, add/delete button and input field
    // @opt FEED_LIST, display the lastest feeds from subscribed channels
    // @opt FEED_LOGS, display the history of the feeds, will show the status and update time for each feed
    disCompWith: "CHANNEL_LIST" | "FEED_LIST" | "FEED_LOGS";

    // a property for a new channel url
    // two way binded for catching user input value
    newChannel: string;

    constructor(
        private store: Store<{ feedState: FeedState }>,
        private rssFeedService: RssFeedService
    ) {
        // start to subscribe store states
        this.feedStateSubscription = this.store.select('feedState').subscribe((state) => {
            this.channels = state.Channels;
            // if the feeds status is not in the latest feeds list, should not exist in feeds list
            // sort the feeds list by pulished date
            // because state is readonly field, and sort will re-write the original array
            // slice can make a copy of the original array
            this.feeds = state.Feeds.filter(f => f.status != FEED_STATUS.DELETED).slice().sort((a, b) => moment.utc(b.pubDate).diff(moment.utc(a.pubDate)));
            // feedlogs have all feeds
            // and sorted by update time( not publish time)
            // update time is recorded when feed status changed
            // update time is recorded by reducer
            this.feedLogs = state.Feeds.slice().sort((a, b) => b.updateTime.diff(a.updateTime));
        });
    }

    ngOnInit() {
        // init new channel input box as empty.
        this.newChannel = '';

        // default view should be feed list
        this.disCompWith = 'FEED_LIST';

        // start to getting rss feeds
        // as the component initialed, should start to pull data from channels
        this.rssFeedService.getRssFeedsFromChannelList();
    }

    ngOnDestroy() {
        this.feedStateSubscription.unsubscribe();
        this.rssFeedService.unSubscribeCycle();
    }

    onAddingNewChannel() {
        // if the input string is empty, should not add to list
        // because should not listen on an empty url
        // or if the input string is already exist in the list, should not add
        // because should not listen on an url more then 1 time
        if (this.newChannel === '' || this.channels.indexOf(this.newChannel) !== -1) {
            return;
        }

        // if the url is valid, add to state's url listening list
        this.store.dispatch(addChannel({ channel: this.newChannel }));

        // reset new channel input to an empty string
        // for user to input another url
        this.newChannel = '';
    }

    onRemovingChannel(index: number) {
        this.store.dispatch(deleteChannel({ channel: this.channels[index] }));
    }

}
