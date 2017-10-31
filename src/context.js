/**
 * Context class. Devised to control every element involved in the app: students, gradedTasks ...
 *
 * @constructor
 * @tutorial pointing-criteria
 */

/*jshint -W061 */

import Person from './person.js';
import GradedTask from './gradedtask.js';
import {hashcode,getElementTd,deleteContent,loadTemplate} from './utils.js';

class Context {

  constructor() {
    this.students = new Map();
    this.gradedTasks = [];
    this.showNumGradedTasks = 1;

    if (localStorage.getItem('students')) {
      let students_ = new Map(JSON.parse(localStorage.getItem('students')));
      console.log(students_);
     students_.forEach(function(value,key,student){
        console.log(key);
        let person = new Person(value.name,value.surname,value.attitudeTasks,value.gradedTasks);
        console.log(person);
        this.students.set(key,person);
        console.log(this.students);
        //console.log(person);
        //this.students.set(student[0],person);
      }.bind(this));
      //console.log(this.students);
      for (let i = 0;i < students_.length;i++) {
        debugger;
        console.log(students_[i].name);
        let p = new Person(students_[i].name,students_[i].surname,
          students_[i].attitudeTasks,students_[i].gradedTasks);
        this.students.set(hashcode(students_[i].name+students_[i].surname),p);
        
        console.log(this.students);
      }
    }
    if (localStorage.getItem('gradedTasks')) {
      this.gradedTasks = JSON.parse(localStorage.getItem('gradedTasks'));
    }
  }
  /** Init nav bar menu and manipulate evetntlisteners to menu items */
  initMenu() {
    window.addEventListener('hashchange', function(){
      console.log(location.hash);
      switch (location.hash) {
        case '#addStudent':
        this.addPerson();
        break;
        case '#addGradedTask':
        this.addGradedTask();
        break;
        default:
        this.getTemplateRanking();
        break;
      }
      /*if (location.hash == ''){
       console.log('home');
      }else{
      console.log(location.hash);
      }*/
    }.bind(this));
  }

  /** Draw Students rank table in descendent order using points as a criteria */
  getTemplateRanking() {
    console.log(this.students);
    if (this.students && this.students.size > 0) {
      /* We sort students descending from max number of points to min */
      let nstudents = [...this.students];
      console.log(nstudents);
      debugger;
      nstudents.sort(function(a, b) {
        return (b[1].getTotalPoints() - a[1].getTotalPoints());
      });
      debugger;
      console.log(nstudents );
      localStorage.setItem('students',JSON.stringify(nstudents));
      let GRADED_TASKS = '';
      this.gradedTasks.forEach(function(taskItem) {
        GRADED_TASKS += '<td>' + taskItem.name + '</td>';
      });

      loadTemplate('templates/rankingList.html',function(responseText) {
              document.getElementById('content').innerHTML = eval('`' + responseText + '`');
              let tableBody = document.getElementById('idTableRankingBody');
              this.students.forEach(function(studentItem) {
                let liEl = studentItem.getHTMLView();
                tableBody.appendChild(liEl);
              });
            }.bind(this));
    }
  }

  /** Create a form to create a GradedTask that will be added to every student */
  addGradedTask() {

    let callback = function(responseText) {
            let saveGradedTask = document.getElementById('newGradedTask');

            saveGradedTask.addEventListener('submit', () => {
              let name = document.getElementById('idTaskName').value;
              let description = document.getElementById('idTaskDescription').value;
              let weight = document.getElementById('idTaskWeight').value;
              let gtask = new GradedTask(name,description,weight);
              this.gradedTasks.push(gtask);
              localStorage.setItem('gradedTasks',JSON.stringify(this.gradedTasks));
              this.students.forEach(function(studentItem) {
                studentItem.addGradedTask(gtask);
              });
              this.getTemplateRanking();
            });
          }.bind(this);

    loadTemplate('templates/addGradedTask.html',callback);
  }
  /** Add a new person to the context app */
  addPerson() {

    let callback = function(responseText) {
            let saveStudent = document.getElementById('newStudent');

            saveStudent.addEventListener('submit', () => {
              let name = document.getElementById('idFirstName').value;
              let surnames = document.getElementById('idSurnames').value;
              let student = new Person(name,surnames,[],[]);
              this.gradedTasks.forEach(function(iGradedTask) {
                    student.addGradedTask(new GradedTask(iGradedTask.name));
                  });
              this.students.set(hashcode(name+surnames),student);
              localStorage.setItem('students',JSON.stringify([...this.students]));
            });
          }.bind(this);

    loadTemplate('templates/addStudent.html',callback);
  }
  /** Add last action performed to lower information layer in main app */

  notify(text) {
    document.getElementById('notify').innerHTML = text;
  }
}

export let context = new Context(); //Singleton export
