import "./styles.css";
import { format, parse, set } from "date-fns";

class Task {
    constructor (title, description, dueDate, priority) {
        this.title = title;
        this.description = description
        // Assume that the date given is formatted mm/dd/yyyy, ex "02/21/1999".
        this.dueDate = parse(`${dueDate}`, 'MM/dd/yyyy', new Date());
        // Priority goes from 1 to 5, with 1 being most prioritized and 5 being least prioritized.
        this.priority = priority;
    }

    // Literally just a copy of the constructor
    edit (title, description, dueDate, priority) {
        this.title = title;
        this.description = description
        // Assume that the date given is formatted mm/dd/yyyy, ex "02/21/1999".
        this.dueDate = parse(`${dueDate}`, 'MM/dd/yyyy', new Date());
        // Priority goes from 1 to 5, with 1 being most prioritized and 5 being least prioritized.
        this.priority = priority;
    }

    formatTask () {
        return `Title: ${this.title}, Due date: ${format(this.dueDate, "MM/dd/yyyy")}, Priority: ${this.priority} \nDescription: ${this.description}`;
    }

    formatDate () {
        return format(this.dueDate, "MM/dd/yyyy");
    }

    formatDateForm () {
        return format(this.dueDate, "yyyy-MM-dd");
    }

    printTask () {
        console.log(this.formatTask());
    }

    getTitleToString () {
        return `${this.title}`;
    }

}

class Project {
    constructor (name) {
        this.name = name;
        this.tasks = [];
    }

    addTask (title, description, dueDate, priority) {
        this.tasks.push(new Task(title, description, dueDate, priority));
    }

    changeName (name) {
        this.name = name;
    }

    getTaskAtIndex (index) {
        return this.tasks[index];
    }

    // Sends an array containing all the tasks in the project formatted
    formatAllTasks () {
        return this.tasks.map((task) => task.formatTask());
    }

    // Runs the printTask method on all tasks in project
    printAllTasks () {
        this.tasks.forEach((task) => task.printTask())
    }
}

// Controls all the projects using the projects array
// Has methods to edit the projects in each array.
function ProjectController () {
    const projects = [];

    const addProject = (name) => {
        projects.push(new Project(`${name}`));
    };

    const removeProject = (projectIndex) => {
        projects.splice(projectIndex, 1);
    }

    const editProject = (index, name) => {
        getProjectByIndex(index).changeName(name);
    }

    const getProjectByIndex = (index) => projects[index];

    const getProjectName = (index) => getProjectByIndex(index).name;

    const getTask = (projectIndex, taskIndex) => projects[projectIndex].getTaskAtIndex(taskIndex);

    const formatAllTasksByIndex = (index) => getProjectByIndex(index).formatAllTasks();

    const getAllProjectNames = () => projects.map((project) => project.name);

    // Runs the addTask method to the project at the given index
    const addTaskToProject = (index, title, description, dueDate, priority) => {
        getProjectByIndex(index).addTask(title, description, dueDate, priority);
    }

    const removeTask = (projectIndex, taskIndex) => {
        getProjectByIndex(projectIndex).tasks.splice(taskIndex, 1);
    };

    // Edits task at the given indices
    const editTask = (projectIndex, tasksIndex, title, description, dueDate, priority) => {
        getTask(projectIndex, tasksIndex).edit(title, description, dueDate, priority);
    };

    const clearAll = () => {
        projects.length = 0;
    };

    // For local storage stuff
    // Returns a JSON string of the projects array
    const stringify = () => {
        return JSON.stringify(projects, null, 1);
    }

    // Parses JSON and replaces what's currently in projects with the JSON data
    const parse = (string) => {
        clearAll();
        let projectNameTemp = "";
        let projectIndexTemp = -1;
        let taskTitleTemp;
        let taskDescTemp;
        let taskDateTemp;
        let taskPriorityTemp;
        // Parse takes advantage of the way the data is ordered in the parse
        // Since the parse goes [name] (for project), [title, desc, date, priority] (for projects), 
        // and then the tasks repeat for each task until it gets to another name for some other project
        JSON.parse(string, (key, value) => {
            // console.log(`Key: ${key}, Value: ${value}`);
            // Checks for project name
            if (key === "name") {
                projectNameTemp = value;
                addProject(projectNameTemp);
                projectIndexTemp++;
            } 
            
            // Checks for content of a task
            if (key === "title") {
                taskTitleTemp = value;
            } else if (key === "description") {
                taskDescTemp = value;
            } else if (key === "dueDate") {
                taskDateTemp = format(new Date(value),  "MM/dd/yyyy");
            } else if (key === "priority") {
                taskPriorityTemp = value;
                addTaskToProject(projectIndexTemp, taskTitleTemp, taskDescTemp, taskDateTemp, taskPriorityTemp);
            }
        });
    }

    // Adds some default values to allProjects, so that the projects list always has some value
    const addDefault = () => {
        addProject("Make Todo List");
        addTaskToProject(0, "Make the webpage work", "Add functionality to webpage. Check that all the buttons work.", "07/30/2026", 1);
        addTaskToProject(0, "Fix bugs", "Make sure forms work properly and make sure that adding and removing works too.", "07/30/2026", 2);
        addTaskToProject(0, "Fix more bugs", "Make sure that dates work.", "7/27/2026", 3);
    }

    // The functions below are for console functionality
    const printAllProjectNames = () => {
        console.log(`${getAllProjectNames().join(", ")}`);
    }

    const printTask = (projectIndex, taskIndex) => {
        console.log(getTask(projectIndex, taskIndex).formatTask())
    };

    const printAllTasksByIndex = (index) => {
        console.log(`In ${projects[index].name} \n${getProjectByIndex(index).formatAllTasks().join("\n \n")}`);
    };

    const printAll = () => {
        console.log("Printing all...");
        projects.forEach((project) => printAllTasksByIndex(projects.indexOf(project)));
    }

    return {
        getProjectByIndex,
        addProject,
        removeProject,
        editProject,
        getTask,
        addTaskToProject,
        removeTask,
        editTask,
        clearAll,
        stringify,
        parse,
        addDefault,
        getProjectName,
        getAllProjectNames,
        printAllProjectNames,
        printTask,
        printAllTasksByIndex,
        printAll,
    };
}

