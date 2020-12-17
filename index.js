import Pipeline from './lib/pipeline.js';
import DockerStore from './lib/docker.js';

import STP2GLB from './pipelines/stp2glb/converter.spec.js';


export default function PipelineManager(messageQueue){
  let imageStore = DockerStore();

  let pipelines = [
    Pipeline(STP2GLB, imageStore, messageQueue)
  ];

  return {
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
