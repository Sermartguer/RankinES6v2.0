/**
 * Person class. We store personal information and attitudePoints that reflect daily classroom job
 *
 * @constructor
 * @param {string} name - Person name
 * @param {string} surname - Person surname
 * @param {array} attitudeTasks - Person awarded AttitudeTasks array   
 * @param {array} gradedTasks - Person gradedTasks array
 * @tutorial pointing-criteria
 */

import {formatDate,popupwindow,hashcode,getElementTd,loadTemplate} from './utils.js';
import {context} from './context.js';
import AttitudeTask from './attitudetask.js';

const privateAddTotalPoints = Symbol('privateAddTotalPoints'); /** To accomplish private method */
const _totalPoints = Symbol('TOTAL_POINTS'); /** To acomplish private property */

class Person {
  constructor(name,surname,attitudeTasks,gradedTasks) {
    this[_totalPoints] = 0;
    this.name = name;
    this.surname = surname;

    this.attitudeTasks = attitudeTasks;
    this.gradedTasks = gradedTasks;
    console.log(this);
    this.attitudeTasks.forEach(function (itemAT) {
      this[_totalPoints] += parseInt(itemAT['task'].points);
    }.bind(this));
    this.gradedTasks.forEach(function (itemGT) {
      this[_totalPoints] += parseInt(itemGT.points);
    }.bind(this));
  }

  /** Add points to persons we should carefully use it. */
  [privateAddTotalPoints] (points) {
    if (!isNaN(points)) {
      this[_totalPoints] += points;
      context.getTemplateRanking();
    }
  }

  /** Read person _totalPoints. A private property only modicable inside person instance */
  getTotalPoints() {
    return this[_totalPoints];
  }

  /** Add a gradded task linked to person with its own mark. */
  addGradedTask(taskInstance,points) {
    this.gradedTasks.push({'task':taskInstance,'points':0});
  }

  /** Add a Attitude task linked to person with its own mark. */
  addAttitudeTask(taskInstance) {
    this.attitudeTasks.push({'task':taskInstance});
    this[privateAddTotalPoints](parseInt(taskInstance.points));
    context.notify('Added ' + taskInstance.description + ' to ' + this.name + ',' + this.surname);
  }

  /** Renders HTML person view Create a table row (tr) with
   *  all name, attitudePoints , add button and one input for 
   * every gradded task binded for that person. */
  getHTMLView() {
    let liEl = document.createElement('tr');
    let check = document.createElement('input');
    check.type = 'checkbox';
    check.value = hashcode(this.name + this.surname);
    check.name = 'check';
    let checkEl = getElementTd(check);
    let delElement = document.createElement('a');
    delElement.setAttribute('class', 'btn btn-danger');
    delElement.setAttribute('href', '#delete/' + hashcode(this.name + this.surname));
    delElement.innerHTML = '<i class="fa fa-ban" aria-hidden="true"></i>';
    let delEl = getElementTd(delElement);

    let editElement = document.createElement('a');
    editElement.setAttribute('class', 'btn btn-edit');
    editElement.setAttribute('href', '#edit/' + hashcode(this.name + this.surname));
    editElement.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';
    let edEl = getElementTd(editElement);
    liEl.appendChild(checkEl);
    liEl.appendChild(edEl);
    liEl.appendChild(delEl);

    let anames = document.createElement('a');
    anames.setAttribute('href', '#details/' + hashcode(this.name + this.surname));
    anames.setAttribute('class', 'ksat');
    anames.innerHTML = this.surname + ', ' + this.name;
    let esEL = getElementTd(anames);

    liEl.appendChild(esEL);

    liEl.appendChild(getElementTd(this[_totalPoints]));

    let addAttitudeTaskEl = document.createElement('a');
    addAttitudeTaskEl.setAttribute('class', 'btn btn-primary m-2');
    addAttitudeTaskEl.setAttribute('href', '#addAttitudeTask/' + hashcode(this.name + this.surname));
    addAttitudeTaskEl.innerText = '+XP';

    liEl.appendChild(getElementTd(addAttitudeTaskEl));
    let that = this;
    console.log([...this.gradedTasks].reverse());
    [...this.gradedTasks].reverse().slice(0,context.showNumGradedTasks).forEach(function(gTaskItem) {
        let inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.min = 0;
        inputEl.max = 100;
        inputEl.value = gTaskItem['points'];
        inputEl.addEventListener('change', function(event) {
            that[privateAddTotalPoints](parseInt(gTaskItem['points'] * (-1)));
            gTaskItem['points'] = inputEl.value;
            that[privateAddTotalPoints](parseInt(gTaskItem['points']));
          });
        liEl.appendChild(getElementTd(inputEl));
      });

    return liEl;
  }
}

export default Person;
