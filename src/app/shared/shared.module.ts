import { NgModule } from '@angular/core';
import { LowercaseDirective } from './directives/lowercase.directive';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [LowercaseDirective],
    imports: [
        CommonModule,
        FormsModule,
        BrowserModule,
    ],
    exports: [
        LowercaseDirective,
        CommonModule,
        FormsModule,
        BrowserModule,
    ]
})
export class SharedModule { }


