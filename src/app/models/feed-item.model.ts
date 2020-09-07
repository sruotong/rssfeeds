import { Moment } from 'moment';


export class FeedItem {
    constructor(
        public channel: string,
        public status: string,
        public updateTime: Moment,
        public title: string,
        public description: string,
        public link: string,
        public pubDate: string
    ) { }
}
