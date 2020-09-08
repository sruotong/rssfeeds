import { createReducer, on } from '@ngrx/store';
import { addFeed, addChannel, deleteFeed, deleteChannel } from './feeds.actions';
import FeedState, { initializeState } from './feeds.state';
import { FeedItem } from 'src/app/models/feed-item.model';
import * as moment from 'moment';
import { FEED_STATUS } from '../rss-feed.constants';

export const initialState = initializeState();

const _feedStateReducer = createReducer(
    initialState,
    on(addChannel, (state: FeedState, channelLink: String) => {
        return { ...state, Channels: [...state.Channels, channelLink] };
    }),
    on(deleteChannel, (state: FeedState, channelLink: String) => {
        return { ...state, Channels: state.Channels.filter(c => c != channelLink) }
    }),
    on(addFeed, (state: FeedState, feed: FeedItem) => {
        return { ...state, Feeds: [...state.Feeds, { ...feed, status: FEED_STATUS.ADDED, updateTime: moment(new Date()) }] };
    }),
    on(deleteFeed, (state: FeedState, feed: FeedItem) => {
        return { ...state, Feeds: [...state.Feeds.filter(f => f.link !== feed.link), { ...feed, status: FEED_STATUS.DELETED, updateTime: moment(new Date()) }] }
    })
);

export function FeedStateReducer(state, action) {
    return _feedStateReducer(state, action);
}