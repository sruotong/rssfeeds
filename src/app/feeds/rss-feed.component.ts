import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscriber, Subscription } from 'rxjs';
import FeedState from './store/feeds.state';
import { Store, select } from '@ngrx/store';
import { FeedItem } from '../models/feed-item.model';
import { RssFeedService } from './rss-feed.service';

@Component({
    selector: 'app-rssfeed',
    templateUrl: './rss-feed.component.html',
    styleUrls: ['./rss-feed.component.css']
})
export class RssFeedComponent implements OnInit, OnDestroy {

    feedStateSubscription: Subscription;

    channels: Array<string>;
    feeds: Array<FeedItem>;

    constructor(
        private store: Store<{ feedState: FeedState }>,
        private rssFeedService: RssFeedService
    ) {
        this.feedStateSubscription = store.pipe(select('feedState')).subscribe((state) => {
            this.channels = state.Channels;
            this.feeds = state.Feeds;
            console.log('channels', this.channels);
            console.log('feeds', this.feeds);
        });
    }

    ngOnInit() {
        this.rssFeedService.getRssFeedsFromChannelList();
    }

    ngOnDestroy() {
        this.feedStateSubscription.unsubscribe();
    }

}
