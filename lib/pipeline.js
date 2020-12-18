import Worker from './worker.js';

export default function Pipeline(jsonMap, docker, mq){
  let pipelineMap = jsonMap;

  let queues = {
    startQueue: pipelineMap.pipeline.steps.filter((step) => pipelineMap.pipeline.links.filter((a) => a.target == step.id).length == 0)[0].queue,
    queues: pipelineMap.pipeline.steps.map((x) => x.queue),
    finalQueue: pipelineMap.id
  }
  return {
    id: pipelineMap.id,
    name: pipelineMap.name,
    sourceFormat: pipelineMap.sourceFormat,
    targetFormat: pipelineMap.targetFormat,
    queues: queues,
    workers: pipelineMap.pipeline.steps.map((step) => {
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
        docker: docker
      }, step)
    }),
    watchPipeline: (watchFn) => {
      mq.watch(queues.finalQueue, watchFn)
    },
    runPipeline: (job_id, input_cid) => {
      mq.queue(queues.startQueue, {job_id, input_cid})
    },
    pullSteps: (imageStore = docker) => {
      for(var i = 0; i < pipelineMap.pipeline.steps.length; i++){
        imageStore.pull(pipelineMap.pipeline.steps[i].dockerImage)
      }
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
