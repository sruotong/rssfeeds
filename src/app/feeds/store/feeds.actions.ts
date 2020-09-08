import { createAction, props } from '@ngrx/store';
import { FeedItem } from 'src/app/models/feed-item.model';

export const addFeed = createAction('[FEED] - ADD FEED', props<FeedItem>());
export const deleteFeed = createAction('[FEED] - DELETE FEED', props<FeedItem>());
export const addChannel = createAction('[FEED] - ADD CHANNEL', props<String>());
export const deleteChannel = createAction('[FEED] - DELETE CHANNEL', props<String>());