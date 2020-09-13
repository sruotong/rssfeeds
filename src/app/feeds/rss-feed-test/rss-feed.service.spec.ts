import { RssFeedService } from "../rss-feed.service";
import { TestBed, async } from '@angular/core/testing';
import { storeMock } from './mocks/store.mock';
import { Store } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { FeedItem } from 'src/app/models/feed-item.model';
import * as moment from 'moment';
import { FEED_STATUS } from '../rss-feed.constants';

describe('RssFeed Service', () => {
    let service: RssFeedService;
    let http: HttpClient;
    let store: any;
    let feedItems: FeedItem[] = [
        {
            channel: 'channel-1',
            title: 'title1',
            description: 'description1',
            link: 'link1',
            status: FEED_STATUS.ADDED,
            updateTime: moment(new Date()),
            pubDate: moment(new Date()),
            rssUrl: 'a fake rss url'
        },
        {
            channel: 'channel-1',
            title: 'title2',
            description: 'description2',
            link: 'link2',
            status: FEED_STATUS.ADDED,
            updateTime: moment(new Date()),
            pubDate: moment(new Date()),
            rssUrl: 'a fake rss url'
        },
        {
            channel: 'channel-1',
            title: 'title3',
            description: 'description3',
            link: 'link3',
            status: FEED_STATUS.ADDED,
            updateTime: moment(new Date()),
            pubDate: moment(new Date()),
            rssUrl: 'a fake rss url'
        }
    ];
    beforeEach(async(() => {
        TestBed.configureTestingModule(
            {
                imports: [HttpClientTestingModule],
                providers: [
                    RssFeedService,
                    { provide: Store, useClass: storeMock },
                ]
            }
        );
    }));

    beforeEach(() => {
        service = TestBed.inject(RssFeedService);
        http = TestBed.inject(HttpClient);
        store = TestBed.inject(Store);
    });

    it('should subscribed states and got initialed states', () => {
        // intial state has two channels and 0 feeds.
        expect(service.getChannels().length).toBe(2);
        expect(service.getFeeds().length).toBe(0);
    });

    describe('test pulling cycle for the rss channles', () => {
        it('should create a pull cycle observable subject', () => {
            expect(service.getPullCycle()).not.toBeFalsy();
        });

        describe('test subscriptions', () => {
            beforeEach(() => {
                spyOn(service, 'callRssUrls').and.returnValue(of(new HttpResponse<any>({ body: 'THIS IS A FAKE XML' })));
                spyOn(service, 'parseRssXML');
                // make sure it is undefined before sign subscription
                expect(service.getCycleSubscription()).toBeFalsy();
                service.getRssFeedsFromChannelList();
            });

            it('should sign subscription to subscription variable', () => {
                expect(service.getCycleSubscription()).toBeTruthy();
            });

            it('should unsubscribe pullCycle, when unSubscribeCycle called', () => {
                spyOn(service.getCycleSubscription(), 'unsubscribe');
                service.unSubscribeCycle();
                expect(service.getCycleSubscription().unsubscribe).toHaveBeenCalled();
            });
        });

    });

    describe('test calling rss url', () => {

        it('should call rss url, when calling callrssurls function', () => {
            spyOn(http, 'get').and.returnValue(of('a fake xml'));
            service.callRssUrls('url');
            expect(http.get).toHaveBeenCalled();
        })

        it('should start to parse rss xml, when pull cycle started and response successed', (done) => {
            spyOn(service, 'callRssUrls').and.returnValue(of(new HttpResponse<any>({ body: 'THIS IS A FAKE XML' })));
            spyOn(service, 'parseRssXML');
            service.getRssFeedsFromChannelList();
            setTimeout(() => {
                // because initial state has two channel sites
                // should call rss url for getting data from both of them
                expect(service.callRssUrls).toHaveBeenCalledTimes(2);

                // because http response return successfully.
                // should call parse rss xml function to extract data from xml.
                expect(service.parseRssXML).toHaveBeenCalled();
                done();
            }, 200);
        });

        it('should not to parse rss xml, when pull cycle started and response with errors', (done) => {
            spyOn(service, 'callRssUrls').and.returnValue(throwError(new HttpErrorResponse({ error: 'THIS IS A FAKE ERROR MESSAGE' })));
            spyOn(service, 'parseRssXML');
            service.getRssFeedsFromChannelList();
            setTimeout(() => {
                // because initial state has two channel sites
                // should call rss url for getting data from both of them
                expect(service.callRssUrls).toHaveBeenCalledTimes(2);

                // because http response return with  error.
                // should not call parse rss xml function to extract data from xml.
                expect(service.parseRssXML).not.toHaveBeenCalled();
                done();
            }, 200);
        });
    });

    describe('test xml parse', () => {
        beforeEach(() => {
            // set up some history feeds in state
            store.aStateObj$.next({ Feeds: feedItems });
        });

        it('should return error, if cannot parse xml', () => {
            spyOn(service, 'updateFeeds');
            service.parseRssXML(new HttpResponse<any>({ body: 'THIS IS A FAKE XML' }));
            expect(service.updateFeeds).not.toHaveBeenCalled();
        });

        it('should update feeds\' status, when new xml comming', () => {
            spyOn(store, 'dispatch').and.callThrough();
            spyOn(store, 'addFeedActionMock');
            spyOn(store, 'deleteFeedActionMock');
            let testResult: any = [
                {
                    channel: 'channel-1',
                    title: ['title4'],
                    description: ['description4'],
                    link: ['link4'],
                    status: FEED_STATUS.ADDED,
                    updateTime: moment(new Date()),
                    pubDate: [moment(new Date())]
                },
                {
                    channel: 'channel-1',
                    title: ['title5'],
                    description: ['description5'],
                    link: ['link5'],
                    status: FEED_STATUS.ADDED,
                    updateTime: moment(new Date()),
                    pubDate: [moment(new Date())]
                }
            ];
            service.updateFeeds('A FAKE RSS URL', { rss: { channel: [{ item: [...testResult], link: ['channel-1'] }] } });

            // should call deleteFeedAction
            // when the old feeds from same resource as the rss xml
            // and the old feeds are not exist in new rss xml
            expect(store.deleteFeedActionMock).toHaveBeenCalledTimes(3);

            // should call addFeedAction
            // when the old feeds from same resource as the rss xml
            // and the new feeds are not exist in the old feeds list
            expect(store.addFeedActionMock).toHaveBeenCalledTimes(2);

            // should have call dispatch 5 times
            // 3 times delete and 2 times add
            expect(store.dispatch).toHaveBeenCalledTimes(5);
        });

        it('should only update channels matched feeds\' status, when new xml comming', () => {
            spyOn(store, 'dispatch').and.callThrough();
            spyOn(store, 'addFeedActionMock');
            spyOn(store, 'deleteFeedActionMock');
            let testResult: any = [
                {
                    channel: 'channel-2',
                    title: ['title4'],
                    description: ['description4'],
                    link: ['link4'],
                    status: FEED_STATUS.ADDED,
                    updateTime: moment(new Date()),
                    pubDate: [moment(new Date())]
                },
                {
                    channel: 'channel-2',
                    title: ['title5'],
                    description: ['description5'],
                    link: ['link5'],
                    status: FEED_STATUS.ADDED,
                    updateTime: moment(new Date()),
                    pubDate: [moment(new Date())]
                }
            ];
            service.updateFeeds('A FAKE RSS URL', { rss: { channel: [{ item: [...testResult], link: ['channel-2'] }] } });

            // should not call deleteFeedAction
            // because there is not history feeds from channel1
            expect(store.deleteFeedActionMock).toHaveBeenCalledTimes(0);

            // should call addFeedAction
            // when the old feeds from same resource as the rss xml
            // and the new feeds are not exist in the old feeds list
            expect(store.addFeedActionMock).toHaveBeenCalledTimes(2);

            // should have call dispatch 2 times
            // 2 times add for channel-2
            expect(store.dispatch).toHaveBeenCalledTimes(2);
        });
    });
});
