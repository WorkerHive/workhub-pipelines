import Docker from 'dockerode';


export default function DockerStore(swarmKey){
    const docker = new Docker();

    return {
        modem: docker.modem,
        docker: docker,
        getImage: (name) => {
            return docker.getImage(name);
        },
        getContainer: (id) => {
            return docker.getContainer(id)
        },
        listContainers: () => {
            return docker.listContainers();
        },
        listImages: () => {
            return docker.listImages();
        },
        listNetworks: () => {
            return docker.listNetworks();
        },
        create: async (image, env, Cmd, cb) => {
            let ENV = [];
            for(var k in env){
                ENV.push(`${k}=${env[k]}`)
            }
            Env.push(`WH_SWARM_KEY=${swarmKey}`)
            
            return await docker.createContainer({
                Image: image,
                AttachStdin: false,
                Env: ENV,
                Cmd: Cmd
            })
        },
        pull: (image) => {
            return new Promise((resolve, reject) => {
                docker.pull(image, (err, stream) => {
                    if(err) return reject(err);
                    docker.modem.followProgress(stream, onFinished, onProgress);
    
                    function onFinished(err, output){
                        console.log("Finished")
                        if(err) return reject(err)
                        resolve(output)
                    }
    
                    function onProgress(event){
                        //console.log("Progress pulling", step.dockerImage, event)
                    }
                })
            })

                
        }
    }
}


