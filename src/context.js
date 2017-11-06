/**
 * Context class. Devised to control every element involved in the app: students, gradedTasks ...
 *
 * @constructor
 * @tutorial pointing-criteria
 */

/*jshint -W061 */

import Person from './person.js';
import GradedTask from './gradedtask.js';
import AttitudeTask from './attitudetask.js';
import {formatDate,hashcode,getElementTd,deleteContent,loadTemplate,checkregex,popupwindow} from './utils.js';

class Context {

  constructor() {
    this.students = new Map();
    this.gradedTasks = new Map();
    this.showNumGradedTasks = 1;

    if (localStorage.getItem('students')) {
      let students_ = new Map(JSON.parse(localStorage.getItem('students')));
      students_.forEach(function(value,key,student) {
        let person = new Person(value.name,value.surname,value.attitudeTasks,value.gradedTasks);
        this.students.set(key,person);
      }.bind(this));
      for (let i = 0;i < students_.length;i++) {
        debugger;
        let p = new Person(students_[i].name,students_[i].surname,
          students_[i].attitudeTasks,students_[i].gradedTasks);
        this.students.set(hashcode(students_[i].name + students_[i].surname),p);
      }
    }
    if (localStorage.getItem('gradedTasks')) {
      let tasks_ = new Map(JSON.parse(localStorage.getItem('gradedTasks')));
      tasks_.forEach(function(value,key,task) {
        let gtask = new GradedTask(value.name,value.description,value.weight);
        this.gradedTasks.set(key,gtask);
      }.bind(this));
    }
    if (localStorage.getItem('showNumGradedTaks')){
      this.showNumGradedTasks = JSON.parse(localStorage.getItem('showNumGradedTaks'));
    }
  }
  /** Init nav bar menu and manipulate evetntlisteners to menu items */
  initMenu() {
    
  }

  /** Draw Students rank table in descendent order using points as a criteria */
  getTemplateRanking() {
    if (this.students && this.students.size > 0) {
      /* We sort students descending from max number of points to min */
      let nstudents = [...this.students];
      let tasks = [...this.gradedTasks];
      nstudents.sort(function(a, b) {
        return (b[1].getTotalPoints() - a[1].getTotalPoints());
      });
      localStorage.setItem('students',JSON.stringify(nstudents));
      let GRADED_TASKS = '';
      [...this.gradedTasks].reverse().slice(0,context.showNumGradedTasks).forEach(function(tasks,index) {
        if(index === [...this.gradedTasks].reverse().slice(0,context.showNumGradedTasks).length -1 ) {
          GRADED_TASKS += '<th class="p-2"><a class="task" href="#detailTask/' + hashcode(tasks[1].name + tasks[1].description) + '">' + tasks[1].name +'</a>&nbsp&nbsp&nbsp&nbsp<a class="btn btn-primary" href="#moreTasks"><i class="fa fa-plus-circle" aria-hidden="true"></i></a></th>';
        }else{
          GRADED_TASKS += '<th class="p-2"><a class="task" href="#detailTask/' + hashcode(tasks[1].name + tasks[1].description) + '">' + tasks[1].name +'</a></th>';
        }
      }.bind(this));
      loadTemplate('templates/rankingList.html',function(responseText) {
              document.getElementById('content').innerHTML = eval('`' + responseText + '`');
              let tableBody = document.getElementById('idTableRankingBody');
              for (let i = 0; i < this.students.size; i++) {
                let liEl = nstudents[i][1].getHTMLView();
                tableBody.appendChild(liEl);
              }

            }.bind(this));
    }
  }

