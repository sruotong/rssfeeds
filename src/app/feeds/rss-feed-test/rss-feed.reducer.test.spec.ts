import { FeedStateReducer, initialState } from "../store/feeds.reducer";
import { FEED_STATUS } from '../rss-feed.constants';
import * as moment from 'moment';



describe('RssFeed Reducer', () => {
    // a test state variable.
    let testState = {
        Channels: ['this-is-a-test-channel-1', 'this-is-a-test-channel-2'],
        Feeds: [
            {
                channel: 'channel-1',
                title: 'title1',
                description: 'description1',
                link: 'link1',
                status: FEED_STATUS.ADDED,
                updateTime: moment(new Date()),
                pubDate: moment(new Date())
            },
            {
                channel: 'channel-1',
                title: 'title2',
                description: 'description2',
                link: 'link2',
                status: FEED_STATUS.ADDED,
                updateTime: moment(new Date()),
                pubDate: moment(new Date())
            },
            {
                channel: 'channel-1',
                title: 'title3',
                description: 'description3',
                link: 'link3',
                status: FEED_STATUS.ADDED,
                updateTime: moment(new Date()),
                pubDate: moment(new Date())
            }
        ]
    };

    it('should handle initial state', () => {
        expect(
            FeedStateReducer(undefined, {})
        ).toBe(initialState);
    });

    describe('test channel actions', () => {
        it('should add channel, when action is add channel', () => {
            // state's feeds list should not be changed
            expect(FeedStateReducer(testState, { channel: 'this-is-a-new-test-channel', type: '[FEED] - ADD CHANNEL' }).Feeds).toEqual(testState.Feeds);
            // should add the new url at then end of the list
            expect(FeedStateReducer(testState, { channel: 'this-is-a-new-test-channel2', type: '[FEED] - ADD CHANNEL' }).Channels).toEqual([...testState.Channels, 'this-is-a-new-test-channel2']);
        });

        describe('test channel delete actions', () => {
            it('should keep state as same, when the url is not exist in channel list', () => {
                expect(FeedStateReducer(testState, { channel: 'this-is-a-new-test-channel', type: '[FEED] - DELETE CHANNEL' })).toEqual(testState);
            });

            it('should delete the url, when the url is exist in the channel list', () => {
                // add a new channel first
                expect(FeedStateReducer(testState, { channel: 'this-is-a-new-test-channel', type: '[FEED] - ADD CHANNEL' }).Channels.length).toEqual(3);
                expect(FeedStateReducer(testState, { channel: 'this-is-a-new-test-channel', type: '[FEED] - DELETE CHANNEL' })).toEqual(testState);
            });
        });

    });

    describe('test feeds actions', () => {
        it('should add feeds, when action is \'add feeds\'', () => {
            let feedItemTemp = {
                channel: 'channel-5',
                title: 'title5',
                description: 'description5',
                link: 'link5',
                status: '',
                updateTime: null,
                pubDate: moment(new Date())
            };
            let result = FeedStateReducer(testState, { ...feedItemTemp, type: '[FEED] - ADD FEED' });
            // state's channels list should not be changed
            expect(result.Channels).toEqual(testState.Channels);

            // should add the new feed at then end of the list
            expect(result.Feeds[3].status).toEqual(FEED_STATUS.ADDED);
            expect(result.Feeds[3].link).toEqual(feedItemTemp.link);
            // should record the time added to the list
            expect(result.Feeds[3].updateTime).toBeTruthy();
        });

        describe('test feeds delete actions', () => {
            it('should not change any staes, if feed not exist in the list', () => {
                let feedItemTemp = {
                    channel: 'channel-5',
                    title: 'title5',
                    description: 'description5',
                    link: 'link5',
                    status: FEED_STATUS.ADDED,
                    updateTime: moment(new Date()),
                    pubDate: moment(new Date())
                };
                // state should not be changed
                expect(FeedStateReducer(testState, { ...feedItemTemp, type: '[FEED] - DELETE FEED' })).toEqual(testState);
            });

            it('should update state to  status : deleted, if feed exist in the list', () => {
                let feedItemTemp = {
                    channel: 'channel-1',
                    title: 'title1',
                    description: 'description1',
                    link: 'link1',
                    status: FEED_STATUS.ADDED,
                    updateTime: moment(new Date(0)),
                    pubDate: moment(new Date())
                };
                let result = FeedStateReducer(testState, { ...feedItemTemp, type: '[FEED] - DELETE FEED' });
                // should not really removed obj from list
                expect(result.Feeds.length).toEqual(testState.Feeds.length);
                // should update feed status to deleted
                expect(result.Feeds[0].status).toEqual(FEED_STATUS.DELETED);
                // should update record time
                expect(result.Feeds[0].updateTime).not.toEqual(feedItemTemp.updateTime);

            });

        });
    });
});
