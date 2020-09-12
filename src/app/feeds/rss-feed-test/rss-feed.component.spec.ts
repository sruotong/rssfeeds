import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RssFeedComponent } from '../rss-feed.component';
import { RssFeedService } from '../rss-feed.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { MockRssFeedService } from './mocks/rss-feed.service.mock';
import { storeMock } from './mocks/store.mock';
import { FeedItem } from 'src/app/models/feed-item.model';
import * as moment from 'moment';
import { SharedModule } from 'src/app/shared/shared.module';
import { By } from '@angular/platform-browser';
import { FEED_STATUS } from '../rss-feed.constants';

describe('RssFeedComponent', () => {
    let component: RssFeedComponent;
    let fixture: ComponentFixture<RssFeedComponent>;
    let rssFeedService: RssFeedService;
    let store: any;
    let channels: Array<string> = ['http://feeds.bbci.co.uk/news/rss.xml', 'https://www.smh.com.au/rss/feed.xml'];
    let feedItems: FeedItem[] = [
        {
            channel: 'channel-1',
            title: 'title1',
            description: 'description1',
            link: 'link1',
            status: '',
            updateTime: moment(new Date()),
            pubDate: moment(new Date())
        },
        {
            channel: 'channel-2',
            title: 'title2',
            description: 'description2',
            link: 'link2',
            status: '',
            updateTime: moment(new Date()),
            pubDate: moment(new Date())
        },
        {
            channel: 'channel-1',
            title: 'title3',
            description: 'description3',
            link: 'link3',
            status: '',
            updateTime: moment(new Date()),
            pubDate: moment(new Date())
        }
    ];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, HttpClientTestingModule],
            declarations: [RssFeedComponent],
            providers: [
                { provide: RssFeedService, useClass: MockRssFeedService },
                { provide: Store, useClass: storeMock }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RssFeedComponent);
        component = fixture.componentInstance;
        rssFeedService = fixture.debugElement.injector.get(RssFeedService);
        store = fixture.debugElement.injector.get(Store);
    });

    it('should create rss feed component', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should init empty feeds array list', () => {
        fixture.detectChanges();
        expect(component.feeds.length).toBe(0);
    });

    describe('test initial views', () => {
        it('should has \'Rss Feeds\' title', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            expect(component.disCompWith).toEqual('FEED_LIST');
            expect(fixture.debugElement.nativeElement.querySelector('h4').textContent).toEqual('Rss Feeds');
        }));

        it('should has logs button', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            expect(fixture.debugElement.nativeElement.querySelector("[name='logsButton']")).toBeTruthy();
        }));

        it('should has channels button', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            expect(fixture.debugElement.nativeElement.querySelector("[name='channelButton']")).toBeTruthy();
        }));

        it('should not show logs and channel list', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            expect(fixture.debugElement.queryAll(By.css('.channel-list-card')).length).toEqual(0);
            expect(fixture.debugElement.queryAll(By.css('.feed-logs-card')).length).toEqual(0);
        }));
    });

    describe('test list', () => {
        describe('test feeds list', () => {
            it('should update feeds list, when state has loaded rss feeds', fakeAsync(() => {
                fixture.detectChanges();
                // should initial list of the feeds
                expect(component.feeds.length).toBe(0);
                tick();
                // should update list of the feeds in html as well
                expect(fixture.debugElement.queryAll(By.css('.feed-list-card')).length).toEqual(0);

                // update state from mocked store
                store.aStateObj$.next({ Feeds: feedItems });

                fixture.detectChanges();
                expect(component.feeds.length).toBe(3);
                tick();
                // should update list of the feeds in html as well
                expect(fixture.debugElement.queryAll(By.css('.feed-list-card')).length).toEqual(3);
            }));

            it('should not include deleted feeds in feed list', () => {
                let testFeedItems = [{
                    channel: 'channel-1',
                    title: 'title5',
                    description: 'description5',
                    link: 'link5',
                    status: 'DELETED',
                    updateTime: moment(new Date()),
                    pubDate: moment(new Date())
                }];

                // adding a deleted status feed to feed list for testing
                let feedListTemp = [...feedItems, ...testFeedItems];

                // update state
                store.aStateObj$.next({ Feeds: feedListTemp });

                fixture.detectChanges();

                // feed list should be same as original feedItems;
                expect(component.feeds.map(f => f.link).indexOf(testFeedItems[0].link)).toEqual(-1);
            });

            it('should display essential details of the feed', fakeAsync(() => {
                // initail some feeds
                store.aStateObj$.next({ Feeds: feedItems });
                fixture.detectChanges();
                tick();
                expect(fixture.debugElement.queryAll(By.css('h5')).map(f => f.nativeElement.textContent).indexOf(feedItems[0].title)).not.toEqual(-1);
                // should display a 'More' link
                // the link reference should be item's link
                expect(fixture.debugElement.queryAll(By.css('a')).map(f => f.nativeElement.textContent)).toEqual(['More', 'More', 'More']);
                // because using jasmine and karma
                // need to add localost before the item's link to test
                expect(fixture.debugElement.queryAll(By.css('a')).map(f => f.nativeElement.href).indexOf('http://localhost:9876/' + feedItems[0].link)).not.toEqual(-1);
            }));
        });

        describe('test logs list', () => {
            it('should include all feeds(whatever the status)', () => {
                // setup test data with deleted and added feeds.
                let testFeedItems = [{
                    channel: 'channel-1',
                    title: 'title1',
                    description: 'description1',
                    link: 'link1',
                    status: 'DELETED',
                    updateTime: moment(new Date()),
                    pubDate: moment(new Date())
                }];

                // adding a deleted status feed to feed list for testing
                let feedListTemp = [...feedItems, ...testFeedItems];

                // update state
                store.aStateObj$.next({ Feeds: feedListTemp });

                fixture.detectChanges();

                // should show include deleted feeds
                expect(component.feedLogs.map(f => f.status).indexOf(feedListTemp[3].status)).not.toEqual(-1);
            });

            it('should display logs, when click the logs button', fakeAsync(() => {
                // setup test data with deleted and added feeds.
                let testFeedItems = [{
                    channel: 'channel-1',
                    title: 'title1',
                    description: 'description1',
                    link: 'link1',
                    status: 'DELETED',
                    updateTime: moment(new Date()),
                    pubDate: moment(new Date())
                }];
                // setup test data
                // update items status to added
                feedItems = feedItems.map(f => {
                    f.status = FEED_STATUS.ADDED;
                    return f;
                });
                // adding a deleted status feed to feed list for testing
                let feedListTemp = [...feedItems, ...testFeedItems];

                // update state
                store.aStateObj$.next({ Feeds: feedListTemp });

                fixture.detectChanges();
                tick();
                // click logs button to show logs
                fixture.debugElement.nativeElement.querySelector("[name='logsButton']").click();
                fixture.detectChanges();
                tick();
                // chcek length of logs list
                expect(component.feedLogs.length).toEqual(4);
                // check flag
                expect(component.disCompWith).toEqual('FEED_LOGS');
                // shoud display for feeds
                expect(fixture.debugElement.queryAll(By.css('.feed-logs-card')).length).toEqual(4);
                // should has one deleted feed
                expect(fixture.debugElement.queryAll(By.css('.badge-danger')).length).toEqual(1);
                // should has three added feeds
                expect(fixture.debugElement.queryAll(By.css('.badge-success')).length).toEqual(3);
            }));
        });

        describe('test channel list', () => {
            beforeEach(() => {
                // setup initial values
                store.aStateObj$.next({ Channels: channels, Feeds: feedItems });
                fixture.detectChanges();

                // click channel button to show channels
                fixture.debugElement.nativeElement.querySelector("[name='channelButton']").click();
                fixture.detectChanges();

            });
            it('should initial channel\s list', () => {
                expect(component.channels.length).toEqual(2);
            });

            it('should show channels list', fakeAsync(() => {
                tick();
                // should show the two initialed channels
                expect(fixture.debugElement.queryAll(By.css('p')).length).toEqual(2);
            }));

            it('should render add channel button and remove channel button', fakeAsync(() => {
                tick();
                expect(fixture.debugElement.nativeElement.querySelector("[name='addChannelButton']")).toBeTruthy();
                expect(fixture.debugElement.nativeElement.querySelector("[name='removeChannelButton']")).toBeTruthy();
            }));

            it('should call add channel function, when addChannelButton clicked', fakeAsync(() => {
                tick();
                spyOn(component, 'onAddingNewChannel');
                fixture.debugElement.nativeElement.querySelector("[name='addChannelButton']").click();
                tick();
                expect(component.onAddingNewChannel).toHaveBeenCalled();
            }));

            it('should call remove channel function, when removeChannelButton clicked', fakeAsync(() => {
                tick();
                spyOn(component, 'onRemovingChannel');
                fixture.debugElement.nativeElement.querySelector("[name='removeChannelButton']").click();
                tick();
                expect(component.onRemovingChannel).toHaveBeenCalledWith(0);
            }));

            it('should update component property, when user inputed a new channel url', fakeAsync(() => {
                let testValue = 'THIS IS A NEW FAKE RSS URL';
                let input = fixture.debugElement.nativeElement.querySelector("input");
                input.value = testValue;
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('change'));
                tick();
                expect(component.newChannel).toEqual(testValue);
            }));

            describe('test add/remove channel functions', () => {
                it('should not update channel list, when new channel string in null', () => {
                    spyOn(store, 'dispatch').and.callThrough();
                    // spyOn(store, 'addChannelActionMock');
                    // spyOn(store, 'deleteChannelActionMock');
                    component.newChannel = '';
                    component.onAddingNewChannel();

                    // should not call any dispatch function, when new channel not valid
                    expect(store.dispatch).not.toHaveBeenCalled();
                });

                it('should not update channel list, when new channel string is already in list', () => {
                    spyOn(store, 'dispatch').and.callThrough();
                    component.newChannel = 'http://feeds.bbci.co.uk/news/rss.xml';
                    component.onAddingNewChannel();
                    // should not call any dispatch function, when new channel not valid
                    expect(store.dispatch).not.toHaveBeenCalled();
                });

                it('should update channel list, when new channel vallid', () => {
                    spyOn(store, 'dispatch').and.callThrough();
                    spyOn(store, 'addChannelActionMock');
                    component.newChannel = 'http://feeds.Abci.co.AUSTRALIA/news/rss.xml';
                    component.onAddingNewChannel();
                    // should call dispatch function, when new channel is valid
                    expect(store.dispatch).toHaveBeenCalled();
                    // should call add channel action, when new channel is valid
                    expect(store.addChannelActionMock).toHaveBeenCalled();
                });

                it('should update channel list, when new channel vallid', () => {
                    spyOn(store, 'dispatch').and.callThrough();
                    spyOn(store, 'deleteChannelActionMock');
                    component.onRemovingChannel(0);
                    // should call dispatch function, when new channel is valid
                    expect(store.dispatch).toHaveBeenCalled();
                    // should call add channel action, when new channel is valid
                    expect(store.deleteChannelActionMock).toHaveBeenCalledWith('http://feeds.bbci.co.uk/news/rss.xml');
                });
            });
        });
    });
});
