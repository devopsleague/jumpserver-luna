import {ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild} from '@angular/core';
import {AuthInfo, SystemUser, TreeNode} from '@app/model';
import {User} from '@app/globals';
import {AppService, LocalStorageService, LogService, SettingService} from '@app/services';
import {FormControl} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'elements-manual-auth',
  templateUrl: './manual-auth.component.html',
  styleUrls: ['./manual-auth.component.scss'],
})
export class ElementManualAuthComponent implements  OnInit {
  @Input() node: TreeNode;
  @Input() onSubmit$: BehaviorSubject<boolean>;
  @Input() manualAuthInfo: AuthInfo;
  @Input() systemUserSelected: SystemUser;
  public hidePassword = true;
  public rememberAuth = false;
  public rememberAuthDisabled = false;
  @ViewChild('username', {static: false}) usernameRef: ElementRef;
  @ViewChild('password', {static: false}) passwordRef: ElementRef;
  usernameControl = new FormControl();
  usernameReadonly = false;
  authsOptions: AuthInfo[];
  filteredOptions: AuthInfo[];
  systemUserManualAuthInit = false;

  constructor(private _settingSvc: SettingService,
              private _cdRef: ChangeDetectorRef,
              private _logger: LogService,
              private _appSvc: AppService,
              private _localStorage: LocalStorageService,
  ) {}

  ngOnInit() {
    if (!this._settingSvc.globalSetting.SECURITY_LUNA_REMEMBER_AUTH) {
      this.rememberAuthDisabled = true;
    }
    this.subscribeSubmitEvent();
  }

  onSystemUserChanged() {
    if (!this.systemUserSelected || this.systemUserSelected['login_mode'] !== 'manual') {
      return;
    }
    this.usernameReadonly = false;
    this.manualAuthInfo.username = '';
    this.manualAuthInfo.password = '';
    this.authsOptions = this._appSvc.getAssetSystemUserAuth(this.node.id, this.systemUserSelected.id);
    if (this.authsOptions && this.authsOptions.length > 0) {
      this.manualAuthInfo = Object.assign(this.manualAuthInfo, this.authsOptions[0]);
    }
    if (this.systemUserSelected.username_same_with_user) {
      this.manualAuthInfo.username = User.username;
      this.usernameReadonly = true;
    }
    if (!this.manualAuthInfo.username && this.systemUserSelected.username) {
      this.manualAuthInfo.username = this.systemUserSelected.username;
    }
    this._cdRef.detectChanges();
    setTimeout(() => {
      if (this.manualAuthInfo.username) {
        this.passwordRef.nativeElement.focus();
      } else {
        this.usernameRef.nativeElement.focus();
      }
    }, 10);
  }

  onFocus() {
    if (!this.systemUserManualAuthInit && !this.usernameReadonly) {
      this.usernameControl.setValue('');
      this.systemUserManualAuthInit = true;
    }
  }

  onUsernameChanges() {
    const filterValue = this.manualAuthInfo.username.toLowerCase();
    this.filteredOptions = this.authsOptions.filter(authInfo => {
      if (authInfo.username.toLowerCase() === filterValue) {
        this.manualAuthInfo = Object.assign(this.manualAuthInfo, authInfo);
      }
      return authInfo.username.toLowerCase().includes(filterValue);
    });
  }

  subscribeSubmitEvent() {
    this.onSubmit$.subscribe(() => {
      if (this.rememberAuth) {
        this._logger.debug('Save auth to localstorge: ', this.node.id, this.systemUserSelected.id, this.manualAuthInfo);
        this._appSvc.saveNodeSystemUserAuth(this.node.id, this.systemUserSelected.id, this.manualAuthInfo);
      }
    });
  }

  getSavedAuthInfos() {
    this.authsOptions = this._appSvc.getAssetSystemUserAuth(this.node.id, this.systemUserSelected.id);
  }
}