import fs from 'fs';
import Pipeline from './lib/pipeline.js';
import DockerStore from './lib/docker.js';


const readPipeline = (dir, imageStore) => {
  let pipeline = fs.readFileSync(`${dir}/converter.spec.json`, 'utf8')
  try{
   pipeline = Pipeline(JSON.parse(pipeline), imageStore)
   return pipeline;
  }catch(e){
    console.log(e)
  }
}

export default function PipelineManager(){
  let imageStore = DockerStore();

  let pipelines = [
    readPipeline('./pipelines/stp2glb', imageStore)
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