  /** Create a form to create a GradedTask that will be added to every student */
  addGradedTask() {

    let callback = function(responseText) {
      let nstudents = [...this.students];
            let saveGradedTask = document.getElementById('newGradedTask');
            saveGradedTask.addEventListener('submit', () => {
              let name = document.getElementById('idTaskName').value;
              let description = document.getElementById('idTaskDescription').value;
              let weight = document.getElementById('idTaskWeight').value;
              let gtask = new GradedTask(name,description,weight);

              this.gradedTasks.set(hashcode(name + description),gtask);
              console.log(nstudents);
              for (let i = 0; i < this.students.size; i++) {
                //nstudents[i][1].gradedTasks.push(gtask);
                nstudents[i][1].addGradedTask(gtask);
                console.log(nstudents[i][1]);
              }
              localStorage.setItem('gradedTasks',JSON.stringify([...this.gradedTasks]));
              localStorage.setItem('students',JSON.stringify(nstudents));
              this.getTemplateRanking();
            });
          }.bind(this);

    loadTemplate('templates/addGradedTask.html',callback);
  }
  /** Add a new person to the context app */
  addPerson() {

    let callback = function(responseText) {
            let saveStudent = document.getElementById('newStudent');
            let tasks = [...this.gradedTasks];
            saveStudent.addEventListener('submit', () => {
              let name = document.getElementById('idFirstName').value;
              let surnames = document.getElementById('idSurnames').value;
              let student = new Person(name,surnames,[],[]);
              for (let i = 0; i < this.gradedTasks.size;i++) {
                console.log(student);
                student.addGradedTask(new GradedTask(tasks[i][1].name,tasks[i][1].description));
              }
              this.students.set(hashcode(name + surnames),student);
              localStorage.setItem('students',JSON.stringify([...this.students]));
            });
          }.bind(this);

    loadTemplate('templates/addStudent.html',callback);
  }
  deletePerson(id) {
    this.students.delete(parseInt(id));
    localStorage.setItem('students',JSON.stringify([...this.students]));
    this.getTemplateRanking();
  }
  editPerson(id) {
    let callback = function(responseText) {
      let student = this.students.get(id);
      console.log(student);
      let name = document.getElementById('idFirstName').value = student.name;
      let surname = document.getElementById('idSurnames').value = student.surname;
      let saveStudent = document.getElementById('newStudent');
      saveStudent.addEventListener('submit', () => {
        let newname = document.getElementById('idFirstName').value;
        let newsurname = document.getElementById('idSurnames').value;
        let p = new Person(newname,newsurname,student.attitudeTasks,student.gradedTasks);
        this.students.delete(id);
        this.students.set(hashcode(newname + newsurname),p);
        localStorage.setItem('students',JSON.stringify([...this.students]));
      });
    }.bind(this);

    loadTemplate('templates/addStudent.html',callback);

  }
  detailPerson(id) {
    console.log(id);
    console.log('detail');
    let student = this.students.get(id);
    loadTemplate('templates/detailStudent.html',function(responseText) {
      let STUDENT = student;
      let ATTITUDE_TASKS = '';
      console.log(STUDENT);
      student.attitudeTasks.reverse().forEach(function(atItem) {
        ATTITUDE_TASKS += '<div class="post ter"><div class="preview">' + atItem.task.description + '</div><div class="detail">' +
        atItem.task.points + '->' + formatDate(new Date(atItem.task.datetime)) + '</div></div>';
      });
      let GRADED_TASKS = '';
      student.gradedTasks.forEach(function(gtItem) {
        GRADED_TASKS += '<div class="post sec"><div class="preview">' + gtItem.task.name + '</div><div class="detail">' +
        gtItem.points + ' points <br> Created:  ' + formatDate(new Date(gtItem.task.datetime)) + '</div></div>';
      });
      document.getElementById('content').innerHTML = eval('`' + responseText + '`');
    }.bind(this));

  }
  detailTask(id) {
    let task = this.gradedTasks.get(id);
    console.log(task.name);
    console.log(task);
    loadTemplate('templates/detailTask.html',function(responseText) {
      let TASK = task;
      let TEST = '';
      let ID = hashcode(task.name + task.description);
      console.log(TASK);
      console.log(this.students.size);
      for (let i = 0; i < this.students.size; i++) {
        let stu = [...this.students];
        let taskslenght = stu[i][1].gradedTasks;
        for (let j = 0; j < taskslenght.length;j++) {
          console.log(taskslenght);
          if (hashcode(taskslenght[j].task.name + taskslenght[j].task.description) === id){
            console.log('igual');
            console.log(stu[i][1]);
            TEST += '<p>' + stu[i][1].name + ' have ' + taskslenght[j].points + ' points in this task' + '</p>'
          }
        }
      }
      document.getElementById('content').innerHTML = eval('`' + responseText + '`');
    }.bind(this));
  }

