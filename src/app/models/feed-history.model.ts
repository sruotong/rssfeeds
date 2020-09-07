import { FeedItem } from './feed-item.model';
import * as moment from 'moment'

export class FeedHistory {
    constructor(
        public actTime: moment.Moment,
        public items: FeedItem[],
        public status: string /* updated|removed|added */
    ) { }
}
