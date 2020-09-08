import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import FeedState from './store/feeds.state';
import { Observable, interval, Subscription, timer } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import * as xml2js from "xml2js";
import { addFeed } from './store/feeds.actions';

@Injectable({ providedIn: 'root' })
export class RssFeedService {

    private channels: Array<string>;

    private pullCycle$: Observable<number>;

    private cycleSubscription: Subscription;

    constructor(private store: Store<{ feedState: FeedState }>, private http: HttpClient) {
        store.pipe(select('feedState')).subscribe((state) => {
            this.channels = state.Channels;
        });

        this.pullCycle$ = timer(1000, 300000);
    }

    getRssFeedsFromChannelList() {
        // subscribe the pullCycles
        // every 5 minutes 
        this.cycleSubscription = this.pullCycle$.subscribe((val) => {
            console.log(`pulled rss feed ${val} times.`);
            this.channels.forEach((channel: string) => {
                this.http
                    .get<any>(`https://cors-anywhere.herokuapp.com/${channel}`, { observe: "body", responseType: "text" as "json" })
                    .subscribe(
                        (data: HttpResponse<any>) => {
                            let parseString = xml2js.parseString;
                            parseString(data, (err, result: any) => {
                                console.log(err);
                                console.dir(result.rss.channel[0].item);
                                result.rss.channel[0].item.forEach((i) => {
                                    this.store.dispatch(addFeed(i));
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