  addAttitudeTask(id) {
    let student = this.students.get(id);
    let popUp = popupwindow('templates/listAttitudeTasks.html','XP points to ' +
    student.name,300,400);
    let personInstance = student;
    popUp.onload = function() {
      popUp.document.title = personInstance.name + ' ' +
        personInstance.surname + ' XP points';
      let xpButtons = popUp.document.getElementsByClassName('xp');
      Array.prototype.forEach.call(xpButtons,function(xpBItem) {
        xpBItem.addEventListener('click', () => {
          popUp.close();
          personInstance.addAttitudeTask(new AttitudeTask('XP task',
                  xpBItem.innerHTML,xpBItem.value));
          window.history.pushState("" , "", '/');
        });
      });
    };
    this.students.set(hashcode(student.name+student.surname),personInstance);
    localStorage.setItem('students',JSON.stringify([...this.students]));
    this.getTemplateRanking();
  }
  deleteSelected(){
    let check = document.getElementsByName('check');
    console.log(check);
    for (let i = 0; i < check.length; i++) {
      console.log(check);
      if (check[i].checked){
        console.log('si');
        this.students.delete(parseInt(check[i].value));
      }
    }
    localStorage.setItem('students',JSON.stringify([...this.students]));
    this.getTemplateRanking();
  }

  deleteTask(id) {
    this.gradedTasks.delete(id);
    for (let i = 0; i < this.students.size; i++) {
      let scont = [...this.students][0][1];
      for (let j = 0; j < scont.gradedTasks.length; j++){
        if (hashcode(scont.gradedTasks[j].task.name + scont.gradedTasks[j].task.description) == id){
          scont.gradedTasks.splice(j, 1);
          this.students.delete(parseInt(hashcode(scont.name+ scont.surname)));
          this.students.set(hashcode(scont.name + scont.surname), scont);
          localStorage.setItem('students',JSON.stringify([...this.students]));
          localStorage.setItem('gradedTasks',JSON.stringify([...this.gradedTasks]));
        }
      }
    }
    window.history.pushState("" , "", '/');
  }
  editTask(id) {
    let callback = function(responseText) {
      let task = this.gradedTasks.get(id);
      let ntasks = [...this.students];
            let saveGradedTask = document.getElementById('newGradedTask');
            let name = document.getElementById('idTaskName').value = task.name;
            let description = document.getElementById('idTaskDescription').value = task.description;
            let weight = document.getElementById('idTaskWeight').value = task.weight;
            saveGradedTask.addEventListener('submit', () => {
              let newname = document.getElementById('idTaskName').value;
              let newdescription = document.getElementById('idTaskDescription').value;
              let newweight = document.getElementById('idTaskWeight').value;
              let gtask = new GradedTask(newname,newdescription,newweight);
              this.gradedTasks.delete(hashcode(name+description));
              this.gradedTasks.set(hashcode(newname + newdescription),gtask);
              for (let i = 0 ; i < this.students.size; i++) {
                let scont = [...this.students][i][1];
                for (let j= 0; j < scont.gradedTasks.length;j++){
                  if(hashcode(scont.gradedTasks[j].task.name+scont.gradedTasks[j].task.description) === id) {
                    scont.gradedTasks[j].task.name = newname;
                    scont.gradedTasks[j].task.description = newdescription;
                    scont.gradedTasks[j].task.weight = newweight;
                  }
                }
              }
              localStorage.setItem('gradedTasks',JSON.stringify([...this.gradedTasks]));
              this.getTemplateRanking();
            });
          }.bind(this);

    loadTemplate('templates/addGradedTask.html',callback);
  }


  /** Add last action performed to lower information layer in main app */

  notify(text) {
    document.getElementById('notify').innerHTML = text;
  }
}

export let context = new Context(); //Singleton export
