// This example from https://nodejs.org/dist/latest/docs/api/worker_threads.html
// Documentation code redistributed under the MIT license.
// Copyright Node.js contributors

const { AsyncResource } = require('node:async_hooks');
const { EventEmitter } = require('node:events');
const { Worker } = require('node:worker_threads');

const kTaskInfo = Symbol('kTaskInfo');
const fucker = Symbol('fucker');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class WorkerPoolTaskInfo extends AsyncResource {
  constructor(callback) {
    super('WorkerPoolTaskInfo');
    this.callback = callback;
  }

  done(err, result) {
    this.runInAsyncScope(this.callback, null, err, result);
    this.emitDestroy();  // `TaskInfo`s are used only once.
  }
}

//export default 
module.exports = class WorkerPool extends EventEmitter {
  constructor(numThreads) {
    super();
    this.numThreads = numThreads;
    this.workers = [];
    this.freeWorkers = [];
    this.tasks = [];
    this.treadId = null;

    for (let i = 0; i < numThreads; i++)
      this.addNewWorker();

    // Any time the kWorkerFreedEvent is emitted, dispatch
    // the next task pending in the queue, if any.
    this.on(kWorkerFreedEvent, () => {
      if (this.tasks.length > 0) {
        const { task, callback } = this.tasks.shift();
        console.log('free event');
        this.runTask(task, callback);
      }
    });
    
    this.on(fucker, this.onMsg)
    
  }

  addNewWorker() {
    // const worker = new Worker(new URL('worker.js', import.meta.url));
    const worker = new Worker('./worker.js',{ });
    worker.ref();
    worker.on('message', (result) => {
      // In case of success: Call the callback that was passed to `runTask`,
      // remove the `TaskInfo` associated with the Worker, and mark it as free
      // again.
    if(worker[kTaskInfo]) {
     worker[kTaskInfo].done(null, result);
    
     let ku=JSON.parse(result);
   
   if(ku.type == "progress"){ 
	
	    return;
	    }else if(ku.type == "anfang"){
			
			return;
		}
 }
  
      worker[kTaskInfo] = null;
      this.freeWorkers.push(worker);
      this.emit(kWorkerFreedEvent);
    });
    
    
    worker.on('online', (d)=>{
		console.log("worker=", worker.threadId, " is online! ", d);
		//this.emit(fucker, { threadId: worker.threadId });
	});
    
    
    worker.on('error', (err) => {
      // In case of an uncaught exception: Call the callback that was passed to
      // `runTask` with the error.
      if (worker[kTaskInfo]){
        worker[kTaskInfo].done(err, null);
        
      }else{
		  console.log("ERROR WORKER:", err);
        this.emit('error', err);
	}
      // Remove the worker from the list and start a new Worker to replace the
      // current one.
      this.workers.splice(this.workers.indexOf(worker), 1);
      this.addNewWorker();
    });
    this.threadId = worker.threadId;
    this.workers.push(worker);
    this.freeWorkers.push(worker);
    this.emit(kWorkerFreedEvent);
  }
 
  runTask(task, callback) {
    if (this.freeWorkers.length === 0) {
      // No free threads, wait until a worker thread becomes free.
      callback(null, JSON.stringify({ type: "busy", message: "Все ресурсы заняты. Пожалуйста, повторите попытку позднее!"}));
    //  this.tasks.push({ task, callback });
      return;
    }

    const worker = this.freeWorkers.pop();
    worker[kTaskInfo] = new WorkerPoolTaskInfo(callback);
    console.log("IN worker pool threadid ", worker.threadId);
    task.threadId = worker.threadId;
    console.log("task:", task);
   // worker.ref();
    worker.postMessage(task);
    // worker.postMessage(task);
  }

  close() {
    for (const worker of this.workers) worker.terminate();
  }
  getId(){
	  
	  return this.threadId;
  }
  onMsg(cb){
	 this.emit("fuck", cb);
	 
  }
  closeThat(path, threadId){
	  for (const worker of this.workers) {
		  console.log("mama: ", worker.threadId," ", threadId);
		  if(worker.threadId == threadId){
		   if (worker[kTaskInfo]){
				   console.log("aha match!");
				   worker.postMessage({type:"fertig"});
      worker[kTaskInfo].done(null, JSON.stringify({type:"error", message: "worker closed!", filename: path }));
      
	  worker[kTaskInfo] = null;
	 // worker.unref();
      this.freeWorkers.push(worker);
     // worker.terminate();
      this.emit(kWorkerFreedEvent);
      worker.terminate();
      break;
		   } 
	   }
	  }
	  
	  let a = this.getId();
	  console.log("ID: ", a, " lengs ", this.workers.length);

  }
}

















