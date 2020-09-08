import { createReducer, on } from '@ngrx/store';
import { addFeed, addChannel, deleteFeed, deleteChannel } from './feeds.actions';
import FeedState, { initializeState } from './feeds.state';
import { FeedItem } from 'src/app/models/feed-item.model';
import * as moment from 'moment';

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
        // feed.status = 'Added';
        // feed.updateTime = moment(new Date());
        return { ...state, Feeds: [...state.Feeds, { ...feed, status: 'Added', updateTime: moment(new Date()) }] };
    }),
    on(deleteFeed, (state: FeedState, { payload }) => {
        return { ...state, Feeds: payload }
    })
);

export function FeedStateReducer(state, action) {
    return _feedStateReducer(state, action);
}