import fs from 'fs';
import path from 'path';
import Pipeline from './lib/pipeline.js';
import DockerStore from './lib/docker.js';


const readPipeline = (dir, imageStore, messageQueue) => {
  let pipeline = fs.readFileSync(`${dir}/converter.spec.json`, 'utf8')
  try{
   pipeline = Pipeline(JSON.parse(pipeline), imageStore, messageQueue)
   return pipeline;
  }catch(e){
    console.log(e)
  }
}

export default function PipelineManager(messageQueue){
  let imageStore = DockerStore();

  let pipelines = [
    readPipeline(path.resolve('') + '/pipelines/stp2glb', imageStore, messageQueue)
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
