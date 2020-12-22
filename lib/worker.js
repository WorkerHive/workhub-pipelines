export default function Worker(opts, step){
    let { docker, mq } = opts;

    const isInstalled = async () => {
        let img = await docker.listImages()
        return img.filter((a) => a.RepoTags[0].split(':')[0].indexOf(step.dockerImage) > -1).length > 0
    }

    const isRunning = async () => {
        let containers = await docker.listContainers();

        return containers.filter((a) => a.Image.split(':')[0].indexOf(step.dockerImage) > -1).length > 0
    }

    const getRunning = async () => {
        let containers = await docker.listContainers();

        return containers.filter((a) => a.Image.split(':')[0].indexOf(step.dockerImage) > -1)
    }

    const pullWorker = async () => {
        await docker.pull(step.dockerImage)
    }

    const startWorker = async (messageQueue, cb) => {
        let configs = getConfigs(messageQueue.auth, messageQueue.host)
        console.log(configs)
        let container = await docker.create(step.dockerImage, getConfigs(messageQueue.auth, messageQueue.host), ["./wait-for-it.sh", `${messageQueue.host}:${messageQueue.port}`, '--', '/usr/local/bin/node', 'worker/index.js'])
        
        await container.start();

        console.log(container)
        
    }

    const stopWorker = async () => {
        let containers = await getRunning();
        return Promise.all(containers.map((x) => {
            return (async () => {
                let container = await docker.getContainer(x.Id)
                await container.kill()
                await container.remove()
            })()
        }))
    }

    const installWorker = async (cb) => {
        if(!await isInstalled()){
            console.log("Installing ", step.dockerImage)
            await pullWorker
            cb(null, "Installed")
        }else{
            console.log("Already here")
            cb(null, "Already installed")
        }
    }

    const getConfigs = () => {
        return {
            MQ_QUEUE_IN: opts.in,
            MQ_QUEUE_OUT: opts.out,
            MQ_URL: mq.url,
            MQ_HOST: mq.host
        }
    }
    return {
        input: opts.in,
        output: opts.out,
        dockerImage: step.dockerImage,
        getConfigs,
        isInstalled,
        isRunning,
        installWorker,
        pullWorker,
        startWorker,
        stopWorker
    }
}