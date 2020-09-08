import { Route } from '@angular/router';
import { RssFeedComponent } from './rss-feed.component';


export const RssFeed_Route: Route = {
    path: '',
    component: RssFeedComponent,
    data: {
        pageTitle: 'Rss Feeds'
    }
};
