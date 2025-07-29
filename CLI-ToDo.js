
import { input } from '@inquirer/prompts';
import fs from "fs";
import { parse } from 'path';
var file_path = "pack.json";
//done
async function choice() {
    console.log("This is a CLI-ToDoList-Javascript Project !!!\n");
    console.log("1. To Read the task which are left . \n ");
    console.log("2. To Create a new Task. \n");
    console.log("3. To Add new task in pervious note.\n");
    console.log("4. To Delete any task or Edit the task. \n");
    // console.log("5. To Edit the task which are Done.\n ")
    const arr = [1,2,3,4];
    const ask = await input({message :"Now Please Enter your Choice :: " })
    if(!arr.includes(parseInt(ask))){
        console.error("Invaild Input , Out of Bound !!")
    }
    else if (isNaN(ask) || ask === null){
        console.error("Please Enter Your Choice !!")
    }
    return parseInt(ask);
}


async function req_date(){
   const date_0 =  await input ({message:"Enter the date !! "});
   let date_1 = new Date(date_0);
   let formatting = new Intl.DateTimeFormat('en-IN').format(date_1);
   return formatting;
}


async function choice_1() {
  try {
    var filename = "pack.json";
    let ask = await input({message:"Please Enter your file name is you are uusing default file name then only enter default : "})
    if(ask.toLocaleLowerCase() !== "default"){
       filename = ask;
    }
    const dateToFind = await req_date();

    // Read and parse file
    const fileData = fs.readFileSync(filename, 'utf8');
    const tasks = JSON.parse(fileData);

    // Filter by date and task status (Done == false)
    const leftTasks = tasks.filter(t =>
      t.Date === dateToFind && t.Task.ToDo.Done === "false"
    );

    if (leftTasks.length === 0) {
      console.log(`🎉 No left/incomplete task found for date: ${dateToFind}`);
      return;
    }

    console.log(`📝 Incomplete Tasks for ${dateToFind}:\n`);

    for (const taskEntry of leftTasks) {
      const task = taskEntry.Task;
      console.log(`🔹 Task ID   : ${task.Task_Id}`);
      console.log(`   Task      : ${task.ToDo.Task_is}`);
      console.log(`   Completed : ❌`);
      console.log('-----------------------------------');
    }
  } catch (err) {
    console.error("❌ Error reading tasks:", err.message);
  }
}



async function choice_2() {
  try {
    let useDefault = await input({ message: "Enter yes if you want to make a new file else enter no to use the default file:", name: 'useDefault', type: 'input' });
    let fileName = 'pack.json';

    if (useDefault.toLowerCase() === "yes") {
      let fileResponse = await input({ message: "Enter the filename (with .json):", name: 'fileName', type: 'input' });
      fileName = fileResponse;

      if (!fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, '{}'); // Create empty JSON file if not exist
        console.log(`✅ Created new file: ${fileName}`);
      }
    }

    let data = {};
    if (fs.existsSync(fileName)) {
      const fileContent = fs.readFileSync(fileName, 'utf8');
      data = fileContent.trim() ? JSON.parse(fileContent) : {};
    }

    const taskDateInput = await input({ message: "Enter the date (yyyy-mm-dd):", name: 'taskDate', type: 'input' });
    const taskDate = taskDateInput;

    if (!data[taskDate]) {
      data[taskDate] = { tasks: [] };
    }

    while (true) {
      const taskIdInput = await input({ message: "Enter Task ID:", name: 'taskId', type: 'input' });
      const taskNameInput = await input({ message: "Enter Task Description:", name: 'taskName', type: 'input' });

      const task = {
        id: taskIdInput,
        task: taskNameInput,
        status: "false"
      };

      data[taskDate]["tasks"].push(task);

      const addMoreInput = await input({ message: "Do you want to add another task? (yes/no):", name: 'addMore', type: 'input' });
      if (addMoreInput.toLowerCase() !== 'yes') break;
    }

    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log(`✅ Tasks added successfully in ${fileName}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}


async function choice_3() {
  try {
    // Step 1: Ask if using default file
    const useDefault = await confirm({ message: "Were you using the default file (pack.json)?" });

    // Step 2: Determine file to use
    let fileName = 'pack.json';
    if (!useDefault) {
      fileName = await input({ message: "Enter the filename you were using (with .json):" });
    }

    // Step 3: Load the file (create empty if it doesn't exist)
    if (!fs.existsSync(fileName)) {
      fs.writeFileSync(fileName, '{}');
      console.log(`✅ New file created: ${fileName}`);
    }

    const fileData = fs.readFileSync(fileName, 'utf8');
    let data = fileData.trim() ? JSON.parse(fileData) : {};

    // Step 4: Ask for date
    const taskDate = await input({ message: "Enter the date (yyyy-mm-dd) to add the task under:" });

    // Step 5: Ask for task ID and description
    const taskId = await input({ message: "Enter the Task ID:" });
    const taskDesc = await input({ message: "Enter the Task Description:" });

    // Step 6: Prepare structure if not present
    if (!data[taskDate]) {
      data[taskDate] = { tasks: {} };
    }

    // Step 7: Add new task
    data[taskDate]["tasks"][taskId] = {
      task: taskDesc,
      status: "false"
    };

    // Step 8: Write back to file
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    console.log(`✅ Task added to '${fileName}' under date ${taskDate}`);
  } catch (err) {
    console.error("❌ Error adding task:", err.message);
  }
}


async function choice_4() {
  try {
    // Step 1: Ask action type
    const action = await select({
      message: "What would you like to do?",
      choices: [
        { name: "Delete a task", value: "delete" },
        { name: "Change task status", value: "status" }
      ]
    });

    // Step 2: Choose file
    const useDefault = await confirm({ message: "Are you using the default file (pack.json)?" });
    let fileName = useDefault ? "pack.json" : await input({ message: "Enter your custom file name (.json):" });

    // Step 3: Load the file
    if (!fs.existsSync(fileName)) {
      console.log("❌ File does not exist.");
      return;
    }

    const fileData = fs.readFileSync(fileName, 'utf8');
    let data = fileData.trim() ? JSON.parse(fileData) : {};

    // Step 4: Ask for date and task ID
    const date = await input({ message: "Enter the date of the task (yyyy-mm-dd):" });
    const taskId = await input({ message: "Enter the Task ID:" });

    if (!data[date] || !data[date]["tasks"] || !data[date]["tasks"][taskId]) {
      console.log("❌ Task not found for the given date and ID.");
      return;
    }

    if (action === "delete") {
      // Step 5: Delete the task
      delete data[date]["tasks"][taskId];
      console.log(`✅ Task '${taskId}' deleted from ${date}.`);

      // Cleanup: if no tasks left for the date
      if (Object.keys(data[date]["tasks"]).length === 0) {
        delete data[date];
      }
    } else {
      // Step 6: Change status
      const markDone = await confirm({ message: "Is the task completed?" });
      data[date]["tasks"][taskId].status = markDone ? "true" : "false";
      console.log(`✅ Status updated to '${markDone ? "true" : "false"}' for Task '${taskId}'.`);
    }

    // Step 7: Write updated data
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error in choice_4:", err.message);
  }
}

let k_0 = await choice();


async function checker(k_0){
    switch(k_0){
        case 1:
             await choice_1();
            break;
        case 2:
            await choice_2();
            break;
        case 3:
            await choice_3();
            break;
        case 4:
            await choice_4();
            break;
        default:
            console.error("Problem in code !!! sorry for the problem !!!");
    }
}

await checker(k_0);
