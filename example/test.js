import PipelineManager from '../index.js';
import MQ from 'workhub-mq'

MQ({host: '172.17.0.2', user: 'guest', pass: 'guest'}).then(async (mq) => {
    const pipelines = await PipelineManager(mq, (job) => {
        console.log(job)
    })

    let pipeline = pipelines.getPipelines()[0];

    let workers = pipeline.workers;

    await pipeline.shutdownPipeline();

    //await pipeline.attachNetwork()
    
    await pipeline.runPipeline('test', 'tester')
    await pipeline.runPipeline('test', 'tester')
    await pipeline.runPipeline('test', 'tester')

    /*if(await workers[0].isInstalled() && !await workers[0].isRunning()){
        console.log(workers[0].getConfigs('rabbitmq:rabbit', 'rabbit1'))
        let worker = await workers[0].startWorker();
       
        
        console.log(worker)
    }*/
    

})
