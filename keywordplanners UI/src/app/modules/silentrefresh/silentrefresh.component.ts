import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-silentrefresh',
  templateUrl: './silentrefresh.component.html',
  styleUrls: ['./silentrefresh.component.css']
})
export class SilentrefreshComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    //debugger;
    //alert("Silent Refresh Page.");
    //parent.postMessage(location.hash, location.origin);
    //window.location = window.location;
    localStorage.setItem("statechanged", "true");
    window.location.assign(window.location.origin);
    //alert(window.location.origin);
  }

}
