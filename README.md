# Workhub Pipelines

A collection of pipelines for processing data mainly in the form of files for
workhub

## Available Pipelines

- STP -> GLB with compression


## Pipeline Pattern

Pipelines are a set of docker containers chained together by a message queue
each worker processes the item and sends a new job with the same job id and
a the intermediate id until finally getting put on a queue with the pipeline id

```
pipeline/
  converter.spec.json
```

```
converter.spec.json

{
  id: ID,
  name: String
  sourceFormat: Format
  targetFormat: Format
  pipeline: {
    steps: [
      {
        "id": ID,
        "description": String,
        "dockerImage": DockerImage 
        "queue": String 
        "input": Format 
        "output": Format 
      }
    ],
    links: [
      {
        id: 0,
        source: ID
        target: ID
      }
    ]
  }  
}
```
