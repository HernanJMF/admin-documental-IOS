import { Injectable } from '@angular/core';


import * as JSON_DARK_THEME from '@json/themes/dark-theme.json';
import * as JSON_LIGHT_THEME from '@json/themes/light-theme.json';

import * as JSON_CONFIG from '@json/config.json';
import * as JSON_MAIN_EN from '@json/modules/main/main-en.json';
import * as JSON_MAIN_ES from '@json/modules/main/main-es.json';
import * as JSON_DOCUMENT_LIST_EN from '@json/modules/documents/documents-list/documents-list-en.json';
import * as JSON_DOCUMENT_LIST_ES from '@json/modules/documents/documents-list/documents-list-es.json';
import * as JSON_CHAT_ANALYZER_EN from '@json/modules/documents/chat-analyzer/chat-analyzer-en.json';
import * as JSON_CHAT_ANALYZER_ES from '@json/modules/documents/chat-analyzer/chat-analyzer-es.json';
import * as JSON_SETTINGS_EN from '@json/modules/users/settings/settings-en.json';
import * as JSON_SETTINGS_ES from '@json/modules/users/settings/settings-es.json';
import * as JSON_USER_MANAGEMENT_EN from '@json/modules/users/user-management/user-management-en.json';
import * as JSON_USER_MANAGEMENT_ES from '@json/modules/users/user-management/user-management-es.json';

import * as JSON_SIDEBAR_EN from '@json/shared/sidebar/sidebar-en.json';
import * as JSON_SIDEBAR_ES from '@json/shared/sidebar/sidebar-es.json';
import * as JSON_BASIC_TABLE_EN from '@json/shared/basic-table/basic-table-en.json';
import * as JSON_BASIC_TABLE_ES from '@json/shared/basic-table/basic-table-es.json';
import * as JSON_DOCUMENT_CARD_EN from '@json/shared/document-card/document-card-en.json';
import * as JSON_DOCUMENT_CARD_ES from '@json/shared/document-card/document-card-es.json';

import * as JSON_LOGIN_EN from '@json/modules/security/login/login-en.json';
import * as JSON_LOGIN_ES from '@json/modules/security/login/login-es.json';



@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  /*Este servicio sirve para configurar el entorno del proyecto, Permite cambiar el idioma o el tema de la aplicación llamando al
    JSON correspondiente de cada pantalla donde reside la información o configuracion de la vista respectiva*/

  //Security
  public config = JSON_CONFIG;

  constructor(
    ) {
  }

  //MAIN
  theme(theme = "light"){
    switch(theme) {
      case "dark": {
        return JSON_DARK_THEME
      }
      case "light": {
        return JSON_LIGHT_THEME
      }
      default: {
        return JSON_DARK_THEME
      }
    }
  }

  //MAIN
  main(language = "en"){
    switch(language) {
      case "en": {
        return JSON_MAIN_EN
      }
      case "es": {
        return JSON_MAIN_ES
      }
      default: {
        return JSON_MAIN_EN
      }
    }
  }

  //CHAT-DOCUMENTS
  documentsList(language = "en"){
    switch(language) {
      case "en": {
        return JSON_DOCUMENT_LIST_EN
      }
      case "es": {
        return JSON_DOCUMENT_LIST_ES
      }
      default: {
        return JSON_DOCUMENT_LIST_EN
      }
    }
  }

  //CHAT-ANALYZER
  chatAnalyzer(language = "en"){
    switch(language) {
      case "en": {
        return JSON_CHAT_ANALYZER_EN
      }
      case "es": {
        return JSON_CHAT_ANALYZER_ES
      }
      default: {
        return JSON_CHAT_ANALYZER_EN
      }
    }
  }

  //SETTINGS
  settings(language = "en"){
    switch(language) {
      case "en": {
        return JSON_SETTINGS_EN
      }
      case "es": {
        return JSON_SETTINGS_ES
      }
      default: {
        return JSON_SETTINGS_EN
      }
    }
  }

  //USER MANAGEMENT
  userManagement(language = "en"){
    switch(language) {
      case "en": {
        return JSON_USER_MANAGEMENT_EN
      }
      case "es": {
        return JSON_USER_MANAGEMENT_ES
      }
      default: {
        return JSON_USER_MANAGEMENT_EN
      }
    }
  }

  //SIDEBAR
  sidebar(language = "en"){
    switch(language) {
      case "en": {
        return JSON_SIDEBAR_EN
      }
      case "es": {
        return JSON_SIDEBAR_ES
      }
      default: {
        return JSON_SIDEBAR_EN
      }
    }
  }

  //DOCUMENT CARD
  documentCard(language = "en"){
    switch(language) {
      case "en": {
        return JSON_DOCUMENT_CARD_EN
      }
      case "es": {
        return JSON_DOCUMENT_CARD_ES
      }
      default: {
        return JSON_DOCUMENT_CARD_EN
      }
    }
  }

  //BASIC TABLE
  basicTable(language = "en"){
    switch(language) {
      case "en": {
        return JSON_BASIC_TABLE_EN
      }
      case "es": {
        return JSON_BASIC_TABLE_ES
      }
      default: {
        return JSON_BASIC_TABLE_EN
      }
    }
  }

  userList(language = "en"){
    switch(language) {
      case "en": {
        return JSON_DOCUMENT_LIST_EN
      }
      case "es": {
        return JSON_DOCUMENT_LIST_ES
      }
      default: {
        return JSON_DOCUMENT_LIST_EN
      }
    }

  }
  login(language = "en"){
    switch(language) {
      case "en": {
        return JSON_LOGIN_EN
      }
      case "es": {
        return JSON_LOGIN_ES
      }
      default: {
        return JSON_LOGIN_EN
      }
    }

  }

  topicList(language = "en"){
    switch(language) {
      case "en": {
        return JSON_DOCUMENT_LIST_EN
      }
      case "es": {
        return JSON_DOCUMENT_LIST_ES
      }
      default: {
        return JSON_DOCUMENT_LIST_EN
      }
    }

  }


}
