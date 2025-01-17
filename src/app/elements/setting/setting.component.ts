import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {SettingService} from '@app/services';
import {GlobalSetting, Setting} from '@app/model';
import {I18nService} from '@app/services/i18n';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {resolutionsChoices} from '@app/globals';


@Component({
  selector: 'elements-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class ElementSettingComponent implements OnInit {
  public boolChoices: any[];
  public keyboardLayoutOptions: any[];
  setting: Setting;
  globalSetting: GlobalSetting;
  type = 'general';
  resolutionsChoices = resolutionsChoices;

  constructor(public dialogRef: MatDialogRef<ElementSettingComponent>,
              private _i18n: I18nService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private settingSrv: SettingService) {
    this.boolChoices = [
      {name: _i18n.instant('Yes'), value: '1'},
      {name: _i18n.instant('No'), value: '0'}
    ];
    this.keyboardLayoutOptions = [
      {value: 'en-us-qwerty', label: _i18n.instant('US English keyboard layout')},
      {value: 'en-gb-qwerty', label: _i18n.instant('UK English keyboard layout')},
      {value: 'ja-jp-qwerty', label: _i18n.instant('Japanese keyboard layout')},
      {value: 'fr-fr-azerty', label: _i18n.instant('French keyboard layout')},
      {value: 'fr-ch-qwertz', label: _i18n.instant('Swiss French keyboard layout')},
      {value: 'fr-be-azerty', label: _i18n.instant('Belgian French keyboard layout')},
      {value: 'tr-tr-qwerty', label: _i18n.instant('Turkey keyboard layout')}
    ];
  }

  hasLicense() {
    return this.settingSrv.globalSetting.XPACK_LICENSE_IS_VALID;
  }

  ngOnInit() {
    this.setting = this.settingSrv.setting;
    this.globalSetting = this.settingSrv.globalSetting;
    this.type = this.data.type;
    if (!this.setting.backspaceAsCtrlH) {
      this.setting.backspaceAsCtrlH = '0';
    }
  }

  onSubmit() {
    this.settingSrv.save();
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
