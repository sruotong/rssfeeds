import { FeedItem } from 'src/app/models/feed-item.model';

export default class FeedState {
    Feeds: Array<FeedItem>;
    Channels: Array<string>;
}

export const initializeState = (): FeedState => {
    return { Feeds: Array<FeedItem>(), Channels: ['http://feeds.bbci.co.uk/news/rss.xml', 'https://www.smh.com.au/rss/feed.xml'] };
};