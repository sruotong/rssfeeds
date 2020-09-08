import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RssFeedModule } from './feeds/rss-feed.module';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        RssFeedModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
