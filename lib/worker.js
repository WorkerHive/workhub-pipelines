export default function Worker(opts, step){
    let { docker } = opts;

    return {
        input: opts.in,
        output: opts.out,
        dockerImage: step.dockerImage,
        startWorker: () => {
            docker.create(step.dockerImage, {
                MQ_QUEUE_IN: opts.in,
                MQ_QUEUE_OUT: opts.out
            })
        }
    }
}