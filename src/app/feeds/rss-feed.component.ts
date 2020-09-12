import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscriber, Subscription } from 'rxjs';
import FeedState from './store/feeds.state';
import { Store, select } from '@ngrx/store';
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

    feedStateSubscription: Subscription;

    channels: Array<string>;
    feeds: Array<FeedItem>;
    feedLogs: Array<FeedItem>;

    disCompWith: "CHANNEL_LIST" | "FEED_LIST" | "FEED_LOGS";

    newChannel: string;

    constructor(
        private store: Store<{ feedState: FeedState }>,
        private rssFeedService: RssFeedService
    ) { }

    ngOnInit() {
        this.feedStateSubscription = this.store.select('feedState').subscribe((state) => {
            this.channels = state.Channels;
            this.feeds = state.Feeds.filter(f => f.status != FEED_STATUS.DELETED).slice().sort((a, b) => moment.utc(b.pubDate).diff(moment.utc(a.pubDate)));
            this.feedLogs = state.Feeds.slice().sort((a, b) => b.updateTime.diff(a.updateTime));
        });
        this.newChannel = '';
        this.disCompWith = 'FEED_LIST';
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

        // if the url is valid, add to state's url listing list
        this.store.dispatch(addChannel({ channel: this.newChannel }));

        // reset new channel input to an empty string
        // for user to input another url
        this.newChannel = '';
    }

    onRemovingChannel(index: number) {
        this.store.dispatch(deleteChannel({ channel: this.channels[index] }));
    }

}
