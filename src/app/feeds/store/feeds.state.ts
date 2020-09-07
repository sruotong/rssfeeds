import { FeedItem } from 'src/app/models/feed-item.model';

export default class FeedState {
    Feeds: Array<FeedItem>;
    Channels: Array<string>;
}

export const initializeState = (): FeedState => {
    return { Feeds: Array<FeedItem>(), Channels: Array<string>() };
};