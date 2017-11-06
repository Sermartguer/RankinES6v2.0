'use strict';

import {context} from './context.js';
import {checkregex} from './utils.js';
/** Once the page is loaded we get a context app object an generate students rank view. */
window.onload = function() {
  window.location.href = "#";
  window.history.pushState("","",'/');
  window.addEventListener('hashchange', function(){
    let hash = location.hash;
    let a = hash.split('/');
    switch (a[0]) {
      case '#addStudent':
        context.addPerson();
      break;
      case '#addGradedTask':
      context.addGradedTask();
      break;
      case '#delete':
        if (checkregex(/[0-9-]*$/g,a[1])) {  
          if (confirm("Delete?") == true) {
            context.deletePerson(parseInt(a[1]));
          }
        }
      break;
      case '#edit':
        if (checkregex(/[0-9-]*$/g,a[1])) {
          context.editPerson(parseInt(a[1]));
        }
      break;
      case '#details':
        if (checkregex(/[0-9-]*$/g,a[1])) {
          context.detailPerson(parseInt(a[1]));
        }
      break;
      case '#detailTask':
        if (checkregex(/[0-9-]*$/g,a[1])) {
          context.detailTask(parseInt(a[1]));
        }
      break;
      case '#addAttitudeTask':
        if (checkregex(/[0-9-]*$/g,a[1])) {
          context.addAttitudeTask(parseInt(a[1]));
        }
        break;
      case '#detele2':
      if (confirm("Delete?") == true) {
        context.deleteSelected();
      }else {
          console.log('no');
      }
      break;
      case '#moreTasks':
      context.showNumGradedTasks +=1;
      context.getTemplateRanking();
      window.history.pushState("","",'/');
      break;
      case '#deleteTask':
      if (checkregex(/[0-9-]*$/g,a[1])) {
        if (confirm("Delete?") == true) {
          context.deleteTask(parseInt(a[1]));
        }else {
            console.log('no');
        }
      }
      break;
      case '#editTask':
      context.editTask(parseInt(a[1]));
      break;
      break;
      default:
      context.getTemplateRanking();
      break;
    }
  });
};
