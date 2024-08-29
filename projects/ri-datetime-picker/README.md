# RiDatetimePicker
This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.6.

Angular date time picker

** This package supports Angular 16 **

Simple Angular date time picker. This picker is responsive design, so feel free to try it in your desktops, tablets and mobile devices.

![badge](https://img.shields.io/badge/license-MITLicense-brightorange)

### Getting Started

1. Start by installing the DateTime Picker library from `npm`.

`npm i ri-datetime-picker`

2. Add styles. If you are using Angular CLI, you can add this to your styles.css:

```css
@import "~ri-datetime-picker/assets/style/picker.min.css";
```

3. Next, you'll need to import the following modules in your app's module.

**app.module.ts**

```ts

import { RIDateTimeModule, RINativeDateTimeModule } from "ri-datetime-picker";
...

@NgModule({
    ...
    imports: [ RIDateTimeModule, RINativeDateTimeModule ],
    ...
});
```

4. Connecting a picker to an input and a trigger.

```html
<div>
  Calendar :
  <input [riDateTime]="dt1" [riDateTimeTrigger]="dt1" placeholder="Date Time">
  <ri-date-time [pickerType]="'calendar'" #dt1></ri-date-time>
</div>
```

```html
<div>
  Calendar With timer :
  <input [riDateTime]="dt2" [riDateTimeTrigger]="dt2" placeholder="Date Time">
  <ri-date-time [pickerType]="'both'" #dt2></ri-date-time>
</div>
```


```html
 <div>
    <label for="daterange">
        Datetime range:
    </label>
    <input
    [(ngModel)]="selectedDates"
    [selectMode]="'range'"
    [riDateTimeTrigger]="date_range_component"
    [riDateTime]="date_range_component"
    pickerType="both"
    id="daterange">

    <ri-date-time
    #date_range_component
     [startAt]="currentValue"
    [endAt]="endValue"
    (afterPickerClosed)="selectedTrigger($event)"
    (dateSelected)="selectedTrigger($event)">
    </ri-date-time>
 </div>
```

```html
 <div>
    Min and Max Validation:
    <input [min]="min" [max]="max" [riDateTime]="dt3" [riDateTimeTrigger]="dt3" placeholder="Date Time">
    <ri-date-time [pickerType]="'both'" #dt3></ri-date-time>
</div>
```

```html
    <div>
        Timer Only:
        <input [riDateTime]="dt4 [riDateTimeTrigger]="dt4" placeholder="Time">
        <ri-date-time [pickerType]="'timer'" #dt4></ri-date-time>
    </div>
```

```html
    <div>
    Filter:
        <input [riDateTimeFilter]="myFilter"  [riDateTime]="dt5" [riDateTimeTrigger]="dt5" placeholder="Date Time">
        <ri-date-time [pickerType]="'both'" #dt5></ri-date-time>
    </div>
```
```ts

public myFilter = (date: Date): boolean =>  { 
    const day = date.getDay();
    return day !== 0 && day !== 6;
}
```



Properties for `ri-datetime-picker`
-------
|Name|Type|Required|Default|Description|
|:--- |:--- |:--- |:--- |:--- |
|`pickerType`|`both`, `calendar`, `timer`|Optional|`both`| Set the type of the dateTime picker. `both`: show both calendar and timer, `calendar`: only show calendar, `timer`: only show timer. |
|`pickerMode`|`popup`, `dialog`|Optional|`popup`| The style the picker would open as. |
|`startAt`| T/null |Optional|`null`| The moment to open the picker to initially. |
|`firstDayOfWeek`|number|Optional|`0`| Set the first day of week. Valid value is from 0 to 6. 0: Sunday ~ 6: Saturday|


````

## License

MIT