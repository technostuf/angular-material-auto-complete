import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-material-auto-complete';
  searchTagCtrl = new FormControl();
  filteredTags: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 2;
  selectedTag: any = "";

  constructor(
    private http: HttpClient
  ) { }
  
  onSelected() {
    this.selectedTag = this.selectedTag;
  }

  displayWith(value: any) {
    return value?.Title;
  }

  clearTags() {
    this.selectedTag = "";
    this.filteredTags = [];
  }

  ngOnInit() {
    this.searchTagCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredTags = [];
          this.isLoading = true;
        }),
        switchMap(value => this.http.get('http://localhost/api-demo/tags?query='+value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data: any) => {
        if (data['results'].length == 0) {
          this.errorMsg = data['error'];
          this.filteredTags = [];
        } else {
          this.errorMsg = "";
          this.filteredTags = data['results'];
        }
        console.log(this.filteredTags);
      });
  }
}
