import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import FeedState from './store/feeds.state';
import { Observable, Subscription, timer, concat } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import * as xml2js from "xml2js";
import { addFeed, deleteFeed } from './store/feeds.actions';
import { FeedItem } from '../models/feed-item.model';
import { FEED_STATUS } from './rss-feed.constants';
import { switchMap, map } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class RssFeedService {
    // start properties from states
    private channels: Array<string>;
    private feeds: Array<FeedItem>;
    // end properties from states

    // an observable for calling rss url every a period
    private pullCycle$: Observable<number>;

    // a subscription property for unsuscribed when needed.
    private cycleSubscription: Subscription;

    constructor(private store: Store<{ feedState: FeedState }>, private http: HttpClient) {
        store.select('feedState').subscribe((state) => {
            this.channels = state.Channels;
            this.feeds = state.Feeds;
        });
        // the cycle start with 0 seconds delay
        // then will emit every 60 seconds
        this.pullCycle$ = timer(0, 60000);
    }

    getRssFeedsFromChannelList() {
        this.cycleSubscription = this.pullCycle$.pipe(
            // because we don't use value from timer
            // use switchmap to subscribe on rss url response
            switchMap(() => {
                // use concat to sub rss url one by one
                return concat(...this.channels.map((channel) => {
                    // call rss urls function returns a http response observable
                    return this.callRssUrls(channel)
                }))
            })
        ).subscribe(
            (response: any) => {
                this.parseRssXML(response);
            }, (error: HttpErrorResponse) => {
                console.error('Rss site response error!');
            }
        );
    }

    callRssUrls(channel: string): Observable<any> {
        // to fix some cors issue, added a cors-anywhere.herokuapp.com before all the links
        return this.http
            .get<any>(`https://cors-anywhere.herokuapp.com/${channel}`, { observe: "body", responseType: "text" as "json" }).pipe(
                map((f: any) => { return { data: f, url: channel }; })
            );
    }

    parseRssXML(response: any) {
        xml2js.parseString(response.data, (err, result: any) => {
            if (err !== null) {
                console.error('Failed to read xml file!');
            } else {
                this.updateFeeds(response.url, result);
            }
        });
    }

    updateFeeds(rssUrl: string, result: any) {
        let newLoads = result.rss.channel[0].item;
        let lastLoads = this.feeds.filter(f => f.status !== FEED_STATUS.DELETED && f.channel === result.rss.channel[0].link[0]);

        // if the old feed is not exist in the incomming feed list
        // update its status to deleted.
        lastLoads.forEach(feed => {
            if (newLoads.map(f => f.link[0]).indexOf(feed.link) === -1) {
                this.store.dispatch(deleteFeed(feed));
            }
        });

        // if the incomming feed is not exist in the feeds list
        // add it to the feeds list
        newLoads.forEach(feed => {
            if (lastLoads.map(f => f.link).indexOf(feed.link[0]) === -1) {
                this.store.dispatch(addFeed({ ...feed, description: feed.description[0], link: feed.link[0], pubDate: feed.pubDate[0], title: feed.title[0], channel: result.rss.channel[0].link[0], rssUrl: rssUrl }));
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
