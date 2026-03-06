import { formatDate } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MetaTagsService } from "src/app/services/metatags.service";
//import { format } from "url";

@Component({
  selector: "app-meta-tags",
  templateUrl: "./meta-tags.component.html",
  styleUrls: ["./meta-tags.component.css"],
})
export class MetaTagsComponent implements OnInit {
  metaTags: any[];
  metaconfig: any = {
    id: "metaTagPaginationControl",
    itemsPerPage: 15,
    currentPage: 1,
    totalItems: 0,
  };
  showAddModal: boolean = false;
  keywordForm: FormGroup;

  constructor(private fb: FormBuilder, private metaService: MetaTagsService) {}

  ngOnInit(): void {
    this.getMetaTags();
    this.keywordForm = this.fb.group({
      keywordName: ["", Validators.required],
      keywordContent: ["", Validators.required],
      // Add more form controls as needed
    });
  }

  getMetaTags() {
    this.metaService.getMetaTags().subscribe((res: any) => {
      debugger;
      console.log(res);
      this.metaTags = res;
    });
  }
  updateMetaTags() {
    this.metaService.syncMetaTags().subscribe((res: any) => {
      console.log(res);
    });
  }
  addMetaTags() {
    let formData = this.keywordForm.value;
    this.metaService
      .addMetaTags(formData.keywordName, formData.keywordContent)
      .subscribe((res: any) => {
        this.metaTags.push({
          MetaName: formData.keywordName,
          Content: formData.keywordContent,
        });
        this.closeModal();
        location.reload();
      });
  }
  deleteMetaTags(metaTagID, index) {
    this.metaService.deleteMetaTags(metaTagID).subscribe((res: any) => {
      this.metaTags.splice(index, 1);
    });
  }

  pageChanged(event) {
    this.metaconfig.currentPage = event;
  }

  isModelOpen = function () {
    return this.showAddModal == true ? "block" : "none";
  };
  openModal() {
    this.showAddModal = true;
  }
  closeModal() {
    this.showAddModal = false;
  }
}
