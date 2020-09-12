import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import FeedState from './store/feeds.state';
import { Observable, Subscription, timer, concat } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import * as xml2js from "xml2js";
import { addFeed, deleteFeed } from './store/feeds.actions';
import { FeedItem } from '../models/feed-item.model';
import { FEED_STATUS } from './rss-feed.constants';
import { switchMap } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class RssFeedService {

    private channels: Array<string>;

    private feeds: Array<FeedItem>;

    private pullCycle$: Observable<number>;

    private cycleSubscription: Subscription;

    constructor(private store: Store<{ feedState: FeedState }>, private http: HttpClient) {
        store.select('feedState').subscribe((state) => {
            this.channels = state.Channels;
            this.feeds = state.Feeds;
        });

        this.pullCycle$ = timer(0, 60000);
    }

    getRssFeedsFromChannelList() {
        this.cycleSubscription = this.pullCycle$.pipe(
            switchMap(() => {
                return concat(...this.channels.map((channel) => {
                    return this.callRssUrls(channel)
                }))
            })
        ).subscribe(
            (data: HttpResponse<any>) => {
                this.parseRssXML(data);
            }, (error: HttpErrorResponse) => {
                console.error('Rss site response error!');
            }
        );
    }

    callRssUrls(channel: string): Observable<HttpResponse<any>> {
        return this.http
            .get<any>(`https://cors-anywhere.herokuapp.com/${channel}`, { observe: "body", responseType: "text" as "json" });
    }

    parseRssXML(data: HttpResponse<any>) {
        xml2js.parseString(data, (err, result: any) => {
            if (err !== null) {
                console.error('Failed to read xml file!');
            } else {
                this.updateFeeds(result);
            }
        });
    }

    updateFeeds(result: any) {
        let newLoads = result.rss.channel[0].item;
        let lastLoads = this.feeds.filter(f => f.status !== FEED_STATUS.DELETED && f.channel === result.rss.channel[0].link[0]);
        lastLoads.forEach(feed => {
            if (newLoads.map(f => f.link[0]).indexOf(feed.link) === -1) {
                this.store.dispatch(deleteFeed(feed));
            }
        });
        newLoads.forEach(feed => {
            if (lastLoads.map(f => f.link).indexOf(feed.link[0]) === -1) {
                this.store.dispatch(addFeed({ ...feed, description: feed.description[0], link: feed.link[0], pubDate: feed.pubDate[0], title: feed.title[0], channel: result.rss.channel[0].link[0] }));
            }
        });
    }

    unSubscribeCycle() {
        this.cycleSubscription.unsubscribe();
    }

    // basically for testing 
    getChannels(): Array<string> {
        return this.channels;
    }

    // basically for testing 
    getFeeds(): Array<FeedItem> {
        return this.feeds;
    }

    // basically for testing
    getPullCycle(): Observable<number> {
        return this.pullCycle$;
    }

    // basically for testing
    getCycleSubscription(): Subscription {
        return this.cycleSubscription;
    }

}
