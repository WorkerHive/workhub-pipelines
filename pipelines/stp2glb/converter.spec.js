export default {
  "id": "workhub/stp2glbpacker",
  "name": "STEP to GLB + Packer",
  "sourceFormat": "stp",
  "targetFormat": "glb",
  "pipeline": {
    "steps": [
      {
        "id": "stp2glb",
        "description": "Convert .stp to glb using opencascade",
        "dockerImage": "balbatross/cae-stp2glb",
        "queue": "cae-stp2glb",
        "input": "stp",
        "output": "glb"
      },
      {
        "id": "glb2glb",
        "description": "Fix glb issues by re-exporting from blender",
        "dockerImage": "balbatross/cae-glb2glb",
        "queue": "cae-glb2glb",
        "input": "glb",
        "output": "glb"
      },
      {
        "id": "gltfpack",
        "description": "Compress the glb file with gltfpack",
        "dockerImage": "balbatross/cae-gltfpack",
        "queue": "cae-gltfpack",
        "input": "glb",
        "output": "glb"
      }
    ],
   "links": [
      {
        "id": 0,
        "source": "stp2glb",
        "target": "glb2glb"
      },
      {
        "id": 1,
        "source": "glb2glb",
        "target": "gltfpack"
      }
   ] 
  }
}
