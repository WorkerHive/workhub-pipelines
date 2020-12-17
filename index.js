import fs from 'fs';
import Pipeline from './lib/pipeline.js';
import DockerStore from './lib/docker.js';

let imageStore = DockerStore();

const readPipeline = (dir, imageStore) => {
  let pipeline = fs.readFileSync(`${dir}/converter.spec.json`, 'utf8')
  try{
   pipeline = Pipeline(JSON.parse(pipeline), imageStore)
   return pipeline;
  }catch(e){
    console.log(e)
  }
}

export default function PipelineManager(imageStore){

  let pipelines = [
    readPipeline('./pipelines/stp2glb', imageStore)
  ];


  return {
    getPipelines: () => {
      return pipelines;
    },
    getPipeline: (id) => {
      return pipelines.filter((a) => a.id == id)[0]
    }
  }
}

let p = PipelineManager(imageStore).getPipeline('workhub/stp2glbpacker')

p.workers[2].startWorker()
console.log(p)
