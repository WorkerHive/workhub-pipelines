import Worker from './worker.js';

export default function Pipeline(jsonMap, docker, mq){
  let pipelineMap = jsonMap;

  let queues = {
    startQueue: pipelineMap.pipeline.steps.filter((step) => pipelineMap.pipeline.links.filter((a) => a.target == step.id).length == 0)[0].queue,
    queues: pipelineMap.pipeline.steps.map((x) => x.queue),
    finalQueue: pipelineMap.id
  }

  let workers = pipelineMap.pipeline.steps.map((step) => {
    let forwardRefs = pipelineMap.pipeline.links
      .filter((link) => link.source == step.id)
      .map((x) => pipelineMap.pipeline.steps.filter((a) => a.id == x.target)[0])
    let outputQueue;
    if(forwardRefs.length > 0){
      outputQueue = forwardRefs[0].queue;
    }else{
      outputQueue = pipelineMap.id;
    }
    return Worker({
      in: step.queue,
      out: outputQueue,
      mq: mq,
      docker: docker
    }, step)
  })

  return {
    id: pipelineMap.id,
    name: pipelineMap.name,
    sourceFormat: pipelineMap.sourceFormat,
    targetFormat: pipelineMap.targetFormat,
    queues: queues,
    workers,
    attachNetwork: async (name) => {
      let networks = await docker.listNetworks()
      console.log(networks)
    },
    watchPipeline: (watchFn) => {
      mq.watch(queues.finalQueue, watchFn, (err, pressure) => {
        if(!err && pressure){
          if(pressure.messageCount < 1 && pressure.consumerCount > 0){

            //TODO set a timer to start shutting down these instances in 15 minutes if they're not used again
          }
        }
      })
    },
    runPipeline: async (job_id, input_cid) => {
      let pressure = await mq.queue(queues.startQueue, {job_id, input_cid})
      if(pressure.consumerCount < 1){
        //Start machines for pipeline
        await Promise.all(workers.map((x) => {
          return (async () => {
            let running = await x.isRunning();
            if(!running){
              await x.startWorker({host: mq.host, port: '5672', auth: `${mq.user}:${mq.pass}`})
            }
          })()
        }))
      }
    },
    shutdownPipeline: async () => {
      return Promise.all(workers.map((x) => {
        return (async () => {
          let running = await x.isRunning();
          if(running){
            return await x.stopWorker()
          }
        })()
      }))
    },
    pullSteps: (imageStore = docker) => {
      async.each(workers, async (item, cb) => {
        await item.installWorker(cb)
      }, (err) => {
        if(err) return console.error(`Error installing pipeline ${pipelineMap.name}`)
        console.log(`=> Installed pipeline ${pipelineMap.name}`)
      })
    },
    validate: () => {
      let links = pipelineMap.pipeline.links.filter((link) => {

        let sourceNode = pipelineMap.pipeline.steps.filter((step) => step.id == link.source)[0]
        let targetNode = pipelineMap.pipeline.steps.filter((step) => step.id == link.target)[0]

        if(sourceNode.output != targetNode.input) return true; console.log("conflict in steps")

        return false;
      })

      if(links.length > 0) return false;

        let startNode = pipelineMap.pipeline.steps.filter((step) => pipelineMap.pipeline.links.filter((a) => a.target == step.id).length == 0)[0]
        let endNode = pipelineMap.pipeline.steps.filter((step) => pipelineMap.pipeline.links.filter((a) => a.source == step.id).length == 0)[0]

      if(startNode.input != pipelineMap.sourceFormat) {
        console.log("Start node doesn't support the right format")
        return false;
      }
        
      if(endNode.output != pipelineMap.targetFormat) {
        console.log("End node doesn't support the right format")
        return false;
      }
      return true;
    }
  }
}
