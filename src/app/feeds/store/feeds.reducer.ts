import { createReducer, on } from '@ngrx/store';
import { addFeed, addChannel, deleteFeed, deleteChannel } from './feeds.actions';
import FeedState, { initializeState } from './feeds.state';
import { FeedItem } from 'src/app/models/feed-item.model';
import * as moment from 'moment';
import { FEED_STATUS } from '../rss-feed.constants';

export const initialState = initializeState();

const _feedStateReducer = createReducer(
    initialState,
    on(addChannel, (state: FeedState, { channel }) => {
        return { ...state, Channels: [...state.Channels, channel] };
    }),
    on(deleteChannel, (state: FeedState, { channel }) => {
        // when channel deleted, all the feeds related to this channel will update status to deleted
        // and the channel url should be removed from list as well.
        return { Feeds: [...state.Feeds.map(f => f.rssUrl === channel ? ({ ...f, status: FEED_STATUS.DELETED, updateTime: moment(new Date()) }) : f)], Channels: [...state.Channels.filter(c => c != channel)] }
    }),
    on(addFeed, (state: FeedState, feed: FeedItem) => {
        return { ...state, Feeds: [...state.Feeds, { ...feed, status: FEED_STATUS.ADDED, updateTime: moment(new Date()) }] };
    }),
    on(deleteFeed, (state: FeedState, feed: FeedItem) => {
        // will not really remove the feed from list
        // will only update status and update time of the feed
        return { ...state, Feeds: [...state.Feeds.map(f => f.link === feed.link ? ({ ...feed, status: FEED_STATUS.DELETED, updateTime: moment(new Date()) }) : f)] }
    })
);

export function FeedStateReducer(state, action) {
    return _feedStateReducer(state, action);
}