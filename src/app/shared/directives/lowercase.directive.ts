import { Directive, EventEmitter, HostListener, Output, OnInit } from '@angular/core';

@Directive({
    selector: '[ngModel][lowercase]'
})
export class LowercaseDirective {

    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
    value: any;

    @HostListener('keyup', ['$event'])
    onInputChange($event) {
        this.value = $event.target.value.toLowerCase();
        this.ngModelChange.emit(this.value);
    }
}

