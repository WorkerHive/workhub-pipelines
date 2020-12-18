import Docker from 'dockerode';


export default function DockerStore(){
    const docker = new Docker();

    return {
        docker: docker,
        create: (image, env, cb) => {
            let ENV = [];
            for(var k in env){
                ENV.push(`${k}=${env[k]}`)
            }
            docker.createContainer({
                Image: image,
                AttachStdin: false,
                Env: ENV
            }).then((container) => {
                console.log(container)
            })
        },
        pull: (image, cb) => {
            docker.pull(image, (err, stream) => {
                let data = Buffer.from('')
                let status;
              /*
                stream.on('data', (d) => {
                    let dataString = d.toString('utf8')
                    try{

                    
                    status = JSON.parse(dataString)
                    console.log(image, status.status)
                    }catch(e){

                    }
                    data = Buffer.concat([data, d])
                        
                })
            
                stream.on('end', () => {
                    console.log(status)
                })
                */
            })
        }
    }
}


