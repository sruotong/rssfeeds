import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RssFeedComponent } from './rss-feed.component';
import { StoreModule } from '@ngrx/store';
import { FeedStateReducer } from './store/feeds.reducer';
import { RouterModule } from '@angular/router';
import { RssFeed_Route } from './rss-feed.route';
import { HttpClientModule } from '@angular/common/http';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [
        RssFeedComponent
    ],
    imports: [
        FormsModule,
        SharedModule,
        RouterModule.forChild([RssFeed_Route]),
        HttpClientModule,
        StoreModule.forRoot({ feedState: FeedStateReducer }),
        StoreDevtoolsModule.instrument({
            maxAge: 2500,
            logOnly: environment.production,
        }),
    ],
    providers: [],
    bootstrap: [RssFeedComponent]
})
export class RssFeedModule { }
