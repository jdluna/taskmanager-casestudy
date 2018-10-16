import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent, NgbDatepicker, NgbDatepickerConfig, NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge} from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import { appService } from '../service/index';
declare var jQuery:any;

@Component({

  selector: 'app-addtask',
  templateUrl: 'addtask.component.html',
  styleUrls: ['addtask.component.css']
})
export class AddTaskComponent implements OnInit, OnDestroy {

  @ViewChild('instance') instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
 
  task : any = {};
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  calendarToday: NgbCalendar
  alltaskList : any = [];
  errorShow : boolean = false;
  screenLoader : boolean = false;
  errorMessage : string = '';
  modalHeading : string = '';
  modalBody : string = '';

  constructor(calendar: NgbCalendar, config: NgbDatepickerConfig, public router: Router, private appService : appService) {
    this.fromDate = calendar.getToday();
    this.calendarToday = calendar;
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    const currentDate = new Date();
    config.minDate = {year:currentDate.getFullYear(), month:currentDate.getMonth()+1, day: currentDate.getDate()};
    config.maxDate = {year: 2099, month: 12, day: 31};
    config.outsideDays = 'hidden'; 
    this.screenLoader = true;
    appService.getTasks().subscribe((data :any) => {
      this.alltaskList = data;
      this.screenLoader = false;
    });
  }

  ngOnInit() {
    this.task = {
      "taskName":"",
      "priority":"15",
      "parentTaskId":"",
      "parentTaskName":"",
      "startDate":new Date(),
      "endDate":new Date()
    };
  }

  ngOnDestroy() {
    this.task = {};
  }

  formatter = (value: any) => value.taskName || '';

  addTask(task: any){
    var parentTaskNameVal = jQuery("#parentTask").val();
    this.errorShow = false;
    this.errorMessage = '';
    if(parentTaskNameVal !== '' && this.task.parentTaskId === ''){
      this.errorShow = true;
      this.errorMessage = 'Select Parent Task from the list available. Either the task name is edited or you have typed a custom task name.';
    }else{
      var submitAddTask = {
        "taskName": this.task.taskName,
        "startDate": this.convertDateJsonToString(this.fromDate),
        "endDate": this.convertDateJsonToString(this.fromDate),
        "priority": this.task.priority,
        "status": "A",
        "parentTask": {
          "taskId" : this.task.parentTaskId
        }
      }
      this.screenLoader = true;
      this.appService.addTask(submitAddTask).subscribe(
        (data: any) => {
          this.screenLoader = false;
          this.modalHeading = 'Yeah :-)';
          this.modalBody = 'Task Added Successfully';
          document.getElementById("submitModalOpener").click();
        },
        (err: any) => {
            this.screenLoader = false;
            this.modalHeading = 'Oh No !!!';
            this.modalBody = 'Unexpected error occured during Add Task. Please try after some time.';
            document.getElementById("submitModalOpener").click();        
          }
        );
    }
  }

  parentTaskSearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.alltaskList : this.alltaskList.filter(v => v.taskName.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  }

  selectedParentTaskItem(event: NgbTypeaheadSelectItemEvent): void {
    event.preventDefault();
    jQuery("#parentTask").val(event.item.taskName);
    this.task.parentTaskId = event.item.taskId;
  }

  clearParentId(){
    this.task.parentTaskId = "";
  }

  resetButton(){
    this.task = {
      "taskName":"",
      "priority":"15",
      "parentTaskId":"",
      "parentTaskName":"",
      "startDate":new Date(),
      "endDate":new Date()
    };
    this.fromDate = this.calendarToday.getToday();
    this.toDate = this.calendarToday.getNext(this.calendarToday.getToday(), 'd', 10);
    jQuery("#parentTask").val("");
  }
  
  viewTaskScreen(){
    this.router.navigate(['/viewtask']);
  }

  /* Datepicker functions*/
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  convertDateJsonToString(json: any){
    if(json !== undefined && json !== null){
      return json.day + '/' + json.month + '/' + json.year;
    }
  }

}



