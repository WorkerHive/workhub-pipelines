import Pipeline from './lib/pipeline.js';
import DockerStore from './lib/docker.js';

import STP2GLB from './pipelines/stp2glb/converter.spec.js';


export default function PipelineManager(swarmKey, messageQueue, watchFn){
  let imageStore = DockerStore(swarmKey);

  let pipelines = [
    Pipeline(STP2GLB, imageStore, messageQueue)
  ];

  pipelines.map((x) => {
    x.watchPipeline(watchFn)
  })

  return {
    swarmKey: swarmKey,
    getPipelines: () => {
      return pipelines;
    },
    getPipeline: (id) => {
      return pipelines.filter((a) => a.id == id)[0]
    },
    getPipelineFormat: (inFormat, outFormat) => {
      let pipes = pipelines.filter((a) => 
        (!inFormat || a.sourceFormat.toLowerCase() == inFormat.toLowerCase()) &&
        (!outFormat || outFormat.toLowerCase() == a.targetFormat.toLowerCase()))
      return pipes.length > 0 ? pipes[0] : null;
    }
  }
}