// Uses stuff from the ProjectController to update the webpage.
function ScreenController () {
    // Variable containing all the stuff from projectController
    const allProjects = ProjectController();

    // Contains a JSON string that gets saved to localStorage
    let saveData;

    // Variable for the div in the sidebar that gets filled with the project names
    const projectSidebar = document.getElementById("projects");

    // Variable for reset button
    const resetButton = document.querySelector("#reset");

    // Variables for the header that says the name of the current project and the buttons next to it
    // Also the add task button
    // The projectEditButton is for the form not the one on the page
    const projectHeader = document.getElementById("project-title");
    const projectEditDialogButton = document.getElementById("open-edit-project-dialog");
    const projectEditButton = document.getElementById("submit-project-edit");
    const projectRemoveButton = document.getElementById("remove-project");
    const taskAddButton = document.getElementById("submit-task");

    // Variable for the div that gets filled with tasks
    const tasksDiv = document.getElementById("tasks");

    // Variables for the edit project form 
    const projectEditDialog = document.querySelector("#edit-project-dialog");
    const projectEditForm = document.querySelector("#edit-project");
        // Edit project form value
    const projectEditInput = document.querySelector("#name-edit");

    // Variables for the edit task form
    const taskEditDialog = document.querySelector("#edit-task-dialog");
    const taskEditForm = document.querySelector("#edit-task");
    const taskEditFormButton = document.querySelector("#submit-task-edit");

        // Edit task form values
    const taskEditTitle = document.querySelector("#title-edit");
    const taskEditDueDate = document.querySelector("#date-edit");
    const taskEditPriority = document.querySelector("#priority-edit");
    const taskEditDesc = document.querySelector("#description-edit");

    // Variables for the add project form
    const projectAddDialog = document.querySelector("#project-dialog");
    const projectAddForm = document.querySelector("#add-project");
    const projectAddButton = document.querySelector("#submit-project");
        // Add project form value
    const projectAddInput = document.querySelector("#name");

    // Variables for the add task form
    const taskAddDialog = document.querySelector("#add-task-dialog");
    const taskAddForm = document.querySelector("#add-task");

        // Add task form values
    const taskAddTitle = document.querySelector("#title-add");
    const taskAddDueDate = document.querySelector("#date-add");
    const taskAddPriority = document.querySelector("#priority-add");
    const taskAddDesc = document.querySelector("#description-add");

    // Regex for the dates on the forms
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

    // Value is the index of the project whose todo's are currently being shown
    let currentProject = 0;

    // Populates the projects div in the sidebar and gives each div the index of their respective project as data
    // Also darkens the div corresponding to currentProject
    function populateSideBar () {
        projectSidebar.replaceChildren();
        allProjects.getAllProjectNames().forEach((name, index) => {
            const projectDiv = document.createElement("div");
            const projectName = document.createElement("h2");

            projectDiv.setAttribute("class", "project");
            projectDiv.setAttribute("data-project", index);
            projectName.textContent = name;

            if (index === currentProject) {
                projectDiv.classList.add("selected");
            }

            projectDiv.appendChild(projectName);
            projectSidebar.appendChild(projectDiv);
        });
    }

    // Changes the name in the header 
    // Also changes the data-project to be the currentProject on the buttons in the header 
    // and the button to add tasks on the form
    function populateHeader () {
        projectHeader.textContent = allProjects.getProjectName(currentProject);
        projectEditButton.setAttribute("data-project", currentProject);
        taskAddButton.setAttribute("data-project", currentProject);
    }

    function populateTasks () {
        tasksDiv.replaceChildren();
        allProjects.getProjectByIndex(currentProject).tasks.forEach((task, index) => {
            tasksDiv.appendChild(createTaskElement(task, currentProject, index));
        });
    }

    // Since the task elements are a lot more complicated than the header and sidebar
    // this function just returns a complete task element to make things more streamlined
    function createTaskElement (task, projectIndex, taskIndex) {
        const taskDiv = document.createElement("div")
        taskDiv.setAttribute("class", "task");
        const taskTitle = document.createElement("p")
        taskTitle.setAttribute("class", "task-title");
        const taskDueDate = document.createElement("p")
        taskDueDate.setAttribute("class", "due-date");
        const taskPriority = document.createElement("p")
        taskPriority.setAttribute("class", "priority");

        const taskEditButton = document.createElement("button")
        taskEditButton.setAttribute("command", "show-modal");
        taskEditButton.setAttribute("commandfor", "edit-task-dialog");
        taskEditButton.setAttribute("data-task", taskIndex);
        const taskRemoveButton = document.createElement("button")
        taskRemoveButton.setAttribute("class", "remove-task");
        taskRemoveButton.setAttribute("data-task", taskIndex);

        // Event listener to remove task
        // Made here because it has to be unique to each task
        taskRemoveButton.addEventListener("click", (event) => {
            const target = event.target;
            removeTask(currentProject, target.getAttribute('data-task'));
        });

        // Event listener to add data to the button on the edit dialog referring to this task
        // Made here for the same reasons as the other one
        // Also fills in the form with the values of the task to make things easier
        taskEditButton.addEventListener("click", (event) => {
            const target = event.target;
            taskEditFormButton.setAttribute("data-task", target.getAttribute("data-task"));
            taskEditTitle.value = task.title;
            taskEditDueDate.value = task.formatDateForm();
            taskEditPriority.value = task.priority;
            taskEditDesc.value = task.description;
        });

        const taskDesc = document.createElement("p")
        taskDesc.setAttribute("class", "description");

        taskTitle.textContent = task.title;
        taskDueDate.textContent = `Due: ${task.formatDate()}`;
        taskPriority.textContent = `Priority: ${task.priority}`;
        taskEditButton.textContent = "Edit Task";
        taskDesc.textContent = task.description;
        taskRemoveButton.textContent = "Remove Task";

        taskDiv.appendChild(taskTitle);
        taskDiv.appendChild(taskDueDate);
        taskDiv.appendChild(taskPriority);
        taskDiv.appendChild(taskEditButton);
        taskDiv.appendChild(taskRemoveButton);
        taskDiv.appendChild(taskDesc);

        return taskDiv;
    }

    // Runs methods to change the display
    function updateDisplay () {
        populateSideBar();
        populateHeader();
        populateTasks();
    }

    // Event listener that triggers when a project in the sidebar is clicked
    // Controls which project's tasks are shown
    projectSidebar.addEventListener("click", (event) => {
        const clickedProject = event.target.closest(".project");
        if (!clickedProject) return;

        if (currentProject != clickedProject.getAttribute('data-project')) {
            currentProject = parseInt(clickedProject.getAttribute('data-project'));
            updateDisplay();
        }
    });

    // The functions and event listeners below are for removing, editing, and adding projects

    // Removes current project and sets the displayed project to be the first project
    function removeProject (index) {
        allProjects.removeProject(index);
        currentProject = 0;
        updateDisplay();
        updateLocalStorage();
    }

    // Listener for remove project button
    // Prevents there being no projects since that will probably make a lot of bugs
    projectRemoveButton.addEventListener("click", (event) => {
        if (allProjects.getAllProjectNames().length === 1) return;
        removeProject(currentProject);
    });

    // Removes the task from projects and updates display
    // Event listener is made in the createTaskElement function
    function removeTask (projectIndex, taskIndex) {
        allProjects.removeTask(projectIndex, taskIndex);
        updateDisplay();
        updateLocalStorage();
    }

    // Edits the name of the current project and updates display
    function editProject (index, name) {
        allProjects.editProject(index, name);
        updateDisplay();
        updateLocalStorage();
    }

    // Event listener for the project edit button that opens the modal
    // Changes the value in the input to be the name of the current project to make things easier
    projectEditDialogButton.addEventListener("click", (event) => {
        projectEditInput.value = allProjects.getProjectName(currentProject);
    });


    // Event listener for the project edit button on the form
    projectEditButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (projectEditForm.checkValidity()) {
            editProject(currentProject, projectEditInput.value);
            projectEditForm.reset();
            projectEditDialog.close();
        }
    });

    // Edits the task and updates display
    function editTask (projectIndex, taskIndex, title, description, dueDate, priority) {
        allProjects.editTask(projectIndex, taskIndex, title, description, dueDate, priority);
        updateDisplay();
        updateLocalStorage();
    }

    // Event listener for the task edit button on the form
    taskEditFormButton.addEventListener("click", (event) => {
        event.preventDefault();
        const target = event.target;
        if (taskEditForm.checkValidity() && taskEditDueDate.value.match(dateRegex)) {
            editTask(currentProject, target.getAttribute("data-task"), taskEditTitle.value, taskEditDesc.value, convertFormDate(taskEditDueDate.value), taskEditPriority.value);
            taskEditForm.reset();
            taskEditDialog.close();
        }
    });

    // Adds a project to projects array in projectController and changes currentProject to be the project that was made
    // Also updates display
    function addProject (name) {
        allProjects.addProject(name);
        currentProject = allProjects.getAllProjectNames().length - 1;
        updateDisplay();
        updateLocalStorage();
    }

    // Event listener for the add project button on the form
    projectAddButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (projectAddForm.checkValidity()) {
            addProject(projectAddInput.value);
            projectAddForm.reset();
            projectAddDialog.close();
        }
    });

    // Add tasks to the current project
    function addTask (index, title, description, dueDate, priority) {
        allProjects.addTaskToProject(index, title, description, dueDate, priority);
        updateDisplay();
        updateLocalStorage();
    }

    taskAddButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (taskAddForm.checkValidity() && taskAddDueDate.value.match(dateRegex)) {
            addTask(currentProject, taskAddTitle.value, taskAddDesc.value, convertFormDate(taskAddDueDate.value), taskAddPriority.value);
            taskAddForm.reset();
            taskAddDialog.close();
        }
    });

    // Converts the form's date from yyyy-MM-dd to MM/dd/yyyy and returns it as a string
    function convertFormDate (date) {
        let newDate = parse(`${date}`, 'yyyy-MM-dd', new Date())
        newDate = format(newDate, "MM/dd/yyyy");
        return newDate;
    }

    // Functions and event listeners below are for setting things up

    // Clears data in allProjects and adds the default values
    // Also clears localStorage
    function reset () {
        allProjects.clearAll();
        allProjects.addDefault();
        currentProject = 0;
        updateDisplay();
        clearLocalStorage();
    }

    resetButton.addEventListener("click", (event) => {
        reset();
    });

    // Methods to handle local storage
    // Updates saveData to contain JSON string of allProjects' data and then updates localStorage with that string
    function updateLocalStorage () {
        saveData = allProjects.stringify();
        if (storageAvailable("localStorage")) {
            localStorage.setItem("projects", saveData);
        } else {
            return;
        }
    }

    function clearLocalStorage () {
        localStorage.clear();
    }

    // Function from mdn docs to check if localStorage is available and usable
    function storageAvailable(type) {
        let storage;
        try {
            storage = window[type];
            const x = "__storage_test__";
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
            );
        }
    }

    // Method that's called when the page opens
    // Checks for projects in localStorage and if it doesn't exist it adds some default values
    // And if projects does exist it gets that data and puts it in allProjects 
    function startUp () {
        if (!localStorage.getItem("projects")) {
            allProjects.addDefault();
        } else {
            allProjects.parse(localStorage.getItem("projects"));
        }
        updateDisplay();
    }
    
    // Gets called once when screenController is called
    startUp();
}

ScreenController();