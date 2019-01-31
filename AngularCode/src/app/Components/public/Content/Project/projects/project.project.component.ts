import { Component } from '@angular/core';
import { TransfereService } from 'src/app/services/transferService.service';

declare var galleryWebsiteSetup: any;

@Component({
  templateUrl: './project.project.component.html'
})
export class ProjectProjectComponent { 
  

  constructor(private transfereService:TransfereService) {
  }

  project: any;
  images = [];

  ngOnInit() {    
		var photoswipeSetupFunction = function () { galleryWebsiteSetup(); }
    photoswipeSetupFunction();    
    var data = this.transfereService.getData();   
    if(data){
      this.project = data;
      var i=0; 
      for(var key in this.project._images){
        this.images[i] = [ key, this.project._images[key], '1920x1034']
        i++;
      }
      console.log(this.images);
    }
  }

}