import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import FeedState from './store/feeds.state';
import { Observable, interval, Subscription, timer } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import * as xml2js from "xml2js";
import { addFeed, deleteFeed } from './store/feeds.actions';
import { FeedItem } from '../models/feed-item.model';
import { FEED_STATUS } from './rss-feed.constants';

@Injectable({ providedIn: 'root' })
export class RssFeedService {

    private channels: Array<string>;

    private feeds: Array<FeedItem>;

    private pullCycle$: Observable<number>;

    private cycleSubscription: Subscription;

    constructor(private store: Store<{ feedState: FeedState }>, private http: HttpClient) {
        store.pipe(select('feedState')).subscribe((state) => {
            this.channels = state.Channels;
            this.feeds = state.Feeds;
        });

        this.pullCycle$ = timer(1000, 300000);
    }

    getRssFeedsFromChannelList() {
        // subscribe the pullCycles
        // every 5 minutes 
        this.cycleSubscription = this.pullCycle$.subscribe((val) => {
            console.log(`pulled rss feed ${val+1} times.`);
            this.channels.forEach((channel: string) => {
                this.http
                    .get<any>(`https://cors-anywhere.herokuapp.com/${channel}`, { observe: "body", responseType: "text" as "json" })
                    .subscribe(
                        (data: HttpResponse<any>) => {
                            let parseString = xml2js.parseString;
                            parseString(data, (err, result: any) => {
                                console.log(err);
                                console.dir(result.rss.channel[0].item);
                                let newLoads = result.rss.channel[0].item;
                                let lastLoads = this.feeds.filter(f => f.status !== FEED_STATUS.DELETED && f.channel === result.rss.channel[0].link[0]);

                                lastLoads.forEach(feed => {
                                    if (newLoads.map(f => f.link[0]).indexOf(feed.link[0]) === -1) {
                                        this.store.dispatch(deleteFeed(feed));
                                    }
                                });

                                newLoads.forEach(feed => {
                                    if (lastLoads.map(f => f.link[0]).indexOf(feed.link[0]) === -1) {
                                        this.store.dispatch(addFeed({ ...feed, channel: result.rss.channel[0].link[0] }));
                                    }
                                });
                            });
                            console.log(channel);
                        }, (error: HttpErrorResponse) => {
                            console.log(error);
                        }
                    );
            });
        });
    }

    unSubscribeCycle() {
        this.cycleSubscription.unsubscribe();
    }

}
