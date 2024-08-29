import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ri-custom-timer-box',
  templateUrl: './custom-timer-box.component.html',
  styleUrls: ['./custom-timer-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RICustomTimerBoxComponent implements OnInit, OnDestroy {
  
  @ViewChild('timeContainer') timeContainer!: ElementRef;
  @Output() valueChange = new EventEmitter<any>();


  public selectedTime : any = '';
  ngOnDestroy(): void {
   
  }

  constructor() {}

  @Input() interval: number = 1; // Interval in minutes, default is 15
     /**
    * Minutes to change per step
    */
     @Input()
     step = 1;
  
  times: string[] = [];
  currentTime: string = '';

  ngOnInit(): void {


    const hours = new Date().getHours();
    const mins = new Date().getMinutes();
    this.currentTime = `${this.padZero(hours)}:${this.padZero(mins)}`;
    console.log(this.currentTime);
    
    this.selectedTime = this.currentTime;
    this.generateTimeColumn();
  }

  generateTimeColumn(): void {
    const totalMinutesInDay = 24 * 60;
    for (let minutes = 0; minutes < totalMinutesInDay; minutes += this.step) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      this.times.push(`${this.padZero(hours)}:${this.padZero(mins)}`);
    }

   
  }

  ngAfterViewInit(): void {
    this.scrollToElement();
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  onKeyDown(event: KeyboardEvent): void {
    console.log('Key Down:', event.key);
    // Handle key down event
  }

  onKeyUp(event: KeyboardEvent): void {
    console.log('Key Up:', event.key);
    // Handle key up event
  }

  onFocus(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Focused:', inputElement.value);
    // Handle focus event
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    console.log('Input:', inputElement.value);
    // Handle input event
  }

  onClick(time: any) {
    console.log('Selected Time:', time);
    this.selectedTime = time;
    const value = time.split(':');
    const hour = parseInt(value[0]);
    const minute = parseInt(value[1]);

    const timeObj = { hour: hour, minute: minute };

    this.valueChange.emit(timeObj);
  }

  scrollUp(event: any) {
    // Handle scroll up event

  }

  scrollDown(event: any) {

  }

  scrollToElement() {  
    
    const container = this.timeContainer?.nativeElement;   
    const selectedTimeElement = container.querySelector('.selected');
    if (selectedTimeElement) {
      container.scrollTop = selectedTimeElement.offsetTop - container.clientHeight / 2;
    }
  }

  scrollTimeList(direction: string) {
    console.log('Scrolling:', direction);
    
    const container = this.timeContainer.nativeElement;
    const scrollAmount = 40; // Adjust this value to control scroll speed/distance

    if (direction === 'up') {
      container.scrollBy({
        top: -scrollAmount,
        behavior: 'smooth'
      });
    } else if (direction === 'down') {
      container.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      });
    }
  }
}
